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
  PhoneCall,
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
            { title: "Xem phòng 1:4:6", to: "/booking", icon: BedDouble },
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
            { title: "Tổng quan (Overview)", to: "/overview", icon: LayoutDashboard },
            { title: "Phòng của tôi", to: "/my-room", icon: DoorClosed, badge: "A205" },
            { title: "Đặt giường 1:4:6", to: "/booking", icon: BedDouble },
            { title: "Điện nước & VietQR", to: "/billing", icon: Receipt },
            { title: "Báo hỏng thiết bị", to: "/maintenance", icon: Wrench },
            { title: "Giới nghiêm & Ra vào", to: "/curfew", icon: Clock, badge: "23:00" },
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
            { title: "Bàn làm việc Quản lý", to: "/manager", icon: ShieldCheck, badge: "Desk" },
            { title: "Chốt số & Chia điện nước", to: "/billing", icon: Zap },
            { title: "Giám sát Cổng & Giới nghiêm", to: "/curfew", icon: ShieldCheck, badge: "23:00" },
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
            { title: "Hàng đợi Sửa chữa", to: "/maintenance", icon: Wrench, badge: "2 Phiếu" },
            { title: "Nhập số Điện Nước", to: "/billing", icon: Zap },
            { title: "Trực Cổng An Ninh", to: "/curfew", icon: Shield, badge: "24/7" },
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
          { title: "Tổng quan Quản trị", to: "/overview", icon: LayoutDashboard },
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
        className={`fixed left-0 top-0 h-full w-[260px] bg-[#142129] text-slate-100 z-50 flex flex-col justify-between shadow-xl transition-transform duration-300 ease-in-out border-r border-[#233a52] ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Header */}
          <div className="h-[68px] px-4 flex items-center gap-3 bg-[#101b22] border-b border-[#233a52] shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#679436] flex items-center justify-center text-white shadow-xs shrink-0">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-white tracking-tight leading-none">
                Domanage
              </span>
              <span className="text-[11px] text-[#A5BE00] tracking-wide mt-1 font-semibold">
                DMS Campus Living
              </span>
            </div>
          </div>

          {/* Hall & Zone Badge */}
          <div className="px-4 pt-3.5 pb-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#182a3a] text-slate-200 border border-[#2a455f]">
              <span className="w-2 h-2 rounded-full bg-[#A5BE00] shrink-0 animate-pulse"></span>
              <span className="text-[11px] text-[#ebf2fa] font-semibold tracking-wide truncate">
                {getRoleBadge()}
              </span>
            </div>
          </div>

          {/* Role-tailored Navigation Links */}
          <nav className="flex-1 px-3 py-2 space-y-4 text-xs">
            {navGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
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
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all min-w-0 ${
                        isActive
                          ? "bg-[#679436] text-white font-semibold shadow-xs"
                          : "text-slate-300 hover:bg-[#1f3448] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-[#88c0e8]"}`} />
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono border shrink-0 ml-1.5 whitespace-nowrap ${
                          isActive 
                            ? "bg-white/20 text-white border-white/30" 
                            : "bg-[#182a3a] text-[#A5BE00] border-[#2a455f]"
                        }`}>
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
        <div className="p-3 bg-[#0d161c] border-t border-[#233a52] space-y-2 shrink-0">
          <div className="p-2.5 rounded-xl bg-[#142330] border border-[#233a52]">
            <div className="flex items-center gap-1.5 mb-0.5">
              <PhoneCall className="h-3.5 w-3.5 text-[#A5BE00]" />
              <span className="text-[11px] font-bold text-white">Emergency Guard</span>
            </div>
            <div className="text-sm font-bold font-mono tracking-wider text-[#ebf2fa]">
              1900 6868
            </div>
            <div className="text-[10px] text-slate-400">24/7 Gate Patrol Desk</div>
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-[#1f3448] hover:text-white transition-colors text-xs"
            >
              <span>Đăng xuất</span>
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#679436] text-white transition-colors text-xs font-semibold hover:bg-[#58802d]"
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