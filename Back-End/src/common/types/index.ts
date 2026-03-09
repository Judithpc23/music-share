// User & Auth types
export type Role = 'user' | 'admin'
export type ProfilePrivacy = 'public' | 'private'

export interface User {
  id: string
  username: string
  email: string
  role: Role
  bio: string
  firstName: string
  lastName: string
  privacity: ProfilePrivacy
  img?: string
  favGenres?: string
  favSong?: string
  mood: string
}

// Artist types
export interface Artist {
  id: string
  name: string
  verified: boolean
}

// Genre types
export interface Genre {
  id: string
  name: string
  description: string
  createdAt: string
}

// Song types
export interface Song {
  id: string
  title: string
  artistId: string
  genreId: string
  provider: string
  coverImageUrl: string
  createdAt: string
  duration: number // in seconds
}

// Share types
export type ShareVisibility = 'public' | 'friends'
export type ContentStatus = 'active' | 'hidden' | 'deleted'

export interface Share {
  id: string
  userId: string
  songId: string
  captionText: string
  visibility: ShareVisibility
  createdAt: string
  status: ContentStatus
}

// Post & Mood types (Prototype Pattern)
export type MoodType = 'nostalgia' | 'energy' | 'chill'

export interface PostTemplate {
  title: string
  descriptionPlaceholder: string
  emotionalContext: string
  suggestedTags: string[]
  defaultPrivacy: 'public' | 'friends'
  color: string
}

export interface IPostPrototype {
  clone(): IPostPrototype
  getMoodType(): MoodType
  getTemplate(): PostTemplate
  customize(overrides: Partial<PostTemplate>): IPostPrototype
}

export interface Post {
  id: string
  userId: string
  content: string
  mood: MoodType
  template: PostTemplate
  createdAt: Date
  updatedAt?: Date
}

// Follow & Notification types
export type FollowStatus = 'pending' | 'accepted' | 'rejected'

export interface Follow {
  followerId: string
  followingId: string
  status: FollowStatus
  createdAt: string
  respondedAt?: string
}

export type NotificationType =
  | 'post'
  | 'reaction'
  | 'comment'
  | 'follow_request'
  | 'follower'

export type NotificationTargetType =
  | 'post'
  | 'share'
  | 'comment'
  | 'follow_request'
  | 'profile'

export interface AppNotification {
  id: string
  userId: string
  actorUserId: string
  type: NotificationType
  title: string
  body: string
  targetType?: NotificationTargetType
  targetId?: string
  isRead: boolean
  metadata: Record<string, unknown>
  createdAt: string
}

// Reaction types
export type ReactionTargetType = 'song' | 'share' | 'comment'
export type ReactionType = 'like' | 'love'

export interface Reaction {
  id: string
  targetType: ReactionTargetType
  targetId: string
  userId: string
  type: ReactionType
  createdAt: string
}

// Comment types
export interface Comment {
  id: string
  songId: string
  userId: string
  content: string
  createdAt: string
  status: ContentStatus
}

// Report types
export type ReportTargetType = 'share' | 'comment'
export type ReportStatus = 'pending' | 'resolved'

export interface Report {
  id: string
  targetType: ReportTargetType
  targetId: string
  userId: string
  reason: string
  createdAt: string
  status: ReportStatus
}

// Listening Room types
export type RoomStatus = 'active' | 'ended'

export interface ListeningRoom {
  id: string
  name: string
  hostUserId: string
  currentSongId: string
  status: RoomStatus
  createdAt: string
}

export interface RoomMember {
  roomId: string
  userId: string
  joinedAt: string
  isHost: boolean
}

export interface PlaybackState {
  roomId: string
  currentSongId: string
  isPlaying: boolean
  positionSeconds: number
  lastUpdatedAt: string
  lastUpdatedBy: string
}

// Activity log for rooms
export interface RoomActivity {
  id: string
  roomId: string
  userId: string
  action: 'joined' | 'left' | 'played' | 'paused' | 'seeked'
  timestamp: string
  details?: string
}

// App State
export interface AppState {
  users: User[]
  genres: Genre[]
  artists: Artist[]
  songs: Song[]
  shares: Share[]
  reactions: Reaction[]
  comments: Comment[]
  reports: Report[]
  listeningRooms: ListeningRoom[]
  roomMembers: RoomMember[]
  playbackStates: PlaybackState[]
  roomActivities: RoomActivity[]
  currentUserId: string
  currentRole: Role
}
