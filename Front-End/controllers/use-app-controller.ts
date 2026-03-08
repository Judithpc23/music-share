"use client"

import { useState } from "react"
import { useEngagement } from "@/controllers/use-engagement"
import { useLookups } from "@/controllers/use-lookups"
import { useMetricsAndDebug } from "@/controllers/use-metrics-and-debug"
import { useRooms } from "@/controllers/use-rooms"
import { useStateLoader } from "@/controllers/use-state-loader"
import { initialState } from "@/controllers/app-controller-shared"
import type { AppControllerValue } from "@/controllers/app-controller-types"

export type { AppControllerValue } from "@/controllers/app-controller-types"

export function useAppController(): AppControllerValue {
  const [state, setState] = useState(initialState)

  useStateLoader({ setState })

  const lookups = useLookups({ state, setState })
  const engagement = useEngagement({ state, setState })
  const rooms = useRooms({ state, setState })
  const metricsAndDebug = useMetricsAndDebug({ state, setState })

  return {
    ...state,
    ...lookups,
    ...engagement,
    ...rooms,
    ...metricsAndDebug,
  }
}

