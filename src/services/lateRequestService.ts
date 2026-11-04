export type LateRequestStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface LateCurfewRequest {
  id: string
  studentId: string
  studentName: string
  room: string
  bedCode?: string
  building?: string
  avatar?: string
  createdAt: string // ISO string
  timeStr: string // "21:30"
  dateStr: string // "04/11/2026"
  expectedTime: string // "23:45"
  reasonCategory: "do_an" | "lam_them" | "xe_bus" | "dot_xuat"
  reasonTitle: string
  note?: string
  status: LateRequestStatus
  approvalCode?: string
  reviewedBy?: string
  reviewedAt?: string
  rejectReason?: string
}

const STORAGE_KEY = "dms_late_curfew_requests_v1"
const CHANNEL_NAME = "dms_late_requests_channel"
const EVENT_NAME = "dms_late_requests_updated"

// Initial sample requests
export const DEFAULT_LATE_REQUESTS: LateCurfewRequest[] = [
  {
    id: "LAT-2026-0924",
    studentId: "SE182049",
    studentName: "Nguyễn Hoàng Vinh",
    room: "A205",
    bedCode: "A205-B-G03",
    building: "Tòa A (Khu Nam)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    timeStr: "22:15",
    dateStr: "Hôm nay (" + new Date().toLocaleDateString("vi-VN") + ")",
    expectedTime: "23:45",
    reasonCategory: "do_an",
    reasonTitle: "Học nhóm đồ án Capstone K19 tại Thư viện Alpha",
    note: "Lab Alpha tầng 3, nhóm 5 sinh viên",
    status: "PENDING",
  },
  {
    id: "LAT-2026-0923",
    studentId: "SE182050",
    studentName: "Trần Thanh Nguyên",
    room: "A205",
    bedCode: "A205-B-G02",
    building: "Tòa A (Khu Nam)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    timeStr: "20:40",
    dateStr: "Hôm nay (" + new Date().toLocaleDateString("vi-VN") + ")",
    expectedTime: "23:30",
    reasonCategory: "lam_them",
    reasonTitle: "Làm thêm ca tối hỗ trợ sự kiện trường FPTU",
    note: "Hội trường Beta FPTU",
    status: "APPROVED",
    approvalCode: "LAT-OK-8821",
    reviewedBy: "Vũ Thành Nam (Trưởng BQL)",
    reviewedAt: "21:00",
  },
  {
    id: "LAT-2026-0921",
    studentId: "SE174201",
    studentName: "Trần Minh Quân",
    room: "A205",
    bedCode: "A205-B-G01",
    building: "Tòa A (Khu Nam)",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    timeStr: "22:05",
    dateStr: "Hôm qua",
    expectedTime: "00:30",
    reasonCategory: "dot_xuat",
    reasonTitle: "Đi sinh nhật bạn cùng lớp về muộn",
    note: "Quán ăn ngoài khu CNC",
    status: "REJECTED",
    reviewedBy: "Vũ Thành Nam (Trưởng BQL)",
    reviewedAt: "22:20",
    rejectReason: "Lý do cá nhân không cấp thiết sau 23:30. Đề nghị về phòng đúng giờ.",
  },
]

// Singleton BroadcastChannel
let broadcastChannel: BroadcastChannel | null = null
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
  } catch {
    broadcastChannel = null
  }
}

/**
 * Get all late curfew requests from localStorage
 */
export function getLateRequests(): LateCurfewRequest[] {
  if (typeof window === "undefined") return DEFAULT_LATE_REQUESTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LATE_REQUESTS))
      return DEFAULT_LATE_REQUESTS
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return DEFAULT_LATE_REQUESTS
    return parsed
  } catch {
    return DEFAULT_LATE_REQUESTS
  }
}

/**
 * Get late requests filtered for a specific student ID
 */
export function getStudentLateRequests(studentId: string): LateCurfewRequest[] {
  const all = getLateRequests()
  const target = (studentId || "").toLowerCase().trim()
  return all.filter((r) => (r.studentId || "").toLowerCase().trim() === target)
}

/**
 * Dispatch update to other tabs and local windows
 */
function notifyUpdate(requests: LateCurfewRequest[], updatedItem?: LateCurfewRequest) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { requests, updatedItem },
      })
    )
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: "LATE_REQUESTS_UPDATED",
        requests,
        updatedItem,
      })
    }
  } catch (e) {
    console.warn("[LateRequestService] Notification sync error:", e)
  }
}

