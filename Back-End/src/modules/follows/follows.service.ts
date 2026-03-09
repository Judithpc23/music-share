import { Injectable } from '@nestjs/common'
import type { Follow, FollowStatus } from '@/common/types'
import { supabase } from '../auth/supabase-client'
import { NotificationsMediator } from '../notifications/notifications.mediator'

type DbFollow = {
  follower_id: string
  following_id: string
  status: FollowStatus
  created_at: string
  responded_at: string | null
}

const fromDbFollow = (row: DbFollow): Follow => ({
  followerId: row.follower_id,
  followingId: row.following_id,
  status: row.status,
  createdAt: row.created_at,
  respondedAt: row.responded_at ?? undefined,
})

@Injectable()
export class FollowsService {
  constructor(private readonly notificationsMediator: NotificationsMediator) {}

  async getRelationship(
    followerId: string,
    followingId: string
  ): Promise<Follow | null> {
    const { data, error } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle()

    if (error) {
      console.error('Failed to get follow relationship:', error)
      return null
    }

    return data ? fromDbFollow(data as DbFollow) : null
  }

  async canViewUserContent(
    viewerUserId: string | undefined,
    targetUserId: string
  ): Promise<boolean> {
    if (!viewerUserId) return false
    if (viewerUserId === targetUserId) return true

    const { data: targetUser } = await supabase
      .from('users')
      .select('privacity')
      .eq('id', targetUserId)
      .single()

    if (!targetUser || targetUser.privacity === 'public') return true

    const relationship = await this.getRelationship(viewerUserId, targetUserId)
    return relationship?.status === 'accepted'
  }

  async requestFollow(
    followerId: string,
    followingId: string
  ): Promise<{ success: boolean; status?: FollowStatus }> {
    if (followerId === followingId) {
      return { success: false }
    }

    const { data: targetUser } = await supabase
      .from('users')
      .select('privacity')
      .eq('id', followingId)
      .single()

    if (!targetUser) {
      return { success: false }
    }

    const nextStatus: FollowStatus =
      targetUser.privacity === 'private' ? 'pending' : 'accepted'

    const { error } = await supabase.from('user_follows').upsert({
      follower_id: followerId,
      following_id: followingId,
      status: nextStatus,
      created_at: new Date().toISOString(),
      responded_at: nextStatus === 'accepted' ? new Date().toISOString() : null,
    })

    if (error) {
      console.error('Failed to request follow:', error)
      return { success: false }
    }

    if (nextStatus === 'pending') {
      await this.notificationsMediator.notifyFollowRequested({
        followerUserId: followerId,
        targetUserId: followingId,
      })
    }

    if (nextStatus === 'accepted') {
      await this.notificationsMediator.notifyFollowStatusChanged({
        followerUserId: followerId,
        targetUserId: followingId,
        status: 'accepted',
      })
    }

    return { success: true, status: nextStatus }
  }

  async respondToFollowRequest(
    ownerUserId: string,
    followerId: string,
    status: 'accepted' | 'rejected'
  ): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from('user_follows')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('follower_id', followerId)
      .eq('following_id', ownerUserId)
      .eq('status', 'pending')

    if (error) {
      console.error('Failed to respond follow request:', error)
      return { success: false }
    }

    await this.notificationsMediator.notifyFollowStatusChanged({
      followerUserId: followerId,
      targetUserId: ownerUserId,
      status,
    })

    return { success: true }
  }

  async unfollow(
    followerId: string,
    followingId: string
  ): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)

    if (error) {
      console.error('Failed to unfollow:', error)
      return { success: false }
    }

    return { success: true }
  }

  async getFollowers(userId: string): Promise<Follow[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select('*')
      .eq('following_id', userId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to get followers:', error)
      return []
    }

    return (data ?? []).map((row) => fromDbFollow(row as DbFollow))
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', userId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to get following:', error)
      return []
    }

    return (data ?? []).map((row) => fromDbFollow(row as DbFollow))
  }

  async getStatus(viewerUserId: string, targetUserId: string) {
    const { data: targetUser } = await supabase
      .from('users')
      .select('privacity')
      .eq('id', targetUserId)
      .single()

    const relationship =
      viewerUserId === targetUserId
        ? null
        : await this.getRelationship(viewerUserId, targetUserId)

    const canView = await this.canViewUserContent(viewerUserId, targetUserId)

    return {
      canView,
      isPrivate: targetUser?.privacity === 'private',
      isFollowing: relationship?.status === 'accepted',
      requestPending: relationship?.status === 'pending',
      status: relationship?.status ?? null,
    }
  }
}
