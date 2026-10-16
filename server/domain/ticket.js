/**
 * Nghiệp vụ phiếu báo hỏng — khớp src/types/maintenance.ts và MaintenancePage.tsx.
 *
 * Luồng trạng thái: PENDING → IN_PROGRESS → RESOLVED → CLOSED
 *                  PENDING/IN_PROGRESS → CANCELLED
 * SLA: EMERGENCY 2h, NORMAL 24h kể từ createdAt.
 */
import { TICKET_FLOW, URGENCY_SLA_HOURS } from "../config.js"

export const CATEGORIES = ["ELECTRIC", "PLUMBING", "HVAC", "FURNITURE", "NETWORK", "OTHER"]
export const SCOPES = ["ROOM_SHARED", "COMPARTMENT_PRIVATE"]
export const URGENCIES = ["NORMAL", "EMERGENCY"]

/** Chuyển trạng thái có hợp lệ không. */
export function canTransition(from, to) {
  return (TICKET_FLOW[from] || []).includes(to)
}

/** Ném lỗi nếu chuyển sai luồng — dùng ở tầng route. */
export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    const allowed = TICKET_FLOW[from] || []
    const err = new Error(
      `Không thể chuyển phiếu từ ${from} sang ${to}. Cho phép: ${allowed.join(", ") || "không có"}`,
    )
    err.status = 400
    throw err
  }
}

/** Kiểm tra dữ liệu tạo phiếu. */
export function validateTicketInput(input) {
  const errors = []
  if (!input.title?.trim()) errors.push("Thiếu tiêu đề sự cố")
  if (!SCOPES.includes(input.scope)) errors.push("Phạm vi không hợp lệ")
  if (!CATEGORIES.includes(input.category)) errors.push("Phân loại không hợp lệ")
  if (!URGENCIES.includes(input.urgency)) errors.push("Mức độ ưu tiên không hợp lệ")
  if (!input.room?.trim()) errors.push("Thiếu phòng")
  if (input.scope === "COMPARTMENT_PRIVATE" && !input.bedCode?.trim()) {
    errors.push("Phiếu buồng cá nhân phải có mã giường")
  }
  if (Array.isArray(input.evidenceImages) && input.evidenceImages.length > 5) {
    errors.push("Tối đa 5 ảnh hiện trường")
  }
  return { ok: errors.length === 0, errors }
}

/** Hạn xử lý theo SLA, tính từ createdAt. */
export function slaDeadline(createdAt, urgency) {
  const base = new Date(createdAt)
  if (Number.isNaN(base.getTime())) return null
  const hours = URGENCY_SLA_HOURS[urgency] ?? URGENCY_SLA_HOURS.NORMAL
  return new Date(base.getTime() + hours * 3600 * 1000)
}

/** Phiếu đã quá hạn SLA chưa (chỉ tính khi còn đang xử lý). */
export function isOverdue(ticket, now = new Date()) {
  if (!["PENDING", "IN_PROGRESS"].includes(ticket.status)) return false
  const deadline = slaDeadline(ticket.createdAt, ticket.urgency)
  if (!deadline) return false
  return now.getTime() > deadline.getTime()
}

/** Tổng chi phí vật tư thay thế. */
export function totalMaterialCost(materials = []) {
  return materials.reduce((sum, m) => sum + (m.quantity || 0) * (m.unitCost || 0), 0)
}

/** Xác thực đánh giá nghiệm thu 1–5 sao. */
export function validateRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5
}

/**
 * Quyền thao tác trên một phiếu.
 *  - Sinh viên: tạo phiếu, sửa/xóa khi còn PENDING, đánh giá khi RESOLVED.
 *  - Kỹ thuật: nhận việc và báo hoàn thành (IN_PROGRESS → RESOLVED).
 *  - Quản lý/admin: phân công thợ, duyệt, xóa bất kỳ phiếu nào.
 */
export function ticketPermissions(role, ticket, actorStudentId) {
  const isOwner = ticket.studentId === actorStudentId
  const isStaff = role === "manager" || role === "admin"
  const isTech = role === "technician" || isStaff
  return {
    canView: true,
    canEdit: isStaff || (isOwner && ticket.status === "PENDING"),
    canDelete: isStaff || (isOwner && ticket.status === "PENDING"),
    canAssign: isStaff && ticket.status === "PENDING",
    canComplete: isTech && ticket.status === "IN_PROGRESS",
    canReview: isOwner && ticket.status === "RESOLVED",
    canCancel: (isStaff || isOwner) && ["PENDING", "IN_PROGRESS"].includes(ticket.status),
  }
}

/** Thống kê phiếu cho dashboard. */
export function summarizeTickets(tickets, now = new Date()) {
  const by = (s) => tickets.filter((t) => t.status === s).length
  return {
    total: tickets.length,
    pending: by("PENDING"),
    inProgress: by("IN_PROGRESS"),
    resolved: by("RESOLVED"),
    closed: by("CLOSED"),
    cancelled: by("CANCELLED"),
    emergency: tickets.filter((t) => t.urgency === "EMERGENCY" && t.status !== "CLOSED").length,
    overdue: tickets.filter((t) => isOverdue(t, now)).length,
  }
}
