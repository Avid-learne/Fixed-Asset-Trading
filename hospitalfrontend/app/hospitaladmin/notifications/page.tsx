'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, CheckCircle, Info, Send } from 'lucide-react'
import { authService } from '@/lib/authService'
import { notificationService, type PortalNotification } from '@/services/notificationService'

export default function NotificationsPage() {
    const currentUser = authService.getUser()
    const userId = currentUser?.id || (currentUser as any)?.userId

    const [notifications, setNotifications] = useState<PortalNotification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [sending, setSending] = useState(false)

    const [recipientGroup, setRecipientGroup] = useState<'PATIENTS' | 'HOSPITAL_STAFF' | 'ALL_USERS' | 'SPECIFIC_USER'>('PATIENTS')
    const [specificUserId, setSpecificUserId] = useState('')
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')

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

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            setError('Title and message are required')
            return
        }

        try {
            setSending(true)
            setError('')

            if (recipientGroup === 'SPECIFIC_USER') {
                if (!specificUserId.trim()) {
                    setError('Receiver user ID is required for specific user notifications')
                    return
                }

                await notificationService.send({
                    title,
                    message,
                    targetType: 'USER',
                    receiverUserId: specificUserId.trim(),
                })
            } else if (recipientGroup === 'ALL_USERS') {
                await notificationService.send({
                    title,
                    message,
                    targetType: 'ALL_USERS',
                })
            } else {
                await notificationService.send({
                    title,
                    message,
                    targetType: 'ROLE',
                    targetRole: recipientGroup === 'PATIENTS' ? 'patient' : 'hospital_staff',
                })
            }

            setTitle('')
            setMessage('')
            setSpecificUserId('')
            await loadNotifications()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send notification')
        } finally {
            setSending(false)
        }
    }

    const iconFor = (status: 'READ' | 'UNREAD') => {
        if (status === 'UNREAD') return <AlertTriangle className="w-5 h-5 text-yellow-600" />
        return <CheckCircle className="w-5 h-5 text-green-600" />
    }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notifications Center</h1>
                <p className="text-muted-foreground mt-1">Backend-integrated alerts and announcements.</p>
      </div>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                                <CardTitle>My Notifications ({unreadCount} unread)</CardTitle>
            </CardHeader>
            <CardContent>
                                {loading ? (
                                    <p className="text-sm text-muted-foreground">Loading notifications...</p>
                                ) : notifications.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No notifications found.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {notifications.map((n) => (
                                            <div key={n.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="mt-1">{iconFor(n.status)}</div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start gap-3">
                                                        <h4 className="font-medium">{n.title || 'Notification'}</h4>
                                                        <span className="text-xs text-muted-foreground">{new Date(n.timestamp).toLocaleString()}</span>
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

        <Card>
            <CardHeader>
                <CardTitle>Send Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                                    <Label>Recipient Group</Label>
                                    <Select value={recipientGroup} onValueChange={(v: 'PATIENTS' | 'HOSPITAL_STAFF' | 'ALL_USERS' | 'SPECIFIC_USER') => setRecipientGroup(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PATIENTS">All Patients</SelectItem>
                                            <SelectItem value="HOSPITAL_STAFF">Hospital Staff</SelectItem>
                                            <SelectItem value="ALL_USERS">All Users</SelectItem>
                                            <SelectItem value="SPECIFIC_USER">Specific User ID</SelectItem>
                                        </SelectContent>
                                    </Select>
                </div>

                                {recipientGroup === 'SPECIFIC_USER' && (
                                    <div className="space-y-2">
                                        <Label>Receiver User ID</Label>
                                        <Input value={specificUserId} onChange={(e) => setSpecificUserId(e.target.value)} placeholder="UUID of receiver" />
                                    </div>
                                )}

                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
                </div>
                <div className="space-y-2">
                                    <Label>Message</Label>
                                    <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message here..." className="min-h-[150px]" />
                </div>
                                <Button disabled={sending} className="w-full" onClick={handleSend}>
                                    <Send className="w-4 h-4 mr-2" />
                                    {sending ? 'Sending...' : 'Send Message'}
                                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
