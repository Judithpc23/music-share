"use client"

import { useMemo, useState } from "react"
import { BadgeCheck, Music, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { backendController } from "@/controllers/backend-controller"
import { formatTime } from "@/controllers/date-utils"
import { useApp } from "@/controllers/store"
import { useToast } from "@/hooks/use-toast"
import type { MoodType, Post } from "@/utils/types"

type CreatePostDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  presetSongId?: string
  defaultPostType?: "template" | "share"
  onCreated?: (post: Post) => void
}

export function CreatePostDialog({
  open,
  onOpenChange,
  presetSongId,
  defaultPostType = "template",
  onCreated,
}: CreatePostDialogProps) {
  const { currentUserId, songs, getSongById, getArtistById } = useApp()
  const { toast } = useToast()
  const [postType, setPostType] = useState<"template" | "share">(defaultPostType)
  const [moodType, setMoodType] = useState<MoodType>("nostalgia")
  const [songQuery, setSongQuery] = useState("")
  const [songId, setSongId] = useState<string>(presetSongId ?? "")
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const effectivePostType = presetSongId ? "share" : postType
  const selectedSong = songId ? getSongById(songId) : null
  const selectedSongArtist = selectedSong ? getArtistById(selectedSong.artistId) : null

  const filteredSongs = useMemo(() => {
    const query = songQuery.trim().toLowerCase()
    if (!query) return songs.slice(0, 20)
    return songs
      .filter((song) => {
        const artist = getArtistById(song.artistId)
        return (
          song.title.toLowerCase().includes(query) ||
          artist?.name?.toLowerCase().includes(query)
        )
      })
      .slice(0, 20)
  }, [songQuery, songs, getArtistById])

  const reset = () => {
    if (!presetSongId) setPostType(defaultPostType)
    setMoodType("nostalgia")
    setSongQuery("")
    setSongId(presetSongId ?? "")
    setText("")
  }

  const handleSubmit = async () => {
    if (!currentUserId || !songId || !moodType || !text.trim()) return

    setIsSubmitting(true)
    try {
      const post = await backendController.createPost({
        userId: currentUserId,
        postType: effectivePostType,
        moodType,
        songId,
        text: text.trim(),
      })
      toast({
        title: effectivePostType === "share" ? "Share publicado" : "Post publicado",
        description: "Tu publicacion ya esta disponible.",
      })
      onCreated?.(post)
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("[api] create post failed", error)
      toast({
        title: "Error al publicar",
        description: "No se pudo crear el post.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="text-center">
          <DialogTitle className="text-center">
            {effectivePostType === "share" ? "Crear Share" : "Crear Post"}
          </DialogTitle>
          <DialogDescription className="text-center">
            Selecciona mood, cancion y texto para tu publicacion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!presetSongId ? (
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={effectivePostType}
                onValueChange={(value) => setPostType(value as "template" | "share")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">Post</SelectItem>
                  <SelectItem value="share">Share</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Mood (obligatorio)</Label>
            <Select value={moodType} onValueChange={(value) => setMoodType(value as MoodType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nostalgia">Nostalgia 🎶</SelectItem>
                <SelectItem value="energy">Energy ⚡</SelectItem>
                <SelectItem value="chill">Chill 🌙</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cancion (obligatoria)</Label>

            {selectedSong ? (
              <div className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={selectedSong.coverImageUrl}
                      alt={selectedSong.title}
                      className="h-12 w-12 rounded-md object-cover border"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{selectedSong.title}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="truncate">{selectedSongArtist?.name ?? "Artista"}</span>
                        {selectedSongArtist?.verified ? (
                          <>
                            <BadgeCheck className="h-3 w-3 text-primary" />
                            <span>Verificado</span>
                          </>
                        ) : (
                          <span>No verificado</span>
                        )}
                        <span className="ml-1">- {formatTime(selectedSong.duration)}</span>
                      </div>
                    </div>
                  </div>
                  {!presetSongId ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSongId("")
                        setSongQuery("")
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Quitar
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <Input
                  placeholder="Buscar cancion o artista..."
                  value={songQuery}
                  onChange={(event) => setSongQuery(event.target.value)}
                />
                <div className="max-h-56 overflow-auto rounded-md border p-2 space-y-2">
                  {filteredSongs.map((song) => {
                    const artist = getArtistById(song.artistId)
                    return (
                      <button
                        key={song.id}
                        className="w-full text-left rounded-md border p-2 hover:bg-muted transition-colors"
                        onClick={() => setSongId(song.id)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={song.coverImageUrl}
                            alt={song.title}
                            className="h-10 w-10 rounded-md object-cover border shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{song.title}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span className="truncate">{artist?.name ?? "Artista"}</span>
                              {artist?.verified ? (
                                <>
                                  <BadgeCheck className="h-3 w-3 text-primary" />
                                  <span>Verificado</span>
                                </>
                              ) : (
                                <span>No verificado</span>
                              )}
                              <span className="ml-1">- {formatTime(song.duration)}</span>
                            </div>
                          </div>
                          <Music className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>Texto</Label>
            <Textarea
              placeholder="Escribe algo para acompanar tu publicacion..."
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !songId || !moodType || !text.trim()}
          >
            {isSubmitting ? "Publicando..." : "Publicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
