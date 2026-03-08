import { Controller, Get, Query } from '@nestjs/common'
import { MusicService } from './music.service'

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get('search')
  async search(@Query('q') query: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20
    return this.musicService.searchTracks(query, parsedLimit)
  }
}
