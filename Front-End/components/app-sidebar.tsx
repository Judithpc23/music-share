"use client"

import { SidebarNav } from "@/components/sidebar-nav"

export function AppSidebar() {
  return (
    <aside className="fixed left-0 top-14 hidden lg:flex h-[calc(100vh-3.5rem)] w-56 flex-col border-r border-border bg-card">
      <SidebarNav />
    </aside>
  )
}
