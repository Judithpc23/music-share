import { Module } from '@nestjs/common'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { NotificationsMediator } from './notifications.mediator'
import { NotificationFactoryRegistry } from './patterns/factory/notification-factory.registry'

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsMediator,
    NotificationFactoryRegistry,
  ],
  exports: [NotificationsService, NotificationsMediator],
})
export class NotificationsModule {}
