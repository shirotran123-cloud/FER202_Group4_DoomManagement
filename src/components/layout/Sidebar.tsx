 import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import {
  Home,
  BedDouble,
  Receipt,
  Wrench,
  ClockAlert,
  UserCheck,
  LayoutDashboard,
  CheckSquare,
  FileText,
  ShieldCheck,
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const location = useLocation()

  const currentRole = user?.role || "student"

  const navItems = [
    {
      title: "Trang chủ KTX",
      to: "/",
      icon: Home,
      uc: "UC-01",
      roles: ["student", "manager", "technician", "admin"],
    },
    {
      title: "Đặt phòng 1:4:6",
      to: "/booking",
      icon: BedDouble,
      uc: "UC-09,10",
      roles: ["student", "manager", "admin"],
    },
    {
      title: "Điện nước & Hóa đơn",
      to: "/billing",
      icon: Receipt,
      uc: "UC-14-19",
      roles: ["student", "manager", "technician", "admin"],
    },
    {
      title: "Báo hỏng & Sửa chữa",
      to: "/maintenance",
      icon: Wrench,
      uc: "UC-20-23",
      roles: ["student", "manager", "technician", "admin"],
    },
    {
      title: "An ninh & Giới nghiêm",
      to: "/curfew",
      icon: ClockAlert,
      uc: "UC-24-26",
      roles: ["student", "manager", "technician", "admin"],
    },
    {
      title: "Tổng quan quản trị",
      to: "/manager",
      icon: LayoutDashboard,
      uc: "UC-27,28",
      roles: ["manager", "admin"],
    },
    {
      title: "Hồ sơ cá nhân",
      to: "/profile",
      icon: UserCheck,
      uc: "UC-04",
      roles: ["student", "manager", "technician", "admin"],
    },
    {
      title: "QA Test Matrix (Kim)",
      to: "/qa",
      icon: CheckSquare,
      uc: "QA-01",
      roles: ["student", "manager", "technician", "admin"],
    },
  ]

  const filteredNav = navItems.filter((item) => item.roles.includes(currentRole))

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Đặc quyền hiện tại
              </p>
              <p className="text-xs font-bold text-foreground capitalize">
                {user?.roleTitle || "Khách vãng lai"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Phân hệ nghiệp vụ
          </div>

          {filteredNav.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => onClose()}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span>{item.title}</span>
                </div>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
                  {item.uc}
                </span>
              </NavLink>
            )
          })}
        </div>

        <div className="border-t border-border/80 p-3 bg-muted/10">
          <div className="rounded-xl border border-border/70 bg-background/80 p-3 text-[11px] space-y-1">
            <div className="flex items-center justify-between font-semibold text-foreground">
              <span>FER202_Group4</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">v1.0.0</span>
            </div>
            <p className="text-muted-foreground text-[10px] leading-tight">
              Lead: Nguyễn Hoàng Vinh
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
              <FileText className="h-3 w-3 text-primary" />
              <span>IEEE 830-1998 SSOT</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}