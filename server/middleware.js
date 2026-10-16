/**
 * Middleware dùng chung: CORS, security headers, rate limit, cache, SSE, lỗi.
 */
import { all } from "./db.js"

/** CORS cho Vite dev (5173/5174) và preview (4173). */
export function cors(req, res, next) {
  const origin = req.headers.origin
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Vary", "Origin")
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*")
  }
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Demo-Role")
  res.setHeader("Access-Control-Max-Age", "600")
  if (req.method === "OPTIONS") return res.sendStatus(204)
  next()
}

/** Header bảo mật cơ bản (không cần helmet). */
export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
  next()
}

/* ---------- Rate limit theo IP & loại endpoint ---------- */
const WINDOW_MS = 60_000
/**
 * Hạn mức mỗi phút cho một IP. Đọc từ biến môi trường để môi trường kiểm thử
 * có thể nới ra mà không phải sửa code; giá trị mặc định vẫn chặt cho thật.
 *   DMS_RATE_LIMIT_SENSITIVE=0  -> tắt hẳn (chỉ dùng khi chạy bộ test)
 */
const LIMITS = {
  public: Number(process.env.DMS_RATE_LIMIT_PUBLIC ?? 300),
  sensitive: Number(process.env.DMS_RATE_LIMIT_SENSITIVE ?? 30),
}
const RATE_LIMIT_DISABLED = process.env.DMS_DISABLE_RATE_LIMIT === "1"
const buckets = new Map()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of buckets) if (now > entry.resetAt) buckets.delete(key)
}, WINDOW_MS).unref?.()

export function rateLimit(kind = "public") {
  return (req, res, next) => {
    if (RATE_LIMIT_DISABLED || LIMITS[kind] <= 0) return next()
    const key = `${kind}:${req.ip}`
    const now = Date.now()
    const entry = buckets.get(key) || { count: 0, resetAt: now + WINDOW_MS }
    if (now > entry.resetAt) {
      entry.count = 0
      entry.resetAt = now + WINDOW_MS
    }
    entry.count += 1
    buckets.set(key, entry)
    const limit = LIMITS[kind] ?? LIMITS.public
    res.setHeader("X-RateLimit-Limit", String(limit))
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, limit - entry.count)))
    if (entry.count > limit) {
      res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)))
      return res.status(429).json({ success: false, message: "Quá nhiều yêu cầu, vui lòng thử lại sau." })
    }
    next()
  }
}

/* ---------- Cache in-memory có TTL ---------- */
const cache = new Map()
export function cacheGet(key) {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() > hit.expiresAt) {
    cache.delete(key)
    return null
  }
  return hit.value
}
export function cacheSet(key, value, ttlMs = 30_000) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs })
}
export function cacheDel(prefix) {
  for (const key of cache.keys()) if (key.startsWith(prefix)) cache.delete(key)
}

/* ---------- Hàng đợi tác vụ nền (in-memory) ---------- */

/**
 * Hàng đợi tác vụ thật: mỗi tác vụ chạy một hàm async và giữ artifact trong
 * bộ nhớ để tải về qua HTTP.
 *
 * Vòng đời: QUEUED -> RUNNING -> DONE | FAILED.
 *
 * Bộ nhớ không được phép phình vô hạn:
 *  - Mọi tác vụ đã kết thúc được đánh dấu `expiresAt` (mặc định +10 phút).
 *  - Một timer quét định kỳ xoá tác vụ hết hạn kèm buffer của nó.
 *  - Số tác vụ giữ lại bị chặn trần bởi JOB_MAX_RETAINED (xoá cũ nhất trước).
 */

/** Thời gian giữ một tác vụ đã xong trước khi bị dọn (ms). */
export const JOB_TTL_MS = Number(process.env.DMS_JOB_TTL_MS ?? 10 * 60 * 1000)
/** Trần số tác vụ giữ trong bộ nhớ. */
export const JOB_MAX_RETAINED = Number(process.env.DMS_JOB_MAX ?? 50)
/** Chu kỳ quét dọn tác vụ hết hạn (ms). */
const JOB_SWEEP_MS = Number(process.env.DMS_JOB_SWEEP_MS ?? 60 * 1000)

