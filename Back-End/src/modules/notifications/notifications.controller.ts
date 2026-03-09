import { Controller, Get, Param, Put } from '@nestjs/common'
import { NotificationsService } from './notifications.service'

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('user/:userId')
  async getInbox(@Param('userId') userId: string) {
    return this.notificationsService.getInboxForUser(userId)
  }

  @Put('user/:userId/:notificationId/read')
  async markAsRead(
    @Param('userId') userId: string,
    @Param('notificationId') notificationId: string
  ) {
    return this.notificationsService.markAsRead(userId, notificationId)
  }
}
