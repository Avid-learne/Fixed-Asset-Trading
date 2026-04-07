'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Send, AlertCircle, CheckCircle, Info, Trash2 } from 'lucide-react'
import { authService } from '@/lib/authService'
import { notificationService, type PortalNotification } from '@/services/notificationService'

type NotificationType = 'announcement' | 'alert' | 'system'
type NotificationPriority = 'high' | 'medium' | 'low'

export default function NotificationsPage() {
  const currentUser = authService.getUser()
  const userId = currentUser?.id || (currentUser as any)?.userId

  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [composeForm, setComposeForm] = useState({
    type: 'announcement' as NotificationType,
    title: '',
    message: '',
    priority: 'medium' as NotificationPriority,
    recipients: 'all_users',
    specificUserId: '',
    scheduleDate: '',
    scheduleTime: ''
  })

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

  const handleDeleteNotification = async (notificationId: string) => {
    if (!userId) return
    try {
      await notificationService.deleteReceived(userId, notificationId)
      await loadNotifications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification')
    }
  }

  const handleDeleteAll = async () => {
    if (!userId) return
    try {
      await notificationService.deleteAllReceived(userId)
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
    const allSelected = notifications.every(n => selectedIds.has(n.id))
    setSelectedIds(allSelected ? new Set() : new Set(notifications.map(n => n.id)))
  }

  const handleDeleteSelected = async () => {
    if (!userId || selectedIds.size === 0) return
    try {
      await notificationService.deleteSelectedReceived(userId, Array.from(selectedIds))
      setSelectedIds(new Set())
      await loadNotifications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete selected notifications')
    }
  }

  const handleCompose = async () => {
    if (!composeForm.title.trim() || !composeForm.message.trim()) {
      setError('Title and message are required')
      return
    }

    try {
      setSending(true)
      setError('')

      if (composeForm.recipients === 'specific_user') {
        if (!composeForm.specificUserId.trim()) {
          setError('Specific user ID is required for this recipient selection')
          return
        }

        await notificationService.send({
          title: composeForm.title,
          message: composeForm.message,
          targetType: 'USER',
          receiverUserId: composeForm.specificUserId.trim(),
        })
      } else if (composeForm.recipients === 'patients') {
        await notificationService.send({
          title: composeForm.title,
          message: composeForm.message,
          targetType: 'ROLE',
          targetRole: 'patient',
        })
      } else if (composeForm.recipients === 'hospital_staff') {
        await notificationService.send({
          title: composeForm.title,
          message: composeForm.message,
          targetType: 'ROLE',
          targetRole: 'hospital_staff',
        })
      } else if (composeForm.recipients === 'hospital_admins') {
        await notificationService.send({
          title: composeForm.title,
          message: composeForm.message,
          targetType: 'ROLE',
          targetRole: 'hospital_admin',
        })
      } else {
        await notificationService.send({
          title: composeForm.title,
          message: composeForm.message,
          targetType: 'ALL_USERS',
        })
      }

      setComposeForm({
        type: 'announcement',
        title: '',
        message: '',
        priority: 'medium',
        recipients: 'all_users',
        specificUserId: '',
        scheduleDate: '',
        scheduleTime: ''
      })

      await loadNotifications()
      setActiveTab('all')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const useTemplate = (templateName: string) => {
    const templates = {
      maintenance: {
        type: 'announcement',
        title: 'Scheduled Platform Maintenance',
        message: 'The platform will undergo scheduled maintenance on [DATE] from [TIME] to [TIME] [TIMEZONE]. During this period, services may be temporarily unavailable. We apologize for any inconvenience.',
        priority: 'high',
        recipients: 'all_users'
      },
      security: {
        type: 'alert',
        title: 'Security Alert',
        message: 'We have detected [SECURITY_ISSUE]. Please review your account security settings and [RECOMMENDED_ACTION]. If you did not authorize this activity, please contact support immediately.',
        priority: 'high',
        recipients: 'all_users'
      },
      feature: {
        type: 'announcement',
        title: 'New Feature Release',
        message: 'We are excited to announce the launch of [FEATURE_NAME]. This new feature provides [DESCRIPTION] and is available to [PLAN_TYPES]. Learn more in our documentation.',
        priority: 'medium',
        recipients: 'all_users'
      },
      payment: {
        type: 'announcement',
        title: 'Payment Reminder',
        message: 'This is a friendly reminder that your payment of [AMOUNT] is due on [DUE_DATE]. Please ensure timely payment to avoid service interruption. Thank you for your continued partnership.',
        priority: 'medium',
        recipients: 'all_users'
      }
    }

    const template = templates[templateName as keyof typeof templates]
    if (template) {
      setComposeForm({
        ...composeForm,
        type: template.type as NotificationType,
        title: template.title,
        message: template.message,
        priority: template.priority as NotificationPriority,
        recipients: template.recipients
      })
      setActiveTab('compose')
    }
  }

  const unread = useMemo(() => notifications.filter((n) => n.status === 'UNREAD').length, [notifications])

  const stats = {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === 'READ').length,
    unread,
  }

  const getStatusBadgeClass = (status: 'READ' | 'UNREAD') => {
    return status === 'READ'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">Send announcements and alerts with live backend data</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.unread}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.total > 0 ? `${Math.round((stats.sent / stats.total) * 100)}%` : '0%'}
                </p>
              </div>
              <Info className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* All Notifications Tab */}
        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-sm text-gray-600">Loading notifications...</CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm text-gray-600">No notifications available.</CardContent>
            </Card>
          ) : (
            <>
            {notifications.length > 1 && (
              <div className="flex items-center gap-3 px-1">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" className="rounded" checked={notifications.every(n => selectedIds.has(n.id))} onChange={toggleSelectAll} />
                  Select all
                </label>
                {selectedIds.size > 0 && (
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 text-xs" onClick={handleDeleteSelected}>
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete Selected ({selectedIds.size})
                  </Button>
                )}
              </div>
            )}
            {notifications.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                    <input type="checkbox" className="rounded mt-1" checked={selectedIds.has(notification.id)} onChange={() => toggleSelect(notification.id)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          <div className="flex items-center gap-1">
                            <Bell className="h-4 w-4" />
                            notification
                          </div>
                        </Badge>
                        <Badge className={getStatusBadgeClass(notification.status)}>{notification.status.toLowerCase()}</Badge>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{notification.title || 'Notification'}</h3>
                      <p className="text-gray-600 mb-3">{notification.message}</p>

                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Time:</span> {new Date(notification.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {notification.status === 'UNREAD' && userId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={async () => {
                            try {
                              await notificationService.markAsRead(userId, notification.id)
                              await loadNotifications()
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Failed to mark notification as read')
                            }
                          }}
                        >
                          <CheckCircle className="h-3 w-3" />
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </>
          )}
        </TabsContent>

        {/* Compose Tab */}
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Compose New Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Notification Type</Label>
                  <Select value={composeForm.type} onValueChange={(v: NotificationType) => setComposeForm({...composeForm, type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select value={composeForm.priority} onValueChange={(v: NotificationPriority) => setComposeForm({...composeForm, priority: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Recipients</Label>
                  <Select value={composeForm.recipients} onValueChange={(v) => setComposeForm({...composeForm, recipients: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="patients">All Patients</SelectItem>
                      <SelectItem value="hospital_staff">Hospital Staff</SelectItem>
                      <SelectItem value="hospital_admins">Hospital Admins</SelectItem>
                      <SelectItem value="specific_user">Specific User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {composeForm.recipients === 'specific_user' && (
                  <div className="col-span-2">
                    <Label>Specific User ID</Label>
                    <Input
                      value={composeForm.specificUserId}
                      onChange={(e) => setComposeForm({...composeForm, specificUserId: e.target.value})}
                      placeholder="Enter receiver UUID"
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <Label>Title</Label>
                  <Input
                    value={composeForm.title}
                    onChange={(e) => setComposeForm({...composeForm, title: e.target.value})}
                    placeholder="Enter notification title"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Message</Label>
                  <Textarea
                    value={composeForm.message}
                    onChange={(e) => setComposeForm({...composeForm, message: e.target.value})}
                    placeholder="Enter notification message..."
                    rows={5}
                  />
                </div>

                <div>
                  <Label>Schedule Date (Optional)</Label>
                  <Input
                    type="date"
                    value={composeForm.scheduleDate}
                    onChange={(e) => setComposeForm({...composeForm, scheduleDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Schedule Time (Optional)</Label>
                  <Input
                    type="time"
                    value={composeForm.scheduleTime}
                    onChange={(e) => setComposeForm({...composeForm, scheduleTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCompose} className="gap-2" disabled={sending}>
                  <Send className="h-4 w-4" />
                  {sending ? 'Sending...' : composeForm.scheduleDate ? 'Schedule Notification' : 'Send Now'}
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!userId) return
                    try {
                      await notificationService.markAllAsRead(userId)
                      await loadNotifications()
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to mark all as read')
                    }
                  }}
                >
                  Mark All As Read
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDeleteAll}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:border-cyan-600 transition-colors">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Maintenance Notice</h3>
                <p className="text-sm text-gray-600 mb-4">Template for scheduled maintenance announcements</p>
                <Button variant="outline" size="sm" onClick={() => useTemplate('maintenance')}>Use Template</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-cyan-600 transition-colors">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Security Alert</h3>
                <p className="text-sm text-gray-600 mb-4">Template for security-related notifications</p>
                <Button variant="outline" size="sm" onClick={() => useTemplate('security')}>Use Template</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-cyan-600 transition-colors">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Feature Release</h3>
                <p className="text-sm text-gray-600 mb-4">Template for new feature announcements</p>
                <Button variant="outline" size="sm" onClick={() => useTemplate('feature')}>Use Template</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-cyan-600 transition-colors">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Payment Reminder</h3>
                <p className="text-sm text-gray-600 mb-4">Template for billing and payment reminders</p>
                <Button variant="outline" size="sm" onClick={() => useTemplate('payment')}>Use Template</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
