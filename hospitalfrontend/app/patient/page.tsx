// src/app/patient/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Coins, TrendingUp, Gift, Upload } from 'lucide-react'
import { tokenService } from '@/services/tokenService'
import { assetService } from '@/services/assetService'
import { benefitService } from '@/services/benefitService'
import { formatCurrency, formatNumber, formatDate, getStatusColor } from '@/lib/utils'
import { TokenBalance, Asset, BenefitRedemption, ChartDataPoint } from '@/types'
import Link from 'next/link'

export default function PatientDashboard() {
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null)
  const [recentDeposits, setRecentDeposits] = useState<Asset[]>([])
  const [recentBenefits, setRecentBenefits] = useState<BenefitRedemption[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [balanceRes, depositsRes, benefitsRes, chartRes] = await Promise.all([
        tokenService.getBalance(),
        assetService.getAssets({ page: 1, pageSize: 5 }),
        benefitService.getRedemptions(1, 5),
        tokenService.getBalanceChart('30d')
      ])

      setTokenBalance(balanceRes.data)
      setRecentDeposits(depositsRes.data)
      setRecentBenefits(benefitsRes.data)
      setChartData(chartRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your health tokens and benefits</p>
        </div>
        <Link href="/patient/deposit">
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Deposit Asset
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tokens</CardTitle>
            <Coins className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(tokenBalance?.totalTokens || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatNumber(tokenBalance?.availableTokens || 0)} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Deposits</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{recentDeposits.length}</div>
            <p className="text-xs text-gray-500 mt-1">Assets deposited</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Benefits Redeemed</CardTitle>
            <Gift className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{recentBenefits.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total redemptions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token Balance History</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => formatDate(date)}
                formatter={(value) => [formatNumber(value as number), 'Tokens']}
              />
              <Line type="monotone" dataKey="value" stroke="#38ADA9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Deposits</CardTitle>
            <Link href="/patient/history">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentDeposits.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No deposits yet</p>
            ) : (
              <div className="space-y-4">
                {recentDeposits.map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{deposit.assetName}</p>
                      <p className="text-sm text-gray-500">{formatDate(deposit.submittedAt)}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(deposit.status)}>
                        {deposit.status}
                      </Badge>
                      {deposit.tokensGenerated && (
                        <p className="text-sm text-gray-600 mt-1">
                          {formatNumber(deposit.tokensGenerated)} tokens
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Benefits</CardTitle>
            <Link href="/patient/benefits">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentBenefits.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No benefits redeemed yet</p>
            ) : (
              <div className="space-y-4">
                {recentBenefits.map((benefit) => (
                  <div key={benefit.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{benefit.benefitId}</p>
                      <p className="text-sm text-gray-500">{formatDate(benefit.redeemedAt)}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(benefit.status)}>
                        {benefit.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatNumber(benefit.tokenSpent)} tokens
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}