import { Controller, Get, Query } from '@nestjs/common'
import { DeezerService } from './deezer.service'

@Controller('deezer')
export class DeezerController {
  constructor(private readonly deezerService: DeezerService) {}

  @Get('search')
  async search(@Query('q') query: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10
    return this.deezerService.searchTracks(query, parsedLimit)
  }

  @Get('preview')
  async getPreview(@Query('track') track: string, @Query('artist') artist?: string) {
    if (!track) {
      return null
    }
    return this.deezerService.getPreview(track, artist)
  }
}
