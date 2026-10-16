/**
 * Kiểm thử xuất báo cáo thật — chạy: npm run test:backend-export
 *
 * YÊU CẦU backend đang chạy (mặc định http://localhost:3001, đổi qua API_BASE).
 *
 * Script xác nhận end-to-end:
 *   1. đăng nhập manager qua /api/auth/demo;
 *   2. POST xuất báo cáo cho cả hai `kind` (residents, debts) và một lượt CSV;
 *   3. poll tới khi tác vụ DONE;
 *   4. tải tệp thật, kiểm 4 byte đầu là `PK\x03\x04` (zip/OOXML);
 *   5. tự đọc central directory của zip (không thêm phụ thuộc) để chắc chắn
 *      có `[Content_Types].xml` và `xl/workbook.xml`;
 *   6. xác nhận vai trò sinh viên bị chặn 403.
 *
 * Thoát code 1 nếu có test hỏng.
 */
import { inflateRawSync } from "node:zlib"

const BASE = process.env.API_BASE || "http://localhost:3001"

let passed = 0
let failed = 0
const failures = []

function ok(name, condition, detail) {
  if (condition) {
    passed++
    console.log(`  \x1b[32m✓\x1b[0m ${name}`)
  } else {
    failed++
    failures.push(name)
    console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`)
  }
}

/**
 * Gọi API trả JSON; `role` gửi qua X-Demo-Role (backend demo phân giải vai trò
 * theo role/MSSV, không theo JWT — xem resolveActor trong server/middleware.js).
 */
async function api(method, path, { role, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(role ? { "X-Demo-Role": role } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  return { status: res.status, data, headers: res.headers }
}

/* ==================== Đọc ZIP tối giản (không phụ thuộc thư viện) ==================== */

/**
 * Đọc End Of Central Directory rồi liệt kê entry từ central directory.
 * Trả { entries: [{ name, method, compressedSize, uncompressedSize, offset }], comment }.
 */
function readZipDirectory(buffer) {
  // EOCD nằm trong 22 + comment (tối đa 65535) byte cuối; quét ngược tìm chữ ký 0x06054b50.
  const maxComment = 0xffff
  const minEocd = 22
  const start = Math.max(0, buffer.length - maxComment - minEocd)
  let eocd = -1
  for (let i = buffer.length - minEocd; i >= start; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd === -1) throw new Error("Không tìm thấy End Of Central Directory — không phải zip hợp lệ")

  const totalEntries = buffer.readUInt16LE(eocd + 10)
  let cursor = buffer.readUInt32LE(eocd + 16) // offset central directory
  const entries = []
  for (let i = 0; i < totalEntries; i++) {
    if (cursor + 46 > buffer.length) throw new Error("Central directory bị cắt cụt")
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) {
      throw new Error(`Sai chữ ký central directory tại entry ${i}`)
    }
    const method = buffer.readUInt16LE(cursor + 10)
    const compressedSize = buffer.readUInt32LE(cursor + 20)
    const uncompressedSize = buffer.readUInt32LE(cursor + 24)
    const nameLength = buffer.readUInt16LE(cursor + 28)
    const extraLength = buffer.readUInt16LE(cursor + 30)
    const commentLength = buffer.readUInt16LE(cursor + 32)
    const localOffset = buffer.readUInt32LE(cursor + 42)
    const name = buffer.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8")
    entries.push({ name, method, compressedSize, uncompressedSize, offset: localOffset })
    cursor += 46 + nameLength + extraLength + commentLength
  }
  return { entries, totalEntries }
}

/** Giải nén nội dung một entry (method 0 = stored, 8 = deflate). */
function readZipEntry(buffer, entry) {
  const off = entry.offset
  if (buffer.readUInt32LE(off) !== 0x04034b50) throw new Error(`Sai chữ ký local header của ${entry.name}`)
  const nameLength = buffer.readUInt16LE(off + 26)
  const extraLength = buffer.readUInt16LE(off + 28)
  const dataStart = off + 30 + nameLength + extraLength
  const raw = buffer.subarray(dataStart, dataStart + entry.compressedSize)
  if (entry.method === 0) return raw
  if (entry.method === 8) return inflateRawSync(raw)
  throw new Error(`Phương thức nén không hỗ trợ: ${entry.method}`)
}

/**
 * Giải nén cả zip thành Map<tên, nội dung utf8>.
 *
 * Lưu ý: chuỗi trong OOXML nằm ở `xl/sharedStrings.xml`, còn màu/font nằm ở
 * `xl/styles.xml` — KHÔNG có trong `xl/worksheets/sheet1.xml`, nên mọi kiểm tra
 * nội dung phải soi qua map này chứ không chỉ sheet.
 */
function readZipText(buffer) {
  const { entries } = readZipDirectory(buffer)
  const map = new Map()
  for (const entry of entries) {
    try {
      map.set(entry.name, readZipEntry(buffer, entry).toString("utf8"))
    } catch {
      map.set(entry.name, "")
    }
  }
  return { entries, map, all: [...map.values()].join("\n") }
}

/** Zip có chứa đúng tên entry không (so khớp tuyệt đối, không phân biệt hoa/thường). */
function hasEntry(entries, name) {
  const target = name.toLowerCase()
  return entries.some((e) => e.name.toLowerCase() === target)
}

function hex(buffer) {
  return [...buffer.subarray(0, 4)].map((b) => b.toString(16).padStart(2, "0")).join(" ").toUpperCase()
}

/* ==================== Luồng kiểm thử ==================== */

async function exportAndDownload(kind, role, format = "xlsx") {
  const post = await api("POST", "/api/dashboard/reports/export", { role, body: { kind, format } })
  if (post.status !== 200 || !post.data?.data?.id) {
    return { post, error: `POST thất bại (HTTP ${post.status}): ${post.data?.message || "?"}` }
  }
  const job = post.data.data
  const immediate = { status: job.status, hasUrl: Boolean(job.downloadUrl) }

  // Poll tới khi kết thúc (tối đa ~15s).
  let current = job
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    if (current.status === "DONE" || current.status === "FAILED") break
    await new Promise((r) => setTimeout(r, 120))
    const poll = await api("GET", `/api/dashboard/reports/export/${job.id}`, { role })
    if (poll.status !== 200) return { post, immediate, error: `Poll thất bại (HTTP ${poll.status})` }
    current = poll.data?.data
  }

  if (current?.status !== "DONE") {
    return { post, immediate, job: current, error: `Tác vụ kết thúc ở trạng thái ${current?.status}: ${current?.error || ""}` }
  }

  const download = await fetch(`${BASE}${current.downloadUrl}`, { headers: { "X-Demo-Role": role } })
  if (!download.ok) {
    return { post, immediate, job: current, error: `Tải tệp thất bại (HTTP ${download.status})` }
  }
  const arrayBuffer = await download.arrayBuffer()
  return {
    post,
    immediate,
    job: current,
    download: {
      contentType: download.headers.get("content-type"),
      disposition: download.headers.get("content-disposition"),
      buffer: Buffer.from(arrayBuffer),
    },
  }
}

async function main() {
  console.log(`\n=== DMS backend export test @ ${BASE} ===\n`)

  /* ---------- 0. Backend sống chưa ---------- */
  console.log("Hạ tầng")
  const health = await api("GET", "/api/health")
  ok("GET /api/health trả ok", health.status === 200 && health.data?.ok === true)
  if (health.status !== 200) {
    console.log("\nKhông kết nối được backend. Chạy: npm run server")
    process.exit(1)
  }

  /* ---------- 1. Đăng nhập manager qua /api/auth/demo ---------- */
  console.log("\nĐăng nhập")
  const login = await api("POST", "/api/auth/demo", { role: null, body: { role: "manager" } })
  ok("đăng nhập demo manager", login.status === 200 && login.data?.data?.user?.role === "manager")
  ok("có accessToken", typeof login.data?.data?.tokens?.accessToken === "string")
  ok("hồ sơ manager có quyền report:export", (login.data?.data?.user?.permissions || []).includes("report:export"))

  /* ---------- 2. Sinh viên bị chặn 403 ---------- */
  console.log("\nPhân quyền")
  const studentPost = await api("POST", "/api/dashboard/reports/export", {
    role: "student",
    body: { kind: "residents" },
  })
  ok("sinh viên KHÔNG được xuất báo cáo (403)", studentPost.status === 403, `HTTP ${studentPost.status}`)
  const anonPost = await api("POST", "/api/dashboard/reports/export", { body: { kind: "residents" } })
  ok("khách chưa đăng nhập bị chặn (401/403)", [401, 403].includes(anonPost.status), `HTTP ${anonPost.status}`)
  const badKind = await api("POST", "/api/dashboard/reports/export", { role: "manager", body: { kind: "khong-ton-tai" } })
  ok("kind lạ bị chặn (400)", badKind.status === 400, `HTTP ${badKind.status}`)

  const unknownJob = await api("GET", "/api/dashboard/reports/export/job_khong_ton_tai", { role: "manager" })
  ok("tác vụ không tồn tại -> 404", unknownJob.status === 404, `HTTP ${unknownJob.status}`)
  const unknownDownload = await api("GET", "/api/dashboard/reports/export/job_khong_ton_tai/download", { role: "manager" })
  ok("tải tệp tác vụ không tồn tại -> 404", unknownDownload.status === 404, `HTTP ${unknownDownload.status}`)

  /* ---------- 3. Xuất .xlsx cho cả hai kind ---------- */
  for (const kind of ["residents", "debts"]) {
    console.log(`\nXuất báo cáo .xlsx — kind="${kind}"`)
    const result = await exportAndDownload(kind, "manager")
    if (result.error) {
      ok(`${kind}: xuất & tải thành công`, false, result.error)
      continue
    }
    ok(`${kind}: POST trả job QUEUED ngay`, result.immediate.status === "QUEUED", result.immediate.status)
    ok(`${kind}: job DONE`, result.job.status === "DONE")
    ok(`${kind}: có downloadUrl`, result.job.downloadUrl === `/api/dashboard/reports/export/${result.job.id}/download`)
    ok(`${kind}: có filename .xlsx`, String(result.job.filename || "").endsWith(".xlsx"), result.job.filename)
    ok(`${kind}: bytes khớp kích thước tải về`, result.job.bytes === result.download.buffer.length, `${result.job.bytes} vs ${result.download.buffer.length}`)
    ok(`${kind}: có expiresAt (sẽ bị dọn sau ~10 phút)`, typeof result.job.expiresAt === "string")
    ok(`${kind}: finishedAt đã ghi`, typeof result.job.finishedAt === "string")
    ok(`${kind}: không có error`, result.job.error === null)

    const ct = result.download.contentType || ""
    ok(
      `${kind}: Content-Type OOXML đúng`,
      ct.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
      ct,
    )
    ok(`${kind}: Content-Disposition attachment + filename`, /attachment;\s*filename=/.test(result.download.disposition || ""), result.download.disposition)

    const magic = result.download.buffer.subarray(0, 4)
    const magicOk =
      magic[0] === 0x50 && magic[1] === 0x4b && magic[2] === 0x03 && magic[3] === 0x04
    ok(`${kind}: 4 byte đầu là PK\\x03\\x04 (zip/OOXML thật)`, magicOk, `nhận ${hex(magic)}`)

    if (!magicOk) continue

    let zip
    try {
      zip = readZipText(result.download.buffer)
    } catch (err) {
      ok(`${kind}: đọc được central directory của zip`, false, err.message)
      continue
    }
    const names = zip.entries.map((e) => e.name)
    console.log(`      ZIP magic : ${hex(magic)}`)
    console.log(`      ZIP entries (${zip.entries.length}): ${names.join(", ")}`)

    ok(`${kind}: zip có [Content_Types].xml`, hasEntry(zip.entries, "[Content_Types].xml"))
    ok(`${kind}: zip có xl/workbook.xml`, hasEntry(zip.entries, "xl/workbook.xml"))
    ok(`${kind}: zip có worksheet`, zip.entries.some((e) => /^xl\/worksheets\/sheet\d+\.xml$/.test(e.name)))

    const workbookXml = zip.map.get("xl/workbook.xml") || ""
    const stylesXml = zip.map.get("xl/styles.xml") || ""
    const stringsXml = zip.map.get("xl/sharedStrings.xml") || ""
    const sheetXml = zip.entries
      .filter((e) => /^xl\/worksheets\/sheet\d+\.xml$/.test(e.name))
      .map((e) => zip.map.get(e.name) || "")
      .join("\n")

    ok(`${kind}: workbook.xml giải nén được & là XML`, workbookXml.includes("<workbook"))
    // Màu nằm ở xl/styles.xml: fills fgColor #4F46E5, font color trắng.
    ok(`${kind}: styles.xml có fill indigo 4F46E5`, /4F46E5/i.test(stylesXml), "không thấy mã màu")
    ok(
      `${kind}: styles.xml có chữ trắng FFFFFFFF trên header`,
      /FFFFFF/i.test(stylesXml),
      "không thấy màu chữ trắng",
    )
    ok(`${kind}: styles.xml khai báo định dạng số #,##0`, stylesXml.includes('formatCode="#,##0"'))
    ok(
      `${kind}: header có độ rộng cột (cols trong worksheet)`,
      /<cols>/.test(sheetXml) && /width="\d/.test(sheetXml),
    )
    ok(
      `${kind}: styles.xml có font in đậm (<b/>) cho header`,
      /<b\/>/.test(stylesXml),
    )
    ok(`${kind}: styles.xml có kẻ khung (border style="thin")`, /<left style="thin"/.test(stylesXml))
    // Ô số thật: có <c ...><v>123</v></c> KHÔNG kèm t="s" (t="s" là ô chuỗi dùng sharedStrings).
    const numericCells = [...sheetXml.matchAll(/<c [^>]*?(?<!t="s")[^>]*>\s*<v>(-?\d+(?:\.\d+)?)<\/v>/g)].filter(
      (m) => !m[0].includes('t="s"'),
    )
    ok(`${kind}: worksheet có ô SỐ thật (<v>số</v>, không phải chuỗi đã format)`, numericCells.length > 0, `thấy ${numericCells.length} ô số`)
    ok(`${kind}: tiếng Việt còn nguyên (sharedStrings có dấu tiếng Việt)`, /[àáảãạăâđêôơư]/i.test(stringsXml))
    ok(`${kind}: chuỗi header tiếng Việt còn nguyên`, /Họ và tên|Mã hóa đơn/.test(stringsXml), stringsXml.slice(0, 120))

    // Dòng phải khớp dữ liệu JSON thật của cùng báo cáo.
    const jsonRows = kind === "residents"
      ? (await api("GET", "/api/dashboard/reports/residents", { role: "manager" })).data?.data || []
      : (await api("GET", "/api/dashboard/reports/debts", { role: "manager" })).data?.data || []
    const sample = jsonRows[0]
    if (sample) {
      const all = zip.all
      ok(`${kind}: tệp chứa dòng đầu của JSON (${sample.fullName})`, all.includes(sample.fullName), sample.fullName)
      ok(`${kind}: tệp chứa MSSV dòng đầu của JSON`, all.includes(sample.studentId), sample.studentId)
    } else {
      ok(`${kind}: JSON có dữ liệu để đối chiếu`, false, "danh sách rỗng")
    }
  }

  /* ---------- 4. Xuất CSV (tuỳ chọn, UTF-8 BOM) ---------- */
  console.log("\nXuất CSV UTF-8 (kèm BOM)")
  const csv = await exportAndDownload("debts", "manager", "csv")
  if (csv.error) {
    ok("csv: xuất & tải thành công", false, csv.error)
  } else {
    ok("csv: job DONE", csv.job.status === "DONE")
    ok("csv: filename .csv", String(csv.job.filename || "").endsWith(".csv"), csv.job.filename)
    ok("csv: Content-Type text/csv", String(csv.download.contentType || "").includes("text/csv"), csv.download.contentType)
    const bom = csv.download.buffer.subarray(0, 3)
    ok("csv: 3 byte đầu là BOM UTF-8 EF BB BF", bom[0] === 0xef && bom[1] === 0xbb && bom[2] === 0xbf, hex(bom))
    const text = csv.download.buffer.toString("utf8")
    ok("csv: có dòng tiêu đề tiếng Việt", text.includes('"Mã hóa đơn"'), text.split("\r\n")[0]?.slice(0, 80))
  }

  /* ---------- 5. Endpoint JSON của báo cáo vẫn hoạt động ---------- */
  console.log("\nEndpoint JSON tương ứng")
  const residentsJson = await api("GET", "/api/dashboard/reports/residents", { role: "manager" })
  const debtsJson = await api("GET", "/api/dashboard/reports/debts", { role: "manager" })
  ok("GET /reports/residents chạy", residentsJson.status === 200 && Array.isArray(residentsJson.data?.data))
  ok("GET /reports/debts chạy", debtsJson.status === 200 && Array.isArray(debtsJson.data?.data))
  ok("residents có meta.count khớp số dòng", residentsJson.data?.meta?.count === residentsJson.data?.data?.length)
  ok("debts có meta.total là số", typeof debtsJson.data?.meta?.total === "number")

  /* ---------- Tổng kết ---------- */
  console.log(`\n=== ${passed} pass, ${failed} fail ===`)
  if (failed > 0) {
    console.log("\nTest hỏng:")
    for (const f of failures) console.log(`  - ${f}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("\nLỗi chạy test:", err.message)
  console.error("Backend đã chạy chưa? Thử: npm run server")
  process.exit(1)
})
