// src/app/patient/tokens/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Coins, TrendingUp, Lock } from 'lucide-react'
import { tokenService } from '@/services/tokenService'
import { formatNumber, formatDate } from '@/lib/utils'
import { TokenBalance, ChartDataPoint } from '@/types'

export default function TokenBalancePage() {
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTokenData()
  }, [period])

  const fetchTokenData = async () => {
    try {
      setLoading(true)
      const [balanceRes, chartRes] = await Promise.all([
        tokenService.getBalance(),
        tokenService.getBalanceChart(period)
      ])

      setTokenBalance(balanceRes.data)
      setChartData(chartRes.data)
    } catch (error) {
      console.error('Error fetching token data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const availablePercentage = tokenBalance ? (tokenBalance.availableTokens / tokenBalance.totalTokens) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Token Balance</h1>
        <p className="text-gray-500 mt-1">Track your health token holdings and history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tokens</CardTitle>
            <Coins className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(tokenBalance?.totalTokens || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total health tokens earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available Tokens</CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {formatNumber(tokenBalance?.availableTokens || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ready to use for benefits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Locked Tokens</CardTitle>
            <Lock className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {formatNumber(tokenBalance?.lockedTokens || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Reserved for pending transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Token Balance Over Time</CardTitle>
            <div className="flex space-x-2">
              <button
                onClick={() => setPeriod('7d')}
                className={`px-3 py-1 rounded text-sm ${period === '7d' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                7 Days
              </button>
              <button
                onClick={() => setPeriod('30d')}
                className={`px-3 py-1 rounded text-sm ${period === '30d' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                30 Days
              </button>
              <button
                onClick={() => setPeriod('90d')}
                className={`px-3 py-1 rounded text-sm ${period === '90d' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                90 Days
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38ADA9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#38ADA9" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#38ADA9" 
                fillOpacity={1} 
                fill="url(#colorTokens)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Available Tokens</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatNumber(tokenBalance?.availableTokens || 0)} ({availablePercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-success h-2 rounded-full"
                  style={{ width: `${availablePercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Locked Tokens</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatNumber(tokenBalance?.lockedTokens || 0)} ({(100 - availablePercentage).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-warning h-2 rounded-full"
                  style={{ width: `${100 - availablePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">How to Earn Tokens</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Deposit physical assets for evaluation
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Wait for hospital approval
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Tokens are minted based on asset value
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">How to Use Tokens</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Redeem for healthcare benefits
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Access premium medical services
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Participate in wellness programs
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}