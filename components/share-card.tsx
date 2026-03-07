"use client"

import Link from "next/link"
import { Heart, Sparkles, Music, Flag, BadgeCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/mvc/controllers/store"
import { useToast } from "@/hooks/use-toast"
import type { Share } from "@/mvc/models/types"
import { formatDistanceToNow } from "@/mvc/controllers/date-utils"
import { useState } from "react"

interface ShareCardProps {
  share: Share
}

export function ShareCard({ share }: ShareCardProps) {
  const { 
    getSongById, 
    getArtistById, 
    getUserById, 
    getReactionsForTarget, 
    addReaction, 
    removeReaction,
    hasUserReacted,
    addReport,
    currentUserId,
  } = useApp()
  const { toast } = useToast()
  const [reportReason, setReportReason] = useState("")
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  
  const song = getSongById(share.songId)
  const artist = song ? getArtistById(song.artistId) : null
  const user = getUserById(share.userId)
  const reactions = getReactionsForTarget("share", share.id)
  
  const likeCount = reactions.filter(r => r.type === "like").length
  const loveCount = reactions.filter(r => r.type === "love").length
  const hasLiked = hasUserReacted("share", share.id, "like")
  const hasLoved = hasUserReacted("share", share.id, "love")

  const handleReaction = (type: "like" | "love") => {
    const existingReaction = reactions.find(
      (reaction) => reaction.userId === currentUserId && reaction.type === type
    )

    if (existingReaction) {
      removeReaction(existingReaction.id)
      return
    }

    const success = addReaction("share", share.id, type)
    if (!success) {
      toast({
        title: "Reaction error",
        description: "Could not update reaction. Try again.",
        variant: "destructive",
      })
    }
  }

  const handleReport = () => {
    if (!reportReason.trim()) return
    addReport("share", share.id, reportReason)
    setReportReason("")
    setReportDialogOpen(false)
    toast({
      title: "Report submitted",
      description: "Thank you for helping keep SoundShare safe.",
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">{user?.username.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{user?.username}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(share.createdAt)}
              </span>
              {share.visibility === "friends" && (
                <Badge variant="outline" className="text-xs">Friends</Badge>
              )}
            </div>
            <p className="text-sm mt-1 text-muted-foreground">{share.captionText}</p>
          </div>
        </div>

        <Link href={`/song/${share.songId}`} className="block mt-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="h-12 w-12 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
              <Music className="h-6 w-6 text-primary/50" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{song?.title}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="truncate">{artist?.name}</span>
                {artist?.verified && <BadgeCheck className="h-3 w-3 text-primary" />}
              </div>
            </div>
          </div>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Button
              variant={hasLiked ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => handleReaction("like")}
            >
              <Heart className={`h-4 w-4 mr-1 ${hasLiked ? "fill-current" : ""}`} />
              {likeCount}
            </Button>
            <Button
              variant={hasLoved ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => handleReaction("love")}
            >
              <Sparkles className={`h-4 w-4 mr-1 ${hasLoved ? "fill-current" : ""}`} />
              {loveCount}
            </Button>
          </div>
          
          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
                <Flag className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Share</DialogTitle>
                <DialogDescription>
                  Please provide a reason for reporting this share.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Enter reason..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReport} disabled={!reportReason.trim()}>
                  Submit Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
