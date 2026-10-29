import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import {
  LogOut,
  LogIn,
  LayoutDashboard,
  DoorClosed,
  BedDouble,
  Receipt,
  Wrench,
  User,
  ShieldCheck,
  Zap,
  Smartphone,
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
            { title: "Mobile App", to: "/mobile", icon: Smartphone, badge: "Mới" },
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
            {
              title: "Mobile App (QR Cổng)",
              to: "/mobile",
              icon: Smartphone,
              badge: "Mới",
            },
            { title: "Điện nước & VietQR", to: "/billing", icon: Receipt },
            { title: "Báo hỏng thiết bị", to: "/maintenance", icon: Wrench },
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
          groupTitle: "Bàn Làm Việc Quản Lý ()",
          items: [
            {
              title: "Bàn làm việc Quản lý",
              to: "/manager",
              icon: ShieldCheck,
            },
            {
              title: "Mobile App (Quét Cổng)",
              to: "/mobile",
              icon: Smartphone,
              badge: "Mới",
            },
            { title: "Chốt số & Chia điện nước", to: "/billing", icon: Zap },
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
          groupTitle: "Tác Vụ Kỹ Thuật Tòa A",
          items: [
            {
              title: "Hàng đợi Sửa chữa",
              to: "/maintenance",
              icon: Wrench,
              badge: "2 phiếu",
            },
            {
              title: "Mobile App (Camera Báo Hỏng)",
              to: "/mobile",
              icon: Smartphone,
              badge: "Mới",
            },
            { title: "Nhập số Điện Nước", to: "/billing", icon: Zap },
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
          {
            title: "Mobile App KTX",
            to: "/mobile",
            icon: Smartphone,
            badge: "Mới",
          },
          { title: "Quản lý Điện nước", to: "/billing", icon: Zap },
          { title: "Quản lý Bảo trì", to: "/maintenance", icon: Wrench },
        ],
      },
      {
        groupTitle: "Cá Nhân",
        items: [{ title: "Hồ sơ quản trị", to: "/profile", icon: User }],
      },
    ]
  }

  const navGroups = getNavGroups()

  // Badge status of current role
  const getRoleBadge = () => {
    switch (currentRole) {
      case "student":
        return "Sinh viên KTX"
      case "manager":
        return "Trưởng BQL Tòa A"
      case "technician":
        return "Kỹ thuật viên Tòa A"
      case "admin":
        return "Quản trị viên Hệ thống"
      default:
        return "Khách vãng lai"
    }
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[260px] flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out lg:z-30 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-border px-5">
          <NavLink
            to="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            onClick={onClose}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <span className="font-serif text-lg font-black tracking-wider">
                KTX
              </span>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground">
                DOMANAGE
              </h1>
              <p className="text-[10px] font-medium text-muted-foreground">
                FPT University Dormitory
              </p>
            </div>
          </NavLink>
        </div>

        {/* Scrollable middle nav */}
        <div className="flex-1 overflow-y-auto">
          {/* User profile snippet */}
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={
                    user?.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                  }
                  alt={user?.fullName || "Người dùng"}
                  className="h-10 w-10 rounded-full border border-border object-cover"
                />
                <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500"></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-foreground">
                  {user?.fullName || "Chưa đăng nhập"}
                </p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  {user?.studentId || user?.staffId || "Khách"}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
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
export default Sidebar
