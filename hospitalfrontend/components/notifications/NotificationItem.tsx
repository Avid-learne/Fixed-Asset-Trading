import React from 'react'
import { PortalNotification } from '@/services/notificationService'
import { Bell, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

interface NotificationItemProps {
  notification: PortalNotification
  onNotificationClick: (notification: PortalNotification) => void
}

export function NotificationItem({ notification, onNotificationClick }: NotificationItemProps) {
  const isUnread = notification.status === 'UNREAD'

  const getIconForType = () => {
    const type = notification.notificationType || ''
    if (type.includes('REJECTED') || type.includes('FAILED')) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    if (type.includes('APPROVED') || type.includes('ACTIVE') || type.includes('COMPLETED')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (type.includes('SUBMITTED') || type.includes('PENDING')) {
      return <Clock className="h-4 w-4 text-yellow-500" />
    }
    return <Bell className="h-4 w-4 text-blue-500" />
  }

  const timestamp = notification.timestamp
    ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })
    : 'Recently'

  return (
    <div
      onClick={() => onNotificationClick(notification)}
      className={`p-3 border rounded-lg cursor-pointer transition-all ${
        isUnread
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 flex-shrink-0">{getIconForType()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p
                className={`text-sm font-semibold ${
                  isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {notification.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{notification.message}</p>
            </div>
            {isUnread && (
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{timestamp}</span>
            <ArrowRight className="h-3 w-3 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  )
}
