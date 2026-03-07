import { useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { AppState, Role } from "@/mvc/models/types"

type UseLookupsParams = {
  state: AppState
  setState: Dispatch<SetStateAction<AppState>>
}

export function useLookups({ state, setState }: UseLookupsParams) {
  const setCurrentUser = useCallback(
    (userId: string) => {
      const user = state.users.find((item) => item.id === userId)
      setState((previous) => ({
        ...previous,
        currentUserId: userId,
        currentRole: user?.role || "user",
      }))
    },
    [state.users, setState]
  )

  const setCurrentRole = useCallback((role: Role) => {
    setState((previous) => ({ ...previous, currentRole: role }))
  }, [setState])

  const getCurrentUser = useCallback(() => {
    return state.users.find((item) => item.id === state.currentUserId)
  }, [state.users, state.currentUserId])

  const getGenreById = useCallback(
    (id: string) => state.genres.find((item) => item.id === id),
    [state.genres]
  )

  const getArtistById = useCallback(
    (id: string) => state.artists.find((item) => item.id === id),
    [state.artists]
  )

  const getSongById = useCallback(
    (id: string) => state.songs.find((item) => item.id === id),
    [state.songs]
  )

  const getUserById = useCallback(
    (id: string) => state.users.find((item) => item.id === id),
    [state.users]
  )

  const getShareById = useCallback(
    (id: string) => state.shares.find((item) => item.id === id),
    [state.shares]
  )

  const getCommentById = useCallback(
    (id: string) => state.comments.find((item) => item.id === id),
    [state.comments]
  )

  const getRoomById = useCallback(
    (id: string) => state.listeningRooms.find((item) => item.id === id),
    [state.listeningRooms]
  )

  return {
    setCurrentUser,
    setCurrentRole,
    getCurrentUser,
    getGenreById,
    getArtistById,
    getSongById,
    getUserById,
    getShareById,
    getCommentById,
    getRoomById,
  }
}
