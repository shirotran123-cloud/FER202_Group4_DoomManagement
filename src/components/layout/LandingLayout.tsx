import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import type { UserRole } from "@/types/auth"
import { ArrowRight, ChevronDown, LogIn, LogOut, User } from "lucide-react"
import { DormAIAssistant } from "@/components/ai/DormAIAssistant"
import { Avatar } from "@/components/ui/avatar"

interface LandingLayoutProps {
  children: React.ReactNode
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState<string>(() => (typeof window !== "undefined" ? window.location.hash : ""))
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const navItems = React.useMemo(
    () => [
      { label: "Mô hình 1:4:6", href: "#mo-hinh" },
      { label: "Biểu phí & Tiện ích", href: "#bieu-phi" },
      { label: "Nội quy & Giới nghiêm", href: "#noi-quy" },
      { label: "Hỏi đáp", href: "#faq" },
    ],
    []
  )

  React.useEffect(() => {
    const handleHashChange = () => setActiveNav(window.location.hash)
    window.addEventListener("hashchange", handleHashChange)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveNav(`#${entry.target.id}`)
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
  }, [navItems])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setActiveNav(href)
    const targetElement = document.querySelector(href)
    if (targetElement) {
      e.preventDefault()
      const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 88
      window.scrollTo({ top: offsetPosition, behavior: "smooth" })
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
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background font-sans text-foreground antialiased">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary text-xl font-black text-white shadow-md">
              D
            </div>
            <div className="leading-tight">
              <p className="font-display text-[17px] font-extrabold tracking-tight">Domanage</p>
              <p className="hidden text-[11px] text-muted-foreground sm:block">KTX FPT University</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-2xl bg-muted p-1 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-[13px] transition-all ${
                  activeNav === item.href
                    ? "bg-card font-bold text-foreground shadow-sm"
                    : "font-medium text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  to={getDashboardLink(user.role)}
                  className="hidden items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-white transition-transform hover:scale-[1.02] sm:inline-flex"
                >
                  Vào bảng điều khiển
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 rounded-xl border border-border p-1.5 transition-colors hover:bg-muted"
                  >
                    <Avatar name={user.fullName} className="h-8 w-8 text-xs" />
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {showUserDropdown && (
                    <div className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-border bg-card p-2 shadow-xl">
                      <div className="border-b border-border px-3 py-2.5">
                        <p className="truncate text-[13px] font-bold">{user.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium hover:bg-muted"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        Hồ sơ cá nhân
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setShowUserDropdown(false)
                          navigate("/login")
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-danger hover:bg-danger-soft dark:hover:bg-danger-soft"
                      >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login?mode=login"
                id="landing-header-login-btn"
                className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-5 py-2.5 text-[13px] font-bold text-white transition-transform hover:scale-[1.02]"
              >
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">{children}</main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Domanage · KTX FPT University · Hotline bảo vệ 1900 6868
      </footer>
      <DormAIAssistant />
    </div>
  )
}
