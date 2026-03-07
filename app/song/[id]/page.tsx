"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  Heart, 
  Sparkles, 
  Share2, 
  Radio, 
  BadgeCheck, 
  MessageCircle, 
  Flag,
  ExternalLink,
  Users,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApp } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow, formatTime } from "@/lib/date-utils"
import type { ShareVisibility } from "@/lib/types"

export default function SongDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { 
    getSongById, 
    getArtistById, 
    getUserById,
    getCommentsForSong, 
    getReactionsForTarget,
    getRoomsPlayingSong,
    addComment, 
    addReaction, 
    addShare,
    addReport,
    hasUserReacted,
    createRoom,
    joinRoom,
    currentUserId,
    roomMembers,
    isLoading
  } = useApp()
  const { toast } = useToast()
  
  const [commentText, setCommentText] = useState("")
  const [shareCaption, setShareCaption] = useState("")
  const [shareVisibility, setShareVisibility] = useState<ShareVisibility>("public")
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [roomName, setRoomName] = useState("")
  const [roomDialogOpen, setRoomDialogOpen] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportCommentId, setReportCommentId] = useState<string | null>(null)
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const song = getSongById(id)
  if (!song) {
    notFound()
  }
  
  const artist = getArtistById(song.artistId)
  const comments = getCommentsForSong(id)
  const reactions = getReactionsForTarget("song", id)
  const roomsPlayingSong = getRoomsPlayingSong(id)
  
  const likeCount = reactions.filter(r => r.type === "like").length
  const loveCount = reactions.filter(r => r.type === "love").length
  const hasLiked = hasUserReacted("song", id, "like")
  const hasLoved = hasUserReacted("song", id, "love")

  const handleReaction = async (type: "like" | "love") => {
    const success = await addReaction("song", id, type)
    if (!success) {
      toast({
        title: "Already reacted",
        description: `You have already ${type}d this song.`,
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    await addComment(id, commentText)
    setCommentText("")
    toast({
      title: "Comment added",
      description: "Your comment has been posted.",
    })
  }

  const handleShare = async () => {
    if (!shareCaption.trim()) return
    await addShare(id, shareCaption, shareVisibility)
    setShareCaption("")
    setShareDialogOpen(false)
    toast({
      title: "Shared to profile",
      description: "This song has been added to your profile.",
    })
  }

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return
    await createRoom(roomName, id)
    setRoomName("")
    setRoomDialogOpen(false)
    toast({
      title: "Room created",
      description: "Your listening room is now active.",
    })
  }

  const handleReportComment = async () => {
    if (!reportReason.trim() || !reportCommentId) return
    await addReport("comment", reportCommentId, reportReason)
    setReportReason("")
    setReportCommentId(null)
    toast({
      title: "Report submitted",
      description: "Thank you for helping keep SoundShare safe.",
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Song Header */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
          <span className="text-6xl font-bold text-primary/30">{song.title.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary">{song.genre}</Badge>
            <Badge variant="outline">{song.provider}</Badge>
          </div>
          <h1 className="text-3xl font-bold">{song.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-lg text-muted-foreground">
            <span>{artist?.name}</span>
            {artist?.verified && <BadgeCheck className="h-5 w-5 text-primary" />}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Duration: {formatTime(song.duration)}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={hasLiked ? "default" : "outline"}
              onClick={() => handleReaction("like")}
            >
              <Heart className={`h-4 w-4 mr-2 ${hasLiked ? "fill-current" : ""}`} />
              Like ({likeCount})
            </Button>
            <Button
              variant={hasLoved ? "default" : "outline"}
              onClick={() => handleReaction("love")}
            >
              <Sparkles className={`h-4 w-4 mr-2 ${hasLoved ? "fill-current" : ""}`} />
              Love ({loveCount})
            </Button>
            
            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share to Profile</DialogTitle>
                  <DialogDescription>
                    Add this song to your profile with a caption.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Write a caption..."
                    value={shareCaption}
                    onChange={(e) => setShareCaption(e.target.value)}
                  />
                  <Select 
                    value={shareVisibility} 
                    onValueChange={(v) => setShareVisibility(v as ShareVisibility)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleShare} disabled={!shareCaption.trim()}>
                    Share
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Create Room Dialog */}
            <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Radio className="h-4 w-4 mr-2" />
                  Start Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Listening Room</DialogTitle>
                  <DialogDescription>
                    Create a room to listen to this song with others.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  placeholder="Room name..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRoomDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRoom} disabled={!roomName.trim()}>
                    Create Room
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Active Rooms Playing This Song */}
      {roomsPlayingSong.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Join a Room Playing This Song
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roomsPlayingSong.map(room => {
                const isMember = roomMembers.some(m => m.roomId === room.id && m.userId === currentUserId)
                return (
                  <div key={room.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <span className="font-medium">{room.name}</span>
                    {isMember ? (
                      <Link href={`/rooms/${room.id}`}>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" onClick={() => joinRoom(room.id)}>
                        Join
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({comments.filter(c => c.status === "active").length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment */}
          <div className="flex gap-2">
            <Input
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            <Button onClick={handleAddComment} disabled={!commentText.trim()}>
              Post
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map(comment => {
              const commentUser = getUserById(comment.userId)
              return (
                <div 
                  key={comment.id} 
                  className={`p-3 rounded-lg ${
                    comment.status === "active" ? "bg-muted/50" : "bg-destructive/10 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {commentUser?.username.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{commentUser?.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(comment.createdAt)}
                          </span>
                          {comment.status !== "active" && (
                            <Badge variant="destructive" className="text-xs">
                              {comment.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                    {comment.status === "active" && (
                      <Dialog 
                        open={reportCommentId === comment.id} 
                        onOpenChange={(open) => !open && setReportCommentId(null)}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground"
                            onClick={() => setReportCommentId(comment.id)}
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Report Comment</DialogTitle>
                            <DialogDescription>
                              Please provide a reason for reporting this comment.
                            </DialogDescription>
                          </DialogHeader>
                          <Textarea
                            placeholder="Enter reason..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                          />
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setReportCommentId(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleReportComment} disabled={!reportReason.trim()}>
                              Submit Report
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              )
            })}
            {comments.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
