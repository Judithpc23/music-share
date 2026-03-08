"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAppController, type AppControllerValue } from "@/controllers/use-app-controller"

const AppContext = createContext<AppControllerValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const value = useAppController()
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
