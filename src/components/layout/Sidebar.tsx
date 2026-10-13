import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { Building2, LogOut, LogIn } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  title: string
  to: string
  icon: string
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
            { title: "Xem phòng 1:4:6", to: "/booking", icon: "bed" },
            { title: "Đăng nhập", to: "/login", icon: "login" },
          ],
        },
      ]
    }

    if (currentRole === "student") {
      return [
        {
          groupTitle: "Cổng Sinh Viên (Student)",
          items: [
            { title: "Tổng quan (Overview)", to: "/overview", icon: "dashboard" },
            { title: "Phòng của tôi", to: "/my-room", icon: "meeting_room", badge: "A205" },
            { title: "Đặt giường 1:4:6", to: "/booking", icon: "bed" },
            { title: "Điện nước & VietQR", to: "/billing", icon: "receipt_long" },
            { title: "Báo hỏng thiết bị", to: "/maintenance", icon: "build" },
            { title: "Giới nghiêm & Ra vào", to: "/curfew", icon: "schedule", badge: "23:00" },
          ],
        },
        {
          groupTitle: "Cá Nhân",
          items: [{ title: "Hồ sơ sinh viên", to: "/profile", icon: "person" }],
        },
      ]
    }

    if (currentRole === "manager") {
      return [
        {
          groupTitle: "Bàn Làm Việc Quản Lý (Ops)",
          items: [
            { title: "Bàn làm việc Quản lý", to: "/manager", icon: "admin_panel_settings", badge: "Desk" },
            { title: "Chốt số & Chia điện nước", to: "/billing", icon: "electric_meter" },
            { title: "Giám sát Cổng & Giới nghiêm", to: "/curfew", icon: "verified_user", badge: "23:00" },
            { title: "Điều phối Bảo trì", to: "/maintenance", icon: "engineering" },
          ],
        },
        {
          groupTitle: "Cá Nhân",
          items: [{ title: "Hồ sơ quản lý", to: "/profile", icon: "person" }],
        },
      ]
    }

    if (currentRole === "technician") {
      return [
        {
          groupTitle: "Tác Vụ Kỹ Thuật & An Ninh",
          items: [
            { title: "Hàng đợi Sửa chữa", to: "/maintenance", icon: "build", badge: "2 Phiếu" },
            { title: "Nhập số Điện Nước", to: "/billing", icon: "electric_meter" },
            { title: "Trực Cổng An Ninh", to: "/curfew", icon: "shield", badge: "24/7" },
          ],
        },
        {
          groupTitle: "Cá Nhân",
          items: [{ title: "Hồ sơ kỹ thuật viên", to: "/profile", icon: "person" }],
        },
      ]
    }

    // Admin role: Toàn quyền truy cập
    return [
      {
        groupTitle: "Quản Trị Toàn Quyền (Admin)",
        items: [
          { title: "Tổng quan Quản trị", to: "/overview", icon: "dashboard" },
          { title: "Bàn làm việc Quản trị", to: "/manager", icon: "admin_panel_settings" },
          { title: "Quản lý Điện nước", to: "/billing", icon: "electric_meter" },
          { title: "Quản lý Bảo trì", to: "/maintenance", icon: "build" },
          { title: "Kiểm soát An ninh Cổng", to: "/curfew", icon: "verified_user" },
        ],
      },
      {
        groupTitle: "Cá Nhân",
        items: [{ title: "Hồ sơ quản trị", to: "/profile", icon: "person" }],
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
        className={`fixed left-0 top-0 h-full w-[260px] bg-[#233944] text-[#cee6ef] z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Header */}
          <div className="h-[68px] px-4 flex items-center gap-3 bg-[#233944]/95 border-b border-white/10 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3a505b] to-[#4c6269] flex items-center justify-center text-white shadow-sm shrink-0 border border-white/10">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-white tracking-tight leading-none">
                Domanage
              </span>
              <span className="text-[11px] text-[#bac9cd] tracking-wide mt-1">
                DMS Campus Portal
              </span>
            </div>
          </div>

          {/* Hall & Zone Badge */}
          <div className="px-4 pt-3.5 pb-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#3a505b] text-[#cee6ef] border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="text-[11px] text-white font-medium tracking-wide truncate">
                {getRoleBadge()}
              </span>
            </div>
          </div>

          {/* Role-tailored Navigation Links */}
          <nav className="flex-1 px-3 py-2 space-y-4 text-xs">
            {navGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#bac9cd]/70 font-bold">
                  {group.groupTitle}
                </div>
                {group.items.map((item) => {
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
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-[#3a505b] text-white font-semibold shadow-xs"
                          : "text-[#bac9cd] hover:bg-[#3a505b]/60 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#cee6ef] font-mono">
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
        <div className="p-3 bg-[#1d2f38] border-t border-white/5 space-y-2 shrink-0">
          <div className="p-2.5 rounded-lg bg-[#3a505b]/80 border border-white/5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="material-symbols-outlined text-sm text-[#cee6ef]">emergency</span>
              <span className="text-[11px] font-bold text-white">Emergency Guard</span>
            </div>
            <div className="text-sm font-bold font-mono tracking-wider text-[#cee6ef]">
              1900 6868
            </div>
            <div className="text-[10px] text-[#bac9cd]">24/7 Gate Patrol Desk</div>
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#bac9cd] hover:bg-[#3a505b] hover:text-white transition-colors text-xs"
            >
              <span>Đăng xuất (Sign Out)</span>
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#3a505b] text-white transition-colors text-xs font-semibold"
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