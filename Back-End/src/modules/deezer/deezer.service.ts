import { Injectable, InternalServerErrorException } from '@nestjs/common'

export interface DeezerPreview {
  id: number
  title: string
  artist: string
  previewUrl: string
  link: string
}

type DeezerSearchResponse = {
  data?: Array<{
    id: number
    title: string
    preview: string
    link: string
    artist?: {
      name?: string
    }
  }>
}

@Injectable()
export class DeezerService {
  private readonly apiUrl = 'https://api.deezer.com'

  private mapPreview(row: {
    id: number
    title: string
    preview: string
    link: string
    artist?: { name?: string }
  }): DeezerPreview {
    return {
      id: row.id,
      title: row.title,
      artist: row.artist?.name ?? 'Unknown artist',
      previewUrl: row.preview,
      link: row.link,
    }
  }

  async searchTracks(query: string, limit = 10): Promise<DeezerPreview[]> {
    if (!query.trim()) {
      return []
    }

    const params = new URLSearchParams({
      q: query,
      limit: String(Math.min(Math.max(limit, 1), 25)),
    })

    const response = await fetch(`${this.apiUrl}/search?${params.toString()}`)
    if (!response.ok) {
      const detail = await response.text()
      throw new InternalServerErrorException(
        `Deezer search failed: ${response.status} ${detail}`
      )
    }

    const payload = (await response.json()) as DeezerSearchResponse
    return (payload.data ?? [])
      .filter((row) => Boolean(row.preview))
      .map((row) => this.mapPreview(row))
  }

  async getPreview(trackName: string, artistName?: string): Promise<DeezerPreview | null> {
    const query = [trackName, artistName].filter(Boolean).join(' ').trim()
    const results = await this.searchTracks(query, 5)

    if (results.length === 0) {
      return null
    }

    if (!artistName) {
      return results[0]
    }

    const targetArtist = artistName.toLowerCase()
    const exactArtistMatch = results.find((item) =>
      item.artist.toLowerCase().includes(targetArtist)
    )

    return exactArtistMatch ?? results[0]
  }
}
