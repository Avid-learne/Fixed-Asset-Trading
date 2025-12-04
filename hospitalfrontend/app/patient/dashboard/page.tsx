'use client'

import React from 'react'
import { BalanceCard } from '@/components/patient/BalanceCard'
import { ActivityList } from '@/components/patient/ActivityList'
import { KYCProgressBar } from '@/components/patient/KYCProgressBar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PatientDashboardHome() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your tokens and activity</p>
        </div>
        <div className="flex gap-2">
          <Link href="/patient/deposit/start"><Button>Deposit Asset</Button></Link>
          <Link href="/patient/redeem"><Button variant="outline">Redeem HT</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard title="AT Balance" value={0} subtitle="Asset Tokens" />
        <BalanceCard title="HT Balance" value={0} subtitle="Health Tokens" />
        <BalanceCard title="Pending Deposits" value={0} subtitle="Awaiting verification" />
      </div>

      <KYCProgressBar status="Not Submitted" />

      <div>
        <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>
        <ActivityList items={[]} />
      </div>
    </div>
  )
}
