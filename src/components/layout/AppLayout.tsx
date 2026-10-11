 import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"
import { useAuth } from "@/contexts/useAuth"
import { Sparkles } from "lucide-react"

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, switchRole } = useAuth()
  const [showDemoBanner, setShowDemoBanner] = useState(true)

  return (
    <div className="min-h-screen bg-[#faf9f4] text-[#1b1c19] font-sans antialiased">
      {/* Fixed Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area Offset for Sidebar */}
      <div className="lg:pl-[260px] min-h-screen flex flex-col">
        {/* Fixed Header */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable Page Body */}
        <main className="w-full pt-[68px] flex-1 bg-[#faf9f4]">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
            {showDemoBanner && user && (
              <div className="rounded-xl bg-white border border-[#c2c7cb]/40 px-4 py-2 text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <Sparkles className="h-4 w-4 text-[#233944] shrink-0" />
                  <span>
                    <strong>Demo Switcher:</strong> Đang đóng vai{" "}
                    <span className="font-bold text-[#233944]">
                      {user.fullName} ({user.roleTitle})
                    </span>
                    . Thử nghiệm vai trò:
                  </span>
                  <div className="inline-flex gap-1.5 ml-2">
                    <button
                      onClick={() => switchRole("student")}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        user.role === "student"
                          ? "bg-[#233944] text-white shadow-xs"
                          : "bg-[#efeee8] hover:bg-[#e3e3dd] text-[#42474b]"
                      }`}
                    >
                      Sinh viên
                    </button>
                    <button
                      onClick={() => switchRole("manager")}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        user.role === "manager"
                          ? "bg-[#233944] text-white shadow-xs"
                          : "bg-[#efeee8] hover:bg-[#e3e3dd] text-[#42474b]"
                      }`}
                    >
                      Quản lý
                    </button>
                    <button
                      onClick={() => switchRole("technician")}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        user.role === "technician"
                          ? "bg-[#233944] text-white shadow-xs"
                          : "bg-[#efeee8] hover:bg-[#e3e3dd] text-[#42474b]"
                      }`}
                    >
                      Kỹ thuật
                    </button>
                    <button
                      onClick={() => switchRole("admin")}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        user.role === "admin"
                          ? "bg-[#233944] text-white shadow-xs"
                          : "bg-[#efeee8] hover:bg-[#e3e3dd] text-[#42474b]"
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoBanner(false)}
                  className="text-[#73787b] hover:text-[#1b1c19] text-xs ml-4"
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
    </div>
  )
}