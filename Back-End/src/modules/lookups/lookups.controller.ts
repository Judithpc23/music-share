import { Controller, Get, Param } from '@nestjs/common'
import { LookupsService } from './lookups.service'

@Controller('lookups')
export class LookupsController {
  constructor(private readonly lookupsService: LookupsService) {}

  @Get('genres/:id')
  async getGenreById(@Param('id') id: string) {
    return this.lookupsService.getGenreById(id)
  }

  @Get('generators/:id')
  async getArtistById(@Param('id') id: string) {
    return this.lookupsService.getArtistById(id)
  }

  @Get('songs/:id')
  async getSongById(@Param('id') id: string) {
    return this.lookupsService.getSongById(id)
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.lookupsService.getUserById(id)
  }

  @Get('shares/:id')
  async getShareById(@Param('id') id: string) {
    return this.lookupsService.getShareById(id)
  }

  @Get('comments/:id')
  async getCommentById(@Param('id') id: string) {
    return this.lookupsService.getCommentById(id)
  }

  @Get('rooms/:id')
  async getRoomById(@Param('id') id: string) {
    return this.lookupsService.getRoomById(id)
  }

  @Get('genres')
  async getAllGenres() {
    return this.lookupsService.getAllGenres()
  }

  @Get('artists')
  async getAllArtists() {
    return this.lookupsService.getAllArtists()
  }

  @Get('songs')
  async getAllSongs() {
    return this.lookupsService.getAllSongs()
  }

  @Get('users')
  async getAllUsers() {
    return this.lookupsService.getAllUsers()
  }
}
