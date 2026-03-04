import type {
  User,
  Artist,
  Song,
  Share,
  Reaction,
  Comment,
  Report,
  ListeningRoom,
  RoomMember,
  PlaybackState,
  RoomActivity,
} from "./types"

// Users
export const mockUsers: User[] = [
  {
    id: "user-a",
    username: "UserA",
    email: "usera@soundshare.com",
    role: "user",
    bio: "Music enthusiast and playlist curator. Always looking for the next great track!",
  },
  {
    id: "user-b",
    username: "UserB",
    email: "userb@soundshare.com",
    role: "user",
    bio: "Indie rock lover. Sharing my favorite discoveries with the community.",
  },
  {
    id: "admin",
    username: "Admin",
    email: "admin@soundshare.com",
    role: "admin",
    bio: "SoundShare platform administrator. Keeping the community safe and sound.",
  },
]

// Artists
export const mockArtists: Artist[] = [
  { id: "artist-1", name: "Luna Eclipse", verified: true },
  { id: "artist-2", name: "The Midnight Collective", verified: true },
  { id: "artist-3", name: "Nova Beats", verified: true },
  { id: "artist-4", name: "Crystal Waves", verified: false },
  { id: "artist-5", name: "Urban Poets", verified: true },
]

// Songs
export const mockSongs: Song[] = [
  {
    id: "song-1",
    title: "Starlight Dreams",
    artistId: "artist-1",
    genre: "Electronic",
    provider: "Spotify",
    coverImageUrl: "/placeholder.svg?height=300&width=300",
    createdAt: "2024-01-15T10:00:00Z",
    duration: 245,
  },
  {
    id: "song-2",
    title: "Midnight Highway",
    artistId: "artist-2",
    genre: "Synthwave",
    provider: "Apple Music",
    coverImageUrl: "/placeholder.svg?height=300&width=300",
    createdAt: "2024-01-20T14:30:00Z",
    duration: 312,
  },
  {
    id: "song-3",
    title: "Urban Pulse",
    artistId: "artist-3",
    genre: "Hip-Hop",
    provider: "Spotify",
    coverImageUrl: "/placeholder.svg?height=300&width=300",
    createdAt: "2024-02-01T09:00:00Z",
    duration: 198,
  },
  {
    id: "song-4",
    title: "Ocean Breeze",
    artistId: "artist-4",
    genre: "Chill",
    provider: "SoundCloud",
    coverImageUrl: "/placeholder.svg?height=300&width=300",
    createdAt: "2024-02-10T16:45:00Z",
    duration: 267,
  },
  {
    id: "song-5",
    title: "City Lights",
    artistId: "artist-5",
    genre: "R&B",
    provider: "Spotify",
    coverImageUrl: "/placeholder.svg?height=300&width=300",
    createdAt: "2024-02-15T11:20:00Z",
    duration: 224,
  },
  {
    id: "song-6",
    title: "Neon Glow",
    artistId: "artist-1",
    genre: "Electronic",
    provider: "Apple Music",
    coverImageUrl: "/placeholder.svg?height=300&width=300",
    createdAt: "2024-02-20T08:00:00Z",
    duration: 289,
  },
  {
    id: "song-7",
    title: "Street Poetry",
    artistId: "artist-5",
    genre: "Hip-Hop",
    provider: "Spotify",
    coverImageUrl: "/placeholder.svg?height=300&width=300",
    createdAt: "2024-03-01T13:15:00Z",
    duration: 231,
  },
  {
    id: "song-8",
    title: "Retro Wave",
    artistId: "artist-2",
    genre: "Synthwave",
    provider: "Spotify",
    coverImageUrl: "/placeholder.svg?height=300&width=300",
    createdAt: "2024-03-05T17:30:00Z",
    duration: 276,
  },
  {
    id: "song-9",
    title: "Digital Love",
    artistId: "artist-3",
    genre: "Electronic",
    provider: "Apple Music",
    coverImageUrl: "/placeholder.svg?height=300&width=300",
    createdAt: "2024-03-10T10:45:00Z",
    duration: 203,
  },
  {
    id: "song-10",
    title: "Sunset Boulevard",
    artistId: "artist-4",
    genre: "Chill",
    provider: "SoundCloud",
    coverImageUrl: "/placeholder.svg?height=300&width=300",
    createdAt: "2024-03-15T15:00:00Z",
    duration: 256,
  },
  {
    id: "song-11",
    title: "Electric Soul",
    artistId: "artist-1",
    genre: "R&B",
    provider: "Spotify",
    coverImageUrl: "/placeholder.svg?height=300&width=300",
    createdAt: "2024-03-20T09:30:00Z",
    duration: 218,
  },
  {
    id: "song-12",
    title: "Late Night Drive",
    artistId: "artist-2",
    genre: "Synthwave",
    provider: "Apple Music",
    coverImageUrl: "/placeholder.svg?height=300&width=300",
    createdAt: "2024-03-25T22:00:00Z",
    duration: 342,
  },
]

