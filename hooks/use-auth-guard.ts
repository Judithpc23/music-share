"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentSession } from "@/mvc/controllers/auth-controller"
import { supabase } from "@/mvc/models/supabase-client"

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

    const { data: authSubscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/auth")
      }
    })

    return () => {
      isMounted = false
      authSubscription.subscription.unsubscribe()
    }
  }, [router])

  return isAuthReady
}

