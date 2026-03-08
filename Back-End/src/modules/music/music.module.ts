import { Module } from '@nestjs/common'
import { MusicController } from './music.controller'
import { MusicService } from './music.service'
import { SpotifyModule } from '../spotify/spotify.module'
import { DeezerModule } from '../deezer/deezer.module'

@Module({
  imports: [SpotifyModule, DeezerModule],
  controllers: [MusicController],
  providers: [MusicService],
})
export class MusicModule {}
