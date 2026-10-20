import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"
import { useAuth } from "@/contexts/useAuth"
import { Sparkles } from "lucide-react"
import { DormAIAssistant } from "@/components/ai/DormAIAssistant"

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, switchRole } = useAuth()
  const [showDemoBanner, setShowDemoBanner] = useState(true)

  return (
    <div className="relative isolate min-h-screen bg-transparent font-sans text-slate-900 antialiased dark:text-slate-100">
      {/* Fixed Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area Offset for Sidebar */}
      <div className="flex min-h-screen flex-col lg:pl-[260px]">
        {/* Fixed Header */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable Page Body */}
        <main className="relative z-10 w-full flex-1 bg-transparent pt-[68px]">
          <div className="page-content mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
            {showDemoBanner && user && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs shadow-xs dark:border-slate-800 dark:bg-[#161e23]">
                <div className="flex min-w-0 items-center gap-2 overflow-x-auto text-slate-700 dark:text-slate-200">
                  <Sparkles className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span className="shrink-0 whitespace-nowrap">
                    <strong className="text-slate-900 dark:text-white">
                      Demo Switcher:
                    </strong>{" "}
                    <span className="text-slate-600 dark:text-slate-300">
                      Đang là{" "}
                      <strong className="text-blue-700 dark:text-sky-400">
                        {user.fullName}
                      </strong>{" "}
                      ({user.roleTitle})
                    </span>
                  </span>
                  <div className="ml-1 inline-flex shrink-0 gap-1.5">
                    <button
                      onClick={() => switchRole("student")}
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                        user.role === "student"
                          ? "bg-slate-900 text-white shadow-xs dark:bg-sky-600"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      Sinh viên
                    </button>
                    <button
                      onClick={() => switchRole("manager")}
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                        user.role === "manager"
                          ? "bg-slate-900 text-white shadow-xs dark:bg-sky-600"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      Quản lý
                    </button>
                    <button
                      onClick={() => switchRole("technician")}
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                        user.role === "technician"
                          ? "bg-slate-900 text-white shadow-xs dark:bg-sky-600"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      Kỹ thuật
                    </button>
                    <button
                      onClick={() => switchRole("admin")}
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                        user.role === "admin"
                          ? "bg-slate-900 text-white shadow-xs dark:bg-sky-600"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoBanner(false)}
                  className="shrink-0 p-1 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  title="Đóng thông báo"
                >
                  ✕
                </button>
              </div>
            )}

            <Outlet />
          </div>
        </main>
      </div>

      {/* Interactive AI / LLM Assistant */}
      <DormAIAssistant />
    </div>
  )
}
