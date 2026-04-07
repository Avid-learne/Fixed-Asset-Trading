'use client'

import React, { useEffect, useMemo, useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Info, Send, Bell, RefreshCw, ArrowDownLeft, ArrowUpRight, ChevronDown, ChevronUp, Users, Trash2 } from 'lucide-react'
import { authService } from '@/lib/authService'
import { notificationService, type PortalNotification } from '@/services/notificationService'

export default function NotificationsPage() {
    const currentUser = authService.getUser()
    const userId = currentUser?.id || (currentUser as any)?.userId

    const [receivedNotifications, setReceivedNotifications] = useState<PortalNotification[]>([])
    const [sentNotifications, setSentNotifications] = useState<PortalNotification[]>([])
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [sending, setSending] = useState(false)

    const [recipientGroup, setRecipientGroup] = useState<'PATIENTS' | 'HOSPITAL_STAFF' | 'HOSPITAL_ADMIN' | 'ALL_USERS' | 'SPECIFIC_USER'>('PATIENTS')
    const [specificUserId, setSpecificUserId] = useState('')
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null)

    const loadNotifications = async () => {
        if (!userId) {
            setError('User not authenticated')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError('')
            const [received, sent] = await Promise.all([
                notificationService.getUserNotifications(userId),
                notificationService.getSentNotifications(userId),
            ])
            setReceivedNotifications(received)
            setSentNotifications(sent)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadNotifications()
    }, [userId])

    const unreadCount = useMemo(() => receivedNotifications.filter((n) => n.status === 'UNREAD').length, [receivedNotifications])

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

    const handleDeleteReceived = async (notificationId: string) => {
        if (!userId) return
        try {
            await notificationService.deleteReceived(userId, notificationId)
            await loadNotifications()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete notification')
        }
    }

    const handleDeleteAllReceived = async () => {
        if (!userId) return
        try {
            await notificationService.deleteAllReceived(userId)
            await loadNotifications()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete notifications')
        }
    }

    const handleDeleteAllSent = async () => {
        if (!userId) return
        try {
            await notificationService.deleteAllSent(userId)
            await loadNotifications()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete notifications')
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id); else next.add(id)
            return next
        })
    }

    const toggleSelectAll = () => {
        const currentIds = (activeTab === 'received' ? receivedNotifications : sentNotifications).map(n => n.id)
        const allSelected = currentIds.every(id => selectedIds.has(id))
        setSelectedIds(allSelected ? new Set() : new Set(currentIds))
    }

    const handleDeleteSelected = async () => {
        if (!userId || selectedIds.size === 0) return
        try {
            const ids = Array.from(selectedIds)
            if (activeTab === 'received') {
                await notificationService.deleteSelectedReceived(userId, ids)
            } else {
                await notificationService.deleteSelectedSent(userId, ids)
            }
            setSelectedIds(new Set())
            await loadNotifications()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete selected notifications')
        }
    }

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
                const roleMap: Record<string, string> = {
                    PATIENTS: 'patient',
                    HOSPITAL_STAFF: 'hospital_staff',
                    HOSPITAL_ADMIN: 'hospital_admin',
                }
                await notificationService.send({
                    title,
                    message,
                    targetType: 'ROLE',
                    targetRole: roleMap[recipientGroup] || 'patient',
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

    const groupedSentNotifications = useMemo(() => {
        const groups: Map<string, { notification: PortalNotification; recipients: string[]; count: number }> = new Map()
        for (const n of sentNotifications) {
            // Group by title + message + timestamp (rounded to the same second)
            const ts = new Date(n.timestamp).toISOString().slice(0, 19)
            const key = `${n.title}||${n.message}||${ts}`
            const existing = groups.get(key)
            if (existing) {
                existing.count++
                if (n.senderName && n.senderName !== 'Unknown') {
                    existing.recipients.push(n.senderName)
                }
            } else {
                groups.set(key, {
                    notification: n,
                    recipients: n.senderName && n.senderName !== 'Unknown' ? [n.senderName] : [],
                    count: 1,
                })
            }
        }
        return Array.from(groups.values())
    }, [sentNotifications])

    const getGroupRecipientLabel = useCallback((group: { recipients: string[]; count: number }) => {
        if (group.count === 1 && group.recipients.length === 1) {
            return `To: ${group.recipients[0]}`
        }
        return `To: All Users (${group.count})`
    }, [])

    const currentList = activeTab === 'received' ? receivedNotifications : sentNotifications

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Notifications Center</h1>
                    <p className="text-muted-foreground mt-1">View received and sent notifications.</p>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'received' && unreadCount > 0 && (
                        <Button variant="outline" onClick={handleMarkAllAsRead}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark All as Read
                        </Button>
                    )}
                    {selectedIds.size > 0 && (
                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDeleteSelected}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected ({selectedIds.size})
                        </Button>
                    )}
                    {((activeTab === 'received' && receivedNotifications.length > 0) || (activeTab === 'sent' && sentNotifications.length > 0)) && (
                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={activeTab === 'received' ? handleDeleteAllReceived : handleDeleteAllSent}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete All
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Notifications
                            </CardTitle>
                            <div className="flex gap-1 bg-muted p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('received')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                                        activeTab === 'received'
                                            ? 'bg-white text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <ArrowDownLeft className="w-3.5 h-3.5" />
                                    Received
                                    {unreadCount > 0 && (
                                        <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">{unreadCount}</Badge>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('sent')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                                        activeTab === 'sent'
                                            ? 'bg-white text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    Sent ({groupedSentNotifications.length})
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">Loading notifications...</p>
                        ) : activeTab === 'received' && receivedNotifications.length === 0 ? (
                            <div className="text-center py-8">
                                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No received notifications.</p>
                            </div>
                        ) : activeTab === 'sent' && groupedSentNotifications.length === 0 ? (
                            <div className="text-center py-8">
                                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No sent notifications.</p>
                            </div>
                        ) : activeTab === 'received' ? (
                            <div className="space-y-3">
                                {receivedNotifications.length > 1 && (
                                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer px-1">
                                        <input type="checkbox" className="rounded" checked={receivedNotifications.every(n => selectedIds.has(n.id))} onChange={toggleSelectAll} />
                                        Select all
                                    </label>
                                )}
                                {receivedNotifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`flex gap-3 p-4 border rounded-lg transition-colors ${
                                            n.status === 'UNREAD'
                                                ? 'bg-blue-50 hover:bg-blue-100 border-blue-200'
                                                : 'hover:bg-muted/50'
                                        }`}
                                    >
                                        <div className="flex items-start pt-1">
                                            <input type="checkbox" className="rounded" checked={selectedIds.has(n.id)} onChange={() => toggleSelect(n.id)} />
                                        </div>
                                        <div className="mt-0.5 cursor-pointer" onClick={() => n.status === 'UNREAD' && handleMarkAsRead(n.id)}>
                                            {n.status === 'UNREAD' ? (
                                                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                            ) : (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium">{n.title || 'Notification'}</h4>
                                                    <Badge variant={n.status === 'UNREAD' ? 'default' : 'secondary'} className="text-xs">
                                                        {n.status}
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {new Date(n.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <Info className="w-3 h-3" />
                                                    <span>From: {n.senderName || 'System'}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteReceived(n.id) }}
                                                    className="text-muted-foreground hover:text-red-600 transition-colors p-1 rounded"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {groupedSentNotifications.map((group) => {
                                    const groupKey = `${group.notification.id}`
                                    const isExpanded = expandedGroup === groupKey
                                    const hasMultiple = group.count > 1

                                    return (
                                        <div
                                            key={groupKey}
                                            className="flex gap-4 p-4 border rounded-lg transition-colors hover:bg-muted/50"
                                        >
                                            <div className="mt-1">
                                                <ArrowUpRight className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium">{group.notification.title || 'Notification'}</h4>
                                                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">Sent</Badge>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {new Date(group.notification.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{group.notification.message}</p>
                                                <div className="mt-2">
                                                    {hasMultiple ? (
                                                        <button
                                                            onClick={() => setExpandedGroup(isExpanded ? null : groupKey)}
                                                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            <Users className="w-3 h-3" />
                                                            <span>{getGroupRecipientLabel(group)}</span>
                                                            {isExpanded
                                                                ? <ChevronUp className="w-3 h-3" />
                                                                : <ChevronDown className="w-3 h-3" />
                                                            }
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Info className="w-3 h-3" />
                                                            <span>{getGroupRecipientLabel(group)}</span>
                                                        </div>
                                                    )}
                                                    {isExpanded && hasMultiple && (
                                                        <div className="mt-2 ml-4 space-y-1 border-l-2 border-blue-200 pl-3">
                                                            {group.recipients.map((name, i) => (
                                                                <div key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                                    {name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
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
                            <Select value={recipientGroup} onValueChange={(v: 'PATIENTS' | 'HOSPITAL_STAFF' | 'HOSPITAL_ADMIN' | 'ALL_USERS' | 'SPECIFIC_USER') => setRecipientGroup(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent position="popper" className="z-[100] bg-white shadow-lg border">
                                    <SelectItem value="PATIENTS">All Patients</SelectItem>
                                    <SelectItem value="HOSPITAL_STAFF">Hospital Staff</SelectItem>
                                    <SelectItem value="HOSPITAL_ADMIN">Hospital Admins</SelectItem>
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
