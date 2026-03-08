import { Injectable } from '@nestjs/common'
import type {
  Comment,
  ContentStatus,
  Reaction,
  ReactionTargetType,
  ReactionType,
  Report,
  ReportStatus,
  Share,
  ShareVisibility,
} from '@/common/types'
import { supabase } from '../auth/supabase-client'
import {
  toDbComment,
  toDbReaction,
  toDbReport,
  toDbShare,
} from '@/common/utils/mappers'
import { buildId } from '@/common/utils/id-generator'

@Injectable()
export class EngagementService {
  async getAllReactions(): Promise<Reaction[]> {
    const { data, error } = await supabase.from('reactions').select('*')

    if (error) {
      console.error('Failed to get reactions:', error)
      return []
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      targetType: row.target_type,
      targetId: row.target_id,
      userId: row.user_id,
      type: row.type,
      createdAt: row.created_at,
    }))
  }

  async getReactionsForTarget(
    targetType: ReactionTargetType,
    targetId: string
  ): Promise<Reaction[]> {
    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId)

    if (error) {
      console.error('Failed to get reactions:', error)
      return []
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      targetType: row.target_type,
      targetId: row.target_id,
      userId: row.user_id,
      type: row.type,
      createdAt: row.created_at,
    }))
  }

  async hasUserReacted(
    userId: string,
    targetType: ReactionTargetType,
    targetId: string,
    type: ReactionType
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('reactions')
      .select('id')
      .eq('user_id', userId)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('type', type)
      .limit(1)

    if (error) {
      console.error('Failed to check user reaction:', error)
      return false
    }

    return (data ?? []).length > 0
  }

  async addReaction(
    userId: string,
    targetType: ReactionTargetType,
    targetId: string,
    type: ReactionType,
    options?: { id?: string; createdAt?: string }
  ): Promise<{ success: boolean; reaction?: Reaction }> {
    const exists = await this.hasUserReacted(userId, targetType, targetId, type)
    if (exists) {
      return { success: false }
    }

    const newReaction: Reaction = {
      id: options?.id ?? buildId('reaction'),
      targetType,
      targetId,
      userId,
      type,
      createdAt: options?.createdAt ?? new Date().toISOString(),
    }

    const { error } = await supabase
      .from('reactions')
      .insert(toDbReaction(newReaction))

    if (error) {
      console.error('Failed to add reaction:', error)
      return { success: false }
    }

    return { success: true, reaction: newReaction }
  }

  async removeReaction(reactionId: string): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('id', reactionId)

    if (error) {
      console.error('Failed to remove reaction:', error)
      return { success: false }
    }

    return { success: true }
  }

  async getCommentsForSong(songId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('song_id', songId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to get comments:', error)
      return []
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      songId: row.song_id,
      userId: row.user_id,
      content: row.content,
      createdAt: row.created_at,
      status: row.status,
    }))
  }

  async getAllComments(): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to get comments:', error)
      return []
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      songId: row.song_id,
      userId: row.user_id,
      content: row.content,
      createdAt: row.created_at,
      status: row.status,
    }))
  }

  async addComment(
    userId: string,
    songId: string,
    content: string,
    options?: { id?: string; createdAt?: string }
  ): Promise<{ success: boolean; comment?: Comment }> {
    const newComment: Comment = {
      id: options?.id ?? buildId('comment'),
      songId,
      userId,
      content,
      createdAt: options?.createdAt ?? new Date().toISOString(),
      status: 'active',
    }

    const { error } = await supabase
      .from('comments')
      .insert(toDbComment(newComment))

    if (error) {
      console.error('Failed to add comment:', error)
      return { success: false }
    }

    return { success: true, comment: newComment }
  }

  async updateCommentStatus(
    commentId: string,
    status: ContentStatus
  ): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from('comments')
      .update({ status })
      .eq('id', commentId)

    if (error) {
      console.error('Failed to update comment status:', error)
      return { success: false }
    }

    return { success: true }
  }

  async getSharesForUser(userId: string): Promise<Share[]> {
    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to get user shares:', error)
      return []
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      songId: row.song_id,
      captionText: row.caption_text,
      visibility: row.visibility,
      createdAt: row.created_at,
      status: row.status,
    }))
  }

  async getSharesForSong(songId: string): Promise<Share[]> {
    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .eq('song_id', songId)
      .eq('status', 'active')

    if (error) {
      console.error('Failed to get song shares:', error)
      return []
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      songId: row.song_id,
      captionText: row.caption_text,
      visibility: row.visibility,
      createdAt: row.created_at,
      status: row.status,
    }))
  }

  async getAllShares(): Promise<Share[]> {
    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to get shares:', error)
      return []
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      songId: row.song_id,
      captionText: row.caption_text,
      visibility: row.visibility,
      createdAt: row.created_at,
      status: row.status,
    }))
  }

  async addShare(
    userId: string,
    songId: string,
    captionText: string,
    visibility: ShareVisibility,
    options?: { id?: string; createdAt?: string }
  ): Promise<{ success: boolean; share?: Share }> {
    const newShare: Share = {
      id: options?.id ?? buildId('share'),
      userId,
      songId,
      captionText,
      visibility,
      createdAt: options?.createdAt ?? new Date().toISOString(),
      status: 'active',
    }

    const { error } = await supabase
      .from('shares')
      .insert(toDbShare(newShare))

    if (error) {
      console.error('Failed to add share:', error)
      return { success: false }
    }

    return { success: true, share: newShare }
  }

  async updateShareStatus(
    shareId: string,
    status: ContentStatus
  ): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from('shares')
      .update({ status })
      .eq('id', shareId)

    if (error) {
      console.error('Failed to update share status:', error)
      return { success: false }
    }

    return { success: true }
  }

  async addReport(
    userId: string,
    targetType: 'share' | 'comment',
    targetId: string,
    reason: string,
    options?: { id?: string; createdAt?: string }
  ): Promise<{ success: boolean; report?: Report }> {
    const newReport: Report = {
      id: options?.id ?? buildId('report'),
      targetType,
      targetId,
      userId,
      reason,
      createdAt: options?.createdAt ?? new Date().toISOString(),
      status: 'pending',
    }

    const { error } = await supabase
      .from('reports')
      .insert(toDbReport(newReport))

    if (error) {
      console.error('Failed to add report:', error)
      return { success: false }
    }

    return { success: true, report: newReport }
  }

  async getAllReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to get reports:', error)
      return []
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      targetType: row.target_type,
      targetId: row.target_id,
      userId: row.user_id,
      reason: row.reason,
      createdAt: row.created_at,
      status: row.status,
    }))
  }

  async updateReportStatus(
    reportId: string,
    status: ReportStatus
  ): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', reportId)

    if (error) {
      console.error('Failed to update report status:', error)
      return { success: false }
    }

    return { success: true }
  }

  async getSongReactionCount(songId: string): Promise<number> {
    const { count, error } = await supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .eq('target_type', 'song')
      .eq('target_id', songId)

    if (error) {
      console.error('Failed to count reactions:', error)
      return 0
    }

    return count ?? 0
  }

  async getSongCommentCount(songId: string): Promise<number> {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('song_id', songId)
      .eq('status', 'active')

    if (error) {
      console.error('Failed to count comments:', error)
      return 0
    }

    return count ?? 0
  }

  async getSongShareCount(songId: string): Promise<number> {
    const { count, error } = await supabase
      .from('shares')
      .select('*', { count: 'exact', head: true })
      .eq('song_id', songId)
      .eq('status', 'active')

    if (error) {
      console.error('Failed to count shares:', error)
      return 0
    }

    return count ?? 0
  }

  async simulateLostRecord(commentId?: string): Promise<{ success: boolean; deletedCommentId?: string }> {
    if (commentId) {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) {
        console.error('Failed to simulate lost record:', error)
        return { success: false }
      }

      return { success: true, deletedCommentId: commentId }
    }

    const { data, error } = await supabase
      .from('comments')
      .select('id')
      .eq('status', 'active')
      .limit(1)

    if (error || !data || data.length === 0) {
      return { success: false }
    }

    // Select a random active comment if multiple
    const allComments = await supabase
      .from('comments')
      .select('id')
      .eq('status', 'active')

    if (!allComments.data || allComments.data.length === 0) {
      return { success: false }
    }

    const randomComment =
      allComments.data[
        Math.floor(Math.random() * allComments.data.length)
      ]
    const commentId = randomComment.id

    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (deleteError) {
      console.error('Failed to simulate lost record:', deleteError)
      return { success: false }
    }

    return { success: true, deletedCommentId: commentId }
  }
}
