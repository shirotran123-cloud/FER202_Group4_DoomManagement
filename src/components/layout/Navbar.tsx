 import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import type { UserRole } from "@/types/auth"
import {
  Building2,
  User,
  LogOut,
  Bell,
  Clock,
  RefreshCw,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Menu,
} from "lucide-react"

interface NavbarProps {
  onToggleSidebar?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout, switchRole, sessionSecondsLeft, refreshSession } = useAuth()
  const navigate = useNavigate()
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const roleMeta: Record<
    UserRole,
    { label: string; badgeClass: string; borderClass: string; icon: string }
  > = {
    student: {
      label: "Sinh viên",
      badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      borderClass: "border-emerald-500",
      icon: "🎓",
    },
    manager: {
      label: "Quản lý KTX",
      badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
      borderClass: "border-blue-500",
      icon: "🏢",
    },
    technician: {
      label: "An ninh / Kỹ thuật",
      badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      borderClass: "border-amber-500",
      icon: "🛡️",
    },
    admin: {
      label: "Quản trị viên",
      badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
      borderClass: "border-purple-500",
      icon: "⚡",
    },
  }

  const currentRoleMeta = user ? roleMeta[user.role] : roleMeta.student

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card p-2 text-foreground transition-colors hover:bg-muted md:hidden"
              aria-label="Toggle Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 text-white shadow-md shadow-orange-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-foreground sm:text-lg">
                  FPT DORMITORY
                </span>
                <span className="rounded-md bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  DMS 2.0
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                Hệ thống Quản lý Ký túc xá Trực tuyến
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && user ? (
            <>
              <div className="hidden lg:flex items-center gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Phiên JWT:</span>
                <span className="font-mono font-semibold text-foreground">
                  {formatTimer(sessionSecondsLeft)}
                </span>
                <button
                  onClick={refreshSession}
                  title="Gia hạn phiên làm việc (Refresh Token)"
                  className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowRoleDropdown(!showRoleDropdown)
                    setShowUserDropdown(false)
                    setShowNotifications(false)
                  }}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${currentRoleMeta.badgeClass}`}
                >
                  <span>{currentRoleMeta.icon}</span>
                  <span className="font-semibold hidden sm:inline">{currentRoleMeta.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-2 text-card-foreground shadow-xl ring-1 ring-black/5 z-50">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Chuyển đổi vai trò Demo
                    </div>
                    {(["student", "manager", "technician", "admin"] as UserRole[]).map((r) => {
                      const meta = roleMeta[r]
                      const isActive = user.role === r
                      return (
                        <button
                          key={r}
                          onClick={() => {
                            switchRole(r)
                            setShowRoleDropdown(false)
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
                            isActive
                              ? "bg-primary/10 font-bold text-primary"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{meta.icon}</span>
                            <span>{meta.label}</span>
                          </span>
                          {isActive && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications)
                    setShowRoleDropdown(false)
                    setShowUserDropdown(false)
                  }}
                  className="relative rounded-lg border border-border bg-card p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    2
                  </span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-3 shadow-xl z-50">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-xs font-bold text-foreground">Thông báo hệ thống</span>
                      <span className="text-[10px] text-muted-foreground">Đánh dấu đã đọc</span>
                    </div>
                    <div className="mt-2 space-y-2 text-xs">
                      <div className="flex gap-2.5 rounded-lg bg-orange-500/10 p-2.5 text-orange-900 dark:text-orange-200">
                        <AlertCircle className="h-4 w-4 shrink-0 text-orange-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-xs">Giờ giới nghiêm 23:00</p>
                          <p className="text-[11px] opacity-80">
                            Sinh viên vui lòng nộp đơn về muộn trước 21:00 nếu có lịch học ngoài trường.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 rounded-lg bg-muted/70 p-2.5">
                        <Building2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        <div>
                          <p className="font-semibold text-xs">Hóa đơn điện nước tháng 09</p>
                          <p className="text-[11px] text-muted-foreground">
                            Đã chốt chỉ số công tơ phòng A205. Vui lòng thanh toán trước ngày 05/10.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown)
                    setShowRoleDropdown(false)
                    setShowNotifications(false)
                  }}
                  className="flex items-center gap-2 rounded-full border border-border p-1 hover:ring-2 hover:ring-primary/40 transition-all"
                >
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-foreground hidden md:inline px-1">
                    {user.fullName.split(" ").slice(-2).join(" ")}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:inline" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl z-50">
                    <div className="border-b border-border px-3 py-2">
                      <p className="text-xs font-bold text-foreground">{user.fullName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                      <span className="mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {user.roleTitle}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                      >
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Hồ sơ cá nhân (UC-04)</span>
                      </Link>
                    </div>

                    <div className="border-t border-border pt-1">
                      <button
                        onClick={() => {
                          logout()
                          setShowUserDropdown(false)
                          navigate("/login")
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Đăng xuất (UC-03)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Đăng nhập Google</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}