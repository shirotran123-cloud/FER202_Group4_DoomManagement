import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import type { UserRole } from "@/types/auth"
import { User, LogOut, Bell, ChevronDown, CircleCheck, Menu, LogIn, Sun, Moon, GraduationCap, ClipboardList, ShieldCheck, Crown, CircleAlert, Receipt, Wrench, Clock3, Inbox } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Avatar } from "@/components/ui/avatar"
import { communityApi, type AppNotification } from "@/lib/api"

interface NavbarProps {
  onToggleSidebar?: () => void
}

const ROLE_META: Record<UserRole, { label: string; icon: React.ReactNode }> = {
  student: { label: "Sinh viên", icon: <GraduationCap className="h-3.5 w-3.5" /> },
  manager: { label: "Quản lý", icon: <ClipboardList className="h-3.5 w-3.5" /> },
  technician: { label: "Kỹ thuật", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  admin: { label: "Admin", icon: <Crown className="h-3.5 w-3.5" /> },
}

/** Biểu tượng và màu theo loại thông báo, để nhìn là biết chuyện gì. */
const NOTIFICATION_META: Record<AppNotification["kind"], { icon: React.ReactNode; tone: string }> = {
  INVOICE: { icon: <Receipt className="h-3.5 w-3.5" />, tone: "text-primary" },
  CURFEW: { icon: <Clock3 className="h-3.5 w-3.5" />, tone: "text-danger" },
  TICKET: { icon: <Wrench className="h-3.5 w-3.5" />, tone: "text-success" },
  CONTRACT: { icon: <CircleCheck className="h-3.5 w-3.5" />, tone: "text-success" },
  SYSTEM: { icon: <CircleAlert className="h-3.5 w-3.5" />, tone: "text-muted-foreground" },
}

/** Hiện thời gian tương đối ngắn gọn: "3 giờ trước", "hôm qua", hoặc ngày cụ thể. */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""
  const diffMinutes = Math.floor((Date.now() - then) / 60000)
  if (diffMinutes < 1) return "vừa xong"
  if (diffMinutes < 60) return `${diffMinutes} phút trước`
  const hours = Math.floor(diffMinutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days === 1) return "hôm qua"
  if (days < 7) return `${days} ngày trước`
  return new Date(iso).toLocaleDateString("vi-VN")
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout, switchRole } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState<"role" | "user" | "bell" | null>(null)

  const toggle = (menu: "role" | "user" | "bell") => setOpenMenu((prev) => (prev === menu ? null : menu))
  const meta = user ? ROLE_META[user.role] : ROLE_META.student

  /*
    Thông báo lấy từ máy chủ. Trước đây chấm đỏ và hai thẻ thông báo được viết
    cứng nên luôn hiện "có thông báo" dù chẳng có gì, và bấm vào cũng không mất.
    Nay chấm đỏ chỉ hiện khi `unreadCount > 0`, và mở chuông là đánh dấu đã đọc.
  */
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      return
    }
    let cancelled = false
    void communityApi
      .notifications()
      .then((payload) => {
        if (cancelled) return
        setNotifications(payload.data ?? [])
        setUnreadCount(payload.meta?.unreadCount ?? 0)
      })
      .catch(() => {
        // Máy chủ không phản hồi thì không hiện chấm đỏ, thay vì báo sai là có tin.
        if (cancelled) return
        setNotifications([])
        setUnreadCount(0)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user?.id])

  /** Mở/đóng chuông; mở thì đánh dấu đã đọc để chấm đỏ tắt ngay. */
  const handleToggleBell = () => {
    const willOpen = openMenu !== "bell"
    toggle("bell")
    if (!willOpen || unreadCount === 0) return

    // Tắt chấm đỏ ngay cho phản hồi tức thì, rồi mới đồng bộ với máy chủ.
    setUnreadCount(0)
    setNotifications((rows) => rows.map((n) => ({ ...n, read: true })))
    void communityApi
      .markNotificationsRead({ all: true })
      .then((payload) => {
        setNotifications(payload.data ?? [])
        setUnreadCount(payload.meta?.unreadCount ?? 0)
      })
      .catch(() => {
        // Không đánh dấu được thì tải lại để chấm đỏ phản ánh đúng sự thật.
        void communityApi
          .notifications()
          .then((payload) => {
            setNotifications(payload.data ?? [])
            setUnreadCount(payload.meta?.unreadCount ?? 0)
          })
          .catch(() => undefined)
      })
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-[72px] items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md sm:px-6 lg:left-[272px]">
      <div className="flex min-w-0 items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted lg:hidden"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="hidden items-center gap-2 rounded-full bg-muted px-3.5 py-1.5 text-xs font-semibold text-muted-foreground xl:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <span>Năm học 2026–2027 · Học kỳ 1</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isAuthenticated && user ? (
          <>
            <div className="relative">
              <button
                onClick={() => toggle("role")}
                className="flex items-center gap-1.5 rounded-xl bg-primary-soft px-3 py-2 text-xs font-bold text-primary-soft-foreground transition-colors hover:bg-primary-soft dark:bg-primary-soft dark:text-primary-soft-foreground"
              >
                {meta.icon}
                <span className="hidden sm:inline">{meta.label}</span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>
              {openMenu === "role" && (
                <div className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-border bg-card p-2 shadow-xl">
                  <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Đổi vai trò demo
                  </p>
                  {(Object.keys(ROLE_META) as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        void switchRole(r)
                        setOpenMenu(null)
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[13px] transition-colors ${
                        user.role === r ? "bg-muted font-bold" : "hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {ROLE_META[r].icon}
                        {ROLE_META[r].label}
                      </span>
                      {user.role === r && <CircleCheck className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted"
              title={theme === "dark" ? "Nền sáng" : "Nền tối"}
              aria-label="Đổi nền"
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>

            <div className="relative">
              <button
                onClick={handleToggleBell}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted"
                aria-label={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo"}
              >
                <Bell className="h-[18px] w-[18px]" />
                {/* Chấm đỏ CHỈ hiện khi máy chủ báo còn thông báo chưa đọc. */}
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white ring-2 ring-card">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {openMenu === "bell" && (
                <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-[13px] font-bold">Thông báo</p>
                    {notifications.length > 0 && (
                      <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">
                        {notifications.length} tin
                      </span>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                      <Inbox className="h-6 w-6 text-muted-foreground" />
                      <p className="text-xs font-semibold text-foreground">Không có thông báo nào</p>
                      <p className="text-[11px] text-muted-foreground">
                        Tin về hóa đơn, giới nghiêm và phiếu sự cố sẽ hiện ở đây.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-80 space-y-1.5 overflow-y-auto p-2">
                      {notifications.map((n) => {
                        const style = NOTIFICATION_META[n.kind] ?? NOTIFICATION_META.SYSTEM
                        return (
                          <div
                            key={n.id}
                            className={`rounded-xl border p-3 ${
                              n.read ? "border-border bg-muted/60" : "border-primary/30 bg-primary-soft"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className={`mt-0.5 shrink-0 ${style.tone}`}>{style.icon}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-foreground">{n.title}</p>
                                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                  {n.body}
                                </p>
                                <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                                  {relativeTime(n.at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => toggle("user")}
                className="flex items-center gap-2.5 rounded-xl border border-border py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-muted"
              >
                <Avatar name={user.fullName} className="h-8 w-8 text-xs" />
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block max-w-[120px] truncate text-[13px] font-bold">{user.fullName}</span>
                  <span className="block font-mono text-[10px] text-muted-foreground">
                    {user.studentId || user.staffId || user.roleTitle}
                  </span>
                </span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
              </button>
              {openMenu === "user" && (
                <div className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-border bg-card p-2 shadow-xl">
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="truncate text-[13px] font-bold">{user.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setOpenMenu(null)}
                    className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-muted"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Hồ sơ cá nhân
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setOpenMenu(null)
                      navigate("/login")
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-danger transition-colors hover:bg-danger-soft dark:hover:bg-danger-soft"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login?mode=login"
              className="flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-[13px] font-bold text-white transition-transform hover:scale-[1.02]"
            >
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
