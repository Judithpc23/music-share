import { useEffect } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { AppState } from "@/utils/types"
import { backendController } from "@/controllers/backend-controller"

type UseStateLoaderParams = {
  setState: Dispatch<SetStateAction<AppState>>
}

export function useStateLoader({ setState }: UseStateLoaderParams) {
  useEffect(() => {
    const loadState = async () => {
      try {
        const data = await backendController.loadBootstrapState()
        setState(data)
      } catch (error) {
        console.error("[api] failed to load initial app state", error)
      }
    }

    void loadState()
  }, [setState])
}
