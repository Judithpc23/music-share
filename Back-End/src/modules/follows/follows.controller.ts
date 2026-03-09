import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { FollowsService } from './follows.service'

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':targetUserId/request')
  async requestFollow(
    @Param('targetUserId') targetUserId: string,
    @Body() body: { actorUserId: string }
  ) {
    return this.followsService.requestFollow(body.actorUserId, targetUserId)
  }

  @Post(':followerUserId/accept')
  async acceptFollowRequest(
    @Param('followerUserId') followerUserId: string,
    @Body() body: { actorUserId: string }
  ) {
    return this.followsService.respondToFollowRequest(
      body.actorUserId,
      followerUserId,
      'accepted'
    )
  }

  @Post(':followerUserId/reject')
  async rejectFollowRequest(
    @Param('followerUserId') followerUserId: string,
    @Body() body: { actorUserId: string }
  ) {
    return this.followsService.respondToFollowRequest(
      body.actorUserId,
      followerUserId,
      'rejected'
    )
  }

  @Post(':targetUserId/unfollow')
  async unfollow(
    @Param('targetUserId') targetUserId: string,
    @Body() body: { actorUserId: string }
  ) {
    return this.followsService.unfollow(body.actorUserId, targetUserId)
  }

  @Get(':userId/followers')
  async getFollowers(@Param('userId') userId: string) {
    return this.followsService.getFollowers(userId)
  }

  @Get(':userId/following')
  async getFollowing(@Param('userId') userId: string) {
    return this.followsService.getFollowing(userId)
  }

  @Get(':viewerUserId/status/:targetUserId')
  async getStatus(
    @Param('viewerUserId') viewerUserId: string,
    @Param('targetUserId') targetUserId: string
  ) {
    return this.followsService.getStatus(viewerUserId, targetUserId)
  }
}
