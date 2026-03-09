import { Injectable } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { PostTemplateFactory } from './patterns/prototype/post-template.factory'
import { MoodType, Post, PostTemplate } from '@/common/types'
import { toDbPost, fromDbPost } from '@/common/utils/mappers'
import { buildId } from '@/common/utils/id-generator'

/**
 * Posts service for managing posts with prototype pattern templates
 * Handles CRUD operations and template-based post creation
 */
@Injectable()
export class PostsService {
  private supabase: SupabaseClient

  constructor(private readonly templateFactory: PostTemplateFactory) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || ''
    )
  }

  /**
   * Creates a post from template
   * @param userId - User ID creating the post
   * @param moodType - Mood type for template
   * @param content - Post content
   * @param customizations - Optional template customizations
   * @returns Created post
   */
  async createPostFromTemplate(
    userId: string,
    moodType: MoodType,
    content: string,
    customizations?: Partial<PostTemplate>
  ): Promise<Post> {
    try {
      let template = this.templateFactory.createTemplate(moodType)

      if (customizations) {
        template = template.customize(customizations)
      }

      const post: Post = {
        id: buildId('post'),
        userId,
        content,
        mood: moodType,
        template: template.getTemplate(),
        createdAt: new Date(),
      }

      const { error } = await this.supabase
        .from('posts')
        .insert([toDbPost(post)])

      if (error) {
        console.error('Error creating post:', error)
        throw error
      }

      return post
    } catch (error) {
      console.error('Error in createPostFromTemplate:', error)
      throw error
    }
  }

  /**
   * Get template preview
   * @param moodType - Mood type
   * @param customizations - Optional customizations
   * @returns Template preview
   */
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

  /**
   * Get post by ID
   * @param postId - Post ID
   * @returns Post or null if not found
   */
  async getPostById(postId: string): Promise<Post | null> {
    try {
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
    } catch (error) {
      console.error('Error in getPostById:', error)
      return null
    }
  }

  /**
   * Get all posts for a user
   * @param userId - User ID
   * @returns Array of posts
   */
  async getPostsByUserId(userId: string): Promise<Post[]> {
    try {
      const { data, error } = await this.supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user posts:', error)
        return []
      }

      return data.map(fromDbPost)
    } catch (error) {
      console.error('Error in getPostsByUserId:', error)
      return []
    }
  }

  /**
   * Get all posts (feed)
   * @param limit - Number of posts to return
   * @param offset - Pagination offset
   * @returns Array of posts
   */
  async getAllPosts(limit: number = 50, offset: number = 0): Promise<Post[]> {
    try {
      const { data, error } = await this.supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching posts:', error)
        return []
      }

      return data.map(fromDbPost)
    } catch (error) {
      console.error('Error in getAllPosts:', error)
      return []
    }
  }

  /**
   * Get available mood types
   * @returns Array of mood types
   */
  getAvailableMoods(): MoodType[] {
    return this.templateFactory.getAvailableMoods()
  }
}
