import { useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
import type {
  AppState,
  Comment,
  ContentStatus,
  Reaction,
  ReactionTargetType,
  ReactionType,
  Report,
  ReportStatus,
  Share,
  ShareVisibility,
} from "@/mvc/models/types"
import { supabase } from "@/mvc/models/supabase-client"
import {
  toDbComment,
  toDbReaction,
  toDbReport,
  toDbShare,
} from "@/mvc/models/supabase-mappers"
import { buildId, logSupabaseError } from "@/mvc/controllers/app-controller/shared"

type UseEngagementParams = {
  state: AppState
  setState: Dispatch<SetStateAction<AppState>>
}

export function useEngagement({ state, setState }: UseEngagementParams) {
  const getReactionsForTarget = useCallback(
    (targetType: ReactionTargetType, targetId: string) =>
      state.reactions.filter((item) => item.targetType === targetType && item.targetId === targetId),
    [state.reactions]
  )

  const hasUserReacted = useCallback(
    (targetType: ReactionTargetType, targetId: string, type: ReactionType) =>
      state.reactions.some(
        (item) =>
          item.targetType === targetType &&
          item.targetId === targetId &&
          item.userId === state.currentUserId &&
          item.type === type
      ),
    [state.reactions, state.currentUserId]
  )

  const addReaction = useCallback(
    (targetType: ReactionTargetType, targetId: string, type: ReactionType): boolean => {
      const exists = state.reactions.some(
        (item) =>
          item.targetType === targetType &&
          item.targetId === targetId &&
          item.userId === state.currentUserId &&
          item.type === type
      )
      if (exists) return false

      const newReaction: Reaction = {
        id: buildId("reaction"),
        targetType,
        targetId,
        userId: state.currentUserId,
        type,
        createdAt: new Date().toISOString(),
      }

      setState((previous) => ({ ...previous, reactions: [...previous.reactions, newReaction] }))

      void supabase
        .from("reactions")
        .insert(toDbReaction(newReaction))
        .then(({ error }) => {
          if (error) logSupabaseError("insert reaction failed", error)
        })

      return true
    },
    [state.reactions, state.currentUserId, setState]
  )

  const removeReaction = useCallback((reactionId: string) => {
    setState((previous) => ({
      ...previous,
      reactions: previous.reactions.filter((item) => item.id !== reactionId),
    }))

    void supabase
      .from("reactions")
      .delete()
      .eq("id", reactionId)
      .then(({ error }) => {
        if (error) logSupabaseError("delete reaction failed", error)
      })
  }, [setState])

  const getCommentsForSong = useCallback(
    (songId: string) =>
      state.comments
        .filter((item) => item.songId === songId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.comments]
  )

  const addComment = useCallback(
    (songId: string, content: string) => {
      const newComment: Comment = {
        id: buildId("comment"),
        songId,
        userId: state.currentUserId,
        content,
        createdAt: new Date().toISOString(),
        status: "active",
      }
      setState((previous) => ({ ...previous, comments: [...previous.comments, newComment] }))

      void supabase
        .from("comments")
        .insert(toDbComment(newComment))
        .then(({ error }) => {
          if (error) logSupabaseError("insert comment failed", error)
        })
    },
    [state.currentUserId, setState]
  )

  const updateCommentStatus = useCallback((commentId: string, status: ContentStatus) => {
    setState((previous) => ({
      ...previous,
      comments: previous.comments.map((item) => (item.id === commentId ? { ...item, status } : item)),
    }))

    void supabase
      .from("comments")
      .update({ status })
      .eq("id", commentId)
      .then(({ error }) => {
        if (error) logSupabaseError("update comment status failed", error)
      })
  }, [setState])

  const getSharesForUser = useCallback(
    (userId: string) =>
      state.shares
        .filter((item) => item.userId === userId && item.status === "active")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.shares]
  )

  const getSharesForSong = useCallback(
    (songId: string) => state.shares.filter((item) => item.songId === songId && item.status === "active"),
    [state.shares]
  )

  const addShare = useCallback(
    (songId: string, captionText: string, visibility: ShareVisibility) => {
      const newShare: Share = {
        id: buildId("share"),
        userId: state.currentUserId,
        songId,
        captionText,
        visibility,
        createdAt: new Date().toISOString(),
        status: "active",
      }
      setState((previous) => ({ ...previous, shares: [...previous.shares, newShare] }))

      void supabase
        .from("shares")
        .insert(toDbShare(newShare))
        .then(({ error }) => {
          if (error) logSupabaseError("insert share failed", error)
        })
    },
    [state.currentUserId, setState]
  )

  const updateShareStatus = useCallback((shareId: string, status: ContentStatus) => {
    setState((previous) => ({
      ...previous,
      shares: previous.shares.map((item) => (item.id === shareId ? { ...item, status } : item)),
    }))

    void supabase
      .from("shares")
      .update({ status })
      .eq("id", shareId)
      .then(({ error }) => {
        if (error) logSupabaseError("update share status failed", error)
      })
  }, [setState])

  const addReport = useCallback(
    (targetType: "share" | "comment", targetId: string, reason: string) => {
      const newReport: Report = {
        id: buildId("report"),
        targetType,
        targetId,
        userId: state.currentUserId,
        reason,
        createdAt: new Date().toISOString(),
        status: "pending",
      }
      setState((previous) => ({ ...previous, reports: [...previous.reports, newReport] }))

      void supabase
        .from("reports")
        .insert(toDbReport(newReport))
        .then(({ error }) => {
          if (error) logSupabaseError("insert report failed", error)
        })
    },
    [state.currentUserId, setState]
  )

  const updateReportStatus = useCallback((reportId: string, status: ReportStatus) => {
    setState((previous) => ({
      ...previous,
      reports: previous.reports.map((item) => (item.id === reportId ? { ...item, status } : item)),
    }))

    void supabase
      .from("reports")
      .update({ status })
      .eq("id", reportId)
      .then(({ error }) => {
        if (error) logSupabaseError("update report status failed", error)
      })
  }, [setState])

  return {
    getReactionsForTarget,
    hasUserReacted,
    addReaction,
    removeReaction,
    getCommentsForSong,
    addComment,
    updateCommentStatus,
    getSharesForUser,
    getSharesForSong,
    addShare,
    updateShareStatus,
    addReport,
    updateReportStatus,
  }
}

