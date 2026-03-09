import { useCallback, useEffect, useRef } from "react"
import type { Dispatch, SetStateAction } from "react"
import { usePathname } from "next/navigation"
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
} from "@/utils/types"
import { backendController } from "@/controllers/backend-controller"
import { buildId } from "@/controllers/app-controller-shared"

type UseEngagementParams = {
  state: AppState
  setState: Dispatch<SetStateAction<AppState>>
}

export function useEngagement({ state, setState }: UseEngagementParams) {
  const pathname = usePathname()
  const hasLoadedFeedEngagementRef = useRef(false)
  const hasLoadedReportsRef = useRef(false)

  useEffect(() => {
    const requiresFeedEngagement =
      pathname === "/" ||
      pathname.startsWith("/song/") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/moderation")

    if (!requiresFeedEngagement || hasLoadedFeedEngagementRef.current) return
    if (!state.currentUserId) return

    hasLoadedFeedEngagementRef.current = true
    void Promise.all([
      backendController.getAllShares(state.currentUserId),
      backendController.getAllReactions(),
      backendController.getAllComments(),
    ])
      .then(([shares, reactions, comments]) => {
        setState((previous) => ({
          ...previous,
          shares,
          reactions,
          comments,
        }))
      })
      .catch((error) => {
        console.error("[api] failed to load engagement data", error)
      })
  }, [pathname, setState, state.currentUserId])

  useEffect(() => {
    if (!pathname.startsWith("/moderation") || hasLoadedReportsRef.current) return
    hasLoadedReportsRef.current = true

    void backendController
      .getAllReports()
      .then((reports) => {
        setState((previous) => ({ ...previous, reports }))
      })
      .catch((error) => {
        console.error("[api] failed to load reports data", error)
      })
  }, [pathname, setState])

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

      void backendController
        .addReaction(newReaction)
        .then((result) => {
          if (!result.success) {
            console.error("[api] insert reaction failed")
          }
        })
        .catch((error) => {
          console.error("[api] insert reaction failed", error)
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

    void backendController
      .removeReaction(reactionId)
      .then((result) => {
        if (!result.success) {
          console.error("[api] delete reaction failed")
        }
      })
      .catch((error) => {
        console.error("[api] delete reaction failed", error)
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

      void backendController
        .addComment({
          id: newComment.id,
          userId: newComment.userId,
          songId: newComment.songId,
          content: newComment.content,
          createdAt: newComment.createdAt,
        })
        .then((result) => {
          if (!result.success) {
            console.error("[api] insert comment failed")
          }
        })
        .catch((error) => {
          console.error("[api] insert comment failed", error)
        })
    },
    [state.currentUserId, setState]
  )

  const updateCommentStatus = useCallback((commentId: string, status: ContentStatus) => {
    setState((previous) => ({
      ...previous,
      comments: previous.comments.map((item) => (item.id === commentId ? { ...item, status } : item)),
    }))

    void backendController
      .updateCommentStatus(commentId, status)
      .then((result) => {
        if (!result.success) {
          console.error("[api] update comment status failed")
        }
      })
      .catch((error) => {
        console.error("[api] update comment status failed", error)
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

      void backendController
        .addShare(newShare)
        .then((result) => {
          if (!result.success) {
            console.error("[api] insert share failed")
          }
        })
        .catch((error) => {
          console.error("[api] insert share failed", error)
        })
    },
    [state.currentUserId, setState]
  )

  const updateShareStatus = useCallback((shareId: string, status: ContentStatus) => {
    setState((previous) => ({
      ...previous,
      shares: previous.shares.map((item) => (item.id === shareId ? { ...item, status } : item)),
    }))

    void backendController
      .updateShareStatus(shareId, status)
      .then((result) => {
        if (!result.success) {
          console.error("[api] update share status failed")
        }
      })
      .catch((error) => {
        console.error("[api] update share status failed", error)
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

      void backendController
        .addReport({
          id: newReport.id,
          targetType: newReport.targetType,
          targetId: newReport.targetId,
          userId: newReport.userId,
          reason: newReport.reason,
          createdAt: newReport.createdAt,
        })
        .then((result) => {
          if (!result.success) {
            console.error("[api] insert report failed")
          }
        })
        .catch((error) => {
          console.error("[api] insert report failed", error)
        })
    },
    [state.currentUserId, setState]
  )

  const updateReportStatus = useCallback((reportId: string, status: ReportStatus) => {
    setState((previous) => ({
      ...previous,
      reports: previous.reports.map((item) => (item.id === reportId ? { ...item, status } : item)),
    }))

    void backendController
      .updateReportStatus(reportId, status)
      .then((result) => {
        if (!result.success) {
          console.error("[api] update report status failed")
        }
      })
      .catch((error) => {
        console.error("[api] update report status failed", error)
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

