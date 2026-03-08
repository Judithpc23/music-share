import { Injectable } from '@nestjs/common'
import type { Genre, Artist, Song } from '@/common/types'
import { supabase } from '../auth/supabase-client'
import { fromDbGenre, fromDbArtist, fromDbSong } from '@/common/utils/mappers'

@Injectable()
export class CatalogService {
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

  async getSongsByGenre(genreId: string): Promise<Song[]> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('genre_id', genreId)
      .order('title', { ascending: true })

    if (error) {
      console.error('Failed to get songs by genre:', error)
      return []
    }

    return (data ?? []).map(fromDbSong)
  }

  async getSongsByArtist(artistId: string): Promise<Song[]> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('artist_id', artistId)
      .order('title', { ascending: true })

    if (error) {
      console.error('Failed to get songs by artist:', error)
      return []
    }

    return (data ?? []).map(fromDbSong)
  }

  async searchSongs(query: string): Promise<Song[]> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('title', { ascending: true })
      .limit(20)

    if (error) {
      console.error('Failed to search songs:', error)
      return []
    }

    return (data ?? []).map(fromDbSong)
  }
}
