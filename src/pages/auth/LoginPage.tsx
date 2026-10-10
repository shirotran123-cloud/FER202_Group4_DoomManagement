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
      setErrorMessage("Vui lòng nhập địa chỉ email Google của bạn.")
      return
    }

    const targetRole = activeTab === "student" ? "student" : selectedStaffRole
    const result = await loginWithGoogle(customEmail, targetRole)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setErrorMessage(result.message || "Đăng nhập không thành công.")
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
            <h1 className="text-2xl font-black tracking-tight">Cổng Xác Thực Google SSO</h1>
            <p className="text-xs text-white/90 max-w-md mx-auto">
              Hệ thống Quản lý Ký túc xá FPT University (DMS) • Phân luồng đăng nhập chuẩn UC-02
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
                <ShieldCheck className="h-4 w-4 text-orange-600" />
                <span>Cán Bộ / Kỹ Thuật</span>
              </button>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Quy tắc xác thực không thỏa mãn:</p>
                  <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {activeTab === "student" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Quy định tài khoản Sinh viên:</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Sinh viên sử dụng <strong>Gmail cá nhân (@gmail.com)</strong> đã đăng ký trong hồ sơ tuyển sinh với nhà trường. Hệ thống sẽ tự động map hồ sơ nhập học để xét duyệt giường 0-chạm.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tài khoản Demo dành cho Giảng viên / Đánh giá đồ án:
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
                          Nguyễn Hoàng Vinh (Sinh viên K19)
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground">
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
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-orange-700 dark:text-orange-400">
                    <Lock className="h-4 w-4" />
                    <span>Quy định xác thực Nghiêm ngặt:</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Cán bộ Quản lý KTX, Kỹ thuật viên bảo trì và Đội ngũ An ninh bảo vệ bắt buộc phải sử dụng email tổ chức mang tên miền <strong>@fpt.edu.vn</strong> hoặc <strong>@fe.edu.vn</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 font-bold text-xs">
                          QL
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Thầy Vũ Thành Nam (Quản lý KTX)
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground">
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
                      className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 p-3 text-left transition-all hover:border-amber-500/50 hover:bg-amber-500/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 font-bold text-xs">
                          KT
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Chú Đỗ Mạnh Hùng (An ninh / Kỹ thuật)
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            hungbv.guard@fe.edu.vn • SEC-012
                          </p>
                        </div>
                      </div>
                      <span className="rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 font-bold text-xs">
                          AD
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Quản trị viên Hệ thống (System Admin)
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground">
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
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-4"
                >
                  Hoặc thử nghiệm nhập địa chỉ email Google khác (Kiểm thử logic miền)
                </button>
              ) : (
                <form onSubmit={handleCustomLogin} className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <label className="text-foreground">Nhập email Google để kiểm thử:</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomMode(false)}
                      className="text-muted-foreground hover:text-foreground text-[11px]"
                    >
                      Đóng
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
                      <span className="text-muted-foreground text-[11px]">Chọn vai trò cán bộ:</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="staffRole"
                          checked={selectedStaffRole === "manager"}
                          onChange={() => setSelectedStaffRole("manager")}
                        />
                        <span>Quản lý</span>
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
                    {isLoading ? "Đang xác thực Google OAuth..." : "Xác thực & Đăng nhập"}
                  </button>
                </form>
              )}
            </div>

            <div className="rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-600 shrink-0" />
              <span>
                Cơ chế bảo mật sử dụng JWT Access Token (15 phút) tự động cấp mới qua HttpOnly Refresh Token chuẩn UC-03.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}