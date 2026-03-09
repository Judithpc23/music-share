import { Body, Controller, Get, Param, Post } from '@nestjs/common'
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
      moodType: MoodType
      content: string
      customizations?: Partial<PostTemplate>
    }
  ) {
    return this.postsService.createPostFromTemplate(
      body.userId,
      body.moodType,
      body.content,
      body.customizations
    )
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

  @Get('user/:userId')
  async getPostsByUser(@Param('userId') userId: string) {
    return this.postsService.getPostsByUserId(userId)
  }
}
