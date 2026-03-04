"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Radio, User, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/store"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { href: "/", label: "Home", icon: Home, adminOnly: false },
  { href: "/explore", label: "Explore", icon: Compass, adminOnly: false },
  { href: "/rooms", label: "Listening Rooms", icon: Radio, adminOnly: false },
  { href: "/profile", label: "Profile", icon: User, adminOnly: false },
  { href: "/moderation", label: "Moderation", icon: Shield, adminOnly: true },
]

interface SidebarNavProps {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const { currentRole } = useApp()

  return (
    <>
      <nav className="flex flex-col gap-1 p-4">
        <TooltipProvider>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href))
            const isDisabled = item.adminOnly && currentRole !== "admin"
            const Icon = item.icon

            if (isDisabled) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        "text-muted-foreground/50 cursor-not-allowed"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Insufficient permissions</p>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </TooltipProvider>
      </nav>

      {/* IS Components Helper */}
      <div className="mt-auto p-4">
        <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs">
          <p className="font-semibold text-foreground mb-2">IS Components</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <span className="font-medium">People:</span> Roles, Users
            </li>
            <li>
              <span className="font-medium">Processes:</span> Explore, Share, React
            </li>
            <li>
              <span className="font-medium">Data:</span> Songs, Comments
            </li>
            <li>
              <span className="font-medium">Controls:</span> Moderation
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
