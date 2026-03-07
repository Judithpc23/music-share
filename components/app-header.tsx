"use client"

import { Music, Menu } from "lucide-react"
import { useApp } from "@/lib/store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AppHeaderProps {
  onToggleMobileMenu: () => void
}

export function AppHeader({ onToggleMobileMenu }: AppHeaderProps) {
  const { currentUserId, currentRole, setCurrentUser, setCurrentRole, users } = useApp()

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

        {/* Switchers */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Identity Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground hidden lg:inline">Identity:</span>
            <Select value={currentUserId} onValueChange={setCurrentUser}>
              <SelectTrigger className="w-[100px] lg:w-[120px] h-8 text-xs lg:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground hidden lg:inline">Role:</span>
            <Select value={currentRole} onValueChange={(v) => setCurrentRole(v as "user" | "admin")}>
              <SelectTrigger className="w-[80px] lg:w-[100px] h-8 text-xs lg:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  )
}
