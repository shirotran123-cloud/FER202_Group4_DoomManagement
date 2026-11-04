import { DemoAccountSwitcher } from "@/components/common/DemoAccountSwitcher"
import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import type { UserRole } from "@/types/auth"
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
  Sparkles,
  ArrowRight,
  LogOut,
  User,
  ChevronDown,
  UserPlus,
  LogIn,
  Menu,
  X,
  BedDouble,
  Layers,
  Receipt,
  ShieldCheck,
  HelpCircle,
} from "lucide-react"

interface LandingLayoutProps {
  children: React.ReactNode
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState<string>(() =>
    typeof window !== "undefined" ? window.location.hash : ""
  )
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Chỉ kích hoạt và mount Bottom Navigation trên màn hình responsive (< 1280px)
  const [isMobileLanding, setIsMobileLanding] = useState(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth < 1280
  })

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const mql = window.matchMedia("(max-width: 1279px)")
    const onChange = () => setIsMobileLanding(mql.matches)
    setIsMobileLanding(mql.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  const navItems = [
    { label: "Đặt phòng", href: "#dat-phong", icon: BedDouble },
    { label: "Tính năng", href: "#tinh-nang", icon: Layers },
    { label: "Biểu phí & Tiện ích", href: "#bieu-phi", icon: Receipt },
    { label: "Nội quy & Giới nghiêm", href: "#noi-quy", icon: ShieldCheck },
    { label: "Hỏi đáp (FAQ)", href: "#faq", icon: HelpCircle },
  ]

  React.useEffect(() => {
    const handleHashChange = () => {
      setActiveNav(window.location.hash)
    }
    window.addEventListener("hashchange", handleHashChange)

    // IntersectionObserver tự động đánh dấu mục đang xem khi cuộn trang
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(`#${entry.target.id}`)
          }
        })
      },
      { rootMargin: "-80px 0px -60% 0px" }
    )

    navItems.forEach((item) => {
      if (item.href.startsWith("#")) {
        const el = document.querySelector(item.href)
        if (el) observer.observe(el)
      }
    })

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
      observer.disconnect()
    }
  }, [])

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      const targetId = href.substring(1)
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
        window.history.pushState(null, "", href)
        setActiveNav(href)
      }
    }
  }

  const getDashboardLink = (role?: UserRole) => {
    if (role === "manager" || role === "admin") return "/manager"
    if (role === "technician") return "/maintenance"
    return "/overview"
  }

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-transparent font-sans text-foreground antialiased">
      <div aria-hidden="true" className="nature-backdrop" />
      {/* Top Full-width Landing Navigation Bar (8pt grid: h-[72px] = 9*8px) */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 shadow-xs backdrop-blur-md dark:bg-[#111827]/95">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 sm:gap-3 transition-opacity duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:opacity-90"
          >
            <img
              src="/images/logo.jpg"
              alt="FPT University"
              className="h-8 w-11 sm:h-10 sm:w-14 rounded-xl object-contain shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-foreground leading-none">
                DOMANAGE
              </span>
              <span className="hidden text-[11px] font-medium text-muted-foreground 2xl:inline truncate max-w-[240px]">
                Hệ thống Quản lý Ký túc xá FPT University
              </span>
              <span className="hidden text-[11px] font-medium text-muted-foreground xl:inline 2xl:hidden">
                KTX FPT University
              </span>
            </div>
          </Link>

          {/* Quick Anchor Links (Pill Nav - only on xl: 1280px+) */}
          <nav className="hidden shrink-0 items-center gap-1 xl:gap-1.5 rounded-2xl border border-border bg-muted/70 p-1.5 text-xs font-semibold xl:flex">
            {navItems.map((item) => {
              const isActive = activeNav === item.href
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isActive
                      ? "bg-secondary font-bold text-secondary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          {/* Actions: Demo Account Switcher, Login or Dashboard, and Mobile Menu */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <DemoAccountSwitcher variant="navbar" />

            {isAuthenticated && user ? (
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                {/* Go to Dashboard CTA button */}
                <Link
                  to={getDashboardLink(user.role)}
                  className="ui-btn-interactive inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold whitespace-nowrap text-primary-foreground shadow-xs hover:bg-[#235330] sm:px-4 sm:py-2"
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">Vào Bảng Điều Khiển</span>
                  <span className="sm:hidden whitespace-nowrap">Điều khiển</span>
                  <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 sm:inline" />
                </Link>

                {/* User avatar & dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserDropdown(!showUserDropdown)
                    }}
                    className="flex items-center gap-1 rounded-xl p-1.5 transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-muted"
                  >
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                    <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl">
                      <div className="border-b border-border px-4 py-2">
                        <p className="text-xs font-bold text-foreground">
                          {user.fullName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-foreground transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-muted"
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Hồ sơ cá nhân</span>
                        </Link>
                      </div>
                      <div className="border-t border-border pt-2">
                        <button
                          onClick={() => {
                            logout()
                            setShowUserDropdown(false)
                            navigate("/login")
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-destructive transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
                <Link
                  to="/login?mode=register"
                  id="landing-header-register-btn"
                  className="ui-btn-interactive hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-secondary/30 bg-card px-3 py-1.5 text-xs font-bold whitespace-nowrap text-secondary shadow-xs hover:border-secondary hover:bg-muted sm:px-3.5 sm:py-2"
                >
                  <UserPlus className="h-3.5 w-3.5 shrink-0 text-secondary" />
                  <span className="whitespace-nowrap">Đăng ký</span>
                </Link>
                <Link
                  to="/login?mode=login"
                  id="landing-header-login-btn"
                  className="ui-btn-interactive inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold whitespace-nowrap text-secondary-foreground shadow-xs hover:bg-[#162c49] sm:px-4 sm:py-2"
                >
                  <LogIn className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Đăng nhập</span>
                </Link>
              </div>
            )}

            {/* Mobile / Tablet Menu Button on < xl */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ui-btn-interactive inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted xl:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Drawer (< xl) */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-card/98 px-4 py-4 shadow-xl backdrop-blur-md sm:px-6 xl:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="mx-auto max-w-7xl space-y-3">
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {navItems.map((item) => {
                  const isActive = activeNav === item.href
                  const Icon = item.icon
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        handleNavClick(e, item.href)
                        setMobileMenuOpen(false)
                      }}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-secondary font-bold text-secondary-foreground shadow-xs"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-primary" />
                      <span>{item.label}</span>
                    </a>
                  )
                })}
              </div>

              {!isAuthenticated && (
                <div className="flex items-center gap-2 border-t border-border pt-3 sm:hidden">
                  <Link
                    to="/login?mode=register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-secondary/30 bg-card py-2 text-xs font-bold text-secondary shadow-xs hover:bg-muted"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-secondary" />
                    <span>Đăng ký tài khoản</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area without Sidebar */}
      <main className="page-content relative z-10 w-full flex-1 flex flex-col">
        {children}
      </main>

      {/* Floating Bottom Navigation Bar với animate-ui primitives trên responsive */}
      {isMobileLanding && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-24 bg-gradient-to-t from-background via-background/80 to-transparent"
          />
          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-3">
            <BottomNavigation
              value={activeNav}
              onValueChange={(val) => {
                if (val) {
                  const el = document.getElementById(val.replace("#", ""))
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" })
                    window.history.pushState(null, "", val)
                    setActiveNav(val)
                  }
                }
              }}
              scrollBehavior="minimize"
              aria-label="Thanh điều hướng landing mobile"
              className="pointer-events-auto flex items-center gap-2 max-w-full"
            >
              {/* Highlight trượt mượt mà theo spring physics */}
              <BottomNavigationHighlight className="absolute inset-x-0 inset-y-1 z-0 rounded-full bg-secondary/15 dark:bg-emerald-500/25">
                <ul className="flex items-center rounded-full border border-border/80 bg-card/90 px-1.5 py-1 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:bg-[#111827]/90 dark:shadow-black/40">
                  {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = activeNav === href

                    return (
                      <li key={href}>
                        <BottomNavigationHighlightItem value={href}>
                          <BottomNavigationItem value={href} asChild>
                            <button
                              type="button"
                              aria-label={label}
                              onClick={() => {
                                const el = document.getElementById(href.replace("#", ""))
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth" })
                                  window.history.pushState(null, "", href)
                                  setActiveNav(href)
                                }
                              }}
                              className="relative z-10 flex h-[3.5rem] items-center justify-center overflow-hidden rounded-full px-3 text-muted-foreground outline-none transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[minimized]:h-11 data-[minimized]:w-11 data-[minimized]:px-0 data-[state=active]:font-bold data-[state=active]:text-secondary dark:data-[state=active]:text-emerald-400"
                            >
                              <Icon
                                className={`h-5 w-5 shrink-0 transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                                  isActive ? "scale-110 text-secondary dark:text-emerald-400" : ""
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

              {/* Accessory Button: Đăng nhập hoặc Vào thẳng Dashboard */}
              <BottomNavigationAccessory className="relative size-[3.5rem] rounded-full border border-border/80 bg-card/90 p-1 shadow-2xl shadow-slate-900/10 backdrop-blur-xl data-[minimized]:size-11 dark:bg-[#111827]/90 dark:shadow-black/40">
                <AnimateButton
                  type="button"
                  aria-label={isAuthenticated ? "Bảng điều khiển" : "Đăng nhập hệ thống"}
                  onClick={() => navigate(isAuthenticated ? getDashboardLink(user?.role) : "/login")}
                  className="flex size-full items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-md transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#162c49] focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {isAuthenticated ? (
                    <Sparkles className="h-5 w-5 shrink-0" />
                  ) : (
                    <LogIn className="h-5 w-5 shrink-0" />
                  )}
                </AnimateButton>
              </BottomNavigationAccessory>
            </BottomNavigation>
          </div>
        </>
      )}
    </div>
  )
}
export default LandingLayout
