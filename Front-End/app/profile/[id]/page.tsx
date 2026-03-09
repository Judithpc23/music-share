"use client"

import { useEffect, useMemo, useState } from "react"
import { Lock, UserPlus, UserMinus, Clock3 } from "lucide-react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShareCard } from "@/components/share-card"
import { useApp } from "@/controllers/store"
import { backendController } from "@/controllers/backend-controller"
import type { Share } from "@/utils/types"

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>()
  const {
    currentUserId,
    getUserById,
    reactions,
    comments,
  } = useApp()

  const targetUserId = params.id
  const targetUser = getUserById(targetUserId)
  const [shares, setShares] = useState<Share[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [followStatus, setFollowStatus] = useState<{
    canView: boolean
    isPrivate: boolean
    isFollowing: boolean
    requestPending: boolean
    status: "pending" | "accepted" | "rejected" | null
  } | null>(null)

  const userReactions = useMemo(
    () => reactions.filter((item) => item.userId === targetUserId),
    [reactions, targetUserId]
  )

  const userComments = useMemo(
    () =>
      comments.filter(
        (item) => item.userId === targetUserId && item.status === "active"
      ),
    [comments, targetUserId]
  )

  const loadProfile = async () => {
    if (!currentUserId || !targetUserId) return
    setIsLoading(true)
    try {
      const status = await backendController.getFollowStatus(
        currentUserId,
        targetUserId
      )
      setFollowStatus(status)

      if (status.canView) {
        const userShares = await backendController.getSharesForUser(
          targetUserId,
          currentUserId
        )
        setShares(userShares)
      } else {
        setShares([])
      }
    } catch (error) {
      console.error("[api] failed to load profile visibility", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, targetUserId])

  const handleFollowAction = async () => {
    if (!followStatus || !currentUserId || !targetUserId) return
    if (followStatus.isFollowing) {
      await backendController.unfollow(currentUserId, targetUserId)
    } else {
      await backendController.requestFollow(currentUserId, targetUserId)
    }
    await loadProfile()
  }

  if (!targetUser) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Usuario no encontrado.
      </div>
    )
  }

  const isOwnProfile = currentUserId === targetUserId

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">{targetUser.username}</h1>
              <p className="text-sm text-muted-foreground">{targetUser.email}</p>
              <p className="text-sm mt-2">{targetUser.bio}</p>
            </div>
            {!isOwnProfile ? (
              <Button
                variant={followStatus?.isFollowing ? "outline" : "default"}
                onClick={() => void handleFollowAction()}
                disabled={followStatus?.requestPending}
              >
                {followStatus?.requestPending ? (
                  <>
                    <Clock3 className="h-4 w-4 mr-1" />
                    Solicitud enviada
                  </>
                ) : followStatus?.isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-1" />
                    Dejar de seguir
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Seguir
                  </>
                )}
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-3 border-t pt-4">
            <div className="text-center">
              <p className="text-xl font-semibold">{shares.length}</p>
              <p className="text-xs text-muted-foreground">Publicaciones</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">{userReactions.length}</p>
              <p className="text-xs text-muted-foreground">Reacciones</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">{userComments.length}</p>
              <p className="text-xs text-muted-foreground">Comentarios</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Cargando perfil...
          </CardContent>
        </Card>
      ) : followStatus && !followStatus.canView ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Lock className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">Perfil privado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Debes ser seguidor aceptado para ver publicaciones.
            </p>
            {followStatus.requestPending ? (
              <Badge className="mt-3" variant="secondary">
                Solicitud pendiente
              </Badge>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {shares.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Este usuario no tiene publicaciones visibles.
              </CardContent>
            </Card>
          ) : (
            shares.map((share) => <ShareCard key={share.id} share={share} />)
          )}
        </div>
      )}
    </div>
  )
}
