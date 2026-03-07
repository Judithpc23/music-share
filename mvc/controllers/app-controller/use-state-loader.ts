import { useEffect } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { AppState, User } from "@/mvc/models/types"
import { supabase } from "@/mvc/models/supabase-client"
import {
  fromDbArtist,
  fromDbGenre,
  fromDbComment,
  fromDbListeningRoom,
  fromDbPlaybackState,
  fromDbReaction,
  fromDbReport,
  fromDbRoomActivity,
  fromDbRoomMember,
  fromDbShare,
  fromDbSong,
  fromDbUser,
  toDbUser,
} from "@/mvc/models/supabase-mappers"
import { logSupabaseError } from "@/mvc/controllers/app-controller/shared"

type UseStateLoaderParams = {
  setState: Dispatch<SetStateAction<AppState>>
}

export function useStateLoader({ setState }: UseStateLoaderParams) {
  useEffect(() => {
    const loadState = async () => {
      const [
        usersResult,
        genresResult,
        artistsResult,
        songsResult,
        sharesResult,
        reactionsResult,
        commentsResult,
        reportsResult,
        roomsResult,
        roomMembersResult,
        playbackResult,
        activitiesResult,
      ] = await Promise.all([
        supabase.from("users").select("*"),
        supabase.from("genres").select("*"),
        supabase.from("artists").select("*"),
        supabase.from("songs").select("*"),
        supabase.from("shares").select("*"),
        supabase.from("reactions").select("*"),
        supabase.from("comments").select("*"),
        supabase.from("reports").select("*"),
        supabase.from("listening_rooms").select("*"),
        supabase.from("room_members").select("*"),
        supabase.from("playback_states").select("*"),
        supabase.from("room_activities").select("*"),
      ])

      const results = [
        usersResult,
        genresResult,
        artistsResult,
        songsResult,
        sharesResult,
        reactionsResult,
        commentsResult,
        reportsResult,
        roomsResult,
        roomMembersResult,
        playbackResult,
        activitiesResult,
      ]

      const firstError = results.find((result) => result.error)?.error
      if (firstError) {
        logSupabaseError("failed to load initial app state", firstError)
        return
      }

      let users = (usersResult.data ?? []).map(fromDbUser)
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) {
        logSupabaseError("failed to read auth user", authError)
      }

      const authUser = authData.user
      if (authUser && !users.some((user) => user.id === authUser.id)) {
        const usernameFallback = `@${authUser.email?.split("@")[0] ?? `user-${authUser.id.slice(0, 8)}`}`
        const profile: User = {
          id: authUser.id,
          username: usernameFallback,
          email: authUser.email ?? "",
          role: "user",
          bio: "",
          firstName: (authUser.user_metadata?.first_name as string | undefined) ?? "",
          lastName: (authUser.user_metadata?.last_name as string | undefined) ?? "",
          privacity: "public",
          mood: "",
        }

        const { error: insertUserError } = await supabase.from("users").insert(toDbUser(profile))
        if (insertUserError) {
          logSupabaseError("failed to create profile row for auth user", insertUserError)
        } else {
          users = [...users, profile]
        }
      }

      setState((previous) => {
        const currentUserId = authUser?.id && users.some((user) => user.id === authUser.id)
          ? authUser.id
          : users.some((user) => user.id === previous.currentUserId)
            ? previous.currentUserId
            : users[0]?.id ?? ""
        const currentRole = users.find((user) => user.id === currentUserId)?.role ?? "user"

        return {
          users,
          genres: (genresResult.data ?? []).map(fromDbGenre),
          artists: (artistsResult.data ?? []).map(fromDbArtist),
          songs: (songsResult.data ?? []).map(fromDbSong),
          shares: (sharesResult.data ?? []).map(fromDbShare),
          reactions: (reactionsResult.data ?? []).map(fromDbReaction),
          comments: (commentsResult.data ?? []).map(fromDbComment),
          reports: (reportsResult.data ?? []).map(fromDbReport),
          listeningRooms: (roomsResult.data ?? []).map(fromDbListeningRoom),
          roomMembers: (roomMembersResult.data ?? []).map(fromDbRoomMember),
          playbackStates: (playbackResult.data ?? []).map(fromDbPlaybackState),
          roomActivities: (activitiesResult.data ?? []).map(fromDbRoomActivity),
          currentUserId,
          currentRole,
        }
      })
    }

    void loadState()
  }, [setState])
}

