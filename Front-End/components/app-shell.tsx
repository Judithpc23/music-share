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
  const isAuthReady = useAuthGuard()

  const handleToggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev)
  }, [])

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  if (!isAuthReady) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <AppHeader onToggleMobileMenu={handleToggleMobileMenu} />
        <AppSidebar />
        <MobileMenu open={mobileMenuOpen} onClose={handleCloseMobileMenu} />
        <main className="pt-14 lg:ml-56">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
        <Toaster />
      </div>
    </AppProvider>
  )
}
