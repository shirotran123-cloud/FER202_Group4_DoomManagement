import { DemoAccountSwitcher } from "@/components/common/DemoAccountSwitcher"
import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"
import { MobileBottomNav } from "./MobileBottomNav"

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative isolate min-h-screen bg-transparent font-sans text-slate-900 antialiased dark:text-slate-100">
      <div aria-hidden="true" className="nature-backdrop" />
      {/* Fixed Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area Offset for Sidebar */}
      <div className="flex min-h-screen flex-col lg:pl-[260px]">
        {/* Fixed Header */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable Page Body with padding-bottom for mobile bottom navigation */}
        <main className="relative z-10 w-full flex-1 bg-transparent pt-[68px] pb-20 lg:pb-0">
          <div className="page-content mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible on screens < 1024px) */}
      <MobileBottomNav />

      {/* Floating Demo Account Switcher */}
      <DemoAccountSwitcher variant="floating" />
    </div>
  )
}
