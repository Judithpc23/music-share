"use client"

import { useState, useMemo } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SongCard } from "@/components/song-card"
import { useApp } from "@/lib/store"

export default function ExplorePage() {
  const { songs, artists } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [genreFilter, setGenreFilter] = useState("all")
  const [artistFilter, setArtistFilter] = useState("all")

  // Get unique genres
  const genres = useMemo(() => {
    const uniqueGenres = new Set(songs.map(s => s.genre))
    return Array.from(uniqueGenres).sort()
  }, [songs])

  // Filter songs
  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      const artist = artists.find(a => a.id === song.artistId)
      const matchesSearch = 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist?.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesGenre = genreFilter === "all" || song.genre === genreFilter
      const matchesArtist = artistFilter === "all" || song.artistId === artistFilter
      
      return matchesSearch && matchesGenre && matchesArtist
    })
  }, [songs, artists, searchQuery, genreFilter, artistFilter])

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
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(genre => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
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
    </div>
  )
}
