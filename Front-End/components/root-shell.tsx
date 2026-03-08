"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { AppShell } from "@/components/app-shell"

export function RootShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith("/auth")

  if (isAuthRoute) {
    return <>{children}</>
  }

  return <AppShell>{children}</AppShell>
}
