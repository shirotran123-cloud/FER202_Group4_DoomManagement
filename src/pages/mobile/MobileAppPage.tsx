import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { Button } from "@/components/ui/button"
import {
  QrCode,
  Camera,
  Clock,
  Shield,
  ShieldCheck,
  Receipt,
  Wrench,
  CheckCircle2,
  RotateCw,
  ArrowLeft,
  ChevronRight,
  User,
  Bell,
  Sun,
  Wifi,
  Send,
  Copy,
  Check,
  Flame,
  Radio,
  FileCheck,
  Building2,
} from "lucide-react"

type MobileTab = "gate-pass" | "curfew" | "repair-camera" | "vietqr" | "guard-scanner"
type DeviceFrame = "iphone" | "android" | "fullscreen"

export const MobileAppPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // App mode & tab state
  const [activeTab, setActiveTab] = useState<MobileTab>("gate-pass")
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>("iphone")
  const [appRole, setAppRole] = useState<"student" | "guard">(
    user?.role === "manager" || user?.role === "admin" ? "guard" : "student"
  )

  // Clock & countdown state
  const [currentTime, setCurrentTime] = useState(new Date())
  const [qrCountdown, setQrCountdown] = useState(60)
  const [qrToken, setQrToken] = useState(() => "HMAC-" + Math.random().toString(36).substring(2, 10).toUpperCase())
  const [curfewCountdown, setCurfewCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 })

  // Interactive feedback states
  const [gateOpenSuccess, setGateOpenSuccess] = useState(false)
  const [isMaxBrightness, setIsMaxBrightness] = useState(false)
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
    { name: "Phạm Minh Hoàng", id: "SE183011", room: "A204", time: "21:35:12", status: "success" },
    { name: "Lê Thị Thảo", id: "SS170421", room: "B102", time: "21:32:05", status: "success" },
    { name: "Trần Bảo Long", id: "SE172901", room: "A301", time: "21:28:44", status: "warning" },
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
          setQrToken("HMAC-" + Math.random().toString(36).substring(2, 10).toUpperCase())
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
        { name: "Nguyễn Hoàng Vinh", id: "SE182049", room: "A205", time: timeStr, status: "success" },
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
        { name: "Trần Minh Quân", id: "SE174201", room: "A205", time: timeStr, status: "warning" },
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
        { name: "Lê Quốc Bảo", id: "SE160999", room: "A102", time: timeStr, status: "danger" },
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

  // Format digital time
  const timeFormatted = currentTime.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start p-2 sm:p-6 lg:p-8">
      {/* Top Controls Toolbar (Desktop & Tablet) */}
      <div className="w-full max-w-4xl mb-4 flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 border border-slate-700/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Quay lại Web
          </Button>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-white">
              Domanage Mobile App (React Native Expo Preview)
            </span>
          </div>
        </div>

        {/* Mode Switchers */}
        <div className="flex items-center gap-2">
          {/* Switch Role: Student vs Guard */}
          <div className="flex rounded-lg bg-slate-900/90 p-1 border border-slate-700">
            <button
              onClick={() => {
                setAppRole("student")
                setActiveTab("gate-pass")
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                appRole === "student"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sinh Viên
            </button>
            <button
              onClick={() => {
                setAppRole("guard")
                setActiveTab("guard-scanner")
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                appRole === "guard"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Bảo Vệ Cổng
            </button>
          </div>

          {/* Switch Device Bezel (Desktop only) */}
          <div className="hidden md:flex rounded-lg bg-slate-900/90 p-1 border border-slate-700">
            <button
              onClick={() => setDeviceFrame("iphone")}
              title="iPhone 16 Pro Frame"
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                deviceFrame === "iphone" ? "bg-slate-700 text-white" : "text-slate-400"
              }`}
            >
              iPhone
            </button>
            <button
              onClick={() => setDeviceFrame("android")}
              title="Google Pixel 9 Frame"
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                deviceFrame === "android" ? "bg-slate-700 text-white" : "text-slate-400"
              }`}
            >
              Android
            </button>
            <button
              onClick={() => setDeviceFrame("fullscreen")}
              title="Toàn màn hình di động"
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                deviceFrame === "fullscreen" ? "bg-slate-700 text-white" : "text-slate-400"
              }`}
            >
              Toàn Màn Hình
            </button>
          </div>
        </div>
      </div>

      {/* Main Mobile App Container */}
      <div
        className={`relative transition-all duration-300 ${
          deviceFrame === "fullscreen"
            ? "w-full max-w-md my-0"
            : deviceFrame === "android"
              ? "w-full max-w-[390px] rounded-[44px] p-2.5 bg-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[6px] border-neutral-700"
              : "w-full max-w-[400px] rounded-[52px] p-3 bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] border-[7px] border-neutral-700 ring-1 ring-white/10"
        }`}
      >
        {/* Phone Speaker & Dynamic Island / Camera Punch Hole */}
        {deviceFrame !== "fullscreen" && (
          <div className="relative w-full flex justify-center items-center pt-1 pb-1 z-50">
            {deviceFrame === "iphone" ? (
              <div className="h-6 w-28 bg-black rounded-full flex items-center justify-between px-2.5 shadow-inner">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-900 border border-slate-800" />
                <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  DMS
                </span>
                <span className="h-2 w-2 rounded-full bg-blue-950" />
              </div>
            ) : (
              <div className="h-3.5 w-3.5 rounded-full bg-black border border-neutral-700 shadow-inner" />
            )}
          </div>
        )}

        {/* SCREEN CONTENT */}
        <div
          className={`relative overflow-hidden flex flex-col bg-slate-950 text-slate-100 ${
            deviceFrame === "fullscreen"
              ? "rounded-2xl border border-slate-800 min-h-[780px]"
              : "rounded-[40px] h-[780px]"
          } ${isMaxBrightness ? "brightness-125" : ""}`}
        >
          {/* Mobile Top Status Bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-2 text-xs font-semibold text-slate-300 select-none z-30">
            <span>{timeFormatted}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 font-bold tracking-wider">5G</span>
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <div className="flex items-center">
                <div className="w-5 h-2.5 rounded-xs border border-slate-300 p-0.5 flex items-center">
                  <div className="w-3.5 h-full bg-emerald-400 rounded-2xs" />
                </div>
                <div className="w-0.5 h-1 bg-slate-300 rounded-r-xs" />
              </div>
            </div>
          </div>

          {/* App Header Bar */}
          <div className="px-5 py-2.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md z-30">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white shadow-md text-xs">
                {appRole === "student" ? "SE" : "BV"}
              </div>
              <div>
                <h2 className="text-xs font-bold text-white leading-tight">
                  {appRole === "student" ? "Nguyễn Hoàng Vinh" : "Đ/c Trực Cổng An Ninh"}
                </h2>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Building2 className="w-2.5 h-2.5 text-emerald-400" />
                  {appRole === "student" ? "KTX Tòa A · Phòng A205" : "Cổng Chính Trục Xoay"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMaxBrightness(!isMaxBrightness)}
                title="Tăng độ sáng tối đa"
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  isMaxBrightness
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowNotificationModal(true)}
                className="relative p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-slate-900" />
              </button>
            </div>
          </div>

          {/* MAIN SCROLLABLE APP BODY */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-24 text-slate-200">
            {/* =========================================================================
                TAB 1: THẺ CỔNG SINH TRẮC HỌC ĐỘNG (GATE PASS)
                ========================================================================= */}
            {activeTab === "gate-pass" && appRole === "student" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Gate Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 p-5 shadow-2xl">
                  {/* Glowing backdrop */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

                  {/* Header Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                      <ShieldCheck className="w-3 h-3" />
                      Dynamic Gate Pass
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      FPTU DORM • K19
                    </span>
                  </div>

                  {/* Dynamic Animated QR Code Box */}
                  <div className="relative mx-auto my-2 w-48 h-48 bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center border-4 border-emerald-500/40">
                    {/* Simulated SVG QR with real visual aesthetic */}
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <div className="grid grid-cols-6 gap-1 w-36 h-36 p-1 bg-slate-950 rounded-lg">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-2xs transition-colors duration-500 ${
                              i % 2 === 0 || i % 7 === 0 || i === 15 || i === 22
                                ? "bg-white"
                                : "bg-emerald-400"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Center Avatar Badge */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="h-9 w-9 rounded-full bg-slate-950 p-1 border-2 border-emerald-400 shadow-md flex items-center justify-center">
                          <span className="text-[10px] font-black text-emerald-400 tracking-tighter">
                            FPT
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scanning laser line animation */}
                    <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] animate-bounce" />
                  </div>

                  {/* Countdown Timer */}
                  <div className="mt-3 flex items-center justify-between text-xs px-2">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <RotateCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      <span>Tự động đổi mã sau:</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {qrCountdown}s
                    </span>
                  </div>

                  {/* Security Watermark Info */}
                  <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sinh viên:</span>
                      <span className="font-semibold text-white">Nguyễn Hoàng Vinh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">MSSV / Mã giường:</span>
                      <span className="font-mono text-emerald-300">SE182049 · A205-B-G03</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mã HMAC bảo mật:</span>
                      <span className="font-mono text-[10px] text-slate-400">{qrToken}</span>
                    </div>
                  </div>
                </div>

                {/* Gate Interaction Button */}
                <div className="space-y-2">
                  <Button
                    onClick={triggerPassGate}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    Mô phỏng qua cổng xoay tự động
                  </Button>

                  {/* Gate Open Success Notification Banner */}
                  {gateOpenSuccess && (
                    <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 flex items-center gap-3 animate-in zoom-in-95 duration-200">
                      <div className="h-8 w-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-white">CỔNG XOAY ĐÃ MỞ (TURNSTILE OPEN)</p>
                        <p className="text-[10px] text-emerald-200">
                          Xác thực sinh trắc học thành công · Xin mời bạn bước qua cổng!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Curfew Quick Widget */}
                <div
                  onClick={() => setActiveTab("curfew")}
                  className="cursor-pointer rounded-2xl bg-slate-900 border border-slate-800 p-3.5 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        Giờ giới nghiêm: 23:00 tối nay
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Còn {curfewCountdown.hours}h {curfewCountdown.minutes}m {curfewCountdown.seconds}s · Bấm để xin về muộn
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 2: ĐẾM NGƯỢC GIỚI NGHIÊM & ĐƠN XIN VỀ MUỘN (CURFEW)
                ========================================================================= */}
            {activeTab === "curfew" && appRole === "student" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Curfew Countdown Card */}
                <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 p-5 shadow-xl text-center space-y-3">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Flame className="w-3.5 h-3.5" />
                    Quy Định Giới Nghiêm KTX
                  </div>

                  <h3 className="text-sm font-semibold text-slate-300">
                    Thời gian đóng cổng chính KTX (23:00)
                  </h3>

                  <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto py-2">
                    <div className="bg-slate-950/80 rounded-xl p-2 border border-slate-800">
                      <span className="text-2xl font-black font-mono text-amber-400">
                        {String(curfewCountdown.hours).padStart(2, "0")}
                      </span>
                      <span className="block text-[9px] text-slate-400 uppercase">Giờ</span>
                    </div>
                    <div className="bg-slate-950/80 rounded-xl p-2 border border-slate-800">
                      <span className="text-2xl font-black font-mono text-amber-400">
                        {String(curfewCountdown.minutes).padStart(2, "0")}
                      </span>
                      <span className="block text-[9px] text-slate-400 uppercase">Phút</span>
                    </div>
                    <div className="bg-slate-950/80 rounded-xl p-2 border border-slate-800">
                      <span className="text-2xl font-black font-mono text-amber-400">
                        {String(curfewCountdown.seconds).padStart(2, "0")}
                      </span>
                      <span className="block text-[9px] text-slate-400 uppercase">Giây</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sau 23:00, hệ thống tự động khóa cổng xoay. Sinh viên về sau giờ này cần có đơn được BQL duyệt trên App để mở cổng an ninh.
                  </p>
                </div>

                {/* Form xin về muộn */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    Nộp đơn xin về muộn / Ra ngoài đêm khẩn cấp
                  </h4>

                  <form onSubmit={handleLateSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Lý do về muộn:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
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
                            className={`p-2 rounded-xl text-[11px] font-medium border text-left transition-all ${
                              lateReason === item.id
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Giờ dự kiến về:
                        </label>
                        <select
                          value={expectedTime}
                          onChange={(e) => setExpectedTime(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="23:30">23:30</option>
                          <option value="23:45">23:45</option>
                          <option value="00:00">00:00 (Nửa đêm)</option>
                          <option value="00:30">00:30</option>
                          <option value="qua_dem">Vắng qua đêm</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Đi cùng bạn phòng:
                        </label>
                        <input
                          type="text"
                          placeholder="VD: Trần Minh Quân"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Ghi chú địa điểm:
                      </label>
                      <input
                        type="text"
                        value={lateNote}
                        onChange={(e) => setLateNote(e.target.value)}
                        placeholder="Thư viện Alpha / Phòng Lab AI FPTU"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Gửi đơn duyệt tự động (Instant Pass)
                    </Button>
                  </form>

                  {lateSubmitted && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs animate-in zoom-in-95">
                      <p className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Đơn đã được hệ thống phê duyệt tự động!
                      </p>
                      <p className="text-[10px] text-emerald-200 mt-1">
                        Mã phê duyệt: <strong>LAT-AUTO-2026</strong>. Bạn có thể xuất trình mã QR này tại cổng sau 23:00 mà không bị tính vi phạm.
                      </p>
                    </div>
                  )}
                </div>

                {/* Danh sách đơn gần đây */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    Lịch sử đơn xin về muộn
                  </h4>
                  {lateRequestsList.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-slate-900 border border-slate-800 p-3 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-white">{item.reason}</p>
                        <p className="text-[10px] text-slate-400">
                          {item.date} · Giờ về: {item.time}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {item.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 3: CHỤP ẢNH BÁO HỎNG NHANH BẰNG CAMERA (REPAIR CAMERA)
                ========================================================================= */}
            {activeTab === "repair-camera" && appRole === "student" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Camera Viewfinder Simulator */}
                <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl h-56 flex flex-col items-center justify-center">
                  {capturedPhoto ? (
                    <div className="relative w-full h-full">
                      <img
                        src={capturedPhoto}
                        alt="Captured defect"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setCapturedPhoto(null)}
                        className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[10px] text-white border border-white/20"
                      >
                        Chụp lại
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900/60 p-4">
                      {/* Viewfinder crosshairs */}
                      <div className="absolute inset-8 border border-white/20 rounded-xl pointer-events-none">
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                      </div>

                      <Camera className="w-10 h-10 text-emerald-400/80 mb-2" />
                      <p className="text-xs font-semibold text-slate-300">
                        Camera nhận diện sự cố thiết bị
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Hướng ống kính về ổ điện, bóng đèn hoặc vòi nước bị rò rỉ
                      </p>

                      <button
                        type="button"
                        onClick={handleSimulateCapture}
                        className="mt-3 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Chụp ảnh sự cố
                      </button>
                    </div>
                  )}

                  {/* Room GPS tag */}
                  <div className="absolute bottom-2 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] text-slate-300 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Vị trí: Tòa A · Tầng 2 · Phòng A205
                  </div>
                </div>

                {/* Form phân loại & mô tả */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white">Phân loại sự cố nhanh:</h4>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "dien", label: "💡 Đèn / Ổ điện" },
                      { id: "nuoc", label: "🚰 Nước / Vòi sen" },
                      { id: "dieu_hoa", label: "❄️ Điều hòa" },
                      { id: "khoa_cua", label: "🚪 Khóa cửa" },
                      { id: "giuong_tu", label: "🛏️ Giường tủ" },
                      { id: "khac", label: "🔧 Khác" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setRepairCategory(cat.id)}
                        className={`p-2 rounded-xl text-[11px] font-medium border text-center transition-all ${
                          repairCategory === cat.id
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Mô tả ngắn gọn biểu hiện:
                    </label>
                    <textarea
                      rows={2}
                      value={repairNote}
                      onChange={(e) => setRepairNote(e.target.value)}
                      placeholder="VD: Bóng tuýp buồng B nhấp nháy, chập chờn..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white resize-none"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      setRepairSubmitted(true)
                      setTimeout(() => setRepairSubmitted(false), 4000)
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Gửi yêu cầu tới Kỹ Thuật Viên Tòa A
                  </Button>

                  {repairSubmitted && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs animate-in zoom-in-95">
                      <p className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Đã tiếp nhận yêu cầu #FIX-2026-88!
                      </p>
                      <p className="text-[10px] text-emerald-200 mt-1">
                        Kỹ thuật viên <strong>Nguyễn Văn An</strong> (SĐT: 0988 777 666) đang trên đường kiểm tra buồng A205 trong 15 phút tới.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 4: VIETQR THANH TOÁN ĐIỆN NƯỚC MỘT CHẠM (VIETQR)
                ========================================================================= */}
            {activeTab === "vietqr" && appRole === "student" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Bill Summary Card */}
                <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-sky-950/40 border border-sky-500/30 p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40">
                      <Receipt className="w-3 h-3" />
                      Tiền Điện Nước Tháng 10/2026
                    </span>
                    <span className="text-[10px] text-slate-400">Phòng A205</span>
                  </div>

                  <div className="text-center py-2">
                    <p className="text-xs text-slate-400">Phần thanh toán của bạn (1/4 thành viên):</p>
                    <h3 className="text-3xl font-black font-mono text-emerald-400 mt-1">
                      167.500 <span className="text-sm font-semibold text-white">VNĐ</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      (Tổng phòng 4 người: 670.000 VNĐ · Hạn nộp: 05/11/2026)
                    </p>
                  </div>

                  {/* VietQR Code Image Box */}
                  <div className="bg-white rounded-2xl p-3 shadow-md max-w-[210px] mx-auto text-slate-900 text-center space-y-1">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black tracking-wider text-blue-700">VietQR</span>
                      <span className="text-[9px] font-bold text-red-600">NAPAS 247</span>
                    </div>
                    {/* Simulated Clean VietQR Pattern */}
                    <div className="w-40 h-40 mx-auto bg-slate-950 p-2 rounded-lg grid grid-cols-5 gap-1">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-2xs ${
                            i % 2 === 0 || i % 5 === 0 ? "bg-white" : "bg-sky-400"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-800">MB BANK · KTX FPTU</p>
                  </div>

                  {/* Transfer Details with One-click Copy */}
                  <div className="space-y-1.5 pt-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Số tài khoản KTX:</span>
                        <span className="font-mono font-bold text-white">091234567899</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard("091234567899", "stk")}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        {copiedField === "stk" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Nội dung chuyển khoản:</span>
                        <span className="font-mono font-bold text-emerald-300">
                          KTX A205 SE182049 T10
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard("KTX A205 SE182049 T10", "nd")}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        {copiedField === "nd" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 5: MÔ PHỎNG QUÉT THẺ BẢO VỆ CỔNG (GUARD SCANNER)
                ========================================================================= */}
            {activeTab === "guard-scanner" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Security Scanner Viewport */}
                <div className="rounded-3xl bg-slate-900 border-2 border-sky-500/40 p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40">
                      <Shield className="w-3 h-3" />
                      Continuous Gate Scanner
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      CỔNG A · TỐC ĐỘ CAO
                    </span>
                  </div>

                  {/* Scanner Camera Screen */}
                  <div className="relative h-44 rounded-2xl bg-slate-950 overflow-hidden flex flex-col items-center justify-center border border-slate-800">
                    {/* Laser scanning beam */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-bounce" />

                    {/* Camera target reticle */}
                    <div className="w-32 h-32 border-2 border-dashed border-cyan-400/60 rounded-2xl flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-cyan-400/40 animate-pulse" />
                    </div>

                    <div className="absolute bottom-2 text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded-md">
                      Hướng camera vào mã QR điện thoại sinh viên
                    </div>
                  </div>

                  {/* Test Scan Buttons */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-400">
                      Bấm mô phỏng quẹt thẻ kiểm tra:
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleGuardScan("valid")}
                        className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500 text-emerald-300 text-[10px] font-bold text-center"
                      >
                        ✅ SV Hợp lệ
                      </button>
                      <button
                        onClick={() => handleGuardScan("late")}
                        className="p-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500 text-amber-300 text-[10px] font-bold text-center"
                      >
                        ⚠️ Về muộn có phép
                      </button>
                      <button
                        onClick={() => handleGuardScan("expired")}
                        className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500 text-rose-300 text-[10px] font-bold text-center"
                      >
                        ❌ Hết hạn / Khóa
                      </button>
                    </div>
                  </div>

                  {/* Scan Result Feedback Card */}
                  {guardScanResult.status && (
                    <div
                      className={`p-3 rounded-2xl border text-xs animate-in zoom-in-95 ${
                        guardScanResult.status === "success"
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : guardScanResult.status === "warning"
                            ? "bg-amber-500/20 border-amber-500 text-amber-300"
                            : "bg-rose-500/20 border-rose-500 text-rose-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{guardScanResult.message}</span>
                        <span className="text-[10px] font-mono">{guardScanResult.time}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-white">
                        <p>
                          <strong>{guardScanResult.name}</strong> ({guardScanResult.studentId})
                        </p>
                        <p className="text-[10px] text-slate-300">{guardScanResult.room}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Entry Log */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    Lượt quẹt cổng gần nhất (Offline Cache)
                  </h4>
                  {guardHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {item.name} · <span className="font-mono text-slate-400">{item.id}</span>
                        </p>
                        <p className="text-[10px] text-slate-500">Phòng {item.room} · {item.time}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.status === "success"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : item.status === "warning"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {item.status === "success" ? "Hợp Lệ" : item.status === "warning" ? "Có Phép" : "Cảnh Báo"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MOBILE BOTTOM TAB BAR */}
          <div className="absolute bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around z-30">
            {appRole === "student" ? (
              <>
                <button
                  onClick={() => setActiveTab("gate-pass")}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                    activeTab === "gate-pass" ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">Thẻ Cổng</span>
                </button>

                <button
                  onClick={() => setActiveTab("curfew")}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                    activeTab === "curfew" ? "text-amber-400 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">Giới Nghiêm</span>
                </button>

                <button
                  onClick={() => setActiveTab("repair-camera")}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                    activeTab === "repair-camera" ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">Báo Hỏng</span>
                </button>

                <button
                  onClick={() => setActiveTab("vietqr")}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                    activeTab === "vietqr" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Receipt className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">VietQR</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab("guard-scanner")}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                    activeTab === "guard-scanner" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">Quét Cổng</span>
                </button>

                <button
                  onClick={() => setActiveTab("curfew")}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                    activeTab === "curfew" ? "text-amber-400 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">Duyệt Đơn</span>
                </button>

                <button
                  onClick={() => setAppRole("student")}
                  className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-white"
                >
                  <User className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">SV View</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Push Notification Simulation Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-emerald-400" />
                Thông Báo Đẩy Di Động (Push Notifications)
              </h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-amber-400 font-bold text-[11px]">
                  <span>⏰ Nhắc nhở giờ giới nghiêm</span>
                  <span className="text-[10px] text-slate-500">22:00</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  KTX sẽ đóng cổng chính lúc 23:00. Hãy chủ động về phòng hoặc gửi đơn xin về muộn.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-sky-400 font-bold text-[11px]">
                  <span>⚡ Hóa đơn điện nước kỳ T10/2026</span>
                  <span className="text-[10px] text-slate-500">Hôm nay</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Phòng A205 đã có số liệu điện nước. Số tiền cần đóng của bạn: 167.500 đ.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
                  <span>🛠️ Tiến độ sửa chữa thiết bị</span>
                  <span className="text-[10px] text-slate-500">Hôm qua</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Yêu cầu thay bóng đèn buồng B phòng A205 đã được KTV hoàn thành.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowNotificationModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs py-2"
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
