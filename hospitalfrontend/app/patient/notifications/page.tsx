// app/patient/notifications/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Bell, CheckCircle, AlertCircle, Info, TrendingUp, FileText } from 'lucide-react'
import { useNotificationStore } from '@/store/notificationStore'
import { formatRelativeTime } from '@/lib/utils'

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotificationStore()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-error" />
      default:
        return <Info className="w-5 h-5 text-primary" />
    }
  }

  const getNotificationBorder = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-success'
      case 'warning':
        return 'border-l-4 border-l-warning'
      case 'error':
        return 'border-l-4 border-l-error'
      default:
        return 'border-l-4 border-l-primary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with your account activity</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={unreadCount > 0 ? 'error' : 'outline'}>
            {unreadCount} unread
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Notifications</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    filter === 'unread' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Unread
                </button>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                    notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                  } ${getNotificationBorder(notification.type)}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>{formatRelativeTime(notification.createdAt)}</span>
                          {notification.link && (
                            <a 
                              href={notification.link}
                              className="text-primary hover:underline font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View details
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notification.id)
                      }}
                      className="text-gray-400 hover:text-gray-600 ml-4"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Asset updates</span>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Token changes</span>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Benefit alerts</span>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Today</span>
              <span className="font-semibold text-gray-900">
                {notifications.filter(n => {
                  const date = new Date(n.createdAt)
                  const today = new Date()
                  return date.toDateString() === today.toDateString()
                }).length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">This Week</span>
              <span className="font-semibold text-gray-900">
                {notifications.filter(n => {
                  const date = new Date(n.createdAt)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return date >= weekAgo
                }).length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-gray-900">{notifications.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-error" />
                <span className="text-gray-600">Critical</span>
              </div>
              <span className="font-semibold text-gray-900">
                {notifications.filter(n => n.type === 'error').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-gray-600">Important</span>
              </div>
              <span className="font-semibold text-gray-900">
                {notifications.filter(n => n.type === 'warning').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-gray-600">Standard</span>
              </div>
              <span className="font-semibold text-gray-900">
                {notifications.filter(n => n.type === 'info').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}