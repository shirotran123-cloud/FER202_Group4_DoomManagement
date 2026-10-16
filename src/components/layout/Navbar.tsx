import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import type { UserRole } from "@/types/auth"
import { User, LogOut, Bell, ChevronDown, CircleCheck, Menu, LogIn, Sun, Moon, GraduationCap, ClipboardList, ShieldCheck, Crown } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Avatar } from "@/components/ui/avatar"

interface NavbarProps {
  onToggleSidebar?: () => void
}

const ROLE_META: Record<UserRole, { label: string; icon: React.ReactNode }> = {
  student: { label: "Sinh viên", icon: <GraduationCap className="h-3.5 w-3.5" /> },
  manager: { label: "Quản lý", icon: <ClipboardList className="h-3.5 w-3.5" /> },
  technician: { label: "Kỹ thuật", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  admin: { label: "Admin", icon: <Crown className="h-3.5 w-3.5" /> },
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout, switchRole } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState<"role" | "user" | "bell" | null>(null)

  const toggle = (menu: "role" | "user" | "bell") => setOpenMenu((prev) => (prev === menu ? null : menu))
  const meta = user ? ROLE_META[user.role] : ROLE_META.student

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
                        switchRole(r)
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
                onClick={() => toggle("bell")}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted"
                aria-label="Thông báo"
              >
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger ring-2 ring-card" />
              </button>
              {openMenu === "bell" && (
                <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-border bg-card p-4 shadow-xl">
                  <p className="text-[13px] font-bold">Thông báo</p>
                  <div className="mt-2 space-y-2 text-xs">
                    <div className="rounded-xl border border-primary/30 bg-primary-soft p-3">
                      <p className="font-bold">Giới nghiêm 23:00</p>
                      <p className="mt-0.5 text-muted-foreground">Nộp đơn trước 21:00 nếu có lịch học, làm thêm.</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/60 p-3">
                      <p className="font-bold">Hóa đơn tháng 09</p>
                      <p className="mt-0.5 text-muted-foreground">Đã chốt chỉ số phòng A205. Kiểm tra và thanh toán.</p>
                    </div>
                  </div>
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
