"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Radio, Share2 } from "lucide-react"
import { SongCard } from "@/components/song-card"
import { RoomCard } from "@/components/room-card"
import { PostFeedCard } from "@/components/post-feed-card"
import { backendController } from "@/controllers/backend-controller"
import { useApp } from "@/controllers/store"
import type { Post } from "@/utils/types"

export default function HomePage() {
  const { songs, currentUserId, getActiveRooms, getSongReactionCount, getSongCommentCount } = useApp()
  const activeRooms = getActiveRooms()
  const [recentPosts, setRecentPosts] = useState<Post[]>([])

  const loadRecentPosts = async () => {
    if (!currentUserId) return
    try {
      const items = await backendController.getDiscoverPosts(currentUserId)
      setRecentPosts(items.slice(0, 4))
    } catch (error) {
      console.error("[api] failed to load home posts", error)
      setRecentPosts([])
    }
  }
  
  // Get trending songs (sorted by total reactions + comments)
  const trendingSongs = [...songs]
    .sort((a, b) => {
      const aScore = getSongReactionCount(a.id) + getSongCommentCount(a.id)
      const bScore = getSongReactionCount(b.id) + getSongCommentCount(b.id)
      return bScore - aScore
    })
    .slice(0, 6)
  
  useEffect(() => {
    void loadRecentPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

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

      {/* Recent Posts Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Recent Posts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentPosts.map((post) => (
            <PostFeedCard key={post.id} item={post} onChanged={() => void loadRecentPosts()} />
          ))}
        </div>
      </section>
    </div>
  )
}
