"use client"

import { use, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Play, 
  Pause, 
  Users, 
  Music, 
  LogOut, 
  XCircle,
  BadgeCheck,
  Crown,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useApp } from "@/mvc/controllers/store"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow, formatTime } from "@/mvc/controllers/date-utils"

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const playbackInterval = useRef<NodeJS.Timeout | null>(null)
  
  const { 
    getRoomById, 
    getSongById, 
    getArtistById, 
    getGenreById,
    getUserById,
    getRoomMembers,
    getRoomPlaybackState,
    getRoomActivities,
    updatePlaybackState,
    addRoomActivity,
    leaveRoom,
    endRoom,
    currentUserId,
    roomMembers,
    isLoading
  } = useApp()
  
  const room = getRoomById(id)
  const song = room ? getSongById(room.currentSongId) : null
  const artist = song ? getArtistById(song.artistId) : null
  const genre = song ? getGenreById(song.genreId) : null
  const host = room ? getUserById(room.hostUserId) : null
  const members = getRoomMembers(id)
  const playbackState = getRoomPlaybackState(id)
  const activities = getRoomActivities(id)
  
  const isMember = roomMembers.some(m => m.roomId === id && m.userId === currentUserId)
  const isHost = room?.hostUserId === currentUserId

  // Simulate playback time progression
  useEffect(() => {
    if (playbackState?.isPlaying && song) {
      playbackInterval.current = setInterval(() => {
        if (playbackState.positionSeconds < song.duration) {
          updatePlaybackState(id, {
            positionSeconds: playbackState.positionSeconds + 1,
          })
        } else {
          // Song ended, pause
          updatePlaybackState(id, { isPlaying: false, positionSeconds: 0 })
        }
      }, 1000)
    }
    
    return () => {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current)
      }
    }
  }, [playbackState?.isPlaying, playbackState?.positionSeconds, song, id, updatePlaybackState])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!room || room.status === "ended") {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Room Not Found</h1>
        <p className="text-muted-foreground mt-2">
          This room may have ended or does not exist.
        </p>
        <Link href="/rooms">
          <Button className="mt-4">Back to Rooms</Button>
        </Link>
      </div>
    )
  }

  if (!isMember) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Join this Room</h1>
        <p className="text-muted-foreground mt-2">
          You need to join this room to participate.
        </p>
        <Link href="/rooms">
          <Button className="mt-4">Back to Rooms</Button>
        </Link>
      </div>
    )
  }

  const handlePlayPause = async () => {
    const newIsPlaying = !playbackState?.isPlaying
    await updatePlaybackState(id, { isPlaying: newIsPlaying })
    await addRoomActivity(id, newIsPlaying ? "played" : "paused")
  }

  const handleSeek = async (value: number[]) => {
    await updatePlaybackState(id, { positionSeconds: value[0] })
    await addRoomActivity(id, "seeked", `to ${formatTime(value[0])}`)
  }

  const handleLeave = async () => {
    await leaveRoom(id)
    toast({
      title: "Left room",
      description: "You have left the listening room.",
    })
    router.push("/rooms")
  }

  const handleEndRoom = async () => {
    await endRoom(id)
    toast({
      title: "Room ended",
      description: "The listening room has been closed.",
    })
    router.push("/rooms")
  }

  const lastUpdatedByUser = playbackState ? getUserById(playbackState.lastUpdatedBy) : null

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{room.name}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Hosted by {host?.username}
            {isHost && <Badge variant="secondary">You</Badge>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleLeave}>
            <LogOut className="h-4 w-4 mr-2" />
            Leave
          </Button>
          {isHost && (
            <Button variant="destructive" size="sm" onClick={handleEndRoom}>
              <XCircle className="h-4 w-4 mr-2" />
              End Room
            </Button>
          )}
        </div>
      </div>

      {/* Now Playing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Now Playing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-primary/30">{song?.title.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="mb-2">{genre?.name ?? "Unknown Genre"}</Badge>
              <h3 className="text-xl font-semibold truncate">{song?.title}</h3>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>{artist?.name}</span>
                {artist?.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                className="h-14 w-14 rounded-full"
                onClick={handlePlayPause}
              >
                {playbackState?.isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>
              <div className="flex-1">
                <Slider
                  value={[playbackState?.positionSeconds || 0]}
                  min={0}
                  max={song?.duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatTime(playbackState?.positionSeconds || 0)}</span>
                  <span>{formatTime(song?.duration || 0)}</span>
                </div>
              </div>
            </div>
            
            {lastUpdatedByUser && (
              <p className="text-xs text-muted-foreground text-center">
                Last updated by {lastUpdatedByUser.username}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Listening ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {members.map(member => {
                const memberUser = getUserById(member.userId)
                return (
                  <div 
                    key={member.userId}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {memberUser?.username.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium text-sm flex-1">{memberUser?.username}</span>
                    {member.isHost && (
                      <Crown className="h-4 w-4 text-amber-500" />
                    )}
                    {member.userId === currentUserId && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activities.slice(0, 20).map(activity => {
                const activityUser = getUserById(activity.userId)
                let actionText = ""
                switch (activity.action) {
                  case "joined":
                    actionText = "joined the room"
                    break
                  case "left":
                    actionText = "left the room"
                    break
                  case "played":
                    actionText = "pressed play"
                    break
                  case "paused":
                    actionText = "paused playback"
                    break
                  case "seeked":
                    actionText = `seeked ${activity.details || ""}`
                    break
                }
                return (
                  <div 
                    key={activity.id}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="font-medium text-foreground">
                      {activityUser?.username}
                    </span>
                    <span>{actionText}</span>
                    <span className="text-xs ml-auto">
                      {formatDistanceToNow(activity.timestamp)}
                    </span>
                  </div>
                )
              })}
              {activities.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No activity yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
