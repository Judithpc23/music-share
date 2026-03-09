import { Injectable } from '@nestjs/common'
import type { AppNotification, NotificationTargetType, NotificationType } from '@/common/types'
import { supabase } from '../auth/supabase-client'
import { buildId } from '@/common/utils/id-generator'
import { NotificationFactoryRegistry } from './patterns/factory/notification-factory.registry'

type CreateNotificationInput = {
  userId: string
  actorUserId: string
  actorUsername?: string
  type: NotificationType
  targetType?: NotificationTargetType
  targetId?: string
  metadata?: Record<string, unknown>
}

type DbNotification = {
  id: string
  user_id: string
  actor_user_id: string
  type: NotificationType
  title: string
  body: string
  target_type: NotificationTargetType | null
  target_id: string | null
  is_read: boolean
  metadata: Record<string, unknown> | null
  created_at: string
}

const fromDbNotification = (row: DbNotification): AppNotification => ({
  id: row.id,
  userId: row.user_id,
  actorUserId: row.actor_user_id,
  type: row.type,
  title: row.title,
  body: row.body,
  targetType: row.target_type ?? undefined,
  targetId: row.target_id ?? undefined,
  isRead: row.is_read,
  metadata: row.metadata ?? {},
  createdAt: row.created_at,
})

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationFactoryRegistry: NotificationFactoryRegistry
  ) {}

  async createNotification(input: CreateNotificationInput): Promise<AppNotification | null> {
    const createdAt = new Date().toISOString()
    const notificationId = buildId('notif')
    const notification = this.notificationFactoryRegistry.create({
      id: notificationId,
      userId: input.userId,
      actorUserId: input.actorUserId,
      actorUsername: input.actorUsername,
      type: input.type,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata,
      createdAt,
    })

    const { error } = await supabase.from('notifications').insert({
      id: notification.id,
      user_id: notification.userId,
      actor_user_id: notification.actorUserId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      target_type: notification.targetType ?? null,
      target_id: notification.targetId ?? null,
      is_read: notification.isRead,
      metadata: notification.metadata,
      created_at: notification.createdAt,
    })

    if (error) {
      console.error('Failed to create notification:', error)
      return null
    }

    return notification
  }

  async getInboxForUser(userId: string): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to get inbox notifications:', error)
      return []
    }

    return (data ?? []).map((row) => fromDbNotification(row as DbNotification))
  }

  async markAsRead(userId: string, notificationId: string): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to mark notification as read:', error)
      return { success: false }
    }

    return { success: true }
  }
}
