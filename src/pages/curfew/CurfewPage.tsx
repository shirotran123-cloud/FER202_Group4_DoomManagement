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
import { buildGateQrPayload, findOverdueAbsentees } from "@/lib/dorm-ops"
import { canApproveCurfew, canScanGate, isStaff } from "@/lib/role-access"
import { ClockAlert, ShieldCheck, FileText, CircleAlert, Scan, CircleCheck, TriangleAlert, Sparkles, History, Shield, UserX } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
const STORAGE_KEY_CURFEW_REQS = "dms_curfew_requests_v1"
const STORAGE_KEY_GATE_LOGS = "dms_gate_logs_v1"
const STORAGE_KEY_DISCIPLINE = "dms_discipline_records_v1"
const STORAGE_KEY_DEMERITS = "dms_student_demerits_v1"

export const CurfewPage: React.FC = () => {
  const { user } = useAuth()
  const isGuardOrManager = isStaff(user?.role)
  // Bảo vệ quét cổng + điểm danh nhưng không duyệt đơn; chỉ quản lý/admin duyệt.
  const canApprove = canApproveCurfew(user?.role)
  const canScan = canScanGate(user?.role)

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
  const [activeTab, setActiveTab] = useState<"GATE_SCAN" | "REQUESTS" | "DISCIPLINE">(() =>
    isGuardOrManager ? "GATE_SCAN" : "REQUESTS"
  )
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // ==========================================
  // Trạng thái console quét thẻ cổng & logic
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
    QE202049: {
      name: "Nguyễn Hoàng Vinh",
      room: "A205",
      phone: "0912 345 678",
      parentPhone: "0903 123 456",
    },
    QE202050: {
      name: "Trần Thanh Nguyên",
      room: "A205",
      phone: "0905 111 222",
      parentPhone: "0905 888 999",
    },
    QE202051: {
      name: "Văn Thái Trung",
      room: "A205",
      phone: "0934 999 888",
      parentPhone: "0918 333 444",
    },
    QE202052: {
      name: "Huỳnh Gia Kim",
      room: "A205",
      phone: "0982 777 666",
      parentPhone: "0983 456 789",
    },
    QE202053: {
      name: "Lê Minh Tuấn",
      room: "A204",
      phone: "0961 223 344",
      parentPhone: "0962 111 333",
    },
    QE202054: {
      name: "Phạm Quốc Bảo",
      room: "A203",
      phone: "0971 445 566",
      parentPhone: "0972 555 777",
    },
    QE202057: {
      name: "Ngô Văn Khải",
      room: "A302",
      phone: "0943 222 111",
      parentPhone: "0944 333 222",
    },
  }

  // Xử lý quét MSSV tại cổng — chỉ bảo vệ/quản lý/admin được quét.
  const handleScanCard = (mssvToScan?: string) => {
    if (!canScan) {
      showToast("Chỉ bảo vệ trực cổng và quản lý được quét thẻ.")
      return
    }
    const targetMssv = (mssvToScan || scanInputMssv).trim().toUpperCase()
    if (!targetMssv) {
      showToast("Vui lòng nhập hoặc quẹt mã thẻ sinh viên!")
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
        guardName: user?.fullName || "Chú Đỗ Mạnh Hùng",
      }
      setGateLogs([newLog, ...gateLogs])
      showToast(`HỢP LỆ: Sinh viên ${studentInfo.name} về đúng giờ!`)
    } else if (approvedRequest) {
      // 2. AFTER 23:00 WITH APPROVED REQUEST -> APPROVED LATE
      const resultObj = {
        status: "APPROVED_LATE" as const,
        studentName: studentInfo.name,
        studentId: targetMssv,
        room: studentInfo.room,
        details: `Check-in lúc ${scanTimeFormatted}. Có đơn duyệt ${approvedRequest.id} · ${approvedRequest.reasonDetail}. Cho phép vào cổng.`,
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
        guardName: user?.fullName || "Chú Đỗ Mạnh Hùng",
      }
      setGateLogs([newLog, ...gateLogs])
      showToast(`HỢP LỆ THEO ĐƠN: ${studentInfo.name} có đơn duyệt ${approvedRequest.id}!`)
    } else {
      // 3. Sau 23:00 không đơn -> vi phạm không phép
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
        guardNotes: "Về sau 23:00 không có đơn duyệt. Tự động lập biên bản kỷ luật.",
        guardName: user?.fullName || "Chú Đỗ Mạnh Hùng",
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
        infractionTitle: `Vi phạm giờ giới nghiêm 23:00 · Check-in lúc ${scanTimeFormatted}`,
        pointsDeducted: 10,
        description: `Quét thẻ lúc ${scanTimeFormatted} qua cổng KTX không có đơn xin về muộn đã duyệt trên hệ thống DMS.`,
        officerName: user?.fullName || "Chú Đỗ Mạnh Hùng",
        status: "RECORDED",
      }
      setViolations([newVio, ...violations])

      // Deduct 10 points in demerits
      setDemerits((prev) => {
        const existing = prev.find((d) => d.studentId === targetMssv)
        if (existing) {
          const newDeducted = existing.totalDeducted + 10
          const remaining = Math.max(0, 100 - newDeducted)
          const newStatus = remaining < 70 ? "SUSPENDED" : remaining < 80 ? "WARNING" : "NORMAL"
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

      showToast(`CẢNH BÁO VI PHẠM: Đã trừ 10 điểm rèn luyện của sinh viên ${studentInfo.name}!`)
    }

    setScanInputMssv("")
  }

  // ==========================================
  // State & logic đơn xin về muộn
  // ==========================================
  const [reqType, setReqType] = useState<CurfewRequestType>("LATE_RETURN")
  const [reqDate, setReqDate] = useState("2026-10-10")
  const [reqTime, setReqTime] = useState("23:45")
  const [reqCategory, setReqCategory] = useState<CurfewReasonCategory>("STUDY")
  const [reqDetail, setReqDetail] = useState("")
  const [reqParentPhone, setReqParentPhone] = useState("0903 123 456")
  const [reqParentConfirmed, setReqParentConfirmed] = useState(true)

  // Xử lý nộp đơn xin về muộn
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
      studentId: user?.studentId || "QE202049",
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

  // Handle Approve / Reject Request — chỉ quản lý/admin duyệt.
  const handleReviewRequest = (requestId: string, newStatus: "APPROVED" | "REJECTED") => {
    if (!canApprove) {
      showToast("Chỉ Ban Quản lý được duyệt đơn về muộn.")
      return
    }
    const updated = requests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: newStatus,
          reviewedBy: user?.fullName || "Thầy Vũ Thành Nam",
          reviewedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          reviewNotes:
            newStatus === "APPROVED"
              ? "Đã đối chiếu thông tin phụ huynh và phê duyệt hợp lệ."
              : "Từ chối vì lý do không phù hợp quy chế KTX.",
        }
      }
      return r
    })
    setRequests(updated)
    showToast(`Đã ${newStatus === "APPROVED" ? "phê duyệt" : "từ chối"} đơn ${requestId}!`)
  }

  // ==========================================
  // State form biên bản kỷ luật
  // ==========================================
  const [vioStudentId, setVioStudentId] = useState("QE202053")
  const [vioType, setVioType] = useState<InfractionType>("UNAUTHORIZED_COOKING")
  const [vioDescription, setVioDescription] = useState("")

  const infractionPointsMap: Record<InfractionType, { title: string; points: number }> = {
    CURFEW_VIOLATION: { title: "Vi phạm giờ giới nghiêm 23:00 không phép", points: 10 },
    UNAUTHORIZED_COOKING: { title: "Nấu ăn sai quy định trong phòng", points: 15 },
    NOISE_AFTER_HOURS: { title: "Gây mất trật tự, ồn ào sau 22:30", points: 10 },
    SMOKING_VAPING: { title: "Hút thuốc lá / thuốc lá điện tử trong buồng phòng", points: 20 },
    UNAUTHORIZED_GUEST: { title: "Đưa người lạ vào phòng qua đêm không đăng ký", points: 25 },
    HIGH_POWER_APPLIANCE: { title: "Sử dụng thiết bị điện công suất lớn trái phép", points: 15 },
    OTHER: { title: "Vi phạm nội quy khác", points: 5 },
  }

  const handleCreateDisciplineReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canApprove) {
      showToast("Chỉ Ban Quản lý được lập biên bản kỷ luật.")
      return
    }
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
        vioDescription.trim() || `Lập biên bản vi phạm: ${infractionInfo.title}.`,
      officerName: user?.fullName || "Thầy Vũ Thành Nam",
      status: "RECORDED",
    }

    setViolations([newRecord, ...violations])

    // Update demerit score
    setDemerits((prev) => {
      const existing = prev.find((d) => d.studentId === vioStudentId)
      if (existing) {
        const newDeducted = existing.totalDeducted + infractionInfo.points
        const remaining = Math.max(0, 100 - newDeducted)
        const newStatus = remaining < 70 ? "SUSPENDED" : remaining < 80 ? "WARNING" : "NORMAL"
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
            status: remaining < 70 ? "SUSPENDED" : remaining < 80 ? "WARNING" : "NORMAL",
            violationCount: 1,
          },
        ]
      }
    })

    setVioDescription("")
    showToast(`Đã lập biên bản ${newRecord.id} và trừ ${infractionInfo.points} điểm của ${student.name}!`)
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl bg-foreground text-background px-4 py-3 shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="dms-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-foreground border border-border shadow-xs">
              <ClockAlert className="h-7 w-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-0.5 text-[11px] font-bold text-foreground">
                <span>An ninh · Kỷ luật nội trú</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
                Giới nghiêm 23:00 & Kỷ luật nội trú
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cổng bảo vệ quét thẻ đối chiếu • Đơn vắng mặt nộp trước 21:00 • Trừ điểm rèn luyện (100đ chuẩn)
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/90 px-4 py-2.5 text-right shadow-xs shrink-0">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Phụ trách an ninh:
            </p>
            <p className="text-xs font-bold text-foreground flex items-center justify-end gap-1 mt-0.5">
              <span>Đinh Thanh Trung</span>
            </p>
            {isGuardOrManager && (
              <p className="text-[10px] text-success-soft-foreground font-bold mt-0.5">
                Trực ban: {user?.fullName}
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-xs">
          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <p className="text-muted-foreground text-[11px] font-medium">Lượt quẹt thẻ cổng</p>
            <p className="text-2xl font-black text-foreground mt-1">{gateLogs.length}</p>
            <span className="text-[10px] text-muted-foreground">Ca trực hôm nay</span>
          </div>
          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <p className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> Đơn về muộn đã duyệt
            </p>
            <p className="text-2xl font-black text-foreground mt-1">
              {requests.filter((r) => r.status === "APPROVED").length}
            </p>
            <span className="text-[10px] text-muted-foreground">Hợp lệ ra vào ngoài giờ</span>
          </div>
          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <p className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
              <TriangleAlert className="h-3.5 w-3.5" /> SV bị cảnh cáo (&gt;20đ)
            </p>
            <p className="text-2xl font-black text-foreground mt-1">
              {demerits.filter((d) => d.status === "WARNING").length}
            </p>
            <span className="text-[10px] text-muted-foreground">Cần nhắc nhở rèn luyện</span>
          </div>
          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <p className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
              <UserX className="h-3.5 w-3.5" /> Đình chỉ kỳ sau (&gt;30đ)
            </p>
            <p className="text-2xl font-black text-foreground mt-1">
              {demerits.filter((d) => d.status === "SUSPENDED").length}
            </p>
            <span className="text-[10px] text-muted-foreground">Không xét duyệt KTX kỳ tới</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex rounded-2xl bg-muted/60 p-1 border border-border gap-1 overflow-x-auto">
        {isGuardOrManager && (
          <button
            onClick={() => setActiveTab("GATE_SCAN")}
            className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all ${
              activeTab === "GATE_SCAN"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Scan className="h-3.5 w-3.5 text-danger shrink-0" />
            <span className="truncate">Quét thẻ cổng</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("REQUESTS")}
          className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all ${
            activeTab === "REQUESTS"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">{isGuardOrManager ? "Duyệt đơn về muộn" : "Đơn về muộn của tôi"}</span>
        </button>

        <button
          onClick={() => setActiveTab("DISCIPLINE")}
          className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all ${
            activeTab === "DISCIPLINE"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">{isGuardOrManager ? "Sổ kỷ luật" : "Điểm rèn luyện"}</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CỔNG BẢO VỆ QUÉT THẺ TRỰC TIẾP */}
      {/* ========================================================= */}
      {activeTab === "GATE_SCAN" && (
        <div className="space-y-6">
          {/* Main Console Box */}
          <div className="rounded-3xl border border-danger/25 bg-card p-5 sm:p-6 shadow-sm space-y-6">
            {/* Top Bar of Console */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-danger-soft-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Bàn Trực Cổng Bảo Vệ (Security Gate Console)
                </span>
                <h2 className="text-xl font-black text-foreground">
                  Hệ Thống Tra Cứu Thẻ & Đối Chiếu Giờ Giới Nghiêm
                </h2>
              </div>

              {/* Digital Clock & Simulation Controls */}
              <div className="flex items-center gap-3 bg-muted/60 p-2.5 rounded-2xl border border-border">
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase">
                    Đồng hồ điểm danh
                  </span>
                  <span
                    className={`font-mono text-xl font-black ${
                      simulatedHour >= 23 ? "text-danger-soft-foreground animate-pulse" : "text-success-soft-foreground"
                    }`}
                  >
                    {String(simulatedHour).padStart(2, "0")}:{String(simulatedMinute).padStart(2, "0")}
                  </span>
                </div>
                <div className="border-l border-border pl-3 flex flex-col gap-1">
                  <span className="text-[9px] text-muted-foreground font-semibold">Giả lập giờ test:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSimulatedHour(22)
                        setSimulatedMinute(30)
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        simulatedHour === 22
                          ? "bg-success text-white"
                          : "bg-background border border-border hover:bg-muted"
                      }`}
                    >
                      22:30 (Đúng giờ)
                    </button>
                    <button
                      onClick={() => {
                        setSimulatedHour(23)
                        setSimulatedMinute(35)
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        simulatedHour === 23
                          ? "bg-danger text-white"
                          : "bg-background border border-border hover:bg-muted"
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
                  onClick={() => handleScanCard("QE202049")}
                  className="rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary-soft-foreground dark:text-primary-soft-foreground flex items-center gap-1.5"
                >
                  <span>QE202049 (Nguyễn Hoàng Vinh - Có đơn duyệt hợp lệ)</span>
                </button>
                <button
                  onClick={() => handleScanCard("QE202053")}
                  className="rounded-xl border border-danger/25 bg-danger/10 hover:bg-danger/20 px-3 py-1.5 text-xs font-semibold text-danger-soft-foreground flex items-center gap-1.5"
                >
                  <span>QE202053 (Lê Minh Tuấn - KHÔNG CÓ ĐƠN ➔ Vi phạm)</span>
                </button>
                <button
                  onClick={() => handleScanCard("QE202050")}
                  className="rounded-xl border border-primary/25 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary-soft-foreground flex items-center gap-1.5"
                >
                  <span>QE202050 (Trần Thanh Nguyên - Về quê qua đêm)</span>
                </button>
                <button
                  onClick={() => handleScanCard("QE202054")}
                  className="rounded-xl border border-border bg-muted/60 hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <span>QE202054 (Phạm Quốc Bảo - Phòng A203)</span>
                </button>
              </div>
            </div>

            {/* Card Scan Input Form */}
            <p className="text-[11px] text-muted-foreground">
              Mã QR chuẩn cổng: <code className="font-mono">{buildGateQrPayload("QE202049", new Date().toISOString().slice(0, 16))}</code> ·
              Logic đối chiếu dùng <code className="font-mono">evaluateGateScan()</code> (trước 23:00 hợp lệ, sau 23:00 cần đơn duyệt).
              Vắng mặt quá giờ: <code className="font-mono">{findOverdueAbsentees(gateLogs.map((g) => ({ studentId: g.studentId, scanHour: 22 })), ["QE202049", "QE202050"], simulatedHour).join(", ") || "không có"}</code>
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Scan className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={scanInputMssv}
                  onChange={(e) => setScanInputMssv(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScanCard()}
                  placeholder="Nhập MSSV hoặc quét barcode thẻ sinh viên…"
                  className="rounded-2xl pl-10 pr-4 font-mono uppercase focus:outline-hidden focus:ring-danger/30"
                />
              </div>
              <Button variant="destructive" className="hover:bg-danger flex" onClick={() => handleScanCard()}>
                <Scan className="h-4 w-4" />
                <span>Quẹt Thẻ Cổng (Scan)</span>
              </Button>
            </div>

            {/* LIVE SCAN RESULT BANNER */}
            {scanResult && (
              <div
                className={`p-5 rounded-2xl border transition-all animate-in zoom-in-95 ${
                  scanResult.status === "ON_TIME"
                    ? "bg-success/10 border-success/25 text-success-soft-foreground "
                    : scanResult.status === "APPROVED_LATE"
                    ? "bg-primary/10 border-primary/40 text-primary-soft-foreground"
                    : "bg-danger/15 border-danger/25 text-danger-soft-foreground  shadow-md"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-2xl shrink-0 ${
                      scanResult.status === "ON_TIME"
                        ? "bg-success/20 text-success-soft-foreground"
                        : scanResult.status === "APPROVED_LATE"
                        ? "bg-primary/20 text-primary"
                        : "bg-danger/20 text-danger-soft-foreground animate-bounce"
                    }`}
                  >
                    {scanResult.status === "ON_TIME" && <CircleCheck className="h-8 w-8" />}
                    {scanResult.status === "APPROVED_LATE" && <ShieldCheck className="h-8 w-8" />}
                    {scanResult.status === "UNAUTHORIZED_LATE" && <TriangleAlert className="h-8 w-8" />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-sm tracking-wide uppercase">
                        {scanResult.status === "ON_TIME" && "CHECK-IN THÀNH CÔNG: VỀ ĐÚNG GIỜ"}
                        {scanResult.status === "APPROVED_LATE" &&
                          "HỢP LỆ THEO ĐƠN: VỀ MUỘN CÓ PHÉP ĐÃ DUYỆT"}
                        {scanResult.status === "UNAUTHORIZED_LATE" &&
                          "CẢNH BÁO AN NINH: VI PHẠM GIỜ GIỚI NGHIÊM 23:00!"}
                      </span>
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-background/80">
                        {scanResult.timestamp}
                      </span>
                    </div>

                    <p className="text-xs">
                      Sinh viên: <strong>{scanResult.studentName}</strong> • MSSV:{" "}
                      <strong>{scanResult.studentId}</strong> • Phòng: <strong>{scanResult.room}</strong>
                    </p>

                    <p className="text-xs font-medium pt-1 leading-relaxed opacity-90">
                      {scanResult.details}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Access Logs Table */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                Lịch Sử Quẹt Thẻ Cổng Thời Gian Thực (Recent Gate Logs)
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {gateLogs.length} lượt ghi nhận
              </span>
            </div>

            <div className="bleed-x-6 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2.5 align-middle">Thời gian</th>
                    <th className="whitespace-nowrap px-3 py-2.5 align-middle">MSSV</th>
                    <th className="whitespace-nowrap px-3 py-2.5 align-middle">Họ và Tên</th>
                    <th className="whitespace-nowrap px-3 py-2.5 align-middle">Phòng</th>
                    <th className="whitespace-nowrap px-3 py-2.5 align-middle">Kết quả đối chiếu</th>
                    <th className="whitespace-nowrap px-3 py-2.5 align-middle">Ghi chú an ninh</th>
                    <th className="whitespace-nowrap px-3 py-2.5 align-middle text-right">Bảo vệ ca trực</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {gateLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30">
                      <td className="whitespace-nowrap px-3 py-2.5 align-middle font-mono text-[11px] font-semibold text-muted-foreground">
                        {log.scanTimeFormatted}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 align-middle font-mono font-bold text-foreground">{log.studentId}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 align-middle font-semibold text-foreground">{log.studentName}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 align-middle">{log.room}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 align-middle">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                            log.curfewStatus === "ON_TIME"
                              ? "bg-success/10 text-success-soft-foreground "
                              : log.curfewStatus === "APPROVED_LATE"
                              ? "bg-primary/10 text-primary-soft-foreground dark:text-primary-soft-foreground"
                              : "bg-danger/15 text-danger-soft-foreground  border border-danger/25"
                          }`}
                        >
                          {log.curfewStatus === "ON_TIME" && "Đúng giờ (Trước 23h)"}
                          {log.curfewStatus === "APPROVED_LATE" && "Có đơn duyệt"}
                          {log.curfewStatus === "UNAUTHORIZED_LATE" && "Vi phạm (-10đ)"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 align-middle text-muted-foreground text-[11px] max-w-xs truncate">
                        {log.guardNotes}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 align-middle text-right text-muted-foreground text-[11px]">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left Column: Submit Request Form */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3 text-primary">
              <FileText className="h-5 w-5" />
              <h3 className="font-bold text-sm text-foreground">
                Nộp đơn vắng mặt / về muộn
              </h3>
            </div>

            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/25 text-[11px] leading-relaxed text-primary-soft-foreground">
              <p className="flex items-start gap-1.5">
                <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span><strong>Quy định nộp đơn:</strong> Đơn phải nộp <strong>trước 21:00</strong> ngày vắng mặt. Nộp sau 21:00 hệ thống sẽ gắn cờ nộp muộn và có thể bị từ chối.</span>
              </p>
            </div>

            <form onSubmit={handleSubmitCurfewRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-foreground">Loại đơn</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setReqType("LATE_RETURN")}
                    className={`py-2 px-3 rounded-xl border text-center font-bold ${
                      reqType === "LATE_RETURN"
                        ? "border-primary bg-primary/10 text-primary-soft-foreground dark:text-primary-soft-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    Về muộn (Trước 01:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReqType("OVERNIGHT")}
                    className={`py-2 px-3 rounded-xl border text-center font-bold ${
                      reqType === "OVERNIGHT"
                        ? "border-primary bg-primary/10 text-primary-soft-foreground dark:text-primary-soft-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    Vắng qua đêm / Về quê
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Ngày vắng</label>
                  <Input
                    type="date"
                    value={reqDate}
                    onChange={(e) => setReqDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Giờ về dự kiến</label>
                  <Input
                    type="text"
                    value={reqTime}
                    onChange={(e) => setReqTime(e.target.value)}
                    placeholder="23:45"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground">Mục đích lý do</label>
                <Select
                  value={reqCategory}
                  onChange={(e) => setReqCategory(e.target.value as CurfewReasonCategory)}
                  className="mt-1"
                >
                  <option value="STUDY">Học tập / Làm đồ án môn học Capstone</option>
                  <option value="PART_TIME_JOB">Làm thêm ca tối có hợp đồng</option>
                  <option value="HOME_VISIT">Về quê / Thăm gia đình cuối tuần</option>
                  <option value="MEDICAL">Khám chữa bệnh / Lý do y tế</option>
                  <option value="FAMILY_EVENT">Việc hiếu hỉ thân nhân</option>
                  <option value="OTHER">Lý do khác</option>
                </Select>
              </div>

              <div>
                <label className="font-semibold text-foreground">Giải trình chi tiết lý do</label>
                <Textarea
                  rows={2}
                  value={reqDetail}
                  onChange={(e) => setReqDetail(e.target.value)}
                  placeholder="Ghi rõ địa điểm học tập/làm việc, người cùng đi..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground">Số điện thoại phụ huynh xác nhận</label>
                <Input
                  type="text"
                  value={reqParentPhone}
                  onChange={(e) => setReqParentPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="parentConfirmedCheck"
                  checked={reqParentConfirmed}
                  onChange={(e) => setReqParentConfirmed(e.target.checked)}
                  className="rounded text-primary"
                />
                <label htmlFor="parentConfirmedCheck" className="text-[11px] text-muted-foreground">
                  Phụ huynh đã được thông báo và đồng ý
                </label>
              </div>

              <Button className="w-full mt-2" type="submit">
                Gửi Đơn Xin Phép
              </Button>
            </form>
          </div>

          {/* Right Column: List of Requests with Manager Action Buttons */}
          <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">
                {isGuardOrManager
                  ? `Danh Sách Đơn Cần Phê Duyệt (${requests.length})`
                  : `Các Đơn Của Tôi Đã Nộp (${requests.filter((r) => r.studentId === (user?.studentId || "QE202049")).length})`}
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
                : requests.filter((r) => r.studentId === (user?.studentId || "QE202049"))
              ).map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-border bg-muted/20 space-y-2.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded-md">
                        {req.id}
                      </span>
                      <span className="font-bold text-xs text-foreground">
                        {req.studentName} ({req.studentId})
                      </span>
                      <span className="text-[11px] text-muted-foreground">• Phòng {req.room}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Before 21:00 badge */}
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          req.isSubmittedBefore2100
                            ? "bg-success/10 text-success-soft-foreground "
                            : "bg-danger/10 text-danger-soft-foreground"
                        }`}
                      >
                        {req.isSubmittedBefore2100 ? "Nộp trước 21:00" : "Nộp muộn sau 21:00"}
                      </span>

                      {/* Status */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === "APPROVED"
                            ? "bg-success text-white"
                            : req.status === "REJECTED"
                            ? "bg-danger text-white"
                            : "bg-primary/20 text-primary-soft-foreground  border border-primary/25"
                        }`}
                      >
                        {req.status === "APPROVED" && "Đã phê duyệt"}
                        {req.status === "REJECTED" && "Đã từ chối"}
                        {req.status === "PENDING" && "Chờ duyệt"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-foreground font-medium">
                    Lý do: <span className="text-muted-foreground">{req.reasonDetail}</span>
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                    <div>
                      <span>Ngày: <strong>{req.date}</strong></span> • <span>Dự kiến về: <strong>{req.expectedReturnTime}</strong></span> • <span>Phụ huynh: {req.parentPhone}</span>
                    </div>

                    {/* Review Actions: chỉ quản lý/admin duyệt. Bảo vệ chỉ quét cổng. */}
                    {canApprove && req.status === "PENDING" && (
                      <div className="flex gap-1.5 mt-1 sm:mt-0">
                        <Button variant="success" className="py-1 hover:bg-success" onClick={() => handleReviewRequest(req.id, "APPROVED")}>
                          Duyệt đơn
                        </Button>
                        <Button variant="destructive" className="py-1 hover:bg-danger" onClick={() => handleReviewRequest(req.id, "REJECTED")}>
                          Từ chối
                        </Button>
                      </div>
                    )}

                    {!isGuardOrManager && req.status === "PENDING" && (
                      <span className="text-[11px] font-semibold text-primary-soft-foreground mt-1 sm:mt-0">
                        Đang được BQL xem xét
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {(isGuardOrManager
                ? requests
                : requests.filter((r) => r.studentId === (user?.studentId || "QE202049"))
              ).length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-xs rounded-2xl border border-dashed border-border bg-muted/10">
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
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success-soft-foreground" />
                  Bảng Theo Dõi Điểm Rèn Luyện Lưu Trú KTX (100 Điểm Ban Đầu)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Quy chế: Bị trừ &gt; 20 điểm (Cảnh cáo) • Bị trừ &gt; 30 điểm (Đình chỉ lưu trú kỳ sau)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(isGuardOrManager
                ? demerits
                : demerits.filter((d) => d.studentId === (user?.studentId || "QE202049"))
              ).map((student) => {
                const percent = student.remainingPoints
                const isWarning = student.status === "WARNING"
                const isSuspended = student.status === "SUSPENDED"

                return (
                  <div
                    key={student.studentId}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSuspended
                        ? "border-danger/25 bg-danger/5"
                        : isWarning
                        ? "border-primary/25 bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-muted-foreground font-bold">
                          {student.studentId}
                        </span>
                        <h4 className="font-bold text-xs text-foreground">{student.studentName}</h4>
                        <span className="text-[10px] text-muted-foreground">Phòng {student.room}</span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xl font-black ${
                            isSuspended
                              ? "text-danger-soft-foreground"
                              : isWarning
                              ? "text-primary-soft-foreground"
                              : "text-success-soft-foreground"
                          }`}
                        >
                          {student.remainingPoints}
                        </span>
                        <span className="text-[10px] text-muted-foreground">/100đ</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isSuspended ? "bg-danger" : isWarning ? "bg-primary" : "bg-success"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">
                        Đã trừ: <strong>{student.totalDeducted}đ</strong> ({student.violationCount} lần)
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full ${
                          isSuspended
                            ? "bg-danger text-white"
                            : isWarning
                            ? "bg-primary/20 text-primary-soft-foreground "
                            : "bg-success/10 text-success-soft-foreground "
                        }`}
                      >
                        {isSuspended ? "ĐÌNH CHỈ KỲ SAU" : isWarning ? "CẢNH BÁO CẤP 1" : "TỐT"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form lập biên bản: bảo vệ ghi nhận tuần tra, chỉ quản lý duyệt kỷ luật */}
          {isGuardOrManager ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3 text-danger-soft-foreground">
                  <TriangleAlert className="h-5 w-5" />
                  <h3 className="font-bold text-sm text-foreground">
                    Lập biên bản vi phạm trực tuyến
                  </h3>
                </div>

              <form onSubmit={handleCreateDisciplineReport} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-foreground">Sinh viên vi phạm</label>
                  <Select
                    value={vioStudentId}
                    onChange={(e) => setVioStudentId(e.target.value)}
                    className="mt-1"
                  >
                    <option value="QE202053">QE202053 - Lê Minh Tuấn (A204)</option>
                    <option value="QE202056">QE202056 - Đoàn Gia Bảo (A201)</option>
                    <option value="QE202057">QE202057 - Ngô Văn Khải (A302)</option>
                    <option value="QE202049">QE202049 - Nguyễn Hoàng Vinh (A205)</option>
                  </Select>
                </div>

                <div>
                  <label className="font-semibold text-foreground">Hành vi vi phạm nội quy</label>
                  <Select
                    value={vioType}
                    onChange={(e) => setVioType(e.target.value as InfractionType)}
                    className="mt-1 font-semibold"
                  >
                    <option value="CURFEW_VIOLATION">Vi phạm giờ giới nghiêm 23:00 (-10đ)</option>
                    <option value="UNAUTHORIZED_COOKING">Nấu ăn sai quy định trong phòng (-15đ)</option>
                    <option value="NOISE_AFTER_HOURS">Làm ồn loa kéo sau 22:30 (-10đ)</option>
                    <option value="SMOKING_VAPING">Hút thuốc lá / Pod trong phòng (-20đ)</option>
                    <option value="UNAUTHORIZED_GUEST">Đưa người lạ ngủ qua đêm (-25đ)</option>
                    <option value="HIGH_POWER_APPLIANCE">Thiết bị điện quá tải 1500W (-15đ)</option>
                    <option value="OTHER">Vi phạm khác (-5đ)</option>
                  </Select>
                </div>

                <div>
                  <label className="font-semibold text-foreground">Mô tả biên bản hiện trường</label>
                  <Textarea
                    rows={3}
                    value={vioDescription}
                    onChange={(e) => setVioDescription(e.target.value)}
                    placeholder="Ghi nhận biên bản tuần tra, tang vật thu giữ nếu có..."
                    className="mt-1"
                  />
                </div>

                <Button variant="destructive" className="w-full mt-2 hover:bg-danger" type="submit">
                  Ký Biên Bản & Trừ Điểm
                </Button>
              </form>
            </div>

            {/* List of Violation Records */}
            <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">
                  Danh Sách Biên Bản Xử Lý Kỷ Luật ({violations.length})
                </h3>
                <span className="text-xs text-muted-foreground font-mono">Lưu trữ chính thức KTX</span>
              </div>

              <div className="space-y-3">
                {violations.map((vio) => (
                  <div
                    key={vio.id}
                    className="p-4 rounded-2xl border border-border bg-muted/20 space-y-2 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded-md">
                          {vio.id}
                        </span>
                        <span className="font-bold text-xs text-foreground">
                          {vio.studentName} ({vio.studentId})
                        </span>
                        <span className="text-[11px] text-muted-foreground">• Phòng {vio.room}</span>
                      </div>

                      <span className="font-bold text-xs text-danger-soft-foreground bg-danger/10 px-2 py-0.5 rounded-md">
                        -{vio.pointsDeducted} điểm
                      </span>
                    </div>

                    <p className="font-semibold text-xs text-foreground">{vio.infractionTitle}</p>
                    <p className="text-xs text-muted-foreground">{vio.description}</p>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                      <span>Cán bộ lập: {vio.officerName}</span>
                      <span className="font-mono">{vio.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          ) : (
            <div className="p-6 rounded-3xl border border-success/25 bg-success/5 text-xs text-foreground space-y-3">
              <h4 className="font-bold text-sm text-success-soft-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Quy Chế Khen Thưởng & Kỷ Luật Sinh Viên Nội Trú
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Mỗi sinh viên bắt đầu học kỳ với 100 điểm rèn luyện. Việc chấp hành đúng giờ giới nghiêm 23:00 và bảo quản tốt trang thiết bị phòng ở sẽ giúp duy trì điểm số tối đa, làm căn cứ ưu tiên xét chọn phòng và giường ở các học kỳ tiếp theo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
