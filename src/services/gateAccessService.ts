import { getSupabase } from "@/lib/supabase"
import { SEED_STUDENTS } from "@/data/supabaseSeedData"

export type GateDirection = "IN" | "OUT"
export type GateScanStatus = "success" | "warning" | "danger"

export interface GateAccessRecord {
  id: string
  studentId: string
  studentName: string
  room: string
  bedCode?: string
  building?: string
  avatar?: string
  direction: GateDirection // "IN" (Vào KTX) | "OUT" (Ra ngoài)
  timestamp: string // ISO string
  timeStr: string // "21:35:12"
  dateStr: string // "30/10/2026"
  status: GateScanStatus
  message: string
  gateName: string
  hmacToken?: string
  source?: "student_app" | "guard_scanner" | "turnstile"
  reason?: string
}

const STORAGE_KEY = "dms_gate_access_logs"
const CHANNEL_NAME = "dms_gate_access_channel"
const EVENT_NAME = "dms_gate_access_updated"

// Initial sample logs
const DEFAULT_LOGS: GateAccessRecord[] = [
  {
    id: "GATE-0912",
    studentId: "SE182049",
    studentName: "Nguyễn Hoàng Vinh",
    room: "A205",
    bedCode: "A205-B-G03",
    building: "Tòa A (Khu Nam)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    direction: "IN",
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    timeStr: new Date(Date.now() - 8 * 60 * 1000).toLocaleTimeString("vi-VN"),
    dateStr: new Date().toLocaleDateString("vi-VN"),
    status: "success",
    message: "HỢP LỆ · CỬA XOAY ĐÃ MỞ (0.3s)",
    gateName: "Cổng chính Tòa A (Turnstile 01)",
    hmacToken: "HMAC-9X82FA",
    source: "student_app",
  },
  {
    id: "GATE-0911",
    studentId: "SE181102",
    studentName: "Lê Tuấn Nam",
    room: "A205",
    bedCode: "A205-B-G02",
    building: "Tòa A (Khu Nam)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    direction: "OUT",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    timeStr: new Date(Date.now() - 25 * 60 * 1000).toLocaleTimeString("vi-VN"),
    dateStr: new Date().toLocaleDateString("vi-VN"),
    status: "success",
    message: "HỢP LỆ · XÁC NHẬN RA NGOÀI KTX",
    gateName: "Cổng chính Tòa A (Turnstile 02)",
    hmacToken: "HMAC-3A79CB",
    source: "student_app",
  },
  {
    id: "GATE-0910",
    studentId: "SE174201",
    studentName: "Trần Minh Quân",
    room: "A205",
    bedCode: "A205-B-G01",
    building: "Tòa A (Khu Nam)",
    direction: "IN",
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    timeStr: new Date(Date.now() - 50 * 60 * 1000).toLocaleTimeString("vi-VN"),
    dateStr: new Date().toLocaleDateString("vi-VN"),
    status: "warning",
    message: "VỀ MUỘN CÓ PHÉP (ĐÃ DUYỆT ĐƠN #LAT-0988) · MỜI VÀO",
    gateName: "Cổng chính Tòa A (Turnstile 01)",
    hmacToken: "HMAC-2L89EE",
    source: "guard_scanner",
    reason: "Học nhóm đồ án Capstone",
  },
  {
    id: "GATE-0909",
    studentId: "SE160999",
    studentName: "Lê Quốc Bảo",
    room: "A102",
    bedCode: "A102-A-G02",
    building: "Tòa A (Khu Nam)",
    direction: "IN",
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    timeStr: new Date(Date.now() - 90 * 60 * 1000).toLocaleTimeString("vi-VN"),
    dateStr: new Date().toLocaleDateString("vi-VN"),
    status: "danger",
    message: "CHƯA XIN PHÉP VỀ MUỘN · GIỮ LẠI XÁC MINH AN NINH",
    gateName: "Cổng phụ Tòa A (Cổng Đêm)",
    hmacToken: "HMAC-EXPIRED",
    source: "guard_scanner",
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
 * Get all gate access logs from localStorage
 */
export function getGateLogs(): GateAccessRecord[] {
  if (typeof window === "undefined") return DEFAULT_LOGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LOGS))
      return DEFAULT_LOGS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : DEFAULT_LOGS
  } catch {
    return DEFAULT_LOGS
  }
}

/**
 * Get gate logs filtered for a specific student ID
 */
export function getStudentGateLogs(studentId: string): GateAccessRecord[] {
  const all = getGateLogs()
  return all.filter((l) => l.studentId.toLowerCase() === studentId.toLowerCase())
}

/**
 * Record a new gate scan event.
 * Syncs to localStorage, dispatches window custom event, broadcasts cross-tab,
 * and asynchronously saves to Supabase (if connected).
 */
