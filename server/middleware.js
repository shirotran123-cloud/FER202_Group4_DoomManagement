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
const LIMITS = { public: 300, sensitive: 30 }
const buckets = new Map()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of buckets) if (now > entry.resetAt) buckets.delete(key)
}, WINDOW_MS).unref?.()

export function rateLimit(kind = "public") {
  return (req, res, next) => {
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

/* ---------- Job queue in-memory ---------- */
const jobs = []
const jobResults = new Map()
export function enqueueJob(type, payload) {
  const job = {
    id: `job_${Date.now()}_${Math.floor(Math.random() * 1e4)}`,
    type,
    payload,
    status: "QUEUED",
    createdAt: new Date().toISOString(),
  }
  jobs.push(job)
  setTimeout(() => {
    job.status = "DONE"
    job.finishedAt = new Date().toISOString()
    jobResults.set(job.id, job)
  }, 50)
  return job
}
export function getJob(id) {
  return jobResults.get(id) || jobs.find((j) => j.id === id) || null
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
