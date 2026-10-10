export type CurfewRequestType = "LATE_RETURN" | "OVERNIGHT"

export type CurfewReasonCategory =
  | "STUDY"
  | "PART_TIME_JOB"
  | "HOME_VISIT"
  | "MEDICAL"
  | "FAMILY_EVENT"
  | "OTHER"

export type CurfewRequestStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface CurfewRequest {
  id: string // e.g. "REQ-2026-089"
  studentId: string
  studentName: string
  room: string
  phone: string
  requestType: CurfewRequestType
  date: string // YYYY-MM-DD
  expectedReturnTime: string // e.g. "23:45" hoặc "06:30 (Sáng hôm sau)"
  reasonCategory: CurfewReasonCategory
  reasonDetail: string
  parentPhone: string
  parentConfirmed: boolean
  submittedAt: string
  isSubmittedBefore2100: boolean // BR: Nộp trước 21:00
  status: CurfewRequestStatus
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
}

export type GateAccessStatus =
  | "ON_TIME" // Trước 23:00 - Bình thường
  | "APPROVED_LATE" // Sau 23:00 - Có đơn duyệt hợp lệ
  | "UNAUTHORIZED_LATE" // Sau 23:00 - KHÔNG CÓ ĐƠN -> Vi phạm

export interface GateAccessLog {
  id: string
  studentId: string
  studentName: string
  room: string
  timestamp: string // ISO string
  scanTimeFormatted: string // e.g. "23:18:42"
  curfewStatus: GateAccessStatus
  matchedRequestId?: string
  penaltyPointsDeducted?: number
  guardNotes?: string
  guardName: string
}

export type InfractionType =
  | "CURFEW_VIOLATION" // Vi phạm giờ giới nghiêm sau 23:00 (-10đ)
  | "UNAUTHORIZED_COOKING" // Nấu ăn sai quy định trong phòng (-15đ)
  | "NOISE_AFTER_HOURS" // Làm ồn sau 22:30 ảnh hưởng buồng khác (-10đ)
  | "SMOKING_VAPING" // Hút thuốc lá / thuốc điện tử (-20đ)
  | "UNAUTHORIZED_GUEST" // Đưa người lạ vào phòng qua đêm (-25đ)
  | "HIGH_POWER_APPLIANCE" // Dùng thiết bị điện quá tải (-15đ)
  | "OTHER" // Vi phạm khác (-5đ)

export interface DisciplineRecord {
  id: string // e.g. "VIO-2026-042"
  studentId: string
  studentName: string
  room: string
  date: string
  infractionType: InfractionType
  infractionTitle: string
  pointsDeducted: number
  description: string
  officerName: string
  evidenceNote?: string
  evidenceImage?: string
  status: "RECORDED" | "APPEALED" | "RESOLVED"
}

export interface StudentDemeritSummary {
  studentId: string
  studentName: string
  room: string
  initialPoints: number // 100
  totalDeducted: number
  remainingPoints: number
  status: "NORMAL" | "WARNING" | "SUSPENDED" // >=80 Normal, 70-79 Warning, <70 Suspended
  violationCount: number
}
