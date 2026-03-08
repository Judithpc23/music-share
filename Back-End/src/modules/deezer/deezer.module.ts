import { Module } from '@nestjs/common'
import { DeezerService } from './deezer.service'
import { DeezerController } from './deezer.controller'

@Module({
  controllers: [DeezerController],
  providers: [DeezerService],
  exports: [DeezerService],
})
export class DeezerModule {}
