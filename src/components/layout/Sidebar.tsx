import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import {
  Building2,
  LogOut,
  LogIn,
  LayoutDashboard,
  DoorClosed,
  BedDouble,
  Receipt,
  Wrench,
  Clock,
  User,
  ShieldCheck,
  Zap,
  Shield,
  type LucideIcon,
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  title: string
  to: string
  icon: LucideIcon
  badge?: string
}

interface NavGroup {
  groupTitle: string
  items: NavItem[]
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const currentRole = user?.role

  // Build role-tailored navigation items
  const getNavGroups = (): NavGroup[] => {
    if (!isAuthenticated || !user) {
      return [
        {
          groupTitle: "Cổng Thông Tin KTX",
          items: [
            { title: "Xem phòng", to: "/booking", icon: BedDouble },
            { title: "Đăng nhập", to: "/login", icon: LogIn },
          ],
        },
      ]
    }

    if (currentRole === "student") {
      return [
        {
          groupTitle: "Cổng Sinh Viên (Student)",
          items: [
            {
              title: "Tổng quan (Overview)",
              to: "/overview",
              icon: LayoutDashboard,
            },
            {
              title: "Phòng của tôi",
              to: "/my-room",
              icon: DoorClosed,
              badge: "A205",
            },
            { title: "Điện nước & VietQR", to: "/billing", icon: Receipt },
            { title: "Báo hỏng thiết bị", to: "/maintenance", icon: Wrench },
            {
              title: "Giới nghiêm & Ra vào",
              to: "/curfew",
              icon: Clock,
              badge: "23:00",
            },
          ],
        },
        {
          groupTitle: "Cá Nhân",
          items: [{ title: "Hồ sơ sinh viên", to: "/profile", icon: User }],
        },
      ]
    }

    if (currentRole === "manager") {
      return [
        {
          groupTitle: "Bàn Làm Việc Quản Lý (Ops)",
          items: [
            {
              title: "Bàn làm việc Quản lý",
              to: "/manager",
              icon: ShieldCheck,
              badge: "Desk",
            },
            { title: "Chốt số & Chia điện nước", to: "/billing", icon: Zap },
            {
              title: "Giám sát Cổng & Giới nghiêm",
              to: "/curfew",
              icon: ShieldCheck,
              badge: "23:00",
            },
            { title: "Điều phối Bảo trì", to: "/maintenance", icon: Wrench },
          ],
        },
        {
          groupTitle: "Cá Nhân",
          items: [{ title: "Hồ sơ quản lý", to: "/profile", icon: User }],
        },
      ]
    }

    if (currentRole === "technician") {
      return [
        {
          groupTitle: "Tác Vụ Kỹ Thuật & An Ninh",
          items: [
            {
              title: "Hàng đợi Sửa chữa",
              to: "/maintenance",
              icon: Wrench,
              badge: "2 Phiếu",
            },
            { title: "Nhập số Điện Nước", to: "/billing", icon: Zap },
            {
              title: "Trực Cổng An Ninh",
              to: "/curfew",
              icon: Shield,
              badge: "24/7",
            },
          ],
        },
        {
          groupTitle: "Cá Nhân",
          items: [{ title: "Hồ sơ kỹ thuật viên", to: "/profile", icon: User }],
        },
      ]
    }

    // Admin role: Toàn quyền truy cập
    return [
      {
        groupTitle: "Quản Trị Toàn Quyền (Admin)",
        items: [
          {
            title: "Tổng quan Quản trị",
            to: "/overview",
            icon: LayoutDashboard,
          },
          { title: "Bàn làm việc Quản trị", to: "/manager", icon: ShieldCheck },
          { title: "Quản lý Điện nước", to: "/billing", icon: Zap },
          { title: "Quản lý Bảo trì", to: "/maintenance", icon: Wrench },
          { title: "Kiểm soát An ninh Cổng", to: "/curfew", icon: ShieldCheck },
        ],
      },
      {
        groupTitle: "Cá Nhân",
        items: [{ title: "Hồ sơ quản trị", to: "/profile", icon: User }],
      },
    ]
  }

  const navGroups = getNavGroups()

  // Hall label by role
  const getRoleBadge = () => {
    if (!isAuthenticated || !user) return "Ký túc xá FPT University"
    if (currentRole === "student") return "Phòng A205 · Tòa A (High-Rise)"
    if (currentRole === "manager") return "BQL Ký túc xá · Tòa A"
    if (currentRole === "technician") return "Đội Kỹ thuật & An ninh"
    return "Quản trị viên Hệ thống DMS"
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Stitch Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-[260px] flex-col justify-between border-r border-border bg-card text-card-foreground shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Logo Header */}
          <div className="flex h-[68px] shrink-0 items-center gap-3 border-b border-border bg-card px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base leading-none font-bold tracking-tight text-foreground">
                Domanage
              </span>
              <span className="mt-1 text-[11px] font-medium tracking-wide text-muted-foreground">
                Ký túc xá FPT University
              </span>
            </div>
          </div>

          {/* Hall & Zone Badge */}
          <div className="px-4 pt-3.5 pb-2">
            <div className="flex items-center gap-2 text-foreground">
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary"></span>
              <span className="truncate text-xs font-semibold tracking-wide text-foreground">
                {getRoleBadge()}
              </span>
            </div>
          </div>

          {/* Role-tailored Navigation Links */}
          <nav className="flex-1 space-y-4 px-3 py-2 text-xs">
            {navGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  {group.groupTitle}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    item.to === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.to)
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/"}
                      onClick={onClose}
                      className={`flex min-w-0 items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                        isActive
                          ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`ml-1.5 shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap ${
                            isActive
                              ? "border-white/30 bg-white/20 text-white"
                              : "border-border bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Emergency Guard & Sign Out */}
        <div className="shrink-0 space-y-2 border-t border-border bg-muted p-3">


          {isAuthenticated ? (
            <button
              onClick={() => logout()}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span>Đăng xuất</span>
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className="flex w-full items-center justify-between rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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
