'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, Info, Bell, RefreshCw } from 'lucide-react'
import { authService } from '@/lib/authService'
import { notificationService, type PortalNotification } from '@/services/notificationService'

export default function HospitalStaffNotificationsPage() {
    const currentUser = authService.getUser()
    const userId = currentUser?.id || (currentUser as any)?.userId

    const [notifications, setNotifications] = useState<PortalNotification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadNotifications = async () => {
        if (!userId) {
            setError('User not authenticated')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError('')
            const rows = await notificationService.getUserNotifications(userId)
            setNotifications(rows)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadNotifications()
    }, [userId])

    const unreadCount = useMemo(() => notifications.filter((n) => n.status === 'UNREAD').length, [notifications])

    const handleMarkAllAsRead = async () => {
        if (!userId) return
        try {
            await notificationService.markAllAsRead(userId)
            await loadNotifications()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark all as read')
        }
    }

    const handleMarkAsRead = async (notificationId: string) => {
        if (!userId) return
        try {
            await notificationService.markAsRead(userId, notificationId)
            await loadNotifications()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark as read')
        }
    }

    const iconFor = (status: 'READ' | 'UNREAD') => {
        if (status === 'UNREAD') return <AlertTriangle className="w-5 h-5 text-yellow-600" />
        return <CheckCircle className="w-5 h-5 text-green-600" />
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                    <p className="text-muted-foreground mt-1">Stay updated with alerts and announcements.</p>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={handleMarkAllAsRead}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark All as Read
                        </Button>
                    )}
                    <Button variant="outline" onClick={loadNotifications}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        My Notifications ({unreadCount} unread)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Loading notifications...</p>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8">
                            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No notifications yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`flex gap-4 p-4 border rounded-lg transition-colors cursor-pointer ${
                                        n.status === 'UNREAD' ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' : 'hover:bg-muted/50'
                                    }`}
                                    onClick={() => n.status === 'UNREAD' && handleMarkAsRead(n.id)}
                                >
                                    <div className="mt-1">{iconFor(n.status)}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start gap-3">
                                            <h4 className="font-medium">{n.title || 'Notification'}</h4>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(n.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                                            <Info className="w-3 h-3" />
                                            <span>Status: {n.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
