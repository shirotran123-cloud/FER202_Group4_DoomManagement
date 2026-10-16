/**
 * Nghiệp vụ giới nghiêm & kỷ luật — khớp src/data/mockCurfew.ts,
 * src/types/curfew.ts và logic CurfewPage.tsx.
 *
 * Quy tắc:
 *  - Cổng đóng 23:00, mở 05:30. Quét trong khoảng 23:00–05:00 là "muộn".
 *  - Muộn mà có đơn APPROVED -> APPROVED_LATE (không trừ điểm).
 *  - Muộn mà không có đơn     -> UNAUTHORIZED_LATE (trừ 10 điểm).
 *  - Đơn phải nộp trước 21:00 cùng ngày (BR-06).
 *  - Điểm gốc 100; trừ > 20 -> WARNING; trừ > 30 -> SUSPENDED.
 */
import {
  CURFEW_HOUR,
  CURFEW_OPEN_HOUR,
  LATE_REQUEST_CUTOFF_HOUR,
  INFRACTION_POINTS,
  INFRACTION_TITLES,
  DEMERIT_INITIAL,
  DEMERIT_WARNING_AT,
  DEMERIT_SUSPEND_AT,
} from "../config.js"

/** Trạng thái quét cổng. */
export const GATE_STATUS = {
  ON_TIME: "ON_TIME",
  APPROVED_LATE: "APPROVED_LATE",
  UNAUTHORIZED_LATE: "UNAUTHORIZED_LATE",
}

/** Quét lúc scanHour có bị coi là muộn không. */
export function isLateScan(scanHour) {
  const h = Number(scanHour)
  return h >= CURFEW_HOUR || h < CURFEW_OPEN_HOUR
}

/* ---------- Mã QR cổng (DMS-GATE) ---------- */

/**
 * Tiền tố mã QR cổng. GIỮ NGUYÊN định dạng `DMS-GATE|<MSSV>|<issuedAt>`
 * để backend và frontend (src/lib/dorm-ops.ts) đọc được mã của nhau.
 */
export const GATE_QR_PREFIX = "DMS-GATE"

/**
 * Hạn dùng mặc định của mã QR cổng (phút). Mã in trên thẻ sinh viên chỉ
 * sống trong một cửa sổ ngắn; hết hạn thì bảo vệ phải quét mã mới.
 */
export const GATE_QR_TTL_MINUTES = 5

/**
 * Sinh payload QR cổng — khớp `buildGateQrPayload` của frontend.
 * @param {string} studentId MSSV; tự viết HOA và cắt khoảng trắng.
 * @param {string} issuedAt Mốc phát hành (ISO hoặc `YYYY-MM-DD HH:mm`).
 * @returns {string} `DMS-GATE|<MSSV>|<issuedAt>`
 */
export function buildGateQrPayload(studentId, issuedAt) {
  return `${GATE_QR_PREFIX}|${String(studentId ?? "").trim().toUpperCase()}|${String(issuedAt ?? "").trim()}`
}

/**
 * Bóc payload QR cổng — khớp `parseGateQrPayload` của frontend.
 *
 * Chỉ chấp nhận ĐÚNG 3 phần ngăn bởi `|`, phần đầu là `DMS-GATE`, MSSV và
 * mốc phát hành đều không rỗng. Trả `null` (kèm `reason` tiếng Việt) khi sai.
 *
 * @param {string} payload Nội dung thô giải mã từ QR.
 * @returns {{ ok: true, studentId: string, issuedAt: string }
 *          | { ok: false, reason: string }}
 */
export function parseGateQrPayload(payload) {
  const raw = String(payload ?? "").trim()
  if (!raw) return { ok: false, reason: "Thiếu nội dung mã QR" }
  const parts = raw.split("|")
  if (parts.length !== 3) {
    return { ok: false, reason: "Mã QR sai định dạng: cần đúng 3 phần ngăn bởi dấu |" }
  }
  if (parts[0] !== GATE_QR_PREFIX) {
    return { ok: false, reason: `Mã QR sai tiền tố: cần bắt đầu bằng ${GATE_QR_PREFIX}` }
  }
  const studentId = parts[1].trim().toUpperCase()
  const issuedAt = parts[2].trim()
  if (!studentId) return { ok: false, reason: "Mã QR thiếu MSSV" }
  if (!issuedAt) return { ok: false, reason: "Mã QR thiếu mốc phát hành" }
  return { ok: true, studentId, issuedAt }
}

/** Quy `issuedAt` (ISO / `YYYY-MM-DD HH:mm[:ss]`) về timestamp; NaN nếu không đọc được. */
function toIssuedTimestamp(issuedAt) {
  if (issuedAt instanceof Date) return issuedAt.getTime()
  const raw = String(issuedAt ?? "").trim()
  if (!raw) return Number.NaN
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(raw) ? raw.replace(" ", "T") : raw
  const parsed = new Date(iso)
  return parsed.getTime()
}

