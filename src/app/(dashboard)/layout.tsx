"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ReactNode } from "react"
import { DashboardNavbar } from "@/components/layout/dashboard-navbar"


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F9FAFB] font-sans">
      {/* Main App Area with Sidebar and Content */}
      <SidebarProvider defaultOpen={true} className="flex-1 overflow-hidden">
        <AppSidebar />
        <SidebarInset id="dashboard-scroll-area" className="bg-[#F9FAFB] flex-1 overflow-y-auto relative">
          <DashboardNavbar />
          <main className="p-4 lg:p-8 h-full">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
