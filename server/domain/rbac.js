/**
 * Phân quyền 4 vai trò ở backend — đối chiếu src/lib/role-access.ts.
 *
 * student    Sinh viên nội trú: xem dữ liệu của mình, đặt giường, báo hỏng,
 *            xin về muộn, đăng ký khách, báo mất đồ.
 * manager    Quản lý KTX: vận hành toàn tòa — duyệt, ghi chỉ số, phát hành
 *            hóa đơn, phân công thợ, kỷ luật, báo cáo.
 * technician Kỹ thuật & Bảo vệ: xử lý phiếu báo hỏng, quét cổng, điểm danh.
 *            KHÔNG chạm tiền, KHÔNG duyệt đơn, KHÔNG đặt giường.
 * admin      Toàn quyền, thêm quyền cấu hình hệ thống.
 */

/** Bảng quyền chi tiết theo hành động. */
export const PERMISSIONS = {
  // Hồ sơ & phiên
  "profile:read:self": ["student", "manager", "technician", "admin"],
  "profile:update:self": ["student", "manager", "technician", "admin"],

  // Cấu trúc KTX
  "inventory:read": ["student", "manager", "technician", "admin"],
  "inventory:write": ["manager", "admin"],

  // Đặt giường
  "bed:hold": ["student", "admin"],
  "bed:release": ["student", "manager", "admin"],
  "booking:create": ["student", "admin"],
  "booking:read:self": ["student", "admin"],
  "booking:read:all": ["manager", "admin"],
  "booking:approve": ["manager", "admin"],
  "booking:reject": ["manager", "admin"],

  // Hợp đồng & bàn giao
  "contract:read:self": ["student", "admin"],
  "contract:read:all": ["manager", "admin"],
  "handover:checkin": ["manager", "admin"],
  "handover:checkout": ["manager", "admin"],
  "roomswitch:create": ["student", "admin"],
  "roomswitch:review": ["manager", "admin"],

  // Hóa đơn & công tơ
  "meter:read": ["manager", "admin"],
  "meter:write": ["manager", "admin"],
  "invoice:read:self": ["student", "admin"],
  "invoice:read:all": ["manager", "admin"],
  "invoice:issue": ["manager", "admin"],
  "invoice:pay": ["student", "admin"],
  "invoice:reconcile": ["manager", "admin"],
  "invoice:dispute": ["student", "admin"],

  // Báo hỏng
  "ticket:create": ["student", "manager", "technician", "admin"],
  "ticket:read": ["student", "manager", "technician", "admin"],
  "ticket:update": ["student", "manager", "technician", "admin"],
  "ticket:assign": ["manager", "admin"],
  "ticket:complete": ["technician", "manager", "admin"],
  "ticket:review": ["student", "admin"],

  // Giới nghiêm & kỷ luật
  "curfew:request": ["student", "admin"],
  "curfew:approve": ["manager", "admin"],
  "gate:scan": ["technician", "manager", "admin"],
  "discipline:read:self": ["student", "admin"],
  "discipline:read:all": ["manager", "technician", "admin"],
  "discipline:write": ["manager", "admin"],

  // Khách thăm (chỉ sinh viên dùng; admin hỗ trợ)
  "visitor:create": ["student", "admin"],
  "visitor:read:self": ["student", "admin"],
  "visitor:read:all": ["manager", "admin"],
  "visitor:gate": ["technician", "manager", "admin"],

  // Bảng tin
  "notice:read": ["student", "manager", "technician", "admin"],
  "notice:publish": ["manager", "admin"],
  "notice:delete": ["manager", "admin"],

  // Chợ & thất lạc (chỉ sinh viên)
  "marketplace:create": ["student", "admin"],
  "marketplace:read": ["student", "manager", "admin"],
  "marketplace:moderate": ["manager", "admin"],

  // Dashboard & báo cáo
  "dashboard:read": ["manager", "admin"],
  "report:export": ["manager", "admin"],

  // Hệ thống
  "system:configure": ["admin"],
  "system:audit": ["admin"],
}

/** Vai trò có quyền với hành động không. */
export function can(role, action) {
  const allowed = PERMISSIONS[action]
  if (!allowed) return false
  return allowed.includes(String(role || "").toLowerCase())
}

/** Ném lỗi 403 nếu thiếu quyền — dùng trong middleware. */
export function assertCan(role, action) {
  if (!can(role, action)) {
    const err = new Error(`Vai trò "${role || "khách"}" không có quyền: ${action}`)
    err.status = 403
    throw err
  }
}

/** Sinh viên chỉ đọc được dữ liệu của chính mình. */
export function isSelf(actor, ownerStudentId) {
  return Boolean(actor?.studentId) && actor.studentId === ownerStudentId
}

export function isManagerOrAdmin(role) {
  return role === "manager" || role === "admin"
}

export function isStaff(role) {
  return role === "manager" || role === "technician" || role === "admin"
}

/** Danh sách quyền của một vai trò (để frontend ẩn/hiện UI). */
export function permissionsFor(role) {
  const r = String(role || "").toLowerCase()
  return Object.entries(PERMISSIONS)
    .filter(([, roles]) => roles.includes(r))
    .map(([action]) => action)
}
