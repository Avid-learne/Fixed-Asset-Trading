'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, Bell, CheckCircle, Info, RefreshCw, Send } from 'lucide-react'
import { notificationService, type PortalNotification } from '@/services/notificationService'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/lib/authService'
import { patientService, type PatientWithBalance } from '@/services/patientService'

type SendTargetType = 'ALL_USERS' | 'ROLE' | 'USER'

interface NotificationCenterProps {
  pageTitle?: string
  pageDescription?: string
  canSend?: boolean
  allowedRoleTargets?: string[]
  hospitalPatientsOnly?: boolean
}

const defaultRoleTargets = ['patient', 'hospital_staff', 'hospital_admin', 'bank_staff', 'insurance_company', 'admin']

const statusBadge = (status: 'READ' | 'UNREAD') => {
  if (status === 'UNREAD') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-green-100 text-green-800 border-green-200'
}

export default function NotificationCenter({
  pageTitle = 'Notifications',
  pageDescription = 'View and manage your notifications.',
  canSend = false,
  allowedRoleTargets = defaultRoleTargets,
  hospitalPatientsOnly = false,
}: NotificationCenterProps) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const storedUser = authService.getUser()
  const activeUser = user || storedUser
  const userId = (activeUser as any)?.id || (activeUser as any)?.userId
  const hospitalId = (activeUser as any)?.hospitalId

  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'compose'>('received')
  const [received, setReceived] = useState<PortalNotification[]>([])
  const [sent, setSent] = useState<PortalNotification[]>([])
  const [selected, setSelected] = useState<PortalNotification | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const [targetType, setTargetType] = useState<SendTargetType>(hospitalPatientsOnly ? 'USER' : 'ALL_USERS')
  const [targetRole, setTargetRole] = useState(allowedRoleTargets[0] || 'patient')
  const [receiverUserId, setReceiverUserId] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const [hospitalPatients, setHospitalPatients] = useState<PatientWithBalance[]>([])
  const [patientsLoading, setPatientsLoading] = useState(false)

  useEffect(() => {
    if (!hospitalPatientsOnly || !canSend || !hospitalId) return
    let cancelled = false
    const loadPatients = async () => {
      try {
        setPatientsLoading(true)
        const list = await patientService.getPatientsByHospital(String(hospitalId))
        if (!cancelled) setHospitalPatients(list)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load hospital patients')
        }
      } finally {
        if (!cancelled) setPatientsLoading(false)
      }
    }
    loadPatients()
    return () => { cancelled = true }
  }, [hospitalPatientsOnly, canSend, hospitalId])

  const load = async () => {
    if (authLoading) return

    if (!userId) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const receivedPromise = notificationService.getUserNotifications(String(userId))
      const sentPromise = canSend ? notificationService.getSentNotifications(String(userId)) : Promise.resolve([])
      const [receivedRows, sentRows] = await Promise.all([receivedPromise, sentPromise])
      // Exclude notifications where the sender is the active user (don't show admin's own broadcast in their inbox)
      const currentName = (activeUser as any)?.name || ''
      const filteredReceived = (receivedRows || []).filter((r) => {
        return !(r.senderName && currentName && r.senderName === currentName)
      })
      setReceived(filteredReceived)
      setSent(sentRows)

      if (!selected && receivedRows.length > 0) {
        setSelected(receivedRows[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [userId, authLoading, canSend])

  useEffect(() => {
    const onChanged = () => {
      load()
    }
    window.addEventListener('notifications:changed', onChanged)
    return () => window.removeEventListener('notifications:changed', onChanged)
  }, [userId, authLoading, canSend])

  const unreadCount = useMemo(() => received.filter((n) => n.status === 'UNREAD').length, [received])

  const openNotification = async (notification: PortalNotification) => {
    setSelected(notification)

    if (!userId || notification.status !== 'UNREAD') return

    try {
      await notificationService.markAsRead(String(userId), notification.id)
      setReceived((prev) => prev.map((n) => (n.id === notification.id ? { ...n, status: 'READ' } : n)))
      setSelected((prev) => (prev && prev.id === notification.id ? { ...prev, status: 'READ' } : prev))

      // Navigate to the notification's URL if available
      if (notification.navigationUrl) {
        router.push(notification.navigationUrl)
      }
    } catch {
      // Keep UX responsive even if mark-read API fails.
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!userId) return

    try {
      await notificationService.markAllAsRead(String(userId))
      setReceived((prev) => prev.map((n) => ({ ...n, status: 'READ' })))
      setSelected((prev) => (prev ? { ...prev, status: 'READ' } : prev))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read')
    }
  }

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required')
      return
    }

    if (targetType === 'USER' && !receiverUserId.trim()) {
      setError('Receiver user ID is required when target type is USER')
      return
    }

    // Defensive guard: if restricted to hospital patients, force USER + verify the
    // selected receiver is in the hospital's patient list.
    if (hospitalPatientsOnly) {
      const allowedIds = new Set(hospitalPatients.map((p) => String(p.userId || p.id)))
      if (!allowedIds.has(receiverUserId.trim())) {
        setError('You can only send notifications to patients of your hospital.')
        return
      }
    }

    try {
      setSending(true)
      setError('')

      await notificationService.send({
        title: title.trim(),
        message: message.trim(),
        targetType: hospitalPatientsOnly ? 'USER' : targetType,
        targetRole: !hospitalPatientsOnly && targetType === 'ROLE' ? targetRole : undefined,
        receiverUserId: hospitalPatientsOnly || targetType === 'USER' ? receiverUserId.trim() : undefined,
      })

      setTitle('')
      setMessage('')
      setReceiverUserId('')
      setActiveTab(canSend ? 'sent' : 'received')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const list = activeTab === 'sent' ? sent : received

  const groupedSent = useMemo(() => {
    // group sent notifications by title+message+minute to collapse broadcast duplicates
    const map = new Map<string, {
      ids: string[]
      title: string
      message: string
      timestamp: string
      senderName?: string
      count: number
    }>()

    for (const n of sent) {
      const minuteKey = new Date(n.timestamp).toISOString().slice(0,16) // group by minute
      const key = `${n.title}||${n.message}||${minuteKey}`
      const existing = map.get(key)
      if (!existing) {
        map.set(key, { ids: [n.id], title: n.title, message: n.message, timestamp: n.timestamp, senderName: n.senderName, count: 1 })
      } else {
        existing.ids.push(n.id)
        existing.count += 1
      }
    }

    return Array.from(map.values())
  }, [sent])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
          <p className="text-muted-foreground mt-1">{pageDescription}</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'received' && unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
          )}
          <Button variant="outline" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'received' | 'sent' | 'compose')} className="space-y-4">
        <TabsList className={canSend ? 'grid w-full grid-cols-3' : 'grid w-full grid-cols-1'}>
          <TabsTrigger value="received" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Received
            {unreadCount > 0 && <Badge variant="destructive" className="h-5 px-1.5 text-xs">{unreadCount}</Badge>}
          </TabsTrigger>
          {canSend && <TabsTrigger value="sent">Sent</TabsTrigger>}
          {canSend && <TabsTrigger value="compose">Compose</TabsTrigger>}
        </TabsList>

        <TabsContent value="received" className="space-y-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Inbox</CardTitle>
                <CardDescription>Click a notification to open details and mark it as read.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading notifications...</p>
                ) : list.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No notifications available.</p>
                ) : (
                  <div className="space-y-3">
                    {received.map((n) => (
                      <button
                        key={n.id}
                        className={`w-full text-left flex gap-3 p-4 border rounded-lg transition-colors ${
                          n.status === 'UNREAD'
                            ? 'bg-blue-50 hover:bg-blue-100 border-blue-200'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => openNotification(n)}
                      >
                        <div className="mt-0.5">
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
                              <Badge className={statusBadge(n.status)}>{n.status}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(n.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
                <CardDescription>Full notification details</CardDescription>
              </CardHeader>
              <CardContent>
                {!selected ? (
                  <p className="text-sm text-muted-foreground">Select a notification to open details.</p>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Title</Label>
                      <p className="font-medium mt-1">{selected.title || 'Notification'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Message</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{selected.message}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Status:</span>{' '}
                        <Badge className={statusBadge(selected.status)}>{selected.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sender: {selected.senderName || 'System'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Time: {new Date(selected.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {selected.status === 'UNREAD' && (
                      <Button
                        size="sm"
                        onClick={() => openNotification(selected)}
                        className="w-full"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {canSend && (
          <TabsContent value="sent" className="space-y-0">
            <Card>
              <CardHeader>
                <CardTitle>Sent Notifications</CardTitle>
                <CardDescription>Messages sent from your account.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading sent notifications...</p>
                ) : sent.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sent notifications yet.</p>
                ) : (
                  <div className="space-y-3">
                    {groupedSent.map((g) => {
                      const key = g.ids[0]
                      const isBroadcast = g.count > 1
                      return (
                        <div key={key} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start gap-3">
                            <h4 className="font-medium">{g.title || 'Notification'}</h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(g.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{g.message}</p>
                          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                            <Info className="w-3 h-3" />
                            <span>
                              Receiver: {isBroadcast ? 'All users' : g.senderName || 'User'}{isBroadcast ? ` (${g.count} recipients)` : ''}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canSend && (
          <TabsContent value="compose" className="space-y-0">
            <Card>
              <CardHeader>
                <CardTitle>Compose Notification</CardTitle>
                <CardDescription>Send quick notifications in a standard format.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hospitalPatientsOnly ? (
                  <div>
                    <Label>Send to Patient</Label>
                    <Select
                      value={receiverUserId}
                      onValueChange={setReceiverUserId}
                      disabled={patientsLoading || hospitalPatients.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          patientsLoading
                            ? 'Loading hospital patients...'
                            : hospitalPatients.length === 0
                              ? 'No patients found for your hospital'
                              : 'Select a patient'
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50 shadow-lg border">
                        {hospitalPatients.map((p) => {
                          const id = String(p.userId || p.id)
                          return (
                            <SelectItem key={id} value={id}>
                              {p.fullName || 'Unnamed'}{p.email ? ` · ${p.email}` : ''}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hospital staff can only message patients of their own hospital.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label>Target Type</Label>
                      <Select value={targetType} onValueChange={(v) => setTargetType(v as SendTargetType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL_USERS">ALL_USERS</SelectItem>
                          <SelectItem value="ROLE">ROLE</SelectItem>
                          <SelectItem value="USER">USER</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {targetType === 'ROLE' && (
                      <div>
                        <Label>Target Role</Label>
                        <Select value={targetRole} onValueChange={setTargetRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allowedRoleTargets.map((role) => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {targetType === 'USER' && (
                      <div>
                        <Label>Receiver User ID</Label>
                        <Input
                          value={receiverUserId}
                          onChange={(e) => setReceiverUserId(e.target.value)}
                          placeholder="Enter receiver UUID"
                        />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter message"
                    rows={5}
                  />
                </div>

                <Button onClick={handleSend} disabled={sending} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Notification'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}