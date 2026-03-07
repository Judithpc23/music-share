"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import useSWR, { mutate } from "swr"
import { createClient } from "@/lib/supabase/client"
import type {
  AppState,
  User,
  Role,
  Song,
  Artist,
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

const supabase = createClient()

// Fetchers for SWR
const fetchUsers = async () => {
  const { data, error } = await supabase.from("users").select("*")
  if (error) throw error
  return data as User[]
}

const fetchArtists = async () => {
  const { data, error } = await supabase.from("artists").select("*")
  if (error) throw error
  return data as Artist[]
}

const fetchSongs = async () => {
  const { data, error } = await supabase.from("songs").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return data.map((s: Record<string, unknown>) => ({
    id: s.id,
    title: s.title,
    artistId: s.artist_id,
    genre: s.genre,
    provider: s.provider,
    coverImageUrl: s.cover_image_url,
    createdAt: s.created_at,
    duration: s.duration,
  })) as Song[]
}

const fetchShares = async () => {
  const { data, error } = await supabase.from("shares").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return data.map((s: Record<string, unknown>) => ({
    id: s.id,
    userId: s.user_id,
    songId: s.song_id,
    captionText: s.caption_text,
    visibility: s.visibility,
    createdAt: s.created_at,
    status: s.status,
  })) as Share[]
}

const fetchReactions = async () => {
  const { data, error } = await supabase.from("reactions").select("*")
  if (error) throw error
  return data.map((r: Record<string, unknown>) => ({
    id: r.id,
    targetType: r.target_type,
    targetId: r.target_id,
    userId: r.user_id,
    type: r.type,
    createdAt: r.created_at,
  })) as Reaction[]
}

const fetchComments = async () => {
  const { data, error } = await supabase.from("comments").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return data.map((c: Record<string, unknown>) => ({
    id: c.id,
    songId: c.song_id,
    userId: c.user_id,
    content: c.content,
    createdAt: c.created_at,
    status: c.status,
  })) as Comment[]
}

const fetchReports = async () => {
  const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return data.map((r: Record<string, unknown>) => ({
    id: r.id,
    targetType: r.target_type,
    targetId: r.target_id,
    userId: r.user_id,
    reason: r.reason,
    createdAt: r.created_at,
    status: r.status,
  })) as Report[]
}

const fetchListeningRooms = async () => {
  const { data, error } = await supabase.from("listening_rooms").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return data.map((r: Record<string, unknown>) => ({
    id: r.id,
    name: r.name,
    hostUserId: r.host_user_id,
    currentSongId: r.current_song_id,
    status: r.status,
    createdAt: r.created_at,
  })) as ListeningRoom[]
}

const fetchRoomMembers = async () => {
  const { data, error } = await supabase.from("room_members").select("*")
  if (error) throw error
  return data.map((m: Record<string, unknown>) => ({
    roomId: m.room_id,
    userId: m.user_id,
    joinedAt: m.joined_at,
    isHost: m.is_host,
  })) as RoomMember[]
}

const fetchPlaybackStates = async () => {
  const { data, error } = await supabase.from("playback_states").select("*")
  if (error) throw error
  return data.map((p: Record<string, unknown>) => ({
    roomId: p.room_id,
    currentSongId: p.current_song_id,
    isPlaying: p.is_playing,
    positionSeconds: p.position_seconds,
    lastUpdatedAt: p.last_updated_at,
    lastUpdatedBy: p.last_updated_by,
  })) as PlaybackState[]
}

const fetchRoomActivities = async () => {
  const { data, error } = await supabase.from("room_activities").select("*").order("timestamp", { ascending: false })
  if (error) throw error
  return data.map((a: Record<string, unknown>) => ({
    id: a.id,
    roomId: a.room_id,
    userId: a.user_id,
    action: a.action,
    timestamp: a.timestamp,
    details: a.details,
  })) as RoomActivity[]
}

interface AppContextType extends AppState {
  isLoading: boolean
  // User/Role switching
  setCurrentUser: (userId: string) => void
  setCurrentRole: (role: Role) => void
  getCurrentUser: () => User | undefined

  // Helper lookups
  getArtistById: (id: string) => Artist | undefined
  getSongById: (id: string) => Song | undefined
  getUserById: (id: string) => User | undefined
  getShareById: (id: string) => Share | undefined
  getCommentById: (id: string) => Comment | undefined
  getRoomById: (id: string) => ListeningRoom | undefined

  // Reactions
  getReactionsForTarget: (targetType: ReactionTargetType, targetId: string) => Reaction[]
  addReaction: (targetType: ReactionTargetType, targetId: string, type: ReactionType) => Promise<boolean>
  removeReaction: (reactionId: string) => Promise<void>
  hasUserReacted: (targetType: ReactionTargetType, targetId: string, type: ReactionType) => boolean

  // Comments
  getCommentsForSong: (songId: string) => Comment[]
  addComment: (songId: string, content: string) => Promise<void>
  updateCommentStatus: (commentId: string, status: ContentStatus) => Promise<void>

  // Shares
  getSharesForUser: (userId: string) => Share[]
  getSharesForSong: (songId: string) => Share[]
  addShare: (songId: string, captionText: string, visibility: ShareVisibility) => Promise<void>
  updateShareStatus: (shareId: string, status: ContentStatus) => Promise<void>

  // Reports
  addReport: (targetType: "share" | "comment", targetId: string, reason: string) => Promise<void>
  updateReportStatus: (reportId: string, status: ReportStatus) => Promise<void>

  // Listening Rooms
  getActiveRooms: () => ListeningRoom[]
  getRoomMembers: (roomId: string) => RoomMember[]
  getRoomPlaybackState: (roomId: string) => PlaybackState | undefined
  getRoomActivities: (roomId: string) => RoomActivity[]
  createRoom: (name: string, songId: string) => Promise<string>
  joinRoom: (roomId: string) => Promise<void>
  leaveRoom: (roomId: string) => Promise<void>
  endRoom: (roomId: string) => Promise<void>
  updatePlaybackState: (roomId: string, updates: Partial<PlaybackState>) => Promise<void>
  addRoomActivity: (roomId: string, action: RoomActivity["action"], details?: string) => Promise<void>
  getRoomsPlayingSong: (songId: string) => ListeningRoom[]

  // Computed metrics
  getSongReactionCount: (songId: string) => number
  getSongCommentCount: (songId: string) => number
  getSongShareCount: (songId: string) => number

  // Simulation
  simulateLostRecord: () => Promise<string | null>

  // Refresh data
  refreshAll: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState("user-a")
  const [currentRole, setCurrentRoleState] = useState<Role>("user")

  // SWR hooks for data fetching
  const { data: users = [], isLoading: usersLoading } = useSWR("users", fetchUsers)
  const { data: artists = [], isLoading: artistsLoading } = useSWR("artists", fetchArtists)
  const { data: songs = [], isLoading: songsLoading } = useSWR("songs", fetchSongs)
  const { data: shares = [], isLoading: sharesLoading } = useSWR("shares", fetchShares)
  const { data: reactions = [], isLoading: reactionsLoading } = useSWR("reactions", fetchReactions)
  const { data: comments = [], isLoading: commentsLoading } = useSWR("comments", fetchComments)
  const { data: reports = [], isLoading: reportsLoading } = useSWR("reports", fetchReports)
  const { data: listeningRooms = [], isLoading: roomsLoading } = useSWR("listening_rooms", fetchListeningRooms)
  const { data: roomMembers = [], isLoading: membersLoading } = useSWR("room_members", fetchRoomMembers)
  const { data: playbackStates = [], isLoading: playbackLoading } = useSWR("playback_states", fetchPlaybackStates)
  const { data: roomActivities = [], isLoading: activitiesLoading } = useSWR("room_activities", fetchRoomActivities)

  const isLoading =
    usersLoading ||
    artistsLoading ||
    songsLoading ||
    sharesLoading ||
    reactionsLoading ||
    commentsLoading ||
    reportsLoading ||
    roomsLoading ||
    membersLoading ||
    playbackLoading ||
    activitiesLoading

  // Sync role when user changes
  useEffect(() => {
    const user = users.find((u) => u.id === currentUserId)
    if (user) {
      setCurrentRoleState(user.role)
    }
  }, [currentUserId, users])

  // User/Role switching
  const setCurrentUser = useCallback((userId: string) => {
    setCurrentUserId(userId)
  }, [])

  const setCurrentRole = useCallback((role: Role) => {
    setCurrentRoleState(role)
  }, [])

  const getCurrentUser = useCallback(() => {
    return users.find((u) => u.id === currentUserId)
  }, [users, currentUserId])

  // Helper lookups
  const getArtistById = useCallback((id: string) => artists.find((a) => a.id === id), [artists])
  const getSongById = useCallback((id: string) => songs.find((s) => s.id === id), [songs])
  const getUserById = useCallback((id: string) => users.find((u) => u.id === id), [users])
  const getShareById = useCallback((id: string) => shares.find((s) => s.id === id), [shares])
  const getCommentById = useCallback((id: string) => comments.find((c) => c.id === id), [comments])
  const getRoomById = useCallback((id: string) => listeningRooms.find((r) => r.id === id), [listeningRooms])

  // Reactions
  const getReactionsForTarget = useCallback(
    (targetType: ReactionTargetType, targetId: string) =>
      reactions.filter((r) => r.targetType === targetType && r.targetId === targetId),
    [reactions]
  )

  const hasUserReacted = useCallback(
    (targetType: ReactionTargetType, targetId: string, type: ReactionType) =>
      reactions.some(
        (r) =>
          r.targetType === targetType && r.targetId === targetId && r.userId === currentUserId && r.type === type
      ),
    [reactions, currentUserId]
  )

  const addReaction = useCallback(
    async (targetType: ReactionTargetType, targetId: string, type: ReactionType): Promise<boolean> => {
      // Check for duplicate locally first
      const exists = reactions.some(
        (r) =>
          r.targetType === targetType && r.targetId === targetId && r.userId === currentUserId && r.type === type
      )
      if (exists) return false

      const newId = `reaction-${Date.now()}`
      const { error } = await supabase.from("reactions").insert({
        id: newId,
        target_type: targetType,
        target_id: targetId,
        user_id: currentUserId,
        type,
      })

      if (error) {
        console.error("Failed to add reaction:", error)
        return false
      }

      mutate("reactions")
      return true
    },
    [reactions, currentUserId]
  )

  const removeReaction = useCallback(async (reactionId: string) => {
    const { error } = await supabase.from("reactions").delete().eq("id", reactionId)
    if (error) console.error("Failed to remove reaction:", error)
    mutate("reactions")
  }, [])

  // Comments
  const getCommentsForSong = useCallback(
    (songId: string) =>
      comments
        .filter((c) => c.songId === songId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [comments]
  )

  const addComment = useCallback(
    async (songId: string, content: string) => {
      const newId = `comment-${Date.now()}`
      const { error } = await supabase.from("comments").insert({
        id: newId,
        song_id: songId,
        user_id: currentUserId,
        content,
        status: "active",
      })
      if (error) console.error("Failed to add comment:", error)
      mutate("comments")
    },
    [currentUserId]
  )

  const updateCommentStatus = useCallback(async (commentId: string, status: ContentStatus) => {
    const { error } = await supabase.from("comments").update({ status }).eq("id", commentId)
    if (error) console.error("Failed to update comment status:", error)
    mutate("comments")
  }, [])

  // Shares
  const getSharesForUser = useCallback(
    (userId: string) =>
      shares
        .filter((s) => s.userId === userId && s.status === "active")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [shares]
  )

  const getSharesForSong = useCallback(
    (songId: string) => shares.filter((s) => s.songId === songId && s.status === "active"),
    [shares]
  )

  const addShare = useCallback(
    async (songId: string, captionText: string, visibility: ShareVisibility) => {
      const newId = `share-${Date.now()}`
      const { error } = await supabase.from("shares").insert({
        id: newId,
        user_id: currentUserId,
        song_id: songId,
        caption_text: captionText,
        visibility,
        status: "active",
      })
      if (error) console.error("Failed to add share:", error)
      mutate("shares")
    },
    [currentUserId]
  )

  const updateShareStatus = useCallback(async (shareId: string, status: ContentStatus) => {
    const { error } = await supabase.from("shares").update({ status }).eq("id", shareId)
    if (error) console.error("Failed to update share status:", error)
    mutate("shares")
  }, [])

  // Reports
  const addReport = useCallback(
    async (targetType: "share" | "comment", targetId: string, reason: string) => {
      const newId = `report-${Date.now()}`
      const { error } = await supabase.from("reports").insert({
        id: newId,
        target_type: targetType,
        target_id: targetId,
        user_id: currentUserId,
        reason,
        status: "pending",
      })
      if (error) console.error("Failed to add report:", error)
      mutate("reports")
    },
    [currentUserId]
  )

  const updateReportStatus = useCallback(async (reportId: string, status: ReportStatus) => {
    const { error } = await supabase.from("reports").update({ status }).eq("id", reportId)
    if (error) console.error("Failed to update report status:", error)
    mutate("reports")
  }, [])

  // Listening Rooms
  const getActiveRooms = useCallback(
    () => listeningRooms.filter((r) => r.status === "active"),
    [listeningRooms]
  )

  const getRoomMembers = useCallback(
    (roomId: string) => roomMembers.filter((m) => m.roomId === roomId),
    [roomMembers]
  )

  const getRoomPlaybackState = useCallback(
    (roomId: string) => playbackStates.find((p) => p.roomId === roomId),
    [playbackStates]
  )

  const getRoomActivities = useCallback(
    (roomId: string) =>
      roomActivities
        .filter((a) => a.roomId === roomId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [roomActivities]
  )

  const createRoom = useCallback(
    async (name: string, songId: string): Promise<string> => {
      const roomId = `room-${Date.now()}`

      // Create room
      const { error: roomError } = await supabase.from("listening_rooms").insert({
        id: roomId,
        name,
        host_user_id: currentUserId,
        current_song_id: songId,
        status: "active",
      })
      if (roomError) throw roomError

      // Add host as member
      const { error: memberError } = await supabase.from("room_members").insert({
        room_id: roomId,
        user_id: currentUserId,
        is_host: true,
      })
      if (memberError) throw memberError

      // Create playback state
      const { error: playbackError } = await supabase.from("playback_states").insert({
        room_id: roomId,
        current_song_id: songId,
        is_playing: false,
        position_seconds: 0,
        last_updated_by: currentUserId,
      })
      if (playbackError) throw playbackError

      // Add activity
      const { error: activityError } = await supabase.from("room_activities").insert({
        id: `activity-${Date.now()}`,
        room_id: roomId,
        user_id: currentUserId,
        action: "joined",
      })
      if (activityError) throw activityError

      mutate("listening_rooms")
      mutate("room_members")
      mutate("playback_states")
      mutate("room_activities")

      return roomId
    },
    [currentUserId]
  )

  const joinRoom = useCallback(
    async (roomId: string) => {
      const alreadyMember = roomMembers.some((m) => m.roomId === roomId && m.userId === currentUserId)
      if (alreadyMember) return

      const { error: memberError } = await supabase.from("room_members").insert({
        room_id: roomId,
        user_id: currentUserId,
        is_host: false,
      })
      if (memberError) console.error("Failed to join room:", memberError)

      const { error: activityError } = await supabase.from("room_activities").insert({
        id: `activity-${Date.now()}`,
        room_id: roomId,
        user_id: currentUserId,
        action: "joined",
      })
      if (activityError) console.error("Failed to add join activity:", activityError)

      mutate("room_members")
      mutate("room_activities")
    },
    [roomMembers, currentUserId]
  )

  const leaveRoom = useCallback(
    async (roomId: string) => {
      const { error: memberError } = await supabase
        .from("room_members")
        .delete()
        .eq("room_id", roomId)
        .eq("user_id", currentUserId)
      if (memberError) console.error("Failed to leave room:", memberError)

      const { error: activityError } = await supabase.from("room_activities").insert({
        id: `activity-${Date.now()}`,
        room_id: roomId,
        user_id: currentUserId,
        action: "left",
      })
      if (activityError) console.error("Failed to add leave activity:", activityError)

      mutate("room_members")
      mutate("room_activities")
    },
    [currentUserId]
  )

  const endRoom = useCallback(async (roomId: string) => {
    const { error } = await supabase.from("listening_rooms").update({ status: "ended" }).eq("id", roomId)
    if (error) console.error("Failed to end room:", error)
    mutate("listening_rooms")
  }, [])

  const updatePlaybackState = useCallback(
    async (roomId: string, updates: Partial<PlaybackState>) => {
      const dbUpdates: Record<string, unknown> = {
        last_updated_at: new Date().toISOString(),
        last_updated_by: currentUserId,
      }
      if (updates.currentSongId !== undefined) dbUpdates.current_song_id = updates.currentSongId
      if (updates.isPlaying !== undefined) dbUpdates.is_playing = updates.isPlaying
      if (updates.positionSeconds !== undefined) dbUpdates.position_seconds = updates.positionSeconds

      const { error } = await supabase.from("playback_states").update(dbUpdates).eq("room_id", roomId)
      if (error) console.error("Failed to update playback state:", error)
      mutate("playback_states")
    },
    [currentUserId]
  )

  const addRoomActivity = useCallback(
    async (roomId: string, action: RoomActivity["action"], details?: string) => {
      const { error } = await supabase.from("room_activities").insert({
        id: `activity-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        room_id: roomId,
        user_id: currentUserId,
        action,
        details,
      })
      if (error) console.error("Failed to add room activity:", error)
      mutate("room_activities")
    },
    [currentUserId]
  )

  const getRoomsPlayingSong = useCallback(
    (songId: string) => listeningRooms.filter((r) => r.currentSongId === songId && r.status === "active"),
    [listeningRooms]
  )

  // Computed metrics
  const getSongReactionCount = useCallback(
    (songId: string) => reactions.filter((r) => r.targetType === "song" && r.targetId === songId).length,
    [reactions]
  )

  const getSongCommentCount = useCallback(
    (songId: string) => comments.filter((c) => c.songId === songId && c.status === "active").length,
    [comments]
  )

  const getSongShareCount = useCallback(
    (songId: string) => shares.filter((s) => s.songId === songId && s.status === "active").length,
    [shares]
  )

  // Simulation
  const simulateLostRecord = useCallback(async (): Promise<string | null> => {
    const activeComments = comments.filter((c) => c.status === "active")
    if (activeComments.length === 0) return null

    const randomComment = activeComments[Math.floor(Math.random() * activeComments.length)]
    const { error } = await supabase.from("comments").delete().eq("id", randomComment.id)
    if (error) {
      console.error("Failed to simulate lost record:", error)
      return null
    }
    mutate("comments")
    return randomComment.id
  }, [comments])

  const refreshAll = useCallback(() => {
    mutate("users")
    mutate("artists")
    mutate("songs")
    mutate("shares")
    mutate("reactions")
    mutate("comments")
    mutate("reports")
    mutate("listening_rooms")
    mutate("room_members")
    mutate("playback_states")
    mutate("room_activities")
  }, [])

  const state: AppState = {
    users,
    artists,
    songs,
    shares,
    reactions,
    comments,
    reports,
    listeningRooms,
    roomMembers,
    playbackStates,
    roomActivities,
    currentUserId,
    currentRole,
  }

  const value: AppContextType = {
    ...state,
    isLoading,
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
    refreshAll,
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
