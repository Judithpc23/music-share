"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, Check, UserPlus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/controllers/store"
import { backendController } from "@/controllers/backend-controller"
import type { AppNotification } from "@/utils/types"
import { formatDistanceToNow } from "@/controllers/date-utils"

export default function InboxPage() {
  const { currentUserId, getUserById } = useApp()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  )

  useEffect(() => {
    if (!currentUserId) return
    setIsLoading(true)
    void backendController
      .getNotifications(currentUserId)
      .then((data) => setNotifications(data))
      .catch((error) => {
        console.error("[api] failed to load notifications", error)
      })
      .finally(() => setIsLoading(false))
  }, [currentUserId])

  const markAsRead = async (notificationId: string) => {
    await backendController.markNotificationRead(currentUserId, notificationId)
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item
      )
    )
  }

  const handleFollowRequest = async (
    notification: AppNotification,
    action: "accept" | "reject"
  ) => {
    const followerUserId = notification.actorUserId
    if (action === "accept") {
      await backendController.acceptFollowRequest(currentUserId, followerUserId)
    } else {
      await backendController.rejectFollowRequest(currentUserId, followerUserId)
    }
    await markAsRead(notification.id)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inbox</h1>
          <p className="text-muted-foreground mt-1">
            Tus notificaciones de posts, reacciones, comentarios y seguidores.
          </p>
        </div>
        <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
          {unreadCount} sin leer
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notificaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando inbox...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No tienes notificaciones por ahora.</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const actor = getUserById(notification.actorUserId)
              const isFollowRequest = notification.type === "follow_request"

              return (
                <div
                  key={notification.id}
                  className={`rounded-lg border p-4 ${
                    notification.isRead ? "bg-card" : "bg-primary/5 border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{notification.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {actor?.username ? `${actor.username}: ` : ""}
                        {notification.body}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(notification.createdAt)}
                      </p>
                    </div>

                    {!notification.isRead && !isFollowRequest ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Marcar leída
                      </Button>
                    ) : null}
                  </div>

                  {isFollowRequest && !notification.isRead ? (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => void handleFollowRequest(notification, "accept")}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Aceptar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleFollowRequest(notification, "reject")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  ) : null}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
