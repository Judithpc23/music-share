import { useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
import type {
  AppState,
  ListeningRoom,
  PlaybackState,
  RoomActivity,
  RoomMember,
} from "@/mvc/models/types"
import { supabase } from "@/mvc/models/supabase-client"
import {
  toDbListeningRoom,
  toDbPlaybackState,
  toDbRoomActivity,
  toDbRoomMember,
} from "@/mvc/models/supabase-mappers"
import { buildId, logSupabaseError } from "@/mvc/controllers/app-controller/shared"

type UseRoomsParams = {
  state: AppState
  setState: Dispatch<SetStateAction<AppState>>
}

export function useRooms({ state, setState }: UseRoomsParams) {
  const getActiveRooms = useCallback(
    () => state.listeningRooms.filter((item) => item.status === "active"),
    [state.listeningRooms]
  )

  const getRoomMembers = useCallback(
    (roomId: string) => state.roomMembers.filter((item) => item.roomId === roomId),
    [state.roomMembers]
  )

  const getRoomPlaybackState = useCallback(
    (roomId: string) => state.playbackStates.find((item) => item.roomId === roomId),
    [state.playbackStates]
  )

  const getRoomActivities = useCallback(
    (roomId: string) =>
      state.roomActivities
        .filter((item) => item.roomId === roomId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [state.roomActivities]
  )

  const createRoom = useCallback(
    (name: string, songId: string): string => {
      const roomId = buildId("room")
      const now = new Date().toISOString()

      const newRoom: ListeningRoom = {
        id: roomId,
        name,
        hostUserId: state.currentUserId,
        currentSongId: songId,
        status: "active",
        createdAt: now,
      }
      const newMember: RoomMember = {
        roomId,
        userId: state.currentUserId,
        joinedAt: now,
        isHost: true,
      }
      const newPlayback: PlaybackState = {
        roomId,
        currentSongId: songId,
        isPlaying: false,
        positionSeconds: 0,
        lastUpdatedAt: now,
        lastUpdatedBy: state.currentUserId,
      }
      const newActivity: RoomActivity = {
        id: buildId("activity"),
        roomId,
        userId: state.currentUserId,
        action: "joined",
        timestamp: now,
      }

      setState((previous) => ({
        ...previous,
        listeningRooms: [...previous.listeningRooms, newRoom],
        roomMembers: [...previous.roomMembers, newMember],
        playbackStates: [...previous.playbackStates, newPlayback],
        roomActivities: [...previous.roomActivities, newActivity],
      }))

      void (async () => {
        const roomInsert = await supabase.from("listening_rooms").insert(toDbListeningRoom(newRoom))
        if (roomInsert.error) {
          logSupabaseError("insert listening room failed", roomInsert.error)
          return
        }

        const [memberResult, playbackResult, activityResult] = await Promise.all([
          supabase.from("room_members").insert(toDbRoomMember(newMember)),
          supabase.from("playback_states").insert(toDbPlaybackState(newPlayback)),
          supabase.from("room_activities").insert(toDbRoomActivity(newActivity)),
        ])

        if (memberResult.error) logSupabaseError("insert room member failed", memberResult.error)
        if (playbackResult.error) logSupabaseError("insert playback state failed", playbackResult.error)
        if (activityResult.error) logSupabaseError("insert room activity failed", activityResult.error)
      })()

      return roomId
    },
    [state.currentUserId, setState]
  )

  const joinRoom = useCallback(
    (roomId: string) => {
      const alreadyMember = state.roomMembers.some(
        (item) => item.roomId === roomId && item.userId === state.currentUserId
      )
      if (alreadyMember) return

      const now = new Date().toISOString()
      const newMember: RoomMember = {
        roomId,
        userId: state.currentUserId,
        joinedAt: now,
        isHost: false,
      }
      const newActivity: RoomActivity = {
        id: buildId("activity"),
        roomId,
        userId: state.currentUserId,
        action: "joined",
        timestamp: now,
      }

      setState((previous) => ({
        ...previous,
        roomMembers: [...previous.roomMembers, newMember],
        roomActivities: [...previous.roomActivities, newActivity],
      }))

      void Promise.all([
        supabase.from("room_members").insert(toDbRoomMember(newMember)),
        supabase.from("room_activities").insert(toDbRoomActivity(newActivity)),
      ]).then(([memberResult, activityResult]) => {
        if (memberResult.error) logSupabaseError("join room failed", memberResult.error)
        if (activityResult.error) logSupabaseError("join room activity failed", activityResult.error)
      })
    },
    [state.roomMembers, state.currentUserId, setState]
  )

  const leaveRoom = useCallback(
    (roomId: string) => {
      const newActivity: RoomActivity = {
        id: buildId("activity"),
        roomId,
        userId: state.currentUserId,
        action: "left",
        timestamp: new Date().toISOString(),
      }

      setState((previous) => ({
        ...previous,
        roomMembers: previous.roomMembers.filter(
          (item) => !(item.roomId === roomId && item.userId === state.currentUserId)
        ),
        roomActivities: [...previous.roomActivities, newActivity],
      }))

      void Promise.all([
        supabase
          .from("room_members")
          .delete()
          .eq("room_id", roomId)
          .eq("user_id", state.currentUserId),
        supabase.from("room_activities").insert(toDbRoomActivity(newActivity)),
      ]).then(([memberDelete, activityInsert]) => {
        if (memberDelete.error) logSupabaseError("leave room failed", memberDelete.error)
        if (activityInsert.error) logSupabaseError("leave room activity failed", activityInsert.error)
      })
    },
    [state.currentUserId, setState]
  )

  const endRoom = useCallback((roomId: string) => {
    setState((previous) => ({
      ...previous,
      listeningRooms: previous.listeningRooms.map((item) =>
        item.id === roomId ? { ...item, status: "ended" as const } : item
      ),
    }))

    void supabase
      .from("listening_rooms")
      .update({ status: "ended" })
      .eq("id", roomId)
      .then(({ error }) => {
        if (error) logSupabaseError("end room failed", error)
      })
  }, [setState])

  const updatePlaybackState = useCallback(
    (roomId: string, updates: Partial<PlaybackState>) => {
      const now = new Date().toISOString()
      const currentPlayback = state.playbackStates.find((item) => item.roomId === roomId)
      const latestPlayback: PlaybackState | null = currentPlayback
        ? {
            ...currentPlayback,
            ...updates,
            lastUpdatedAt: now,
            lastUpdatedBy: state.currentUserId,
          }
        : null

      setState((previous) => {
        const playbackStates = previous.playbackStates.map((item) => {
          if (item.roomId !== roomId) return item
          return latestPlayback ?? item
        })

        return {
          ...previous,
          playbackStates,
        }
      })

      if (latestPlayback) {
        void supabase
          .from("playback_states")
          .upsert(toDbPlaybackState(latestPlayback), { onConflict: "room_id" })
          .then(({ error }) => {
            if (error) logSupabaseError("update playback failed", error)
          })
      }
    },
    [state.playbackStates, state.currentUserId, setState]
  )

  const addRoomActivity = useCallback(
    (roomId: string, action: RoomActivity["action"], details?: string) => {
      const newActivity: RoomActivity = {
        id: buildId("activity"),
        roomId,
        userId: state.currentUserId,
        action,
        timestamp: new Date().toISOString(),
        details,
      }
      setState((previous) => ({
        ...previous,
        roomActivities: [...previous.roomActivities, newActivity],
      }))

      void supabase
        .from("room_activities")
        .insert(toDbRoomActivity(newActivity))
        .then(({ error }) => {
          if (error) logSupabaseError("insert room activity failed", error)
        })
    },
    [state.currentUserId, setState]
  )

  const getRoomsPlayingSong = useCallback(
    (songId: string) =>
      state.listeningRooms.filter((item) => item.currentSongId === songId && item.status === "active"),
    [state.listeningRooms]
  )

  return {
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
  }
}

