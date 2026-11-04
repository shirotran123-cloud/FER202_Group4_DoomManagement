/**
 * Utility Dispute Management Service (Dịch vụ Quản lý Khiếu nại Điện Nước)
 * Handles disputes filed by students regarding electricity/water meter readings.
 * Synchronizes in real-time across Student, Manager, and Technician roles.
 */

import { addNotification } from "./notificationService"

export type UtilityDisputeType = "ELECTRIC" | "WATER" | "OCCUPANCY"
export type UtilityDisputeStatus = "PENDING" | "INSPECTING" | "RESOLVED" | "REJECTED"

export interface UtilityDispute {
  id: string
  room: string
  building: string
  studentName: string
  studentId: string
  studentPhone: string
  utilityType: UtilityDisputeType
  utilityTypeLabel: string
  description: string
  month: string // e.g. "Tháng 09/2026"
  status: UtilityDisputeStatus
  statusLabel: string
  createdAt: string
  timeStr: string
  dateStr: string
  technicianNote?: string
  managerNote?: string
  assignedTech?: string
  resolvedAt?: string
  adjustedAmount?: number
}

const STORAGE_KEY = "dms_utility_disputes_v1"
const EVENT_NAME = "dms_utility_disputes_updated"
const CHANNEL_NAME = "dms_utility_disputes_channel"

let broadcastChannel: BroadcastChannel | null = null
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
  }
} catch {
  // BroadcastChannel unavailable
}

export const INITIAL_DISPUTES: UtilityDispute[] = [
  {
    id: "KN-2026-001",
    room: "A205",
    building: "Tòa A",
    studentName: "Trần Bảo Nam",
    studentId: "SE185240",
    studentPhone: "0912 345 678",
    utilityType: "ELECTRIC",
    utilityTypeLabel: "Chỉ số Điện (Nghi ngờ rò rỉ hoặc ghi nhầm)",
    description:
      "Tháng này buồng B đi học quân sự vắng 1 tuần nhưng lượng điện tiêu thụ tăng thêm 60 kWh. Nghi ngờ có rò rỉ điện ở dàn nóng điều hòa hoặc ghi nhầm công tơ.",
    month: "Tháng 09/2026",
    status: "PENDING",
    statusLabel: "Chờ tiếp nhận",
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    timeStr: "15:20",
    dateStr: "04/11/2026",
  },
  {
    id: "KN-2026-002",
    room: "A203",
    building: "Tòa A",
    studentName: "Phạm Quốc Bảo",
    studentId: "SE183421",
    studentPhone: "0934 889 900",
    utilityType: "WATER",
    utilityTypeLabel: "Chỉ số Nước (Nghi ngờ van nước phòng hở)",
    description:
      "Vòi xịt vệ sinh phòng A203 bị rỉ nước liên tục trong 3 ngày trước khi KTV sửa xong, mong BQL kiểm tra trừ bớt khối nước rò rỉ.",
    month: "Tháng 09/2026",
    status: "INSPECTING",
    statusLabel: "Đang kiểm tra",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    timeStr: "10:15",
    dateStr: "03/11/2026",
    assignedTech: "Đỗ Mạnh Hùng",
    technicianNote: "Đang đối chiếu số đo đồng hồ nhánh tầng 2 và van phòng A203.",
  },
]

function getStatusLabel(status: UtilityDisputeStatus): string {
  switch (status) {
    case "PENDING":
      return "Chờ tiếp nhận"
    case "INSPECTING":
      return "Đang kiểm tra"
    case "RESOLVED":
      return "Đã giải quyết"
    case "REJECTED":
      return "Từ chối"
    default:
      return status
  }
}

/**
 * Get all disputes from storage or defaults
 */
export function getDisputes(): UtilityDispute[] {
  if (typeof window === "undefined") return INITIAL_DISPUTES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DISPUTES))
      return INITIAL_DISPUTES
    }
    return JSON.parse(raw) as UtilityDispute[]
  } catch {
    return INITIAL_DISPUTES
  }
}

/**
 * Save disputes and notify subscribers
 */
function saveDisputes(list: UtilityDispute[], latest?: UtilityDispute) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { disputes: list, latest },
      })
    )
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: "DISPUTES_UPDATED",
        disputes: list,
        latest,
      })
    }
  } catch (err) {
    console.warn("[UtilityDisputeService] Storage error:", err)
  }
}

