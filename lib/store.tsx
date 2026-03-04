"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type {
  AppState,
  User,
  Role,
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
} from "./types"
import {
  mockUsers,
  mockArtists,
  mockSongs,
  mockShares,
  mockReactions,
  mockComments,
  mockReports,
  mockListeningRooms,
  mockRoomMembers,
  mockPlaybackStates,
  mockRoomActivities,
} from "./mock-data"

interface AppContextType extends AppState {
  // User/Role switching
  setCurrentUser: (userId: string) => void
  setCurrentRole: (role: Role) => void
  getCurrentUser: () => User | undefined

  // Helper lookups
  getArtistById: (id: string) => typeof mockArtists[0] | undefined
  getSongById: (id: string) => Song | undefined
  getUserById: (id: string) => User | undefined
  getShareById: (id: string) => Share | undefined
  getCommentById: (id: string) => Comment | undefined
  getRoomById: (id: string) => ListeningRoom | undefined

  // Reactions
  getReactionsForTarget: (targetType: ReactionTargetType, targetId: string) => Reaction[]
  addReaction: (targetType: ReactionTargetType, targetId: string, type: ReactionType) => boolean
  removeReaction: (reactionId: string) => void
  hasUserReacted: (targetType: ReactionTargetType, targetId: string, type: ReactionType) => boolean

  // Comments
  getCommentsForSong: (songId: string) => Comment[]
  addComment: (songId: string, content: string) => void
  updateCommentStatus: (commentId: string, status: ContentStatus) => void

  // Shares
  getSharesForUser: (userId: string) => Share[]
  getSharesForSong: (songId: string) => Share[]
  addShare: (songId: string, captionText: string, visibility: ShareVisibility) => void
  updateShareStatus: (shareId: string, status: ContentStatus) => void

  // Reports
  addReport: (targetType: "share" | "comment", targetId: string, reason: string) => void
  updateReportStatus: (reportId: string, status: ReportStatus) => void

  // Listening Rooms
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

  // Computed metrics
  getSongReactionCount: (songId: string) => number
  getSongCommentCount: (songId: string) => number
  getSongShareCount: (songId: string) => number

