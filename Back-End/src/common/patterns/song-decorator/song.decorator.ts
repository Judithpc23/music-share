import type {
  DecoratedSong,
  Song,
  SongReactionSummary,
  SongTag,
  SongTagType,
} from '@/common/types'
import { supabase } from '@/modules/auth/supabase-client'

type DbSongTagRow = {
  tag_type: SongTagType
  tag_id: string
  tag_label: string
}

type DbSongReactionSummaryRow = {
  likes: number | null
  loves: number | null
  comments: number | null
  shares: number | null
  total_reactions: number | null
}

abstract class SongComponent {
  abstract build(): Promise<DecoratedSong>
}

class BaseSongComponent extends SongComponent {
  constructor(private readonly song: Song) {
    super()
  }

  async build(): Promise<DecoratedSong> {
    const initialSummary: SongReactionSummary = {
      likes: 0,
      loves: 0,
      comments: 0,
      shares: 0,
      totalReactions: 0,
    }

    return {
      ...this.song,
      tags: [],
      reactionSummary: initialSummary,
    }
  }
}

abstract class SongDecorator extends SongComponent {
  constructor(protected readonly wrapped: SongComponent) {
    super()
  }
}

class SongTagsDecorator extends SongDecorator {
  async build(): Promise<DecoratedSong> {
    const song = await this.wrapped.build()
    const { data, error } = await supabase
      .from('song_tags')
      .select('tag_type, tag_id, tag_label')
      .eq('song_id', song.id)

    if (error) {
      console.error('Failed to decorate song tags:', error)
      return song
    }

    const tags: SongTag[] = (data as DbSongTagRow[] | null | undefined)?.map((row) => ({
      type: row.tag_type,
      id: row.tag_id,
      label: row.tag_label,
    })) ?? []

    return { ...song, tags }
  }
}

class SongReactionsDecorator extends SongDecorator {
  async build(): Promise<DecoratedSong> {
    const song = await this.wrapped.build()
    const { data, error } = await supabase
      .from('song_reaction_summary')
      .select('likes, loves, comments, shares, total_reactions')
      .eq('song_id', song.id)
      .single()

    if (error || !data) {
      if (error) {
        console.error('Failed to decorate song reactions:', error)
      }
      return song
    }

    const row = data as DbSongReactionSummaryRow
    return {
      ...song,
      reactionSummary: {
        likes: row.likes ?? 0,
        loves: row.loves ?? 0,
        comments: row.comments ?? 0,
        shares: row.shares ?? 0,
        totalReactions: row.total_reactions ?? 0,
      },
    }
  }
}

export async function decorateSong(song: Song): Promise<DecoratedSong> {
  const decorated = new SongReactionsDecorator(
    new SongTagsDecorator(new BaseSongComponent(song))
  )
  return decorated.build()
}

export async function decorateSongs(songs: Song[]): Promise<DecoratedSong[]> {
  return Promise.all(songs.map((song) => decorateSong(song)))
}
