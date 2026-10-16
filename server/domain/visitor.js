/**
 * Nghiệp vụ khách thăm — khớp VisitorPage.tsx và src/lib/dorm-ops.ts.
 *
 * Quy tắc:
 *  - Chỉ sinh viên đăng ký khách của mình.
 *  - CCCD bắt buộc đúng 12 chữ số (không dùng 9 số như CMND cũ).
 *  - Khách chỉ ở trong ngày, rời KTX trước 21:00, KHÔNG lưu trú qua đêm.
 *  - Không có trường thời lượng; quá 21:00 -> OVERSTAY.
 */
import { VISITOR_LATEST_HOUR } from "../config.js"

export const VISITOR_STATUS = {
  PRE_REGISTERED: "PRE_REGISTERED",
  CHECKED_IN: "CHECKED_IN",
  CHECKED_OUT: "CHECKED_OUT",
  OVERSTAY: "OVERSTAY",
}

/** CCCD Việt Nam: đúng 12 chữ số. */
export function isValidCitizenId(value) {
  return /^\d{12}$/.test(String(value || "").replace(/\s/g, ""))
}

/** Kiểm tra dữ liệu đăng ký khách. */
export function validateVisitorInput({ studentId, fullName, citizenId }) {
  const errors = []
  if (!studentId?.trim()) errors.push("Thiếu MSSV sinh viên đăng ký")
  if (!fullName?.trim()) errors.push("Vui lòng nhập họ tên khách")
  if (!isValidCitizenId(citizenId)) errors.push("Số CCCD phải gồm đúng 12 chữ số")
  return { ok: errors.length === 0, errors }
}

/** Bản ghi khách mới — không có thời lượng, đúng shape frontend. */
export function buildVisitor({ studentId, fullName, citizenId, visitDate }, now = new Date()) {
  return {
    id: null, // tầng route gán
    studentId: String(studentId).trim(),
    fullName: String(fullName).trim(),
    citizenId: String(citizenId).replace(/\s/g, ""),
    visitDate: visitDate || now.toISOString().slice(0, 10),
    expectedMinutes: 0, // giữ để tương thích dữ liệu cũ; UI không hiển thị
    status: VISITOR_STATUS.PRE_REGISTERED,
    checkInAt: null,
    checkOutAt: null,
  }
}

/** Check-in chỉ khi đã đăng ký trước. */
export function assertCanCheckIn(visitor) {
  if (visitor.status !== VISITOR_STATUS.PRE_REGISTERED) {
    const err = new Error("Chỉ check-in được khách đã đăng ký trước")
    err.status = 400
    throw err
  }
}

/** Check-out chỉ khi khách đang ở trong KTX. */
export function assertCanCheckOut(visitor) {
  if (visitor.status !== VISITOR_STATUS.CHECKED_IN && visitor.status !== VISITOR_STATUS.OVERSTAY) {
    const err = new Error("Khách chưa check-in, không thể check-out")
    err.status = 400
    throw err
  }
}

/**
 * Đánh dấu quá giờ nếu đã quá 21:00 mà khách còn trong KTX.
 * hour lấy theo giờ địa phương của server.
 */
export function detectOverstay(visitor, now = new Date()) {
  if (visitor.status !== VISITOR_STATUS.CHECKED_IN) return visitor
  if (now.getHours() >= VISITOR_LATEST_HOUR) {
    return { ...visitor, status: VISITOR_STATUS.OVERSTAY }
  }
  return visitor
}

/** Danh sách khách còn trong KTX sau 21:00 — bảo vệ cần xử lý. */
export function overstayingVisitors(visitors, now = new Date()) {
  return visitors
    .map((v) => detectOverstay(v, now))
    .filter((v) => v.status === VISITOR_STATUS.OVERSTAY)
}
