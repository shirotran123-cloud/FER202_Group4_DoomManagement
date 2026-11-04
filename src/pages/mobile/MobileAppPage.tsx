import React, { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { Button } from "@/components/ui/button"
import {
  QrCode,
  Camera,
  Clock,
  Receipt,
  Wrench,
  CheckCircle2,
  RotateCw,
  Sun,
  Send,
  Copy,
  Check,
  CheckCheck,
  Flame,
  Radio,
  LogIn,
  LogOut,
  Search,
  RefreshCw,
  DoorOpen,
  Sparkles,
  Users,
  XCircle,
  ShieldCheck,
} from "lucide-react"
import { Bell as AnimatedBell } from "@/components/animate-ui/icons/bell"
import {
  recordGateScan,
  getGateLogs,
  getStudentGateLogs,
  subscribeGateLogs,
  resetGateLogs,
  getGateStats,
  getAvailableDormStudents,
  type GateAccessRecord,
  type GateDirection,
  type GateScanStatus,
} from "@/services/gateAccessService"
import {
  getLateRequests,
  createLateRequest,
  approveLateRequest,
  rejectLateRequest,
  resetLateRequests,
  subscribeLateRequests,
  type LateCurfewRequest,
} from "@/services/lateRequestService"
import {
  getUserNotifications,
  subscribeNotifications,
  markAllAsRead,
  markAsRead,
  type SystemNotification,
} from "@/services/notificationService"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

type SubTab = "vietqr" | "repair"

export const MobileAppPage: React.FC = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  // App mode determined automatically by user role or demo switch override
  const paramRole = searchParams.get("role")
  const initialRoleOverride =
    paramRole === "guard"
      ? "guard"
      : paramRole === "student"
        ? "student"
        : null
  const [roleOverride, setRoleOverride] = useState<"student" | "guard" | null>(
    initialRoleOverride
  )
  const appRole =
    roleOverride ||
    (user?.role === "manager" || user?.role === "admin" ? "guard" : "student")

  const [subTab, setSubTab] = useState<SubTab>("vietqr")

  // Current Student Identity
  const studentName = user?.fullName || "Trần Thanh Nguyên"
  const studentId = user?.studentId || "SE185240"
  const room = user?.dormitoryStatus?.room || "A205"
  const building = user?.dormitoryStatus?.building || "Tòa A (Khu Nam)"
  const bedCode = user?.dormitoryStatus?.bedCode || "A205-B-G03"
  const compartment = user?.dormitoryStatus?.compartment || "Buồng B (Balcony Wing)"
  const avatar =
    user?.avatar ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"

  // Student specific controls
  const [studentDirection, setStudentDirection] = useState<GateDirection>("IN")
  const [studentRecentLogs, setStudentRecentLogs] = useState<GateAccessRecord[]>(() =>
    getStudentGateLogs(studentId)
  )

  // Clock & countdown state
  const [currentTime, setCurrentTime] = useState(new Date())
  const [qrCountdown, setQrCountdown] = useState(60)
  const [qrToken, setQrToken] = useState(
    () => "HMAC-" + Math.random().toString(36).substring(2, 10).toUpperCase()
  )
  const [curfewCountdown, setCurfewCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Interactive feedback states
  const [gateOpenSuccess, setGateOpenSuccess] = useState(false)
  const [lastScannedRecord, setLastScannedRecord] = useState<GateAccessRecord | null>(null)
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [toastAlert, setToastAlert] = useState<string | null>(null)

  // Camera Quick Repair state
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [repairCategory, setRepairCategory] = useState("dien")
  const [repairNote, setRepairNote] = useState("")
  const [repairSubmitted, setRepairSubmitted] = useState(false)

  // =========================================================================
  // REAL-TIME LATE CURFEW REQUESTS STATE (SYNCHRONIZED TWO-WAY)
  // =========================================================================
  const [lateRequests, setLateRequests] = useState<LateCurfewRequest[]>(() =>
    getLateRequests()
  )
  const [lateReason, setLateReason] = useState<
    "do_an" | "lam_them" | "xe_bus" | "dot_xuat"
  >("do_an")
  const [expectedTime, setExpectedTime] = useState("23:45")
  const [lateNote, setLateNote] = useState("")
  const [lateSubmitted, setLateSubmitted] = useState(false)
  const [studentAlertNotice, setStudentAlertNotice] = useState<{
    type: "success" | "danger" | "info"
    message: string
  } | null>(null)

  // Guard / Manager Review & Rejection Modal State
  const [guardLateFilter, setGuardLateFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL")
  const [guardLateSearch, setGuardLateSearch] = useState<string>("")
  const [rejectModalItem, setRejectModalItem] = useState<LateCurfewRequest | null>(null)
  const [rejectPreset, setRejectPreset] = useState<string>(
    "Quá giờ giới nghiêm tối đa quy định (sau 00:00)."
  )
  const [rejectReasonInput, setRejectReasonInput] = useState<string>("")

  // =========================================================================
  // GUARD / MANAGER SCANNER STATE (REAL-TIME SYNCED)
  // =========================================================================
  const [guardLogs, setGuardLogs] = useState<GateAccessRecord[]>(() => getGateLogs())
  const [latestGuardScan, setLatestGuardScan] = useState<GateAccessRecord | null>(() => {
    const logs = getGateLogs()
    return logs.length > 0 ? logs[0] : null
  })
  const [gateStats, setGateStats] = useState(() => getGateStats())
  const [selectedStudentId, setSelectedStudentId] = useState<string>(studentId)
  const [guardSearchQuery, setGuardSearchQuery] = useState<string>("")
  const [logFilter, setLogFilter] = useState<"ALL" | "IN" | "OUT" | "WARNING">("ALL")
  const [newScanAlert, setNewScanAlert] = useState<string | null>(null)
  const availableStudents = getAvailableDormStudents()

  // Real-time system notifications
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>(() =>
    getUserNotifications(appRole, room)
  )

  useEffect(() => {
    const unsubNotif = subscribeNotifications((list) => {
      setSystemNotifications(
        list.filter((n) => {
          if (n.targetRole && n.targetRole !== "all") {
            if (appRole === "student" && n.targetRole !== "student") return false
          }
          return true
        })
      )
    })
    return () => unsubNotif()
  }, [appRole, room])

  const unreadNotifCount = systemNotifications.filter((n) => !n.isRead).length

  const handleMobileMarkAllAsRead = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    markAllAsRead()
    setSystemNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const handleMobileMarkAsRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    markAsRead(id)
    setSystemNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  // Real-time synchronization subscription for late requests across tabs and roles
  useEffect(() => {
    const unsubscribeLate = subscribeLateRequests((requests, updatedItem) => {
      setLateRequests(requests)

      // Notify current student if their request was reviewed
      if (
        updatedItem &&
        (updatedItem.studentId || "").toLowerCase() === (studentId || "").toLowerCase()
      ) {
        if (updatedItem.status === "APPROVED") {
          setStudentAlertNotice({
            type: "success",
            message: `🎉 Ban Quản Lý (${updatedItem.reviewedBy || "Trưởng BQL"}) đã DUYỆT đơn xin về muộn #${updatedItem.id}! Mã thông hành: ${updatedItem.approvalCode}. Cửa xoay an ninh sẽ mở khi bạn quẹt thẻ.`,
          })
        } else if (updatedItem.status === "REJECTED") {
          setStudentAlertNotice({
            type: "danger",
            message: `⚠️ Ban Quản Lý (${updatedItem.reviewedBy || "Trưởng BQL"}) đã TỪ CHỐI đơn xin về muộn #${updatedItem.id}. Lý do: "${updatedItem.rejectReason}". Vui lòng sắp xếp về phòng trước 23:00.`,
          })
        }
      }
    })

    return () => {
      unsubscribeLate()
    }
  }, [studentId])

  // Real-time synchronization subscription across tabs and views
  useEffect(() => {
    const unsubscribe = subscribeGateLogs((logs, latest) => {
      setGuardLogs(logs)
      setGateStats(getGateStats())
      const safeId = (studentId || "").toLowerCase()
      setStudentRecentLogs(
        logs.filter((l) => (l?.studentId || "").toLowerCase() === safeId)
      )

      if (latest && latest.studentName) {
        setLatestGuardScan(latest)
        setNewScanAlert(
          `⚡ Vừa quẹt thẻ: ${latest.studentName || "Sinh viên"} (${latest.studentId || "---"}) · ${
            latest.direction === "IN" ? "CỔNG VÀO (IN)" : "CỔNG RA (OUT)"
          } lúc ${latest.timeStr || ""}`
        )
        setTimeout(() => setNewScanAlert(null), 5000)
      }
    })

    return () => unsubscribe()
  }, [studentId])

  // Live real-time clock
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)

      // Calculate time remaining to 23:00 curfew
      const curfewTime = new Date()
      curfewTime.setHours(23, 0, 0, 0)
      let diff = curfewTime.getTime() - now.getTime()
      if (diff < 0) {
        // If past 23:00, count to next day 23:00
        curfewTime.setDate(curfewTime.getDate() + 1)
        diff = curfewTime.getTime() - now.getTime()
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setCurfewCountdown({ hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(clockTimer)
  }, [])

  // Dynamic QR code timer countdown (60s loop) - pure decrement without state side effects
  useEffect(() => {
    const qrTimer = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(qrTimer)
  }, [])

  // Safely regenerate QR HMAC token when countdown cycles to 60
  const isFirstMount = React.useRef(true)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    if (qrCountdown === 60) {
      setQrToken("HMAC-" + Math.random().toString(36).substring(2, 10).toUpperCase())
    }
  }, [qrCountdown])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Refresh QR token manually
  const refreshQrManual = () => {
    setQrToken(
      "HMAC-" + Math.random().toString(36).substring(2, 10).toUpperCase()
    )
    setQrCountdown(60)
  }

  // =========================================================================
  // CALCULATED LATE REQUEST STATS & FILTERED LISTS
  // =========================================================================
  const studentLateList = lateRequests.filter(
    (r) => (r.studentId || "").toLowerCase() === (studentId || "").toLowerCase()
  )
  const pendingLateCount = lateRequests.filter((r) => r.status === "PENDING").length
  const approvedLateCount = lateRequests.filter((r) => r.status === "APPROVED").length
  const rejectedLateCount = lateRequests.filter((r) => r.status === "REJECTED").length

  const filteredGuardLateRequests = lateRequests.filter((req) => {
    if (!req) return false
    if (guardLateFilter === "PENDING" && req.status !== "PENDING") return false
    if (guardLateFilter === "APPROVED" && req.status !== "APPROVED") return false
    if (guardLateFilter === "REJECTED" && req.status !== "REJECTED") return false
    if (guardLateSearch.trim()) {
      const q = guardLateSearch.toLowerCase().trim()
      const sName = (req.studentName || "").toLowerCase()
      const sId = (req.studentId || "").toLowerCase()
      const sRoom = (req.room || "").toLowerCase()
      const sReason = (req.reasonTitle || "").toLowerCase()
      return (
        sName.includes(q) ||
        sId.includes(q) ||
        sRoom.includes(q) ||
        sReason.includes(q)
      )
    }
    return true
  })

  // =========================================================================
  // ACTION: STUDENT PASSES THROUGH GATE (REAL LOGIC & SYNC)
  // =========================================================================
  const handleStudentPassGate = () => {
    const latestApproved = studentLateList.find((r) => r.status === "APPROVED")
    const latestPending = studentLateList.find((r) => r.status === "PENDING")
    const latestRejected = studentLateList.find((r) => r.status === "REJECTED")

    let scanStatus: GateScanStatus = "success"
    let message = "HỢP LỆ · CỬA XOAY ĐÃ MỞ (0.3s)"
    let reasonText: string | undefined = undefined

    if (studentDirection === "IN") {
      if (latestApproved) {
        scanStatus = "warning"
        message = `VỀ MUỘN CÓ PHÉP (ĐÃ DUYỆT ĐƠN #${latestApproved.id} · MÃ: ${latestApproved.approvalCode}) · MỜI VÀO`
        reasonText = latestApproved.reasonTitle
      } else if (latestPending) {
        scanStatus = "warning"
        message = `ĐƠN #${latestPending.id} ĐANG CHỜ BQL DUYỆT · YÊU CẦU BẢO VỆ XÁC NHẬN`
        reasonText = `Chờ BQL duyệt: ${latestPending.reasonTitle}`
      } else if (latestRejected) {
        scanStatus = "danger"
        message = `ĐƠN VỀ MUỘN ĐÃ BỊ TỪ CHỐI (${latestRejected.rejectReason}) · GIỮ LẠI XÁC MINH`
        reasonText = `Bị từ chối: ${latestRejected.reasonTitle}`
      }
    }

    const record = recordGateScan({
      studentId,
      studentName,
      room,
      bedCode,
      building,
      avatar,
      direction: studentDirection,
      status: scanStatus,
      message,
      hmacToken: qrToken,
      source: "student_app",
      reason: reasonText,
    })

    setLastScannedRecord(record)
    setGateOpenSuccess(true)
    setTimeout(() => {
      setGateOpenSuccess(false)
    }, 4500)
  }

  // =========================================================================
  // ACTION: GUARD SCANS OR SIMULATES STUDENT GATE CHECK
  // =========================================================================
  const handleGuardExecuteScan = (
    targetStudentId: string,
    direction: GateDirection,
    forcedStatus?: GateScanStatus,
    customMessage?: string
  ) => {
    const found = availableStudents.find(
      (s) => s.studentId.toLowerCase() === targetStudentId.toLowerCase()
    )
    const isCurrent = targetStudentId.toLowerCase() === studentId.toLowerCase()

    const sName = found ? found.fullName : isCurrent ? studentName : `Sinh viên ${targetStudentId}`
    const sRoom = found ? found.room : isCurrent ? room : "A205"
    const sBed = found ? found.bedCode : isCurrent ? bedCode : "A205-B-G01"
    const sBuilding = found ? found.building : isCurrent ? building : "Tòa A (Khu Nam)"
    const sAvatar = isCurrent ? avatar : undefined

    let status: GateScanStatus = forcedStatus || "success"
    let message = customMessage

    if (!forcedStatus) {
      if (direction === "IN") {
        const h = currentTime.getHours()
        const targetReq = lateRequests.find(
          (r) =>
            (r.studentId || "").toLowerCase() === targetStudentId.toLowerCase() &&
            r.status === "APPROVED"
        )
        if (targetReq) {
          status = "warning"
          message = `VỀ MUỘN CÓ PHÉP (ĐÃ DUYỆT ĐƠN #${targetReq.id}) · MỜI VÀO`
        } else if (h >= 23 || h < 5) {
          status = "danger"
          message = "QUÁ GIỜ GIỚI NGHIÊM 23:00 (CHƯA ĐƯỢC DUYỆT ĐƠN) · GIỮ LẠI XÁC MINH"
        } else {
          status = "success"
          message = "HỢP LỆ · CỬA XOAY ĐÃ MỞ (0.3s)"
        }
      } else {
        status = "success"
        message = "HỢP LỆ · XÁC NHẬN RA NGOÀI KTX"
      }
    }

    const record = recordGateScan({
      studentId: targetStudentId,
      studentName: sName,
      room: sRoom,
      bedCode: sBed,
      building: sBuilding,
      avatar: sAvatar,
      direction,
      status,
      message,
      source: "guard_scanner",
    })

    setLatestGuardScan(record)
  }

  // Quick photo capture simulation
  const handleSimulateCapture = () => {
    setCapturedPhoto(
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
    )
  }

  // =========================================================================
  // SUBMIT LATE REQUEST (STUDENT ACTION -> SETS PENDING STATUS)
  // =========================================================================
  const handleLateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const reasonMap: Record<string, string> = {
      do_an: "Học nhóm đồ án Capstone K19 tại Thư viện / Lab",
      lam_them: "Làm thêm ca tối hỗ trợ sự kiện trường FPTU",
      xe_bus: "Chuyến xe buýt tuyến cuối khu CNC bị trễ",
      dot_xuat: "Việc cá nhân / gia đình phát sinh đột xuất",
    }

    const created = createLateRequest({
      studentId,
      studentName,
      room,
      bedCode,
      building,
      avatar,
      expectedTime,
      reasonCategory: lateReason,
      reasonTitle: reasonMap[lateReason] || "Xin phép về muộn",
      note: lateNote.trim() || undefined,
    })

    setLateSubmitted(true)
    setLateNote("")
    setStudentAlertNotice({
      type: "info",
      message: `📋 Đã gửi đơn #${created.id} thành công! Đơn đang ở trạng thái [Chờ Ban Quản Lý phê duyệt]. Hệ thống sẽ gửi thông báo đến bạn ngay khi có kết quả xét duyệt.`,
    })
    setTimeout(() => setLateSubmitted(false), 5000)
  }

  // =========================================================================
  // GUARD ACTIONS: APPROVE / REJECT LATE REQUESTS
  // =========================================================================
  const handleApproveLate = (req: LateCurfewRequest) => {
    const reviewer = user?.fullName || "Vũ Thành Nam (Trưởng BQL)"
    const updated = approveLateRequest(req.id, reviewer)
    if (updated) {
      setToastAlert(
        `✅ Đã phê duyệt đơn #${req.id} cho ${req.studentName}! Mã mở cổng: ${updated.approvalCode}`
      )
      setTimeout(() => setToastAlert(null), 4500)
    }
  }

  const handleOpenRejectModal = (req: LateCurfewRequest) => {
    setRejectModalItem(req)
    setRejectPreset("Quá giờ giới nghiêm tối đa quy định (sau 00:00).")
    setRejectReasonInput("")
  }

  const handleConfirmReject = () => {
    if (!rejectModalItem) return
    const finalReason = rejectReasonInput.trim() || rejectPreset
    const reviewer = user?.fullName || "Vũ Thành Nam (Trưởng BQL)"
    const updated = rejectLateRequest(rejectModalItem.id, reviewer, finalReason)
    if (updated) {
      setToastAlert(
        `❌ Đã từ chối đơn #${rejectModalItem.id} của ${rejectModalItem.studentName}.`
      )
      setTimeout(() => setToastAlert(null), 4500)
    }
    setRejectModalItem(null)
  }

  // Filtered guard logs (safely guarded against undefined fields)
  const filteredGuardLogs = guardLogs.filter((log) => {
    if (!log) return false
    if (logFilter === "IN" && log.direction !== "IN") return false
    if (logFilter === "OUT" && log.direction !== "OUT") return false
    if (logFilter === "WARNING" && log.status === "success") return false
    if (guardSearchQuery.trim()) {
      const q = guardSearchQuery.toLowerCase().trim()
      const sName = (log.studentName || "").toLowerCase()
      const sId = (log.studentId || "").toLowerCase()
      const sRoom = (log.room || "").toLowerCase()
      return sName.includes(q) || sId.includes(q) || sRoom.includes(q)
    }
    return true
  })

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert Notification */}
      {toastAlert && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-3 rounded-2xl border border-primary/30 bg-card p-4 text-foreground shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3 max-w-md">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <p className="text-xs font-bold flex-1">{toastAlert}</p>
          <button
            onClick={() => setToastAlert(null)}
            className="text-xs text-muted-foreground hover:text-foreground font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Page Header Banner */}
      <ScrollReveal direction="up" distance={16}>
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 sm:p-8 shadow-xs ui-card-interactive">
          <div className="pointer-events-none absolute -top-16 -right-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-40 h-60 w-60 rounded-full bg-secondary/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:text-emerald-400">
                <QrCode className="h-3.5 w-3.5" />
                <span>Hệ thống Kiểm Soát An Ninh Cổng 24/7 · Cửa Xoay Tự Động</span>
              </div>
              <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {appRole === "guard"
                  ? "Bàn Điều Phối & Quét Thẻ Cổng An Ninh (Guard Station)"
                  : "Thẻ QR Ra Vào Cổng & Giờ Giới Nghiêm"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {appRole === "guard"
                  ? "Tiếp nhận và phê duyệt đơn xin về muộn của sinh viên · Quét thẻ cửa xoay Turnstile thời gian thực"
                  : "Xuất trình thẻ QR động HMAC hoặc nộp đơn xin về muộn sau 23:00 để Ban Quản Lý phê duyệt"}
              </p>
            </div>

            {/* Quick Switcher for Demo & Notification Button */}
            <div className="flex flex-wrap shrink-0 items-center gap-2 self-start lg:self-center">
              {/* Role Switcher Pill */}
              <div className="flex items-center rounded-xl border border-border bg-muted/60 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setRoleOverride("student")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all ${
                    appRole === "student"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>📱 Sinh Viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleOverride("guard")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all relative ${
                    appRole === "guard"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>🛡️ Ban Quản Lý</span>
                  {pendingLateCount > 0 && (
                    <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white animate-pulse">
                      {pendingLateCount}
                    </span>
                  )}
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotificationModal(true)}
                className="h-9 gap-1.5 rounded-xl border-border text-xs px-3 ui-btn-interactive shadow-xs relative"
              >
                <AnimatedBell
                  size={16}
                  animate={unreadNotifCount > 0 ? "default" : undefined}
                  animateOnHover="default"
                  className="text-primary"
                />
                <span>Thông báo</span>
                {unreadNotifCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-black text-white animate-pulse">
                    {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* =========================================================================
          CHẾ ĐỘ 1: GIAO DIỆN SINH VIÊN (STUDENT VIEW)
          ========================================================================= */}
      {appRole === "student" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* CỘT TRÁI (7 COLS): THẺ QR SINH TRẮC HỌC ĐỘNG NỔI BẬT TRỰC TIẾP TRÊN NỀN */}
          <div className="space-y-6 lg:col-span-7">
            <ScrollReveal direction="up" delay={0.08} distance={20}>
              <div
                className={`relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-6 sm:p-8 shadow-md transition-all ui-card-interactive ${
                  isHighContrast ? "ring-2 ring-primary" : ""
                }`}
              >
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-emerald-400">
                    Dynamic HMAC Gate Pass • FPTU Security
                  </span>
                </div>
                <button
                  onClick={() => setIsHighContrast(!isHighContrast)}
                  title="Tăng tương phản để máy quét đọc dễ hơn"
                  className="flex items-center gap-1 rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>Độ sáng cao</span>
                </button>
              </div>

              {/* QR Code Presentation Canvas */}
              <div className="my-6 flex flex-col items-center justify-center">
                <div className="relative mx-auto rounded-3xl border-4 border-primary/40 bg-white p-5 shadow-xl dark:border-emerald-500/40">
                  {/* Clean High-Resolution QR Graphic */}
                  <div className="relative h-52 w-52 sm:h-64 sm:w-64">
                    <div className="grid h-full w-full grid-cols-7 gap-1.5 rounded-2xl bg-slate-950 p-2">
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-xs transition-colors duration-500 ${
                            i % 2 === 0 || i % 5 === 0 || i === 24 || i === 18
                              ? "bg-white"
                              : "bg-emerald-400"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Center Security Emblem */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-emerald-400 bg-slate-950 shadow-xl">
                        <span className="text-sm font-black tracking-tight text-emerald-400">
                          FPTU
                        </span>
                      </div>
                    </div>

                    {/* Laser scanning beam line */}
                    <div className="pointer-events-none absolute inset-x-2 top-2 h-1 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-bounce" />
                  </div>
                </div>

                {/* Countdown Timer Indicator */}
                <div className="mt-5 flex w-full max-w-xs items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RotateCw className="h-3.5 w-3.5 text-primary animate-spin" />
                    <span>Tự động làm mới sau:</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-primary dark:text-emerald-400">
                    {qrCountdown}s
                  </span>
                </div>
              </div>

              {/* Student Identity Information Section */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sinh viên lưu trú:</span>
                  <span className="font-bold text-foreground flex items-center gap-2">
                    <img
                      src={avatar}
                      alt={studentName}
                      className="h-5 w-5 rounded-full object-cover ring-1 ring-primary/40"
                    />
                    <span>{studentName}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mã số sinh viên (MSSV):</span>
                  <span className="font-mono font-bold text-foreground">{studentId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vị trí phòng & buồng:</span>
                  <span className="font-semibold text-primary dark:text-emerald-400">
                    {building} · Phòng {room} · {compartment} · {bedCode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mã HMAC bảo mật:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{qrToken}</span>
                    <button
                      onClick={refreshQrManual}
                      title="Làm mới mã ngay"
                      className="text-primary hover:underline text-[11px] font-semibold"
                    >
                      Đổi mã
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                  <span className="text-muted-foreground">Trạng thái xác thực:</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    HỢP LỆ · ĐƯỢC PHÉP QUA CỔNG
                  </span>
                </div>
              </div>

              {/* Gate Direction Selector for Student */}
              <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3 space-y-2 text-xs">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Chọn chiều đi qua cổng xoay an ninh:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStudentDirection("IN")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 font-bold transition-all ${
                      studentDirection === "IN"
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Cổng Vào (Check-In)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentDirection("OUT")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 font-bold transition-all ${
                      studentDirection === "OUT"
                        ? "border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-300 shadow-2xs"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cổng Ra (Check-Out)</span>
                  </button>
                </div>
              </div>

              {/* Action: Simulate Turnstile Check */}
              <div className="mt-5 space-y-3">
                <Button
                  onClick={handleStudentPassGate}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Radio className="h-4 w-4 animate-pulse" />
                  <span>
                    Quét mã qua cổng xoay · {studentDirection === "IN" ? "VÀO KTX" : "RA NGOÀI"}
                  </span>
                </Button>

                {gateOpenSuccess && lastScannedRecord && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-4 text-emerald-800 dark:text-emerald-200 animate-in zoom-in-95">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white font-bold">
                      <Check className="h-5 w-5 stroke-[3]" />
                    </div>
                    <div>
                      <p className="font-bold text-xs sm:text-sm">
                        {lastScannedRecord.message}
                      </p>
                      <p className="text-xs opacity-90 mt-0.5">
                        Xác thực sinh viên <strong>{lastScannedRecord.studentName}</strong> ({lastScannedRecord.studentId}) thành công lúc {lastScannedRecord.timeStr}. Dữ liệu đã đồng bộ sang Ban Quản lý!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lịch sử quẹt thẻ gần đây của chính sinh viên */}
              <div className="mt-6 pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Lịch sử qua cổng gần đây của bạn:
                  </span>
                  <span className="text-[11px] font-mono text-primary font-bold">
                    {studentRecentLogs.length} lượt
                  </span>
                </div>

                {studentRecentLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 italic text-center">
                    Chưa có lượt quét nào hôm nay. Nhấn nút quét mã phía trên để bắt đầu!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {studentRecentLogs.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                              item.direction === "IN"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                            }`}
                          >
                            {item.direction === "IN" ? (
                              <LogIn className="h-3.5 w-3.5" />
                            ) : (
                              <LogOut className="h-3.5 w-3.5" />
                            )}
                          </span>
                          <div>
                            <span className="font-semibold text-foreground">
                              {item.direction === "IN" ? "Cổng Vào (Check-In)" : "Cổng Ra (Check-Out)"}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {item.gateName} · {item.timeStr}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            item.status === "success"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {item.status === "success" ? "Hợp Lệ" : "Về Muộn"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* CỘT PHẢI (5 COLS): GIỜ GIỚI NGHIÊM 23:00 & TIỆN ÍCH DI ĐỘNG */}
        <div className="space-y-6 lg:col-span-5">
          {/* CARD 1: ĐẾM NGƯỢC GIỚI NGHIÊM & ĐƠN XIN VỀ MUỘN */}
          <ScrollReveal direction="up" delay={0.12} distance={20}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 ui-card-interactive">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Giờ Giới Nghiêm KTX (23:00)</h2>
                    <p className="text-[11px] text-muted-foreground">Đếm ngược đến giờ đóng cổng chính tối nay</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <Flame className="h-3 w-3" />
                  Nội quy
                </span>
              </div>

              {/* Countdown digital display */}
              <div className="grid grid-cols-3 gap-2.5 py-1 text-center">
                <div className="rounded-xl border border-border bg-muted/60 p-3">
                  <span className="block font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
                    {String(curfewCountdown.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Giờ</span>
                </div>
                <div className="rounded-xl border border-border bg-muted/60 p-3">
                  <span className="block font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
                    {String(curfewCountdown.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Phút</span>
                </div>
                <div className="rounded-xl border border-border bg-muted/60 p-3">
                  <span className="block font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
                    {String(curfewCountdown.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Giây</span>
                </div>
              </div>

              {/* Student Real-time Alert Banner */}
              {studentAlertNotice && (
                <div
                  className={`rounded-2xl border p-3.5 text-xs flex items-start gap-3 animate-in zoom-in-95 ${
                    studentAlertNotice.type === "success"
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-950 dark:text-emerald-100"
                      : studentAlertNotice.type === "danger"
                        ? "border-rose-500/50 bg-rose-500/15 text-rose-950 dark:text-rose-100"
                        : "border-sky-500/50 bg-sky-500/15 text-sky-950 dark:text-sky-100"
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {studentAlertNotice.type === "success" && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {studentAlertNotice.type === "danger" && (
                      <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    )}
                    {studentAlertNotice.type === "info" && (
                      <Clock className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-bold leading-relaxed">{studentAlertNotice.message}</p>
                  </div>
                  <button
                    onClick={() => setStudentAlertNotice(null)}
                    className="text-muted-foreground hover:text-foreground text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              <p className="text-xs text-muted-foreground leading-relaxed">
                Sau 23:00, cửa xoay chính sẽ tự động khóa. Sinh viên cần gửi đơn xin về muộn. Sau khi gửi, Ban Quản Lý sẽ nhận được thông tin để <strong>Duyệt</strong> hoặc <strong>Từ chối</strong> kèm lý do, và hệ thống sẽ gửi thông báo kết quả ngay lập tức cho bạn.
              </p>

              {/* Form nộp đơn xin về muộn */}
              <form onSubmit={handleLateSubmit} className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Lý do xin về muộn:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "do_an", label: "💻 Đồ án / Lab" },
                      { id: "lam_them", label: "💼 Làm thêm ca" },
                      { id: "xe_bus", label: "🚌 Xe buýt trễ" },
                      { id: "dot_xuat", label: "🚨 Việc đột xuất" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setLateReason(
                            item.id as "do_an" | "lam_them" | "xe_bus" | "dot_xuat"
                          )
                        }
                        className={`rounded-xl border p-2 text-left font-medium transition-all ${
                          lateReason === item.id
                            ? "border-primary bg-primary/10 text-primary font-bold dark:border-emerald-500 dark:text-emerald-400"
                            : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Giờ dự kiến về:
                    </label>
                    <select
                      value={expectedTime}
                      onChange={(e) => setExpectedTime(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground"
                    >
                      <option value="23:30">23:30</option>
                      <option value="23:45">23:45</option>
                      <option value="00:00">00:00 (Nửa đêm)</option>
                      <option value="00:30">00:30</option>
                      <option value="01:00">01:00 (Rạng sáng)</option>
                      <option value="qua_dem">Vắng qua đêm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Ghi chú / Địa điểm:
                    </label>
                    <input
                      type="text"
                      value={lateNote}
                      onChange={(e) => setLateNote(e.target.value)}
                      placeholder="Thư viện Alpha FPTU"
                      className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs gap-1.5 py-2.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Gửi đơn xin về muộn (Chờ BQL xét duyệt)</span>
                </Button>
              </form>

              {lateSubmitted && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/15 p-3 text-xs text-amber-900 dark:text-amber-200 animate-in zoom-in-95">
                  <p className="font-bold flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    Đã gửi đơn xin về muộn thành công!
                  </p>
                  <p className="mt-1 text-[11px] opacity-90">
                    Đơn đang ở trạng thái <strong>Chờ Ban Quản Lý phê duyệt</strong>. Hệ thống sẽ gửi thông báo phản hồi ngay khi Ban Quản Lý duyệt hoặc từ chối đơn của bạn.
                  </p>
                </div>
              )}

              {/* Lịch sử đơn xin về muộn */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Lịch sử đơn xin về muộn của bạn:
                  </span>
                  <span className="text-[10px] font-mono font-bold text-primary">
                    {studentLateList.length} đơn
                  </span>
                </div>

                {studentLateList.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-3 text-center italic">
                    Bạn chưa gửi đơn xin về muộn nào.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {studentLateList.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-2.5 text-xs space-y-1.5 transition-all ${
                          item.status === "APPROVED"
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : item.status === "REJECTED"
                              ? "border-rose-500/30 bg-rose-500/5"
                              : "border-amber-500/30 bg-amber-500/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-foreground leading-snug">
                            {item.reasonTitle}
                          </p>
                          {item.status === "APPROVED" && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Đã duyệt</span>
                            </span>
                          )}
                          {item.status === "REJECTED" && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              <XCircle className="h-3 w-3" />
                              <span>Bị từ chối</span>
                            </span>
                          )}
                          {item.status === "PENDING" && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              <Clock className="h-3 w-3 animate-spin" />
                              <span>Chờ BQL duyệt</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>
                            {item.dateStr} · Giờ dự kiến về: <strong className="text-foreground">{item.expectedTime}</strong>
                          </span>
                          <span className="font-mono">{item.id}</span>
                        </div>

                        {item.note && (
                          <p className="text-[10px] text-muted-foreground">
                            📍 Địa điểm: {item.note}
                          </p>
                        )}

                        {item.status === "APPROVED" && (
                          <div className="rounded-lg bg-emerald-500/10 p-1.5 text-[10px] text-emerald-800 dark:text-emerald-200 flex items-center justify-between font-medium">
                            <span>
                              ✓ Duyệt bởi: {item.reviewedBy || "Ban Quản Lý"} ({item.reviewedAt || ""})
                            </span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              MÃ: {item.approvalCode}
                            </span>
                          </div>
                        )}

                        {item.status === "REJECTED" && (
                          <div className="rounded-lg bg-rose-500/10 p-1.5 text-[10px] text-rose-800 dark:text-rose-200 space-y-0.5">
                            <p className="font-medium">
                              ✕ Từ chối bởi: {item.reviewedBy || "Ban Quản Lý"} ({item.reviewedAt || ""})
                            </p>
                            <p className="italic">
                              Lý do: "{item.rejectReason}"
                            </p>
                          </div>
                        )}

                        {item.status === "PENDING" && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 italic font-medium">
                            ⏳ Đơn đã chuyển đến Ban Quản Lý. Bạn sẽ nhận được thông báo ngay khi có kết quả.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* CARD 2: TIỆN ÍCH VIETQR ĐIỆN NƯỚC & CAMERA BÁO HỎNG */}
          <ScrollReveal direction="up" delay={0.16} distance={20}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 ui-card-interactive">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSubTab("vietqr")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      subTab === "vietqr"
                        ? "bg-secondary text-secondary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>VietQR Điện Nước</span>
                  </button>
                  <button
                    onClick={() => setSubTab("repair")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      subTab === "repair"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Báo Hỏng Nhanh</span>
                  </button>
                </div>
              </div>

              {/* TAB VIETQR ĐIỆN NƯỚC */}
              {subTab === "vietqr" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">Phần đóng của bạn (Phòng A205):</span>
                      <h3 className="text-2xl font-black font-mono text-primary dark:text-emerald-400 mt-0.5">
                        167.500 <span className="text-xs font-bold text-foreground">VNĐ</span>
                      </h3>
                    </div>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary dark:text-emerald-400">
                      Tháng 10/2026
                    </span>
                  </div>

                  {/* VietQR Box */}
                  <div className="rounded-xl border border-border bg-white p-3 text-center text-slate-900 max-w-[200px] mx-auto shadow-xs">
                    <div className="flex justify-between items-center px-1 mb-1">
                      <span className="text-[10px] font-black text-blue-700">VietQR</span>
                      <span className="text-[9px] font-bold text-rose-600">NAPAS 247</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 bg-slate-950 p-2 rounded-lg">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-5 w-5 rounded-2xs ${
                            i % 2 === 0 || i % 4 === 0 ? "bg-white" : "bg-sky-400"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-[10px] font-bold text-slate-800">MB BANK · KTX FPTU</p>
                  </div>

                  {/* Transfer Details with One-click Copy */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-2.5">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Số tài khoản KTX:</span>
                        <span className="font-mono font-bold text-foreground">091234567899</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard("091234567899", "stk")}
                        className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground"
                      >
                        {copiedField === "stk" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-2.5">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Nội dung chuyển khoản:</span>
                        <span className="font-mono font-bold text-primary dark:text-emerald-400">
                          KTX A205 SE182049 T10
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard("KTX A205 SE182049 T10", "nd")}
                        className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground"
                      >
                        {copiedField === "nd" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CAMERA BÁO HỎNG NHANH */}
              {subTab === "repair" && (
                <div className="space-y-3 text-xs">
                  {/* Viewfinder simulator */}
                  <div className="relative h-40 overflow-hidden rounded-xl border border-border bg-slate-950 flex flex-col items-center justify-center text-center p-3">
                    {capturedPhoto ? (
                      <div className="relative h-full w-full">
                        <img src={capturedPhoto} alt="Defect" className="h-full w-full object-cover rounded-lg" />
                        <button
                          onClick={() => setCapturedPhoto(null)}
                          className="absolute top-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] text-white"
                        >
                          Chụp lại
                        </button>
                      </div>
                    ) : (
                      <>
                        <Camera className="h-8 w-8 text-primary/80 mb-1" />
                        <p className="font-semibold text-white">Ống kính chụp ảnh sự cố thiết bị</p>
                        <p className="text-[10px] text-slate-400">Ổ điện, vòi nước, điều hòa, khóa cửa phòng A205</p>
                        <button
                          type="button"
                          onClick={handleSimulateCapture}
                          className="mt-2 rounded-full bg-primary px-3 py-1 font-bold text-white text-[11px]"
                        >
                          Chụp ảnh mẫu
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-1.5 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-slate-300">
                      Tự động gắn tag: Tòa A · Phòng A205
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "dien", label: "💡 Đèn / Điện" },
                      { id: "nuoc", label: "🚰 Nước / Sen" },
                      { id: "dieu_hoa", label: "❄️ Điều hòa" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setRepairCategory(cat.id)}
                        className={`rounded-xl border p-2 text-center text-[11px] font-medium transition-all ${
                          repairCategory === cat.id
                            ? "border-primary bg-primary/10 text-primary font-bold dark:border-emerald-500 dark:text-emerald-400"
                            : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={repairNote}
                    onChange={(e) => setRepairNote(e.target.value)}
                    placeholder="Mô tả sự cố nhanh..."
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground resize-none"
                  />

                  <Button
                    onClick={() => {
                      setRepairSubmitted(true)
                      setTimeout(() => setRepairSubmitted(false), 4000)
                    }}
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs"
                  >
                    <Wrench className="h-3.5 w-3.5 mr-1.5" />
                    Gửi yêu cầu tới KTV Tòa A
                  </Button>

                  {repairSubmitted && (
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-2.5 text-[11px] text-emerald-800 dark:text-emerald-200 animate-in zoom-in-95">
                      Đã phân công Kỹ thuật viên <strong>Nguyễn Văn An</strong> kiểm tra phòng A205 trong 15 phút tới.
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
      )}

      {/* =========================================================================
          CHẾ ĐỘ 2: GIAO DIỆN BẢO VỆ / QUẢN LÝ (GUARD / MANAGER CHECKPOINT VIEW)
          TỰ ĐỘNG ĐỒNG BỘ 100% VỚI SINH VIÊN KHI QUẸT THẺ
          ========================================================================= */}
      {appRole === "guard" && (
        <div className="space-y-6">
          {/* Live New Scan Banner Alert */}
          {newScanAlert && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/60 bg-emerald-500/20 p-4 text-emerald-950 dark:text-emerald-100 shadow-lg animate-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <p className="text-sm font-bold">{newScanAlert}</p>
              </div>
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold text-white">
                LIVE REALTIME
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* CỘT TRÁI (7 COLS): MÀN HÌNH QUÉT CAMERA & BẢNG ĐIỀU PHỐI NGHIỆP VỤ AN NINH */}
            <div className="space-y-6 lg:col-span-7">
              <ScrollReveal direction="up" delay={0.05} distance={20}>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-5 ui-card-interactive">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-sky-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary dark:text-sky-400">
                      Camera Máy Quét Thẻ Cổng An Ninh · Phản Hồi &lt; 0.3s
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                    <DoorOpen className="h-4 w-4 text-primary" />
                    CỔNG CHÍNH TÒA A (TURNSTILE 01)
                  </span>
                </div>

                {/* Live Scanner Viewport Canvas */}
                <div className="relative h-64 overflow-hidden rounded-2xl border-2 border-dashed border-secondary/50 bg-slate-950 flex flex-col items-center justify-center p-4">
                  <div className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_16px_#22d3ee] animate-bounce" />

                  {latestGuardScan ? (
                    <div className="relative z-10 w-full max-w-md rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-4 text-center text-white backdrop-blur-sm animate-in zoom-in-95">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1 text-cyan-400 font-mono font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          QUÉT THÀNH CÔNG
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {latestGuardScan.timeStr} · {latestGuardScan.dateStr}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-left">
                        <img
                          src={
                            latestGuardScan.avatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                          }
                          alt={latestGuardScan.studentName}
                          className="h-14 w-14 rounded-2xl object-cover ring-2 ring-cyan-400/50"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-base text-white">
                            {latestGuardScan.studentName || "Sinh viên"}
                          </h4>
                          <p className="text-xs text-slate-300">
                            MSSV: <span className="font-mono font-bold text-cyan-300">{latestGuardScan.studentId || "---"}</span> • Phòng {latestGuardScan.room || "A205"}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                latestGuardScan.direction === "IN"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-sky-500/20 text-sky-300"
                              }`}
                            >
                              {latestGuardScan.direction === "IN" ? (
                                <LogIn className="h-3 w-3" />
                              ) : (
                                <LogOut className="h-3 w-3" />
                              )}
                              {latestGuardScan.direction === "IN" ? "CỔNG VÀO (IN)" : "CỔNG RA (OUT)"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Nguồn: {latestGuardScan.source === "student_app" ? "App Sinh viên" : "Máy quét Bảo vệ"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl bg-slate-950/80 p-2 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
                        {latestGuardScan.message}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="h-40 w-40 rounded-2xl border-2 border-dashed border-cyan-400/60 flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-cyan-400/50 animate-pulse" />
                      </div>
                      <div className="absolute bottom-3 rounded-md bg-black/70 px-3 py-1 text-xs text-slate-300">
                        Sẵn sàng nhận diện mã QR HMAC từ ứng dụng sinh viên
                      </div>
                    </>
                  )}
                </div>

                {/* BẢNG ĐIỀU KHIỂN & NGHIỆP VỤ QUÉT THỰC TẾ (THAY THẾ 3 NÚT DEMO CŨ) */}
                <div className="space-y-4 pt-2">
                  {/* Mục 1: Quét nhanh Sinh viên đang kiểm thử */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Quét Thẻ Sinh Viên Đang Test ({studentName} - {studentId}):
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Phòng {room}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handleGuardExecuteScan(studentId, "IN")}
                        className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 p-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-all hover:scale-[1.01]"
                      >
                        <LogIn className="h-4 w-4 text-emerald-600" />
                        <span>Quét Cổng VÀO (IN)</span>
                      </button>

                      <button
                        onClick={() => handleGuardExecuteScan(studentId, "OUT")}
                        className="flex items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 p-3 text-xs font-bold text-sky-700 dark:text-sky-300 transition-all hover:scale-[1.01]"
                      >
                        <LogOut className="h-4 w-4 text-sky-600" />
                        <span>Quét Cổng RA (OUT)</span>
                      </button>
                    </div>
                  </div>

                  {/* Mục 2: Chọn sinh viên KTX từ danh mục thực tế (14 Sinh viên CSDL) */}
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-secondary" />
                      Chọn Sinh viên KTX để Quét Thẻ / Kiểm Tra:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                      <div className="sm:col-span-7">
                        <select
                          value={selectedStudentId}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground font-medium"
                        >
                          {availableStudents.map((std) => (
                            <option key={std.studentId} value={std.studentId}>
                              {std.fullName} ({std.studentId}) · Phòng {std.room} ({std.bedCode})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-5 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleGuardExecuteScan(selectedStudentId, "IN")}
                          className="rounded-xl border border-emerald-500/30 bg-card hover:bg-emerald-500/10 p-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-colors flex items-center justify-center gap-1"
                        >
                          <LogIn className="h-3.5 w-3.5" />
                          <span>Vào (IN)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGuardExecuteScan(selectedStudentId, "OUT")}
                          className="rounded-xl border border-sky-500/30 bg-card hover:bg-sky-500/10 p-2 text-center text-xs font-bold text-sky-600 dark:text-sky-400 transition-colors flex items-center justify-center gap-1"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Ra (OUT)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mục 3: Mô phỏng kịch bản an ninh nghiệp vụ */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground block">
                      Mô phỏng tình huống an ninh cổng KTX:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() =>
                          handleGuardExecuteScan(
                            selectedStudentId,
                            "IN",
                            "success",
                            "HỢP LỆ · CỬA XOAY ĐÃ MỞ (0.3s)"
                          )
                        }
                        className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 p-2.5 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-colors"
                      >
                        ✅ SV Hợp lệ (Cửa mở)
                      </button>

                      <button
                        onClick={() =>
                          handleGuardExecuteScan(
                            selectedStudentId,
                            "IN",
                            "warning",
                            "VỀ MUỘN CÓ PHÉP (ĐÃ DUYỆT ĐƠN #LAT-0988) · MỜI VÀO"
                          )
                        }
                        className="rounded-xl border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 p-2.5 text-center text-xs font-bold text-amber-700 dark:text-amber-300 transition-colors"
                      >
                        ⚠️ Về muộn có phép (#LAT)
                      </button>

                      <button
                        onClick={() =>
                          handleGuardExecuteScan(
                            selectedStudentId,
                            "IN",
                            "danger",
                            "QUÁ GIỜ GIỚI NGHIÊM 23:00 (CHƯA NỘP ĐƠN) · GIỮ LẠI XÁC MINH"
                          )
                        }
                        className="rounded-xl border border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 p-2.5 text-center text-xs font-bold text-rose-700 dark:text-rose-300 transition-colors"
                      >
                        ❌ Vi phạm giới nghiêm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* CỘT PHẢI (5 COLS): NHẬT KÝ QUẸT CỔNG THỜI GIAN THỰC & THỐNG KÊ */}
          <div className="space-y-6 lg:col-span-5">
            <ScrollReveal direction="up" delay={0.1} distance={20}>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 ui-card-interactive">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Nhật Ký Quẹt Cổng (Live Realtime Sync)
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Tự động cập nhật tức thời khi sinh viên quẹt thẻ
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    ĐÃ ĐỒNG BỘ CSDL
                  </span>
                </div>

                {/* Live Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-border bg-muted/40 p-2.5">
                    <span className="block font-mono text-xl font-black text-foreground">
                      {gateStats.totalScansToday}
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">
                      Lượt qua cổng
                    </span>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-2.5">
                    <span className="block font-mono text-xl font-black text-sky-600 dark:text-sky-400">
                      {gateStats.currentlyOutside}
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">
                      Đang ở ngoài
                    </span>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-2.5">
                    <span className="block font-mono text-xl font-black text-amber-600 dark:text-amber-400">
                      {gateStats.warningCount}
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">
                      Cảnh báo/Muộn
                    </span>
                  </div>
                </div>

                {/* Filters & Actions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setLogFilter("ALL")}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                          logFilter === "ALL"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Tất cả ({guardLogs.length})
                      </button>
                      <button
                        onClick={() => setLogFilter("IN")}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                          logFilter === "IN"
                            ? "bg-emerald-600 text-white"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Vào (IN)
                      </button>
                      <button
                        onClick={() => setLogFilter("OUT")}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                          logFilter === "OUT"
                            ? "bg-sky-600 text-white"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Ra (OUT)
                      </button>
                      <button
                        onClick={() => setLogFilter("WARNING")}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                          logFilter === "WARNING"
                            ? "bg-amber-600 text-white"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Cảnh báo
                      </button>
                    </div>

                    <button
                      onClick={() => resetGateLogs()}
                      title="Khôi phục danh sách mẫu ban đầu"
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={guardSearchQuery}
                      onChange={(e) => setGuardSearchQuery(e.target.value)}
                      placeholder="Tìm theo MSSV, Họ tên hoặc Phòng..."
                      className="w-full rounded-xl border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Log List */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredGuardLogs.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6 italic">
                      Không tìm thấy lượt quẹt nào phù hợp với bộ lọc.
                    </p>
                  ) : (
                    filteredGuardLogs.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-muted/20 hover:bg-muted/40 p-3 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold ${
                              item.direction === "IN"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                            }`}
                          >
                            {item.direction === "IN" ? (
                              <LogIn className="h-4 w-4" />
                            ) : (
                              <LogOut className="h-4 w-4" />
                            )}
                          </span>
                          <div>
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{item.studentName || "Sinh viên"}</span>
                              <span className="font-mono text-[11px] text-muted-foreground">
                                ({item.studentId || "---"})
                              </span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Phòng {item.room || "A205"} · {item.timeStr || ""}
                              {item.source === "student_app" && (
                                <span className="ml-1.5 text-primary font-medium">
                                  • Từ App SV
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              item.status === "success"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : item.status === "warning"
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {item.status === "success"
                              ? item.direction === "IN"
                                ? "Vào Hợp Lệ"
                                : "Ra Hợp Lệ"
                              : item.status === "warning"
                                ? "Về Muộn Có Phép"
                                : "Cảnh Báo"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* =========================================================================
            SECTION: TIẾP NHẬN & PHÊ DUYỆT ĐƠN XIN VỀ MUỘN CỦA SINH VIÊN
            BQL / BẢO VỆ CÓ THỂ DUYỆT HOẶC TỪ CHỐI KÈM LÝ DO THỜI GIAN THỰC
            ========================================================================= */}
        <ScrollReveal direction="up" delay={0.15} distance={20}>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-5 ui-card-interactive">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    Tiếp Nhận & Phê Duyệt Đơn Xin Về Muộn (Curfew Approvals)
                  </h3>
                  {pendingLateCount > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      {pendingLateCount} đơn chờ duyệt
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Đơn xin về muộn sau 23:00 gửi từ ứng dụng sinh viên · Quản lý xét duyệt và cấp mã thông hành mở cửa xoay
                </p>
              </div>

              {/* Status Counters */}
              <div className="flex items-center gap-2 self-start sm:self-center text-xs">
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-1.5">
                  <span className="text-muted-foreground">Chờ duyệt:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {pendingLateCount}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-1.5">
                  <span className="text-muted-foreground">Đã duyệt:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {approvedLateCount}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-1.5">
                  <span className="text-muted-foreground">Từ chối:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                    {rejectedLateCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setGuardLateFilter("ALL")}
                  className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
                    guardLateFilter === "ALL"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tất cả ({lateRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setGuardLateFilter("PENDING")}
                  className={`rounded-xl px-3 py-1.5 font-bold transition-all relative ${
                    guardLateFilter === "PENDING"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ⏳ Chờ duyệt ({pendingLateCount})
                </button>
                <button
                  type="button"
                  onClick={() => setGuardLateFilter("APPROVED")}
                  className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
                    guardLateFilter === "APPROVED"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ✅ Đã duyệt ({approvedLateCount})
                </button>
                <button
                  type="button"
                  onClick={() => setGuardLateFilter("REJECTED")}
                  className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
                    guardLateFilter === "REJECTED"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ❌ Từ chối ({rejectedLateCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={guardLateSearch}
                    onChange={(e) => setGuardLateSearch(e.target.value)}
                    placeholder="Tìm theo MSSV, Họ tên hoặc Phòng..."
                    className="w-full rounded-xl border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => resetLateRequests()}
                  title="Khôi phục danh sách đơn mẫu"
                  className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Late Requests List */}
            <div className="space-y-3 pt-1">
              {filteredGuardLateRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="font-semibold text-foreground">Không có đơn xin về muộn nào</p>
                  <p className="mt-1">Không tìm thấy yêu cầu phù hợp với bộ lọc hiện tại.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredGuardLateRequests.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-4 text-xs space-y-3 transition-all hover:shadow-xs ${
                        item.status === "PENDING"
                          ? "border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20"
                          : item.status === "APPROVED"
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-rose-500/30 bg-rose-500/5"
                      }`}
                    >
                      {/* Top Row: Student info & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.avatar ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                            }
                            alt={item.studentName}
                            className="h-11 w-11 rounded-xl object-cover ring-2 ring-primary/20"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                              <span>{item.studentName}</span>
                              <span className="font-mono text-xs font-normal text-muted-foreground">
                                ({item.studentId})
                              </span>
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              {item.building || "Tòa A"} · Phòng <strong className="text-foreground">{item.room}</strong>
                              {item.bedCode && ` (${item.bedCode})`}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {item.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                              <Clock className="h-3 w-3 animate-spin" />
                              <span>Chờ duyệt</span>
                            </span>
                          )}
                          {item.status === "APPROVED" && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Đã duyệt</span>
                            </span>
                          )}
                          {item.status === "REJECTED" && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/20 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Đã từ chối</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Request details */}
                      <div className="rounded-xl border border-border/80 bg-background/60 p-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            Gửi lúc: <strong>{item.timeStr}</strong> · {item.dateStr}
                          </span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            Dự kiến về: {item.expectedTime}
                          </span>
                        </div>

                        <div className="pt-1 border-t border-border/40">
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase font-bold text-muted-foreground">
                              {item.reasonCategory === "do_an"
                                ? "Đồ án"
                                : item.reasonCategory === "lam_them"
                                  ? "Làm thêm"
                                  : item.reasonCategory === "xe_bus"
                                    ? "Xe buýt"
                                    : "Đột xuất"}
                            </span>
                            <span>{item.reasonTitle}</span>
                          </p>
                          {item.note && (
                            <p className="text-[11px] text-muted-foreground mt-1">
                              📍 Địa điểm/Ghi chú: {item.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Actions or Review details */}
                      {item.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/50">
                          <Button
                            size="sm"
                            onClick={() => handleApproveLate(item)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-xl h-8.5 px-3.5 transition-all hover:scale-[1.02]"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Duyệt đơn (Cấp mã)</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenRejectModal(item)}
                            className="border-rose-500/40 text-rose-600 hover:bg-rose-500/10 font-bold text-xs gap-1.5 rounded-xl h-8.5 px-3.5"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Từ chối đơn</span>
                          </Button>
                        </div>
                      )}

                      {item.status === "APPROVED" && (
                        <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                          <div className="text-emerald-700 dark:text-emerald-300 font-medium">
                            <p>✓ Duyệt bởi: <strong>{item.reviewedBy || "Ban Quản Lý"}</strong> lúc {item.reviewedAt || ""}</p>
                            <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                              MÃ THÔNG HÀNH: {item.approvalCode}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenRejectModal(item)}
                            className="text-muted-foreground hover:text-rose-600 font-medium text-[11px] underline"
                          >
                            Thu hồi duyệt
                          </button>
                        </div>
                      )}

                      {item.status === "REJECTED" && (
                        <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                          <div className="text-rose-700 dark:text-rose-300">
                            <p className="font-medium">
                              ✕ Từ chối bởi: <strong>{item.reviewedBy || "Ban Quản Lý"}</strong> lúc {item.reviewedAt || ""}
                            </p>
                            <p className="italic mt-0.5 max-w-[260px] truncate" title={item.rejectReason}>
                              "{item.rejectReason}"
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApproveLate(item)}
                            className="text-muted-foreground hover:text-emerald-600 font-medium text-[11px] underline"
                          >
                            Xem xét lại
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
      )}

      {/* =========================================================================
          MODAL: TỪ CHỐI ĐƠN XIN VỀ MUỘN (GUARD REJECT MODAL)
          ========================================================================= */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <XCircle className="h-5 w-5" />
                  <span>Từ Chối Đơn Xin Về Muộn</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Sinh viên: <strong>{rejectModalItem.studentName}</strong> ({rejectModalItem.studentId}) · Phòng {rejectModalItem.room}
                </p>
              </div>
              <button
                onClick={() => setRejectModalItem(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Chọn lý do từ chối nhanh:
                </label>
                <div className="space-y-2">
                  {[
                    "Quá giờ giới nghiêm tối đa quy định (sau 00:00).",
                    "Lý do cá nhân không cấp thiết sau 23:00, đề nghị về phòng đúng giờ.",
                    "Đã vượt quá hạn mức xin về muộn trong tháng (tối đa 3 lần/tháng).",
                    "KTX đang trong đợt cao điểm siết chặt an ninh kỳ thi.",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectPreset(preset)}
                      className={`w-full rounded-xl border p-2.5 text-left font-medium transition-all ${
                        rejectPreset === preset
                          ? "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold"
                          : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Hoặc nhập lý do chi tiết gửi sinh viên:
                </label>
                <textarea
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Nhập ghi chú hoặc lý do cụ thể..."
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-800 dark:text-amber-200">
                ⚠️ Sau khi xác nhận từ chối, ứng dụng sinh viên sẽ nhận được thông báo phản hồi ngay lập tức kèm lý do này.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRejectModalItem(null)}
                className="text-xs font-bold rounded-xl"
              >
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl px-4"
              >
                Xác nhận Từ Chối Đơn
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Push Notification Simulation Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <AnimatedBell size={17} animateOnHover="default" className="text-primary" />
                Thông Báo Đẩy Di Động (Push Notifications)
              </h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs max-h-[440px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">
                    Hộp thư thông báo ({systemNotifications.length})
                  </span>
                  {unreadNotifCount > 0 && (
                    <span className="rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-1.5 py-0.2">
                      {unreadNotifCount} mới
                    </span>
                  )}
                </div>
                {unreadNotifCount > 0 ? (
                  <button
                    type="button"
                    onClick={handleMobileMarkAllAsRead}
                    className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <CheckCheck className="h-3 w-3" />
                    <span>Đánh dấu đã đọc</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span>Tất cả đã đọc</span>
                  </span>
                )}
              </div>

              {/* Late curfew request status if exists */}
              {studentLateList.length > 0 && (
                <div
                  className={`rounded-xl border p-3 space-y-1 ${
                    studentLateList[0].status === "APPROVED"
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-950 dark:text-emerald-100"
                      : studentLateList[0].status === "REJECTED"
                        ? "border-rose-500/40 bg-rose-500/15 text-rose-950 dark:text-rose-100"
                        : "border-amber-500/40 bg-amber-500/15 text-amber-950 dark:text-amber-100"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      {studentLateList[0].status === "APPROVED" && "✅ Đơn về muộn: ĐÃ DUYỆT"}
                      {studentLateList[0].status === "REJECTED" && "❌ Đơn về muộn: TỪ CHỐI"}
                      {studentLateList[0].status === "PENDING" && "⏳ Đơn về muộn: CHỜ BQL DUYỆT"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {studentLateList[0].timeStr}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {studentLateList[0].status === "APPROVED" &&
                      `BQL đã duyệt đơn #${studentLateList[0].id}. Mã thông hành: ${studentLateList[0].approvalCode}. Được phép qua cổng sau 23:00.`}
                    {studentLateList[0].status === "REJECTED" &&
                      `Đơn #${studentLateList[0].id} bị từ chối. Lý do: "${studentLateList[0].rejectReason}".`}
                    {studentLateList[0].status === "PENDING" &&
                      `Đơn #${studentLateList[0].id} đang được BQL xem xét.`}
                  </p>
                </div>
              )}

              {/* Real-time system notifications from BQL (Invoices & Reminders) */}
              {systemNotifications.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-4 italic">
                  Chưa có thông báo nào.
                </p>
              ) : (
                systemNotifications.map((notif) => {
                  const isUnread = !notif.isRead
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleMobileMarkAsRead(notif.id)}
                      className={`rounded-xl border p-3 space-y-1.5 transition-all cursor-pointer ${
                        isUnread
                          ? notif.type === "PAYMENT_REMINDER"
                            ? "border-rose-300/80 bg-rose-50/80 dark:border-rose-900/50 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 ring-1 ring-rose-400/40 shadow-xs"
                            : notif.type === "INVOICE_PUBLISHED"
                              ? "border-amber-300/80 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-100 ring-1 ring-amber-400/40 shadow-xs"
                              : notif.type === "CURFEW"
                                ? "border-cyan-200 bg-cyan-50/60 dark:border-cyan-900/50 dark:bg-cyan-950/20 text-cyan-900 dark:text-cyan-100 ring-1 ring-cyan-400/40 shadow-xs"
                                : "border-border bg-card text-foreground ring-1 ring-primary/40 shadow-xs"
                          : "border-border/60 bg-muted/25 text-muted-foreground opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span className="flex items-center gap-1.5">
                          {notif.type === "PAYMENT_REMINDER" && "🚨 "}
                          {notif.type === "INVOICE_PUBLISHED" && "⚡ "}
                          <span className={isUnread ? "text-foreground font-bold" : "text-muted-foreground"}>
                            {notif.title}
                          </span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {notif.timeStr}
                          </span>
                          {isUnread ? (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          ) : (
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {notif.content}
                      </p>
                      {notif.actionUrl && (
                        <div className="pt-0.5 flex items-center justify-between">
                          <Link
                            to={notif.actionUrl}
                            onClick={() => {
                              handleMobileMarkAsRead(notif.id)
                              setShowNotificationModal(false)
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                          >
                            <span>{notif.actionLabel || "Xem chi tiết →"}</span>
                          </Link>
                          {isUnread && (
                            <span className="text-[10px] text-primary/80 font-medium">Chạm để đọc</span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <Button
              onClick={() => setShowNotificationModal(false)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs py-2"
            >
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileAppPage
