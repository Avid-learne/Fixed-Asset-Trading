'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Send, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { StatusBadge } from '../components'

interface Notification {
  id: string
  type: 'announcement' | 'alert' | 'system'
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
  status: 'sent' | 'scheduled' | 'draft'
  recipients: string
  sentDate?: string
  scheduledDate?: string
  readCount?: number
  totalRecipients?: number
}

const mockNotifications: Notification[] = [
  {
    id: 'NOT-001',
    type: 'announcement',
    title: 'Platform Maintenance Scheduled',
    message: 'The platform will undergo scheduled maintenance on Jan 15, 2025 from 2:00 AM to 4:00 AM EST.',
    priority: 'high',
    status: 'sent',
    recipients: 'All Hospitals',
    sentDate: '2024-12-01 10:00',
    readCount: 24,
    totalRecipients: 28
  },
  {
    id: 'NOT-002',
    type: 'alert',
    title: 'Failed Transaction Alert',
    message: 'Multiple transaction failures detected for HOS-003. Immediate action required.',
    priority: 'high',
    status: 'sent',
    recipients: 'HOS-003 Admins',
    sentDate: '2024-12-03 14:22',
    readCount: 2,
    totalRecipients: 3
  },
  {
    id: 'NOT-003',
    type: 'system',
    title: 'New Feature Release',
    message: 'We are excited to announce the launch of advanced analytics dashboard for all Professional and Enterprise plans.',
    priority: 'medium',
    status: 'scheduled',
    recipients: 'Professional & Enterprise Hospitals',
    scheduledDate: '2024-12-15 09:00'
  },
  {
    id: 'NOT-004',
    type: 'announcement',
    title: 'Q4 Performance Report',
    message: 'Your quarterly performance report is now available in the dashboard.',
    priority: 'low',
    status: 'draft',
    recipients: 'All Hospitals'
  }
]

export default function NotificationsPage() {
  const [notifications] = useState<Notification[]>(mockNotifications)
  const [activeTab, setActiveTab] = useState('all')
  
  const [composeForm, setComposeForm] = useState({
    type: 'announcement',
    title: '',
    message: '',
    priority: 'medium',
    recipients: 'all',
    scheduleDate: '',
    scheduleTime: ''
  })

  const handleCompose = () => {
    alert('Notification sent successfully!')
    setComposeForm({
      type: 'announcement',
      title: '',
      message: '',
      priority: 'medium',
      recipients: 'all',
      scheduleDate: '',
      scheduleTime: ''
    })
  }

  const useTemplate = (templateName: string) => {
    const templates = {
      maintenance: {
        type: 'announcement',
        title: 'Scheduled Platform Maintenance',
        message: 'The platform will undergo scheduled maintenance on [DATE] from [TIME] to [TIME] [TIMEZONE]. During this period, services may be temporarily unavailable. We apologize for any inconvenience.',
        priority: 'high',
        recipients: 'all'
      },
      security: {
        type: 'alert',
        title: 'Security Alert',
        message: 'We have detected [SECURITY_ISSUE]. Please review your account security settings and [RECOMMENDED_ACTION]. If you did not authorize this activity, please contact support immediately.',
        priority: 'high',
        recipients: 'all'
      },
      feature: {
        type: 'announcement',
        title: 'New Feature Release',
        message: 'We are excited to announce the launch of [FEATURE_NAME]. This new feature provides [DESCRIPTION] and is available to [PLAN_TYPES]. Learn more in our documentation.',
        priority: 'medium',
        recipients: 'all'
      },
      payment: {
        type: 'announcement',
        title: 'Payment Reminder',
        message: 'This is a friendly reminder that your payment of [AMOUNT] is due on [DUE_DATE]. Please ensure timely payment to avoid service interruption. Thank you for your continued partnership.',
        priority: 'medium',
        recipients: 'all'
      }
    }

    const template = templates[templateName as keyof typeof templates]
    if (template) {
      setComposeForm({
        ...composeForm,
        type: template.type as any,
        title: template.title,
        message: template.message,
        priority: template.priority as any,
        recipients: template.recipients
      })
      setActiveTab('compose')
    }
  }

  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    scheduled: notifications.filter(n => n.status === 'scheduled').length,
    drafts: notifications.filter(n => n.status === 'draft').length
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Bell className="h-4 w-4" />
      case 'alert': return <AlertCircle className="h-4 w-4" />
      case 'system': return <Info className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800'
      case 'alert': return 'bg-red-100 text-red-800'
      case 'system': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">Send announcements and alerts to hospitals</p>
      </div>

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
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-600">{stats.drafts}</p>
              </div>
              <Info className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* All Notifications Tab */}
        <TabsContent value="all" className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getTypeColor(notification.type)}>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(notification.type)}
                          {notification.type}
                        </div>
                      </Badge>
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority} priority
                      </Badge>
                      <StatusBadge 
                        status={notification.status === 'sent' ? 'success' : notification.status === 'scheduled' ? 'pending' : 'inactive'} 
                        text={notification.status}
                        size="sm" 
                      />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{notification.title}</h3>
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Recipients:</span> {notification.recipients}
                      </div>
                      {notification.sentDate && (
                        <div>
                          <span className="font-medium">Sent:</span> {notification.sentDate}
                        </div>
                      )}
                      {notification.scheduledDate && (
                        <div>
                          <span className="font-medium">Scheduled:</span> {notification.scheduledDate}
                        </div>
                      )}
                      {notification.readCount !== undefined && (
                        <div>
                          <span className="font-medium">Read:</span> {notification.readCount}/{notification.totalRecipients}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">View</Button>
                    {notification.status === 'draft' && (
                      <Button variant="outline" size="sm" className="gap-1">
                        <Send className="h-3 w-3" />
                        Send
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                  <Select value={composeForm.type} onValueChange={(v) => setComposeForm({...composeForm, type: v})}>
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
                  <Select value={composeForm.priority} onValueChange={(v) => setComposeForm({...composeForm, priority: v})}>
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
                      <SelectItem value="all">All Hospitals</SelectItem>
                      <SelectItem value="active">Active Hospitals Only</SelectItem>
                      <SelectItem value="professional">Professional Plan</SelectItem>
                      <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                      <SelectItem value="custom">Custom Selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                <Button onClick={handleCompose} className="gap-2">
                  <Send className="h-4 w-4" />
                  {composeForm.scheduleDate ? 'Schedule Notification' : 'Send Now'}
                </Button>
                <Button variant="outline">Save as Draft</Button>
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
