import { Module } from '@nestjs/common'
import { EngagementController } from './engagement.controller'
import { EngagementService } from './engagement.service'
import { NotificationsModule } from '../notifications/notifications.module'
import { FollowsModule } from '../follows/follows.module'

@Module({
  imports: [NotificationsModule, FollowsModule],
  controllers: [EngagementController],
  providers: [EngagementService],
})
export class EngagementModule {}
