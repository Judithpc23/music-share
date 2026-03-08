"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentSession } from "@/controllers/auth-controller"

export function useAuthGuard() {
  const [isAuthReady, setIsAuthReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    const verifySession = async () => {
      const { data, error } = await getCurrentSession()
      if (error) {
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

