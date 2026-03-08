import { Injectable } from '@nestjs/common'
import { SpotifyService, type SpotifyTrack } from '../spotify/spotify.service'
import { DeezerService } from '../deezer/deezer.service'

export type HybridTrack = SpotifyTrack & {
  previewUrl: string | null
  deezerTrackId: number | null
}

@Injectable()
export class MusicService {
  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly deezerService: DeezerService
  ) {}

  async searchTracks(query: string, limit = 20): Promise<HybridTrack[]> {
    const spotifyData = await this.spotifyService.searchTracks(query, limit)

    const enriched = await Promise.all(
      spotifyData.map(async (item) => {
        try {
          const deezerPreview = await this.deezerService.getPreview(
            item.name,
            item.artist
          )

          return {
            ...item,
            previewUrl: deezerPreview?.previewUrl ?? null,
            deezerTrackId: deezerPreview?.id ?? null,
          }
        } catch {
          return {
            ...item,
            previewUrl: null,
            deezerTrackId: null,
          }
        }
      })
    )

    return enriched
  }
}
