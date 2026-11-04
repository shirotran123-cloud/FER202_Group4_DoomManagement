/**
 * Real-time System Notification Service
 * Manages notifications across the entire application, including:
 * - Utility e-Invoice Publishing (Phát hành hóa đơn điện nước)
 * - Payment Reminders (Nhắc nhở nộp tiền điện nước)
 * - Curfew & Gate Pass Notifications (Giờ giới nghiêm & Ra vào cổng)
 * - Facility Maintenance & Tickets (Báo hỏng & Tiến độ sửa chữa)
 * Synchronizes in real-time across browser tabs via localStorage, CustomEvents, and BroadcastChannel.
 */

export type NotificationType =
  | "INVOICE_PUBLISHED"
  | "PAYMENT_REMINDER"
  | "LATE_CURFEW"
  | "CURFEW"
  | "MAINTENANCE"
  | "SYSTEM"

export type NotificationPriority = "urgent" | "high" | "normal"

export interface SystemNotification {
  id: string
  title: string
  content: string
  type: NotificationType
  priority: NotificationPriority
  createdAt: string // ISO string
  timeStr: string // "14:30"
  dateStr: string // "04/11/2026"
  isRead: boolean
  targetRole?: "all" | "student" | "manager" | "technician"
  targetRoom?: string // e.g. "A205" or "ALL"
  sender?: string
  actionUrl?: string
  actionLabel?: string
  metadata?: {
    period?: string
    room?: string
    amount?: number
    dueDate?: string
    invoiceCode?: string
    [key: string]: any
  }
}

const STORAGE_KEY = "dms_system_notifications_v1"
const CHANNEL_NAME = "dms_notifications_channel"
const EVENT_NAME = "dms_notifications_updated"

// Initial sample notifications
export const DEFAULT_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "NOTIF-001",
    title: "Nhắc nhở giờ giới nghiêm 23:00",
    content: "Cổng chính KTX sẽ đóng lúc 23:00. Sinh viên vui lòng về phòng trước giờ quy định hoặc gửi đơn xin về muộn.",
    type: "CURFEW",
    priority: "normal",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    timeStr: "22:00",
    dateStr: "Hôm nay",
    isRead: false,
    targetRole: "student",
    actionUrl: "/mobile",
    actionLabel: "Xem thẻ vào cổng & Xin phép",
  },
  {
    id: "NOTIF-002",
    title: "Tiến độ bảo trì buồng B phòng A205",
    content: "Yêu cầu thay bóng đèn LED buồng B phòng A205 (MT-2026-004) đã được Kỹ thuật viên hoàn tất nghiệm thu.",
    type: "MAINTENANCE",
    priority: "normal",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    timeStr: "16:20",
    dateStr: "Hôm nay",
    isRead: true,
    targetRole: "student",
    actionUrl: "/maintenance",
    actionLabel: "Xem chi tiết phiếu sửa",
  },
]

// Singleton BroadcastChannel for multi-tab synchronization
let broadcastChannel: BroadcastChannel | null = null
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
  } catch {
    broadcastChannel = null
  }
}

/**
 * Get all notifications from localStorage
 */
export function getNotifications(): SystemNotification[] {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS))
      return DEFAULT_NOTIFICATIONS
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return DEFAULT_NOTIFICATIONS
    return parsed
  } catch {
    return DEFAULT_NOTIFICATIONS
  }
}

/**
 * Filter notifications for current user role and room
 */
export function getUserNotifications(
  userRole?: string,
  userRoom?: string
): SystemNotification[] {
  const all = getNotifications()
  return all.filter((n) => {
    // Role filter
    if (n.targetRole && n.targetRole !== "all") {
      if (userRole === "student" && n.targetRole !== "student") return false
    }
    // Room filter
    if (n.targetRoom && n.targetRoom !== "ALL" && userRoom) {
      if (n.targetRoom.toLowerCase() !== userRoom.toLowerCase()) return false
    }
    return true
  })
}

/**
 * Get count of unread notifications for user
 */
export function getUnreadCount(userRole?: string, userRoom?: string): number {
  const list = getUserNotifications(userRole, userRoom)
  return list.filter((n) => !n.isRead).length
}

/**
 * Notify subscribers across tabs and windows
 */
function notifyUpdate(
  notifications: SystemNotification[],
  latest?: SystemNotification
) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { notifications, latest },
      })
    )
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: "NOTIFICATIONS_UPDATED",
        notifications,
        latest,
      })
    }
  } catch (e) {
    console.warn("[NotificationService] Sync notification error:", e)
  }
}

/**
 * Add a new notification
 */
export function addNotification(
  params: Omit<SystemNotification, "id" | "createdAt" | "timeStr" | "dateStr" | "isRead">
): SystemNotification {
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  const dateStr = now.toLocaleDateString("vi-VN")
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)

  const newNotif: SystemNotification = {
    ...params,
    id: `NOTIF-${now.getFullYear()}-${randomSuffix}`,
    createdAt: now.toISOString(),
    timeStr,
    dateStr,
    isRead: false,
  }

  const existing = getNotifications()
  const updated = [newNotif, ...existing]
  notifyUpdate(updated, newNotif)

  return newNotif
}

