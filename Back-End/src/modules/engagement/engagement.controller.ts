import { Controller, Post, Get, Put, Param, Body, Delete } from '@nestjs/common'
import { EngagementService } from './engagement.service'

@Controller('engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Get('reactions/:targetType/:targetId')
  async getReactionsForTarget(
    @Param('targetType') targetType: 'song' | 'share' | 'comment',
    @Param('targetId') targetId: string
  ) {
    return this.engagementService.getReactionsForTarget(targetType, targetId)
  }

  @Get('reactions/user-check/:userId/:targetType/:targetId/:reactionType')
  async hasUserReacted(
    @Param('userId') userId: string,
    @Param('targetType') targetType: 'song' | 'share' | 'comment',
    @Param('targetId') targetId: string,
    @Param('reactionType') reactionType: 'like' | 'love'
  ) {
    const result = await this.engagementService.hasUserReacted(
      userId,
      targetType,
      targetId,
      reactionType
    )
    return { reacted: result }
  }

  @Post('reactions')
  async addReaction(
    @Body() body: {
      userId: string
      targetType: 'song' | 'share' | 'comment'
      targetId: string
      type: 'like' | 'love'
    }
  ) {
    return this.engagementService.addReaction(
      body.userId,
      body.targetType,
      body.targetId,
      body.type
    )
  }

  @Delete('reactions/:reactionId')
  async removeReaction(@Param('reactionId') reactionId: string) {
    return this.engagementService.removeReaction(reactionId)
  }

  @Get('comments/song/:songId')
  async getCommentsForSong(@Param('songId') songId: string) {
    return this.engagementService.getCommentsForSong(songId)
  }

  @Post('comments')
  async addComment(
    @Body() body: {
      userId: string
      songId: string
      content: string
    }
  ) {
    return this.engagementService.addComment(
      body.userId,
      body.songId,
      body.content
    )
  }

  @Put('comments/:commentId/status')
  async updateCommentStatus(
    @Param('commentId') commentId: string,
    @Body() body: { status: 'active' | 'hidden' | 'deleted' }
  ) {
    return this.engagementService.updateCommentStatus(commentId, body.status)
  }

  @Get('shares/user/:userId')
  async getSharesForUser(@Param('userId') userId: string) {
    return this.engagementService.getSharesForUser(userId)
  }

  @Get('shares/song/:songId')
  async getSharesForSong(@Param('songId') songId: string) {
    return this.engagementService.getSharesForSong(songId)
  }

  @Post('shares')
  async addShare(
    @Body() body: {
      userId: string
      songId: string
      captionText: string
      visibility: 'public' | 'friends'
    }
  ) {
    return this.engagementService.addShare(
      body.userId,
      body.songId,
      body.captionText,
      body.visibility
    )
  }

  @Put('shares/:shareId/status')
  async updateShareStatus(
    @Param('shareId') shareId: string,
    @Body() body: { status: 'active' | 'hidden' | 'deleted' }
  ) {
    return this.engagementService.updateShareStatus(shareId, body.status)
  }

  @Post('reports')
  async addReport(
    @Body() body: {
      userId: string
      targetType: 'share' | 'comment'
      targetId: string
      reason: string
    }
  ) {
    return this.engagementService.addReport(
      body.userId,
      body.targetType,
      body.targetId,
      body.reason
    )
  }

  @Put('reports/:reportId/status')
  async updateReportStatus(
    @Param('reportId') reportId: string,
    @Body() body: { status: 'pending' | 'resolved' }
  ) {
    return this.engagementService.updateReportStatus(reportId, body.status)
  }

  @Get('songs/:songId/stats')
  async getSongStats(@Param('songId') songId: string) {
    const [reactionCount, commentCount, shareCount] = await Promise.all([
      this.engagementService.getSongReactionCount(songId),
      this.engagementService.getSongCommentCount(songId),
      this.engagementService.getSongShareCount(songId),
    ])

    return {
      reactionCount,
      commentCount,
      shareCount,
    }
  }

  @Post('debug/simulate-lost-record')
  async simulateLostRecord() {
    return this.engagementService.simulateLostRecord()
  }
}