// Shares
export const mockShares: Share[] = [
  {
    id: "share-1",
    userId: "user-a",
    songId: "song-1",
    captionText: "This track has been on repeat all week! The synths are incredible.",
    visibility: "public",
    createdAt: "2024-03-26T10:00:00Z",
    status: "active",
  },
  {
    id: "share-2",
    userId: "user-b",
    songId: "song-3",
    captionText: "Perfect workout track. The beat drops are insane!",
    visibility: "public",
    createdAt: "2024-03-26T14:30:00Z",
    status: "active",
  },
  {
    id: "share-3",
    userId: "user-a",
    songId: "song-5",
    captionText: "Late night vibes. Urban Poets never disappoints.",
    visibility: "friends",
    createdAt: "2024-03-27T23:00:00Z",
    status: "active",
  },
  {
    id: "share-4",
    userId: "user-b",
    songId: "song-8",
    captionText: "Throwback to the 80s with this synth masterpiece!",
    visibility: "public",
    createdAt: "2024-03-28T16:00:00Z",
    status: "active",
  },
]

// Reactions
export const mockReactions: Reaction[] = [
  { id: "reaction-1", targetType: "song", targetId: "song-1", userId: "user-a", type: "like", createdAt: "2024-03-26T10:05:00Z" },
  { id: "reaction-2", targetType: "song", targetId: "song-1", userId: "user-b", type: "love", createdAt: "2024-03-26T11:00:00Z" },
  { id: "reaction-3", targetType: "song", targetId: "song-3", userId: "user-a", type: "love", createdAt: "2024-03-26T15:00:00Z" },
  { id: "reaction-4", targetType: "share", targetId: "share-1", userId: "user-b", type: "like", createdAt: "2024-03-26T12:00:00Z" },
  { id: "reaction-5", targetType: "share", targetId: "share-2", userId: "user-a", type: "love", createdAt: "2024-03-26T16:00:00Z" },
  { id: "reaction-6", targetType: "song", targetId: "song-5", userId: "user-b", type: "like", createdAt: "2024-03-27T23:30:00Z" },
  { id: "reaction-7", targetType: "song", targetId: "song-8", userId: "user-a", type: "like", createdAt: "2024-03-28T17:00:00Z" },
  { id: "reaction-8", targetType: "comment", targetId: "comment-1", userId: "user-b", type: "like", createdAt: "2024-03-26T13:00:00Z" },
]

