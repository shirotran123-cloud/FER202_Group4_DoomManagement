export interface OccupancyStats {
  totalBeds: number
  availableBeds: number
  holdingBeds: number
  occupiedBeds: number
  maintenanceBeds: number
  occupancyRate: number // e.g. 80.0 (%)
  totalRooms: number
  totalCompartments: number
}

export interface MonthlyRevenue {
  month: string // e.g. "Tháng 05", "Tháng 06", etc.
  roomFee: number // VNĐ
  utilityFee: number // VNĐ
  total: number // VNĐ
}

export interface BuildingConsumption {
  building: string
  electricityAvgKwh: number // kWh/phòng
  waterAvgM3: number // m3/phòng
  anomalyNote?: string
}

export interface ResidentTemporaryRecord {
  semester?: string
  stt: number
  contractCode: string
  fullName: string
  studentId: string
  gender: "Nam" | "Nữ"
  citizenId: string
  dob: string
  hometown: string
  phone: string
  building: string
  room: string
  compartment: string
  bedCode: string
  startDate: string
  endDate: string
  parentName: string
  parentPhone: string
}

export interface OverdueDebtRecord {
  semester?: string
  stt: number
  invoiceCode: string
  studentId: string
  fullName: string
  room: string
  bedCode: string
  billingPeriod: string
  roomDebt: number
  utilityDebt: number
  totalDebt: number
  dueDate: string
  overdueDays: number
  status: "QUÁ HẠN 3 NGÀY" | "QUÁ HẠN 7 NGÀY" | "CẢNH BÁO ĐÌNH CHỈ"
  phone: string
}