/**
 * ACTION: BAN QUẢN LÝ PHÁT HÀNH HÓA ĐƠN ĐIỆN NƯỚC (INVOICE PUBLISHED)
 * Dispatches real-time notification to all students in building/room!
 */
export function publishUtilityInvoice(params: {
  period?: string
  room?: string
  building?: string
  totalBill?: number
  perStudentAmount?: number
  dueDate?: string
  issuedBy?: string
}): SystemNotification {
  const period = params.period || "Tháng 09/2026"
  const room = params.room || "A205"
  const building = params.building || "Tòa A"
  const perStudent = params.perStudentAmount || 167500
  const dueDate = params.dueDate || "05/10/2026"
  const issuedBy = params.issuedBy || "Vũ Thành Nam (Trưởng BQL KTX)"

  const newNotif = addNotification({
    title: `⚡ Phát hành hóa đơn điện nước kỳ ${period}`,
    content: `Ban Quản lý KTX (${issuedBy}) vừa phát hành hóa đơn điện nước kỳ ${period} cho ${building} - Phòng ${room}. Số tiền cần đóng: ₫${perStudent.toLocaleString()} / sinh viên. Hạn thanh toán: ${dueDate}. Vui lòng kiểm tra và quét mã VietQR để thanh toán trực tuyến.`,
    type: "INVOICE_PUBLISHED",
    priority: "high",
    targetRole: "student",
    targetRoom: room,
    sender: issuedBy,
    actionUrl: "/billing",
    actionLabel: "Kiểm tra & Thanh toán VietQR",
    metadata: {
      period,
      room,
      building,
      amount: perStudent,
      totalBill: params.totalBill,
      dueDate,
      issuedBy,
      invoiceCode: `INV-2026-09-${room}`,
    },
  })

  return newNotif
}

/**
 * ACTION: BAN QUẢN LÝ GỬI NHẮC NHỞ NỘP TIỀN ĐIỆN NƯỚC (PAYMENT REMINDER)
 * Dispatches urgent reminder notification to students with pending debt!
 */
export function sendPaymentReminder(params: {
  period?: string
  room?: string
  building?: string
  amount?: number
  dueDate?: string
  sentBy?: string
  remainingCount?: number
}): SystemNotification {
  const period = params.period || "Tháng 09/2026"
  const room = params.room || "A205"
  const amount = params.amount || 167500
  const dueDate = params.dueDate || "05/10/2026"
  const sentBy = params.sentBy || "Ban Quản Lý KTX Tòa A"
  const remaining = params.remainingCount || 14

  const newNotif = addNotification({
    title: `🚨 Nhắc nhở thanh toán tiền điện nước ${period}`,
    content: `Ban Quản lý KTX nhắc nhở: Hiện còn ${remaining} sinh viên (bao gồm phòng ${room}) chưa hoàn tất thanh toán tiền điện nước kỳ ${period} (₫${amount.toLocaleString()}). Hạn chót thanh toán là ${dueDate}. Vui lòng thanh toán sớm để đảm bảo quyền lợi lưu trú!`,
    type: "PAYMENT_REMINDER",
    priority: "urgent",
    targetRole: "student",
    targetRoom: room,
    sender: sentBy,
    actionUrl: "/billing",
    actionLabel: "Thanh toán ngay bằng VietQR",
    metadata: {
      period,
      room,
      amount,
      dueDate,
      sentBy,
      remainingCount: remaining,
    },
  })

  return newNotif
}

/**
 * Mark a single notification as read
 */
export function markAsRead(id: string): void {
  const all = getNotifications()
  const updated = all.map((n) => (n.id === id ? { ...n, isRead: true } : n))
  notifyUpdate(updated)
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): void {
  const all = getNotifications()
  const updated = all.map((n) => ({ ...n, isRead: true }))
  notifyUpdate(updated)
}

/**
 * Reset to default initial notifications
 */
export function resetNotifications(): SystemNotification[] {
  notifyUpdate(DEFAULT_NOTIFICATIONS)
  return DEFAULT_NOTIFICATIONS
}

/**
 * Subscribe to real-time notification updates across tabs and views
 */
export function subscribeNotifications(
  callback: (notifications: SystemNotification[], latest?: SystemNotification) => void
): () => void {
  if (typeof window === "undefined") return () => {}

  const handleLocal = (e: Event) => {
    const customEvent = e as CustomEvent<{
      notifications: SystemNotification[]
      latest?: SystemNotification
    }>
    callback(
      customEvent.detail?.notifications || getNotifications(),
      customEvent.detail?.latest
    )
  }

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === "NOTIFICATIONS_UPDATED") {
      callback(e.data.notifications || getNotifications(), e.data.latest)
    }
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      const all = getNotifications()
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
