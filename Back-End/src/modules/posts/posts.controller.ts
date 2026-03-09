import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { PostsService } from './posts.service'
import { MoodType, PostTemplate } from '@/common/types'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async createPost(
    @Body()
    body: {
      userId: string
      postType?: 'template' | 'share'
      moodType: MoodType
      songId: string
      text: string
      customizations?: Partial<PostTemplate>
    }
  ) {
    return this.postsService.createPost(body.userId, {
      postType: body.postType,
      moodType: body.moodType,
      songId: body.songId,
      text: body.text,
      customizations: body.customizations,
    })
  }

  @Get('discover/:viewerUserId')
  async getDiscoverPosts(@Param('viewerUserId') viewerUserId: string) {
    return this.postsService.getDiscoverPosts(viewerUserId)
  }

  @Get('following/:viewerUserId')
  async getFollowingPosts(@Param('viewerUserId') viewerUserId: string) {
    return this.postsService.getFollowingPosts(viewerUserId)
  }

  @Get('user/:userId')
  async getPostsByUser(
    @Param('userId') userId: string,
    @Query('viewerUserId') viewerUserId?: string
  ) {
    return this.postsService.getPostsByUserId(userId, viewerUserId)
  }

  @Put(':postId')
  async updatePost(
    @Param('postId') postId: string,
    @Body() body: { userId: string; text: string; moodType?: MoodType }
  ) {
    return this.postsService.updatePost(body.userId, postId, {
      text: body.text,
      moodType: body.moodType,
    })
  }

  @Post(':postId/undo')
  async undoPost(
    @Param('postId') postId: string,
    @Body() body: { userId: string }
  ) {
    return this.postsService.undoLastEdit(body.userId, postId)
  }

  @Post(':postId/delete')
  async deletePost(
    @Param('postId') postId: string,
    @Body() body: { userId: string }
  ) {
    return this.postsService.deletePost(body.userId, postId)
  }

  @Get('moods')
  getAvailableMoods() {
    return this.postsService.getAvailableMoods()
  }

  @Post('preview')
  async previewTemplate(
    @Body() body: { moodType: MoodType; customizations?: Partial<PostTemplate> }
  ) {
    return this.postsService.getTemplatePreview(
      body.moodType,
      body.customizations
    )
  }

  @Get(':postId')
  async getPostById(@Param('postId') postId: string) {
    return this.postsService.getPostById(postId)
  }
}