/**
 * Get disputes for a specific room
 */
export function getDisputesByRoom(room: string): UtilityDispute[] {
  const all = getDisputes()
  return all.filter((d) => d.room.toUpperCase() === room.toUpperCase())
}

/**
 * Create a new dispute (Sinh viên gửi khiếu nại)
 */
export function createUtilityDispute(params: {
  room: string
  building?: string
  studentName: string
  studentId: string
  studentPhone?: string
  utilityType: UtilityDisputeType
  utilityTypeLabel: string
  description: string
  month?: string
}): UtilityDispute {
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  const dateStr = now.toLocaleDateString("vi-VN")
  const randomSuffix = Math.floor(100 + Math.random() * 900)

  const newDispute: UtilityDispute = {
    id: `KN-2026-${randomSuffix}`,
    room: params.room,
    building: params.building || "Tòa A",
    studentName: params.studentName,
    studentId: params.studentId,
    studentPhone: params.studentPhone || "0912 345 678",
    utilityType: params.utilityType,
    utilityTypeLabel: params.utilityTypeLabel,
    description: params.description,
    month: params.month || "Tháng 09/2026",
    status: "PENDING",
    statusLabel: "Chờ tiếp nhận",
    createdAt: now.toISOString(),
    timeStr,
    dateStr,
  }

  const existing = getDisputes()
  const updated = [newDispute, ...existing]
  saveDisputes(updated, newDispute)

  // 1. Gửi thông báo tới Ban Quản Lý (Manager)
  addNotification({
    title: `⚡ Khiếu nại số đo điện nước - Phòng ${newDispute.room}`,
    content: `Sinh viên ${newDispute.studentName} (${newDispute.studentId}) vừa gửi đơn khiếu nại về [${newDispute.utilityTypeLabel}] cho Phòng ${newDispute.room}. Lý do: "${newDispute.description.slice(0, 100)}...". Vui lòng xem xét và giao Kỹ thuật viên đối soát.`,
    type: "MAINTENANCE",
    priority: "urgent",
    targetRole: "manager",
    targetRoom: newDispute.room,
    sender: `${newDispute.studentName} (Phòng ${newDispute.room})`,
    actionUrl: "/billing",
    actionLabel: "Xem khiếu nại",
  })

  // 2. Gửi thông báo tới Kỹ Thuật Viên (Technician)
  addNotification({
    title: `🔧 Yêu cầu đối soát công tơ - Phòng ${newDispute.room}`,
    content: `Phòng ${newDispute.room} có khiếu nại về [${newDispute.utilityTypeLabel}]. Kỹ thuật viên phụ trách Tòa A vui lòng kiểm tra lại số đo đồng hồ và đối chiếu hình ảnh công tơ thực tế.`,
    type: "MAINTENANCE",
    priority: "high",
    targetRole: "technician",
    targetRoom: newDispute.room,
    sender: "Ban Quản Lý KTX",
    actionUrl: "/billing",
    actionLabel: "Ghi lại chỉ số",
  })

  return newDispute
}

/**
 * Assign technician or change dispute to INSPECTING
 */
export function assignTechnicianToDispute(
  disputeId: string,
  techName: string = "Đỗ Mạnh Hùng"
): UtilityDispute | null {
  const all = getDisputes()
  const idx = all.findIndex((d) => d.id === disputeId)
  if (idx === -1) return null

  const updatedItem: UtilityDispute = {
    ...all[idx],
    status: "INSPECTING",
    statusLabel: "Đang kiểm tra",
    assignedTech: techName,
  }

  all[idx] = updatedItem
  saveDisputes(all, updatedItem)

  // Thông báo tới sinh viên phòng này
  addNotification({
    title: `🔍 BQL đã tiếp nhận khiếu nại - Phòng ${updatedItem.room}`,
    content: `Khiếu nại số đo của phòng bạn đã được giao cho Kỹ thuật viên ${techName} tiến hành đối soát và kiểm tra đồng hồ công tơ thực tế trong vòng 24 giờ.`,
    type: "MAINTENANCE",
    priority: "normal",
    targetRole: "student",
    targetRoom: updatedItem.room,
    sender: "Ban Quản Lý KTX",
  })

  return updatedItem
}

/**
 * Resolve or reject dispute
 */