/** id -> metadata tác vụ (KHÔNG chứa buffer). */
const jobs = new Map()
/** id -> { buffer, filename, contentType } của tác vụ đã xong. */
const jobArtifacts = new Map()

function nowIso() {
  return new Date().toISOString()
}

/** Xoá một tác vụ và artifact kèm theo. */
function dropJob(id) {
  jobArtifacts.delete(id)
  return jobs.delete(id)
}

/** Dọn tác vụ đã kết thúc và quá hạn; sau đó chặn trần số lượng. */
export function sweepJobs(now = Date.now()) {
  let removed = 0
  for (const [id, job] of jobs) {
    const finished = job.status === "DONE" || job.status === "FAILED"
    if (finished && job.expiresAt && Date.parse(job.expiresAt) <= now) {
      dropJob(id)
      removed++
    }
  }
  if (jobs.size > JOB_MAX_RETAINED) {
    // Cũ nhất theo createdAt bị xoá trước, ưu tiên tác vụ đã kết thúc.
    const ordered = [...jobs.values()].sort((a, b) => {
      const aDone = a.status === "DONE" || a.status === "FAILED" ? 0 : 1
      const bDone = b.status === "DONE" || b.status === "FAILED" ? 0 : 1
      if (aDone !== bDone) return aDone - bDone
      return String(a.createdAt).localeCompare(String(b.createdAt))
    })
    while (jobs.size > JOB_MAX_RETAINED && ordered.length) {
      dropJob(ordered.shift().id)
      removed++
    }
  }
  return removed
}

const jobSweeper = setInterval(() => {
  try {
    sweepJobs()
  } catch (err) {
    console.error("[jobs] dọn tác vụ lỗi:", err.message)
  }
}, JOB_SWEEP_MS)
jobSweeper.unref?.()

/**
 * Xếp một tác vụ nền vào hàng đợi.

 * @param {string} type Nhãn loại tác vụ (ví dụ `export-residents`).
 * @param {object} payload Tham số kèm theo, trả lại nguyên vẹn trong job.
 * @param {(job: object) => Promise<{ filename: string, contentType: string, buffer: Buffer|Uint8Array }>} [task]
 *        Hàm async sinh artifact thật. Bỏ trống thì tác vụ chỉ đánh dấu DONE
 *        (đường cũ vẫn chạy được nhưng không có file để tải).
 * @returns {object} Bản ghi job (status QUEUED) để trả ngay cho client.
 */
