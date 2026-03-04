"use client"

import Link from "next/link"
import { Heart, MessageCircle, Share2, BadgeCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/store"

interface SongCardProps {
  songId: string
  showMetrics?: boolean
}

export function SongCard({ songId, showMetrics = true }: SongCardProps) {
  const { getSongById, getArtistById, getSongReactionCount, getSongCommentCount } = useApp()
  
  const song = getSongById(songId)
  if (!song) return null
  
  const artist = getArtistById(song.artistId)
  const reactionCount = getSongReactionCount(songId)
  const commentCount = getSongCommentCount(songId)

  return (
    <Link href={`/song/${songId}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer">
        <div className="aspect-square relative bg-muted">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="text-4xl font-bold text-primary/30">{song.title.charAt(0)}</div>
          </div>
          <Badge className="absolute top-2 right-2" variant="secondary">
            {song.genre}
          </Badge>
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm truncate">{song.title}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <span className="truncate">{artist?.name}</span>
            {artist?.verified && <BadgeCheck className="h-3 w-3 text-primary" />}
          </div>
          {showMetrics && (
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {reactionCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {commentCount}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
