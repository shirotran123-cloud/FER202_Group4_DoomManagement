import { DemoAccountSwitcher } from "@/components/common/DemoAccountSwitcher"
import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import {
  Building2,
  User,
  LogOut,
  Bell,
  ChevronDown,
  AlertCircle,
  Menu,
  UserPlus,
  LogIn,
  Sun,
  Moon,
  Smartphone,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"

interface NavbarProps {
  onToggleSidebar?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-xs backdrop-blur-md sm:px-8 lg:left-[260px] dark:border-slate-800 dark:bg-[#111827]/95">
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-800 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-700">
          <span className="hidden shrink-0 font-medium whitespace-nowrap text-slate-500 sm:inline">
            FPT University Dormitory
          </span>
        </div>

        <div className="hidden shrink-0 items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-slate-600 dark:text-slate-400 xl:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
          <span>Năm học 2026-2027 · Học kỳ 1</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile App Direct Button */}
        <Link
          to="/mobile"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 transition-all shadow-2xs"
          title="Mở giao diện App Di Động"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Mobile App</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </Link>

        {/* Demo Account Switcher */}
        <DemoAccountSwitcher variant="navbar" />
        {isAuthenticated && user ? (
          <>
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700 shadow-2xs transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title={
                theme === "dark"
                  ? "Chuyển sang Nền Sáng"
                  : "Chuyển sang Nền Tối"
              }
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-cyan-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowUserDropdown(false)
                }}
                className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-600"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900">
                      Thông báo hệ thống
                    </span>
                    <span className="cursor-pointer text-[10px] text-slate-500 hover:text-slate-800">
                      Đánh dấu đã đọc
                    </span>
                  </div>
                  <div className="mt-2 space-y-2 text-xs">
                    <div className="flex gap-2.5 rounded-lg border border-cyan-200 bg-cyan-50 p-2.5 text-cyan-900">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                      <div>
                        <p className="text-xs font-semibold text-cyan-900">
                          Giờ giới nghiêm 23:00
                        </p>
                        <p className="text-[11px] leading-relaxed text-cyan-700">
                          Sinh viên vui lòng nộp đơn về muộn trước 21:00 nếu có
                          lịch học hoặc công việc.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          Hóa đơn điện nước tháng 09
                        </p>
                        <p className="text-[11px] leading-relaxed text-slate-600">
                          Đã chốt chỉ số công tơ phòng A205. Vui lòng kiểm tra
                          và thanh toán.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown)
                  setShowNotifications(false)
                }}
                className="flex items-center gap-2 rounded-lg p-1 text-left transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="hidden flex-col text-left leading-tight sm:flex">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {user.role === "manager"
                      ? `${user.staffId || "MGR-004"} · Quản lý Tòa A`
                      : user.role === "technician"
                      ? `${user.staffId || "TECH-012"} · Kỹ thuật viên`
                      : user.role === "admin"
                      ? `${user.staffId || "ADM-001"} · Quản trị viên`
                      : `${user.studentId || "SE182049"} · Unit ${user.dormitoryStatus?.room || "A205"}`}
                  </span>
                </div>
                <ChevronDown className="hidden h-3 w-3 text-slate-400 sm:inline dark:text-slate-500" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-xs font-bold text-slate-900">
                      {user.fullName}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        logout()
                        setShowUserDropdown(false)
                        navigate("/login")
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Đăng xuất</span>
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
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Đăng ký</span>
            </Link>
            <Link
              to="/login?mode=login"
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-slate-800"
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
export default Navbar