/**
 * Kiểm tra hạn dùng của mã QR cổng.
 *
 * Mã hợp lệ khi: đọc được mốc phát hành, không nằm ở tương lai quá 1 phút
 * (chống đồng hồ lệch) và tuổi mã <= `ttlMinutes`.
 *
 * @param {string|Date} issuedAt Mốc phát hành trên mã.
 * @param {Date|number} [now] Thời điểm kiểm tra (mặc định hiện tại).
 * @param {number} [ttlMinutes] Hạn dùng, mặc định {@link GATE_QR_TTL_MINUTES}.
 * @returns {{ valid: boolean, reason?: string, ageMinutes?: number, ttlMinutes: number }}
 */
export function isGateQrValid(issuedAt, now = new Date(), ttlMinutes = GATE_QR_TTL_MINUTES) {
  const ttl = Number.isFinite(Number(ttlMinutes)) && Number(ttlMinutes) > 0
    ? Number(ttlMinutes)
    : GATE_QR_TTL_MINUTES
  const issuedMs = toIssuedTimestamp(issuedAt)
  if (!Number.isFinite(issuedMs)) {
    return { valid: false, reason: "Mốc phát hành trên mã QR không hợp lệ", ttlMinutes: ttl }
  }
  const nowMs = now instanceof Date ? now.getTime() : Number(now)
  if (!Number.isFinite(nowMs)) {
    return { valid: false, reason: "Thời điểm kiểm tra mã QR không hợp lệ", ttlMinutes: ttl }
  }
  const ageMinutes = (nowMs - issuedMs) / 60000
  if (ageMinutes < -1) {
    return { valid: false, reason: "Mã QR có mốc phát hành ở tương lai", ageMinutes, ttlMinutes: ttl }
  }
  if (ageMinutes > ttl) {
    return {
      valid: false,
      reason: `Mã QR đã hết hạn (quá ${ttl} phút, mã phát hành lúc ${String(issuedAt).trim()})`,
      ageMinutes,
      ttlMinutes: ttl,
    }
  }
  return { valid: true, ageMinutes, ttlMinutes: ttl }
}

/**
 * Bóc VÀ kiểm hạn một payload QR cổng trong một bước — dùng ở route quét cổng.
 * @param {string} payload Nội dung thô từ QR.
 * @param {Date|number} [now] Thời điểm quét.
 * @param {number} [ttlMinutes] Hạn dùng, mặc định 5 phút.
 * @returns {{ ok: true, studentId: string, issuedAt: string, ageMinutes: number, ttlMinutes: number }
 *          | { ok: false, reason: string }}
 */
export function verifyGateQrPayload(payload, now = new Date(), ttlMinutes = GATE_QR_TTL_MINUTES) {
  const parsed = parseGateQrPayload(payload)
  if (!parsed.ok) return parsed
  const check = isGateQrValid(parsed.issuedAt, now, ttlMinutes)
  if (!check.valid) return { ok: false, reason: check.reason }
  return {
    ok: true,
    studentId: parsed.studentId,
    issuedAt: parsed.issuedAt,
    ageMinutes: check.ageMinutes,
    ttlMinutes: check.ttlMinutes,
  }
}

/** Đánh giá một lượt quét cổng — khớp evaluateGateScan frontend. */
export function evaluateGateScan(scanHour, hasApprovedRequest) {
  if (!isLateScan(scanHour)) return GATE_STATUS.ON_TIME
  return hasApprovedRequest ? GATE_STATUS.APPROVED_LATE : GATE_STATUS.UNAUTHORIZED_LATE
}

/* ---------- Đối chiếu đơn về muộn với NGÀY quét ---------- */

/** Dịch `YYYY-MM-DD` đi `delta` ngày; trả nguyên chuỗi nếu không đọc được. */
function shiftIsoDate(isoDate, delta) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate ?? "").trim())
  if (!m) return String(isoDate ?? "").trim()
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + delta))
  return d.toISOString().slice(0, 10)
}

/**
 * "Đêm" mà một lượt quét thuộc về.
 *
 * Giới nghiêm bắt đầu 23:00 hôm trước và kéo sang rạng sáng hôm sau, nên một
 * lượt quét lúc 02:00 ngày 21 thuộc về đêm của ngày 20. Các giờ khác thuộc
 * về chính ngày quét.
 *
 * @param {string} scanDate Ngày quét `YYYY-MM-DD`.
 * @param {number} scanHour Giờ quét 0–23.
 * @returns {string} Ngày bắt đầu của đêm đó.
 */
export function curfewNightOf(scanDate, scanHour) {
  const h = Number(scanHour)
  return h >= 0 && h < CURFEW_OPEN_HOUR ? shiftIsoDate(scanDate, -1) : String(scanDate ?? "").trim()
}

/**
 * Một đơn có hợp lệ cho lượt quét này không (thuần, không chạm DB).
 *
 * QUY TẮC NGÀY (sửa lỗi cũ: trước đây bỏ qua `date` nên một đơn APPROVED cũ
 * có thể "hợp thức hoá" lượt quét muộn của đêm khác — nay chặn):
 *  - Phải cùng MSSV và đang ở trạng thái APPROVED.
 *  - `LATE_RETURN`: chỉ có hiệu lực ĐÚNG ngày trên đơn (`date === scanDate`).
 *  - `OVERNIGHT`  : đơn qua đêm bao trùm cả đêm, nên hợp lệ khi `date` bằng
 *    ngày quét HOẶC bằng đêm quét (đơn ngày 20 phủ lượt về lúc 02:00 ngày 21).
 *
 * @param {object} request Bản ghi curfewRequests.
 * @param {{ studentId?: string, scanDate: string, scanHour?: number }} scan Lượt quét.
 * @returns {boolean}
 */
