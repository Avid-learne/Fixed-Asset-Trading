// Short overview: Patient dashboard home page.
// - Uses `DashboardOverview` component to display complete dashboard with balances, transactions, notifications, and quick links.
// - Relation: imports only `components/patient/DashboardOverview.tsx`
'use client'

import React from 'react'
import DashboardOverview from '@/components/patient/DashboardOverview'

export default function PatientDashboardHome() {
  return <DashboardOverview />
}
