import { Injectable } from '@nestjs/common'
import type { Comment, Reaction, FollowStatus } from '@/common/types'
import { supabase } from '../auth/supabase-client'
import { NotificationsService } from './notifications.service'

@Injectable()
export class NotificationsMediator {
  constructor(private readonly notificationsService: NotificationsService) {}

  private async resolveUsername(userId: string): Promise<string | undefined> {
    const { data } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single()

    return data?.username
  }

  async notifyPostCreated(input: {
    postId: string
    authorUserId: string
    mood: string
  }) {
    const actorUsername = await this.resolveUsername(input.authorUserId)
    const { data } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('following_id', input.authorUserId)
      .eq('status', 'accepted')

    const recipientIds = (data ?? []).map((row) => row.follower_id as string)

    await Promise.all(
      recipientIds
        .filter((recipientId) => recipientId !== input.authorUserId)
        .map((recipientId) =>
          this.notificationsService.createNotification({
            userId: recipientId,
            actorUserId: input.authorUserId,
            actorUsername,
            type: 'post',
            targetType: 'post',
            targetId: input.postId,
            metadata: { mood: input.mood },
          })
        )
    )
  }

  async notifyReactionCreated(reaction: Reaction) {
    if (reaction.targetType === 'song') return

    let ownerId: string | null = null
    if (reaction.targetType === 'share') {
      const { data } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', reaction.targetId)
        .single()
      ownerId = data?.user_id ?? null
    }

    if (reaction.targetType === 'comment') {
      const { data } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', reaction.targetId)
        .single()
      ownerId = data?.user_id ?? null
    }

    if (!ownerId || ownerId === reaction.userId) return

    const actorUsername = await this.resolveUsername(reaction.userId)
    await this.notificationsService.createNotification({
      userId: ownerId,
      actorUserId: reaction.userId,
      actorUsername,
      type: 'reaction',
      targetType: reaction.targetType,
      targetId: reaction.targetId,
      metadata: { reactionType: reaction.type },
    })
  }

  async notifyCommentCreated(comment: Comment) {
    const { data } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('post_type', 'share')
      .eq('song_id', comment.songId)
      .eq('status', 'active')

    const recipients = Array.from(
      new Set((data ?? []).map((row) => row.user_id as string))
    ).filter((userId) => userId !== comment.userId)

    const actorUsername = await this.resolveUsername(comment.userId)

    await Promise.all(
      recipients.map((recipientId) =>
        this.notificationsService.createNotification({
          userId: recipientId,
          actorUserId: comment.userId,
          actorUsername,
          type: 'comment',
          targetType: 'comment',
          targetId: comment.id,
          metadata: { songId: comment.songId },
        })
      )
    )
  }

  async notifyFollowRequested(input: {
    followerUserId: string
    targetUserId: string
  }) {
    const actorUsername = await this.resolveUsername(input.followerUserId)
    await this.notificationsService.createNotification({
      userId: input.targetUserId,
      actorUserId: input.followerUserId,
      actorUsername,
      type: 'follow_request',
      targetType: 'follow_request',
      targetId: `${input.followerUserId}:${input.targetUserId}`,
    })
  }

  async notifyFollowStatusChanged(input: {
    followerUserId: string
    targetUserId: string
    status: FollowStatus
  }) {
    if (input.status !== 'accepted') return

    const actorUsername = await this.resolveUsername(input.followerUserId)
    await this.notificationsService.createNotification({
      userId: input.targetUserId,
      actorUserId: input.followerUserId,
      actorUsername,
      type: 'follower',
      targetType: 'profile',
      targetId: input.followerUserId,
    })
  }
}
