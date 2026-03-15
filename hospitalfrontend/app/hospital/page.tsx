'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Users, Clock, CheckCircle2, Coins, HeartPulse } from 'lucide-react'
import { dashboardService, type HospitalDashboardSummary } from '@/services/dashboardService'

export default function HospitalDashboard() {
  const [data, setData] = useState<HospitalDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      setData(await dashboardService.getHospitalSummary())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hospital dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hospital Dashboard</h1>
          <p className="text-sm text-muted-foreground">Operational summary integrated with backend data</p>
        </div>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>{data?.hospitalName || 'Hospital'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-muted/30 p-4 text-sm">
            <p className="font-medium">Revolving Credit Line Model</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Operational financing is treated as a revolving credit line.</li>
              <li>Credit headroom restores whenever installments are paid.</li>
              <li>Patient subscription inflows add fresh cash monthly.</li>
              <li>Patient deposits increase the base collateral and expand limits.</li>
              <li>Over time, the pool compounds and system capacity scales naturally.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Patients</p>
            <div className="mt-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <p className="text-2xl font-bold">{data?.totalPatients || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending Deposits</p>
            <div className="mt-2 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <p className="text-2xl font-bold">{data?.pendingDeposits || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Bank-Approved Deposits</p>
            <div className="mt-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <p className="text-2xl font-bold">{data?.approvedDeposits || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
            <div className="mt-2 flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-fuchsia-600" />
              <p className="text-2xl font-bold">{data?.activeSubscriptions || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Profit Distributed</p>
            <div className="mt-2 flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-600" />
              <p className="text-2xl font-bold">PKR {Number(data?.totalProfitDistributed || 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/hospital/profit"><Button>Profit Distribution</Button></Link>
        <Link href="/hospital/patients"><Button variant="outline">Patient Profiles</Button></Link>
        <Link href="/hospital/marketplace"><Button variant="outline">Marketplace</Button></Link>
      </div>
    </div>
  )
}