/**
 * Create a new late request from Student
 */
export function createLateRequest(params: {
  studentId: string
  studentName: string
  room: string
  bedCode?: string
  building?: string
  avatar?: string
  expectedTime: string
  reasonCategory: "do_an" | "lam_them" | "xe_bus" | "dot_xuat"
  reasonTitle: string
  note?: string
}): LateCurfewRequest {
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  const dateStr = `Hôm nay (${now.toLocaleDateString("vi-VN")})`
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)

  const newRequest: LateCurfewRequest = {
    id: `LAT-${now.getFullYear()}-${randomSuffix}`,
    studentId: params.studentId,
    studentName: params.studentName,
    room: params.room,
    bedCode: params.bedCode,
    building: params.building || "Tòa A (Khu Nam)",
    avatar: params.avatar,
    createdAt: now.toISOString(),
    timeStr,
    dateStr,
    expectedTime: params.expectedTime,
    reasonCategory: params.reasonCategory,
    reasonTitle: params.reasonTitle,
    note: params.note,
    status: "PENDING", // Always PENDING initially until approved by Manager
  }

  const existing = getLateRequests()
  const updated = [newRequest, ...existing]
  notifyUpdate(updated, newRequest)

  return newRequest
}

/**
 * Manager approves a late request
 */
export function approveLateRequest(
  requestId: string,
  reviewerName: string = "Ban Quản Lý KTX"
): LateCurfewRequest | null {
  const all = getLateRequests()
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  const approvalCode = `LAT-OK-${Math.floor(1000 + Math.random() * 9000)}`

  let updatedTarget: LateCurfewRequest | null = null

  const updated = all.map((req) => {
    if (req.id === requestId) {
      updatedTarget = {
        ...req,
        status: "APPROVED" as const,
        approvalCode,
        reviewedBy: reviewerName,
        reviewedAt: timeStr,
        rejectReason: undefined,
      }
      return updatedTarget
    }
    return req
  })

  if (updatedTarget) {
    notifyUpdate(updated, updatedTarget)
  }

  return updatedTarget
}

/**
 * Manager rejects a late request
 */
export function rejectLateRequest(
  requestId: string,
  reviewerName: string = "Ban Quản Lý KTX",
  reason?: string
): LateCurfewRequest | null {
  const all = getLateRequests()
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

  let updatedTarget: LateCurfewRequest | null = null

  const updated = all.map((req) => {
    if (req.id === requestId) {
      updatedTarget = {
        ...req,
        status: "REJECTED" as const,
        reviewedBy: reviewerName,
        reviewedAt: timeStr,
        rejectReason: reason || "Lý do xin về muộn không phù hợp quy định giờ giới nghiêm KTX.",
      }
      return updatedTarget
    }
    return req
  })

  if (updatedTarget) {
    notifyUpdate(updated, updatedTarget)
  }

  return updatedTarget
}

/**
 * Reset late requests to default mock list
 */
export function resetLateRequests(): LateCurfewRequest[] {
  notifyUpdate(DEFAULT_LATE_REQUESTS)
  return DEFAULT_LATE_REQUESTS
}

/**
 * Subscribe to real-time updates for late requests
 */
export function subscribeLateRequests(
  callback: (requests: LateCurfewRequest[], updatedItem?: LateCurfewRequest) => void
): () => void {
  if (typeof window === "undefined") return () => {}

  const handleLocal = (e: Event) => {
    const customEvent = e as CustomEvent<{ requests: LateCurfewRequest[]; updatedItem?: LateCurfewRequest }>
    callback(customEvent.detail?.requests || getLateRequests(), customEvent.detail?.updatedItem)
  }

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === "LATE_REQUESTS_UPDATED") {
      callback(e.data.requests || getLateRequests(), e.data.updatedItem)
    }
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      const all = getLateRequests()
      callback(all, all[0])
    }
  }

  window.addEventListener(EVENT_NAME, handleLocal)
  window.addEventListener("storage", handleStorage)
  if (broadcastChannel) {
    broadcastChannel.addEventListener("message", handleBroadcast)
  }

  return () => {
    window.removeEventListener(EVENT_NAME, handleLocal)
    window.removeEventListener("storage", handleStorage)
    if (broadcastChannel) {
      broadcastChannel.removeEventListener("message", handleBroadcast)
    }
  }
}

