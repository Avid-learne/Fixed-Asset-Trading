'use client'

import NotificationCenter from '@/components/notifications/NotificationCenter'

export default function NotificationsPage() {
  return (
    <NotificationCenter
      pageTitle="Notifications Center"
      pageDescription="View received notifications and send updates from one place."
      canSend={true}
      allowedRoleTargets={['patient', 'hospital_staff', 'hospital_admin']}
    />
  )
}
