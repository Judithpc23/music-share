import { apiClient } from '@/controllers/api-client'

export interface ExternalTrack {
  id: string
  name: string
  artist: string
  album: string
  imageUrl: string
  duration: number
  popularity: number
  spotifyUrl: string
  previewUrl: string | null
  deezerTrackId: number | null
}

export const musicController = {
  searchTracks(query: string, limit = 20) {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    })
    return apiClient.get<ExternalTrack[]>(`/music/search?${params.toString()}`)
  },
}
