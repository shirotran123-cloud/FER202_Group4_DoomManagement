import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import type { UserRole } from "@/types/auth"
import { LayoutDashboard, BedDouble, Receipt, Wrench, MoonStar, Users, Megaphone, Store, UserRound, ClipboardList, LogOut, LogIn, Sparkles } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  title: string
  to: string
  icon: React.ReactNode
  badge?: string
}

const ICON_CLS = "h-[18px] w-[18px] shrink-0"

const STUDENT_NAV: NavItem[] = [
  { title: "Tổng quan", to: "/overview", icon: <LayoutDashboard className={ICON_CLS} /> },
  { title: "Phòng của tôi", to: "/my-room", icon: <BedDouble className={ICON_CLS} />, badge: "A205" },
  { title: "Đặt giường", to: "/booking", icon: <Sparkles className={ICON_CLS} /> },
  { title: "Điện nước · VietQR", to: "/billing", icon: <Receipt className={ICON_CLS} /> },
  { title: "Báo hỏng", to: "/maintenance", icon: <Wrench className={ICON_CLS} /> },
  { title: "Giới nghiêm 23:00", to: "/curfew", icon: <MoonStar className={ICON_CLS} /> },
  { title: "Khách thăm", to: "/visitor", icon: <Users className={ICON_CLS} /> },
  { title: "Bảng tin", to: "/notices", icon: <Megaphone className={ICON_CLS} /> },
  { title: "Chợ & thất lạc", to: "/marketplace", icon: <Store className={ICON_CLS} /> },
]

const ROLE_HOME: Record<UserRole, { to: string; label: string }> = {
  student: { to: "/overview", label: "Cổng sinh viên" },
  manager: { to: "/manager", label: "Bàn quản lý" },
  technician: { to: "/maintenance", label: "Hàng đợi sửa chữa" },
  admin: { to: "/manager", label: "Quản trị" },
}

