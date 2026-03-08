"use client"

import React from "react"

import Link from "next/link"
import { Users, Music, Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/mvc/controllers/store"
import type { ListeningRoom } from "@/mvc/models/types"

interface RoomCardProps {
  room: ListeningRoom
}

export function RoomCard({ room }: RoomCardProps) {
  const { getSongById, getArtistById, getUserById, getRoomMembers, getRoomPlaybackState, joinRoom, currentUserId, roomMembers } = useApp()
  
  const song = getSongById(room.currentSongId)
  const artist = song ? getArtistById(song.artistId) : null
  const host = getUserById(room.hostUserId)
  const members = getRoomMembers(room.id)
  const playbackState = getRoomPlaybackState(room.id)
  
  const isMember = roomMembers.some(m => m.roomId === room.id && m.userId === currentUserId)

  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault()
    joinRoom(room.id)
  }

  return (
    <Link href={`/rooms/${room.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{room.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hosted by {host?.username}
              </p>
            </div>
            {playbackState?.isPlaying && (
              <Badge variant="default" className="flex items-center gap-1 shrink-0">
                <Play className="h-3 w-3" />
                Live
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-3 p-2 rounded-md bg-muted/50">
            <Music className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{song?.title}</p>
              <p className="text-xs text-muted-foreground truncate">{artist?.name}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{members.length} listening</span>
            </div>
            {!isMember ? (
              <Button size="sm" onClick={handleJoin}>
                Join
              </Button>
            ) : (
              <Badge variant="secondary">Joined</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
