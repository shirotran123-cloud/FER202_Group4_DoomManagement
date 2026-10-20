export type MaintenanceScope = "ROOM_SHARED" | "COMPARTMENT_PRIVATE"

export type MaintenanceCategory =
  | "ELECTRIC"
  | "PLUMBING"
  | "HVAC"
  | "FURNITURE"
  | "NETWORK"
  | "OTHER"

export type MaintenanceUrgency = "NORMAL" | "EMERGENCY"

export type MaintenanceStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED"

export interface ReplacedMaterial {
  id: string
  name: string
  quantity: number
  unitCost: number
  paidBy?: "DORMITORY" | "STUDENT" // KTX chi trả hoặc Sinh viên bồi thường
}

export interface TechnicianAssignment {
  id: string
  name: string
  phone: string
  assignedAt: string
  etaMinutes: number // Thời gian dự kiến có mặt (vd 120 phút đối với Emergency)
}

export interface MaintenanceResolution {
  completedAt: string
  technicianNotes: string
  completionImages: string[]
  materials: ReplacedMaterial[]
  totalMaterialCost: number
}

export interface MaintenanceReview {
  rating: number // 1 to 5 stars
  reviewedAt: string
  comment: string
  isSatisfied: boolean
}

export interface MaintenanceTicket {
  id: string // e.g. "TKT-2026-001"
  title: string
  scope: MaintenanceScope
  building: string
  room: string
  compartment?: string
  bedCode?: string
  category: MaintenanceCategory
  urgency: MaintenanceUrgency
  description: string
  studentId: string
  studentName: string
  studentPhone: string
  evidenceImages: string[]
  status: MaintenanceStatus
  createdAt: string
  assignedTechnician?: TechnicianAssignment
  resolution?: MaintenanceResolution
  review?: MaintenanceReview
}
