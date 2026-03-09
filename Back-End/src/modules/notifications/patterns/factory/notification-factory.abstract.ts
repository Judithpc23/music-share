import type {
  AppNotification,
  NotificationTargetType,
  NotificationType,
} from '@/common/types'

export type NotificationBuildInput = {
  id: string
  userId: string
  actorUserId: string
  type: NotificationType
  actorUsername?: string
  targetType?: NotificationTargetType
  targetId?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export abstract class NotificationFactoryMethod {
  abstract readonly type: NotificationType

  abstract create(input: NotificationBuildInput): AppNotification
}
