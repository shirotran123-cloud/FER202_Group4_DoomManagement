import { DemoAccountSwitcher } from "@/components/common/DemoAccountSwitcher"
import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import {
  Building2,
  User,
  LogOut,
  ChevronDown,
  Menu,
  UserPlus,
  LogIn,
  Sun,
  Moon,
  Database,
  Zap,
  Clock,
  Wrench,
  Check,
  CheckCheck,
} from "lucide-react"
import { Bell as AnimatedBell } from "@/components/animate-ui/icons/bell"
import { useTheme } from "@/components/theme-provider"
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  subscribeNotifications,
  type SystemNotification,
} from "@/services/notificationService"

interface NavbarProps {
  onToggleSidebar?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Real-time notifications
  const [notifications, setNotifications] = useState<SystemNotification[]>(() =>
    getUserNotifications(user?.role, user?.dormitoryStatus?.room)
  )

  useEffect(() => {
    const unsub = subscribeNotifications((list) => {
      setNotifications(
        list.filter((n) => {
          if (n.targetRole && n.targetRole !== "all") {
            if (user?.role === "student" && n.targetRole !== "student") return false
          }
          return true
        })
      )
    })
    return () => unsub()
  }, [user?.role, user?.dormitoryStatus?.room])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAllAsRead = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

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

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Supabase Database Link - Chỉ hiển thị cho Quản lý & Admin */}
        {isAuthenticated && user && (user.role === "manager" || user.role === "admin") && (
          <Link
            to="/supabase"
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Quản lý kết nối CSDL Supabase (Dành cho Quản lý & Admin)"
          >
            <Database className="h-3.5 w-3.5 text-emerald-500" />
            <span>Supabase DB</span>
          </Link>
        )}

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

            {/* Notification bell with dynamic animated icon & real-time badge */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowUserDropdown(false)
                }}
                className="relative flex items-center justify-center rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Notifications"
                title="Thông báo hệ thống"
              >
                <AnimatedBell
                  size={19}
                  animate={unreadCount > 0 ? "default" : undefined}
                  animateOnHover="default"
                  className={unreadCount > 0 ? "text-primary" : "text-slate-600 dark:text-slate-300"}
                />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white shadow-xs animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed inset-x-3 top-[68px] z-50 mt-1 max-w-sm mx-auto sm:max-w-none sm:mx-0 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-92 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl dark:border-slate-800 dark:bg-[#111827] animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Thông báo hệ thống
                      </span>
                      {unreadCount > 0 ? (
                        <span className="rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-1.5 py-0.5">
                          {unreadCount} mới
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium px-1.5 py-0.5">
                          Đã đọc tất cả
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 ? (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="cursor-pointer text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        <CheckCheck className="h-3 w-3" />
                        <span>Đánh dấu đã đọc</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span>Tất cả đã đọc</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 space-y-2 max-h-[380px] overflow-y-auto pr-1 text-xs">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground italic">
                        Không có thông báo nào.
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const isUnread = !item.isRead
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleMarkAsRead(item.id)}
                            className={`group relative flex gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                              isUnread
                                ? item.type === "PAYMENT_REMINDER"
                                  ? "border-rose-300/80 bg-rose-50/80 dark:border-rose-900/50 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 ring-1 ring-rose-400/30 shadow-xs"
                                  : item.type === "INVOICE_PUBLISHED"
                                    ? "border-amber-300/80 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-100 ring-1 ring-amber-400/30 shadow-xs"
                                    : item.type === "CURFEW"
                                      ? "border-cyan-200 bg-cyan-50/60 dark:border-cyan-900/50 dark:bg-cyan-950/20 text-cyan-900 dark:text-cyan-100 ring-1 ring-cyan-400/30 shadow-xs"
                                      : "border-slate-300 bg-blue-50/40 dark:border-slate-700 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 ring-1 ring-primary/30 shadow-xs"
                                : "border-slate-200/60 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 opacity-65 hover:opacity-95"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {item.type === "PAYMENT_REMINDER" && (
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                    isUnread
                                      ? "bg-rose-500 text-white shadow-xs"
                                      : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                  }`}
                                >
                                  <AnimatedBell
                                    size={15}
                                    animate={isUnread ? "default" : undefined}
                                  />
                                </div>
                              )}
                              {item.type === "INVOICE_PUBLISHED" && (
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                    isUnread
                                      ? "bg-amber-500 text-white shadow-xs"
                                      : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                  }`}
                                >
                                  <Zap className="h-3.5 w-3.5" />
                                </div>
                              )}
                              {item.type === "CURFEW" && (
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                    isUnread
                                      ? "bg-cyan-600 text-white shadow-xs"
                                      : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                  }`}
                                >
                                  <Clock className="h-3.5 w-3.5" />
                                </div>
                              )}
                              {item.type === "MAINTENANCE" && (
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                    isUnread
                                      ? "bg-emerald-600 text-white shadow-xs"
                                      : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                  }`}
                                >
                                  <Wrench className="h-3.5 w-3.5" />
                                </div>
                              )}
                              {item.type === "SYSTEM" && (
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                    isUnread
                                      ? "bg-blue-600 text-white shadow-xs"
                                      : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                  }`}
                                >
                                  <Building2 className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <p
                                  className={`text-xs leading-tight line-clamp-1 ${
                                    isUnread
                                      ? "font-bold text-slate-900 dark:text-white"
                                      : "font-medium text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  {item.title}
                                </p>
                                <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                                  {item.timeStr}
                                </span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                                {item.content}
                              </p>
                              {item.actionUrl && (
                                <div className="pt-1 flex items-center justify-between">
                                  <Link
                                    to={item.actionUrl}
                                    onClick={() => {
                                      handleMarkAsRead(item.id)
                                      setShowNotifications(false)
                                    }}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                                  >
                                    <span>{item.actionLabel || "Xem chi tiết →"}</span>
                                  </Link>
                                </div>
                              )}
                            </div>

                            {/* Status indicator / quick mark read */}
                            <div className="shrink-0 flex items-center">
                              {isUnread ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleMarkAsRead(item.id, e)}
                                  title="Đánh dấu đã đọc"
                                  className="h-6 w-6 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-primary"
                                >
                                  <span className="h-2 w-2 rounded-full bg-primary" />
                                </button>
                              ) : (
                                <span
                                  className="text-[9px] text-muted-foreground font-mono flex items-center gap-0.5"
                                  title="Đã đọc"
                                >
                                  <Check className="h-3 w-3 text-emerald-500" />
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
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
