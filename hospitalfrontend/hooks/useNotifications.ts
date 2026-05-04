import { useState, useEffect, useCallback } from 'react'
import { notificationService, PortalNotification } from '@/services/notificationService'
import { useRouter } from 'next/navigation'

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [notifs, count] = await Promise.all([
        notificationService.getUserNotifications(userId),
        notificationService.getUnreadCount(userId),
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchNotifications()

    // Listen for notification updates
    const handleNotificationChange = () => {
      fetchNotifications()
    }

    window.addEventListener('notifications:changed', handleNotificationChange)
    return () => window.removeEventListener('notifications:changed', handleNotificationChange)
  }, [fetchNotifications])

  const handleNotificationClick = useCallback(
    async (notification: PortalNotification) => {
      try {
        // Mark as read
        if (notification.status === 'UNREAD' && userId) {
          await notificationService.markAsRead(userId, notification.id)
        }

        // Navigate to the notification's URL
        if (notification.navigationUrl) {
          router.push(notification.navigationUrl)
        }

        // Refresh notifications
        fetchNotifications()
      } catch (err) {
        console.error('Error handling notification click:', err)
      }
    },
    [userId, router, fetchNotifications]
  )

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return
      try {
        await notificationService.markAsRead(userId, notificationId)
        fetchNotifications()
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
      }
    },
    [userId, fetchNotifications]
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId) return
    try {
      await notificationService.markAllAsRead(userId)
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }, [userId, fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    handleNotificationClick,
    markAsRead,
    markAllAsRead,
  }
}

// Helper to check if a page should be highlighted based on notifications
export const getSidebarItemHighlight = (
  path: string,
  notifications: PortalNotification[]
): { hasUnread: boolean; unreadCount: number } => {
  const matching = notifications.filter(
    (n) =>
      n.status === 'UNREAD' &&
      n.navigationUrl &&
      n.navigationUrl.toLowerCase().includes(path.toLowerCase())
  )

  return {
    hasUnread: matching.length > 0,
    unreadCount: matching.length,
  }
}

// Notification type to navigation URL mapping
export const notificationTypeToUrl: Record<string, string> = {
  ASSET_DEPOSIT_SUBMITTED: '/deposit-asset',
  ASSET_DEPOSIT_APPROVED: '/deposit-asset',
  ASSET_DEPOSIT_REJECTED: '/deposit-asset',
  ASSET_DEPOSIT_CUSTODY_CONFIRMED: '/deposit-asset',
  ASSET_DEPOSIT_TOKENS_MINTED: '/deposit-asset',
  ASSET_DEPOSIT_POOL_MOVED: '/deposit-asset',
  FRACTIONALIZATION_FORWARDED: '/fractionalization',
  FRACTIONALIZATION_NOC_APPROVED: '/fractionalization',
  FRACTIONALIZATION_REJECTED: '/fractionalization',
  FRACTIONALIZATION_ALLOCATION_ACTIVE: '/fractionalization',
  FRACTIONALIZATION_MONTHLY_PROCESS: '/fractionalization',
  FRACTIONALIZATION_BENEFICIARY_ALLOCATION: '/fractionalization',
  SUBSCRIPTION_ACTIVATED: '/subscription',
  SUBSCRIPTION_PLAN_CHANGED: '/subscription',
  SUBSCRIPTION_RENEWED: '/subscription',
  SUBSCRIPTION_CANCELLED: '/subscription',
  EMERGENCY_REDEMPTION_SUBMITTED: '/emergency-redemption',
  EMERGENCY_REDEMPTION_APPROVED: '/emergency-redemption',
  EMERGENCY_REDEMPTION_REJECTED: '/emergency-redemption',
  HEALTH_CARD_ISSUED: '/health-card',
  HEALTH_CARD_ACTIVATED: '/health-card',
  MARKETPLACE_PURCHASE_COMPLETED: '/marketplace',
  MARKETPLACE_SALE_COMPLETED: '/marketplace',
  KYC_STATUS_UPDATED: '/profile',
  ACCOUNT_SECURITY_ALERT: '/profile',
  GENERAL: '/dashboard',
}
