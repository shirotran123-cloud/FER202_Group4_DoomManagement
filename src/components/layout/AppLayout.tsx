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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {showDemoBanner && user && (
        <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border-b border-orange-500/20 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Sparkles className="h-4 w-4 text-orange-600 shrink-0" />
            <span>
              <strong>Chế độ Đánh giá Đồ án FER202:</strong> Hiện đang đóng vai{" "}
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {user.fullName} ({user.roleTitle})
              </span>
              . Thử nghiệm đổi vai trò:
            </span>
            <div className="inline-flex gap-1.5 ml-2">
              <button
                onClick={() => switchRole("student")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  user.role === "student"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-background/80 hover:bg-muted text-muted-foreground"
                }`}
              >
                Sinh viên
              </button>
              <button
                onClick={() => switchRole("manager")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  user.role === "manager"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-background/80 hover:bg-muted text-muted-foreground"
                }`}
              >
                Quản lý
              </button>
              <button
                onClick={() => switchRole("technician")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  user.role === "technician"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-background/80 hover:bg-muted text-muted-foreground"
                }`}
              >
                An ninh/KT
              </button>
              <button
                onClick={() => switchRole("admin")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  user.role === "admin"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-background/80 hover:bg-muted text-muted-foreground"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowDemoBanner(false)}
            className="text-muted-foreground hover:text-foreground text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}