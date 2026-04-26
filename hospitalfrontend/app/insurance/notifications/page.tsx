'use client'

import NotificationCenter from '@/components/notifications/NotificationCenter'

export default function InsuranceNotificationsPage() {
  return (
    <NotificationCenter
      pageTitle="Insurance Notifications"
      pageDescription="Track NOC workflow updates and communicate insurer decisions."
      canSend={true}
      allowedRoleTargets={['hospital_admin', 'patient']}
    />
  )
}