export function isRequestValidForScanDate(request, scan) {
  if (!request || request.status !== "APPROVED") return false
  const wanted = String(scan?.studentId ?? "").trim().toUpperCase()
  const owner = String(request.studentId ?? "").trim().toUpperCase()
  if (!wanted || owner !== wanted) return false

  const scanDate = String(scan?.scanDate ?? "").trim()
  if (!scanDate) return false
  const requestDate = String(request.date ?? "").trim()
  if (!requestDate) return false

  if (requestDate === scanDate) return true
  if (request.requestType === "OVERNIGHT") {
    return requestDate === curfewNightOf(scanDate, scan?.scanHour)
  }
  return false
}

/**
 * Tìm đơn APPROVED hợp lệ cho lượt quét, đã lọc theo ngày.
 * @param {object[]} requests Toàn bộ curfewRequests.
 * @param {{ studentId?: string, scanDate: string, scanHour?: number, matchedRequestId?: string }} scan
 * @returns {object|null}
 */
export function findApprovedRequestForScan(requests, scan) {
  const rows = Array.isArray(requests) ? requests : []
  const byDate = rows.find((r) => isRequestValidForScanDate(r, scan))
  if (byDate) return byDate
  // Cho phép bảo vệ chỉ định tay đúng đơn — vẫn phải thoả quy tắc ngày.
  if (scan?.matchedRequestId) {
    const explicit = rows.find((r) => r.id === scan.matchedRequestId)
    if (explicit && isRequestValidForScanDate(explicit, scan)) return explicit
  }
  return null
}

/** MSSV còn vắng mặt sau giờ giới nghiêm. */
export function findOverdueAbsentees(logs, expectedStudentIds, nowHour) {
  if (Number(nowHour) < CURFEW_HOUR) return []
  const seen = new Set(logs.map((l) => String(l.studentId).toUpperCase()))
  return expectedStudentIds.filter((id) => !seen.has(String(id).toUpperCase()))
}

/** Đơn về muộn nộp trước 21:00 hay không. */
export function isSubmittedBeforeCutoff(submittedAt) {
  const d = new Date(submittedAt)
  if (Number.isNaN(d.getTime())) return false
  return d.getHours() < LATE_REQUEST_CUTOFF_HOUR
}

/** Kiểm tra dữ liệu đơn xin về muộn trước khi lưu. */
export function validateCurfewRequest(input) {
  const errors = []
  if (!input.studentId?.trim()) errors.push("Thiếu MSSV")
  if (!input.date) errors.push("Thiếu ngày")
  if (!input.expectedReturnTime?.trim()) errors.push("Thiếu giờ dự kiến về")
  if (!input.reasonDetail?.trim()) errors.push("Thiếu lý do cụ thể")
  if (input.requestType === "OVERNIGHT" && input.parentConfirmed !== true) {
    errors.push("Đơn qua đêm bắt buộc phụ huynh xác nhận")
  }
  return { ok: errors.length === 0, errors }
}

/** Sinh bản ghi biên bản vi phạm từ một hành vi. */
export function buildDisciplineRecord({ studentId, studentName, room, infractionType, description, officerName, now = new Date() }) {
  const type = INFRACTION_POINTS[infractionType] ? infractionType : "OTHER"
  return {
    id: null, // tầng route gán id
    studentId,
    studentName,
    room: room || "",
    date: now.toISOString().slice(0, 10),
    infractionType: type,
    infractionTitle: INFRACTION_TITLES[type],
    pointsDeducted: INFRACTION_POINTS[type],
    description: description?.trim() || INFRACTION_TITLES[type],
    officerName: officerName || "Ban Quản lý KTX",
    status: "RECORDED",
  }
}

/** Tính lại tổng điểm rèn luyện của một sinh viên từ danh sách vi phạm. */
export function summarizeDemerits(studentId, studentName, room, violations) {
  const own = violations.filter((v) => v.studentId === studentId)
  const totalDeducted = own.reduce((sum, v) => sum + (v.pointsDeducted || 0), 0)
  const remainingPoints = Math.max(0, DEMERIT_INITIAL - totalDeducted)
  let status = "NORMAL"
  if (totalDeducted > DEMERIT_SUSPEND_AT) status = "SUSPENDED"
  else if (totalDeducted > DEMERIT_WARNING_AT) status = "WARNING"
  return {
    studentId,
    studentName,
    room,
    initialPoints: DEMERIT_INITIAL,
    totalDeducted,
    remainingPoints,
    status,
    violationCount: own.length,
  }
}

/** Sinh viên có bị đình chỉ lưu trú kỳ sau không. */
export function isSuspendedByDemerits(summary) {
  return summary?.status === "SUSPENDED"
}
