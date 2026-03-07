"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Music, Menu, LogOut } from "lucide-react"
import { useApp } from "@/mvc/controllers/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { signOutUser } from "@/mvc/controllers/auth-controller"

interface AppHeaderProps {
  onToggleMobileMenu: () => void
}

export function AppHeader({ onToggleMobileMenu }: AppHeaderProps) {
  const { currentUserId, currentRole, users } = useApp()
  const router = useRouter()
  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId),
    [users, currentUserId]
  )

  const handleSignOut = async () => {
    const { error } = await signOutUser()
    if (error) {
      console.error("[auth] sign out failed", error)
      return
    }
    router.replace("/auth")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-card">
      <div className="flex h-full items-center justify-between px-3 lg:px-4">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={onToggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Music className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold hidden sm:inline">SoundShare</span>
          </div>
        </div>

        {/* User Context */}
        <Badge variant="outline" className="hidden md:flex text-xs">
          {currentUser?.username ?? currentUser?.email ?? "Authenticated"} - {currentRole}
        </Badge>

        {/* Session Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          <Button variant="outline" size="sm" className="h-8" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
