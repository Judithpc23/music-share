"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentSession } from "@/controllers/auth-controller"

const isExpectedExpiredTokenError = (error: string | null) => {
  if (!error) return false
  const normalizedError = error.toLowerCase()
  return (
    normalizedError.includes("invalid jwt") ||
    normalizedError.includes("token is expired") ||
    normalizedError.includes("invalid claims")
  )
}

export function useAuthGuard() {
  const [isAuthReady, setIsAuthReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    const verifySession = async () => {
      const { data, error } = await getCurrentSession()
      if (error && !isExpectedExpiredTokenError(error)) {
        console.error("[auth] failed to check session", error)
      }

      if (!data.session) {
        router.replace("/auth")
        return
      }

      if (isMounted) {
        setIsAuthReady(true)
      }
    }

    void verifySession()

    return () => {
      isMounted = false
    }
  }, [router])

  return isAuthReady
}

