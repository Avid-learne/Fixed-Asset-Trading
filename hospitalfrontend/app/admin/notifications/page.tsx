'use client'

import NotificationCenter from '@/components/notifications/NotificationCenter'

export default function AdminNotificationsPage() {
  return (
    <NotificationCenter
      pageTitle="Notifications Center"
      pageDescription="Manage system-wide notifications in a single, consistent workflow."
      canSend={true}
      allowedRoleTargets={['patient', 'hospital_staff', 'hospital_admin', 'bank_staff', 'admin']}
    />
  )
}
