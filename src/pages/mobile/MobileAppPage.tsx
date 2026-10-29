import React, { useState, useEffect } from "react"
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
  Bell,
  Sun,
  Send,
  Copy,
  Check,
  Flame,
  Radio,
} from "lucide-react"

type SubTab = "vietqr" | "repair"

export const MobileAppPage: React.FC = () => {
  const { user } = useAuth()

  // App mode determined automatically by user role
  const appRole =
    user?.role === "manager" || user?.role === "admin" ? "guard" : "student"
  const [subTab, setSubTab] = useState<SubTab>("vietqr")

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
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)

  // Camera Quick Repair state
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [repairCategory, setRepairCategory] = useState("dien")
  const [repairNote, setRepairNote] = useState("")
  const [repairSubmitted, setRepairSubmitted] = useState(false)

  // Late Request form state
  const [lateReason, setLateReason] = useState("do_an")
  const [expectedTime, setExpectedTime] = useState("23:45")
  const [lateNote, setLateNote] = useState("")
  const [lateSubmitted, setLateSubmitted] = useState(false)
  const [lateRequestsList, setLateRequestsList] = useState([
    {
      id: "LAT-0924",
      date: "Hôm qua (28/10)",
      time: "23:45",
      reason: "Học nhóm đồ án Capstone K19",
      status: "approved",
      code: "LAT-OK-882",
    },
  ])

  // Guard Scanner state
  const [guardScanResult, setGuardScanResult] = useState<{
    status: "success" | "warning" | "danger" | null
    name: string
    studentId: string
    room: string
    time: string
    message: string
  }>({
    status: null,
    name: "",
    studentId: "",
    room: "",
    time: "",
    message: "",
  })
  const [guardHistory, setGuardHistory] = useState([
    {
      name: "Phạm Minh Hoàng",
      id: "SE183011",
      room: "A204",
      time: "21:35:12",
      status: "success",
    },
    {
      name: "Lê Thị Thảo",
      id: "SS170421",
      room: "B102",
      time: "21:32:05",
      status: "success",
    },
    {
      name: "Trần Bảo Long",
      id: "SE172901",
      room: "A301",
      time: "21:28:44",
      status: "warning",
    },
  ])

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

  // Dynamic QR code timer countdown (60s loop)
  useEffect(() => {
    const qrTimer = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          setQrToken(
            "HMAC-" + Math.random().toString(36).substring(2, 10).toUpperCase()
          )
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(qrTimer)
  }, [])

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

  // Simulate passing through gate turnstile
  const triggerPassGate = () => {
    setGateOpenSuccess(true)
    setTimeout(() => {
      setGateOpenSuccess(false)
    }, 3500)
  }

  // Guard test scanner action
  const handleGuardScan = (type: "valid" | "late" | "expired") => {
    const timeStr = currentTime.toLocaleTimeString("vi-VN")
    if (type === "valid") {
      setGuardScanResult({
        status: "success",
        name: "Nguyễn Hoàng Vinh",
        studentId: "SE182049",
        room: "A205 - Giường G03",
        time: timeStr,
        message: "HỢP LỆ · CỬA XOAY ĐÃ MỞ (0.3s)",
      })
      setGuardHistory((prev) => [
        {
          name: "Nguyễn Hoàng Vinh",
          id: "SE182049",
          room: "A205",
          time: timeStr,
          status: "success",
        },
        ...prev.slice(0, 4),
      ])
    } else if (type === "late") {
      setGuardScanResult({
        status: "warning",
        name: "Trần Minh Quân",
        studentId: "SE174201",
        room: "A205 - Giường G01",
        time: timeStr,
        message: "VỀ MUỘN CÓ PHÉP (ĐÃ DUYỆT ĐƠN #LAT-0988) · MỜI VÀO",
      })
      setGuardHistory((prev) => [
        {
          name: "Trần Minh Quân",
          id: "SE174201",
          room: "A205",
          time: timeStr,
          status: "warning",
        },
        ...prev.slice(0, 4),
      ])
    } else {
      setGuardScanResult({
        status: "danger",
        name: "Lê Quốc Bảo",
        studentId: "SE160999",
        room: "A102 - Giường G02",
        time: timeStr,
        message: "MÃ QR HẾT HẠN HOẶC CHƯA XIN PHÉP VỀ MUỘN · GIỮ LẠI XÁC MINH",
      })
      setGuardHistory((prev) => [
        {
          name: "Lê Quốc Bảo",
          id: "SE160999",
          room: "A102",
          time: timeStr,
          status: "danger",
        },
        ...prev.slice(0, 4),
      ])
    }
  }

  // Quick photo capture simulation
  const handleSimulateCapture = () => {
    setCapturedPhoto(
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
    )
  }

  // Submit late request
  const handleLateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newCode = "LAT-" + Math.floor(1000 + Math.random() * 9000)
    setLateSubmitted(true)
    setLateRequestsList((prev) => [
      {
        id: newCode,
        date: "Hôm nay (" + currentTime.toLocaleDateString("vi-VN") + ")",
        time: expectedTime,
        reason:
          lateReason === "do_an"
            ? "Học nhóm đồ án Capstone K19"
            : lateReason === "lam_them"
              ? "Làm thêm ca tối sinh viên"
              : lateReason === "xe_bus"
                ? "Chuyến xe buýt cuối bị trễ"
                : "Việc gia đình đột xuất",
        status: "approved",
        code: newCode + "-OK",
      },
      ...prev,
    ])
    setTimeout(() => setLateSubmitted(false), 4000)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <div className="pointer-events-none absolute -top-16 -right-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-40 h-60 w-60 rounded-full bg-secondary/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:text-emerald-400">
              <QrCode className="h-3.5 w-3.5" />
              <span>Hệ thống Kiểm Soát An Ninh Cổng 24/7 · Cửa Xoay Tự Động</span>
            </div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Thẻ QR Ra Vào Cổng & Giờ Giới Nghiêm
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotificationModal(true)}
              className="h-9 gap-1.5 rounded-xl border-border text-xs"
            >
              <Bell className="h-3.5 w-3.5 text-primary" />
              <span>Thông báo</span>
            </Button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CHẾ ĐỘ 1: GIAO DIỆN SINH VIÊN (STUDENT VIEW)
          ========================================================================= */}
      {appRole === "student" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* CỘT TRÁI (7 COLS): THẺ QR SINH TRẮC HỌC ĐỘNG NỔI BẬT TRỰC TIẾP TRÊN NỀN */}
          <div className="space-y-6 lg:col-span-7">
            <div
              className={`relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-md transition-all sm:p-8 ${
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
                  <div className="relative h-60 w-60 sm:h-64 sm:w-64">
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
                  <span className="font-bold text-foreground">Nguyễn Hoàng Vinh</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mã số sinh viên (MSSV):</span>
                  <span className="font-mono font-bold text-foreground">SE182049</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vị trí phòng & buồng:</span>
                  <span className="font-semibold text-primary dark:text-emerald-400">
                    Tòa A (High-Rise) · Phòng A205 · Buồng B · Giường G03
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

              {/* Action: Simulate Turnstile Check */}
              <div className="mt-5 space-y-3">
                <Button
                  onClick={triggerPassGate}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-sm rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Radio className="h-4 w-4 animate-pulse" />
                  <span>Mô phỏng quét mã qua cổng xoay an ninh</span>
                </Button>

                {gateOpenSuccess && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-4 text-emerald-800 dark:text-emerald-200 animate-in zoom-in-95">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white font-bold">
                      <Check className="h-5 w-5 stroke-[3]" />
                    </div>
                    <div>
                      <p className="font-bold text-xs sm:text-sm">
                        CỔNG XOAY ĐÃ MỞ (TURNSTILE BARRIER OPENED)
                      </p>
                      <p className="text-xs opacity-90">
                        Xác thực danh tính sinh viên thành công lúc {currentTime.toLocaleTimeString("vi-VN")}. Mời bạn bước qua cổng!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (5 COLS): GIỜ GIỚI NGHIÊM 23:00 & TIỆN ÍCH DI ĐỘNG */}
          <div className="space-y-6 lg:col-span-5">
            {/* CARD 1: ĐẾM NGƯỢC GIỚI NGHIÊM & ĐƠN XIN VỀ MUỘN */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
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

              <p className="text-xs text-muted-foreground leading-relaxed">
                Sau 23:00, cửa xoay chính sẽ tự động khóa. Sinh viên cần gửi đơn xin về muộn để được hệ thống tự động cấp mã QR mở cửa cổng an ninh phụ.
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
                        onClick={() => setLateReason(item.id)}
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
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Gửi đơn duyệt tự động (Instant Pass)</span>
                </Button>
              </form>

              {lateSubmitted && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3 text-xs text-emerald-800 dark:text-emerald-200 animate-in zoom-in-95">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Đơn đã được hệ thống BQL phê duyệt tự động!
                  </p>
                  <p className="mt-1 text-[11px] opacity-90">
                    Mã thông hành: <strong>LAT-AUTO-2026</strong>. Bạn có thể xuất trình mã QR này để qua cổng sau 23:00 mà không bị trừ điểm rèn luyện.
                  </p>
                </div>
              )}

              {/* Lịch sử đơn */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Lịch sử đơn xin về muộn:
                </span>
                {lateRequestsList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-2.5 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{item.reason}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.date} · Giờ về: {item.time}
                      </p>
                    </div>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary dark:text-emerald-400">
                      {item.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 2: TIỆN ÍCH VIETQR ĐIỆN NƯỚC & CAMERA BÁO HỎNG */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
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
          </div>
        </div>
      )}

      {/* =========================================================================
          CHẾ ĐỘ 2: GIAO DIỆN BẢO VỆ TRỰC CỔNG (GUARD CHECKPOINT VIEW)
          ========================================================================= */}
      {appRole === "guard" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* CỘT TRÁI (7 COLS): MÀN HÌNH QUÉT MÃ TỐC ĐỘ CAO TRỰC TIẾP TRÊN NỀN */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-sky-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary dark:text-sky-400">
                    Camera Máy Quét Thẻ Cổng An Ninh · Tốc Độ &lt; 0.3s
                  </span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  CỔNG CHÍNH TÒA A
                </span>
              </div>

              {/* Live Scanner Viewport */}
              <div className="relative h-64 overflow-hidden rounded-2xl border-2 border-dashed border-secondary/50 bg-slate-950 flex flex-col items-center justify-center">
                <div className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_16px_#22d3ee] animate-bounce" />
                <div className="h-40 w-40 rounded-2xl border-2 border-dashed border-cyan-400/60 flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-cyan-400/50 animate-pulse" />
                </div>
                <div className="absolute bottom-3 rounded-md bg-black/70 px-3 py-1 text-xs text-slate-300">
                  Hướng camera vào mã QR trên điện thoại sinh viên
                </div>
              </div>

              {/* Simulation Test Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Mô phỏng quẹt thẻ kiểm tra:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleGuardScan("valid")}
                    className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 p-2.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-colors"
                  >
                    ✅ SV Hợp lệ
                  </button>
                  <button
                    onClick={() => handleGuardScan("late")}
                    className="rounded-xl border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 p-2.5 text-center text-xs font-bold text-amber-600 dark:text-amber-400 transition-colors"
                  >
                    ⚠️ Về muộn có phép
                  </button>
                  <button
                    onClick={() => handleGuardScan("expired")}
                    className="rounded-xl border border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 p-2.5 text-center text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors"
                  >
                    ❌ Chưa phép / Khóa
                  </button>
                </div>
              </div>

              {/* Scan Result Feedback Card */}
              {guardScanResult.status && (
                <div
                  className={`rounded-xl border p-4 text-xs animate-in zoom-in-95 ${
                    guardScanResult.status === "success"
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200"
                      : guardScanResult.status === "warning"
                        ? "border-amber-500/50 bg-amber-500/15 text-amber-900 dark:text-amber-200"
                        : "border-rose-500/50 bg-rose-500/15 text-rose-900 dark:text-rose-200"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span>{guardScanResult.message}</span>
                    <span className="font-mono text-xs">{guardScanResult.time}</span>
                  </div>
                  <div className="mt-2 text-xs space-y-0.5">
                    <p>
                      Sinh viên: <strong>{guardScanResult.name}</strong> ({guardScanResult.studentId})
                    </p>
                    <p>Phòng lưu trú: {guardScanResult.room}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI (5 COLS): NHẬT KÝ RA VÀO NGOẠI TUYẾN & THỐNG KÊ */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-foreground">Nhật Ký Quẹt Cổng (Offline Cache)</h3>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Đồng bộ 100%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-muted/40 p-3 text-center">
                  <span className="block font-mono text-2xl font-black text-foreground">842</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Lượt qua cổng hôm nay</span>
                </div>
                <div className="rounded-xl border border-border bg-muted/40 p-3 text-center">
                  <span className="block font-mono text-2xl font-black text-amber-600 dark:text-amber-400">48</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Đang ở ngoài khuôn viên</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Lượt quẹt gần nhất:
                </span>
                {guardHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {item.name} · <span className="font-mono text-muted-foreground">{item.id}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Phòng {item.room} · {item.time}
                      </p>
                    </div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        item.status === "success"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : item.status === "warning"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {item.status === "success" ? "Hợp Lệ" : item.status === "warning" ? "Có Phép" : "Cảnh Báo"}
                    </span>
                  </div>
                ))}
              </div>
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
                <Bell className="h-4 w-4 text-primary" />
                Thông Báo Đẩy Di Động (Push Notifications)
              </h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-600 dark:text-amber-400 text-[11px]">
                  <span>⏰ Nhắc nhở giờ giới nghiêm</span>
                  <span className="text-[10px] text-muted-foreground">22:00</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  KTX sẽ đóng cổng chính lúc 23:00. Hãy chủ động về phòng hoặc gửi đơn xin về muộn.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1">
                <div className="flex items-center justify-between font-bold text-secondary text-[11px]">
                  <span>⚡ Hóa đơn điện nước kỳ T10/2026</span>
                  <span className="text-[10px] text-muted-foreground">Hôm nay</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Phòng A205 đã có số liệu điện nước. Số tiền cần đóng của bạn: 167.500 đ.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                  <span>🛠️ Tiến độ sửa chữa thiết bị</span>
                  <span className="text-[10px] text-muted-foreground">Hôm qua</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Yêu cầu thay bóng đèn buồng B phòng A205 đã được KTV hoàn thành.
                </p>
              </div>
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
