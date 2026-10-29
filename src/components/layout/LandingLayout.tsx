import { DemoAccountSwitcher } from "@/components/common/DemoAccountSwitcher"
import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import type { UserRole } from "@/types/auth"
import {
  Sparkles,
  ArrowRight,
  LogOut,
  User,
  ChevronDown,
  UserPlus,
  LogIn,
  Smartphone,
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

  const navItems = [
    { label: "Đặt phòng", href: "#dat-phong" },
    { label: "Tính năng", href: "#tinh-nang" },
    { label: "Biểu phí & Tiện ích", href: "#bieu-phi" },
    { label: "Nội quy & Giới nghiêm", href: "#noi-quy" },
    { label: "Hỏi đáp (FAQ)", href: "#faq" },
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
    <div className="relative isolate flex min-h-screen flex-col bg-transparent font-sans text-slate-900 antialiased">
      <div aria-hidden="true" className="nature-backdrop" />
      {/* Top Full-width Landing Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
          >
            <img
              src="/images/logo.jpg"
              alt="FPT University"
              className="h-10 w-14 rounded-xl object-contain"
            />
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                DOMANAGE
              </span>
              <span className="hidden text-[11px] text-slate-500 sm:inline">
                Hệ thống Quản lý Ký túc xá FPT University
              </span>
            </div>
          </Link>

          {/* Quick Anchor Links */}
          <nav className="hidden shrink-0 items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-100 p-1 text-xs font-semibold lg:flex xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeNav === item.href
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-sky-600 font-bold text-white shadow-xs shadow-sky-600/30"
                      : "text-[#42474b] hover:bg-sky-500/15 hover:text-sky-600"
                  }`}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          {/* Actions: Mobile App, Demo Account Switcher, Login or Dashboard */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Direct Mobile App Button */}
            <Link
              to="/mobile"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-emerald-700 shadow-2xs transition-all hover:bg-emerald-500/20"
              title="Trải nghiệm ứng dụng di động"
            >
              <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Mobile App</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </Link>

            <DemoAccountSwitcher variant="navbar" />

            {isAuthenticated && user ? (
              <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                {/* Go to Dashboard button */}
                <Link
                  to={getDashboardLink(user.role)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#233944] px-4 py-2 text-xs font-bold whitespace-nowrap text-white shadow-sm transition-all hover:bg-[#3a505b]"
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Vào Bảng Điều Khiển</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </Link>

                {/* User avatar & dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserDropdown(!showUserDropdown)
                    }}
                    className="flex items-center gap-2 rounded-lg p-1 transition-all hover:bg-[#dbeafe]"
                  >
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                    <ChevronDown className="hidden h-3 w-3 text-[#73787b] sm:inline" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-[#dbeafe] bg-white p-2 shadow-xl">
                      <div className="border-b border-[#dbeafe] px-3 py-2">
                        <p className="text-xs font-bold text-[#1b1c19]">
                          {user.fullName}
                        </p>
                        <p className="truncate text-[11px] text-[#73787b]">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#1b1c19] hover:bg-[#eff6ff]"
                        >
                          <User className="h-3.5 w-3.5 text-[#73787b]" />
                          <span>Hồ sơ cá nhân</span>
                        </Link>
                      </div>
                      <div className="border-t border-[#dbeafe] pt-1">
                        <button
                          onClick={() => {
                            logout()
                            setShowUserDropdown(false)
                            navigate("/login")
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#2563eb] hover:bg-[#2563eb]/10"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <Link
                  to="/login?mode=register"
                  id="landing-header-register-btn"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#233944]/30 bg-white px-3.5 py-2 text-xs font-bold whitespace-nowrap text-[#233944] shadow-xs transition-all hover:border-[#233944] hover:bg-[#eff6ff] sm:px-4"
                >
                  <UserPlus className="h-3.5 w-3.5 shrink-0 text-[#233944]" />
                  <span className="whitespace-nowrap">Đăng ký</span>
                </Link>
                <Link
                  to="/login?mode=login"
                  id="landing-header-login-btn"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#233944] px-3.5 py-2 text-xs font-bold whitespace-nowrap text-white shadow-sm transition-all hover:bg-[#3a505b] sm:px-4"
                >
                  <LogIn className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Đăng nhập</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area without Sidebar */}
      <main className="page-content relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {children}
      </main>

      {/* Floating Demo Account Switcher on Landing Page */}
      <DemoAccountSwitcher variant="floating" />
    </div>
  )
}
export default LandingLayout
