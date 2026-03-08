import { Controller, Get, Param, Query } from '@nestjs/common'
import { SpotifyService } from './spotify.service'

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('search')
  async search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.spotifyService.searchTracks(query, limit)
  }

  @Get('tracks/:id')
  async getTrack(@Param('id') id: string) {
    return this.spotifyService.getTrack(id)
  }
}
