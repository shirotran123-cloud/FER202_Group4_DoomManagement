/**
 * Nghiệp vụ đặt giường & auto-approval — khớp BookingPage.tsx
 * và server.js /api/bookings/approve.
 *
 * Quy tắc SRS FR-3.2 / UC-11:
 *  1. Giới tính sinh viên phải khớp loại tòa (Nam/Nữ).
 *  2. Sinh viên không nợ kỳ trước, không bị đình chỉ.
 *  3. Cọc đã thanh toán 100% (booking PAID).
 * Giường giữ chỗ 15 phút, hết hạn tự nhả về AVAILABLE.
 */
import { BED_HOLD_MINUTES, DEPOSIT_AMOUNT, ROOM_FEE_PER_STUDENT } from "../config.js"

export const BED_STATUS = {
  AVAILABLE: "AVAILABLE",
  HOLDING: "HOLDING",
  OCCUPIED: "OCCUPIED",
  MAINTENANCE: "MAINTENANCE",
}

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
}

/** Giới tính db seed ghi HOA (MALE/FEMALE), frontend ghi thường. */
export function normalizeGender(gender) {
  const g = String(gender || "").trim().toUpperCase()
  if (g === "MALE" || g === "NAM") return "MALE"
  if (g === "FEMALE" || g === "NỮ" || g === "NU") return "FEMALE"
  return g
}

/** Giới tính tòa từ tên (Tòa A (Nam) / Tòa B (Nữ)). */
export function buildingGenderType(building) {
  if (building?.genderType) return normalizeGender(building.genderType)
  const name = String(building?.name || "")
  if (/nữ|nu\b|female/i.test(name)) return "FEMALE"
  if (/nam|male/i.test(name)) return "MALE"
  return ""
}

/**
 * Chạy 3 điều kiện auto-approval.
 * Trả { approved, reasons } — reasons rỗng nghĩa là đủ điều kiện.
 */
export function evaluateAutoApproval({ student, building, booking }) {
  const reasons = []
  if (!student) reasons.push("Không tìm thấy sinh viên")
  if (!booking) reasons.push("Không tìm thấy đơn giữ chỗ")
  if (reasons.length) return { approved: false, reasons }

  const studentGender = normalizeGender(student.gender)
  const buildingGender = buildingGenderType(building)
  if (buildingGender && studentGender && studentGender !== buildingGender) {
    reasons.push(
      `Giới tính không khớp: sinh viên ${studentGender}, tòa ${buildingGender}`,
    )
  }
  if ((student.previousDebt || 0) > 0) {
    reasons.push(`Còn nợ kỳ trước ${Number(student.previousDebt).toLocaleString("vi-VN")}đ`)
  }
  if (student.isSuspended) reasons.push("Đang bị đình chỉ lưu trú")
  if (booking.status !== BOOKING_STATUS.PAID) {
    reasons.push("Cọc chưa thanh toán đủ 100%")
  }
  return { approved: reasons.length === 0, reasons }
}

/** Hạn giữ chỗ 15 phút kể từ lúc tạo. */
export function holdExpiresAt(createdAt) {
  const base = new Date(createdAt)
  if (Number.isNaN(base.getTime())) return null
  return new Date(base.getTime() + BED_HOLD_MINUTES * 60 * 1000)
}

/** Đơn giữ chỗ đã hết hạn chưa. */
export function isHoldExpired(booking, now = new Date()) {
  if (booking.status !== BOOKING_STATUS.PENDING) return false
  const exp = holdExpiresAt(booking.createdAt)
  if (!exp) return false
  return now.getTime() > exp.getTime()
}

/** Số giây còn lại của lượt giữ chỗ (0 nếu hết). */
export function holdSecondsLeft(booking, now = new Date()) {
  const exp = holdExpiresAt(booking.createdAt)
  if (!exp) return 0
  return Math.max(0, Math.floor((exp.getTime() - now.getTime()) / 1000))
}

/** Tổng tiền phải trả khi giữ chỗ: phòng tháng đầu + cọc + tạm ứng điện nước. */
export function bookingTotal(roomFee = ROOM_FEE_PER_STUDENT, deposit = DEPOSIT_AMOUNT, utilityAdvance = 200000) {
  return roomFee + deposit + utilityAdvance
}

/** Nội dung VietQR cho đặt giường. */
export function bookingQrContent(studentId, bedCode) {
  return `DORM_BOOKING_${bedCode}_${studentId}_${bookingTotal()}`
}

/** Điều kiện đổi phòng. */
export function validateRoomSwitch({ studentId, fromRoom, toRoom }) {
  const errors = []
  if (!studentId?.trim()) errors.push("Thiếu MSSV")
  if (!fromRoom?.trim() || !toRoom?.trim()) errors.push("Thiếu phòng đi/đến")
  if (fromRoom?.trim() === toRoom?.trim()) errors.push("Phòng mới phải khác phòng hiện tại")
  return { ok: errors.length === 0, errors }
}