function navFor(role: UserRole | undefined, isAuthed: boolean): { group: string; items: NavItem[] }[] {
  if (!isAuthed || !role) {
    return [
      {
        group: "Khám phá",
        items: [
          { title: "Đặt giường", to: "/booking", icon: <Sparkles className={ICON_CLS} /> },
          { title: "Đăng nhập", to: "/login", icon: <LogIn className={ICON_CLS} /> },
        ],
      },
    ]
  }
  if (role === "student") {
    return [
      { group: "Ở nội trú", items: STUDENT_NAV.slice(0, 6) },
      { group: "Cộng đồng", items: STUDENT_NAV.slice(6) },
      { group: "Cá nhân", items: [{ title: "Hồ sơ", to: "/profile", icon: <UserRound className={ICON_CLS} /> }] },
    ]
  }
  if (role === "manager") {
    return [
      {
        group: "Vận hành",
        items: [
          { title: "Tổng quan", to: "/manager", icon: <ClipboardList className={ICON_CLS} /> },
          { title: "Tổng quan SV", to: "/overview", icon: <LayoutDashboard className={ICON_CLS} /> },
          { title: "Điện nước", to: "/billing", icon: <Receipt className={ICON_CLS} /> },
          { title: "Bảo trì", to: "/maintenance", icon: <Wrench className={ICON_CLS} /> },
          { title: "Giới nghiêm", to: "/curfew", icon: <MoonStar className={ICON_CLS} /> },
          { title: "Bảng tin", to: "/notices", icon: <Megaphone className={ICON_CLS} /> },
        ],
      },
      { group: "Cá nhân", items: [{ title: "Hồ sơ", to: "/profile", icon: <UserRound className={ICON_CLS} /> }] },
    ]
  }
  if (role === "admin") {
    return [
      {
        group: "Vận hành",
        items: [
          { title: "Tổng quan", to: "/manager", icon: <ClipboardList className={ICON_CLS} /> },
          { title: "Tổng quan SV", to: "/overview", icon: <LayoutDashboard className={ICON_CLS} /> },
          { title: "Điện nước", to: "/billing", icon: <Receipt className={ICON_CLS} /> },
          { title: "Bảo trì", to: "/maintenance", icon: <Wrench className={ICON_CLS} /> },
          { title: "Giới nghiêm", to: "/curfew", icon: <MoonStar className={ICON_CLS} /> },
          { title: "Bảng tin", to: "/notices", icon: <Megaphone className={ICON_CLS} /> },
          { title: "Khách thăm", to: "/visitor", icon: <Users className={ICON_CLS} /> },
          { title: "Chợ & thất lạc", to: "/marketplace", icon: <Store className={ICON_CLS} /> },
        ],
      },
      {
        group: "Xem dưới vai SV",
        items: [
          { title: "Phòng của tôi", to: "/my-room", icon: <BedDouble className={ICON_CLS} /> },
          { title: "Đặt giường", to: "/booking", icon: <Sparkles className={ICON_CLS} /> },
          { title: "Khách thăm", to: "/visitor", icon: <Users className={ICON_CLS} /> },
          { title: "Chợ & thất lạc", to: "/marketplace", icon: <Store className={ICON_CLS} /> },
        ],
      },
      { group: "Cá nhân", items: [{ title: "Hồ sơ", to: "/profile", icon: <UserRound className={ICON_CLS} /> }] },
    ]
  }
  return [
    {
      group: "Kỹ thuật",
      items: [
        { title: "Hàng đợi sửa chữa", to: "/maintenance", icon: <Wrench className={ICON_CLS} /> },
        { title: "Trực cổng", to: "/curfew", icon: <MoonStar className={ICON_CLS} /> },
        { title: "Bảng tin", to: "/notices", icon: <Megaphone className={ICON_CLS} /> },
      ],
    },
    { group: "Cá nhân", items: [{ title: "Hồ sơ", to: "/profile", icon: <UserRound className={ICON_CLS} /> }] },
  ]
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const groups = navFor(user?.role, isAuthenticated)
  const home = user ? ROLE_HOME[user.role] : null

  return (
    <>
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden" aria-hidden />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[272px] flex-col border-r border-border bg-card transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-border px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary text-xl font-black text-white shadow-md">
            D
          </div>
          <div className="leading-tight">
            <p className="font-display text-[17px] font-extrabold tracking-tight">Domanage</p>
            <p className="text-[11px] font-medium text-muted-foreground">KTX FPT University</p>
          </div>
        </div>

        {home && (
          <div className="shrink-0 px-4 pt-4">
            <div className="rounded-2xl bg-gradient-to-r from-primary to-primary px-4 py-3 text-white shadow-md">
              <p className="text-[11px] font-medium text-white/75">{home.label}</p>
              <p className="truncate text-[13px] font-bold">{user?.fullName}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.group}>
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/"}
                      onClick={onClose}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13.5px] transition-all ${
                        isActive
                          ? "bg-primary-soft font-bold text-primary-soft-foreground dark:bg-primary-soft dark:text-primary-soft-foreground"
                          : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className={isActive ? "" : "opacity-70 group-hover:opacity-100"}>{item.icon}</span>
                        <span className="truncate">{item.title}</span>
                      </span>
                      {item.badge && (
                        <span className="ml-2 shrink-0 rounded-full bg-primary-soft px-2 py-0.5 font-mono text-[10px] font-bold text-primary-soft-foreground">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-muted/70 px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-danger/10 text-[13px] font-black text-danger">
              SOS
            </span>
            <div className="leading-tight">
              <p className="font-mono text-[13px] font-bold">1900 6868</p>
              <p className="text-[10px] text-muted-foreground">Bảo vệ trực 24/7</p>
            </div>
          </div>
          {isAuthenticated ? (
            <button
              onClick={() => logout()}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span>Đăng xuất</span>
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className="flex w-full items-center justify-between rounded-xl bg-foreground px-3 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-black"
            >
              <span>Đăng nhập</span>
              <LogIn className="h-4 w-4" />
            </NavLink>
          )}
        </div>
      </aside>
    </>
  )
}
