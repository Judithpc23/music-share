import { useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
import type {
  AppState,
  ListeningRoom,
  PlaybackState,
  RoomActivity,
  RoomMember,
} from "@/utils/types"
import { backendController } from "@/controllers/backend-controller"
import { buildId } from "@/controllers/app-controller-shared"

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
        try {
          const result = await backendController.createRoom({
            userId: state.currentUserId,
            name,
            songId,
            roomId,
            activityId: newActivity.id,
            now,
          })
          if (!result.success) {
            console.error("[api] create room failed")
          }
        } catch (error) {
          console.error("[api] create room failed", error)
        }
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

      void backendController
        .joinRoom(roomId, {
          userId: state.currentUserId,
          activityId: newActivity.id,
          now,
        })
        .then((result) => {
          if (!result.success) {
            console.error("[api] join room failed")
          }
        })
        .catch((error) => {
          console.error("[api] join room failed", error)
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

      void backendController
        .leaveRoom(roomId, {
          userId: state.currentUserId,
          activityId: newActivity.id,
          now: newActivity.timestamp,
        })
        .then((result) => {
          if (!result.success) {
            console.error("[api] leave room failed")
          }
        })
        .catch((error) => {
          console.error("[api] leave room failed", error)
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

    void backendController
      .endRoom(roomId)
      .then((result) => {
        if (!result.success) {
          console.error("[api] end room failed")
        }
      })
      .catch((error) => {
        console.error("[api] end room failed", error)
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
        void backendController
          .updateRoomPlayback(roomId, {
            userId: state.currentUserId,
            updates,
          })
          .then((result) => {
            if (!result.success) {
              console.error("[api] update playback failed")
            }
          })
          .catch((error) => {
            console.error("[api] update playback failed", error)
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

      void backendController
        .addRoomActivity(roomId, {
          userId: state.currentUserId,
          action,
          details,
          activityId: newActivity.id,
          timestamp: newActivity.timestamp,
        })
        .then((result) => {
          if (!result.success) {
            console.error("[api] add room activity failed")
          }
        })
        .catch((error) => {
          console.error("[api] add room activity failed", error)
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