  // Simulation
  simulateLostRecord: () => string | null
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    users: mockUsers,
    artists: mockArtists,
    songs: mockSongs,
    shares: mockShares,
    reactions: mockReactions,
    comments: mockComments,
    reports: mockReports,
    listeningRooms: mockListeningRooms,
    roomMembers: mockRoomMembers,
    playbackStates: mockPlaybackStates,
    roomActivities: mockRoomActivities,
    currentUserId: "user-a",
    currentRole: "user",
  })

  // User/Role switching
  const setCurrentUser = useCallback((userId: string) => {
    const user = mockUsers.find((u) => u.id === userId)
    setState((prev) => ({
      ...prev,
      currentUserId: userId,
      currentRole: user?.role || "user",
    }))
  }, [])

  const setCurrentRole = useCallback((role: Role) => {
    setState((prev) => ({ ...prev, currentRole: role }))
  }, [])

  const getCurrentUser = useCallback(() => {
    return state.users.find((u) => u.id === state.currentUserId)
  }, [state.users, state.currentUserId])

  // Helper lookups
  const getArtistById = useCallback(
    (id: string) => state.artists.find((a) => a.id === id),
    [state.artists]
  )

  const getSongById = useCallback(
    (id: string) => state.songs.find((s) => s.id === id),
    [state.songs]
  )

  const getUserById = useCallback(
    (id: string) => state.users.find((u) => u.id === id),
    [state.users]
  )

  const getShareById = useCallback(
    (id: string) => state.shares.find((s) => s.id === id),
    [state.shares]
  )

  const getCommentById = useCallback(
    (id: string) => state.comments.find((c) => c.id === id),
    [state.comments]
  )

  const getRoomById = useCallback(
    (id: string) => state.listeningRooms.find((r) => r.id === id),
    [state.listeningRooms]
  )

  // Reactions
  const getReactionsForTarget = useCallback(
    (targetType: ReactionTargetType, targetId: string) =>
      state.reactions.filter((r) => r.targetType === targetType && r.targetId === targetId),
    [state.reactions]
  )

  const hasUserReacted = useCallback(
    (targetType: ReactionTargetType, targetId: string, type: ReactionType) =>
      state.reactions.some(
        (r) =>
          r.targetType === targetType &&
          r.targetId === targetId &&
          r.userId === state.currentUserId &&
          r.type === type
      ),
    [state.reactions, state.currentUserId]
  )

  const addReaction = useCallback(
    (targetType: ReactionTargetType, targetId: string, type: ReactionType): boolean => {
      // Check for duplicate
      const exists = state.reactions.some(
        (r) =>
          r.targetType === targetType &&
          r.targetId === targetId &&
          r.userId === state.currentUserId &&
          r.type === type
      )
      if (exists) return false

      const newReaction: Reaction = {
        id: `reaction-${Date.now()}`,
        targetType,
        targetId,
        userId: state.currentUserId,
        type,
        createdAt: new Date().toISOString(),
      }
      setState((prev) => ({ ...prev, reactions: [...prev.reactions, newReaction] }))
      return true
    },
    [state.reactions, state.currentUserId]
  )

  const removeReaction = useCallback((reactionId: string) => {
    setState((prev) => ({
      ...prev,
      reactions: prev.reactions.filter((r) => r.id !== reactionId),
    }))
  }, [])

  // Comments
  const getCommentsForSong = useCallback(
    (songId: string) =>
      state.comments
        .filter((c) => c.songId === songId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.comments]
  )

  const addComment = useCallback(
    (songId: string, content: string) => {
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        songId,
        userId: state.currentUserId,
        content,
        createdAt: new Date().toISOString(),
        status: "active",
      }
      setState((prev) => ({ ...prev, comments: [...prev.comments, newComment] }))
    },
    [state.currentUserId]
  )

  const updateCommentStatus = useCallback((commentId: string, status: ContentStatus) => {
    setState((prev) => ({
      ...prev,
      comments: prev.comments.map((c) => (c.id === commentId ? { ...c, status } : c)),
    }))
  }, [])

  // Shares
  const getSharesForUser = useCallback(
    (userId: string) =>
      state.shares
        .filter((s) => s.userId === userId && s.status === "active")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.shares]
  )

  const getSharesForSong = useCallback(
    (songId: string) => state.shares.filter((s) => s.songId === songId && s.status === "active"),
    [state.shares]
  )

  const addShare = useCallback(
    (songId: string, captionText: string, visibility: ShareVisibility) => {
      const newShare: Share = {
        id: `share-${Date.now()}`,
        userId: state.currentUserId,
        songId,
        captionText,
        visibility,
        createdAt: new Date().toISOString(),
        status: "active",
      }
      setState((prev) => ({ ...prev, shares: [...prev.shares, newShare] }))
    },
    [state.currentUserId]
  )

  const updateShareStatus = useCallback((shareId: string, status: ContentStatus) => {
    setState((prev) => ({
      ...prev,
      shares: prev.shares.map((s) => (s.id === shareId ? { ...s, status } : s)),
    }))
  }, [])

  // Reports
  const addReport = useCallback(
    (targetType: "share" | "comment", targetId: string, reason: string) => {
      const newReport: Report = {
        id: `report-${Date.now()}`,
        targetType,
        targetId,
        userId: state.currentUserId,
        reason,
        createdAt: new Date().toISOString(),
        status: "pending",
      }
      setState((prev) => ({ ...prev, reports: [...prev.reports, newReport] }))
    },
    [state.currentUserId]
  )

  const updateReportStatus = useCallback((reportId: string, status: ReportStatus) => {
    setState((prev) => ({
      ...prev,
      reports: prev.reports.map((r) => (r.id === reportId ? { ...r, status } : r)),
    }))
  }, [])

  // Listening Rooms
  const getActiveRooms = useCallback(
    () => state.listeningRooms.filter((r) => r.status === "active"),
    [state.listeningRooms]
  )

  const getRoomMembers = useCallback(
    (roomId: string) => state.roomMembers.filter((m) => m.roomId === roomId),
    [state.roomMembers]
  )

  const getRoomPlaybackState = useCallback(
    (roomId: string) => state.playbackStates.find((p) => p.roomId === roomId),
    [state.playbackStates]
  )

  const getRoomActivities = useCallback(
    (roomId: string) =>
      state.roomActivities
        .filter((a) => a.roomId === roomId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [state.roomActivities]
  )

  const createRoom = useCallback(
    (name: string, songId: string): string => {
      const roomId = `room-${Date.now()}`
      const newRoom: ListeningRoom = {
        id: roomId,
        name,
        hostUserId: state.currentUserId,
        currentSongId: songId,
        status: "active",
        createdAt: new Date().toISOString(),
      }
      const newMember: RoomMember = {
        roomId,
        userId: state.currentUserId,
        joinedAt: new Date().toISOString(),
        isHost: true,
      }
      const newPlayback: PlaybackState = {
        roomId,
        currentSongId: songId,
        isPlaying: false,
        positionSeconds: 0,
        lastUpdatedAt: new Date().toISOString(),
        lastUpdatedBy: state.currentUserId,
      }
      const newActivity: RoomActivity = {
        id: `activity-${Date.now()}`,
        roomId,
        userId: state.currentUserId,
        action: "joined",
        timestamp: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        listeningRooms: [...prev.listeningRooms, newRoom],
        roomMembers: [...prev.roomMembers, newMember],
        playbackStates: [...prev.playbackStates, newPlayback],
        roomActivities: [...prev.roomActivities, newActivity],
      }))
      return roomId
    },
    [state.currentUserId]
  )

  const joinRoom = useCallback(
    (roomId: string) => {
      const alreadyMember = state.roomMembers.some(
        (m) => m.roomId === roomId && m.userId === state.currentUserId
      )
      if (alreadyMember) return

      const newMember: RoomMember = {
        roomId,
        userId: state.currentUserId,
        joinedAt: new Date().toISOString(),
        isHost: false,
      }
      const newActivity: RoomActivity = {
        id: `activity-${Date.now()}`,
        roomId,
        userId: state.currentUserId,
        action: "joined",
        timestamp: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        roomMembers: [...prev.roomMembers, newMember],
        roomActivities: [...prev.roomActivities, newActivity],
      }))
    },
    [state.roomMembers, state.currentUserId]
  )

  const leaveRoom = useCallback(
    (roomId: string) => {
      const newActivity: RoomActivity = {
        id: `activity-${Date.now()}`,
        roomId,
        userId: state.currentUserId,
        action: "left",
        timestamp: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        roomMembers: prev.roomMembers.filter(
          (m) => !(m.roomId === roomId && m.userId === state.currentUserId)
        ),
        roomActivities: [...prev.roomActivities, newActivity],
      }))
    },
    [state.currentUserId]
  )

  const endRoom = useCallback((roomId: string) => {
    setState((prev) => ({
      ...prev,
      listeningRooms: prev.listeningRooms.map((r) =>
        r.id === roomId ? { ...r, status: "ended" as const } : r
      ),
    }))
  }, [])

  const updatePlaybackState = useCallback(
    (roomId: string, updates: Partial<PlaybackState>) => {
      setState((prev) => ({
        ...prev,
        playbackStates: prev.playbackStates.map((p) =>
          p.roomId === roomId
            ? {
                ...p,
                ...updates,
                lastUpdatedAt: new Date().toISOString(),
                lastUpdatedBy: state.currentUserId,
              }
            : p
        ),
      }))
    },
    [state.currentUserId]
  )

  const addRoomActivity = useCallback(
    (roomId: string, action: RoomActivity["action"], details?: string) => {
      const newActivity: RoomActivity = {
        id: `activity-${Date.now()}-${Math.random()}`,
        roomId,
        userId: state.currentUserId,
        action,
        timestamp: new Date().toISOString(),
        details,
      }
      setState((prev) => ({
        ...prev,
        roomActivities: [...prev.roomActivities, newActivity],
      }))
    },
    [state.currentUserId]
  )

  const getRoomsPlayingSong = useCallback(
    (songId: string) =>
      state.listeningRooms.filter((r) => r.currentSongId === songId && r.status === "active"),
    [state.listeningRooms]
  )

  // Computed metrics
  const getSongReactionCount = useCallback(
    (songId: string) =>
      state.reactions.filter((r) => r.targetType === "song" && r.targetId === songId).length,
    [state.reactions]
  )

  const getSongCommentCount = useCallback(
    (songId: string) =>
      state.comments.filter((c) => c.songId === songId && c.status === "active").length,
    [state.comments]
  )

  const getSongShareCount = useCallback(
    (songId: string) =>
      state.shares.filter((s) => s.songId === songId && s.status === "active").length,
    [state.shares]
  )

  // Simulation
  const simulateLostRecord = useCallback((): string | null => {
    const activeComments = state.comments.filter((c) => c.status === "active")
    if (activeComments.length === 0) return null

    const randomComment = activeComments[Math.floor(Math.random() * activeComments.length)]
    setState((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c.id !== randomComment.id),
    }))
    return randomComment.id
  }, [state.comments])

  const value: AppContextType = {
    ...state,
    setCurrentUser,
    setCurrentRole,
    getCurrentUser,
    getArtistById,
    getSongById,
    getUserById,
    getShareById,
    getCommentById,
    getRoomById,
    getReactionsForTarget,
    addReaction,
    removeReaction,
    hasUserReacted,
    getCommentsForSong,
    addComment,
    updateCommentStatus,
    getSharesForUser,
    getSharesForSong,
    addShare,
    updateShareStatus,
    addReport,
    updateReportStatus,
    getActiveRooms,
    getRoomMembers,
    getRoomPlaybackState,
    getRoomActivities,
    createRoom,
    joinRoom,
    leaveRoom,
    endRoom,
    updatePlaybackState,
    addRoomActivity,
    getRoomsPlayingSong,
    getSongReactionCount,
    getSongCommentCount,
    getSongShareCount,
    simulateLostRecord,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
