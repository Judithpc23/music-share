import type {
  AppNotification,
  Post,
  AppState,
  ContentStatus,
  PlaybackState,
  Reaction,
  RoomActivity,
  Share,
  ShareVisibility,
} from "@/utils/types"
import { apiClient } from "@/controllers/api-client"

export type BootstrapPayload = Pick<
  AppState,
  "users" | "genres" | "artists" | "songs" | "currentUserId" | "currentRole"
>

export const backendController = {
  loadBootstrapState() {
    return apiClient.get<BootstrapPayload>("/bootstrap")
  },

  getAllRooms() {
    return apiClient.get<AppState["listeningRooms"]>("/rooms")
  },

  getAllRoomMembers() {
    return apiClient.get<AppState["roomMembers"]>("/rooms/members")
  },

  getAllPlaybackStates() {
    return apiClient.get<AppState["playbackStates"]>("/rooms/playbacks")
  },

  getAllRoomActivities() {
    return apiClient.get<AppState["roomActivities"]>("/rooms/activities")
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

  getAllShares(viewerUserId: string) {
    return apiClient.get<AppState["shares"]>(
      `/engagement/shares?viewerUserId=${encodeURIComponent(viewerUserId)}`
    )
  },

  getSharesForUser(userId: string, viewerUserId: string) {
    return apiClient.get<AppState["shares"]>(
      `/engagement/shares/user/${encodeURIComponent(userId)}?viewerUserId=${encodeURIComponent(
        viewerUserId
      )}`
    )
  },

  getAllReactions() {
    return apiClient.get<AppState["reactions"]>("/engagement/reactions")
  },

  getAllComments() {
    return apiClient.get<AppState["comments"]>("/engagement/comments")
  },

  getAllReports() {
    return apiClient.get<AppState["reports"]>("/engagement/reports")
  },

  getNotifications(userId: string) {
    return apiClient.get<AppNotification[]>(
      `/notifications/user/${encodeURIComponent(userId)}`
    )
  },

  markNotificationRead(userId: string, notificationId: string) {
    return apiClient.put<{ success: boolean }>(
      `/notifications/user/${encodeURIComponent(userId)}/${encodeURIComponent(
        notificationId
      )}/read`,
      {}
    )
  },

  requestFollow(actorUserId: string, targetUserId: string) {
    return apiClient.post<{ success: boolean; status?: "pending" | "accepted" }>(
      `/follows/${encodeURIComponent(targetUserId)}/request`,
      { actorUserId }
    )
  },

  acceptFollowRequest(actorUserId: string, followerUserId: string) {
    return apiClient.post<{ success: boolean }>(
      `/follows/${encodeURIComponent(followerUserId)}/accept`,
      { actorUserId }
    )
  },

  rejectFollowRequest(actorUserId: string, followerUserId: string) {
    return apiClient.post<{ success: boolean }>(
      `/follows/${encodeURIComponent(followerUserId)}/reject`,
      { actorUserId }
    )
  },

  unfollow(actorUserId: string, targetUserId: string) {
    return apiClient.post<{ success: boolean }>(
      `/follows/${encodeURIComponent(targetUserId)}/unfollow`,
      { actorUserId }
    )
  },

  getFollowStatus(viewerUserId: string, targetUserId: string) {
    return apiClient.get<{
      canView: boolean
      isPrivate: boolean
      isFollowing: boolean
      requestPending: boolean
      status: "pending" | "accepted" | "rejected" | null
    }>(
      `/follows/${encodeURIComponent(viewerUserId)}/status/${encodeURIComponent(
        targetUserId
      )}`
    )
  },

  createPost(input: {
    userId: string
    postType?: "template" | "share"
    moodType?: "nostalgia" | "energy" | "chill"
    songId: string
    text: string
  }) {
    return apiClient.post<Post>("/posts", input)
  },

  getDiscoverPosts(viewerUserId: string) {
    return apiClient.get<Post[]>(`/posts/discover/${encodeURIComponent(viewerUserId)}`)
  },

  getFollowingPosts(viewerUserId: string) {
    return apiClient.get<Post[]>(`/posts/following/${encodeURIComponent(viewerUserId)}`)
  },

  getPostsByUser(userId: string, viewerUserId: string) {
    return apiClient.get<Post[]>(
      `/posts/user/${encodeURIComponent(userId)}?viewerUserId=${encodeURIComponent(viewerUserId)}`
    )
  },

  updatePost(postId: string, input: { userId: string; text: string; moodType?: "nostalgia" | "energy" | "chill" }) {
    return apiClient.put<{ success: boolean; post?: Post }>(`/posts/${encodeURIComponent(postId)}`, input)
  },

  undoPost(postId: string, userId: string) {
    return apiClient.post<{ success: boolean; post?: Post }>(`/posts/${encodeURIComponent(postId)}/undo`, { userId })
  },

  deletePost(postId: string, userId: string) {
    return apiClient.post<{ success: boolean }>(`/posts/${encodeURIComponent(postId)}/delete`, { userId })
  },

  simulateLostRecord(commentId: string) {
    return apiClient.post<{ success: boolean; deletedCommentId?: string }>(
      "/engagement/debug/simulate-lost-record",
      { commentId }
    )
  },
}

export type BackendController = typeof backendController
