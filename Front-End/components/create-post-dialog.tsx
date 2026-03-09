"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { backendController } from "@/controllers/backend-controller"
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
  const [moodType, setMoodType] = useState<MoodType | "none">("none")
  const [songQuery, setSongQuery] = useState("")
  const [songId, setSongId] = useState<string>(presetSongId ?? "")
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const effectivePostType = presetSongId ? "share" : postType

  const filteredSongs = useMemo(() => {
    const query = songQuery.trim().toLowerCase()
    if (!query) return songs.slice(0, 12)
    return songs
      .filter((song) => {
        const artist = getArtistById(song.artistId)
        return (
          song.title.toLowerCase().includes(query) ||
          artist?.name?.toLowerCase().includes(query)
        )
      })
      .slice(0, 12)
  }, [songQuery, songs, getArtistById])

  const selectedSong = songId ? getSongById(songId) : null

  const reset = () => {
    if (!presetSongId) setPostType(defaultPostType)
    setMoodType("none")
    setSongQuery("")
    setSongId(presetSongId ?? "")
    setText("")
  }

  const handleSubmit = async () => {
    if (!currentUserId || !songId || !text.trim()) return

    setIsSubmitting(true)
    try {
      const post = await backendController.createPost({
        userId: currentUserId,
        postType: effectivePostType,
        moodType: moodType === "none" ? undefined : moodType,
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
        <DialogHeader>
          <DialogTitle>{effectivePostType === "share" ? "Crear Share" : "Crear Post"}</DialogTitle>
          <DialogDescription>
            Selecciona mood (opcional), Cancion (obligatoria) y texto.
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
            <Label>Mood (opcional)</Label>
            <Select value={moodType} onValueChange={(v) => setMoodType(v as MoodType | "none")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin mood</SelectItem>
                <SelectItem value="nostalgia">Nostalgia</SelectItem>
                <SelectItem value="energy">Energy</SelectItem>
                <SelectItem value="chill">Chill</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Canción</Label>
            {presetSongId ? (
              <div className="rounded-md border p-2 text-sm text-muted-foreground">
                {selectedSong?.title ?? "Cancion seleccionada"}
              </div>
            ) : (
              <>
                <Input
                  placeholder="Buscar Cancion..."
                  value={songQuery}
                  onChange={(event) => setSongQuery(event.target.value)}
                />
                <div className="max-h-40 overflow-auto rounded-md border p-2 space-y-1">
                  {filteredSongs.map((song) => {
                    const artist = getArtistById(song.artistId)
                    const active = song.id === songId
                    return (
                      <button
                        key={song.id}
                        className={`w-full text-left rounded px-2 py-1 text-sm ${
                          active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                        onClick={() => setSongId(song.id)}
                      >
                        {song.title} - {artist?.name}
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
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !songId || !text.trim()}>
            {isSubmitting ? "Publicando..." : "Publicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


