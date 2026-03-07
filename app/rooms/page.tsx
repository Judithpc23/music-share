"use client"

import { useState } from "react"
import { Radio, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { RoomCard } from "@/components/room-card"
import { useApp } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export default function RoomsPage() {
  const { getActiveRooms, songs, getArtistById, createRoom, isLoading } = useApp()
  const { toast } = useToast()
  
  const [roomName, setRoomName] = useState("")
  const [selectedSongId, setSelectedSongId] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const activeRooms = getActiveRooms()

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !selectedSongId) return
    await createRoom(roomName, selectedSongId)
    setRoomName("")
    setSelectedSongId("")
    setDialogOpen(false)
    toast({
      title: "Room created",
      description: "Your listening room is now active.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Listening Rooms</h1>
          <p className="text-muted-foreground mt-1">
            Listen to music together with others in real-time.
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Listening Room</DialogTitle>
              <DialogDescription>
                Start a new room and invite others to listen together.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Room name..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
              <Select value={selectedSongId} onValueChange={setSelectedSongId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a song" />
                </SelectTrigger>
                <SelectContent>
                  {songs.map(song => {
                    const artist = getArtistById(song.artistId)
                    return (
                      <SelectItem key={song.id} value={song.id}>
                        {song.title} - {artist?.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRoom} disabled={!roomName.trim() || !selectedSongId}>
                Create Room
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Rooms */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Radio className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Active Rooms ({activeRooms.length})</h2>
        </div>
        
        {activeRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active listening rooms.</p>
            <p className="text-sm mt-1">Create a room to start listening together!</p>
          </div>
        )}
      </div>
    </div>
  )
}