export function recordGateScan(
  params: {
    studentId: string
    studentName: string
    room: string
    bedCode?: string
    building?: string
    avatar?: string
    direction: GateDirection
    status?: GateScanStatus
    message?: string
    gateName?: string
    hmacToken?: string
    source?: "student_app" | "guard_scanner" | "turnstile"
    reason?: string
  }
): GateAccessRecord {
  const now = new Date()
  const timeStr = now.toLocaleTimeString("vi-VN")
  const dateStr = now.toLocaleDateString("vi-VN")
  const hours = now.getHours()
  const minutes = now.getMinutes()

  // Auto-detect status if not explicitly provided
  let detectedStatus: GateScanStatus = params.status || "success"
  let detectedMessage = params.message

  if (!params.status) {
    if (params.direction === "IN") {
      // Check curfew (23:00)
      const isPastCurfew = hours >= 23 || (hours === 23 && minutes >= 0) || hours < 5
      if (isPastCurfew) {
        if (params.reason) {
          detectedStatus = "warning"
          detectedMessage = `VỀ MUỘN CÓ PHÉP (${params.reason}) · MỜI VÀO`
        } else {
          detectedStatus = "warning"
          detectedMessage = "VỀ SAU GIỜ GIỚI NGHIÊM 23:00 · ĐÃ GHI NHẬN HỆ THỐNG"
        }
      } else {
        detectedStatus = "success"
        detectedMessage = "HỢP LỆ · CỬA XOAY ĐÃ MỞ (0.3s)"
      }
    } else {
      detectedStatus = "success"
      detectedMessage = "HỢP LỆ · XÁC NHẬN RA NGOÀI KTX"
    }
  }

  const newRecord: GateAccessRecord = {
    id: "GATE-" + Date.now().toString().slice(-6),
    studentId: params.studentId,
    studentName: params.studentName,
    room: params.room,
    bedCode: params.bedCode || `${params.room}-B-G03`,
    building: params.building || "Tòa A (Khu Nam)",
    avatar: params.avatar,
    direction: params.direction,
    timestamp: now.toISOString(),
    timeStr,
    dateStr,
    status: detectedStatus,
    message: detectedMessage || (detectedStatus === "success" ? "HỢP LỆ · CỬA ĐÃ MỞ" : "CẢNH BÁO"),
    gateName: params.gateName || "Cổng chính Tòa A (Turnstile 01)",
    hmacToken: params.hmacToken || "HMAC-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    source: params.source || "student_app",
    reason: params.reason,
  }

  // 1. Save to localStorage
  if (typeof window !== "undefined") {
    try {
      const existing = getGateLogs()
      const updated = [newRecord, ...existing.slice(0, 49)] // Keep latest 50
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn("[GateAccess] Error saving to localStorage:", e)
    }

    // 2. Dispatch window event for same-tab instant listeners
    try {
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, {
          detail: { newRecord },
        })
      )
    } catch (e) {
      console.warn("[GateAccess] Error dispatching window event:", e)
    }

    // 3. Broadcast to other tabs
    try {
      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: "NEW_SCAN",
          record: newRecord,
        })
      }
    } catch (e) {
      console.warn("[GateAccess] Error broadcasting channel:", e)
    }
  }

  // 4. Asynchronously push to Supabase if connected
  try {
    const supabase = getSupabase()
    if (supabase) {
      Promise.resolve(
        supabase
          .from("gate_access_logs")
          .insert([
            {
              id: newRecord.id,
              student_id: newRecord.studentId,
              student_name: newRecord.studentName,
              room: newRecord.room,
              bed_code: newRecord.bedCode,
              direction: newRecord.direction,
              status: newRecord.status,
              message: newRecord.message,
              gate_name: newRecord.gateName,
              hmac_token: newRecord.hmacToken,
            },
          ])
      )
        .then((res: any) => {
          if (res?.error) {
            // Silently fallback if table not yet created
            console.debug("[Supabase] gate_access_logs push note:", res.error.message)
          }
        })
        .catch(() => {})
    }
  } catch {}

  return newRecord
}

/**
 * Subscribe to real-time gate scan updates.
 * Fires whenever a new scan is recorded anywhere in the application.
 */
export function subscribeGateLogs(
  callback: (logs: GateAccessRecord[], latestRecord?: GateAccessRecord) => void
): () => void {
  if (typeof window === "undefined") return () => {}

  // Local window event listener
  const handleLocalEvent = (e: Event) => {
    const customEvent = e as CustomEvent<{ newRecord: GateAccessRecord }>
    const logs = getGateLogs()
    callback(logs, customEvent.detail?.newRecord)
  }

  // BroadcastChannel message listener
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === "NEW_SCAN") {
      const logs = getGateLogs()
      callback(logs, event.data.record)
    }
  }

  // Standard storage listener fallback
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      const logs = getGateLogs()
      callback(logs, logs[0])
    }
  }

  window.addEventListener(EVENT_NAME, handleLocalEvent)
  window.addEventListener("storage", handleStorage)
  if (broadcastChannel) {
    broadcastChannel.addEventListener("message", handleBroadcast)
  }

  // Return unsubscribe cleanup function
  return () => {
    window.removeEventListener(EVENT_NAME, handleLocalEvent)
    window.removeEventListener("storage", handleStorage)
    if (broadcastChannel) {
      broadcastChannel.removeEventListener("message", handleBroadcast)
    }
  }
}

/**
 * Clear all gate access history (resets to empty or default)
 */
export function resetGateLogs(): GateAccessRecord[] {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LOGS))
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { newRecord: DEFAULT_LOGS[0] } }))
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: "NEW_SCAN", record: DEFAULT_LOGS[0] })
    }
  }
  return DEFAULT_LOGS
}

/**
 * Calculate gate statistics
 */
export function getGateStats() {
  const logs = getGateLogs()
  const todayStr = new Date().toLocaleDateString("vi-VN")
  const todayLogs = logs.filter((l) => l.dateStr === todayStr)

  const inCount = todayLogs.filter((l) => l.direction === "IN").length
  const outCount = todayLogs.filter((l) => l.direction === "OUT").length
  const warningCount = todayLogs.filter((l) => l.status === "warning" || l.status === "danger").length

  return {
    totalScansToday: todayLogs.length || 842,
    inToday: inCount,
    outToday: outCount,
    currentlyOutside: Math.max(0, 48 + outCount - inCount),
    warningCount,
  }
}

/**
 * List of registered dormitory students for guard selection
 */
export function getAvailableDormStudents() {
  return SEED_STUDENTS.map((s) => ({
    studentId: s.student_id,
    fullName: s.full_name,
    room: s.room,
    bedCode: s.bed_code,
    building: s.building,
    status: s.status,
  }))
}
