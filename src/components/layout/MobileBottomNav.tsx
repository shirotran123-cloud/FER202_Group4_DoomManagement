import React, { useMemo, useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import {
  BottomNavigation,
  BottomNavigationHighlight,
  BottomNavigationHighlightItem,
  BottomNavigationAccessory,
  BottomNavigationItem,
  BottomNavigationLabel,
} from "@animate-ui/react/primitives/bottom-navigation"
import { Button as AnimateButton } from "@animate-ui/react/primitives/buttons/button"
import {
  LayoutDashboard,
  DoorClosed,
  Receipt,
  Wrench,
  QrCode,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react"

export const MobileBottomNav: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Chỉ kích hoạt và render trên thiết bị di động / màn hình nhỏ (< 1024px)
  // để tránh việc các animation engine (Motion/Web Animations) kích hoạt trên phần tử bị ẩn (display: none)
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth < 1024
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const mql = window.matchMedia("(max-width: 1023px)")
    const onChange = () => setIsMobileScreen(mql.matches)
    setIsMobileScreen(mql.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Không hiển thị nếu chưa đăng nhập, đang ở trang login, hoặc trên màn hình desktop
  if (!isAuthenticated || !user || location.pathname === "/login" || !isMobileScreen) return null

  const isStudent = user.role === "student"

  // Danh sách mục điều hướng phân theo vai trò
  const navItems = useMemo(() => {
    if (isStudent) {
      return [
        {
          value: "/overview",
          label: "Tổng quan",
          icon: LayoutDashboard,
        },
        {
          value: "/my-room",
          label: "Phòng",
          icon: DoorClosed,
        },
        {
          value: "/billing",
          label: "Điện nước",
          icon: Receipt,
        },
        {
          value: "/maintenance",
          label: "Báo hỏng",
          icon: Wrench,
        },
        {
          value: "/profile",
          label: "Hồ sơ",
          icon: User,
        },
      ]
    }

    return [
      {
        value: "/manager",
        label: "Quản lý",
        icon: ShieldCheck,
      },
      {
        value: "/my-room",
        label: "Phòng",
        icon: DoorClosed,
      },
      {
        value: "/billing",
        label: "Điện nước",
        icon: Zap,
      },
      {
        value: "/maintenance",
        label: "Bảo trì",
        icon: Wrench,
      },
      {
        value: "/profile",
        label: "Hồ sơ",
        icon: User,
      },
    ]
  }, [isStudent])

  // Xác định tab đang active dựa theo đường dẫn hiện tại
  const activeValue = useMemo(() => {
    const currentPath = location.pathname
    const matched = navItems.find((item) =>
      currentPath === item.value || (item.value !== "/" && currentPath.startsWith(item.value))
    )
    return matched ? matched.value : ""
  }, [location.pathname, navItems])

  const isQrActive = location.pathname === "/mobile" || location.pathname === "/gate-pass"

  return (
    <>
      {/* Lớp gradient mờ bảo vệ nội dung khi cuộn ở đáy màn hình di động */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-24 bg-gradient-to-t from-background via-background/80 to-transparent lg:hidden"
      />

      {/* Floating Bottom Navigation Bar với animate-ui primitives */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-3 lg:hidden">
        <BottomNavigation
          value={activeValue}
          onValueChange={(val) => {
            if (val && val !== location.pathname) {
              navigate(val)
            }
          }}
          scrollBehavior="minimize"
          aria-label="Thanh điều hướng di động"
          className="pointer-events-auto flex items-center gap-2 max-w-full"
        >
          {/* Highlight trượt mượt mà theo spring physics */}
          <BottomNavigationHighlight className="absolute inset-x-0 inset-y-1 z-0 rounded-full bg-primary/15 dark:bg-emerald-500/25">
            <ul className="flex items-center rounded-full border border-border/80 bg-card/90 px-1.5 py-1 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:bg-[#111827]/90 dark:shadow-black/40">
              {navItems.map(({ value, label, icon: Icon }) => {
                const isActive = activeValue === value

                return (
                  <li key={value}>
                    <BottomNavigationHighlightItem value={value}>
                      <BottomNavigationItem value={value} asChild>
                        <button
                          type="button"
                          aria-label={label}
                          onClick={() => navigate(value)}
                          className="relative z-10 flex h-[3.5rem] items-center justify-center overflow-hidden rounded-full px-3.5 text-muted-foreground outline-none transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[minimized]:h-11 data-[minimized]:w-11 data-[minimized]:px-0 data-[state=active]:font-bold data-[state=active]:text-primary dark:data-[state=active]:text-emerald-400"
                        >
                          <Icon
                            className={`h-5 w-5 shrink-0 transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                              isActive ? "scale-110 text-primary dark:text-emerald-400" : ""
                            }`}
                          />
                          <BottomNavigationLabel
                            show="active"
                            className="pl-2 text-xs font-bold tracking-tight whitespace-nowrap"
                          >
                            {label}
                          </BottomNavigationLabel>
                        </button>
                      </BottomNavigationItem>
                    </BottomNavigationHighlightItem>
                  </li>
                )
              })}
            </ul>
          </BottomNavigationHighlight>

          {/* Accessory Button: Quét mã QR ra vào Cổng An Ninh KTX */}
          <BottomNavigationAccessory className="relative size-[3.5rem] rounded-full border border-border/80 bg-card/90 p-1 shadow-2xl shadow-slate-900/10 backdrop-blur-xl data-[minimized]:size-11 dark:bg-[#111827]/90 dark:shadow-black/40">
            <AnimateButton
              type="button"
              aria-label="Thẻ & Mã QR Cổng"
              onClick={() => navigate("/mobile")}
              className={`flex size-full items-center justify-center rounded-full outline-none transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                isQrActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white"
              }`}
            >
              <QrCode className="h-5 w-5 shrink-0 transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110" />
            </AnimateButton>
            {/* Nhãn chấm thông báo cổng an ninh */}
            {!isQrActive && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
            )}
          </BottomNavigationAccessory>
        </BottomNavigation>
      </div>
    </>
  )
}

export default MobileBottomNav
