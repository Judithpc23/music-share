import { Controller, Get, Param, Query } from '@nestjs/common'
import { CatalogService } from './catalog.service'

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('genres')
  async getAllGenres() {
    return this.catalogService.getAllGenres()
  }

  @Get('genres/:id')
  async getGenreById(@Param('id') id: string) {
    return this.catalogService.getGenreById(id)
  }

  @Get('artists')
  async getAllArtists() {
    return this.catalogService.getAllArtists()
  }

  @Get('artists/:id')
  async getArtistById(@Param('id') id: string) {
    return this.catalogService.getArtistById(id)
  }

  @Get('songs')
  async getAllSongs() {
    return this.catalogService.getAllSongs()
  }

  @Get('songs/:id')
  async getSongById(@Param('id') id: string) {
    return this.catalogService.getSongById(id)
  }

  @Get('songs/by-genre/:genreId')
  async getSongsByGenre(@Param('genreId') genreId: string) {
    return this.catalogService.getSongsByGenre(genreId)
  }

  @Get('songs/by-artist/:artistId')
  async getSongsByArtist(@Param('artistId') artistId: string) {
    return this.catalogService.getSongsByArtist(artistId)
  }

  @Get('search')
  async searchSongs(@Query('q') query: string) {
    if (!query) {
      return []
    }
    return this.catalogService.searchSongs(query)
  }
}
