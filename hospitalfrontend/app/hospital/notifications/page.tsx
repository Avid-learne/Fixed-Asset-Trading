'use client'

import NotificationCenter from '@/components/notifications/NotificationCenter'

export default function HospitalStaffNotificationsPage() {
  return (
    <NotificationCenter
      pageTitle="Notifications"
      pageDescription="Receive all notifications. Send messages to patients of your hospital."
      canSend={true}
      hospitalPatientsOnly={true}
    />
  )
}
