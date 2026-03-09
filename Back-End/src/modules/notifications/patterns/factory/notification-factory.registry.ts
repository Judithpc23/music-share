import { Injectable } from '@nestjs/common'
import type { NotificationType } from '@/common/types'
import {
  NotificationFactoryMethod,
  type NotificationBuildInput,
} from './notification-factory.abstract'
import {
  CommentNotificationFactory,
  FollowRequestNotificationFactory,
  FollowerNotificationFactory,
  PostNotificationFactory,
  ReactionNotificationFactory,
} from './notification-factories'

@Injectable()
export class NotificationFactoryRegistry {
  private readonly factories: Map<NotificationType, NotificationFactoryMethod>

  constructor() {
    const instances: NotificationFactoryMethod[] = [
      new PostNotificationFactory(),
      new ReactionNotificationFactory(),
      new CommentNotificationFactory(),
      new FollowRequestNotificationFactory(),
      new FollowerNotificationFactory(),
    ]

    this.factories = new Map(instances.map((factory) => [factory.type, factory]))
  }

  create(input: NotificationBuildInput) {
    const factory = this.factories.get(input.type)
    if (!factory) {
      throw new Error(`Notification type "${input.type}" is not supported`)
    }
    return factory.create(input)
  }
}
