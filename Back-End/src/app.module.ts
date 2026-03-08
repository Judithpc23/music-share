import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
import { EngagementModule } from './modules/engagement/engagement.module'
import { RoomsModule } from './modules/rooms/rooms.module'
import { LookupsModule } from './modules/lookups/lookups.module'
import { CatalogModule } from './modules/catalog/catalog.module'
import { BootstrapModule } from './modules/bootstrap/bootstrap.module'
import { SpotifyModule } from './modules/spotify/spotify.module'
import { DeezerModule } from './modules/deezer/deezer.module'
import { MusicModule } from './modules/music/music.module'

@Module({
  imports: [
    AuthModule,
    EngagementModule,
    RoomsModule,
    LookupsModule,
    CatalogModule,
    BootstrapModule,
    SpotifyModule,
    DeezerModule,
    MusicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
