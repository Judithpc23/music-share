"use client"

import { useState, useMemo } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SongCard } from "@/components/song-card"
import { useApp } from "@/controllers/store"
import { musicController, type ExternalTrack } from "@/controllers/music-controller"

export default function ExplorePage() {
  const { songs, artists, genres: appGenres } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [genreFilter, setGenreFilter] = useState("all")
  const [artistFilter, setArtistFilter] = useState("all")
  const [externalTracks, setExternalTracks] = useState<ExternalTrack[]>([])
  const [isExternalLoading, setIsExternalLoading] = useState(false)

  // Get unique genres
  const genreOptions = useMemo(() => {
    return [...appGenres].sort((a, b) => a.name.localeCompare(b.name))
  }, [appGenres])

  // Filter songs
  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      const artist = artists.find(a => a.id === song.artistId)
      const songGenre = appGenres.find((genre) => genre.id === song.genreId)
      const matchesSearch = 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist?.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesGenre = genreFilter === "all" || song.genreId === genreFilter
      const matchesArtist = artistFilter === "all" || song.artistId === artistFilter
      
      return (
        matchesSearch ||
        songGenre?.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) && matchesGenre && matchesArtist
    })
  }, [songs, artists, appGenres, searchQuery, genreFilter, artistFilter])

  const handleExternalSearch = async () => {
    if (!searchQuery.trim()) {
      setExternalTracks([])
      return
    }

    setIsExternalLoading(true)
    try {
      const results = await musicController.searchTracks(searchQuery, 12)
      setExternalTracks(results)
    } catch (error) {
      console.error("[music api] failed to search tracks", error)
      setExternalTracks([])
    } finally {
      setIsExternalLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Explore Catalog</h1>
        <p className="text-muted-foreground mt-1">
          Browse our collection of songs from verified artists.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search songs or artists..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleExternalSearch} disabled={isExternalLoading}>
            {isExternalLoading ? "Searching APIs..." : "Search Spotify + Deezer"}
          </Button>
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genreOptions.map(genre => (
                <SelectItem key={genre.id} value={genre.id}>{genre.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={artistFilter} onValueChange={setArtistFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Artist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Artists</SelectItem>
              {artists.map(artist => (
                <SelectItem key={artist.id} value={artist.id}>{artist.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredSongs.length} of {songs.length} songs
      </p>

      {/* Song Grid */}
      {filteredSongs.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredSongs.map((song) => (
            <SongCard key={song.id} songId={song.id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
          No songs found matching your criteria.
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">External results (Spotify metadata + Deezer preview)</h2>
        {externalTracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalTracks.map((track) => (
              <article key={track.id} className="border rounded-lg p-3 space-y-3">
                <div className="flex gap-3">
                  <img
                    src={track.imageUrl || "/placeholder.svg?height=96&width=96"}
                    alt={track.name}
                    className="h-20 w-20 rounded-md object-cover bg-muted"
                  />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.album}</p>
                  </div>
                </div>

                {track.previewUrl ? (
                  <audio controls className="w-full" src={track.previewUrl}>
                    Your browser does not support audio playback.
                  </audio>
                ) : (
                  <p className="text-sm text-muted-foreground">No preview available for this track.</p>
                )}

                <a
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline"
                >
                  Open in Spotify
                </a>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Use “Search Spotify + Deezer” to fetch online tracks with playable previews.
          </p>
        )}
      </div>
    </div>
  )
}
