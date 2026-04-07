'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import { Coins, Users, TrendingUp, AlertCircle, DollarSign, Clock, ArrowUpRight, ArrowDownRight, Activity, Save, Loader2 } from 'lucide-react'
import { dashboardService, type HospitalDashboardSummary } from '@/services/dashboardService'
import { authService } from '@/lib/authService'

function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(Math.round(value))
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6']
const API_URL = 'http://localhost:8000/api/dashboard'

export default function HospitalAdminHome() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<HospitalDashboardSummary | null>(null)

  // Price editor state
  const [goldPrice, setGoldPrice] = useState('')
  const [silverPrice, setSilverPrice] = useState('')
  const [savingPrices, setSavingPrices] = useState(false)
  const [priceSuccess, setPriceSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await dashboardService.getHospitalSummary()
        setSummary(data)
        setGoldPrice(String(data.goldPricePerGram || 15000))
        setSilverPrice(String(data.silverPricePerGram || 250))
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSavePrices = async () => {
    try {
      setSavingPrices(true)
      setPriceSuccess(false)
      const token = authService.getToken()
      const res = await fetch(`${API_URL}/hospital/asset-prices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ goldPricePerGram: parseFloat(goldPrice), silverPricePerGram: parseFloat(silverPrice) }),
      })
      if (!res.ok) throw new Error('Failed to save prices')
      setPriceSuccess(true)
      setTimeout(() => setPriceSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prices')
    } finally {
      setSavingPrices(false)
    }
  }

  const stats = summary ? [
    { label: 'Total AT Minted', value: formatNumber(summary.totalAtMinted || 0), icon: Coins, change: `${summary.approvedDeposits} deposits`, trend: 'up' as const, subtext: 'from approved assets' },
    { label: 'Total HT Allocated', value: formatNumber(summary.totalHtAllocated || 0), icon: Users, change: `${summary.totalPatients} patients`, trend: 'up' as const, subtext: 'across patients' },
    { label: 'Pending Deposits', value: String(summary.pendingDeposits), icon: Clock, change: summary.pendingDeposits > 0 ? `${summary.pendingDeposits} waiting` : 'None', trend: 'neutral' as const, subtext: 'requires action' },
    { label: 'Total Asset Value', value: `PKR ${formatNumber(summary.totalAssetValue || 0)}`, icon: DollarSign, change: `${summary.approvedDeposits} approved`, trend: 'up' as const, subtext: 'approved deposits' },
    { label: 'Active Patients', value: String(summary.totalPatients || 0), icon: Activity, change: `${summary.activeSubscriptions} subscribed`, trend: 'up' as const, subtext: 'registered' },
    { label: 'Trading Volume', value: `PKR ${formatNumber(summary.tradingVolume || 0)}`, icon: TrendingUp, change: `${summary.totalTrades} trades`, trend: 'up' as const, subtext: `${summary.activeTrades} active` },
  ] : []

  const mintingData = summary?.mintingHistory || []
  const allocationData = summary?.allocationHistory || []

  const pieData = (summary?.assetDistribution || []).map((item, idx) => ({
    name: item.assetType,
    value: item.totalValue,
    count: item.count,
    color: PIE_COLORS[idx % PIE_COLORS.length],
  }))

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hospital Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {summary ? `${summary.hospitalName} — Overview of minting, allocation, and performance.` : 'Loading...'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/hospitaladmin/minting"><Button>Mint Tokens</Button></Link>
          <Link href="/hospitaladmin/trading"><Button variant="outline">Simulate Trade</Button></Link>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3"><div className="h-4 bg-muted rounded w-3/4" /></CardHeader>
              <CardContent><div className="h-8 bg-muted rounded w-1/2 mb-2" /><div className="h-4 bg-muted rounded w-1/3" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            const isPositive = stat.trend === 'up'
            const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
                    <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-muted'}`}>
                      <Icon className={`w-5 h-5 ${isPositive ? 'text-green-600' : 'text-primary'}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {stat.trend !== 'neutral' && (
                      <Badge variant={isPositive ? 'default' : 'secondary'} className="text-xs">
                        <TrendIcon className="w-3 h-3 mr-1" />{stat.change}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{stat.subtext}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>AT Minting History (Last 6 Months)</CardTitle></CardHeader>
          <CardContent>
            {mintingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mintingData} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v: number) => formatNumber(v)} width={60} />
                  <Tooltip formatter={(value: number) => [formatNumber(value), 'AT Minted']} />
                  <Bar dataKey="minted" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No minting data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Profit Distribution Trend (Last 6 Months)</CardTitle></CardHeader>
          <CardContent>
            {allocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={allocationData} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v: number) => formatNumber(v)} width={60} />
                  <Tooltip formatter={(value: number) => [`PKR ${formatNumber(value)}`, 'Distributed']} />
                  <Line type="monotone" dataKey="allocated" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No distribution data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pie chart + Asset Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Asset Distribution (Approved Deposits)</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`PKR ${formatNumber(value)}`, 'Value']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col justify-center space-y-4">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.count} deposits</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm">PKR {formatNumber(item.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">No approved deposits yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Asset Prices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gold-price">Gold (PKR/gram)</Label>
              <Input id="gold-price" type="number" value={goldPrice} onChange={(e) => setGoldPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="silver-price">Silver (PKR/gram)</Label>
              <Input id="silver-price" type="number" value={silverPrice} onChange={(e) => setSilverPrice(e.target.value)} />
            </div>
            {priceSuccess && (
              <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
                Prices updated successfully
              </div>
            )}
            <Button className="w-full" onClick={handleSavePrices} disabled={savingPrices}>
              {savingPrices ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {savingPrices ? 'Saving...' : 'Update Prices'}
            </Button>
            <p className="text-xs text-muted-foreground">Update daily based on market value. These rates are used when patients submit deposits.</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/hospitaladmin/deposits"><Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-1"><Clock className="w-5 h-5" /><span className="text-xs">Review Deposits</span></Button></Link>
            <Link href="/hospitaladmin/allocation"><Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-1"><DollarSign className="w-5 h-5" /><span className="text-xs">Allocate Profits</span></Button></Link>
            <Link href="/hospitaladmin/staff"><Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-1"><Users className="w-5 h-5" /><span className="text-xs">Manage Staff</span></Button></Link>
            <Link href="/hospitaladmin/reports"><Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-1"><TrendingUp className="w-5 h-5" /><span className="text-xs">Generate Report</span></Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
