import { Controller, Post, Get, Put, Param, Body, Delete } from '@nestjs/common'
import { RoomsService } from './rooms.service'

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async getAllRooms() {
    return this.roomsService.getAllRooms()
  }

  @Get('active')
  async getActiveRooms() {
    return this.roomsService.getActiveRooms()
  }

  @Get('members')
  async getAllRoomMembers() {
    return this.roomsService.getAllRoomMembers()
  }

  @Get('playbacks')
  async getAllPlaybackStates() {
    return this.roomsService.getAllPlaybackStates()
  }

  @Get('activities')
  async getAllRoomActivities() {
    return this.roomsService.getAllRoomActivities()
  }

  @Get(':roomId')
  async getRoomById(@Param('roomId') roomId: string) {
    return this.roomsService.getRoomById(roomId)
  }

  @Get(':roomId/members')
  async getRoomMembers(@Param('roomId') roomId: string) {
    return this.roomsService.getRoomMembers(roomId)
  }

  @Get(':roomId/playback')
  async getRoomPlaybackState(@Param('roomId') roomId: string) {
    return this.roomsService.getRoomPlaybackState(roomId)
  }

  @Get(':roomId/activities')
  async getRoomActivities(@Param('roomId') roomId: string) {
    return this.roomsService.getRoomActivities(roomId)
  }

  @Post('create')
  async createRoom(
    @Body() body: {
      roomId?: string
      activityId?: string
      now?: string
      userId: string
      name: string
      songId: string
    }
  ) {
    return this.roomsService.createRoom(body.userId, body.name, body.songId, {
      roomId: body.roomId,
      activityId: body.activityId,
      now: body.now,
    })
  }

  @Post(':roomId/join')
  async joinRoom(
    @Param('roomId') roomId: string,
    @Body() body: { userId: string; activityId?: string; now?: string }
  ) {
    return this.roomsService.joinRoom(roomId, body.userId, {
      activityId: body.activityId,
      now: body.now,
    })
  }

  @Post(':roomId/leave')
  async leaveRoom(
    @Param('roomId') roomId: string,
    @Body() body: { userId: string; activityId?: string; now?: string }
  ) {
    return this.roomsService.leaveRoom(roomId, body.userId, {
      activityId: body.activityId,
      now: body.now,
    })
  }

  @Put(':roomId/end')
  async endRoom(@Param('roomId') roomId: string) {
    return this.roomsService.endRoom(roomId)
  }

  @Put(':roomId/playback')
  async updatePlaybackState(
    @Param('roomId') roomId: string,
    @Body() body: {
      userId: string
      updates: {
        currentSongId?: string
        isPlaying?: boolean
        positionSeconds?: number
      }
    }
  ) {
    return this.roomsService.updatePlaybackState(roomId, body.userId, body.updates)
  }

  @Post(':roomId/activities')
  async addRoomActivity(
    @Param('roomId') roomId: string,
    @Body() body: {
      activityId?: string
      userId: string
      action: 'joined' | 'left' | 'played' | 'paused' | 'seeked'
      details?: string
      timestamp?: string
    }
  ) {
    return this.roomsService.addRoomActivity(
      roomId,
      body.userId,
      body.action,
      body.details,
      { activityId: body.activityId, timestamp: body.timestamp }
    )
  }

  @Get('song/:songId/active')
  async getRoomsPlayingSong(@Param('songId') songId: string) {
    return this.roomsService.getRoomsPlayingSong(songId)
  }
}
