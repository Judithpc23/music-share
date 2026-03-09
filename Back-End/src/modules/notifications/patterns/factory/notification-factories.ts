import type { AppNotification } from '@/common/types'
import {
  NotificationBuildInput,
  NotificationFactoryMethod,
} from './notification-factory.abstract'

const baseNotification = (
  input: NotificationBuildInput,
  title: string,
  body: string
): AppNotification => ({
  id: input.id,
  userId: input.userId,
  actorUserId: input.actorUserId,
  type: input.type,
  title,
  body,
  targetType: input.targetType,
  targetId: input.targetId,
  isRead: false,
  metadata: input.metadata ?? {},
  createdAt: input.createdAt,
})

export class PostNotificationFactory extends NotificationFactoryMethod {
  readonly type = 'post' as const

  create(input: NotificationBuildInput): AppNotification {
    const actor = input.actorUsername ?? 'Alguien'
    return baseNotification(
      input,
      'Nuevo post',
      `${actor} publicó una nueva actualización.`
    )
  }
}

export class ReactionNotificationFactory extends NotificationFactoryMethod {
  readonly type = 'reaction' as const

  create(input: NotificationBuildInput): AppNotification {
    const actor = input.actorUsername ?? 'Alguien'
    return baseNotification(
      input,
      'Nueva reacción',
      `${actor} reaccionó a una de tus publicaciones.`
    )
  }
}

export class CommentNotificationFactory extends NotificationFactoryMethod {
  readonly type = 'comment' as const

  create(input: NotificationBuildInput): AppNotification {
    const actor = input.actorUsername ?? 'Alguien'
    return baseNotification(
      input,
      'Nuevo comentario',
      `${actor} comentó una de tus publicaciones.`
    )
  }
}

export class FollowRequestNotificationFactory extends NotificationFactoryMethod {
  readonly type = 'follow_request' as const

  create(input: NotificationBuildInput): AppNotification {
    const actor = input.actorUsername ?? 'Alguien'
    return baseNotification(
      input,
      'Solicitud de seguimiento',
      `${actor} quiere seguir tu perfil privado.`
    )
  }
}

export class FollowerNotificationFactory extends NotificationFactoryMethod {
  readonly type = 'follower' as const

  create(input: NotificationBuildInput): AppNotification {
    const actor = input.actorUsername ?? 'Alguien'
    return baseNotification(
      input,
      'Nuevo seguidor',
      `${actor} ahora te sigue.`
    )
  }
}
