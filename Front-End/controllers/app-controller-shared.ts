import type { AppState } from "@/utils/types"

export const initialState: AppState = {
  users: [],
  genres: [],
  artists: [],
  songs: [],
  shares: [],
  reactions: [],
  comments: [],
  reports: [],
  listeningRooms: [],
  roomMembers: [],
  playbackStates: [],
  roomActivities: [],
  currentUserId: "",
  currentRole: "user",
}

export const buildId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
}

