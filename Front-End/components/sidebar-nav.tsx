"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Radio, User, Shield, Inbox, FileText } from "lucide-react"
import { cn } from "@/utils/cn"
import { useApp } from "@/controllers/store"
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
  { href: "/posts", label: "Post", icon: FileText, adminOnly: false },
  { href: "/inbox", label: "Inbox", icon: Inbox, adminOnly: false },
  { href: "/profile", label: "Profile", icon: User, adminOnly: false },
  { href: "/moderation", label: "Moderation", icon: Shield, adminOnly: true },
]

interface SidebarNavProps {
  onNavigate?: () => void
  collapsed?: boolean
}

export function SidebarNav({ onNavigate, collapsed = false }: SidebarNavProps) {
  const pathname = usePathname()
  const { currentRole } = useApp()

  return (
    <nav className={`flex flex-col gap-1 ${collapsed ? "p-2" : "p-4"}`}>
      <TooltipProvider>
        {navItems
          .filter(item => !item.adminOnly || currentRole === "admin")
          .map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          const Icon = item.icon

          const link = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed ? item.label : null}
            </Link>
          )

          if (!collapsed) return link

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </TooltipProvider>
    </nav>
  )
}
