import type { UserRole } from "@/types/auth"

/**
 * Ma trận phân quyền tập trung cho 5 vai trò DMS.
 *
 * guest       Khách vãng lai: chỉ xem landing công khai, không đăng nhập.
 * student     Sinh viên nội trú: Gmail cá nhân; đặt giường, check-in/out,
 *             hóa đơn cá nhân, báo hỏng, về muộn, khách thăm, chợ, bảng tin (xem).
 * manager     Quản lý KTX: email @fpt.edu.vn/@fe.edu.vn; dashboard vận hành,
 *             duyệt đơn, ghi chỉ số, phát hành hóa đơn, đăng bảng tin, kỷ luật.
 * technician  Kỹ thuật & Bảo vệ: email trường; hàng đợi sửa chữa, quét cổng,
 *             điểm danh, ghi nhận vi phạm. Không đặt giường, không xem hóa đơn.
 * admin       Quản trị viên: toàn quyền như manager + xem dưới vai sinh viên.
 */

export type AppRouteKey =
  | "overview"
  | "my-room"
  | "booking"
  | "billing"
  | "maintenance"
  | "curfew"
  | "manager"
  | "visitor"
  | "notices"
  | "marketplace"
  | "profile"

export const ROUTE_ROLES: Record<AppRouteKey, UserRole[]> = {
  // Sinh viên theo dõi + quản lý xem giám sát. Kỹ thuật không liên quan.
  overview: ["student", "manager", "admin"],
  // Phòng của tôi: sinh viên xem phòng mình. Admin xem để hỗ trợ.
  "my-room": ["student", "admin"],
  // Đặt giường: chỉ sinh viên (admin hỗ trợ). Quản lý duyệt tự động qua engine.
  booking: ["student", "admin"],
  // Hóa đơn: sinh viên xem/trả của mình; quản lý ghi chỉ số + phát hành.
  // Kỹ thuật không chạm tiền.
  billing: ["student", "manager", "admin"],
  // Báo hỏng: sinh viên tạo + nghiệm thu; kỹ thuật xử lý; quản lý phân công.
  maintenance: ["student", "manager", "technician", "admin"],
  // Giới nghiêm: sinh viên xin về muộn + xem điểm; bảo vệ quét cổng;
  // quản lý duyệt + kỷ luật.
  curfew: ["student", "manager", "technician", "admin"],
  // Dashboard vận hành + báo cáo: quản lý + admin.
  manager: ["manager", "admin"],
  // Khách thăm: sinh viên đăng ký; bảo vệ check-in/out; quản lý giám sát.
  visitor: ["student", "manager", "technician", "admin"],
  // Bảng tin: mọi vai trò xem; chỉ manager/admin đăng (guard trong trang).
  notices: ["student", "manager", "technician", "admin"],
  // Chợ & thất lạc: cộng đồng sinh viên; quản lý/admin kiểm duyệt.
  marketplace: ["student", "manager", "admin"],
  // Hồ sơ: mọi vai trò đã đăng nhập.
  profile: ["student", "manager", "technician", "admin"],
}

export function canAccessRoute(role: UserRole | undefined, route: AppRouteKey): boolean {
  if (!role) return false
  return ROUTE_ROLES[route].includes(role)
}

export const isManagerOrAdmin = (role: UserRole | undefined): boolean =>
  role === "manager" || role === "admin"

export const isStaff = (role: UserRole | undefined): boolean =>
  role === "manager" || role === "technician" || role === "admin"

/** Sinh viên (và admin đóng vai) mới được đăng bài chợ / đăng ký khách. */
export const canPostCommunity = (role: UserRole | undefined): boolean =>
  role === "student" || role === "admin"

/** Chỉ sinh viên (và admin hỗ trợ) được đặt giường, check-in/out. */
export const canBookBed = (role: UserRole | undefined): boolean =>
  role === "student" || role === "admin"

/** Chỉ quản lý/admin ghi chỉ số công tơ và phát hành hóa đơn. */
export const canRecordMeter = (role: UserRole | undefined): boolean =>
  role === "manager" || role === "admin"

/** Chỉ bảo vệ/kỹ thuật (và quản lý/admin) quét cổng, điểm danh. */
export const canScanGate = (role: UserRole | undefined): boolean =>
  role === "technician" || role === "manager" || role === "admin"

/** Bảo vệ quét cổng nhưng không duyệt đơn — chỉ quản lý/admin duyệt. */
export const canApproveCurfew = (role: UserRole | undefined): boolean =>
  role === "manager" || role === "admin"

/** Chủ phiếu (hoặc quản lý/admin) mới được sửa/xóa ticket. */
export function canEditTicket(
  role: UserRole | undefined,
  ticketStudentId: string,
  currentStudentId: string | undefined,
): boolean {
  if (isManagerOrAdmin(role)) return true
  if (role === "student") return ticketStudentId === currentStudentId
  return false
}
