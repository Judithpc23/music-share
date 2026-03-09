"use client"

import { useState, useCallback, type ReactNode } from "react"
import { AppProvider } from "@/controllers/store"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileMenu } from "@/components/mobile-menu"
import { Toaster } from "@/components/ui/toaster"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false)
  const isAuthReady = useAuthGuard()

  const handleToggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev)
  }, [])

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  const handleToggleDesktopSidebar = useCallback(() => {
    setDesktopSidebarCollapsed((prev) => !prev)
  }, [])

  if (!isAuthReady) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <AppHeader
          onToggleMobileMenu={handleToggleMobileMenu}
          onToggleDesktopSidebar={handleToggleDesktopSidebar}
          desktopSidebarCollapsed={desktopSidebarCollapsed}
        />
        <AppSidebar collapsed={desktopSidebarCollapsed} />
        <MobileMenu open={mobileMenuOpen} onClose={handleCloseMobileMenu} />
        <main className={`pt-14 transition-all duration-200 ${desktopSidebarCollapsed ? "lg:ml-16" : "lg:ml-56"}`}>
          <div className="p-4 lg:p-6">
            <div className="mx-auto w-full max-w-7xl [&>*]:mx-auto">{children}</div>
          </div>
        </main>
        <Toaster />
      </div>
    </AppProvider>
  )
}
