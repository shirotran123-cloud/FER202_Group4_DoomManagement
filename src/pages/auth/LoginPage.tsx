import React, { useState } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import type { UserRole } from "@/types/auth"
import { ShieldCheck, GraduationCap, CircleAlert, LogIn, Mail, ArrowRight, BedDouble, Receipt, MoonStar } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
interface LocationState {
  from?: { pathname: string }
}

const DEMO_ACCOUNTS: { role: UserRole; name: string; detail: string; initials: string; tint: string }[] = [
  { role: "student", name: "Nguyễn Hoàng Vinh", detail: "Sinh viên · SE182049", initials: "VH", tint: "bg-success/15 text-success-soft-foreground" },
  { role: "manager", name: "Thầy Vũ Thành Nam", detail: "Quản lý KTX · MGR-004", initials: "QL", tint: "bg-primary/15 text-primary-soft-foreground" },
  { role: "technician", name: "Chú Đỗ Mạnh Hùng", detail: "An ninh / Kỹ thuật · SEC-012", initials: "KT", tint: "bg-primary/15 text-primary-soft-foreground" },
  { role: "admin", name: "Quản trị viên", detail: "System Admin · ADM-001", initials: "AD", tint: "bg-primary/15 text-primary-soft-foreground" },
]

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginAsDemoUser, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const modeParam = searchParams.get("mode")
  const mainMode: "login" | "register" = modeParam === "register" ? "register" : "login"
  const setMainMode = (mode: "login" | "register") => setSearchParams({ mode })

  const [activeTab, setActiveTab] = useState<"student" | "staff">("student")
  const [customEmail, setCustomEmail] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [regDone, setRegDone] = useState(false)
  const [regName, setRegName] = useState("Nguyễn Hoàng Vinh")
  const [regCode, setRegCode] = useState("SE182049")
  const [regEmail, setRegEmail] = useState("hoangvinh.student@gmail.com")

  const locationState = location.state as LocationState | null
  const getRoleDestination = (role: UserRole) => {
    if (locationState?.from?.pathname) return locationState.from.pathname
    if (role === "student") return "/overview"
    if (role === "manager") return "/manager"
    if (role === "technician") return "/maintenance"
    return "/overview"
  }

  const handleQuickDemo = (role: UserRole) => {
    setErrorMessage(null)
    loginAsDemoUser(role)
    navigate(getRoleDestination(role), { replace: true })
  }

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    if (!customEmail) {
      setErrorMessage("Vui lòng nhập địa chỉ email.")
      return
    }
    const targetRole: UserRole = activeTab === "student" ? "student" : "manager"
    const result = await loginWithGoogle(customEmail, targetRole)
    if (result.success) navigate(getRoleDestination(targetRole), { replace: true })
    else setErrorMessage(result.message || "Đăng nhập không thành công.")
  }

  const fieldCls =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

  return (
    <div className="grid min-h-[80vh] items-stretch gap-6 lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="relative hidden overflow-hidden rounded-[28px] bg-gradient-to-br from-primary to-primary p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-xl font-black">D</div>
          <p className="font-display text-lg font-extrabold">Domanage</p>
        </div>
        <div>
          <h1 className="font-display text-4xl font-black leading-tight">KTX trong tầm tay.</h1>
          <p className="mt-3 max-w-sm text-[15px] text-white/80">
            Đặt giường, xem hóa đơn VietQR, báo hỏng kèm ảnh, QR qua cổng 23:00.
          </p>
          <div className="mt-8 space-y-3">
            {[
              [BedDouble, "Giữ chỗ giường 15 phút, không trùng lặp"],
              [Receipt, "Hóa đơn điện nước chia tự động"],
              [MoonStar, "Giới nghiêm 23:00, đơn online"],
            ].map(([Icon, text]) => {
              const I = Icon as typeof BedDouble
              return (
                <div key={text as string} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                    <I className="h-4 w-4" />
                  </span>
                  {text as string}
                </div>
              )
            })}
          </div>
        </div>
        <p className="text-xs text-white/60">FPT University · Hotline bảo vệ 1900 6868</p>
      </div>

      {/* Right — form card */}
      <div className="dms-card flex flex-col justify-center p-6 sm:p-10">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1 text-sm font-bold">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMainMode(m)
                setErrorMessage(null)
              }}
              className={`rounded-xl py-2.5 transition-all ${mainMode === m ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {m === "login" ? "Đăng nhập" : "Đăng ký ở KTX"}
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-danger/20 bg-danger-soft p-3.5 text-[13px] text-danger-soft-foreground dark:bg-danger-soft">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        {mainMode === "register" ? (
          regDone ? (
            <div className="py-8 text-center">
              <p className="font-display text-xl font-extrabold">Đã nhận hồ sơ!</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Hồ sơ của <strong>{regName} ({regCode})</strong> đã được tiếp nhận. Đăng nhập demo để giữ chỗ giường ngay.
              </p>
              <Button className="mt-6 shadow-primary transition-transform" type="button" onClick={() => handleQuickDemo("student")}>
                Đăng nhập giữ chỗ <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!regName || !regCode || !regEmail) {
                  setErrorMessage("Điền đủ họ tên, MSSV và email.")
                  return
                }
                setRegDone(true)
                setErrorMessage(null)
              }}
              className="mt-6 space-y-3.5"
            >
              <div>
                <label className="mb-1.5 block text-[13px] font-bold">Họ và tên *</label>
                <Input value={regName} onChange={(e) => setRegName(e.target.value)} className={fieldCls} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold">MSSV *</label>
                  <Input value={regCode} onChange={(e) => setRegCode(e.target.value.toUpperCase())} className={`${fieldCls} font-mono`} required />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold">SĐT</label>
                  <Input placeholder="0912345678" className={fieldCls} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-bold">Gmail *</label>
                <Input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={fieldCls} required />
              </div>
              <Button className="flex w-full shadow-primary transition-transform" type="submit">
                Nộp hồ sơ đăng ký <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )
        ) : (
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-[13px] font-bold">
              {(
                [
                  ["student", "Sinh viên", GraduationCap],
                  ["staff", "Cán bộ", ShieldCheck],
                ] as const
              ).map(([tab, label, Icon]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab)
                    setErrorMessage(null)
                  }}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 transition-all ${activeTab === tab ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2.5">
              {DEMO_ACCOUNTS.filter((a) => (activeTab === "student" ? a.role === "student" : a.role !== "student")).map((a) => (
                <button
                  key={a.role}
                  type="button"
                  onClick={() => handleQuickDemo(a.role)}
                  disabled={isLoading}
                  className="flex w-full items-center justify-between rounded-2xl border border-border p-3.5 text-left transition-all hover:-translate-y-px hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-[13px] font-black ${a.tint}`}>
                      {a.initials}
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{a.name}</span>
                      <span className="block font-mono text-[11px] text-muted-foreground">{a.detail}</span>
                    </span>
                  </span>
                  <span className="flex items-center gap-1 rounded-xl bg-foreground px-3 py-1.5 text-xs font-bold text-white">
                    <LogIn className="h-3.5 w-3.5" /> Vào
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={handleCustomLogin} className="mt-5 border-t border-border pt-5">
              <label className="mb-1.5 block text-[13px] font-bold">Hoặc đăng nhập bằng email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder={activeTab === "student" ? "ban@gmail.com" : "canbo@fpt.edu.vn"}
                  className={`${fieldCls} pl-10`}
                />
              </div>
              <button type="submit" disabled={isLoading} className="mt-2.5 w-full rounded-2xl border border-border py-3 text-sm font-bold transition-colors hover:bg-muted disabled:opacity-50">
                {isLoading ? "Đang xác thực…" : "Tiếp tục với email"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
