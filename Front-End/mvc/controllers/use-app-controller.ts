"use client"

import { useState } from "react"
import { useEngagement } from "@/mvc/controllers/app-controller/use-engagement"
import { useLookups } from "@/mvc/controllers/app-controller/use-lookups"
import { useMetricsAndDebug } from "@/mvc/controllers/app-controller/use-metrics-and-debug"
import { useRooms } from "@/mvc/controllers/app-controller/use-rooms"
import { useStateLoader } from "@/mvc/controllers/app-controller/use-state-loader"
import { initialState } from "@/mvc/controllers/app-controller/shared"
import type { AppControllerValue } from "@/mvc/controllers/app-controller/types"

export type { AppControllerValue } from "@/mvc/controllers/app-controller/types"

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

