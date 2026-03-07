import { useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { AppState } from "@/mvc/models/types"
import { supabase } from "@/mvc/models/supabase-client"
import { logSupabaseError } from "@/mvc/controllers/app-controller/shared"

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

    void supabase
      .from("comments")
      .delete()
      .eq("id", randomComment.id)
      .then(({ error }) => {
        if (error) logSupabaseError("simulateLostRecord delete failed", error)
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

