"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Ellipsis, Flag, Heart, MessageCircle, Music, Pencil, Sparkles, Trash2, Undo2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { backendController } from "@/controllers/backend-controller"
import { formatDistanceToNow } from "@/controllers/date-utils"
import { useApp } from "@/controllers/store"
import { useToast } from "@/hooks/use-toast"
import type { Post, Share } from "@/utils/types"

type PostFeedCardProps = {
  item: Post | Share
  onChanged?: () => void
}

function toPostShape(item: Post | Share): Post {
  if ("postType" in item) return item
  return {
    id: item.id,
    userId: item.userId,
    postType: "share",
    content: item.captionText,
    songId: item.songId,
    captionText: item.captionText,
    status: item.status,
    createdAt: item.createdAt,
  }
}

export function PostFeedCard({ item, onChanged }: PostFeedCardProps) {
  const post = useMemo(() => toPostShape(item), [item])
  const {
    currentUserId,
    getArtistById,
    getCommentsForSong,
    getReactionsForTarget,
    getSongById,
    getUserById,
    hasUserReacted,
    addReaction,
    removeReaction,
    addReport,
  } = useApp()
  const { toast } = useToast()

  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(post.content)
  const [isLoading, setIsLoading] = useState(false)

  const owner = getUserById(post.userId)
  const rawUsername = owner?.username ?? "usuario"
  const normalizedUsername = rawUsername.replace(/^@+/, "") || "usuario"
  const profileHref = currentUserId === post.userId ? "/profile" : `/profile/${post.userId}`
  const avatarLetter = normalizedUsername.charAt(0).toUpperCase()
  const song = post.songId ? getSongById(post.songId) : undefined
  const artist = song ? getArtistById(song.artistId) : undefined
  const canManage = currentUserId === post.userId

  const reactions = getReactionsForTarget("share", post.id)
  const likeCount = reactions.filter((reaction) => reaction.type === "like").length
  const loveCount = reactions.filter((reaction) => reaction.type === "love").length
  const hasLiked = hasUserReacted("share", post.id, "like")
  const hasLoved = hasUserReacted("share", post.id, "love")
  const commentCount = post.songId ? getCommentsForSong(post.songId).length : 0

  useEffect(() => {
    setDraft(post.content)
  }, [post.content])

  const handleReaction = (type: "like" | "love") => {
    const existing = reactions.find(
      (reaction) => reaction.userId === currentUserId && reaction.type === type
    )
    if (existing) {
      removeReaction(existing.id)
      return
    }
    const success = addReaction("share", post.id, type)
    if (!success) {
      toast({
        title: "Error de reaccion",
        description: "No se pudo actualizar la reaccion.",
        variant: "destructive",
      })
    }
  }

  const handleReport = () => {
    if (!reportReason.trim()) return
    addReport("share", post.id, reportReason.trim())
    setReportReason("")
    setReportDialogOpen(false)
    toast({
      title: "Reporte enviado",
      description: "Gracias por reportar esta publicacion.",
    })
  }

  const handleSave = async () => {
    if (!currentUserId || !draft.trim()) return
    setIsLoading(true)
    await backendController.updatePost(post.id, {
      userId: currentUserId,
      text: draft.trim(),
    })
    setIsLoading(false)
    setIsEditing(false)
    onChanged?.()
  }

  const handleUndo = async () => {
    if (!currentUserId) return
    setIsLoading(true)
    await backendController.undoPost(post.id, currentUserId)
    setIsLoading(false)
    onChanged?.()
  }

  const handleDelete = async () => {
    if (!currentUserId) return
    setIsLoading(true)
    await backendController.deletePost(post.id, currentUserId)
    setIsLoading(false)
    onChanged?.()
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-primary">
                {avatarLetter}
              </span>
            </div>
            <div className="min-w-0">
              <Link href={profileHref} className="font-semibold text-sm hover:underline">
                @{normalizedUsername}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(post.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{post.postType === "share" ? "Share" : "Post"}</Badge>
            {post.mood ? <Badge variant="outline">{post.mood}</Badge> : null}
            {canManage ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Ellipsis className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void handleUndo()}>
                    <Undo2 className="h-4 w-4 mr-2" />
                    Deshacer
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => void handleDelete()}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void handleSave()} disabled={isLoading || !draft.trim()}>
                Guardar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setDraft(post.content)
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        )}

        {song ? (
          <Link href={`/song/${song.id}`} className="block">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted transition-colors">
              <div className="h-12 w-12 rounded bg-background border flex items-center justify-center shrink-0">
                <Music className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{song.title}</p>
                <p className="text-xs text-muted-foreground truncate">{artist?.name ?? "Artista"}</p>
              </div>
            </div>
          </Link>
        ) : null}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={hasLiked ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => handleReaction("like")}
            >
              <Heart className={`h-4 w-4 mr-1 ${hasLiked ? "fill-current" : ""}`} />
              Like {likeCount}
            </Button>
            <Button
              variant={hasLoved ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => handleReaction("love")}
            >
              <Sparkles className={`h-4 w-4 mr-1 ${hasLoved ? "fill-current" : ""}`} />
              Love {loveCount}
            </Button>
            {post.songId ? (
              <Link href={`/song/${post.songId}`}>
                <Button variant="outline" size="sm" className="h-8">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Comentar {commentCount}
                </Button>
              </Link>
            ) : null}
          </div>

          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
                <Flag className="h-4 w-4 mr-1" />
                Reportar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reportar publicacion</DialogTitle>
                <DialogDescription>
                  Describe la razon del reporte.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Escribe la razon..."
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleReport} disabled={!reportReason.trim()}>
                  Enviar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