// Comments
export const mockComments: Comment[] = [
  {
    id: "comment-1",
    songId: "song-1",
    userId: "user-a",
    content: "The drop at 1:30 is absolutely mind-blowing!",
    createdAt: "2024-03-26T10:30:00Z",
    status: "active",
  },
  {
    id: "comment-2",
    songId: "song-1",
    userId: "user-b",
    content: "Luna Eclipse always delivers quality. This is their best work yet!",
    createdAt: "2024-03-26T11:30:00Z",
    status: "active",
  },
  {
    id: "comment-3",
    songId: "song-3",
    userId: "user-a",
    content: "Nova Beats knows how to make a banger!",
    createdAt: "2024-03-26T15:30:00Z",
    status: "active",
  },
  {
    id: "comment-4",
    songId: "song-5",
    userId: "user-b",
    content: "The lyrics hit different at 2am.",
    createdAt: "2024-03-27T02:00:00Z",
    status: "active",
  },
  {
    id: "comment-5",
    songId: "song-8",
    userId: "user-a",
    content: "Pure nostalgia in audio form.",
    createdAt: "2024-03-28T18:00:00Z",
    status: "active",
  },
]

// Reports
export const mockReports: Report[] = [
  {
    id: "report-1",
    targetType: "comment",
    targetId: "comment-3",
    userId: "user-b",
    reason: "Potentially misleading information about the artist.",
    createdAt: "2024-03-26T16:00:00Z",
    status: "pending",
  },
  {
    id: "report-2",
    targetType: "share",
    targetId: "share-2",
    userId: "admin",
    reason: "Review caption for appropriateness.",
    createdAt: "2024-03-27T09:00:00Z",
    status: "pending",
  },
]

// Listening Rooms
export const mockListeningRooms: ListeningRoom[] = [
  {
    id: "room-1",
    name: "Late Night Synths",
    hostUserId: "user-a",
    currentSongId: "song-2",
    status: "active",
    createdAt: "2024-03-28T22:00:00Z",
  },
  {
    id: "room-2",
    name: "Chill Vibes Only",
    hostUserId: "user-b",
    currentSongId: "song-4",
    status: "active",
    createdAt: "2024-03-28T20:00:00Z",
  },
]

// Room Members
export const mockRoomMembers: RoomMember[] = [
  { roomId: "room-1", userId: "user-a", joinedAt: "2024-03-28T22:00:00Z", isHost: true },
  { roomId: "room-1", userId: "user-b", joinedAt: "2024-03-28T22:05:00Z", isHost: false },
  { roomId: "room-2", userId: "user-b", joinedAt: "2024-03-28T20:00:00Z", isHost: true },
  { roomId: "room-2", userId: "user-a", joinedAt: "2024-03-28T20:10:00Z", isHost: false },
]

// Playback States
export const mockPlaybackStates: PlaybackState[] = [
  {
    roomId: "room-1",
    currentSongId: "song-2",
    isPlaying: true,
    positionSeconds: 45,
    lastUpdatedAt: "2024-03-28T22:10:00Z",
    lastUpdatedBy: "user-a",
  },
  {
    roomId: "room-2",
    currentSongId: "song-4",
    isPlaying: false,
    positionSeconds: 120,
    lastUpdatedAt: "2024-03-28T20:30:00Z",
    lastUpdatedBy: "user-b",
  },
]

// Room Activities
export const mockRoomActivities: RoomActivity[] = [
  { id: "activity-1", roomId: "room-1", userId: "user-a", action: "joined", timestamp: "2024-03-28T22:00:00Z" },
  { id: "activity-2", roomId: "room-1", userId: "user-a", action: "played", timestamp: "2024-03-28T22:00:30Z" },
  { id: "activity-3", roomId: "room-1", userId: "user-b", action: "joined", timestamp: "2024-03-28T22:05:00Z" },
  { id: "activity-4", roomId: "room-2", userId: "user-b", action: "joined", timestamp: "2024-03-28T20:00:00Z" },
  { id: "activity-5", roomId: "room-2", userId: "user-b", action: "played", timestamp: "2024-03-28T20:00:30Z" },
  { id: "activity-6", roomId: "room-2", userId: "user-a", action: "joined", timestamp: "2024-03-28T20:10:00Z" },
  { id: "activity-7", roomId: "room-2", userId: "user-b", action: "paused", timestamp: "2024-03-28T20:30:00Z" },
]
