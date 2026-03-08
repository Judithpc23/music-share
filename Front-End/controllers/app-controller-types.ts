"use client"

import type {
  AppState,
  User,
  Role,
  Genre,
  Song,
  Share,
  Reaction,
  Comment,
  Report,
  ListeningRoom,
  RoomMember,
  PlaybackState,
  RoomActivity,
  ReactionTargetType,
  ReactionType,
  ShareVisibility,
  ContentStatus,
  ReportStatus,
  Artist,
} from "@/utils/types"

export interface AppControllerValue extends AppState {
  setCurrentUser: (userId: string) => void
  setCurrentRole: (role: Role) => void
  getCurrentUser: () => User | undefined

  getGenreById: (id: string) => Genre | undefined
  getArtistById: (id: string) => Artist | undefined
  getSongById: (id: string) => Song | undefined
  getUserById: (id: string) => User | undefined
  getShareById: (id: string) => Share | undefined
  getCommentById: (id: string) => Comment | undefined
  getRoomById: (id: string) => ListeningRoom | undefined

  getReactionsForTarget: (targetType: ReactionTargetType, targetId: string) => Reaction[]
  addReaction: (targetType: ReactionTargetType, targetId: string, type: ReactionType) => boolean
  removeReaction: (reactionId: string) => void
  hasUserReacted: (targetType: ReactionTargetType, targetId: string, type: ReactionType) => boolean

  getCommentsForSong: (songId: string) => Comment[]
  addComment: (songId: string, content: string) => void
  updateCommentStatus: (commentId: string, status: ContentStatus) => void

  getSharesForUser: (userId: string) => Share[]
  getSharesForSong: (songId: string) => Share[]
  addShare: (songId: string, captionText: string, visibility: ShareVisibility) => void
  updateShareStatus: (shareId: string, status: ContentStatus) => void

  addReport: (targetType: "share" | "comment", targetId: string, reason: string) => void
  updateReportStatus: (reportId: string, status: ReportStatus) => void

  getActiveRooms: () => ListeningRoom[]
  getRoomMembers: (roomId: string) => RoomMember[]
  getRoomPlaybackState: (roomId: string) => PlaybackState | undefined
  getRoomActivities: (roomId: string) => RoomActivity[]
  createRoom: (name: string, songId: string) => string
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  endRoom: (roomId: string) => void
  updatePlaybackState: (roomId: string, updates: Partial<PlaybackState>) => void
  addRoomActivity: (roomId: string, action: RoomActivity["action"], details?: string) => void
  getRoomsPlayingSong: (songId: string) => ListeningRoom[]

  getSongReactionCount: (songId: string) => number
  getSongCommentCount: (songId: string) => number
  getSongShareCount: (songId: string) => number

  simulateLostRecord: () => string | null
}

