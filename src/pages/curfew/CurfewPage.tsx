import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/useAuth"
import type {
  CurfewRequest,
  GateAccessLog,
  DisciplineRecord,
  StudentDemeritSummary,
  CurfewRequestType,
  CurfewReasonCategory,
  InfractionType,
} from "@/types/curfew"
import {
  INITIAL_CURFEW_REQUESTS,
  INITIAL_GATE_LOGS,
  INITIAL_DISCIPLINE_RECORDS,
  INITIAL_STUDENT_DEMERIT_SUMMARIES,
} from "@/data/mockCurfew"
import {
  ClockAlert,
  ShieldCheck,
  FileText,
  AlertCircle,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  History,
  Shield,
  UserX,
} from "lucide-react"

const STORAGE_KEY_CURFEW_REQS = "dms_curfew_requests_v1"
const STORAGE_KEY_GATE_LOGS = "dms_gate_logs_v1"
const STORAGE_KEY_DISCIPLINE = "dms_discipline_records_v1"
const STORAGE_KEY_DEMERITS = "dms_student_demerits_v1"

export const CurfewPage: React.FC = () => {
  const { user } = useAuth()
  const isGuardOrManager =
    user?.role === "technician" ||
    user?.role === "manager" ||
    user?.role === "admin"

  // 1. Curfew Requests State
  const [requests, setRequests] = useState<CurfewRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURFEW_REQS)
      return saved ? JSON.parse(saved) : INITIAL_CURFEW_REQUESTS
    } catch {
      return INITIAL_CURFEW_REQUESTS
    }
  })

  // 2. Gate Logs State
  const [gateLogs, setGateLogs] = useState<GateAccessLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GATE_LOGS)
      return saved ? JSON.parse(saved) : INITIAL_GATE_LOGS
    } catch {
      return INITIAL_GATE_LOGS
    }
  })

  // 3. Discipline Records State
  const [violations, setViolations] = useState<DisciplineRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISCIPLINE)
      return saved ? JSON.parse(saved) : INITIAL_DISCIPLINE_RECORDS
    } catch {
      return INITIAL_DISCIPLINE_RECORDS
    }
  })

  // 4. Demerit Summaries State
  const [demerits, setDemerits] = useState<StudentDemeritSummary[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEMERITS)
      return saved ? JSON.parse(saved) : INITIAL_STUDENT_DEMERIT_SUMMARIES
    } catch {
      return INITIAL_STUDENT_DEMERIT_SUMMARIES
    }
  })

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURFEW_REQS, JSON.stringify(requests))
    localStorage.setItem(STORAGE_KEY_GATE_LOGS, JSON.stringify(gateLogs))
    localStorage.setItem(STORAGE_KEY_DISCIPLINE, JSON.stringify(violations))
    localStorage.setItem(STORAGE_KEY_DEMERITS, JSON.stringify(demerits))
  }, [requests, gateLogs, violations, demerits])

  // Sub-tabs: Sinh viên mặc định vào REQUESTS và không thể xem console quét thẻ của BQL
  const [activeTab, setActiveTab] = useState<
    "GATE_SCAN" | "REQUESTS" | "DISCIPLINE"
  >(() => (isGuardOrManager ? "GATE_SCAN" : "REQUESTS"))
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // ==========================================
  // SECURITY GATE CONSOLE STATE & LOGIC
  // ==========================================
  // Simulated Clock for Demo: can toggle between normal time (22:30) and past curfew (23:35)
  const [simulatedHour, setSimulatedHour] = useState(23)
  const [simulatedMinute, setSimulatedMinute] = useState(35)
  const [scanInputMssv, setScanInputMssv] = useState("")
  const [scanResult, setScanResult] = useState<{
    status: "ON_TIME" | "APPROVED_LATE" | "UNAUTHORIZED_LATE"
    studentName: string
    studentId: string
    room: string
    details: string
    timestamp: string
  } | null>(null)

  // Students database for scanning
  const registeredStudents: Record<
    string,
    { name: string; room: string; phone: string; parentPhone: string }
  > = {
    SE182049: {
      name: "Nguyễn Hoàng Vinh",
      room: "A205",
      phone: "0912 345 678",
      parentPhone: "0903 123 456",
    },
    SE182050: {
      name: "Trần Thanh Nguyên",
      room: "A205",
      phone: "0905 111 222",
      parentPhone: "0905 888 999",
    },
    SE182051: {
      name: "Văn Thái Trung",
      room: "A205",
      phone: "0934 999 888",
      parentPhone: "0918 333 444",
    },
    SE182052: {
      name: "Huỳnh Gia Kim",
      room: "A205",
      phone: "0982 777 666",
      parentPhone: "0983 456 789",
    },
    SE182053: {
      name: "Lê Minh Tuấn",
      room: "A204",
      phone: "0961 223 344",
      parentPhone: "0962 111 333",
    },
    SE182054: {
      name: "Phạm Quốc Bảo",
      room: "A203",
      phone: "0971 445 566",
      parentPhone: "0972 555 777",
    },
    SE182057: {
      name: "Ngô Văn Khải",
      room: "A302",
      phone: "0943 222 111",
      parentPhone: "0944 333 222",
    },
  }

  // Handle Scanning MSSV at Gate
  const handleScanCard = (mssvToScan?: string) => {
    const targetMssv = (mssvToScan || scanInputMssv).trim().toUpperCase()
    if (!targetMssv) {
      showToast("Vui lòng nhập hoặc quẹt mã thẻ sinh viên (MSSV)!")
      return
    }

    const studentInfo = registeredStudents[targetMssv]
    if (!studentInfo) {
      showToast(`Không tìm thấy hồ sơ sinh viên với MSSV: ${targetMssv}!`)
      return
    }

    const scanTimeFormatted = `${String(simulatedHour).padStart(2, "0")}:${String(
      simulatedMinute
    ).padStart(2, "0")}:15`
    const isPastCurfew = simulatedHour >= 23 || simulatedHour < 5

    // Check if student has an APPROVED request for today
    const approvedRequest = requests.find(
      (r) => r.studentId === targetMssv && r.status === "APPROVED"
    )

    if (!isPastCurfew) {
      // 1. BEFORE 23:00 -> ON TIME
      const resultObj = {
        status: "ON_TIME" as const,
        studentName: studentInfo.name,
        studentId: targetMssv,
        room: studentInfo.room,
        details: `Check-in lúc ${scanTimeFormatted}. Về trước 23:00 - Hợp lệ an toàn.`,
        timestamp: scanTimeFormatted,
      }
      setScanResult(resultObj)

      const newLog: GateAccessLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        studentId: targetMssv,
        studentName: studentInfo.name,
        room: studentInfo.room,
        timestamp: new Date().toISOString(),
        scanTimeFormatted: scanTimeFormatted,
        curfewStatus: "ON_TIME",
        guardNotes: "Check-in trước 23:00 an toàn.",
        guardName: user?.fullName || "Chú Đỗ Mạnh Hùng (Tổ An ninh)",
      }
      setGateLogs([newLog, ...gateLogs])
      showToast(`✅ [HỢP LỆ]: Sinh viên ${studentInfo.name} về đúng giờ!`)
    } else if (approvedRequest) {
      // 2. AFTER 23:00 WITH APPROVED REQUEST -> APPROVED LATE
      const resultObj = {
        status: "APPROVED_LATE" as const,
        studentName: studentInfo.name,
        studentId: targetMssv,
        room: studentInfo.room,
        details: `Check-in lúc ${scanTimeFormatted}. Có đơn duyệt ${approvedRequest.id} (${approvedRequest.reasonDetail}). Cho phép vào cổng.`,
        timestamp: scanTimeFormatted,
      }
      setScanResult(resultObj)

      const newLog: GateAccessLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        studentId: targetMssv,
        studentName: studentInfo.name,
        room: studentInfo.room,
        timestamp: new Date().toISOString(),
        scanTimeFormatted: scanTimeFormatted,
        curfewStatus: "APPROVED_LATE",
        matchedRequestId: approvedRequest.id,
        guardNotes: `Đối chiếu đơn ${approvedRequest.id} hợp lệ. Cho vào an toàn.`,
        guardName: user?.fullName || "Chú Đỗ Mạnh Hùng (Tổ An ninh)",
      }
      setGateLogs([newLog, ...gateLogs])
      showToast(
        `🔵 [HỢP LỆ THEO ĐƠN]: ${studentInfo.name} có đơn duyệt ${approvedRequest.id}!`
      )
    } else {
      // 3. AFTER 23:00 WITHOUT REQUEST -> UNAUTHORIZED LATE
      const resultObj = {
        status: "UNAUTHORIZED_LATE" as const,
        studentName: studentInfo.name,
        studentId: targetMssv,
        room: studentInfo.room,
        details: `CẢNH BÁO: Check-in lúc ${scanTimeFormatted} sau giờ giới nghiêm 23:00 KHÔNG CÓ ĐƠN XIN PHÉP! Hệ thống tự động ghi nhận vi phạm và trừ 10 điểm rèn luyện!`,
        timestamp: scanTimeFormatted,
      }
      setScanResult(resultObj)

      const newLog: GateAccessLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        studentId: targetMssv,
        studentName: studentInfo.name,
        room: studentInfo.room,
        timestamp: new Date().toISOString(),
        scanTimeFormatted: scanTimeFormatted,
        curfewStatus: "UNAUTHORIZED_LATE",
        penaltyPointsDeducted: 10,
        guardNotes:
          "Về sau 23:00 không có đơn duyệt. Tự động lập biên bản kỷ luật.",
        guardName: user?.fullName || "Chú Đỗ Mạnh Hùng (Tổ An ninh)",
      }
      setGateLogs([newLog, ...gateLogs])

      // Automatically record discipline violation
      const newVio: DisciplineRecord = {
        id: `VIO-2026-${String(violations.length + 1).padStart(3, "0")}`,
        studentId: targetMssv,
        studentName: studentInfo.name,
        room: studentInfo.room,
        date: new Date().toISOString().substring(0, 10),
        infractionType: "CURFEW_VIOLATION",
        infractionTitle: `Vi phạm giờ giới nghiêm 23:00 (Check-in lúc ${scanTimeFormatted})`,
        pointsDeducted: 10,
        description: `Quét thẻ lúc ${scanTimeFormatted} qua cổng KTX không có đơn xin về muộn đã duyệt trên hệ thống DMS.`,
        officerName: user?.fullName || "Chú Đỗ Mạnh Hùng (Tổ An ninh)",
        status: "RECORDED",
      }
      setViolations([newVio, ...violations])

      // Deduct 10 points in demerits
      setDemerits((prev) => {
        const existing = prev.find((d) => d.studentId === targetMssv)
        if (existing) {
          const newDeducted = existing.totalDeducted + 10
          const remaining = Math.max(0, 100 - newDeducted)
          const newStatus =
            remaining < 70 ? "SUSPENDED" : remaining < 80 ? "WARNING" : "NORMAL"
          return prev.map((d) =>
            d.studentId === targetMssv
              ? {
                  ...d,
                  totalDeducted: newDeducted,
                  remainingPoints: remaining,
                  status: newStatus,
                  violationCount: d.violationCount + 1,
                }
              : d
          )
        } else {
          return [
            ...prev,
            {
              studentId: targetMssv,
              studentName: studentInfo.name,
              room: studentInfo.room,
              initialPoints: 100,
              totalDeducted: 10,
              remainingPoints: 90,
              status: "NORMAL",
              violationCount: 1,
            },
          ]
        }
      })

      showToast(
        `🚨 [CẢNH BÁO VI PHẠM]: Đã trừ 10 điểm rèn luyện của sinh viên ${studentInfo.name}!`
      )
    }

    setScanInputMssv("")
  }

  // ==========================================
  // LEAVE REQUEST FORM STATE & LOGIC
  // ==========================================
  const [reqType, setReqType] = useState<CurfewRequestType>("LATE_RETURN")
  const [reqDate, setReqDate] = useState("2026-10-10")
  const [reqTime, setReqTime] = useState("23:45")
  const [reqCategory, setReqCategory] = useState<CurfewReasonCategory>("STUDY")
  const [reqDetail, setReqDetail] = useState("")
  const [reqParentPhone, setReqParentPhone] = useState("0903 123 456")
  const [reqParentConfirmed, setReqParentConfirmed] = useState(true)

  // Handle Request Submission
  const handleSubmitCurfewRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reqDetail.trim()) {
      showToast("Vui lòng nhập lý do vắng mặt / về muộn chi tiết!")
      return
    }

    // Check submission time rule: before 21:00
    const nowHour = new Date().getHours()
    const isBefore21 = nowHour < 21

    const newReq: CurfewRequest = {
      id: `REQ-2026-${String(requests.length + 1).padStart(3, "0")}`,
      studentId: user?.studentId || "SE182049",
      studentName: user?.fullName || "Nguyễn Hoàng Vinh",
      room: user?.dormitoryStatus?.room || "A205",
      phone: user?.phone || "0912 345 678",
      requestType: reqType,
      date: reqDate,
      expectedReturnTime: reqTime,
      reasonCategory: reqCategory,
      reasonDetail: reqDetail,
      parentPhone: reqParentPhone,
      parentConfirmed: reqParentConfirmed,
      submittedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      isSubmittedBefore2100: isBefore21,
      status: "PENDING",
    }

    setRequests([newReq, ...requests])
    setReqDetail("")
    showToast(`Đã gửi đơn ${newReq.id}! Ban Quản lý sẽ xét duyệt trước 22:30.`)
  }

  // Handle Approve / Reject Request
  const handleReviewRequest = (
    requestId: string,
    newStatus: "APPROVED" | "REJECTED"
  ) => {
    const updated = requests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: newStatus,
          reviewedBy: user?.fullName || "Thầy Vũ Thành Nam (Dorm Manager)",
          reviewedAt: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 16),
          reviewNotes:
            newStatus === "APPROVED"
              ? "Đã đối chiếu thông tin phụ huynh và phê duyệt hợp lệ."
              : "Từ chối vì lý do không phù hợp quy chế KTX.",
        }
      }
      return r
    })
    setRequests(updated)
    showToast(
      `Đã ${newStatus === "APPROVED" ? "phê duyệt" : "từ chối"} đơn ${requestId}!`
    )
  }

  // ==========================================
  // DISCIPLINE INCIDENT FORM STATE
  // ==========================================
  const [vioStudentId, setVioStudentId] = useState("SE182053")
  const [vioType, setVioType] = useState<InfractionType>("UNAUTHORIZED_COOKING")
  const [vioDescription, setVioDescription] = useState("")

  const infractionPointsMap: Record<
    InfractionType,
    { title: string; points: number }
  > = {
    CURFEW_VIOLATION: {
      title: "Vi phạm giờ giới nghiêm 23:00 không phép",
      points: 10,
    },
    UNAUTHORIZED_COOKING: {
      title: "Nấu ăn sai quy định trong phòng (Nguy cơ cháy)",
      points: 15,
    },
    NOISE_AFTER_HOURS: {
      title: "Gây mất trật tự, ồn ào sau 22:30",
      points: 10,
    },
    SMOKING_VAPING: {
      title: "Hút thuốc lá / thuốc lá điện tử trong buồng phòng",
      points: 20,
    },
    UNAUTHORIZED_GUEST: {
      title: "Đưa người lạ vào phòng qua đêm không đăng ký",
      points: 25,
    },
    HIGH_POWER_APPLIANCE: {
      title: "Sử dụng thiết bị điện công suất lớn trái phép",
      points: 15,
    },
    OTHER: { title: "Vi phạm nội quy khác", points: 5 },
  }

  const handleCreateDisciplineReport = (e: React.FormEvent) => {
    e.preventDefault()
    const student = registeredStudents[vioStudentId]
    if (!student) return

    const infractionInfo = infractionPointsMap[vioType]
    const newRecord: DisciplineRecord = {
      id: `VIO-2026-${String(violations.length + 1).padStart(3, "0")}`,
      studentId: vioStudentId,
      studentName: student.name,
      room: student.room,
      date: new Date().toISOString().substring(0, 10),
      infractionType: vioType,
      infractionTitle: infractionInfo.title,
      pointsDeducted: infractionInfo.points,
      description:
        vioDescription.trim() ||
        `Lập biên bản vi phạm: ${infractionInfo.title}.`,
      officerName: user?.fullName || "Thầy Vũ Thành Nam (Dorm Manager)",
      status: "RECORDED",
    }

    setViolations([newRecord, ...violations])

    // Update demerit score
    setDemerits((prev) => {
      const existing = prev.find((d) => d.studentId === vioStudentId)
      if (existing) {
        const newDeducted = existing.totalDeducted + infractionInfo.points
        const remaining = Math.max(0, 100 - newDeducted)
        const newStatus =
          remaining < 70 ? "SUSPENDED" : remaining < 80 ? "WARNING" : "NORMAL"
        return prev.map((d) =>
          d.studentId === vioStudentId
            ? {
                ...d,
                totalDeducted: newDeducted,
                remainingPoints: remaining,
                status: newStatus,
                violationCount: d.violationCount + 1,
              }
            : d
        )
      } else {
        const remaining = 100 - infractionInfo.points
        return [
          ...prev,
          {
            studentId: vioStudentId,
            studentName: student.name,
            room: student.room,
            initialPoints: 100,
            totalDeducted: infractionInfo.points,
            remainingPoints: remaining,
            status:
              remaining < 70
                ? "SUSPENDED"
                : remaining < 80
                  ? "WARNING"
                  : "NORMAL",
            violationCount: 1,
          },
        ]
      }
    })

    setVioDescription("")
    showToast(
      `Đã lập biên bản ${newRecord.id} và trừ ${infractionInfo.points} điểm của ${student.name}!`
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex animate-in items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl fade-in slide-in-from-top-4">
          <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-card via-blue-500/5 to-card p-6 shadow-xs sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-600 shadow-xs dark:text-blue-400">
              <ClockAlert className="h-7 w-7" />
            </div>
            <div>
              <h1 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
                Kiểm Soát Giờ Giới Nghiêm 23:00 & Kỷ Luật Nội Trú
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Cổng bảo vệ quét thẻ đối chiếu • Đơn vắng mặt nộp trước 21:00 •
                Trừ điểm rèn luyện (100đ chuẩn)
              </p>
            </div>
          </div>
          <div className="shrink-0 rounded-2xl border border-border bg-card/90 px-4 py-2.5 text-right shadow-xs">
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Phụ trách kỹ thuật & an ninh:
            </p>
            <p className="mt-0.5 flex items-center justify-end gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>🛡️ Đinh Thanh Trung</span>
            </p>
            {isGuardOrManager && (
              <p className="mt-0.5 text-[10px] font-bold text-emerald-600">
                Trực ban: {user?.fullName}
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-6 text-xs sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] font-medium text-muted-foreground">
              Lượt quẹt thẻ cổng
            </p>
            <p className="mt-1 text-2xl font-black text-foreground">
              {gateLogs.length}
            </p>
            <span className="text-[10px] text-muted-foreground">
              Ca trực hôm nay
            </span>
          </div>
          <div className="rounded-2xl border border-blue-500/20 bg-card p-4">
            <p className="flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-400">
              <FileText className="h-3.5 w-3.5" /> Đơn về muộn đã duyệt
            </p>
            <p className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">
              {requests.filter((r) => r.status === "APPROVED").length}
            </p>
            <span className="text-[10px] text-blue-700/80 dark:text-blue-400/80">
              Hợp lệ ra vào ngoài giờ
            </span>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-card p-4">
            <p className="flex items-center gap-1 text-[11px] font-medium text-cyan-700 dark:text-cyan-400">
              <AlertTriangle className="h-3.5 w-3.5" /> SV bị cảnh cáo (&gt;20đ)
            </p>
            <p className="mt-1 text-2xl font-black text-cyan-600 dark:text-cyan-400">
              {demerits.filter((d) => d.status === "WARNING").length}
            </p>
            <span className="text-[10px] text-cyan-700/80 dark:text-cyan-400/80">
              Cần nhắc nhở rèn luyện
            </span>
          </div>
          <div className="rounded-2xl border border-blue-500/20 bg-card p-4">
            <p className="flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-400">
              <UserX className="h-3.5 w-3.5" /> Đình chỉ kỳ sau (&gt;30đ)
            </p>
            <p className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">
              {demerits.filter((d) => d.status === "SUSPENDED").length}
            </p>
            <span className="text-[10px] text-blue-700/80 dark:text-blue-400/80">
              Không xét duyệt KTX kỳ tới
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-muted/60 p-1">
        {isGuardOrManager && (
          <button
            onClick={() => setActiveTab("GATE_SCAN")}
            className={`flex min-w-[180px] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
              activeTab === "GATE_SCAN"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Scan className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            <span className="truncate">Quét Thẻ Cổng 23:00</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("REQUESTS")}
          className={`flex min-w-[180px] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
            activeTab === "REQUESTS"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-3.5 w-3.5 shrink-0 text-blue-500" />
          <span className="truncate">
            {isGuardOrManager ? "Duyệt Đơn Về Muộn" : "Đơn Về Muộn Của Tôi"}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("DISCIPLINE")}
          className={`flex min-w-[180px] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
            activeTab === "DISCIPLINE"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
          <span className="truncate">
            {isGuardOrManager
              ? "Sổ Kỷ Luật & Điểm Trừ"
              : "Điểm Rèn Luyện & Nội Quy"}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CỔNG BẢO VỆ QUÉT THẺ TRỰC TIẾP */}
      {/* ========================================================= */}
      {activeTab === "GATE_SCAN" && (
        <div className="space-y-6">
          {/* Main Console Box */}
          <div className="space-y-6 rounded-3xl border border-blue-500/30 bg-card p-6 shadow-sm sm:p-8">
            {/* Top Bar of Console */}
            <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-blue-600 uppercase">
                  <ShieldCheck className="h-3.5 w-3.5" /> Bàn Trực Cổng Bảo Vệ
                  (Security Gate Console)
                </span>
                <h2 className="text-xl font-black text-foreground">
                  Hệ Thống Tra Cứu Thẻ & Đối Chiếu Giờ Giới Nghiêm
                </h2>
              </div>

              {/* Digital Clock & Simulation Controls */}
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/60 p-2.5">
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Đồng hồ điểm danh
                  </span>
                  <span
                    className={`font-mono text-xl font-black ${
                      simulatedHour >= 23
                        ? "animate-pulse text-blue-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {String(simulatedHour).padStart(2, "0")}:
                    {String(simulatedMinute).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-col gap-1 border-l border-border pl-3">
                  <span className="text-[9px] font-semibold text-muted-foreground">
                    Giả lập giờ test:
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSimulatedHour(22)
                        setSimulatedMinute(30)
                      }}
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        simulatedHour === 22
                          ? "bg-emerald-600 text-white"
                          : "border border-border bg-background hover:bg-muted"
                      }`}
                    >
                      22:30 (Đúng giờ)
                    </button>
                    <button
                      onClick={() => {
                        setSimulatedHour(23)
                        setSimulatedMinute(35)
                      }}
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        simulatedHour === 23
                          ? "bg-blue-600 text-white"
                          : "border border-border bg-background hover:bg-muted"
                      }`}
                    >
                      23:35 (Quá giới nghiêm)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Testing Student Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground">
                Thử nghiệm quét nhanh bằng tài khoản có sẵn (Bấm để quẹt thẻ):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleScanCard("SE182049")}
                  className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-500/20 dark:text-blue-300"
                >
                  <span>
                    SE182049 (Nguyễn Hoàng Vinh - Có đơn duyệt hợp lệ)
                  </span>
                </button>
                <button
                  onClick={() => handleScanCard("SE182053")}
                  className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-500/20 dark:text-blue-300"
                >
                  <span>SE182053 (Lê Minh Tuấn - KHÔNG CÓ ĐƠN ➔ Vi phạm)</span>
                </button>
                <button
                  onClick={() => handleScanCard("SE182050")}
                  className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-500/20 dark:text-purple-300"
                >
                  <span>SE182050 (Trần Thanh Nguyên - Về quê qua đêm)</span>
                </button>
                <button
                  onClick={() => handleScanCard("SE182054")}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <span>SE182054 (Phạm Quốc Bảo - Phòng A203)</span>
                </button>
              </div>
            </div>

            {/* Card Scan Input Form */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Scan className="absolute top-3 left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={scanInputMssv}
                  onChange={(e) => setScanInputMssv(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScanCard()}
                  placeholder="Nhập MSSV hoặc quét mã barcode thẻ sinh viên (VD: SE182049)..."
                  className="w-full rounded-2xl border border-border bg-card py-2.5 pr-4 pl-10 font-mono text-xs uppercase focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <button
                onClick={() => handleScanCard()}
                className="flex shrink-0 items-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
              >
                <Scan className="h-4 w-4" />
                <span>Quẹt Thẻ Cổng (Scan)</span>
              </button>
            </div>

            {/* LIVE SCAN RESULT BANNER */}
            {scanResult && (
              <div
                className={`animate-in rounded-2xl border p-5 transition-all zoom-in-95 ${
                  scanResult.status === "ON_TIME"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
                    : scanResult.status === "APPROVED_LATE"
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-950 dark:text-blue-200"
                      : "border-blue-500/50 bg-blue-500/15 text-blue-950 shadow-md dark:text-blue-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`shrink-0 rounded-2xl p-3 ${
                      scanResult.status === "ON_TIME"
                        ? "bg-emerald-500/20 text-emerald-600"
                        : scanResult.status === "APPROVED_LATE"
                          ? "bg-blue-500/20 text-blue-600"
                          : "animate-bounce bg-blue-500/20 text-blue-600"
                    }`}
                  >
                    {scanResult.status === "ON_TIME" && (
                      <CheckCircle2 className="h-8 w-8" />
                    )}
                    {scanResult.status === "APPROVED_LATE" && (
                      <ShieldCheck className="h-8 w-8" />
                    )}
                    {scanResult.status === "UNAUTHORIZED_LATE" && (
                      <AlertTriangle className="h-8 w-8" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold tracking-wide uppercase">
                        {scanResult.status === "ON_TIME" &&
                          "🟢 CHECK-IN THÀNH CÔNG: VỀ ĐÚNG GIỜ"}
                        {scanResult.status === "APPROVED_LATE" &&
                          "🔵 HỢP LỆ THEO ĐƠN: VỀ MUỘN CÓ PHÉP ĐÃ DUYỆT"}
                        {scanResult.status === "UNAUTHORIZED_LATE" &&
                          "🔴 CẢNH BÁO AN NINH: VI PHẠM GIỜ GIỚI NGHIÊM 23:00!"}
                      </span>
                      <span className="rounded-full bg-background/80 px-2.5 py-0.5 font-mono text-xs font-bold">
                        {scanResult.timestamp}
                      </span>
                    </div>

                    <p className="text-xs">
                      Sinh viên: <strong>{scanResult.studentName}</strong> •
                      MSSV: <strong>{scanResult.studentId}</strong> • Phòng:{" "}
                      <strong>{scanResult.room}</strong>
                    </p>

                    <p className="pt-1 text-xs leading-relaxed font-medium opacity-90">
                      {scanResult.details}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Access Logs Table */}
          <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <History className="h-4 w-4 text-muted-foreground" />
                Lịch Sử Quẹt Thẻ Cổng Thời Gian Thực (Recent Gate Logs)
              </h3>
              <span className="font-mono text-xs text-muted-foreground">
                {gateLogs.length} lượt ghi nhận
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-3 py-2.5">Thời gian</th>
                    <th className="px-3 py-2.5">MSSV</th>
                    <th className="px-3 py-2.5">Họ và Tên</th>
                    <th className="px-3 py-2.5">Phòng</th>
                    <th className="px-3 py-2.5">Kết quả đối chiếu</th>
                    <th className="px-3 py-2.5">Ghi chú an ninh</th>
                    <th className="px-3 py-2.5 text-right">Bảo vệ ca trực</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {gateLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30">
                      <td className="px-3 py-2.5 font-mono text-[11px] font-semibold text-muted-foreground">
                        {log.scanTimeFormatted}
                      </td>
                      <td className="px-3 py-2.5 font-mono font-bold text-foreground">
                        {log.studentId}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-foreground">
                        {log.studentName}
                      </td>
                      <td className="px-3 py-2.5">{log.room}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                            log.curfewStatus === "ON_TIME"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : log.curfewStatus === "APPROVED_LATE"
                                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                : "border border-blue-500/30 bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {log.curfewStatus === "ON_TIME" &&
                            "Đúng giờ (Trước 23h)"}
                          {log.curfewStatus === "APPROVED_LATE" &&
                            "Có đơn duyệt"}
                          {log.curfewStatus === "UNAUTHORIZED_LATE" &&
                            "Vi phạm (-10đ)"}
                        </span>
                      </td>
                      <td className="max-w-xs truncate px-3 py-2.5 text-[11px] text-muted-foreground">
                        {log.guardNotes}
                      </td>
                      <td className="px-3 py-2.5 text-right text-[11px] text-muted-foreground">
                        {log.guardName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ĐƠN VẮNG MẶT / VỀ MUỘN NGOÀI GIỜ */}
      {/* ========================================================= */}
      {activeTab === "REQUESTS" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Submit Request Form */}
          <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border pb-3 text-blue-600">
              <FileText className="h-5 w-5" />
              <h3 className="text-sm font-bold text-foreground">
                Nộp Đơn Vắng Mặt / Về Muộn
              </h3>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-[11px] text-cyan-800 dark:text-cyan-300">
              <p className="flex items-center gap-1 font-bold">
                <AlertCircle className="h-3.5 w-3.5" /> Quy định nộp đơn:
              </p>
              <p className="mt-0.5 leading-relaxed">
                Đơn phải nộp <strong>trước 21:00</strong> ngày vắng mặt. Nộp sau
                21:00 hệ thống sẽ gắn cờ nộp muộn và có thể bị từ chối.
              </p>
            </div>

            <form
              onSubmit={handleSubmitCurfewRequest}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-semibold text-foreground">
                  Loại đơn
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReqType("LATE_RETURN")}
                    className={`rounded-xl border px-3 py-2 text-center font-bold ${
                      reqType === "LATE_RETURN"
                        ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    Về muộn (Trước 01:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReqType("OVERNIGHT")}
                    className={`rounded-xl border px-3 py-2 text-center font-bold ${
                      reqType === "OVERNIGHT"
                        ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    Vắng qua đêm / Về quê
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">
                    Ngày vắng
                  </label>
                  <input
                    type="date"
                    value={reqDate}
                    onChange={(e) => setReqDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">
                    Giờ về dự kiến
                  </label>
                  <input
                    type="text"
                    value={reqTime}
                    onChange={(e) => setReqTime(e.target.value)}
                    placeholder="VD: 23:45 hoặc 06:30 sáng"
                    className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground">
                  Mục đích lý do
                </label>
                <select
                  value={reqCategory}
                  onChange={(e) =>
                    setReqCategory(e.target.value as CurfewReasonCategory)
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs"
                >
                  <option value="STUDY">
                    Học tập / Làm đồ án môn học Capstone
                  </option>
                  <option value="PART_TIME_JOB">
                    Làm thêm ca tối có hợp đồng
                  </option>
                  <option value="HOME_VISIT">
                    Về quê / Thăm gia đình cuối tuần
                  </option>
                  <option value="MEDICAL">Khám chữa bệnh / Lý do y tế</option>
                  <option value="FAMILY_EVENT">Việc hiếu hỉ thân nhân</option>
                  <option value="OTHER">Lý do khác</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground">
                  Giải trình chi tiết lý do
                </label>
                <textarea
                  rows={2}
                  value={reqDetail}
                  onChange={(e) => setReqDetail(e.target.value)}
                  placeholder="Ghi rõ địa điểm học tập/làm việc, người cùng đi..."
                  className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground">
                  Số điện thoại phụ huynh xác nhận
                </label>
                <input
                  type="text"
                  value={reqParentPhone}
                  onChange={(e) => setReqParentPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="parentConfirmedCheck"
                  checked={reqParentConfirmed}
                  onChange={(e) => setReqParentConfirmed(e.target.checked)}
                  className="rounded border-border text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="parentConfirmedCheck"
                  className="text-[11px] text-muted-foreground"
                >
                  Phụ huynh đã được thông báo và đồng ý
                </label>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-2xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
              >
                Gửi Đơn Xin Phép
              </button>
            </form>
          </div>

          {/* Right Column: List of Requests with Manager Action Buttons */}
          <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">
                {isGuardOrManager
                  ? `Danh Sách Đơn Cần Phê Duyệt (${requests.length})`
                  : `Các Đơn Của Tôi Đã Nộp (${requests.filter((r) => r.studentId === (user?.studentId || "SE182049")).length})`}
              </h3>
              <span className="text-[11px] text-muted-foreground">
                {isGuardOrManager
                  ? "Quản lý & An ninh phê duyệt trực tuyến"
                  : "Chỉ hiển thị các đơn do bạn nộp, trạng thái đang được BQL xử lý"}
              </span>
            </div>

            <div className="space-y-3">
              {(isGuardOrManager
                ? requests
                : requests.filter(
                    (r) => r.studentId === (user?.studentId || "SE182049")
                  )
              ).map((req) => (
                <div
                  key={req.id}
                  className="space-y-2.5 rounded-2xl border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-bold">
                        {req.id}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {req.studentName} ({req.studentId})
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        • Phòng {req.room}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Before 21:00 badge */}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          req.isSubmittedBefore2100
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-blue-500/10 text-blue-600"
                        }`}
                      >
                        {req.isSubmittedBefore2100
                          ? "Nộp trước 21:00"
                          : "Nộp muộn sau 21:00"}
                      </span>

                      {/* Status */}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          req.status === "APPROVED"
                            ? "bg-emerald-600 text-white"
                            : req.status === "REJECTED"
                              ? "bg-blue-600 text-white"
                              : "border border-cyan-500/30 bg-cyan-500/20 text-cyan-700 dark:text-cyan-400"
                        }`}
                      >
                        {req.status === "APPROVED" && "Đã phê duyệt"}
                        {req.status === "REJECTED" && "Đã từ chối"}
                        {req.status === "PENDING" && "Chờ duyệt"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-foreground">
                    Lý do:{" "}
                    <span className="text-muted-foreground">
                      {req.reasonDetail}
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center justify-between border-t border-border/60 pt-1 text-[11px] text-muted-foreground">
                    <div>
                      <span>
                        Ngày: <strong>{req.date}</strong>
                      </span>{" "}
                      •{" "}
                      <span>
                        Dự kiến về: <strong>{req.expectedReturnTime}</strong>
                      </span>{" "}
                      • <span>Phụ huynh: {req.parentPhone}</span>
                    </div>

                    {/* Review Actions: ONLY FOR BQL/MANAGER/GUARD */}
                    {isGuardOrManager && req.status === "PENDING" && (
                      <div className="mt-1 flex gap-1.5 sm:mt-0">
                        <button
                          onClick={() =>
                            handleReviewRequest(req.id, "APPROVED")
                          }
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700"
                        >
                          Duyệt đơn
                        </button>
                        <button
                          onClick={() =>
                            handleReviewRequest(req.id, "REJECTED")
                          }
                          className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-blue-700"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}

                    {!isGuardOrManager && req.status === "PENDING" && (
                      <span className="mt-1 text-[11px] font-semibold text-cyan-600 sm:mt-0 dark:text-cyan-400">
                        Đang được BQL xem xét
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {(isGuardOrManager
                ? requests
                : requests.filter(
                    (r) => r.studentId === (user?.studentId || "SE182049")
                  )
              ).length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-8 text-center text-xs text-muted-foreground">
                  {isGuardOrManager
                    ? "Hiện tại không có đơn xin ra vào ngoài giờ nào trong danh sách."
                    : "Bạn chưa có đơn xin vắng mặt hoặc về muộn nào. Vui lòng điền mẫu bên trái để nộp đơn mới."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: BIÊN BẢN VI PHẠM & ĐIỂM KỶ LUẬT */}
      {/* ========================================================= */}
      {activeTab === "DISCIPLINE" && (
        <div className="space-y-6">
          {/* Summary of Student Demerit Points */}
          <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xs">
            <div className="flex flex-col items-start justify-between gap-2 border-b border-border pb-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Bảng Theo Dõi Điểm Rèn Luyện Lưu Trú KTX (100 Điểm Ban Đầu)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Quy chế: Bị trừ &gt; 20 điểm (Cảnh cáo) • Bị trừ &gt; 30 điểm
                  (Đình chỉ lưu trú kỳ sau)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {(isGuardOrManager
                ? demerits
                : demerits.filter(
                    (d) => d.studentId === (user?.studentId || "SE182049")
                  )
              ).map((student) => {
                const percent = student.remainingPoints
                const isWarning = student.status === "WARNING"
                const isSuspended = student.status === "SUSPENDED"

                return (
                  <div
                    key={student.studentId}
                    className={`rounded-2xl border p-4 transition-all ${
                      isSuspended
                        ? "border-blue-500/40 bg-blue-500/5"
                        : isWarning
                          ? "border-cyan-500/40 bg-cyan-500/5"
                          : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-muted-foreground">
                          {student.studentId}
                        </span>
                        <h4 className="text-xs font-bold text-foreground">
                          {student.studentName}
                        </h4>
                        <span className="text-[10px] text-muted-foreground">
                          Phòng {student.room}
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xl font-black ${
                            isSuspended
                              ? "text-blue-600"
                              : isWarning
                                ? "text-cyan-600"
                                : "text-emerald-600"
                          }`}
                        >
                          {student.remainingPoints}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          /100đ
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all ${
                          isSuspended
                            ? "bg-blue-500"
                            : isWarning
                              ? "bg-cyan-500"
                              : "bg-emerald-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">
                        Đã trừ: <strong>{student.totalDeducted}đ</strong> (
                        {student.violationCount} lần)
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-bold ${
                          isSuspended
                            ? "bg-blue-600 text-white"
                            : isWarning
                              ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        {isSuspended
                          ? "ĐÌNH CHỈ KỲ SAU"
                          : isWarning
                            ? "CẢNH BÁO CẤP 1"
                            : "TỐT"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form to create infraction report: ONLY for Guard / Manager / Admin */}
          {isGuardOrManager ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border pb-3 text-blue-600">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="text-sm font-bold text-foreground">
                    Lập Biên Bản Vi Phạm Trực Tuyến
                  </h3>
                </div>

                <form
                  onSubmit={handleCreateDisciplineReport}
                  className="space-y-3.5 text-xs"
                >
                  <div>
                    <label className="font-semibold text-foreground">
                      Sinh viên vi phạm
                    </label>
                    <select
                      value={vioStudentId}
                      onChange={(e) => setVioStudentId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs"
                    >
                      <option value="SE182053">
                        SE182053 - Lê Minh Tuấn (A204)
                      </option>
                      <option value="SE182056">
                        SE182056 - Đoàn Gia Bảo (A201)
                      </option>
                      <option value="SE182057">
                        SE182057 - Ngô Văn Khải (A302)
                      </option>
                      <option value="SE182049">
                        SE182049 - Nguyễn Hoàng Vinh (A205)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-foreground">
                      Hành vi vi phạm nội quy
                    </label>
                    <select
                      value={vioType}
                      onChange={(e) =>
                        setVioType(e.target.value as InfractionType)
                      }
                      className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold"
                    >
                      <option value="CURFEW_VIOLATION">
                        Vi phạm giờ giới nghiêm 23:00 (-10đ)
                      </option>
                      <option value="UNAUTHORIZED_COOKING">
                        Nấu ăn sai quy định trong phòng (-15đ)
                      </option>
                      <option value="NOISE_AFTER_HOURS">
                        Làm ồn loa kéo sau 22:30 (-10đ)
                      </option>
                      <option value="SMOKING_VAPING">
                        Hút thuốc lá / Pod trong phòng (-20đ)
                      </option>
                      <option value="UNAUTHORIZED_GUEST">
                        Đưa người lạ ngủ qua đêm (-25đ)
                      </option>
                      <option value="HIGH_POWER_APPLIANCE">
                        Thiết bị điện quá tải 1500W (-15đ)
                      </option>
                      <option value="OTHER">Vi phạm khác (-5đ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-foreground">
                      Mô tả biên bản hiện trường
                    </label>
                    <textarea
                      rows={3}
                      value={vioDescription}
                      onChange={(e) => setVioDescription(e.target.value)}
                      placeholder="Ghi nhận biên bản tuần tra, tang vật thu giữ nếu có..."
                      className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 w-full rounded-2xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
                  >
                    Ký Biên Bản & Trừ Điểm
                  </button>
                </form>
              </div>

              {/* List of Violation Records */}
              <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xs lg:col-span-2">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-bold text-foreground">
                    Danh Sách Biên Bản Xử Lý Kỷ Luật ({violations.length})
                  </h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    Lưu trữ chính thức KTX
                  </span>
                </div>

                <div className="space-y-3">
                  {violations.map((vio) => (
                    <div
                      key={vio.id}
                      className="space-y-2 rounded-2xl border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-bold">
                            {vio.id}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {vio.studentName} ({vio.studentId})
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            • Phòng {vio.room}
                          </span>
                        </div>

                        <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-600">
                          -{vio.pointsDeducted} điểm
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-foreground">
                        {vio.infractionTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {vio.description}
                      </p>

                      <div className="flex items-center justify-between border-t border-border/60 pt-1 text-[10px] text-muted-foreground">
                        <span>Cán bộ lập: {vio.officerName}</span>
                        <span className="font-mono">{vio.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-xs text-foreground">
              <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                Quy Chế Khen Thưởng & Kỷ Luật Sinh Viên Nội Trú
              </h4>
              <p className="leading-relaxed text-muted-foreground">
                Mỗi sinh viên bắt đầu học kỳ với 100 điểm rèn luyện. Việc chấp
                hành đúng giờ giới nghiêm 23:00 và bảo quản tốt trang thiết bị
                phòng ở sẽ giúp duy trì điểm số tối đa, làm căn cứ ưu tiên xét
                chọn phòng và giường ở các học kỳ tiếp theo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
