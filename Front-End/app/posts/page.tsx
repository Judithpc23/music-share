"use client"

import { useEffect, useState } from "react"
import { Compass, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { backendController } from "@/controllers/backend-controller"
import { useApp } from "@/controllers/store"
import type { Post } from "@/utils/types"
import { PostFeedCard } from "@/components/post-feed-card"

export default function PostsPage() {
  const { currentUserId } = useApp()
  const [activeTab, setActiveTab] = useState<"discover" | "following">("discover")
  const [discoverPosts, setDiscoverPosts] = useState<Post[]>([])
  const [followingPosts, setFollowingPosts] = useState<Post[]>([])

  const loadPosts = async () => {
    if (!currentUserId) return
    const [discover, following] = await Promise.all([
      backendController.getDiscoverPosts(currentUserId),
      backendController.getFollowingPosts(currentUserId),
    ])
    setDiscoverPosts(discover)
    setFollowingPosts(following)
  }

  useEffect(() => {
    void loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Post Explorer</h1>
          <p className="text-sm text-muted-foreground">
            Descubre publicaciones globales o de personas que sigues.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "discover" | "following")}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Following
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-4 space-y-4">
          {discoverPosts.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No hay publicaciones en Discover.
              </CardContent>
            </Card>
          ) : (
            discoverPosts.map((post) => (
              <PostFeedCard key={post.id} item={post} onChanged={() => void loadPosts()} />
            ))
          )}
        </TabsContent>

        <TabsContent value="following" className="mt-4 space-y-4">
          {followingPosts.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No hay publicaciones de personas que sigues.
              </CardContent>
            </Card>
          ) : (
            followingPosts.map((post) => (
              <PostFeedCard key={post.id} item={post} onChanged={() => void loadPosts()} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
