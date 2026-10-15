import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"
import { useAuth } from "@/contexts/useAuth"
import { DormAIAssistant } from "@/components/ai/DormAIAssistant"

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-[272px]">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="w-full flex-1 pt-[72px]">
          <div className="mx-auto w-full max-w-[1200px] space-y-5 p-4 sm:p-6 lg:p-8">
            {user && (
              <p className="text-xs text-muted-foreground">
                Xin chào, <span className="font-bold text-foreground">{user.fullName}</span>
                <span className="mx-1.5">·</span>
                {user.roleTitle}
              </p>
            )}
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-border px-6 py-4 text-center text-[11px] text-muted-foreground">
          Domanage · KTX FPT University · Hotline bảo vệ 1900 6868
        </footer>
      </div>
      <DormAIAssistant />
    </div>
  )
}
