 import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import type { UserRole } from "@/types/auth"
import {
  Building2,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
} from "lucide-react"

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginAsDemoUser, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState<"student" | "staff">("student")
  const [selectedStaffRole, setSelectedStaffRole] = useState<UserRole>("manager")

  const [customEmail, setCustomEmail] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCustomMode, setIsCustomMode] = useState(false)

  interface LocationState {
    from?: {
      pathname: string
    }
  }
  const locationState = location.state as LocationState | null
  const from = locationState?.from?.pathname || "/profile"

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!customEmail) {
      setErrorMessage("Vui lÃ²ng nháº­p Ä‘á»‹a chá»‰ email Google cá»§a báº¡n.")
      return
    }

    const targetRole = activeTab === "student" ? "student" : selectedStaffRole
    const result = await loginWithGoogle(customEmail, targetRole)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setErrorMessage(result.message || "ÄÄƒng nháº­p khÃ´ng thÃ nh cÃ´ng.")
    }
  }

  const handleQuickDemo = (role: UserRole) => {
    setErrorMessage(null)
    loginAsDemoUser(role)
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8">
      <div className="w-full max-w-xl">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
          <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 p-8 text-white text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner mb-1">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Cá»•ng XÃ¡c Thá»±c Google SSO</h1>
            <p className="text-xs text-white/90 max-w-md mx-auto">
              Há»‡ thá»‘ng Quáº£n lÃ½ KÃ½ tÃºc xÃ¡ FPT University (DMS) â€¢ PhÃ¢n luá»“ng Ä‘Äƒng nháº­p chuáº©n UC-02
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
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
                <span>Sinh ViÃªn LÆ°u TrÃº</span>
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
                <ShieldCheck className="h-4 w-4 text-orange-600" />
                <span>CÃ¡n Bá»™ / Ká»¹ Thuáº­t</span>
              </button>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Quy táº¯c xÃ¡c thá»±c khÃ´ng thá»a mÃ£n:</p>
                  <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {activeTab === "student" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Quy Ä‘á»‹nh tÃ i khoáº£n Sinh viÃªn:</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Sinh viÃªn sá»­ dá»¥ng <strong>Gmail cÃ¡ nhÃ¢n (@gmail.com)</strong> Ä‘Ã£ Ä‘Äƒng kÃ½ trong há»“ sÆ¡ tuyá»ƒn sinh vá»›i nhÃ  trÆ°á»ng. Há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng map há»“ sÆ¡ nháº­p há»c Ä‘á»ƒ xÃ©t duyá»‡t giÆ°á»ng 0-cháº¡m.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    TÃ i khoáº£n Demo dÃ nh cho Giáº£ng viÃªn / ÄÃ¡nh giÃ¡ Ä‘á»“ Ã¡n:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("student")}
                    disabled={isLoading}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 p-3.5 text-left transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 font-bold text-sm">
                        VH
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Nguyá»…n HoÃ ng Vinh (Sinh viÃªn K19)
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          hoangvinh.student@gmail.com â€¢ SE182049
                        </p>
                      </div>
                    </div>
                    <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                      ÄÄƒng nháº­p nhanh
                    </span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "staff" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-orange-700 dark:text-orange-400">
                    <Lock className="h-4 w-4" />
                    <span>Quy Ä‘á»‹nh xÃ¡c thá»±c NghiÃªm ngáº·t:</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    CÃ¡n bá»™ Quáº£n lÃ½ KTX, Ká»¹ thuáº­t viÃªn báº£o trÃ¬ vÃ  Äá»™i ngÅ© An ninh báº£o vá»‡ báº¯t buá»™c pháº£i sá»­ dá»¥ng email tá»• chá»©c mang tÃªn miá»n <strong>@fpt.edu.vn</strong> hoáº·c <strong>@fe.edu.vn</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Chá»n vai trÃ² cÃ¡n bá»™ Ä‘á»ƒ kiá»ƒm thá»­:
                  </span>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo("manager")}
                      disabled={isLoading}
                      className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 p-3 text-left transition-all hover:border-blue-500/50 hover:bg-blue-500/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 font-bold text-xs">
                          QL
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Tháº§y VÅ© ThÃ nh Nam (Quáº£n lÃ½ KTX)
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            namvt@fpt.edu.vn â€¢ MGR-004
                          </p>
                        </div>
                      </div>
                      <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        VÃ o quyá»n Quáº£n lÃ½
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemo("technician")}
                      disabled={isLoading}
                      className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 p-3 text-left transition-all hover:border-amber-500/50 hover:bg-amber-500/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 font-bold text-xs">
                          KT
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            ChÃº Äá»— Máº¡nh HÃ¹ng (An ninh / Ká»¹ thuáº­t)
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            hungbv.guard@fe.edu.vn â€¢ SEC-012
                          </p>
                        </div>
                      </div>
                      <span className="rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        VÃ o quyá»n An ninh/KT
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemo("admin")}
                      disabled={isLoading}
                      className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 p-3 text-left transition-all hover:border-purple-500/50 hover:bg-purple-500/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 font-bold text-xs">
                          AD
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Quáº£n trá»‹ viÃªn Há»‡ thá»‘ng (System Admin)
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            admin.dms@fpt.edu.vn â€¢ ADM-001
                          </p>
                        </div>
                      </div>
                      <span className="rounded-md bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        VÃ o quyá»n Admin
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
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-4"
                >
                  Hoáº·c thá»­ nghiá»‡m nháº­p Ä‘á»‹a chá»‰ email Google khÃ¡c (Kiá»ƒm thá»­ logic miá»n)
                </button>
              ) : (
                <form onSubmit={handleCustomLogin} className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <label className="text-foreground">Nháº­p email Google Ä‘á»ƒ kiá»ƒm thá»­:</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomMode(false)}
                      className="text-muted-foreground hover:text-foreground text-[11px]"
                    >
                      ÄÃ³ng
                    </button>
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder={
                        activeTab === "student"
                          ? "vidu.sinhvien@gmail.com"
                          : "canbo@fpt.edu.vn"
                      }
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {activeTab === "staff" && (
                    <div className="flex gap-3 text-xs">
                      <span className="text-muted-foreground text-[11px]">Chá»n vai trÃ² cÃ¡n bá»™:</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="staffRole"
                          checked={selectedStaffRole === "manager"}
                          onChange={() => setSelectedStaffRole("manager")}
                        />
                        <span>Quáº£n lÃ½</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="staffRole"
                          checked={selectedStaffRole === "technician"}
                          onChange={() => setSelectedStaffRole("technician")}
                        />
                        <span>An ninh / KT</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Äang xÃ¡c thá»±c Google OAuth..." : "XÃ¡c thá»±c & ÄÄƒng nháº­p"}
                  </button>
                </form>
              )}
            </div>

            <div className="rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-600 shrink-0" />
              <span>
                CÆ¡ cháº¿ báº£o máº­t sá»­ dá»¥ng JWT Access Token (15 phÃºt) tá»± Ä‘á»™ng cáº¥p má»›i qua HttpOnly Refresh Token chuáº©n UC-03.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}