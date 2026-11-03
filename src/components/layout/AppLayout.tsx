import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"
import { MobileBottomNav } from "./MobileBottomNav"

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative isolate min-h-screen bg-transparent font-sans text-foreground antialiased">
      <div aria-hidden="true" className="nature-backdrop" />
      {/* Fixed Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area Offset for Sidebar */}
      <div className="flex min-h-screen flex-col lg:pl-[264px]">
        {/* Fixed Header */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable Page Body with 8pt grid spacing and >=40% breathing white space */}
        <main className="relative w-full flex-1 bg-transparent pt-[68px] sm:pt-[72px] pb-24 lg:pb-12">
          <div className="page-content mx-auto max-w-[1440px] space-y-4 sm:space-y-6 lg:space-y-8 p-3.5 sm:p-6 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible on screens < 1024px) */}
      <MobileBottomNav />
    </div>
  )
}
export default AppLayout
