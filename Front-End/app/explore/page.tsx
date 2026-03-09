"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
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
import { Card, CardContent } from "@/components/ui/card"
import { useApp } from "@/controllers/store"

export default function ExplorePage() {
  const { songs, artists, genres: appGenres, users, currentUserId } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [genreFilter, setGenreFilter] = useState("all")
  const [artistFilter, setArtistFilter] = useState("all")
  const isUserSearch = searchQuery.trim().startsWith("@")

  // Get unique genres
  const genreOptions = useMemo(() => {
    return [...appGenres].sort((a, b) => a.name.localeCompare(b.name))
  }, [appGenres])

  const filteredUsers = useMemo(() => {
    if (!isUserSearch) return []
    const term = searchQuery.trim().slice(1).toLowerCase()
    return users.filter((user) => {
      if (!term) return true
      return (
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      )
    })
  }, [users, searchQuery, isUserSearch])

  // Filter songs
  const filteredSongs = useMemo(() => {
    if (isUserSearch) return []
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
  }, [songs, artists, appGenres, searchQuery, genreFilter, artistFilter, isUserSearch])

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
            placeholder="Search songs/artists or @username..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {!isUserSearch ? (
          <div className="flex gap-2">
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
        ) : null}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {isUserSearch
          ? `Showing ${filteredUsers.length} of ${users.length} users`
          : `Showing ${filteredSongs.length} of ${songs.length} songs`}
      </p>

      {/* User/Song Results */}
      {isUserSearch ? (
        filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((user) => {
              const profilePath = user.id === currentUserId ? "/profile" : `/profile/${user.id}`
              return (
                <Link key={user.id} href={profilePath}>
                  <Card className="transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {user.username.replace(/^@+/, "").charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">@{user.username.replace(/^@+/, "")}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            No users found matching your criteria.
          </div>
        )
      ) : (
        filteredSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredSongs.map((song) => (
              <SongCard key={song.id} songId={song.id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            No songs found matching your criteria.
          </div>
        )
      )}
    </div>
  )
}
