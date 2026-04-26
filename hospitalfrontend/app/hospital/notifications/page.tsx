'use client'

import NotificationCenter from '@/components/notifications/NotificationCenter'

export default function HospitalStaffNotificationsPage() {
  return (
    <NotificationCenter
      pageTitle="Notifications"
      pageDescription="Stay updated with alerts and announcements."
      canSend={false}
    />
  )
}
