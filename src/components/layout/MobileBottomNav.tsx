import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import {
  LayoutDashboard,
  DoorClosed,
  Receipt,
  Wrench,
  Smartphone,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react"

export const MobileBottomNav: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  // If not authenticated or on /login or on /welcome, do not show
  if (!isAuthenticated || !user) return null

  const isStudent = user.role === "student"

  // Base navigation items tailored to role
  const navItems = isStudent
    ? [
        {
          label: "Tổng quan",
          to: "/overview",
          icon: LayoutDashboard,
        },
        {
          label: "Phòng",
          to: "/my-room",
          icon: DoorClosed,
        },
        {
          label: "Mobile App",
          to: "/mobile",
          icon: Smartphone,
          highlight: true,
          badge: "QR",
        },
        {
          label: "Điện nước",
          to: "/billing",
          icon: Receipt,
        },
        {
          label: "Báo hỏng",
          to: "/maintenance",
          icon: Wrench,
        },
      ]
    : [
        {
          label: "Quản lý",
          to: "/manager",
          icon: ShieldCheck,
        },
        {
          label: "Mobile App",
          to: "/mobile",
          icon: Smartphone,
          highlight: true,
          badge: "Scan",
        },
        {
          label: "Điện nước",
          to: "/billing",
          icon: Zap,
        },
        {
          label: "Bảo trì",
          to: "/maintenance",
          icon: Wrench,
        },
        {
          label: "Hồ sơ",
          to: "/profile",
          icon: User,
        },
      ]

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 right-0 left-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-lg lg:hidden dark:border-slate-800/80 dark:bg-[#111827]/95"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-150 ${
                isActive
                  ? "text-primary font-semibold dark:text-emerald-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <div className="relative">
                {item.highlight ? (
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-xs transition-transform ${
                      isActive
                        ? "bg-primary text-white scale-110 shadow-primary/30 shadow-md dark:bg-emerald-500"
                        : "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                ) : (
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform ${
                      isActive ? "scale-110" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                )}

                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`mt-1 text-[11px] tracking-tight leading-none ${
                  isActive ? "font-bold" : "font-medium"
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-primary dark:bg-emerald-400" />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
export default MobileBottomNav
