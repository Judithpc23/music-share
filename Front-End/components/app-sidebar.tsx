"use client"

import { SidebarNav } from "@/components/sidebar-nav"

export function AppSidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={`fixed left-0 top-14 hidden lg:flex h-[calc(100vh-3.5rem)] flex-col border-r border-border bg-card transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <SidebarNav collapsed={collapsed} />
    </aside>
  )
}
