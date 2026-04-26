'use client'

import NotificationCenter from '@/components/notifications/NotificationCenter'

export default function PatientNotificationsPage() {
  return (
    <NotificationCenter
      pageTitle="Notifications"
      pageDescription="Stay updated with your alerts and announcements."
      canSend={false}
    />
  )
}
