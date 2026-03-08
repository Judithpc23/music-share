import { Injectable } from '@nestjs/common'
import type { User } from '@/common/types'
import type { ProfilePrivacy } from '@/common/types'
import { supabase } from './supabase-client'
import { toDbUser } from '@/common/utils/mappers'

type SignUpInput = {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
  bio: string
  privacity: ProfilePrivacy
  mood: string
  img?: string
  favoriteGenres: string[]
  favoriteSong?: string
}

type AuthCatalogs = {
  genres: Array<{ id: string; name: string }>
  songs: Array<{ id: string; title: string }>
}

@Injectable()
export class AuthService {
  async getCurrentSession(accessToken?: string) {
    if (!accessToken) {
      return { data: { session: null }, error: null }
    }

    const { data, error } = await supabase.auth.getUser(accessToken)
    if (error || !data.user) {
      return { data: { session: null }, error: error?.message ?? 'Invalid session' }
    }

    return {
      data: {
        session: {
          access_token: accessToken,
          user: data.user,
        },
      },
      error: null,
    }
  }

  async getCurrentUser(accessToken?: string) {
    if (!accessToken) {
      return { data: { user: null }, error: null }
    }

    const { data, error } = await supabase.auth.getUser(accessToken)
    if (error) {
      return { data: { user: null }, error: error.message }
    }

    return { data, error: null }
  }

  async signOutUser() {
    return { error: null }
  }

  async signInWithEmailPassword(email: string, password: string) {
    const result = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (result.error) {
      return { data: null, error: result.error.message }
    }

    return {
      data: {
        session: result.data.session,
        user: result.data.user,
      },
      error: null,
    }
  }

  async loadAuthCatalogs(): Promise<{ data: AuthCatalogs; error: string | null }> {
    const [genresResult, songsResult] = await Promise.all([
      supabase
        .from('genres')
        .select('id, name')
        .order('name', { ascending: true }),
      supabase
        .from('songs')
        .select('id, title')
        .order('title', { ascending: true }),
    ])

    if (genresResult.error) {
      return { data: { genres: [], songs: [] }, error: genresResult.error.message }
    }

    if (songsResult.error) {
      return { data: { genres: [], songs: [] }, error: songsResult.error.message }
    }

    return {
      data: {
        genres: (genresResult.data ?? []) as Array<{ id: string; name: string }>,
        songs: (songsResult.data ?? []) as Array<{ id: string; title: string }>,
      },
      error: null,
    }
  }

  async registerWithEmailPassword(input: SignUpInput): Promise<{
    error: string | null
    requiresEmailVerification: boolean
  }> {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        data: {
          username: input.username,
          first_name: input.firstName,
          last_name: input.lastName,
        },
      },
    })

    if (error) {
      return { error: error.message, requiresEmailVerification: false }
    }

    const createdUser = data.user
    if (createdUser) {
      const profile: User = {
        id: createdUser.id,
        username: input.username,
        email: input.email.trim().toLowerCase(),
        role: 'user',
        bio: input.bio.trim(),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        privacity: input.privacity,
        img: input.img?.trim() || undefined,
        favGenres: input.favoriteGenres[0] || undefined,
        favSong: input.favoriteSong || undefined,
        mood: input.mood.trim(),
      }

      const { error: profileError } = await supabase
        .from('users')
        .upsert(toDbUser(profile))
      if (profileError) {
        return { error: profileError.message, requiresEmailVerification: false }
      }

      if (input.favoriteGenres.length > 0) {
        const favoriteGenresRows = input.favoriteGenres.map((genreId) => ({
          user_id: createdUser.id,
          genre_id: genreId,
        }))

        const { error: favoriteGenresError } = await supabase
          .from('user_favorite_genres')
          .upsert(favoriteGenresRows)

        if (favoriteGenresError) {
          return { error: favoriteGenresError.message, requiresEmailVerification: false }
        }
      }
    }

    return { error: null, requiresEmailVerification: !data.session }
  }
}
