import { Injectable } from '@nestjs/common'
import type { User, Genre, Artist, Song, Share, Comment, ListeningRoom } from '@/common/types'
import { supabase } from '../auth/supabase-client'
import {
  fromDbUser,
  fromDbGenre,
  fromDbArtist,
  fromDbSong,
  fromDbShare,
  fromDbComment,
  fromDbListeningRoom,
} from '@/common/utils/mappers'

@Injectable()
export class LookupsService {
  async getGenreById(id: string): Promise<Genre | null> {
    const { data, error } = await supabase
      .from('genres')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Failed to get genre:', error)
      return null
    }

    return data ? fromDbGenre(data) : null
  }

  async getArtistById(id: string): Promise<Artist | null> {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Failed to get artist:', error)
      return null
    }

    return data ? fromDbArtist(data) : null
  }

  async getSongById(id: string): Promise<Song | null> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Failed to get song:', error)
      return null
    }

    return data ? fromDbSong(data) : null
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Failed to get user:', error)
      return null
    }

    return data ? fromDbUser(data) : null
  }

  async getShareById(id: string): Promise<Share | null> {
    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Failed to get share:', error)
      return null
    }

    return data
      ? {
          id: data.id,
          userId: data.user_id,
          songId: data.song_id,
          captionText: data.caption_text,
          visibility: data.visibility,
          createdAt: data.created_at,
          status: data.status,
        }
      : null
  }

  async getCommentById(id: string): Promise<Comment | null> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Failed to get comment:', error)
      return null
    }

    return data ? fromDbComment(data) : null
  }

  async getRoomById(id: string): Promise<ListeningRoom | null> {
    const { data, error } = await supabase
      .from('listening_rooms')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Failed to get room:', error)
      return null
    }

    return data ? fromDbListeningRoom(data) : null
  }

  async getAllGenres(): Promise<Genre[]> {
    const { data, error } = await supabase
      .from('genres')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Failed to get genres:', error)
      return []
    }

    return (data ?? []).map(fromDbGenre)
  }

  async getAllArtists(): Promise<Artist[]> {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Failed to get artists:', error)
      return []
    }

    return (data ?? []).map(fromDbArtist)
  }

  async getAllSongs(): Promise<Song[]> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('title', { ascending: true })

    if (error) {
      console.error('Failed to get songs:', error)
      return []
    }

    return (data ?? []).map(fromDbSong)
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('username', { ascending: true })

    if (error) {
      console.error('Failed to get users:', error)
      return []
    }

    return (data ?? []).map(fromDbUser)
  }
}