export function resolveUtilityDispute(params: {
  disputeId: string
  status: "RESOLVED" | "REJECTED"
  note: string
  adjustedAmount?: number
  resolvedBy?: string
}): UtilityDispute | null {
  const all = getDisputes()
  const idx = all.findIndex((d) => d.id === params.disputeId)
  if (idx === -1) return null

  const target = all[idx]
  const isResolved = params.status === "RESOLVED"
  const now = new Date()

  const updatedItem: UtilityDispute = {
    ...target,
    status: params.status,
    statusLabel: getStatusLabel(params.status),
    managerNote: params.note,
    technicianNote: target.technicianNote || params.note,
    resolvedAt: now.toISOString(),
    adjustedAmount: params.adjustedAmount,
  }

  all[idx] = updatedItem
  saveDisputes(all, updatedItem)

  // Thông báo kết quả tới Sinh viên phòng đó
  addNotification({
    title: isResolved
      ? `✅ Khiếu nại số đo điện nước Phòng ${target.room} đã được giải quyết`
      : `ℹ️ Kết quả kiểm định số đo điện nước Phòng ${target.room}`,
    content: isResolved
      ? `BQL KTX đã chấp thuận khiếu nại phòng ${target.room}. ${params.note}${
          params.adjustedAmount ? ` Số tiền điều chỉnh giảm: ₫${params.adjustedAmount.toLocaleString()}.` : ""
        }`
      : `BQL KTX và KTV đã đối soát công tơ phòng ${target.room}. Kết luận: ${params.note}. Số đo được ghi nhận chính xác theo quy chuẩn.`,
    type: "MAINTENANCE",
    priority: isResolved ? "high" : "normal",
    targetRole: "student",
    targetRoom: target.room,
    sender: params.resolvedBy || "Vũ Thành Nam (Trưởng BQL KTX)",
    actionUrl: "/billing",
    actionLabel: "Kiểm tra hóa đơn",
  })

  return updatedItem
}

/**
 * Technician submits meter re-check notes
 */
export function submitTechnicianInspection(params: {
  disputeId: string
  technicianNote: string
  newElec?: number
  newWater?: number
}): UtilityDispute | null {
  const all = getDisputes()
  const idx = all.findIndex((d) => d.id === params.disputeId)
  if (idx === -1) return null

  const updatedItem: UtilityDispute = {
    ...all[idx],
    status: "INSPECTING",
    statusLabel: "Đã đối soát xong",
    technicianNote: params.technicianNote,
  }

  all[idx] = updatedItem
  saveDisputes(all, updatedItem)

  // Thông báo tới BQL
  addNotification({
    title: `📋 KTV đã đối soát xong công tơ Phòng ${updatedItem.room}`,
    content: `Kỹ thuật viên đã kiểm tra lại số đo phòng ${updatedItem.room}. Kết quả: "${params.technicianNote}". Quản lý vui lòng xác nhận kết quả xử lý.`,
    type: "MAINTENANCE",
    priority: "high",
    targetRole: "manager",
    targetRoom: updatedItem.room,
    sender: "Đỗ Mạnh Hùng (KTV)",
    actionUrl: "/billing",
    actionLabel: "Duyệt xử lý",
  })

  return updatedItem
}

/**
 * Subscribe to real-time changes
 */
export function subscribeDisputes(
  callback: (disputes: UtilityDispute[], latest?: UtilityDispute) => void
): () => void {
  const handleLocal = (e: Event) => {
    const custom = e as CustomEvent<{ disputes: UtilityDispute[]; latest?: UtilityDispute }>
    callback(custom.detail?.disputes || getDisputes(), custom.detail?.latest)
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getDisputes())
    }
  }

  const handleMessage = (e: MessageEvent) => {
    if (e.data?.type === "DISPUTES_UPDATED") {
      callback(e.data.disputes || getDisputes(), e.data.latest)
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener(EVENT_NAME, handleLocal)
    window.addEventListener("storage", handleStorage)
    if (broadcastChannel) {
      broadcastChannel.addEventListener("message", handleMessage)
    }
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener(EVENT_NAME, handleLocal)
      window.removeEventListener("storage", handleStorage)
      if (broadcastChannel) {
        broadcastChannel.removeEventListener("message", handleMessage)
      }
    }
  }
}

