'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Heart, Clock, CheckCircle2, CreditCard, ArrowUpRight } from 'lucide-react'
import { dashboardService, type PatientDashboardSummary } from '@/services/dashboardService'

export default function PatientDashboardHome() {
  const [data, setData] = useState<PatientDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      setData(await dashboardService.getPatientSummary())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Patient Dashboard</h1>
          <p className="text-sm text-muted-foreground">HT-only wallet and health-card activity overview</p>
        </div>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">HT Balance</p>
            <div className="mt-2 flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-600" />
              <p className="text-2xl font-bold">{Number(data?.htBalance || 0).toLocaleString()}</p>
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
            <p className="text-sm text-muted-foreground">Approved Deposits</p>
            <div className="mt-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <p className="text-2xl font-bold">{data?.approvedDeposits || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Issued Health Cards</p>
            <div className="mt-2 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <p className="text-2xl font-bold">{data?.healthCardCount || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account State</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge variant={data?.hasSubscription ? 'default' : 'secondary'}>
            {data?.hasSubscription ? 'Subscription Active' : 'No Active Subscription'}
          </Badge>
          <Link href="/patient/subscription"><Button size="sm" variant="outline">Manage Subscription</Button></Link>
          <Link href="/patient/wallet/ht"><Button size="sm" variant="outline">Open HT Wallet</Button></Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent HT Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {(data?.recentHtTransactions || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No HT transactions found.</p>
          ) : (
            <div className="space-y-3">
              {data?.recentHtTransactions.map((tx) => (
                <div key={tx.transactionId} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">{tx.description || 'HT activity'}</p>
                    <p className="text-xs text-muted-foreground">{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.transactionType === 'DEBIT' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {tx.transactionType === 'DEBIT' ? '-' : '+'}{Math.abs(Number(tx.amount || 0)).toLocaleString()} HT
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.transactionType}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link href="/patient/deposit"><Button>Deposit Asset</Button></Link>
        <Link href="/patient/health-card"><Button variant="outline">View Health Cards</Button></Link>
        <Link href="/patient/wallet/ht"><Button variant="outline"><ArrowUpRight className="mr-2 h-4 w-4" />Transfer HT</Button></Link>
      </div>
    </div>
  )
}
