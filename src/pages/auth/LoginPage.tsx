import React, { useState, useEffect } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import type { UserRole, UserProfile } from "@/types/auth"
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
  Phone,
  User,
  Clock,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Download,
} from "lucide-react"

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginAsDemoUser, loginWithCustomUser, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const modeParam = searchParams.get("mode")
  const [mainMode, setMainMode] = useState<"login" | "register">(
    modeParam === "register" ? "register" : "login"
  )

  useEffect(() => {
    if (modeParam === "register") {
      setMainMode("register")
    } else if (modeParam === "login") {
      setMainMode("login")
    }
  }, [modeParam])

  const [activeTab, setActiveTab] = useState<"student" | "staff">("student")
  const [selectedStaffRole, setSelectedStaffRole] =
    useState<UserRole>("manager")

  const [customEmail, setCustomEmail] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCustomMode, setIsCustomMode] = useState(false)

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

  // Đếm ngược 15 phút thanh toán giữ chỗ
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
  const roomPriceFormatted = roomPrice.toLocaleString("vi-VN") + " VNĐ"
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
      const compBed = isPrivate ? "A205-C-G01" : "A205-B-G01"
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

    if (!customEmail) {
      setErrorMessage("Vui lòng nhập địa chỉ email Google của bạn.")
      return
    }

    const targetRole = activeTab === "student" ? "student" : selectedStaffRole
    const result = await loginWithGoogle(customEmail, targetRole)

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

  return (
    <div className="relative isolate min-h-[85vh]">
      <div aria-hidden="true" className="nature-backdrop" />
      <div className="page-content relative z-10 flex min-h-[85vh] items-center justify-center py-8">
        <div className="w-full max-w-xl">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
            <div className="space-y-2 bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500 p-8 text-center text-white">
              <div className="mb-1 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">
                {mainMode === "login"
                  ? "Cổng Xác Thực Google SSO"
                  : "Đăng Ký Lưu Trú Ký Túc Xá"}
              </h1>
              <div className="inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
                <span>Phân khu lưu trú:</span>
                <span className="font-extrabold text-amber-200">Tòa A & B (Nam)</span>
                <span>•</span>
                <span className="font-extrabold text-teal-100">Tòa C & D (Nữ)</span>
              </div>
              
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              {/* Top Switcher: Đăng Nhập vs Đăng Ký */}
              <div className="grid grid-cols-2 rounded-2xl border border-border bg-muted/80 p-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMainMode("login")
                    setSearchParams({ mode: "login" })
                    setErrorMessage(null)
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all ${
                    mainMode === "login"
                      ? "bg-white font-extrabold text-foreground shadow-sm dark:bg-card"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LogIn className="h-4 w-4 text-sky-600" />
                  <span>Đăng Nhập</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMainMode("register")
                    setSearchParams({ mode: "register" })
                    setErrorMessage(null)
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all ${
                    mainMode === "register"
                      ? "bg-white font-extrabold text-foreground shadow-sm dark:bg-card"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <UserPlus className="h-4 w-4 text-emerald-600" />
                  <span>Đăng Ký Lưu Trú</span>
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 text-xs text-blue-700 dark:text-blue-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold">Thông báo hệ thống:</p>
                    <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              {mainMode === "register" ? (
                regStep === "PAYMENT" ? (
                  /* STEP 2: VIETQR 15-MINUTE PAYMENT DEMO */
                  <div className="space-y-4 py-1 animate-in fade-in">
                    {/* 15-min countdown banner */}
                    <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse" />
                        <div>
                          <p className="text-xs font-bold text-foreground">Giữ Chỗ Trong 15 Phút</p>
                          <p className="text-[10px] text-muted-foreground">Vui lòng quét mã VietQR để hoàn tất</p>
                        </div>
                      </div>
                      <span className="font-mono text-base font-black text-amber-600 dark:text-amber-400 bg-amber-500/20 px-3 py-1 rounded-xl">
                        {formatPayTime(payCountdown)}
                      </span>
                    </div>

                    {/* VietQR Graphic & Banking details */}
                    <div className="rounded-2xl border border-border bg-card p-4 space-y-3.5 text-xs shadow-xs">
                      <div className="flex items-center justify-between border-b border-border pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sky-600 text-xs">TPBank</span>
                          <span className="text-[10px] text-muted-foreground">• NAPAS 24/7</span>
                        </div>
                        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          VietQR Tự Động
                        </span>
                      </div>

                      {/* QR Box Centered & Large with Download Button */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 bg-white p-3 rounded-2xl border border-border/80 shadow-md flex items-center justify-center group">
                          <img
                            src={qrImageUrl}
                            alt="Mã QR Chuyển Khoản"
                            className="w-full h-full object-contain rounded-xl"
                          />

                          {/* Nút tải mã QR trên góc */}
                          <button
                            type="button"
                            onClick={handleDownloadQR}
                            className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/75 hover:bg-black/90 text-white px-2 py-1 text-[11px] font-semibold backdrop-blur-xs transition-all shadow-md active:scale-95"
                            title="Tải mã QR về máy để chuyển khoản ngân hàng"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Tải QR</span>
                          </button>
                        </div>

                        {/* Account Details Below QR */}
                        <div className="w-full space-y-2 rounded-xl border border-border/70 bg-card p-3 text-xs shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">Chủ tài khoản:</span>
                            <span className="font-bold text-foreground">BAN QUAN LY KTX FPT</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-border/50 pt-2">
                            <span className="text-[11px] text-muted-foreground">Số tài khoản:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-sky-600">0000 8888 9999</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText("000088889999")
                                  setIsCopiedAcc(true)
                                  setTimeout(() => setIsCopiedAcc(false), 2000)
                                }}
                                className="p-1 text-muted-foreground hover:text-foreground"
                                title="Sao chép số tài khoản"
                              >
                                {isCopiedAcc ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-t border-border/50 pt-2">
                            <span className="text-[11px] text-muted-foreground">Nội dung chuyển khoản:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-foreground">
                                KTX {regData.studentCode} {regData.fullName.toUpperCase()}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`KTX ${regData.studentCode} ${regData.fullName.toUpperCase()}`)
                                  setIsCopiedContent(true)
                                  setTimeout(() => setIsCopiedContent(false), 2000)
                                }}
                                className="p-1 text-muted-foreground hover:text-foreground"
                                title="Sao chép nội dung"
                              >
                                {isCopiedContent ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fee Summary: ONLY SEMESTER FEE */}
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">Phí lưu trú kỳ Fall 2026 (4 tháng):</span>
                          <span className="font-mono font-black text-emerald-600 text-sm">{roomPriceFormatted}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={handleConfirmPayment}
                        disabled={isProcessingPayment}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-sm transition-all hover:opacity-95 disabled:opacity-70"
                      >
                        {isProcessingPayment ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Đang kiểm tra giao dịch ngân hàng...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>Xác Nhận Đã Chuyển Khoản (Demo 1-Click)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegStep("FORM")}
                        className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-1"
                      >
                        Quay lại chỉnh sửa hồ sơ đăng ký
                      </button>
                    </div>
                  </div>
                ) : regStep === "SUCCESS" ? (
                  /* STEP 3: PAYMENT COMPLETE & ROOM ASSIGNED WITH GATE PASS */
                  <div className="space-y-4 py-2 text-center animate-in fade-in">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 shadow-xs">
                      <CheckCircle2 className="h-9 w-9" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-foreground">
                        Thanh Toán Thành Công & Đã Nhận Phòng!
                      </h3>
                      <p className="mx-auto max-w-sm text-xs text-muted-foreground">
                        Mã hồ sơ: <span className="font-mono font-bold text-emerald-600">{regId}</span> • Đã hoàn tất đóng phí lưu trú học kỳ Fall 2026.
                      </p>
                    </div>

                    {/* Assigned Room & Gate Pass details */}
                    <div className="space-y-2.5 rounded-2xl border border-emerald-500/30 bg-card p-4 text-left text-xs shadow-xs">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="text-muted-foreground">Sinh viên:</span>
                        <span className="font-bold text-foreground">{regData.fullName} ({regData.studentCode})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Tòa & Phòng ở:</span>
                        <span className="font-bold text-foreground">{regData.gender === "female" ? "Tòa C (Nữ)" : "Tòa A (Nam)"} • Phòng {assignedRoom?.room} • {assignedRoom?.compartment}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Mã giường (SSOT):</span>
                        <span className="font-mono font-black text-sky-600 text-sm">{assignedRoom?.bedCode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Mã thẻ ra vào cổng:</span>
                        <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          {assignedRoom?.gateCode}
                        </span>
                      </div>
                      
                    </div>

                    {/* Button into Student portal */}
                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={handleEnterStudentPortal}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-95"
                      >
                        <span>Nhận phòng & mã cổng</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRegStep("FORM")
                          setMainMode("login")
                          setSearchParams({ mode: "login" })
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Quay lại trang Đăng nhập
                      </button>
                    </div>
                  </div>
                ) : (
                  /* STEP 1: REGISTRATION FORM */
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
                    className="space-y-4"
                  >
                    <div className="space-y-1 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                        <Sparkles className="h-4 w-4" />
                        <span>Đăng ký lưu trú KTX Học kỳ Fall 2026</span>
                      </div>
                      <p>
                        Không thu tiền đặt cọc. Sinh viên đăng ký và chuyển khoản tiền ở học kỳ trong 15 phút để nhận ngay phòng và mã số vào cổng an ninh.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block font-semibold text-foreground">
                          Họ và tên sinh viên *
                        </label>
                        <div className="relative">
                          <User className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            required
                            value={regData.fullName}
                            onChange={(e) =>
                              setRegData({
                                ...regData,
                                fullName: e.target.value,
                              })
                            }
                            placeholder="Trần Bảo Nam"
                            className="w-full rounded-xl border border-border bg-background py-2 pr-3 pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block font-semibold text-foreground">
                          Mã số sinh viên (MSSV) *
                        </label>
                        <input
                          type="text"
                          required
                          value={regData.studentCode}
                          onChange={(e) =>
                            setRegData({
                              ...regData,
                              studentCode: e.target.value,
                            })
                          }
                          placeholder="SE185240"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block font-semibold text-foreground">
                          Email FPT *
                        </label>
                        <div className="relative">
                          <Mail className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                          <input
                            type="email"
                            required
                            value={regData.email}
                            onChange={(e) =>
                              setRegData({ ...regData, email: e.target.value })
                            }
                            placeholder="baonam.se185240@fpt.edu.vn"
                            className="w-full rounded-xl border border-border bg-background py-2 pr-3 pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block font-semibold text-foreground">
                          Số điện thoại liên lạc *
                        </label>
                        <div className="relative">
                          <Phone className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                          <input
                            type="tel"
                            required
                            value={regData.phone}
                            onChange={(e) =>
                              setRegData({ ...regData, phone: e.target.value })
                            }
                            placeholder="0987 654 321"
                            className="w-full rounded-xl border border-border bg-background py-2 pr-3 pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block font-semibold text-foreground">
                          Giới tính (để xếp tòa) *
                        </label>
                        <select
                          value={regData.gender}
                          onChange={(e) =>
                            setRegData({ ...regData, gender: e.target.value })
                          }
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="male">Nam sinh viên (Xếp Tòa A hoặc Tòa B)</option>
                          <option value="female">Nữ sinh viên (Xếp Tòa C hoặc Tòa D)</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block font-semibold text-foreground">
                          Loại buồng nguyện vọng *
                        </label>
                        <div className="relative">
                          <select
                            value={regData.roomType}
                            onChange={(e) =>
                              setRegData({
                                ...regData,
                                roomType: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="standard_6">
                              Buồng tiêu chuẩn (6 giường - 3.200.000đ/kỳ)
                            </option>
                            <option value="private_4">
                              Buồng riêng tư (4 giường - 4.000.000đ/kỳ)
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <label className="flex cursor-pointer items-start gap-2 pt-1 text-[11px] text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={regData.agreedRules}
                        onChange={(e) =>
                          setRegData({
                            ...regData,
                            agreedRules: e.target.checked,
                          })
                        }
                        className="mt-0.5 rounded border-border"
                        required
                      />
                      <span>
                        Tôi cam kết tuân thủ nghiêm túc Nội quy Ký túc xá FPT University (Không mang chất cấm, giữ gìn an ninh trật tự, bảo vệ tài sản chung).
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-sm transition-all hover:opacity-95"
                    >
                      <Send className="h-4 w-4" />
                      <span>Tiếp Tục Chuyển Khoản & Nhận Phòng (15 Phút)</span>
                    </button>

                    {/* Sửa lại hiệu ứng hover: Chỉ highlight Đăng nhập ngay, không highlight Đã có tài khoản? */}
                    <div className="pt-1 text-center">
                      <span className="text-xs text-muted-foreground">
                        Đã có tài khoản?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setMainMode("login")
                            setSearchParams({ mode: "login" })
                          }}
                          className="font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline transition-colors ml-1"
                        >
                          Đăng nhập ngay
                        </button>
                      </span>
                    </div>
                  </form>
                )
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("student")
                        setErrorMessage(null)
                        setIsCustomMode(false)
                      }}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2.5 transition-all ${
                        activeTab === "student"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <GraduationCap className="h-4 w-4 text-emerald-600" />
                      <span>Sinh Viên Lưu Trú</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("staff")
                        setErrorMessage(null)
                        setIsCustomMode(false)
                      }}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2.5 transition-all ${
                        activeTab === "staff"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4 text-sky-600" />
                      <span>Cán Bộ / Kỹ Thuật</span>
                    </button>
                  </div>

                  {activeTab === "student" && (
                    <div className="space-y-5">
                      <div className="space-y-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs">
                        <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Quy định phân tòa lưu trú theo giới tính:</span>
                        </div>
                        <p className="leading-relaxed text-muted-foreground">
                          Ký túc xá phân bổ: <strong>Tòa A & Tòa B (Nam sinh viên)</strong> • <strong>Tòa C & Tòa D (Nữ sinh viên)</strong>. Đăng nhập bằng Gmail cá nhân (@gmail.com) đã đăng ký tuyển sinh.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                          Tài khoản Demo dành cho Giảng viên / Đánh giá đồ án:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickDemo("student")}
                          disabled={isLoading}
                          className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 p-3.5 text-left transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-sm font-bold text-emerald-600">
                              VH
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                Nguyễn Hoàng Vinh (Sinh viên K19)
                              </p>
                              <p className="font-mono text-[11px] text-muted-foreground">
                                hoangvinh.student@gmail.com • SE182049
                              </p>
                            </div>
                          </div>
                          <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                            Đăng nhập nhanh
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "staff" && (
                    <div className="space-y-5">
                      <div className="space-y-1.5 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs">
                        <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-400">
                          <Lock className="h-4 w-4" />
                          <span>Quy định xác thực Nghiêm ngặt:</span>
                        </div>
                        <p className="leading-relaxed text-muted-foreground">
                          Cán bộ Quản lý KTX, Kỹ thuật viên bảo trì và Đội ngũ
                          An ninh bảo vệ bắt buộc phải sử dụng email tổ chức
                          mang tên miền <strong>@fpt.edu.vn</strong> hoặc{" "}
                          <strong>@fe.edu.vn</strong>.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                          Chọn vai trò cán bộ để kiểm thử:
                        </span>

                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handleQuickDemo("manager")}
                            disabled={isLoading}
                            className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 p-3 text-left transition-all hover:border-blue-500/50 hover:bg-blue-500/5"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-xs font-bold text-blue-600">
                                QL
                              </div>
                              <div>
                                <p className="text-xs font-bold text-foreground">
                                  Thầy Vũ Thành Nam (Trưởng BQL Tòa A & B - Nam)
                                </p>
                                <p className="font-mono text-[10px] text-muted-foreground">
                                  namvt@fpt.edu.vn • MGR-004
                                </p>
                              </div>
                            </div>
                            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              Vào quyền Quản lý
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickDemo("technician")}
                            disabled={isLoading}
                            className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 p-3 text-left transition-all hover:border-cyan-500/50 hover:bg-cyan-500/5"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-xs font-bold text-cyan-600">
                                KT
                              </div>
                              <div>
                                <p className="text-xs font-bold text-foreground">
                                  Chú Đỗ Mạnh Hùng (Trưởng Kỹ thuật viên - Tòa A & B)
                                </p>
                                <p className="font-mono text-[10px] text-muted-foreground">
                                  hungbv.guard@fe.edu.vn • SEC-012
                                </p>
                              </div>
                            </div>
                            <span className="rounded-md bg-cyan-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              Vào quyền An ninh/KT
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickDemo("admin")}
                            disabled={isLoading}
                            className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 p-3 text-left transition-all hover:border-purple-500/50 hover:bg-purple-500/5"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-xs font-bold text-purple-600">
                                AD
                              </div>
                              <div>
                                <p className="text-xs font-bold text-foreground">
                                  Quản trị viên Hệ thống (System Admin - Quản lý 4 Tòa)
                                </p>
                                <p className="font-mono text-[10px] text-muted-foreground">
                                  admin.dms@fpt.edu.vn • ADM-001
                                </p>
                              </div>
                            </div>
                            <span className="rounded-md bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              Vào quyền Admin
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    {!isCustomMode ? (
                      <button
                        type="button"
                        onClick={() => setIsCustomMode(true)}
                        className="w-full text-center text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                      >
                        Hoặc thử nghiệm nhập địa chỉ email Google khác (Kiểm thử
                        logic miền)
                      </button>
                    ) : (
                      <form onSubmit={handleCustomLogin} className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <label className="text-foreground">
                            Nhập email Google để kiểm thử:
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsCustomMode(false)}
                            className="text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            Đóng
                          </button>
                        </div>

                        <div className="relative">
                          <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                          <input
                            type="email"
                            value={customEmail}
                            onChange={(e) => setCustomEmail(e.target.value)}
                            placeholder={
                              activeTab === "student"
                                ? "vidu.sinhvien@gmail.com"
                                : "canbo@fpt.edu.vn"
                            }
                            className="w-full rounded-xl border border-border bg-background py-2.5 pr-4 pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                          />
                        </div>

                        {activeTab === "staff" && (
                          <div className="flex gap-3 text-xs">
                            <span className="text-[11px] text-muted-foreground">
                              Chọn vai trò cán bộ:
                            </span>
                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="radio"
                                name="staffRole"
                                checked={selectedStaffRole === "manager"}
                                onChange={() => setSelectedStaffRole("manager")}
                              />
                              <span>Quản lý</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="radio"
                                name="staffRole"
                                checked={selectedStaffRole === "technician"}
                                onChange={() =>
                                  setSelectedStaffRole("technician")
                                }
                              />
                              <span>An ninh / KT</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="radio"
                                name="staffRole"
                                checked={selectedStaffRole === "admin"}
                                onChange={() => setSelectedStaffRole("admin")}
                              />
                              <span>Admin</span>
                            </label>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-sky-700 disabled:opacity-50"
                        >
                          {isLoading
                            ? "Đang xác thực Google OAuth..."
                            : "Xác thực & Đăng nhập"}
                        </button>
                      </form>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground">
                    <span>Chưa có hồ sơ lưu trú KTX?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMainMode("register")
                        setSearchParams({ mode: "register" })
                      }}
                      className="font-bold text-emerald-600 hover:underline"
                    >
                      Đăng ký lưu trú &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
