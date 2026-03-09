import type {
  User,
  Genre,
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
  Post,
  PostTemplate,
} from '../types'

export type DbUser = {
  id: string
  username: string
  email: string
  role: User['role']
  bio: string | null
  first_name: string | null
  last_name: string | null
  privacity: User['privacity'] | null
  img: string | null
  fav_genres: string | null
  fav_song: string | null
  mood: string | null
}

export type DbArtist = {
  id: string
  name: string
  verified: boolean
}

export type DbGenre = {
  id: string
  name: string
  description: string
  created_at: string
}

export type DbSong = {
  id: string
  title: string
  artist_id: string
  genre_id: string
  cover_image_url: string | null
  created_at: string
  duration: number
}

export type DbShare = {
  id: string
  user_id: string
  song_id: string
  caption_text: string
  visibility: Share['visibility']
  created_at: string
  status: Share['status']
}

export type DbReaction = {
  id: string
  target_type: Reaction['targetType']
  target_id: string
  user_id: string
  type: Reaction['type']
  created_at: string
}

export type DbComment = {
  id: string
  song_id: string
  user_id: string
  content: string
  created_at: string
  status: Comment['status']
}

export type DbReport = {
  id: string
  target_type: Report['targetType']
  target_id: string
  user_id: string
  reason: string
  created_at: string
  status: Report['status']
}

export type DbListeningRoom = {
  id: string
  name: string
  host_user_id: string
  current_song_id: string
  status: ListeningRoom['status']
  created_at: string
}

export type DbRoomMember = {
  room_id: string
  user_id: string
  joined_at: string
  is_host: boolean
}

export type DbPlaybackState = {
  room_id: string
  current_song_id: string
  is_playing: boolean
  position_seconds: number
  last_updated_at: string
  last_updated_by: string
}

export type DbRoomActivity = {
  id: string
  room_id: string
  user_id: string
  action: RoomActivity['action']
  timestamp: string
  details: string | null
}

export const fromDbUser = (row: DbUser): User => ({
  id: row.id,
  username: row.username,
  email: row.email,
  role: row.role,
  bio: row.bio ?? '',
  firstName: row.first_name ?? '',
  lastName: row.last_name ?? '',
  privacity: row.privacity ?? 'public',
  img: row.img ?? undefined,
  favGenres: row.fav_genres ?? undefined,
  favSong: row.fav_song ?? undefined,
  mood: row.mood ?? '',
})

export const toDbUser = (user: User): DbUser => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  bio: user.bio,
  first_name: user.firstName,
  last_name: user.lastName,
  privacity: user.privacity,
  img: user.img ?? null,
  fav_genres: user.favGenres ?? null,
  fav_song: user.favSong ?? null,
  mood: user.mood,
})

export const fromDbArtist = (row: DbArtist): Artist => ({
  id: row.id,
  name: row.name,
  verified: row.verified,
})

export const fromDbGenre = (row: DbGenre): Genre => ({
  id: row.id,
  name: row.name,
  description: row.description,
  createdAt: row.created_at,
})

export const fromDbSong = (row: DbSong): Song => ({
  id: row.id,
  title: row.title,
  artistId: row.artist_id,
  genreId: row.genre_id,
  coverImageUrl:
    row.cover_image_url ?? '/placeholder.svg?height=300&width=300',
  createdAt: row.created_at,
  duration: row.duration,
})

export const fromDbShare = (row: DbShare): Share => ({
  id: row.id,
  userId: row.user_id,
  songId: row.song_id,
  captionText: row.caption_text,
  visibility: row.visibility,
  createdAt: row.created_at,
  status: row.status,
})

export const toDbShare = (share: Share): DbShare => ({
  id: share.id,
  user_id: share.userId,
  song_id: share.songId,
  caption_text: share.captionText,
  visibility: share.visibility,
  created_at: share.createdAt,
  status: share.status,
})

export const fromDbReaction = (row: DbReaction): Reaction => ({
  id: row.id,
  targetType: row.target_type,
  targetId: row.target_id,
  userId: row.user_id,
  type: row.type,
  createdAt: row.created_at,
})

export const toDbReaction = (reaction: Reaction): DbReaction => ({
  id: reaction.id,
  target_type: reaction.targetType,
  target_id: reaction.targetId,
  user_id: reaction.userId,
  type: reaction.type,
  created_at: reaction.createdAt,
})

export const fromDbComment = (row: DbComment): Comment => ({
  id: row.id,
  songId: row.song_id,
  userId: row.user_id,
  content: row.content,
  createdAt: row.created_at,
  status: row.status,
})

export const toDbComment = (comment: Comment): DbComment => ({
  id: comment.id,
  song_id: comment.songId,
  user_id: comment.userId,
  content: comment.content,
  created_at: comment.createdAt,
  status: comment.status,
})

export const fromDbReport = (row: DbReport): Report => ({
  id: row.id,
  targetType: row.target_type,
  targetId: row.target_id,
  userId: row.user_id,
  reason: row.reason,
  createdAt: row.created_at,
  status: row.status,
})

