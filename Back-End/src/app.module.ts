import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
import { EngagementModule } from './modules/engagement/engagement.module'
import { RoomsModule } from './modules/rooms/rooms.module'
import { LookupsModule } from './modules/lookups/lookups.module'
import { CatalogModule } from './modules/catalog/catalog.module'
import { BootstrapModule } from './modules/bootstrap/bootstrap.module'

@Module({
  imports: [
    AuthModule,
    EngagementModule,
    RoomsModule,
    LookupsModule,
    CatalogModule,
    BootstrapModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