export function enqueueJob(type, payload, task) {
  const id = `job_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
  const job = {
    id,
    type,
    payload,
    status: "QUEUED",
    createdAt: nowIso(),
    startedAt: null,
    finishedAt: null,
    expiresAt: null,
    filename: null,
    contentType: null,
    bytes: 0,
    error: null,
  }
  jobs.set(id, job)
  sweepJobs()

  // Chạy ở tick sau để response POST luôn thấy trạng thái QUEUED.
  setImmediate(() => {
    runJob(job, task)
  })

  return { ...job }
}

/** Thực thi tác vụ rồi ghi lại kết quả hoặc lỗi. */
async function runJob(job, task) {
  if (typeof task !== "function") {
    job.status = "DONE"
    job.finishedAt = nowIso()
    job.expiresAt = new Date(Date.now() + JOB_TTL_MS).toISOString()
    return
  }
  job.status = "RUNNING"
  job.startedAt = nowIso()
  try {
    const artifact = await task(job)
    const buffer = artifact?.buffer
    if (!buffer) throw new Error("Tác vụ không tạo được nội dung tệp")
    const filename = artifact.filename || `${job.type}.bin`
    const contentType = artifact.contentType || "application/octet-stream"
    jobArtifacts.set(job.id, {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      filename,
      contentType,
    })
    job.filename = filename
    job.contentType = contentType
    job.bytes = jobArtifacts.get(job.id).buffer.length
    job.status = "DONE"
  } catch (err) {
    job.status = "FAILED"
    job.error = err?.message || "Tác vụ thất bại"
    console.error(`[jobs] ${job.id} (${job.type}) lỗi:`, job.error)
  } finally {
    job.finishedAt = nowIso()
    job.expiresAt = new Date(Date.now() + JOB_TTL_MS).toISOString()
    // Dọn ngay nếu vượt trần (ví dụ một loạt job nhỏ vừa xong).
    sweepJobs()
  }
}

/** Lấy metadata tác vụ, null nếu không có / đã bị dọn. */
export function getJob(id) {
  const job = jobs.get(id)
  return job ? { ...job } : null
}

/** Lấy artifact của tác vụ đã DONE, null nếu chưa xong hoặc không còn. */
export function getJobArtifact(id) {
  return jobArtifacts.get(id) || null
}

/** Số tác vụ đang giữ trong bộ nhớ (dùng cho test/chẩn đoán). */
export function jobCount() {
  return jobs.size
}

/** Xoá một tác vụ theo id; trả true nếu có xoá. */
export function clearJob(id) {
  return dropJob(id)
}

/* ---------- SSE realtime ---------- */
const sseClients = new Set()
export function broadcastEvent(kind, title) {
  const evt = { id: `evt_${Date.now()}`, kind, title, at: new Date().toISOString() }
  for (const res of sseClients) {
    try {
      res.write(`data: ${JSON.stringify(evt)}\n\n`)
    } catch {
      sseClients.delete(res)
    }
  }
  return evt
}
export function sseHandler(req, res) {
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache, no-transform")
  res.setHeader("Connection", "keep-alive")
  res.flushHeaders?.()
  res.write(
    `data: ${JSON.stringify({ id: "hello", kind: "HELLO", title: "Realtime KTX đã kết nối", at: new Date().toISOString() })}\n\n`,
  )
  sseClients.add(res)
  const ping = setInterval(() => {
    try {
      res.write(": ping\n\n")
    } catch {
      clearInterval(ping)
    }
  }, 25_000)
  req.on("close", () => {
    clearInterval(ping)
    sseClients.delete(res)
  })
}
export function sseClientCount() {
  return sseClients.size
}

/* ---------- Phân giải vai trò demo ---------- */
/**
 * Lấy vai trò của người gọi.
 * Ưu tiên: header Authorization Bearer <mssv|role> -> X-Demo-Role -> query role.
 * Dữ liệu demo nên không xác thực mật khẩu; chỉ ánh xạ ra hồ sơ.
 */
export function resolveActor(req) {
  const auth = req.headers.authorization || ""
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : ""
  const headerRole = String(req.headers["x-demo-role"] || "").trim()
  const queryRole = String(req.query.role || "").trim()
  const token = bearer || headerRole || queryRole

  if (!token) return null
  const lower = token.toLowerCase()

  // Token có thể là role trực tiếp
  if (["student", "manager", "technician", "admin"].includes(lower)) {
    const user = all("users").find((u) => String(u.role).toLowerCase() === lower)
    return user ? { ...user, role: lower } : { role: lower, fullName: `Demo ${lower}` }
  }

  // Hoặc là MSSV
  const user = all("users").find(
    (u) => String(u.mssv || u.studentId || "").toUpperCase() === token.toUpperCase(),
  )
  if (user) return { ...user, role: String(user.role).toLowerCase() }
  return null
}

/** Gắn req.actor để route đọc. */
export function attachActor(req, _res, next) {
  req.actor = resolveActor(req)
  next()
}

/* ---------- Bọc handler async + xử lý lỗi ---------- */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Không tìm thấy ${req.method} ${req.originalUrl}` })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500
  if (status >= 500) console.error("[api]", err)
  res.status(status).json({
    success: false,
    message: err.message || "Lỗi hệ thống",
    ...(err.details ? { details: err.details } : {}),
  })
}
