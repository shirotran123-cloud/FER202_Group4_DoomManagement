 export type UserRole = "student" | "manager" | "technician" | "admin"

export interface EmergencyContact {
  parentName: string
  relationship: string
  phone: string
  address: string
  email?: string
}

export interface DormitoryStatus {
  building: string
  room: string
  compartment: string
  bedCode: string
  contractStart: string
  contractEnd: string
  debtStatus: number // 0 = no debt, >0 = unpaid bills
  checkInDate: string
  roomStatus: "OCCUPIED" | "CHECKED_IN" | "PENDING_HANDOVER"
}

export interface UserProfile {
  id: string
  fullName: string
  email: string
  avatar: string
  role: UserRole
  roleTitle: string
  studentId?: string
  staffId?: string
  phone: string
  citizenId: string
  dob: string
  gender: "male" | "female"
  hometown: string
  major?: string
  cohort?: string
  department?: string
  dormitoryStatus?: DormitoryStatus
  emergencyContact: EmergencyContact
  status: "active" | "suspended" | "pending"
  joinedDate: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface AuthContextType {
  user: UserProfile | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  loginWithGoogle: (email: string, targetRole: UserRole) => Promise<{ success: boolean; message?: string }>
  loginAsDemoUser: (role: UserRole) => void
  loginWithCustomUser: (customUser: UserProfile) => void
  switchRole: (role: UserRole) => void
  updateProfile: (updatedData: Partial<UserProfile>) => void
  logout: () => void
  sessionSecondsLeft: number
  refreshSession: () => void
}