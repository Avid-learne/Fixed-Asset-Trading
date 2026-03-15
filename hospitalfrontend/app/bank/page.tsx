'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Building2, Wallet, Clock, CheckCircle2, XCircle, Link2 } from 'lucide-react'
import { dashboardService, type BankDashboardSummary } from '@/services/dashboardService'

export default function BankDashboard() {
  const [data, setData] = useState<BankDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      setData(await dashboardService.getBankSummary())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bank dashboard')
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
          <h1 className="text-2xl font-bold">Bank Dashboard</h1>
          <p className="text-sm text-muted-foreground">Live custody and review metrics</p>
        </div>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>{data?.bankName || 'Bank'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-muted/30 p-4 text-sm">
            <p className="font-medium">Revolving Credit Line Flow</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Use "revolving credit line" terminology (BOP-aligned).</li>
              <li>Credit restores as installments are paid.</li>
              <li>Investment pool remains stable while credit cycles.</li>
              <li>Subscription pool injects fresh cash every month.</li>
              <li>Pool grows over time as participation increases.</li>
              <li>New patient deposits naturally expand available credit.</li>
              <li>The system scales naturally with demand.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Deposits</p>
            <div className="mt-2 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-sky-600" />
              <p className="text-2xl font-bold">{data?.totalDeposits || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Asset Value in Custody</p>
            <div className="mt-2 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <p className="text-2xl font-bold">PKR {Number(data?.totalAssetValue || 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active Partnerships</p>
            <div className="mt-2 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-indigo-600" />
              <p className="text-2xl font-bold">{data?.activePartnerships || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending Reviews</p>
            <div className="mt-2 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <p className="text-2xl font-bold">{data?.pendingReviews || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Approved Reviews</p>
            <div className="mt-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <p className="text-2xl font-bold">{data?.approvedReviews || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Rejected Reviews</p>
            <div className="mt-2 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-600" />
              <p className="text-2xl font-bold">{data?.rejectedReviews || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/bank/deposits"><Button>Open Deposit Requests</Button></Link>
        <Link href="/bank/integrations"><Button variant="outline">View Integrations</Button></Link>
        <Link href="/bank/assets"><Button variant="outline">Tokenized Assets</Button></Link>
      </div>
    </div>
  )
}
