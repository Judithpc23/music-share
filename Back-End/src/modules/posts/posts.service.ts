import { BadRequestException, Injectable } from '@nestjs/common'
import { SupabaseClient } from '@supabase/supabase-js'
import { PostTemplateFactory } from './patterns/prototype/post-template.factory'
import { MoodType, Post, PostTemplate } from '@/common/types'
import { toDbPost, fromDbPost } from '@/common/utils/mappers'
import { buildId } from '@/common/utils/id-generator'
import { supabase } from '../auth/supabase-client'
import { NotificationsMediator } from '../notifications/notifications.mediator'
import { FollowsService } from '../follows/follows.service'
import { PostOriginator } from './patterns/memento/post-originator'
import { PostCaretaker } from './patterns/memento/post-caretaker'
import { PostMemento } from './patterns/memento/post-memento'

type DbPostVersionRow = {
  id: string
  snapshot: {
    content: string
    mood?: MoodType
    template?: PostTemplate
    songId?: string
    captionText?: string
    status?: 'active' | 'hidden' | 'deleted'
    updatedAt: string
  }
}

@Injectable()
export class PostsService {
  private supabase: SupabaseClient

  constructor(
    private readonly templateFactory: PostTemplateFactory,
    private readonly notificationsMediator: NotificationsMediator,
    private readonly followsService: FollowsService
  ) {
    this.supabase = supabase
  }

  async createPost(
    userId: string,
    input: {
      moodType: MoodType
      songId: string
      text: string
      postType?: 'template' | 'share'
      customizations?: Partial<PostTemplate>
    }
  ): Promise<Post> {
    if (!input.moodType) {
      throw new BadRequestException('moodType is required')
    }

    if (!input.songId?.trim()) {
      throw new BadRequestException('songId is required')
    }

    const effectiveMood = input.moodType
    let template = this.templateFactory.createTemplate(effectiveMood)
    if (input.customizations) {
      template = template.customize(input.customizations)
    }

    const isShare = input.postType === 'share'
    const now = new Date()
    const post: Post = {
      id: buildId('post'),
      userId,
      postType: isShare ? 'share' : 'template',
      content: input.text,
      mood: isShare ? undefined : effectiveMood,
      template: isShare ? undefined : template.getTemplate(),
      songId: input.songId,
      captionText: isShare ? input.text : undefined,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }

    const { error } = await this.supabase.from('posts').insert([toDbPost(post)])
    if (error) {
      console.error('Error creating post:', error)
      throw error
    }

    await this.notificationsMediator.notifyPostCreated({
      postId: post.id,
      authorUserId: post.userId,
      mood: post.mood ?? 'share',
    })

    return post
  }

  async createPostFromTemplate(
    userId: string,
    moodType: MoodType,
    songId: string,
    content: string,
    customizations?: Partial<PostTemplate>
  ): Promise<Post> {
    return this.createPost(userId, {
      moodType,
      songId,
      text: content,
      postType: 'template',
      customizations,
    })
  }

  async getTemplatePreview(
    moodType: MoodType,
    customizations?: Partial<PostTemplate>
  ): Promise<PostTemplate | null> {
    try {
      let template = this.templateFactory.createTemplate(moodType)
      if (customizations) {
        template = template.customize(customizations)
      }
      return template.getTemplate()
    } catch (error) {
      console.error('Error in getTemplatePreview:', error)
      return null
    }
  }

  async getPostById(postId: string): Promise<Post | null> {
    const { data, error } = await this.supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error) {
      console.error('Error fetching post:', error)
      return null
    }

    return fromDbPost(data)
  }

  async getPostsByUserId(
    userId: string,
    viewerUserId?: string
  ): Promise<Post[]> {
    const canView = await this.followsService.canViewUserContent(
      viewerUserId,
      userId
    )
    if (!canView) return []

    const { data, error } = await this.supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user posts:', error)
      return []
    }

    return (data ?? []).map(fromDbPost)
  }

  async getDiscoverPosts(viewerUserId: string): Promise<Post[]> {
    const { data, error } = await this.supabase
      .from('posts')
      .select('*')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching discover posts:', error)
      return []
    }

    const mapped = (data ?? []).map(fromDbPost)
    const visibility = await Promise.all(
      mapped.map((post) =>
        this.followsService.canViewUserContent(viewerUserId, post.userId)
      )
    )
    return mapped.filter((_, index) => visibility[index])
  }

  async getFollowingPosts(viewerUserId: string): Promise<Post[]> {
    const following = await this.followsService.getFollowing(viewerUserId)
    const followingSet = new Set(following.map((item) => item.followingId))
    if (followingSet.size === 0) return []

    const discover = await this.getDiscoverPosts(viewerUserId)
    return discover.filter((post) => followingSet.has(post.userId))
  }

  async updatePost(
    userId: string,
    postId: string,
    input: { text: string; moodType?: MoodType }
  ): Promise<{ success: boolean; post?: Post }> {
    const current = await this.getPostById(postId)
    if (!current || current.userId !== userId) return { success: false }

    const originator = new PostOriginator(current)
    const caretaker = new PostCaretaker()
    caretaker.push(originator.save())

    const previous = caretaker.pop()
    if (previous) {
      const snapshotId = buildId('postv')
      await this.supabase.from('post_versions').insert({
        id: snapshotId,
        post_id: postId,
        snapshot: previous.getState(),
        created_at: new Date().toISOString(),
      })
    }

    let nextTemplate = current.template
    let nextMood = current.mood
    if (current.postType === 'template' && input.moodType) {
      nextMood = input.moodType
      nextTemplate = this.templateFactory.createTemplate(input.moodType).getTemplate()
    }

    const nextContent = input.text
    const { error } = await this.supabase
      .from('posts')
      .update({
        content: nextContent,
        caption_text: current.postType === 'share' ? nextContent : null,
        mood: nextMood ?? null,
        template: nextTemplate ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating post:', error)
      return { success: false }
    }

    const updated = await this.getPostById(postId)
    return { success: !!updated, post: updated ?? undefined }
  }

  async undoLastEdit(
    userId: string,
    postId: string
  ): Promise<{ success: boolean; post?: Post }> {
    const current = await this.getPostById(postId)
    if (!current || current.userId !== userId) return { success: false }

    const { data, error } = await this.supabase
      .from('post_versions')
      .select('id, snapshot')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return { success: false }
    }

    const row = data as DbPostVersionRow
    const originator = new PostOriginator(current)
    const restored = originator.restore(new PostMemento(row.snapshot))

    const { error: restoreError } = await this.supabase
      .from('posts')
      .update({
        content: restored.content,
        caption_text: current.postType === 'share' ? restored.content : restored.captionText ?? null,
        mood: restored.mood ?? null,
        template: restored.template ?? null,
        status: restored.status ?? current.status ?? 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .eq('user_id', userId)

    if (restoreError) {
      console.error('Error undoing post edit:', restoreError)
      return { success: false }
    }

    await this.supabase.from('post_versions').delete().eq('id', row.id)
    const restoredPost = await this.getPostById(postId)
    return { success: !!restoredPost, post: restoredPost ?? undefined }
  }

  async deletePost(userId: string, postId: string): Promise<{ success: boolean }> {
    const { error } = await this.supabase
      .from('posts')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', postId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting post:', error)
      return { success: false }
    }
    return { success: true }
  }

  getAvailableMoods(): MoodType[] {
    return this.templateFactory.getAvailableMoods()
  }
}
