"use client"

import { useState } from "react"
import { 
  Shield, 
  AlertTriangle, 
  BarChart3, 
  Filter,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  MessageCircle,
  Share2,
  Music,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useApp } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "@/lib/date-utils"
import type { ReportStatus } from "@/lib/types"

export default function ModerationPage() {
  const { 
    currentRole,
    reports, 
    comments,
    shares,
    songs,
    getUserById, 
    getCommentById,
    getShareById,
    getSongById,
    getArtistById,
    updateCommentStatus,
    updateShareStatus,
    updateReportStatus,
    getSongCommentCount,
    getSongShareCount,
    simulateLostRecord,
    isLoading
  } = useApp()
  const { toast } = useToast()
  
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all")
  const [lostRecordId, setLostRecordId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Check if admin
  if (currentRole !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You need admin privileges to access this page.
              Switch to the Admin role using the role selector in the header.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter reports
  const filteredReports = reports.filter(r => 
    statusFilter === "all" || r.status === statusFilter
  )

  // Analytics
  const mostCommentedSongs = [...songs]
    .map(s => ({ song: s, count: getSongCommentCount(s.id) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const mostSharedSongs = [...songs]
    .map(s => ({ song: s, count: getSongShareCount(s.id) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const pendingReportsCount = reports.filter(r => r.status === "pending").length

  const handleHideContent = async (targetType: "comment" | "share", targetId: string) => {
    if (targetType === "comment") {
      await updateCommentStatus(targetId, "hidden")
    } else {
      await updateShareStatus(targetId, "hidden")
    }
    toast({
      title: "Content hidden",
      description: "The content has been hidden from public view.",
    })
  }

  const handleDeleteContent = async (targetType: "comment" | "share", targetId: string) => {
    if (targetType === "comment") {
      await updateCommentStatus(targetId, "deleted")
    } else {
      await updateShareStatus(targetId, "deleted")
    }
    toast({
      title: "Content deleted",
      description: "The content has been marked as deleted.",
    })
  }

  const handleResolveReport = async (reportId: string) => {
    await updateReportStatus(reportId, "resolved")
    toast({
      title: "Report resolved",
      description: "The report has been marked as resolved.",
    })
  }

  const handleSimulateLostRecord = async () => {
    const deletedId = await simulateLostRecord()
    if (deletedId) {
      setLostRecordId(deletedId)
      toast({
        title: "Record lost (simulation)",
        description: "A comment record has been removed from the database.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "No records to delete",
        description: "There are no active comments to simulate deletion.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Moderation Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage reports, review content, and view platform analytics.
        </p>
      </div>

      {/* Lost Record Alert */}
      {lostRecordId && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Simulated Data Loss</AlertTitle>
          <AlertDescription>
            Comment ID "{lostRecordId}" was removed from local state. In a real system, 
            this could be recovered from backup/audit logs. This demonstrates the importance 
            of data integrity controls and recovery mechanisms.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 bg-transparent"
              onClick={() => setLostRecordId(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Reports</p>
                <p className="text-2xl font-bold">{pendingReportsCount}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${pendingReportsCount > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Comments</p>
                <p className="text-2xl font-bold">{comments.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Shares</p>
                <p className="text-2xl font-bold">{shares.length}</p>
              </div>
              <Share2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleSimulateLostRecord}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Simulate Lost Record
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Demo: Error case simulation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Reports
            </CardTitle>
            <Select 
              value={statusFilter} 
              onValueChange={(v) => setStatusFilter(v as "all" | ReportStatus)}
            >
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map(report => {
                const reporter = getUserById(report.userId)
                let content: { preview: string; author: string; status: string } | null = null
                
                if (report.targetType === "comment") {
                  const comment = getCommentById(report.targetId)
                  if (comment) {
                    const commentAuthor = getUserById(comment.userId)
                    content = {
                      preview: comment.content.slice(0, 50) + (comment.content.length > 50 ? "..." : ""),
                      author: commentAuthor?.username || "Unknown",
                      status: comment.status,
                    }
                  }
                } else {
                  const share = getShareById(report.targetId)
                  if (share) {
                    const shareAuthor = getUserById(share.userId)
                    content = {
                      preview: share.captionText.slice(0, 50) + (share.captionText.length > 50 ? "..." : ""),
                      author: shareAuthor?.username || "Unknown",
                      status: share.status,
                    }
                  }
                }
                
                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {report.targetType === "comment" ? (
                          <MessageCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <Share2 className="h-3 w-3 mr-1" />
                        )}
                        {report.targetType}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="truncate text-sm">{content?.preview || "Content not found"}</p>
                      {content?.status !== "active" && (
                        <Badge variant="destructive" className="mt-1 text-xs">
                          {content?.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{content?.author || "-"}</TableCell>
                    <TableCell className="text-sm">{reporter?.username}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="truncate text-sm text-muted-foreground">{report.reason}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.status === "pending" ? "default" : "secondary"}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {report.status === "pending" && content?.status === "active" && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleHideContent(report.targetType, report.targetId)}
                              title="Hide content"
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteContent(report.targetType, report.targetId)}
                              title="Delete content"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {report.status === "pending" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleResolveReport(report.id)}
                            title="Mark resolved"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No reports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5" />
              Most Commented Songs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostCommentedSongs.map(({ song, count }, index) => {
                const artist = getArtistById(song.artistId)
                return (
                  <div key={song.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <div className="h-10 w-10 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Music className="h-5 w-5 text-primary/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{song.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{artist?.name}</p>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Share2 className="h-5 w-5" />
              Most Shared Songs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostSharedSongs.map(({ song, count }, index) => {
                const artist = getArtistById(song.artistId)
                return (
                  <div key={song.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <div className="h-10 w-10 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Music className="h-5 w-5 text-primary/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{song.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{artist?.name}</p>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
