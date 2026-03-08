import type { AppState, ContentStatus, PlaybackState, Reaction, RoomActivity, Share, ShareVisibility } from "@/utils/types"
import { apiClient } from "@/controllers/api-client"

export const backendController = {
  loadBootstrapState() {
    return apiClient.get<AppState>("/bootstrap")
  },

  createRoom(input: {
    userId: string
    name: string
    songId: string
    roomId: string
    activityId: string
    now: string
  }) {
    return apiClient.post<{ success: boolean }>("/rooms/create", input)
  },

  joinRoom(roomId: string, input: { userId: string; activityId: string; now: string }) {
    return apiClient.post<{ success: boolean }>(`/rooms/${roomId}/join`, input)
  },

  leaveRoom(roomId: string, input: { userId: string; activityId: string; now: string }) {
    return apiClient.post<{ success: boolean }>(`/rooms/${roomId}/leave`, input)
  },

  endRoom(roomId: string) {
    return apiClient.put<{ success: boolean }>(`/rooms/${roomId}/end`, {})
  },

  updateRoomPlayback(roomId: string, input: { userId: string; updates: Partial<PlaybackState> }) {
    return apiClient.put<{ success: boolean }>(`/rooms/${roomId}/playback`, input)
  },

  addRoomActivity(roomId: string, input: {
    userId: string
    action: RoomActivity["action"]
    details?: string
    activityId: string
    timestamp: string
  }) {
    return apiClient.post<{ success: boolean }>(`/rooms/${roomId}/activities`, input)
  },

  addReaction(input: Reaction) {
    return apiClient.post<{ success: boolean }>("/engagement/reactions", input)
  },

  removeReaction(reactionId: string) {
    return apiClient.delete<{ success: boolean }>(`/engagement/reactions/${reactionId}`)
  },

  addComment(input: {
    id: string
    userId: string
    songId: string
    content: string
    createdAt: string
  }) {
    return apiClient.post<{ success: boolean }>("/engagement/comments", input)
  },

  updateCommentStatus(commentId: string, status: ContentStatus) {
    return apiClient.put<{ success: boolean }>(`/engagement/comments/${commentId}/status`, { status })
  },

  addShare(input: Share) {
    return apiClient.post<{ success: boolean }>("/engagement/shares", input)
  },

  updateShareStatus(shareId: string, status: ContentStatus) {
    return apiClient.put<{ success: boolean }>(`/engagement/shares/${shareId}/status`, { status })
  },

  addReport(input: {
    id: string
    targetType: "share" | "comment"
    targetId: string
    userId: string
    reason: string
    createdAt: string
  }) {
    return apiClient.post<{ success: boolean }>("/engagement/reports", input)
  },

  updateReportStatus(reportId: string, status: "pending" | "resolved") {
    return apiClient.put<{ success: boolean }>(`/engagement/reports/${reportId}/status`, { status })
  },

  simulateLostRecord(commentId: string) {
    return apiClient.post<{ success: boolean; deletedCommentId?: string }>(
      "/engagement/debug/simulate-lost-record",
      { commentId }
    )
  },
}

export type BackendController = typeof backendController
