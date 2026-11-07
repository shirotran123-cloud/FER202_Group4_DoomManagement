import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { motion } from "motion/react"
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
  QrCode,
  Database,
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
          groupTitle: "Cổng Sinh Viên",
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
              title: "Thẻ QR Ra Vào Cổng",
              to: "/mobile",
              icon: QrCode,
              badge: "HMAC",
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
          groupTitle: "Bàn Làm Việc Quản Lý",
          items: [
            {
              title: "Bàn làm việc Quản lý",
              to: "/manager",
              icon: ShieldCheck,
            },
            {
              title: "Quét Mã QR Cổng",
              to: "/mobile",
              icon: QrCode,
              badge: "Bảo vệ",
            },
            { title: "Chốt số & Chia điện nước", to: "/billing", icon: Zap },
            { title: "Điều phối Bảo trì", to: "/maintenance", icon: Wrench },
            {
              title: "CSDL Supabase",
              to: "/supabase",
              icon: Database,
              badge: "Cloud",
            },
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
        groupTitle: "Quản Trị Toàn Quyền",
        items: [
          {
            title: "Tổng quan Quản trị",
            to: "/overview",
            icon: LayoutDashboard,
          },
          { title: "Bàn làm việc Quản trị", to: "/manager", icon: ShieldCheck },
          {
            title: "Thẻ QR Ra Vào Cổng",
            to: "/mobile",
            icon: QrCode,
            badge: "24/7",
          },
          { title: "Quản lý Điện nước", to: "/billing", icon: Zap },
          { title: "Quản lý Bảo trì", to: "/maintenance", icon: Wrench },
          {
            title: "CSDL Supabase",
            to: "/supabase",
            icon: Database,
            badge: "Cloud",
          },
        ],
      },
      {
        groupTitle: "Cá Nhân",
        items: [{ title: "Hồ sơ quản trị", to: "/profile", icon: User }],
      },
    ]
  }

  const navGroups = getNavGroups()

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

      {/* Sidebar container with green gradient background matching reference design */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[260px] flex-col bg-gradient-to-b from-[#1b5e34] via-[#247543] to-[#2e8e53] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:z-30 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo Header with circular white badge (matching reference image) */}
        <div className="pt-7 pb-5 px-4 text-center shrink-0 relative z-10 border-b border-white/10">
          <NavLink
            to="/"
            onClick={onClose}
            className="group flex flex-col items-center gap-2.5 transition-transform hover:scale-[1.02]"
          >
            {/* White Circular Badge */}
            <div className="w-14 h-14 rounded-full bg-white shadow-xl p-2 flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/images/logo.jpg"
                alt="FPT University"
                className="h-9 w-9 object-contain rounded-md"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base font-black tracking-wider text-white">
                DOMANAGE
              </span>
              <span className="text-[11px] font-medium tracking-wide text-white/80 mt-0.5">
                Ký túc xá FPT University
              </span>
            </div>
          </NavLink>
        </div>

        {/* Scrollable middle nav with curved active tab animation */}
        <div className="flex-1 overflow-y-auto pt-3 relative z-10 scrollbar-none">
          <nav className="space-y-4 pl-3.5 pr-0 text-xs">
            {navGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                <div className="px-4 py-1 text-[10px] font-extrabold tracking-wider text-white/60 uppercase select-none">
                  {group.groupTitle}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    item.to === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.to) ||
                        (item.to === "/mobile" && location.pathname === "/gate-pass")

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/"}
                      onClick={onClose}
                      className={`group relative flex min-w-0 items-center justify-between py-3 pl-4 pr-3 text-xs transition-colors cursor-pointer select-none ${
                        isActive
                          ? "text-[#1b5e34] font-bold"
                          : "text-white/85 hover:text-white"
                      }`}
                    >
                      {/* Active Tab Background Pill with Inverted Curved Corners (Framer Motion Animated) */}
                      {isActive && (
                        <motion.div
                          layoutId="curvedSidebarActiveTab"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          className="absolute inset-0 bg-white rounded-l-full shadow-md z-0"
                        >
                          {/* Top concave fillet (curves green down to white tab) */}
                          <div
                            className="absolute -top-[20px] right-0 w-[20px] h-[20px] pointer-events-none"
                            style={{
                              background:
                                "radial-gradient(circle at 0 0, transparent 20px, #ffffff 20.5px)",
                            }}
                          />
                          {/* Bottom concave fillet (curves green up to white tab) */}
                          <div
                            className="absolute -bottom-[20px] right-0 w-[20px] h-[20px] pointer-events-none"
                            style={{
                              background:
                                "radial-gradient(circle at 0 100%, transparent 20px, #ffffff 20.5px)",
                            }}
                          />
                        </motion.div>
                      )}

                      {/* Content (Icon + Title) */}
                      <div className="relative z-10 flex min-w-0 items-center gap-3">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-[#1b5e34]"
                              : "text-white/80 group-hover:text-white"
                          }`}
                        />
                        <span
                          className={`truncate transition-colors ${
                            isActive
                              ? "font-extrabold text-[#1b5e34]"
                              : "font-medium text-white/90 group-hover:text-white"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>

                      {/* Badge if present */}
                      {item.badge && (
                        <span
                          className={`relative z-10 ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap transition-colors ${
                            isActive
                              ? "bg-emerald-100 text-[#1b5e34]"
                              : "border border-white/20 bg-white/10 text-white font-mono"
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

        {/* Decorative Botanical Watermark (matching reference design bottom) */}
        <div className="absolute bottom-16 -left-4 pointer-events-none opacity-15 select-none z-0">
          <svg
            width="230"
            height="250"
            viewBox="0 0 200 220"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path
              d="M20 220 C 30 160, 60 120, 100 80 C 120 60, 150 40, 170 20"
              strokeWidth="3"
            />
            <path
              d="M70 140 C 50 120, 30 110, 20 90 C 25 80, 45 80, 60 100 Z"
              fill="white"
              fillOpacity="0.4"
            />
            <path
              d="M110 90 C 130 80, 150 90, 160 110 C 150 120, 130 120, 115 105 Z"
              fill="white"
              fillOpacity="0.4"
            />
            <path
              d="M85 110 C 100 130, 110 150, 95 170 C 85 160, 80 140, 85 110 Z"
              fill="white"
              fillOpacity="0.4"
            />
            <circle cx="50" cy="160" r="5" fill="white" fillOpacity="0.5" />
            <circle cx="42" cy="168" r="4" fill="white" fillOpacity="0.5" />
            <circle cx="58" cy="168" r="4" fill="white" fillOpacity="0.5" />
            <circle cx="50" cy="176" r="4" fill="white" fillOpacity="0.5" />
          </svg>
        </div>

        {/* Bottom Sign Out / Sign In Action */}
        <div className="shrink-0 p-3.5 relative z-10 border-t border-white/15 bg-black/10">
          {isAuthenticated ? (
            <button
              onClick={() => logout()}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 transition-all border border-white/15 cursor-pointer"
            >
              <span>Đăng xuất</span>
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className="flex w-full items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-[#1b5e34] transition-all hover:bg-white/90 shadow-sm"
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
