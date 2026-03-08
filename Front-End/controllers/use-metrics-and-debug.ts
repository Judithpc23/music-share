import { useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { AppState } from "@/utils/types"
import { backendController } from "@/controllers/backend-controller"

type UseMetricsAndDebugParams = {
  state: AppState
  setState: Dispatch<SetStateAction<AppState>>
}

export function useMetricsAndDebug({ state, setState }: UseMetricsAndDebugParams) {
  const getSongReactionCount = useCallback(
    (songId: string) =>
      state.reactions.filter((item) => item.targetType === "song" && item.targetId === songId).length,
    [state.reactions]
  )

  const getSongCommentCount = useCallback(
    (songId: string) =>
      state.comments.filter((item) => item.songId === songId && item.status === "active").length,
    [state.comments]
  )

  const getSongShareCount = useCallback(
    (songId: string) =>
      state.shares.filter((item) => item.songId === songId && item.status === "active").length,
    [state.shares]
  )

  const simulateLostRecord = useCallback((): string | null => {
    const activeComments = state.comments.filter((item) => item.status === "active")
    if (activeComments.length === 0) return null

    const randomComment = activeComments[Math.floor(Math.random() * activeComments.length)]
    setState((previous) => ({
      ...previous,
      comments: previous.comments.filter((item) => item.id !== randomComment.id),
    }))

    void backendController
      .simulateLostRecord(randomComment.id)
      .then((result) => {
        if (!result.success) {
          console.error("[api] simulateLostRecord failed")
        }
      })
      .catch((error) => {
        console.error("[api] simulateLostRecord failed", error)
      })

    return randomComment.id
  }, [state.comments, setState])

  return {
    getSongReactionCount,
    getSongCommentCount,
    getSongShareCount,
    simulateLostRecord,
  }
}

