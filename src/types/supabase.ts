// Database Entities for Supabase Integration

export interface DbBuilding {
  id: string
  name: string
  gender_type: "MALE" | "FEMALE" | "MIXED"
  total_floors: number
  description?: string
  created_at?: string
}

export interface DbRoom {
  id: string
  building_id: string
  building_name?: string
  room_number: string // e.g. "A101", "A205"
  floor: number // 1 to 5
  max_capacity: number // 24 beds (4 compartments x 6 beds)
  status: "ACTIVE" | "MAINTENANCE" | "RENOVATING"
  price_per_month: number // VNĐ
  created_at?: string
  // Aggregated stats
  occupied_count?: number
  available_count?: number
}

export interface DbCompartment {
  id: string
  room_id: string
  room_number?: string
  code: "A" | "B" | "C" | "D"
  title: string // e.g. "Window Bay", "Balcony Wing", "Study Hub", "Main Door"
  zone_description?: string
  created_at?: string
}

export interface DbBed {
  id: string
  compartment_id: string
  bed_code: string // e.g. "A205-B-G03"
  slot: string // "G01" to "G06"
  tier: "lower" | "upper"
  price: number
  status: "available" | "occupied" | "holding" | "maintenance"
  student_id?: string | null
  student_name?: string | null
  created_at?: string
}

export interface DbStudent {
  id: string
  student_id: string // MSSV: "SE182049"
  full_name: string
  email: string
  phone: string
  citizen_id: string // CCCD: "079204018293"
  gender: "Nam" | "Nữ"
  dob: string // "2004-05-15"
  hometown: string
  major: string
  cohort: string
  building: string
  room: string
  compartment: string
  bed_code: string
  status: "active" | "suspended" | "pending_checkout"
  debt_amount: number
  parent_name: string
  parent_phone: string
  joined_date: string
  created_at?: string
}

export interface DbContract {
  id: string
  contract_code: string // "CTR-2026-001"
  student_id: string
  student_name?: string
  bed_code: string
  room: string
  building: string
  semester: string // "Fall 2026", "Spring 2027"
  start_date: string
  end_date: string
  deposit_amount: number
  status: "ACTIVE" | "EXPIRED" | "TERMINATED"
  created_at?: string
}

export interface SupabaseConfig {
  url: string
  anonKey: string
  isConfigured: boolean
  source: "env" | "localStorage" | "unconfigured"
}

export interface ConnectionTestResult {
  success: boolean
  latencyMs?: number
  message: string
  tables?: {
    buildings: number
    rooms: number
    compartments: number
    beds: number
    students: number
    contracts: number
  }
}

