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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Fixed Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area Offset for Sidebar */}
      <div className="lg:pl-[260px] min-h-screen flex flex-col">
        {/* Fixed Header */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable Page Body */}
        <main className="w-full pt-[68px] flex-1 bg-slate-50 dark:bg-[#0b0f19]">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
            {showDemoBanner && user && (
              <div className="rounded-xl bg-white dark:bg-[#161e23] border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2 overflow-x-auto text-slate-700 dark:text-slate-200">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>
                    <strong className="text-slate-900 dark:text-white">Demo Switcher:</strong> Đang đóng vai{" "}
                    <span className="font-bold text-blue-700 dark:text-sky-400">
                      {user.fullName} ({user.roleTitle})
                    </span>
                    . Thử nghiệm vai trò:
                  </span>
                  <div className="inline-flex gap-1.5 ml-2">
                    <button
                      onClick={() => switchRole("student")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        user.role === "student"
                          ? "bg-slate-900 dark:bg-sky-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      Sinh viên
                    </button>
                    <button
                      onClick={() => switchRole("manager")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        user.role === "manager"
                          ? "bg-slate-900 dark:bg-sky-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      Quản lý
                    </button>
                    <button
                      onClick={() => switchRole("technician")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        user.role === "technician"
                          ? "bg-slate-900 dark:bg-sky-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      Kỹ thuật
                    </button>
                    <button
                      onClick={() => switchRole("admin")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        user.role === "admin"
                          ? "bg-slate-900 dark:bg-sky-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoBanner(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs ml-4 font-semibold"
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