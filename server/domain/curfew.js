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

/** Đánh giá một lượt quét cổng — khớp evaluateGateScan frontend. */
export function evaluateGateScan(scanHour, hasApprovedRequest) {
  if (!isLateScan(scanHour)) return GATE_STATUS.ON_TIME
  return hasApprovedRequest ? GATE_STATUS.APPROVED_LATE : GATE_STATUS.UNAUTHORIZED_LATE
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
