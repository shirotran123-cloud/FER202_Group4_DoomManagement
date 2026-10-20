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
  id: string
  studentId: string
  studentName: string
  room: string
  phone: string
  requestType: CurfewRequestType
  date: string
  expectedReturnTime: string
  reasonCategory: CurfewReasonCategory
  reasonDetail: string
  parentPhone: string
  parentConfirmed: boolean
  submittedAt: string
  isSubmittedBefore2100: boolean
  status: CurfewRequestStatus
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
}

export type GateDirection = "ENTRY" | "EXIT"

export type GateAccessStatus =
  | "VALID"
  | "ENTRY"
  | "EXIT"
  | "ON_TIME"
  | "APPROVED_LATE"
  | "UNAUTHORIZED_LATE"

export interface GateAccessLog {
  id: string
  studentId: string
  studentName: string
  room: string
  timestamp: string
  scanTimeFormatted: string
  direction?: GateDirection // "ENTRY" | "EXIT"
  status?: "VALID" | "NORMAL"
  curfewStatus?: GateAccessStatus
  matchedRequestId?: string
  penaltyPointsDeducted?: number
  guardNotes?: string
  guardName: string
}

export type InfractionType =
  | "CURFEW_VIOLATION"
  | "UNAUTHORIZED_COOKING"
  | "NOISE_AFTER_HOURS"
  | "SMOKING_VAPING"
  | "UNAUTHORIZED_GUEST"
  | "HIGH_POWER_APPLIANCE"
  | "OTHER"

export interface DisciplineRecord {
  id: string
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
  initialPoints: number
  totalDeducted: number
  remainingPoints: number
  status: "NORMAL" | "WARNING" | "SUSPENDED"
  violationCount: number
}
