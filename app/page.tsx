"use client"

import { TrendingUp, Radio, Share2, Loader2 } from "lucide-react"
import { SongCard } from "@/components/song-card"
import { RoomCard } from "@/components/room-card"
import { ShareCard } from "@/components/share-card"
import { useApp } from "@/mvc/controllers/store"

export default function HomePage() {
  const { songs, shares, getActiveRooms, getSongReactionCount, getSongCommentCount, isLoading } = useApp()
  const activeRooms = getActiveRooms()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  // Get trending songs (sorted by total reactions + comments)
  const trendingSongs = [...songs]
    .sort((a, b) => {
      const aScore = getSongReactionCount(a.id) + getSongCommentCount(a.id)
      const bScore = getSongReactionCount(b.id) + getSongCommentCount(b.id)
      return bScore - aScore
    })
    .slice(0, 6)
  
  // Get recent shares (active only, sorted by date)
  const recentShares = shares
    .filter(s => s.status === "active")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome to SoundShare</h1>
        <p className="text-muted-foreground mt-1">
          Discover music, share your favorites, and listen together with friends.
        </p>
      </div>

      {/* Trending Songs Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Trending Songs</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingSongs.map((song) => (
            <SongCard key={song.id} songId={song.id} />
          ))}
        </div>
      </section>

      {/* Active Listening Rooms Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Radio className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Active Listening Rooms</h2>
        </div>
        {activeRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            No active listening rooms. Start one from any song page!
          </div>
        )}
      </section>

      {/* Recent Shares Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Recent Shares</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentShares.map((share) => (
            <ShareCard key={share.id} share={share} />
          ))}
        </div>
      </section>
    </div>
  )
}
