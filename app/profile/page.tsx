"use client"

import { useState } from "react"
import { User, Music, Activity, Heart, MessageCircle, Share2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ShareCard } from "@/components/share-card"
import { useApp } from "@/lib/store"
import { formatDistanceToNow } from "@/lib/date-utils"

export default function ProfilePage() {
  const { 
    users, 
    getSharesForUser, 
    reactions, 
    comments, 
    getUserById, 
    getSongById,
    getArtistById
  } = useApp()
  
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || "")
  
  const selectedUser = getUserById(selectedUserId)
  const userShares = getSharesForUser(selectedUserId)
  
  // Get user's reactions
  const userReactions = reactions.filter(r => r.userId === selectedUserId)
  
  // Get user's comments
  const userComments = comments.filter(c => c.userId === selectedUserId && c.status === "active")
  
  // Combine activities and sort by date
  const activities = [
    ...userReactions.map(r => ({
      type: "reaction" as const,
      data: r,
      date: r.createdAt,
    })),
    ...userComments.map(c => ({
      type: "comment" as const,
      data: c,
      date: c.createdAt,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant={selectedUser?.role === "admin" ? "default" : "secondary"}>
                  {selectedUser?.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
              <p className="text-sm mt-2">{selectedUser?.bio}</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <Share2 className="h-5 w-5 text-muted-foreground" />
                {userShares.length}
              </div>
              <p className="text-sm text-muted-foreground">Shares</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <Heart className="h-5 w-5 text-muted-foreground" />
                {userReactions.length}
              </div>
              <p className="text-sm text-muted-foreground">Reactions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                {userComments.length}
              </div>
              <p className="text-sm text-muted-foreground">Comments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="shares">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shares" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Shared Songs
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="shares" className="mt-4">
          {userShares.length > 0 ? (
            <div className="space-y-4">
              {userShares.map(share => (
                <ShareCard key={share.id} share={share} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No shared songs yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.slice(0, 20).map((activity, index) => {
                    if (activity.type === "reaction") {
                      const reaction = activity.data
                      let targetDescription = ""
                      if (reaction.targetType === "song") {
                        const song = getSongById(reaction.targetId)
                        const artist = song ? getArtistById(song.artistId) : null
                        targetDescription = song ? `"${song.title}" by ${artist?.name}` : "a song"
                      } else {
                        targetDescription = `a ${reaction.targetType}`
                      }
                      
                      return (
                        <div key={`reaction-${index}`} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Heart className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-medium">{reaction.type === "like" ? "Liked" : "Loved"}</span>{" "}
                              <span className="text-muted-foreground">{targetDescription}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDistanceToNow(reaction.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    }
                    
                    if (activity.type === "comment") {
                      const comment = activity.data
                      const song = getSongById(comment.songId)
                      const artist = song ? getArtistById(song.artistId) : null
                      
                      return (
                        <div key={`comment-${index}`} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <MessageCircle className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-medium">Commented</span>{" "}
                              <span className="text-muted-foreground">
                                on "{song?.title}" by {artist?.name}
                              </span>
                            </p>
                            <p className="text-sm mt-1 text-muted-foreground italic truncate">
                              "{comment.content}"
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDistanceToNow(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    }
                    
                    return null
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
