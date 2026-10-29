import React, { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { MOCK_USERS } from "@/data/mockUsers"
import type { UserRole } from "@/types/auth"
import {
  GraduationCap,
  Building2,
  Wrench,
  ShieldCheck,
  Check,
  ChevronDown,
  Sparkles,
  Zap,
} from "lucide-react"

interface RoleConfig {
  role: UserRole
  label: string
  shortLabel: string
  name: string
  subText: string
  destination: string
  colorBadge: string
  colorBg: string
  colorBorder: string
  colorText: string
  icon: React.FC<{ className?: string }>
}

const ROLES_CONFIG: RoleConfig[] = [
  {
    role: "student",
    label: "Sinh Viên Lưu Trú",
    shortLabel: "Sinh viên",
    name: MOCK_USERS.student.fullName,
    subText: `${MOCK_USERS.student.studentId || "SE182049"} • Phòng ${MOCK_USERS.student.dormitoryStatus?.room || "A205"}`,
    destination: "/overview",
    colorBadge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    colorBg: "hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30",
    colorBorder: "border-emerald-500",
    colorText: "text-emerald-600 dark:text-emerald-400",
    icon: GraduationCap,
  },
  {
    role: "manager",
    label: "Trưởng Ban Quản Lý",
    shortLabel: "Quản lý BQL",
    name: MOCK_USERS.manager.fullName,
    subText: `${MOCK_USERS.manager.staffId || "MGR-004"} • Tòa A & B (Nam)`,
    destination: "/manager",
    colorBadge: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    colorBg: "hover:bg-sky-50/60 dark:hover:bg-sky-950/30",
    colorBorder: "border-sky-500",
    colorText: "text-sky-600 dark:text-sky-400",
    icon: Building2,
  },
  {
    role: "technician",
    label: "Trưởng Kỹ Thuật Viên",
    shortLabel: "Kỹ thuật viên",
    name: MOCK_USERS.technician.fullName,
    subText: `${MOCK_USERS.technician.staffId || "TECH-012"} • Đội Kỹ thuật & Điện nước`,
    destination: "/maintenance",
    colorBadge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    colorBg: "hover:bg-amber-50/60 dark:hover:bg-amber-950/30",
    colorBorder: "border-amber-500",
    colorText: "text-amber-600 dark:text-amber-400",
    icon: Wrench,
  },
  {
    role: "admin",
    label: "Quản Trị Viên Hệ Thống",
    shortLabel: "Admin Hệ thống",
    name: MOCK_USERS.admin.fullName,
    subText: `${MOCK_USERS.admin.staffId || "ADM-001"} • Quản trị toàn KTX (4 Tòa)`,
    destination: "/manager",
    colorBadge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    colorBg: "hover:bg-purple-50/60 dark:hover:bg-purple-950/30",
    colorBorder: "border-purple-500",
    colorText: "text-purple-600 dark:text-purple-400",
    icon: ShieldCheck,
  },
]

interface DemoAccountSwitcherProps {
  variant?: "navbar" | "floating"
  className?: string
}

export const DemoAccountSwitcher: React.FC<DemoAccountSwitcherProps> = ({
  variant = "navbar",
  className = "",
}) => {
  const { user, loginAsDemoUser } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [switchedRoleNotification, setSwitchedRoleNotification] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentRole = user?.role || "student"
  const currentConfig =
    ROLES_CONFIG.find((c) => c.role === currentRole) || ROLES_CONFIG[0]
  const CurrentIcon = currentConfig.icon

  // Click outside listener to auto-close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelectRole = (config: RoleConfig) => {
    loginAsDemoUser(config.role)
    setIsOpen(false)
    setSwitchedRoleNotification(`Đã chuyển sang: ${config.name}`)
    setTimeout(() => {
      setSwitchedRoleNotification(null)
    }, 2500)
    navigate(config.destination)
  }

  // Floating variant (Compact circle floating right above bottom navbar on mobile)
  if (variant === "floating") {
    return (
      <div
        ref={dropdownRef}
        className={`fixed bottom-[74px] right-3.5 sm:bottom-20 sm:right-5 lg:bottom-6 lg:right-6 z-50 select-none ${className}`}
      >
        {switchedRoleNotification && (
          <div className="absolute bottom-full right-0 mb-2 flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-800 shadow-xl dark:border-sky-800 dark:bg-slate-900 dark:text-sky-200 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
            <Zap className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>{switchedRoleNotification}</span>
          </div>
        )}

        {/* Small Circular Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-500 text-white shadow-[0_6px_20px_rgba(2,132,199,0.4)] ring-2 ring-white/90 dark:ring-slate-800 transition-all duration-200 hover:scale-110 active:scale-95"
          title={`Chuyển vai trò Demo (Hiện tại: ${currentConfig.shortLabel})`}
          aria-label="Demo Account Switcher"
        >
          <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />

          {/* Mini role badge on corner */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs">
            <CurrentIcon className="h-2.5 w-2.5 text-sky-600 dark:text-sky-400" />
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 bottom-full mb-3 w-76 sm:w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-2 flex items-center justify-between border-b border-slate-100 px-1 pb-2 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Chuyển Tài Khoản Demo
                </span>
              </div>
              <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                4 Vai Trò
              </span>
            </div>

            <div className="space-y-1.5">
              {ROLES_CONFIG.map((config) => {
                const Icon = config.icon
                const isSelected = config.role === currentRole

                return (
                  <button
                    key={config.role}
                    onClick={() => handleSelectRole(config)}
                    className={`flex w-full items-center justify-between rounded-xl border p-2 text-left transition-all ${
                      isSelected
                        ? `bg-slate-50 dark:bg-slate-800/80 ${config.colorBorder} shadow-2xs`
                        : `border-transparent hover:border-slate-200 dark:hover:border-slate-700 ${config.colorBg}`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${config.colorBadge}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {config.shortLabel}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            • {config.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                          {config.subText}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white ml-1">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default Navbar variant
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {switchedRoleNotification && (
        <div className="absolute -bottom-10 right-0 z-50 flex items-center gap-1.5 rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-[11px] font-bold whitespace-nowrap text-sky-800 shadow-lg dark:border-sky-700 dark:bg-slate-900 dark:text-sky-200 animate-in fade-in slide-in-from-top-1">
          <Zap className="h-3 w-3 text-amber-500 animate-pulse" />
          <span>{switchedRoleNotification}</span>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-2 py-1.5 sm:px-2.5 text-xs font-semibold text-slate-700 transition-all hover:border-sky-400 hover:bg-sky-50/50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800"
        title="Chuyển đổi tài khoản demo nhanh (1-Click)"
        aria-label="Demo Account Switcher"
      >
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${currentConfig.colorBadge}`}
        >
          <CurrentIcon className="h-3.5 w-3.5" />
        </div>

        <div className="hidden flex-col text-left leading-none sm:flex">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Demo Role
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {currentConfig.shortLabel}
          </span>
        </div>

        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-sky-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-76 sm:w-80 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-[#111827] animate-in fade-in zoom-in-95 duration-150">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 px-2 pb-2 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                Chuyển Nhanh Tài Khoản Demo
              </span>
            </div>
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              1-Click
            </span>
          </div>

          <div className="space-y-1">
            {ROLES_CONFIG.map((config) => {
              const Icon = config.icon
              const isSelected = config.role === currentRole

              return (
                <button
                  key={config.role}
                  onClick={() => handleSelectRole(config)}
                  className={`flex w-full items-center justify-between rounded-xl border p-2 text-left transition-all ${
                    isSelected
                      ? `bg-slate-50 dark:bg-slate-800/80 ${config.colorBorder} shadow-2xs`
                      : `border-transparent hover:border-slate-200 dark:hover:border-slate-700 ${config.colorBg}`
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${config.colorBadge}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="flex items-center gap-1">
                        <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {config.label}
                        </span>
                      </div>
                      <p className="truncate text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {config.name}
                      </p>
                      <p className="truncate text-[9.5px] text-slate-400 dark:text-slate-500">
                        {config.subText}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white ml-2">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default DemoAccountSwitcher
