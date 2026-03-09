import { Module } from '@nestjs/common'
import { PostsService } from './posts.service'
import { PostsController } from './posts.controller'
import { PostTemplateFactory } from './patterns/prototype/post-template.factory'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [NotificationsModule],
  controllers: [PostsController],
  providers: [PostsService, PostTemplateFactory],
  exports: [PostsService, PostTemplateFactory],
})
export class PostsModule {}
