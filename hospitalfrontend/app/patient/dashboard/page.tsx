'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Heart, Clock, CheckCircle2, CreditCard, ArrowUpRight, Coins, Lock, Unlock } from 'lucide-react'
import { dashboardService, type PatientDashboardSummary } from '@/services/dashboardService'
import { marketplaceService, type PatientAssetToken } from '@/services/marketplaceService'
import { useAuth } from '@/hooks/useAuth'
import { formatNumber } from '@/lib/utils'

export default function PatientDashboardHome() {
  const { user } = useAuth()
  const [data, setData] = useState<PatientDashboardSummary | null>(null)
  const [assetTokens, setAssetTokens] = useState<PatientAssetToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load dashboard summary
  const loadDashboardSummary = async () => {
    try {
      setLoading(true)
      setError('')
      const summary = await dashboardService.getPatientSummary()
      setData(summary)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load dashboard'
      setError(errorMsg)
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load asset tokens
  const loadAssetTokens = async (patientId: string) => {
    try {
      console.log('Loading asset tokens for patientId:', patientId)
      const tokens = await marketplaceService.getPatientAssetTokens(patientId)
      setAssetTokens(tokens)
      console.log('Asset tokens loaded:', tokens)
      console.log('Total AT:', tokens.reduce((sum, token) => sum + Number(token.totalAtAssigned || 0), 0))
    } catch (err) {
      console.error('Error loading asset tokens:', err)
    }
  }

  // Load dashboard summary on mount
  useEffect(() => {
    loadDashboardSummary()
  }, [])

  // Load asset tokens when user.patientId changes
  useEffect(() => {
    console.log('User changed:', user)
    console.log('PatientId:', user?.patientId)
    
    if (user?.patientId) {
      loadAssetTokens(user.patientId)
    } else {
      console.log('PatientId not available yet')
      setAssetTokens([])
    }
  }, [user?.patientId])

  // Combined load function for refresh button
  const load = async () => {
    await loadDashboardSummary()
    if (user?.patientId) {
      await loadAssetTokens(user.patientId)
    }
  }

  const getTotalAt = () => assetTokens.reduce((sum, token) => sum + Number(token.totalAtAssigned || 0), 0)
  const getAvailableAt = () => assetTokens.reduce((sum, token) => sum + Number(token.availableAt || 0), 0)
  const getUnavailableAt = () => assetTokens.reduce((sum, token) => sum + Number(token.unavailableAt || 0), 0)
  const getAtStatus = () => {
    const total = getTotalAt()
    if (total === 0) return 'No Assets'
    const unavailable = getUnavailableAt()
    if (unavailable > 0) return 'In Trade'
    return 'Available'
  }

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
          <p className="text-sm text-muted-foreground">Your wallet, assets, and activity overview</p>
        </div>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Asset Token Summary - Always Show */}
      <Card className={getTotalAt() > 0 ? "border-blue-200 bg-blue-50" : "border-gray-200"}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Coins className="h-5 w-5 text-blue-600" />
            Asset Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getTotalAt() === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">No asset tokens yet</p>
              <p className="text-xs text-gray-500 mt-2">Deposit assets to earn trading tokens</p>
              <Link href="/patient/deposit" className="mt-3 block">
                <Button size="sm" className="w-full">Deposit Asset</Button>
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">You have linked asset deposits with active tokens available for trading</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Total AT</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{formatNumber(getTotalAt())}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Available AT</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{formatNumber(getAvailableAt())}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-orange-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase">In Trade AT</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{formatNumber(getUnavailableAt())}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant={getUnavailableAt() > 0 ? 'destructive' : 'default'} className="text-sm">
                  {getUnavailableAt() > 0 ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                  Status: {getAtStatus()}
                </Badge>
                <Link href="/patient/linked-assets">
                  <Button variant="ghost" size="sm" className="text-blue-600">View Details →</Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
