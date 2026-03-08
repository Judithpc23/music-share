import { Injectable, InternalServerErrorException } from '@nestjs/common'
import axios from 'axios'

export interface SpotifyTrack {
  id: string
  name: string
  artist: string
  album: string
  imageUrl: string
  duration: number
  popularity: number
  spotifyUrl: string
}

type SpotifyTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

type SpotifySearchResponse = {
  tracks?: {
    items?: Array<{
      id: string
      name: string
      artists: Array<{ name: string }>
      album: { name: string; images: Array<{ url: string }> }
      duration_ms: number
      popularity: number
      external_urls: { spotify: string }
    }>
  }
}

type SpotifyTrackResponse = {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: { name: string; images: Array<{ url: string }> }
  duration_ms: number
  popularity: number
  external_urls: { spotify: string }
}

@Injectable()
export class SpotifyService {
  private accessToken: string | null = null

  private expiresAt = 0

  private readonly authUrl = 'https://accounts.spotify.com/api/token'

  private readonly apiUrl = 'https://api.spotify.com/v1'

  private mapSpotifyTrack(track: SpotifyTrackResponse): SpotifyTrack {
    return {
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name ?? 'Unknown artist',
      album: track.album.name,
      imageUrl: track.album.images[0]?.url ?? '',
      duration: Math.max(1, Math.round(track.duration_ms / 1000)),
      popularity: track.popularity,
      spotifyUrl: track.external_urls.spotify,
    }
  }

  private async getAccessToken() {
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException(
        'Missing Spotify env vars: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET'
      )
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const body = new URLSearchParams({ grant_type: 'client_credentials' })

    const response = await fetch(this.authUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new InternalServerErrorException(
        `Spotify auth failed: ${response.status} ${detail}`
      )
    }

    const token = (await response.json()) as SpotifyTokenResponse
    this.accessToken = token.access_token
    this.expiresAt = Date.now() + Math.max(30, token.expires_in - 30) * 1000

    return this.accessToken
  }

  private normalizeLimit(limit?: number | string): number {
    // If limit is undefined or null, use default
    if (limit === undefined || limit === null) return 20
    
    const parsed =
      typeof limit === 'string' ? Number.parseInt(limit, 10) : Number(limit)

    // Check if parsing resulted in NaN or non-finite number
    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return 20
    
    const intValue = Math.trunc(parsed)
    return Math.min(50, Math.max(1, intValue))
  }

  async searchTracks(query: string, limit?: number | string): Promise<SpotifyTrack[]> {
    const safeLimit = this.normalizeLimit(limit)
    const token = await this.getAccessToken()
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: String(safeLimit),
      market: 'US',
    })

    const response = await fetch(`${this.apiUrl}/search?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new InternalServerErrorException(
        `Spotify search failed: ${response.status} ${detail}`
      )
    }

    const payload = (await response.json()) as SpotifySearchResponse
    const items = payload.tracks?.items ?? []
    return items.map((item) => this.mapSpotifyTrack(item))
  }

  async getTrack(id: string): Promise<SpotifyTrack | null> {
    const token = await this.getAccessToken()
    const response = await fetch(`${this.apiUrl}/tracks/${id}?market=US`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      const detail = await response.text()
      throw new InternalServerErrorException(
        `Spotify track lookup failed: ${response.status} ${detail}`
      )
    }

    const payload = (await response.json()) as SpotifyTrackResponse
    return this.mapSpotifyTrack(payload)
  }

  async getRecommendations(seedTracks: string[], limit?: number | string): Promise<SpotifyTrack[]> {
    const safeLimit = this.normalizeLimit(limit)
    const token = await this.getAccessToken()

    const params = new URLSearchParams({
      seed_tracks: seedTracks.join(','),
      limit: String(safeLimit),
      market: 'ES',
    })

    const response = await fetch(`${this.apiUrl}/recommendations?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new InternalServerErrorException(
        `Spotify recommendations failed: ${response.status} ${detail}`
      )
    }

    const data = await response.json()
    return data.tracks.map((track: any) => this.mapSpotifyTrack(track))
  }
}
