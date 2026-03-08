import { Controller, Get, Headers } from '@nestjs/common'
import { supabase } from '../auth/supabase-client'
import {
  fromDbArtist,
  fromDbComment,
  fromDbGenre,
  fromDbListeningRoom,
  fromDbPlaybackState,
  fromDbReaction,
  fromDbReport,
  fromDbRoomActivity,
  fromDbRoomMember,
  fromDbShare,
  fromDbSong,
  fromDbUser,
} from '@/common/utils/mappers'

@Controller('bootstrap')
export class BootstrapController {
  @Get()
  async getBootstrap(@Headers('authorization') authorization?: string) {
    const accessToken = (authorization?.replace(/^Bearer\s+/i, '') ?? '').trim() || undefined
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
      authResult,
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('genres').select('*'),
      supabase.from('artists').select('*'),
      supabase.from('songs').select('*'),
      supabase.from('shares').select('*'),
      supabase.from('reactions').select('*'),
      supabase.from('comments').select('*'),
      supabase.from('reports').select('*'),
      supabase.from('listening_rooms').select('*'),
      supabase.from('room_members').select('*'),
      supabase.from('playback_states').select('*'),
      supabase.from('room_activities').select('*'),
      accessToken
        ? supabase.auth.getUser(accessToken)
        : Promise.resolve({ data: { user: null }, error: null }),
    ])

    const users = (usersResult.data ?? []).map(fromDbUser)
    const authUser = authResult.data.user
    const currentUserId =
      authUser?.id && users.some((user) => user.id === authUser.id)
        ? authUser.id
        : users[0]?.id ?? ''
    const currentRole =
      users.find((user) => user.id === currentUserId)?.role ?? 'user'

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
  }
}
