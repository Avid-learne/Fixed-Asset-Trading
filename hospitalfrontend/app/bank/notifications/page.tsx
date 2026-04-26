'use client'

import NotificationCenter from '@/components/notifications/NotificationCenter'

export default function BankNotificationsPage() {
  return (
    <NotificationCenter
      pageTitle="Notifications"
      pageDescription="View incoming updates and send simple announcements to connected users."
      canSend={true}
      allowedRoleTargets={['hospital_staff', 'hospital_admin', 'patient']}
    />
  )
}
