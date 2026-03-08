import { Injectable } from '@nestjs/common'
import type {
  ListeningRoom,
  PlaybackState,
  RoomActivity,
  RoomMember,
} from '@/common/types'
import { supabase } from '../auth/supabase-client'
import {
  toDbListeningRoom,
  toDbPlaybackState,
  toDbRoomActivity,
  toDbRoomMember,
  fromDbListeningRoom,
  fromDbRoomMember,
  fromDbPlaybackState,
  fromDbRoomActivity,
} from '@/common/utils/mappers'
import { buildId } from '@/common/utils/id-generator'

@Injectable()
export class RoomsService {
  async getActiveRooms(): Promise<ListeningRoom[]> {
    const { data, error } = await supabase
      .from('listening_rooms')
      .select('*')
      .eq('status', 'active')

    if (error) {
      console.error('Failed to get active rooms:', error)
      return []
    }

    return (data ?? []).map(fromDbListeningRoom)
  }

  async getRoomById(roomId: string): Promise<ListeningRoom | null> {
    const { data, error } = await supabase
      .from('listening_rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (error) {
      console.error('Failed to get room:', error)
      return null
    }

    return data ? fromDbListeningRoom(data) : null
  }

  async getRoomMembers(roomId: string): Promise<RoomMember[]> {
    const { data, error } = await supabase
      .from('room_members')
      .select('*')
      .eq('room_id', roomId)

    if (error) {
      console.error('Failed to get room members:', error)
      return []
    }

    return (data ?? []).map(fromDbRoomMember)
  }

  async getRoomPlaybackState(roomId: string): Promise<PlaybackState | null> {
    const { data, error } = await supabase
      .from('playback_states')
      .select('*')
      .eq('room_id', roomId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to get playback state:', error)
    }

    return data ? fromDbPlaybackState(data) : null
  }

  async getRoomActivities(roomId: string): Promise<RoomActivity[]> {
    const { data, error } = await supabase
      .from('room_activities')
      .select('*')
      .eq('room_id', roomId)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Failed to get room activities:', error)
      return []
    }

    return (data ?? []).map(fromDbRoomActivity)
  }

  async createRoom(
    userId: string,
    name: string,
    songId: string
  ): Promise<{ success: boolean; roomId?: string }> {
    const roomId = buildId('room')
    const now = new Date().toISOString()

    const newRoom: ListeningRoom = {
      id: roomId,
      name,
      hostUserId: userId,
      currentSongId: songId,
      status: 'active',
      createdAt: now,
    }
    const newMember: RoomMember = {
      roomId,
      userId,
      joinedAt: now,
      isHost: true,
    }
    const newPlayback: PlaybackState = {
      roomId,
      currentSongId: songId,
      isPlaying: false,
      positionSeconds: 0,
      lastUpdatedAt: now,
      lastUpdatedBy: userId,
    }
    const newActivity: RoomActivity = {
      id: buildId('activity'),
      roomId,
      userId,
      action: 'joined',
      timestamp: now,
    }

    const roomInsert = await supabase
      .from('listening_rooms')
      .insert(toDbListeningRoom(newRoom))

    if (roomInsert.error) {
      console.error('Failed to create room:', roomInsert.error)
      return { success: false }
    }

    const [memberResult, playbackResult, activityResult] = await Promise.all([
      supabase.from('room_members').insert(toDbRoomMember(newMember)),
      supabase.from('playback_states').insert(toDbPlaybackState(newPlayback)),
      supabase.from('room_activities').insert(toDbRoomActivity(newActivity)),
    ])

    if (memberResult.error || playbackResult.error || activityResult.error) {
      console.error('Failed to initialize room resources')
      return { success: false }
    }

    return { success: true, roomId }
  }

  async joinRoom(
    roomId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    const alreadyMember = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .limit(1)

    if (alreadyMember.data && alreadyMember.data.length > 0) {
      return { success: false }
    }

    const now = new Date().toISOString()
    const newMember: RoomMember = {
      roomId,
      userId,
      joinedAt: now,
      isHost: false,
    }
    const newActivity: RoomActivity = {
      id: buildId('activity'),
      roomId,
      userId,
      action: 'joined',
      timestamp: now,
    }

    const [memberResult, activityResult] = await Promise.all([
      supabase.from('room_members').insert(toDbRoomMember(newMember)),
      supabase.from('room_activities').insert(toDbRoomActivity(newActivity)),
    ])

    if (memberResult.error || activityResult.error) {
      console.error('Failed to join room')
      return { success: false }
    }

    return { success: true }
  }

  async leaveRoom(
    roomId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    const now = new Date().toISOString()
    const newActivity: RoomActivity = {
      id: buildId('activity'),
      roomId,
      userId,
      action: 'left',
      timestamp: now,
    }

    const [memberDelete, activityInsert] = await Promise.all([
      supabase
        .from('room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId),
      supabase.from('room_activities').insert(toDbRoomActivity(newActivity)),
    ])

    if (memberDelete.error || activityInsert.error) {
      console.error('Failed to leave room')
      return { success: false }
    }

    return { success: true }
  }

  async endRoom(roomId: string): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from('listening_rooms')
      .update({ status: 'ended' })
      .eq('id', roomId)

    if (error) {
      console.error('Failed to end room:', error)
      return { success: false }
    }

    return { success: true }
  }

  async updatePlaybackState(
    roomId: string,
    userId: string,
    updates: Partial<{
      currentSongId: string
      isPlaying: boolean
      positionSeconds: number
    }>
  ): Promise<{ success: boolean }> {
    const now = new Date().toISOString()
    const currentPlayback = await this.getRoomPlaybackState(roomId)

    const latestPlayback: PlaybackState | null = currentPlayback
      ? {
          ...currentPlayback,
          ...updates,
          lastUpdatedAt: now,
          lastUpdatedBy: userId,
        }
      : null

    if (!latestPlayback) {
      return { success: false }
    }

    const { error } = await supabase
      .from('playback_states')
      .upsert(toDbPlaybackState(latestPlayback), { onConflict: 'room_id' })

    if (error) {
      console.error('Failed to update playback state:', error)
      return { success: false }
    }

    return { success: true }
  }

  async addRoomActivity(
    roomId: string,
    userId: string,
    action: RoomActivity['action'],
    details?: string
  ): Promise<{ success: boolean }> {
    const newActivity: RoomActivity = {
      id: buildId('activity'),
      roomId,
      userId,
      action,
      timestamp: new Date().toISOString(),
      details,
    }

    const { error } = await supabase
      .from('room_activities')
      .insert(toDbRoomActivity(newActivity))

    if (error) {
      console.error('Failed to add room activity:', error)
      return { success: false }
    }

    return { success: true }
  }

  async getRoomsPlayingSong(songId: string): Promise<ListeningRoom[]> {
    const { data, error } = await supabase
      .from('listening_rooms')
      .select('*')
      .eq('current_song_id', songId)
      .eq('status', 'active')

    if (error) {
      console.error('Failed to get rooms playing song:', error)
      return []
    }

    return (data ?? []).map(fromDbListeningRoom)
  }
}
