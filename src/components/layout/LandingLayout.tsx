import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import type { UserRole } from "@/types/auth"
import {
  Building2,
  Sparkles,
  ArrowRight,
  LogOut,
  User,
  ChevronDown,
  CheckCircle2,
  UserPlus,
  LogIn,
} from "lucide-react"

interface LandingLayoutProps {
  children: React.ReactNode
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout, switchRole } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState<string>(() => (typeof window !== "undefined" ? window.location.hash : ""))
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const navItems = [
    { label: "Mô hình 1:4:6", href: "#mo-hinh" },
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
      const el = document.querySelector(item.href)
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
      observer.disconnect()
    }
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setActiveNav(href)
    const targetElement = document.querySelector(href)
    if (targetElement) {
      e.preventDefault()
      const headerOffset = 80
      const elementPosition = targetElement.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
      window.history.pushState(null, "", href)
    }
  }

  const getDashboardLink = (role?: UserRole) => {
    if (role === "student") return "/overview"
    if (role === "manager") return "/manager"
    if (role === "technician") return "/maintenance"
    return "/overview"
  }

  return (
    <div className="min-h-screen bg-[#faf9f4] text-[#1b1c19] font-sans antialiased flex flex-col">
      {/* Top Full-width Landing Navigation Bar (NO SIDEBAR) */}
      <header className="sticky top-0 z-50 w-full bg-[#faf9f4]/95 backdrop-blur-md border-b border-[#efeee8] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto h-[68px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#233944] to-[#3a505b] flex items-center justify-center text-white shadow-sm border border-white/10">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#1b1c19]">
                  DOMANAGE
                </span>
                <span className="rounded-md bg-[#cee6ef] px-1.5 py-0.5 text-[10px] font-bold text-[#233944] tracking-wider">
                  DMS Campus
                </span>
              </div>
              <span className="text-[11px] text-[#73787b] hidden sm:inline">
                Hệ thống Quản lý Ký túc xá FPT University
              </span>
            </div>
          </Link>

          {/* Quick Anchor Links */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-xs font-semibold shrink-0 bg-[#efeee8]/60 p-1 rounded-2xl border border-[#efeee8]">
            {navItems.map((item) => {
              const isActive = activeNav === item.href
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white font-bold shadow-xs shadow-orange-600/30"
                      : "text-[#42474b] hover:bg-orange-500/15 hover:text-orange-600"
                  }`}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          {/* Actions: Login or Dashboard */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                {/* Role Switcher Pill */}
                <div className="relative hidden sm:block shrink-0">
                  <button
                    onClick={() => {
                      setShowRoleDropdown(!showRoleDropdown)
                      setShowUserDropdown(false)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#efeee8] bg-white text-xs font-semibold text-[#233944] hover:bg-[#f4f4ee] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span className="text-[11px] text-[#73787b] shrink-0">Role:</span>
                    <span className="whitespace-nowrap">{user.roleTitle}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-70 shrink-0" />
                  </button>

                  {showRoleDropdown && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#efeee8] bg-white p-2 shadow-xl z-50">
                      <div className="px-2 py-1 text-[10px] font-bold text-[#73787b] uppercase">
                        Đổi vai trò Demo
                      </div>
                      {(["student", "manager", "technician", "admin"] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            switchRole(r)
                            setShowRoleDropdown(false)
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
                            user.role === r
                              ? "bg-[#233944]/10 font-bold text-[#233944]"
                              : "text-[#1b1c19] hover:bg-[#f4f4ee]"
                          }`}
                        >
                          <span className="whitespace-nowrap">
                            {r === "student"
                              ? "🎓 Sinh viên"
                              : r === "manager"
                              ? "🏢 Quản lý KTX"
                              : r === "technician"
                              ? "🛡️ An ninh / Kỹ thuật"
                              : "⚡ Quản trị viên"}
                          </span>
                          {user.role === r && <CheckCircle2 className="h-4 w-4 text-[#233944] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Go to Dashboard button */}
                <Link
                  to={getDashboardLink(user.role)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#233944] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#3a505b] transition-all whitespace-nowrap shrink-0"
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
                      setShowRoleDropdown(false)
                    }}
                    className="flex items-center gap-2 rounded-lg p-1 hover:bg-[#efeee8] transition-all"
                  >
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="h-8 w-8 rounded-full object-cover shrink-0"
                    />
                    <ChevronDown className="h-3 w-3 text-[#73787b] hidden sm:inline" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#efeee8] bg-white p-2 shadow-xl z-50">
                      <div className="border-b border-[#efeee8] px-3 py-2">
                        <p className="text-xs font-bold text-[#1b1c19]">{user.fullName}</p>
                        <p className="text-[11px] text-[#73787b] truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#1b1c19] hover:bg-[#f4f4ee]"
                        >
                          <User className="h-3.5 w-3.5 text-[#73787b]" />
                          <span>Hồ sơ cá nhân</span>
                        </Link>
                      </div>
                      <div className="border-t border-[#efeee8] pt-1">
                        <button
                          onClick={() => {
                            logout()
                            setShowUserDropdown(false)
                            navigate("/login")
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#ba1a1a] hover:bg-[#ba1a1a]/10"
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
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <Link
                  to="/login?mode=register"
                  id="landing-header-register-btn"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#233944]/30 bg-white px-3.5 sm:px-4 py-2 text-xs font-bold text-[#233944] shadow-xs hover:bg-[#f4f4ee] hover:border-[#233944] transition-all whitespace-nowrap shrink-0"
                >
                  <UserPlus className="h-3.5 w-3.5 text-[#233944] shrink-0" />
                  <span className="whitespace-nowrap">Đăng ký</span>
                </Link>
                <Link
                  to="/login?mode=login"
                  id="landing-header-login-btn"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#233944] px-3.5 sm:px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#3a505b] transition-all whitespace-nowrap shrink-0"
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>
    </div>
  )
}
