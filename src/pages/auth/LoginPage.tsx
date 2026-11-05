import React, { useState, useEffect } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { SlidingNumberPrice } from "@/components/ui/sliding-number-price"
import type { UserRole, UserProfile } from "@/types/auth"
import { motion, AnimatePresence } from "motion/react"
import {
  Building2,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  UserPlus,
  LogIn,
  Send,
  Clock,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Download,
  HelpCircle,
  Eye,
  EyeOff,
} from "lucide-react"

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginAsDemoUser, loginWithCustomUser, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const modeParam = searchParams.get("mode")

  // viewMode: "select" (Dribbble welcome with dual buttons), "login", or "register"
  const [viewMode, setViewMode] = useState<"select" | "login" | "register">(() => {
    if (modeParam === "register") return "register"
    if (modeParam === "login") return "login"
    return "select"
  })

  useEffect(() => {
    if (modeParam === "register") {
      setViewMode("register")
    } else if (modeParam === "login") {
      setViewMode("login")
    }
  }, [modeParam])

  // Login form state
  const [activeTab, setActiveTab] = useState<"student" | "staff">("student")
  const [selectedStaffRole, setSelectedStaffRole] = useState<UserRole>("manager")
  const [customEmail, setCustomEmail] = useState("")
  const [password, setPassword] = useState("••••••••")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showHelpModal, setShowHelpModal] = useState(false)

  // Registration & 15-min Payment flow state: "FORM" -> "PAYMENT" -> "SUCCESS"
  const [regStep, setRegStep] = useState<"FORM" | "PAYMENT" | "SUCCESS">("FORM")
  const [payCountdown, setPayCountdown] = useState(900) // 15:00 minutes = 900s
  const [isCopiedAcc, setIsCopiedAcc] = useState(false)
  const [isCopiedContent, setIsCopiedContent] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [assignedRoom, setAssignedRoom] = useState<{
    room: string
    compartment: string
    bedCode: string
    gateCode: string
  } | null>(null)

  const [regData, setRegData] = useState({
    fullName: "Trần Bảo Nam",
    studentCode: "SE185240",
    email: "baonam.se185240@fpt.edu.vn",
    phone: "0987 654 321",
    gender: "male",
    term: "Fall 2026",
    roomType: "standard_6",
    agreedRules: true,
  })
  const [regId, setRegId] = useState("REG-2026-8492")

  // 15-min payment countdown timer
  useEffect(() => {
    if (regStep !== "PAYMENT") return

    const timer = setInterval(() => {
      setPayCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          alert("Hết hạn 15 phút giữ chỗ! Vui lòng thực hiện lại đơn đăng ký.")
          setRegStep("FORM")
          return 900
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [regStep])

  const formatPayTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const roomPrice = regData.roomType === "private_4" ? 4000000 : 3200000
  const qrTransferContent = `KTX ${regData.studentCode} ${regData.fullName.toUpperCase()}`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=2|99|000088889999|BAN_QUAN_LY_KTX_FPT|${roomPrice}|${encodeURIComponent(qrTransferContent)}`

  const handleDownloadQR = () => {
    fetch(qrImageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `VietQR_KTX_${regData.studentCode || "SE185240"}_Fall2026.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      })
      .catch(() => {
        window.open(qrImageUrl, "_blank")
      })
  }

  const handleConfirmPayment = () => {
    setIsProcessingPayment(true)
    setTimeout(() => {
      setIsProcessingPayment(false)

      const isPrivate = regData.roomType === "private_4"
      const compName = isPrivate ? "Buồng C" : "Buồng B"
      const compBed = isPrivate ? "A205-C-G03" : "A205-B-G03"
      const gatePass = `#GATE-${Math.floor(1000 + Math.random() * 9000)}-2026A`

      setAssignedRoom({
        room: "A205",
        compartment: compName,
        bedCode: compBed,
        gateCode: gatePass,
      })

      setRegStep("SUCCESS")
    }, 600)
  }

  const handleEnterStudentPortal = () => {
    if (!assignedRoom) return

    const newStudentUser: UserProfile = {
      id: `user-${regData.studentCode.toLowerCase()}`,
      fullName: regData.fullName,
      email: regData.email,
      role: "student",
      roleTitle: "Sinh viên lưu trú",
      studentId: regData.studentCode,
      gender: (regData.gender as "male" | "female") || "male",
      avatar:
        regData.gender === "female"
          ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80"
          : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80",
      phone: regData.phone,
      dob: "2004-06-15",
      citizenId: "079204018293",
      hometown: "TP. Hồ Chí Minh",
      major: "Kỹ thuật phần mềm (Software Engineering)",
      cohort: "K18",
      dormitoryStatus: {
        roomStatus: "OCCUPIED",
        bedCode: assignedRoom.bedCode,
        building: regData.gender === "female" ? "Tòa C (Nữ)" : "Tòa A (Nam)",
        room: assignedRoom.room,
        compartment: assignedRoom.compartment,
        contractStart: "2026-09-01",
        contractEnd: "2027-01-15",
        debtStatus: 0,
        checkInDate: "2026-09-01",
      },
      emergencyContact: {
        parentName: "Phụ huynh " + regData.fullName,
        phone: "0903123456",
        relationship: "Phụ huynh",
        address: "TP. Hồ Chí Minh",
      },
      status: "active",
      joinedDate: "2026-09-01",
    }

    loginWithCustomUser(newStudentUser)
    navigate("/overview", { replace: true })
  }

  interface LocationState {
    from?: {
      pathname: string
    }
  }
  const locationState = location.state as LocationState | null

  const getRoleDestination = (role: UserRole) => {
    if (locationState?.from?.pathname) return locationState.from.pathname
    if (role === "student") return "/overview"
    if (role === "manager") return "/manager"
    if (role === "technician") return "/maintenance"
    return "/overview"
  }

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const targetEmail = customEmail.trim() || (activeTab === "student" ? "hoangvinh.student@gmail.com" : "namvt@fpt.edu.vn")
    const targetRole = activeTab === "student" ? "student" : selectedStaffRole
    const result = await loginWithGoogle(targetEmail, targetRole)

    if (result.success) {
      navigate(getRoleDestination(targetRole), { replace: true })
    } else {
      setErrorMessage(result.message || "Đăng nhập không thành công.")
    }
  }

  const handleQuickDemo = (role: UserRole) => {
    setErrorMessage(null)
    loginAsDemoUser(role)
    navigate(getRoleDestination(role), { replace: true })
  }

  const switchToMode = (mode: "select" | "login" | "register") => {
    setErrorMessage(null)
    setViewMode(mode)
    if (mode === "select") {
      setSearchParams({})
    } else {
      setSearchParams({ mode })
    }
  }

  return (
    <div className="relative isolate min-h-screen flex items-center justify-center p-0 sm:py-8 sm:px-4">
      <div aria-hidden="true" className="nature-backdrop" />

      {/* Main Dribbble-Style Animated Card Frame */}
      <motion.div
        layout
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className={`relative z-10 w-full min-h-screen sm:min-h-0 overflow-hidden rounded-none sm:rounded-[36px] border-0 sm:border border-border/80 bg-card text-foreground shadow-none sm:shadow-2xl transition-all ${
          viewMode === "register" ? "sm:max-w-xl" : "sm:max-w-[440px]"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {/* =========================================================================
              VIEW 1: SELECTION / WELCOME SCREEN (Theo mẫu Dribbble: Cute illustration, 2 pill buttons)
              ========================================================================= */}
          {viewMode === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col justify-between p-6 sm:p-8 min-h-screen sm:min-h-[580px] text-center"
            >
              {/* TOP ARTWORK: Playful animated illustration from Dribbble GIF */}
              <div className="relative pt-2 pb-4">
                {/* Floating twinkling elements */}
                <div className="relative mx-auto h-40 w-full max-w-[280px]">
                  {/* Floating Smiling Cloud */}
                  <motion.div
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut" }}
                    className="absolute top-1 left-1/2 -translate-x-1/2 z-10"
                  >
                    <svg viewBox="0 0 72 44" className="w-18 h-11 drop-shadow-sm">
                      {/* Cloud shape */}
                      <path
                        d="M18 36h38a12 12 0 0 0 2-23.8A16 16 0 0 0 26 14a12 12 0 0 0-8 22z"
                        className="fill-white dark:fill-slate-800 stroke-slate-700 dark:stroke-slate-300 stroke-[2]"
                      />
                      {/* Cute smiling eyes & smile */}
                      <circle cx="32" cy="24" r="1.8" className="fill-slate-800 dark:fill-slate-100" />
                      <circle cx="44" cy="24" r="1.8" className="fill-slate-800 dark:fill-slate-100" />
                      <path
                        d="M36 27 Q38 30 40 27"
                        fill="none"
                        className="stroke-slate-800 dark:stroke-slate-100"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      {/* Cute pink cheek blushes */}
                      <circle cx="28" cy="27" r="1.5" fill="#f43f5e" opacity="0.6" />
                      <circle cx="48" cy="27" r="1.5" fill="#f43f5e" opacity="0.6" />
                    </svg>
                  </motion.div>

                  {/* Floating stars, hearts and sparkles */}
                  <motion.div
                    animate={{ scale: [0.8, 1.25, 0.8], rotate: [0, 90, 180] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute top-2 left-6 text-amber-400 text-xs"
                  >
                    ✦
                  </motion.div>
                  <motion.div
                    animate={{ y: [-3, 3, -3], scale: [0.9, 1.1, 0.9] }}
                    transition={{ repeat: Infinity, duration: 3.2, delay: 0.5, ease: "easeInOut" }}
                    className="absolute top-10 right-6 text-rose-400 text-sm"
                  >
                    ♥
                  </motion.div>
                  <motion.div
                    animate={{ y: [3, -3, 3] }}
                    transition={{ repeat: Infinity, duration: 4.2, delay: 0.8, ease: "easeInOut" }}
                    className="absolute top-16 left-4 text-sky-400 text-xs font-bold"
                  >
                    ♪
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 3, delay: 1, ease: "easeInOut" }}
                    className="absolute bottom-8 right-8 text-emerald-400 text-xs"
                  >
                    ★
                  </motion.div>

                  {/* Centered Avatar Badge with FPT University Logo */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="relative flex h-18 w-18 items-center justify-center rounded-full border-3 border-amber-400 bg-white p-1.5 shadow-md dark:bg-slate-900">
                      <img
                        src="/images/logo.jpg"
                        alt="FPT University Logo"
                        className="h-full w-full rounded-full object-contain"
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-xs">
                        +
                      </span>
                    </div>

                    {/* Dotted code line under avatar (like Dribbble GIF) */}
                    <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-0.5 bg-slate-50 dark:bg-slate-900/60 font-mono text-[10px] text-slate-400">
                      <span>• • • • • •</span>
                    </div>
                  </div>

                  {/* Dashed floor line */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-44 border-b-2 border-dashed border-slate-200 dark:border-slate-800" />
                </div>

                <div className="mt-4 space-y-1">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    Cổng Đăng Ký KTX Đại học FPT
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Hệ thống Quản lý Ký túc xá FPT University (DMS)
                  </p>
                </div>
              </div>

              {/* CENTER: THE TWO ICONIC DRIBBLE PILL BUTTONS */}
              <div className="space-y-4 my-2">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* BUTTON 1: SIGN UP (ĐĂNG KÝ) - Cyan/Emerald Gradient */}
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => switchToMode("register")}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#10b981] py-3.5 px-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-teal-500/25 transition-shadow hover:shadow-teal-500/40 cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4 shrink-0" />
                    <span>ĐĂNG KÝ</span>
                  </motion.button>

                  {/* BUTTON 2: SIGN IN (ĐĂNG NHẬP) - Vibrant FPT Navy/Emerald or Sunset Gradient */}
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => switchToMode("login")}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#1e3a5f] via-[#0f766e] to-[#10b981] py-3.5 px-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-900/25 transition-shadow hover:shadow-emerald-500/40 cursor-pointer"
                  >
                    <LogIn className="h-4 w-4 shrink-0" />
                    <span>ĐĂNG NHẬP</span>
                  </motion.button>
                </div>

                {/* FORGOT? link */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="text-[11px] font-bold text-muted-foreground hover:text-primary tracking-wider uppercase transition-colors"
                  >
                    QUÊN MẬT KHẨU HOẶC CẦN TRỢ GIÚP?
                  </button>
                </div>
              </div>

              {/* BOTTOM: DEMO 1-CLICK & GOOGLE LOGIN CARDS FOR EVALUATORS */}
              <div className="pt-4 border-t border-border/80 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold tracking-wider text-muted-foreground uppercase">
                    Tài khoản Demo 1-Click (Chấm đồ án):
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Sẵn sàng
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-left">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("student")}
                    disabled={isLoading}
                    className="group flex items-center justify-between rounded-2xl border border-border/80 bg-muted/40 p-2.5 transition-all hover:border-emerald-500 hover:bg-emerald-500/5 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-xs font-bold text-emerald-600">
                        VH
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Nguyễn Hoàng Vinh (Sinh viên K19)
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          hoangvinh.student@gmail.com • A205
                        </p>
                      </div>
                    </div>
                    <span className="rounded-xl bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-2xs group-hover:bg-emerald-700 transition-colors">
                      Vào nhanh →
                    </span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo("manager")}
                      disabled={isLoading}
                      className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/30 p-2 text-left hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-[11px] font-bold text-blue-600">
                        QL
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-foreground truncate">Thầy Nam (BQL)</p>
                        <p className="text-[9px] text-muted-foreground truncate">Toàn quyền</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemo("technician")}
                      disabled={isLoading}
                      className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/30 p-2 text-left hover:border-cyan-500 hover:bg-cyan-500/5 transition-all cursor-pointer"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-[11px] font-bold text-cyan-600">
                        KT
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-foreground truncate">Chú Hùng (KT)</p>
                        <p className="text-[9px] text-muted-foreground truncate">Bảo trì phòng</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              VIEW 2: SIGN IN SCREEN (Theo mẫu Dribbble: Gradient background, Frosted glass, Back arrow)
              ========================================================================= */}
          {viewMode === "login" && (
            <motion.div
              key="login"
              initial={{ clipPath: "circle(0% at 75% 55%)", opacity: 0 }}
              animate={{ clipPath: "circle(150% at 75% 55%)", opacity: 1 }}
              exit={{ clipPath: "circle(0% at 75% 55%)", opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="relative flex flex-col justify-between p-6 sm:p-8 min-h-screen sm:min-h-[620px] bg-gradient-to-br from-[#162f52] via-[#0d5951] to-[#059669] text-white"
            >
              {/* TOP BAR: Back arrow button & title */}
              <div>
                <div className="flex items-center justify-between pb-3 text-xs text-white/80">
                  <button
                    type="button"
                    onClick={() => switchToMode("select")}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                    aria-label="Quay lại"
                    title="Quay lại màn hình chính"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <span className="text-xs font-semibold tracking-wide text-white/80">Ký Túc Xá FPT</span>
                </div>

                {/* BRAND HEADER: FPT University Logo & Welcome message */}
                <div className="pt-2 text-center space-y-2">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 p-2 shadow-inner backdrop-blur-md">
                    <img
                      src="/images/logo.jpg"
                      alt="FPT Logo"
                      className="h-full w-full rounded-xl object-contain"
                    />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Chào Mừng Trở Lại!
                  </h2>
                  <p className="text-xs text-sky-100">
                    Cổng đăng nhập Ký túc xá FPT University
                  </p>
                </div>
              </div>

              {/* FORM FIELDS & ROLE SWITCHER */}
              <div className="space-y-4 my-auto py-3">
                {/* Role Switcher Pill (Sinh viên vs Cán bộ) */}
                <div className="grid grid-cols-2 rounded-2xl bg-white/15 p-1 text-xs font-bold backdrop-blur-md border border-white/20">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("student")
                      setErrorMessage(null)
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all cursor-pointer ${
                      activeTab === "student"
                        ? "bg-white text-slate-900 font-extrabold shadow-md"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span>Sinh Viên</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("staff")
                      setErrorMessage(null)
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all cursor-pointer ${
                      activeTab === "staff"
                        ? "bg-white text-slate-900 font-extrabold shadow-md"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Cán Bộ / KT</span>
                  </button>
                </div>

                {/* Error Banner if any */}
                {errorMessage && (
                  <div className="flex items-start gap-2.5 rounded-2xl border border-rose-400/40 bg-rose-500/25 p-3 text-xs text-white backdrop-blur-md">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                    <p className="leading-tight text-[11px]">{errorMessage}</p>
                  </div>
                )}

                {/* Role specific rules / guidance */}
                {activeTab === "student" ? (
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-[11px] leading-relaxed text-sky-100 backdrop-blur-md">
                    <span className="font-bold text-white flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                      Quy định phân tòa lưu trú theo giới tính:
                    </span>
                    <span>Tòa A & Tòa B (Nam) • Tòa C & Tòa D (Nữ). Đăng nhập bằng Gmail (@gmail.com / @fpt.edu.vn).</span>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-[11px] leading-relaxed text-sky-100 backdrop-blur-md space-y-2">
                    <div>
                      <span className="font-bold text-white flex items-center gap-1">
                        <Lock className="h-3.5 w-3.5 text-amber-300" />
                        Xác thực cán bộ KTX:
                      </span>
                      <span>Bắt buộc sử dụng email mang tên miền <strong>@fpt.edu.vn</strong> hoặc <strong>@fe.edu.vn</strong>.</span>
                    </div>
                    {/* Role selector buttons for staff demo */}
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/15">
                      <span className="text-white/80 font-semibold text-[10px]">Vai trò demo:</span>
                      <div className="flex-1 flex gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedStaffRole("manager")}
                          className={`flex-1 py-1 px-1.5 rounded-lg text-center text-[10px] font-bold transition-all cursor-pointer ${
                            selectedStaffRole === "manager"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-white/80 bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          Quản lý
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStaffRole("technician")}
                          className={`flex-1 py-1 px-1.5 rounded-lg text-center text-[10px] font-bold transition-all cursor-pointer ${
                            selectedStaffRole === "technician"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-white/80 bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          Kỹ thuật
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStaffRole("admin")}
                          className={`flex-1 py-1 px-1.5 rounded-lg text-center text-[10px] font-bold transition-all cursor-pointer ${
                            selectedStaffRole === "admin"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-white/80 bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Input Fields (Glassmorphism design matching Dribbble GIF) */}
                <form onSubmit={handleCustomLogin} className="space-y-3">
                  <div className="space-y-1">
                    <div className="relative">
                      <Mail className="absolute top-3.5 left-3.5 h-4 w-4 text-white/70" />
                      <input
                        type="text"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder={
                          activeTab === "student"
                            ? "Email Google"
                            : "Email"
                        }
                        className="w-full rounded-2xl border border-white/25 bg-white/15 py-3 pr-4 pl-10 text-xs text-white placeholder:text-white/60 backdrop-blur-md focus:border-white focus:bg-white/25 focus:ring-2 focus:ring-white/40 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="relative">
                      <Lock className="absolute top-3.5 left-3.5 h-4 w-4 text-white/70" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mật khẩu tài khoản"
                        className="w-full rounded-2xl border border-white/25 bg-white/15 py-3 pr-10 pl-10 text-xs text-white placeholder:text-white/60 backdrop-blur-md focus:border-white focus:bg-white/25 focus:ring-2 focus:ring-white/40 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-3.5 right-3.5 text-white/70 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary SIGN IN Button (Frosted Glass Pill from Dribbble GIF) */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-full border border-white/40 bg-white/25 hover:bg-white/35 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl backdrop-blur-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Đang xác thực...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        <span>ĐĂNG NHẬP HỆ THỐNG</span>
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Demo 1-Click for grading directly on login screen */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemo(activeTab === "student" ? "student" : selectedStaffRole)
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 hover:underline cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>
                      Đăng nhập nhanh 1-Click ({activeTab === "student" ? "SV Nguyễn Hoàng Vinh" : "Thầy Nam BQL"})
                    </span>
                  </button>
                </div>
              </div>

              {/* FOOTER SWITCH TO REGISTER */}
              <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-sky-100">
                <span>Chưa có hồ sơ lưu trú?</span>
                <button
                  type="button"
                  onClick={() => switchToMode("register")}
                  className="font-bold text-white hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Đăng ký lưu trú</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              VIEW 3: REGISTRATION SCREEN (Theo mẫu Dribbble: Morph to Fresh Emerald, 15-min reservation & VietQR)
              ========================================================================= */}
          {viewMode === "register" && (
            <motion.div
              key="register"
              initial={{ clipPath: "circle(0% at 25% 55%)", opacity: 0 }}
              animate={{ clipPath: "circle(150% at 25% 55%)", opacity: 1 }}
              exit={{ clipPath: "circle(0% at 25% 55%)", opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="relative flex flex-col justify-between p-6 sm:p-8 min-h-screen sm:min-h-[620px] bg-gradient-to-br from-[#065f46] via-[#047857] to-[#0284c7] text-white"
            >
              {/* TOP BAR: Back arrow button & header */}
              <div>
                <div className="flex items-center justify-between pb-3 text-xs text-white/80">
                  <button
                    type="button"
                    onClick={() => switchToMode("select")}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                    aria-label="Quay lại"
                    title="Quay lại màn hình chính"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <span className="text-xs font-semibold tracking-wide text-white/80">Đăng Ký Lưu Trú</span>
                </div>

                <div className="pt-2 text-center space-y-1">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 p-2 shadow-inner backdrop-blur-md">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Đăng Ký Lưu Trú KTX
                  </h2>
                  <p className="text-xs text-emerald-100">
                    Học kỳ 1 Năm học 2026–2027 · Đại học FPT Quy Nhơn
                  </p>
                </div>
              </div>

              {/* REGISTRATION BODY */}
              <div className="my-auto py-3">
                {errorMessage && (
                  <div className="mb-3 flex items-start gap-2.5 rounded-2xl border border-rose-400/40 bg-rose-500/25 p-3 text-xs text-white backdrop-blur-md">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                    <p className="leading-tight text-[11px]">{errorMessage}</p>
                  </div>
                )}

                {/* STEP 1: REGISTRATION FORM */}
                {regStep === "FORM" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!regData.fullName || !regData.studentCode || !regData.email) {
                        setErrorMessage("Vui lòng điền đầy đủ Họ tên, MSSV và Email.")
                        return
                      }
                      setRegId(`REG-2026-${Math.floor(1000 + Math.random() * 9000)}`)
                      setRegStep("PAYMENT")
                      setPayCountdown(900)
                      setErrorMessage(null)
                    }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="text-[11px] text-white/80 font-medium block mb-1">
                          Họ và tên:
                        </label>
                        <input
                          type="text"
                          value={regData.fullName}
                          onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                          className="w-full rounded-xl border border-white/25 bg-white/15 px-3 py-2 text-xs text-white placeholder:text-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-white/80 font-medium block mb-1">
                          Mã sinh viên (MSSV):
                        </label>
                        <input
                          type="text"
                          value={regData.studentCode}
                          onChange={(e) => setRegData({ ...regData, studentCode: e.target.value })}
                          className="w-full rounded-xl border border-white/25 bg-white/15 px-3 py-2 text-xs text-white placeholder:text-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-white/80 font-medium block mb-1">
                          Email liên hệ:
                        </label>
                        <input
                          type="email"
                          value={regData.email}
                          onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                          className="w-full rounded-xl border border-white/25 bg-white/15 px-3 py-2 text-xs text-white placeholder:text-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-white/80 font-medium block mb-1">
                          Số điện thoại:
                        </label>
                        <input
                          type="tel"
                          value={regData.phone}
                          onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                          className="w-full rounded-xl border border-white/25 bg-white/15 px-3 py-2 text-xs text-white placeholder:text-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Gender Selection & Building Rule */}
                    <div className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-xs">
                      <span className="text-[11px] font-semibold text-white block mb-1.5">
                        Giới tính (Phân tòa tự động):
                      </span>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="regGender"
                            checked={regData.gender === "male"}
                            onChange={() => setRegData({ ...regData, gender: "male" })}
                            className="accent-emerald-400"
                          />
                          <span>Nam → <strong>Tòa A & B</strong></span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="regGender"
                            checked={regData.gender === "female"}
                            onChange={() => setRegData({ ...regData, gender: "female" })}
                            className="accent-emerald-400"
                          />
                          <span>Nữ → <strong>Tòa C & D</strong></span>
                        </label>
                      </div>
                    </div>

                    {/* Room Type */}
                    <div className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-xs">
                      <span className="text-[11px] font-semibold text-white block mb-1.5">
                        Loại buồng lưu trú:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegData({ ...regData, roomType: "standard_6" })}
                          className={`rounded-xl border p-2 text-left transition-all cursor-pointer ${
                            regData.roomType === "standard_6"
                              ? "border-white bg-white/25 shadow-xs"
                              : "border-white/20 bg-white/5"
                          }`}
                        >
                          <p className="font-bold text-white text-[11px]">Tiêu chuẩn (6 giường)</p>
                          <p className="font-mono text-[10px] text-emerald-200">3.200.000 đ/kỳ</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegData({ ...regData, roomType: "private_4" })}
                          className={`rounded-xl border p-2 text-left transition-all cursor-pointer ${
                            regData.roomType === "private_4"
                              ? "border-white bg-white/25 shadow-xs"
                              : "border-white/20 bg-white/5"
                          }`}
                        >
                          <p className="font-bold text-white text-[11px]">Khép kín (4 giường)</p>
                          <p className="font-mono text-[10px] text-emerald-200">4.000.000 đ/kỳ</p>
                        </button>
                      </div>
                    </div>

                    {/* Rule Agreement */}
                    <label className="flex items-start gap-2 text-[11px] text-white/90 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={regData.agreedRules}
                        onChange={(e) => setRegData({ ...regData, agreedRules: e.target.checked })}
                        className="mt-0.5 accent-emerald-400"
                        required
                      />
                      <span>Tôi cam kết tuân thủ nghiêm túc Nội quy KTX FPT University.</span>
                    </label>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full rounded-full border border-white/40 bg-white/25 hover:bg-white/35 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xl backdrop-blur-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>TIẾP TỤC GIỮ CHỖ (15 PHÚT) →</span>
                    </motion.button>
                  </form>
                )}

                {/* STEP 2: VIETQR 15-MINUTE PAYMENT DEMO */}
                {regStep === "PAYMENT" && (
                  <div className="space-y-3 py-1">
                    {/* 15-min countdown banner */}
                    <div className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/15 p-3 backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-300 animate-pulse" />
                        <div>
                          <p className="text-xs font-bold text-white">Giữ Chỗ Trong 15 Phút</p>
                          <p className="text-[10px] text-white/80">Quét mã VietQR để hoàn tất giữ chỗ</p>
                        </div>
                      </div>
                      <span className="font-mono text-base font-black text-amber-300 bg-black/25 px-3 py-1 rounded-xl">
                        {formatPayTime(payCountdown)}
                      </span>
                    </div>

                    {/* QR Code & Banking details */}
                    <div className="rounded-2xl border border-white/25 bg-white/10 p-3.5 space-y-3 backdrop-blur-md">
                      <div className="flex flex-col items-center gap-2.5">
                        <div className="relative mx-auto w-40 h-40 bg-white p-2.5 rounded-2xl shadow-lg flex items-center justify-center">
                          <img
                            src={qrImageUrl}
                            alt="VietQR Chuyển Khoản"
                            className="w-full h-full object-contain rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={handleDownloadQR}
                            className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-lg bg-black/80 hover:bg-black text-white px-2 py-0.5 text-[10px] font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            <Download className="h-3 w-3" />
                            <span>Tải QR</span>
                          </button>
                        </div>

                        {/* Account Details */}
                        <div className="w-full space-y-1.5 rounded-xl border border-white/20 bg-black/15 p-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-white/70">Số tài khoản TPBank:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-amber-300">0000 8888 9999</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText("000088889999")
                                  setIsCopiedAcc(true)
                                  setTimeout(() => setIsCopiedAcc(false), 2000)
                                }}
                                className="text-white/70 hover:text-white cursor-pointer"
                              >
                                {isCopiedAcc ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-t border-white/10 pt-1.5">
                            <span className="text-[11px] text-white/70">Nội dung chuyển khoản:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-white text-[11px]">
                                KTX {regData.studentCode} {regData.fullName.toUpperCase()}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`KTX ${regData.studentCode} ${regData.fullName.toUpperCase()}`)
                                  setIsCopiedContent(true)
                                  setTimeout(() => setIsCopiedContent(false), 2000)
                                }}
                                className="text-white/70 hover:text-white cursor-pointer"
                              >
                                {isCopiedContent ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-t border-white/10 pt-1.5">
                            <span className="text-[11px] text-white/70">Số tiền:</span>
                            <span className="font-mono font-black text-emerald-300 text-sm">
                              <SlidingNumberPrice number={roomPrice} prefix="" suffix=" VNĐ" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2 pt-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleConfirmPayment}
                        disabled={isProcessingPayment}
                        className="w-full rounded-full border border-white/40 bg-white/25 hover:bg-white/35 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xl backdrop-blur-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isProcessingPayment ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Đang kiểm tra giao dịch...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 text-amber-300" />
                            <span>XÁC NHẬN ĐÃ CHUYỂN KHOẢN (DEMO 1-CLICK)</span>
                          </>
                        )}
                      </motion.button>

                      <button
                        type="button"
                        onClick={() => setRegStep("FORM")}
                        className="w-full text-center text-xs text-white/70 hover:text-white py-1 cursor-pointer"
                      >
                        ← Quay lại chỉnh sửa hồ sơ
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: PAYMENT COMPLETE & ROOM ASSIGNED WITH GATE PASS */}
                {regStep === "SUCCESS" && (
                  <div className="space-y-3.5 py-2 text-center animate-in fade-in">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner backdrop-blur-md">
                      <CheckCircle2 className="h-9 w-9 text-emerald-300" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-white">
                        Thanh Toán Thành Công & Đã Nhận Phòng!
                      </h3>
                      <p className="text-xs text-emerald-100">
                        Mã hồ sơ: <span className="font-mono font-bold text-amber-300">{regId}</span> • Đã hoàn tất đóng phí kỳ Fall 2026.
                      </p>
                    </div>

                    <div className="space-y-2 rounded-2xl border border-white/20 bg-white/10 p-3.5 text-left text-xs backdrop-blur-md">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <span className="text-white/70">Sinh viên:</span>
                        <span className="font-bold text-white">{regData.fullName} ({regData.studentCode})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Tòa & Phòng ở:</span>
                        <span className="font-bold text-white">
                          {regData.gender === "female" ? "Tòa C (Nữ)" : "Tòa A (Nam)"} • Phòng {assignedRoom?.room} • {assignedRoom?.compartment}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Mã giường (SSOT):</span>
                        <span className="font-mono font-black text-amber-300 text-sm">{assignedRoom?.bedCode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Mã thẻ ra vào cổng:</span>
                        <span className="font-mono font-bold text-emerald-300 bg-white/15 px-2 py-0.5 rounded-md">
                          {assignedRoom?.gateCode}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleEnterStudentPortal}
                        className="w-full rounded-full border border-white/40 bg-white/25 hover:bg-white/35 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl backdrop-blur-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>VÀO BẢNG ĐIỀU KHIỂN SINH VIÊN</span>
                        <ArrowRight className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER SWITCH TO LOGIN */}
              <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100">
                <span>Đã có tài khoản KTX?</span>
                <button
                  type="button"
                  onClick={() => switchToMode("login")}
                  className="font-bold text-white hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Đăng nhập ngay</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Help Modal if user clicks "QUÊN MẬT KHẨU / HỖ TRỢ?" */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 text-foreground"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                <HelpCircle className="h-4 w-4 text-primary" />
                Hỗ Trợ Tài Khoản KTX FPT
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-xs space-y-2 text-muted-foreground leading-relaxed">
              <p>
                Sinh viên KTX Đại học FPT đăng nhập trực tiếp bằng <strong>Email Google cá nhân</strong> hoặc <strong>Email FPT (@fpt.edu.vn)</strong> đã đăng ký trong hồ sơ tuyển sinh.
              </p>
              <p>
                Nếu quên thông tin hoặc đổi thiết bị, vui lòng liên hệ Văn phòng BQL KTX:
              </p>
              <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1 font-mono text-[11px] text-foreground">
                <p>📞 Hotline: <strong>0987 807 074</strong> (24/7)</p>
                <p>📧 Email: <strong>ktx.quynhon@fpt.edu.vn</strong></p>
                <p>📍 Địa chỉ: Phòng 101, Tòa A - KTX FPT University</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs py-2.5 transition-colors cursor-pointer"
            >
              Đã hiểu
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
