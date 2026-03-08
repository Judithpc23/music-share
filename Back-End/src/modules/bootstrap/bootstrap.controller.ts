import { Controller, Get, Headers } from '@nestjs/common'
import { supabase } from '../auth/supabase-client'
import {
  fromDbArtist,
  fromDbGenre,
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
      authResult,
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('genres').select('*'),
      supabase.from('artists').select('*'),
      supabase.from('songs').select('*'),
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
      currentUserId,
      currentRole,
    }
  }
}
