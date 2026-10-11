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
  CheckCircle2,
  AlertCircle,
  Menu,
  UserPlus,
  LogIn,
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
    <header className="fixed top-0 left-0 lg:left-[260px] right-0 h-[68px] bg-[#faf9f4]/95 backdrop-blur-md z-40 px-4 sm:px-8 flex items-center justify-between border-b border-[#efeee8] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#c2c7cb]/50 bg-white p-2 text-[#1b1c19] hover:bg-[#efeee8] transition-colors lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center gap-2 text-[#42474b] text-sm">
          <span className="text-[#73787b] font-medium hidden sm:inline">Campus Living</span>
        </div>

        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-[#cee6ef] text-[#52686f] text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4c6269]"></span>
          <span>Năm học 2026-2027 · Học kỳ 1</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search bar matching Stitch */}
        <div className="relative hidden md:block w-56 lg:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#73787b] text-base">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm phòng, sinh viên, đơn..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#f4f4ee] text-[#1b1c19] text-xs placeholder:text-[#73787b] focus:outline-none focus:bg-white border border-transparent focus:border-[#c2c7cb] transition-all"
          />
        </div>

        {isAuthenticated && user ? (
          <>
            {/* JWT Timer */}
            <div className="hidden 2xl:flex items-center gap-2 rounded-lg border border-[#efeee8] bg-[#f4f4ee] px-2.5 py-1 text-xs text-[#73787b]">
              <Clock className="h-3.5 w-3.5 text-[#233944]" />
              <span className="font-mono font-semibold text-[#1b1c19]">
                {formatTimer(sessionSecondsLeft)}
              </span>
              <button
                onClick={refreshSession}
                title="Gia hạn phiên làm việc"
                className="rounded p-0.5 text-[#73787b] hover:text-[#1b1c19]"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>

            {/* Role switch button matching Stitch */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown)
                  setShowUserDropdown(false)
                  setShowNotifications(false)
                }}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${currentRoleMeta.badgeClass}`}
              >
                <span className="text-[11px] text-[#73787b] font-normal hidden sm:inline">Role:</span>
                <span className="font-semibold">{currentRoleMeta.label}</span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl border border-[#efeee8] bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
                  <div className="px-2 py-1.5 text-[10px] font-bold text-[#73787b] uppercase tracking-wider">
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
                            ? "bg-[#233944]/10 font-bold text-[#233944]"
                            : "text-[#1b1c19] hover:bg-[#f4f4ee]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                        </span>
                        {isActive && <CheckCircle2 className="h-4 w-4 text-[#233944]" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowRoleDropdown(false)
                  setShowUserDropdown(false)
                }}
                className="relative rounded-lg p-2 text-[#42474b] hover:bg-[#efeee8] transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#efeee8] bg-white p-3 shadow-xl z-50">
                  <div className="flex items-center justify-between border-b border-[#efeee8] pb-2">
                    <span className="text-xs font-bold text-[#1b1c19]">Thông báo hệ thống</span>
                    <span className="text-[10px] text-[#73787b]">Đánh dấu đã đọc</span>
                  </div>
                  <div className="mt-2 space-y-2 text-xs">
                    <div className="flex gap-2.5 rounded-lg bg-orange-500/10 p-2.5 text-orange-950">
                      <AlertCircle className="h-4 w-4 shrink-0 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-xs">Giờ giới nghiêm 23:00</p>
                        <p className="text-[11px] opacity-80">
                          Sinh viên vui lòng nộp đơn về muộn trước 21:00 nếu có lịch học ngoài trường.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2.5 rounded-lg bg-[#f4f4ee] p-2.5">
                      <Building2 className="h-4 w-4 shrink-0 text-[#233944] mt-0.5" />
                      <div>
                        <p className="font-semibold text-xs">Hóa đơn điện nước tháng 09</p>
                        <p className="text-[11px] text-[#73787b]">
                          Đã chốt chỉ số công tơ phòng A205. Vui lòng thanh toán trước ngày 05/10.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill matching Stitch */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown)
                  setShowRoleDropdown(false)
                  setShowNotifications(false)
                }}
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-[#efeee8] transition-all text-left"
              >
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="h-8 w-8 rounded-full object-cover shrink-0"
                />
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold text-[#1b1c19]">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-[#73787b]">
                    SE182049 · Unit A205
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-[#73787b] hidden sm:inline" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#efeee8] bg-white p-2 shadow-xl z-50">
                  <div className="border-b border-[#efeee8] px-3 py-2">
                    <p className="text-xs font-bold text-[#1b1c19]">{user.fullName}</p>
                    <p className="text-[11px] text-[#73787b] truncate">{user.email}</p>
                    <span className="mt-1 inline-block rounded bg-[#233944]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#233944]">
                      {user.roleTitle}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#1b1c19] hover:bg-[#f4f4ee] transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-[#73787b]" />
                      <span>Hồ sơ cá nhân (UC-04)</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#efeee8] pt-1">
                    <button
                      onClick={() => {
                        logout()
                        setShowUserDropdown(false)
                        navigate("/login")
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#ba1a1a] hover:bg-[#ba1a1a]/10 transition-colors"
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
              to="/login?mode=register"
              className="flex items-center gap-1.5 rounded-lg border border-[#233944]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#233944] hover:bg-[#f4f4ee] transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Đăng ký</span>
            </Link>
            <Link
              to="/login?mode=login"
              className="flex items-center gap-1.5 rounded-lg bg-[#233944] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#3a505b] transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Đăng nhập</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}