export const toDbReport = (report: Report): DbReport => ({
  id: report.id,
  target_type: report.targetType,
  target_id: report.targetId,
  user_id: report.userId,
  reason: report.reason,
  created_at: report.createdAt,
  status: report.status,
})

export const fromDbListeningRoom = (row: DbListeningRoom): ListeningRoom => ({
  id: row.id,
  name: row.name,
  hostUserId: row.host_user_id,
  currentSongId: row.current_song_id,
  status: row.status,
  createdAt: row.created_at,
})

export const toDbListeningRoom = (
  room: ListeningRoom
): DbListeningRoom => ({
  id: room.id,
  name: room.name,
  host_user_id: room.hostUserId,
  current_song_id: room.currentSongId,
  status: room.status,
  created_at: room.createdAt,
})

export const fromDbRoomMember = (row: DbRoomMember): RoomMember => ({
  roomId: row.room_id,
  userId: row.user_id,
  joinedAt: row.joined_at,
  isHost: row.is_host,
})

export const toDbRoomMember = (member: RoomMember): DbRoomMember => ({
  room_id: member.roomId,
  user_id: member.userId,
  joined_at: member.joinedAt,
  is_host: member.isHost,
})

export const fromDbPlaybackState = (
  row: DbPlaybackState
): PlaybackState => ({
  roomId: row.room_id,
  currentSongId: row.current_song_id,
  isPlaying: row.is_playing,
  positionSeconds: row.position_seconds,
  lastUpdatedAt: row.last_updated_at,
  lastUpdatedBy: row.last_updated_by,
})

export const toDbPlaybackState = (playback: PlaybackState): DbPlaybackState => ({
  room_id: playback.roomId,
  current_song_id: playback.currentSongId,
  is_playing: playback.isPlaying,
  position_seconds: playback.positionSeconds,
  last_updated_at: playback.lastUpdatedAt,
  last_updated_by: playback.lastUpdatedBy,
})

export const fromDbRoomActivity = (row: DbRoomActivity): RoomActivity => ({
  id: row.id,
  roomId: row.room_id,
  userId: row.user_id,
  action: row.action,
  timestamp: row.timestamp,
  details: row.details ?? undefined,
})

export const toDbRoomActivity = (activity: RoomActivity): DbRoomActivity => ({
  id: activity.id,
  room_id: activity.roomId,
  user_id: activity.userId,
  action: activity.action,
  timestamp: activity.timestamp,
  details: activity.details ?? null,
})

// Post & PostTemplate DB types
export type DbPost = {
  id: string
  user_id: string
  post_type: 'template' | 'share'
  content: string
  mood: NonNullable<Post['mood']> | null
  template: DbPostTemplate | null
  song_id: string | null
  caption_text: string | null
  status: Share['status'] | null
  created_at: string
  updated_at?: string
}

export type DbPostTemplate = {
  title: string
  description_placeholder: string
  emotional_context: string
  suggested_tags: string[]
  default_privacy: PostTemplate['defaultPrivacy']
  color: string
}

// Post & PostTemplate mappers
export const toDbPost = (post: Post): DbPost => ({
  id: post.id,
  user_id: post.userId,
  post_type: post.postType,
  content: post.content,
  mood: post.mood ?? null,
  template: post.template ? toDbPostTemplate(post.template) : null,
  song_id: post.songId ?? null,
  caption_text: post.captionText ?? null,
  status: post.status ?? null,
  created_at: post.createdAt.toISOString(),
  updated_at: post.updatedAt?.toISOString(),
})

export const fromDbPost = (dbPost: DbPost): Post => ({
  id: dbPost.id,
  userId: dbPost.user_id,
  postType: dbPost.post_type,
  content: dbPost.content,
  mood: dbPost.mood ?? undefined,
  template: dbPost.template ? fromDbPostTemplate(dbPost.template) : undefined,
  songId: dbPost.song_id ?? undefined,
  captionText: dbPost.caption_text ?? undefined,
  status: dbPost.status ?? undefined,
  createdAt: new Date(dbPost.created_at),
  updatedAt: dbPost.updated_at ? new Date(dbPost.updated_at) : undefined,
})

export const toDbPostTemplate = (template: PostTemplate): DbPostTemplate => ({
  title: template.title,
  description_placeholder: template.descriptionPlaceholder,
  emotional_context: template.emotionalContext,
  suggested_tags: template.suggestedTags,
  default_privacy: template.defaultPrivacy,
  color: template.color,
})

export const fromDbPostTemplate = (dbTemplate: DbPostTemplate): PostTemplate => ({
  title: dbTemplate.title,
  descriptionPlaceholder: dbTemplate.description_placeholder,
  emotionalContext: dbTemplate.emotional_context,
  suggestedTags: dbTemplate.suggested_tags,
  defaultPrivacy: dbTemplate.default_privacy,
  color: dbTemplate.color,
})
