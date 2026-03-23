'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Coins, Users, TrendingUp, AlertCircle, Building, Wallet, ArrowUpRight, Activity, DollarSign, CheckCircle, Clock, ArrowDownRight, Loader } from 'lucide-react'
import { dashboardService, type HospitalDashboardSummary } from '@/services/dashboardService'
import { profitAllocationService } from '@/services/profitAllocationService'
import { depositRequestService } from '@/services/depositRequestService'

export default function HospitalAdminHome() {
  const [timeRange, setTimeRange] = useState('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Data states
  const [summary, setSummary] = useState<HospitalDashboardSummary | null>(null)
  const [mintingData, setMintingData] = useState<any[]>([])
  const [allocationData, setAllocationData] = useState<any[]>([])
  const [assetTypeDistribution, setAssetTypeDistribution] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch hospital dashboard summary
        const dashboardData = await dashboardService.getHospitalSummary()
        setSummary(dashboardData)

        // Fetch profit allocation history
        const allocationHistory = await profitAllocationService.getHistory()
        const formattedAllocation = allocationHistory.slice(-6).map((item) => ({
          month: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short' }),
          allocated: Math.round(item.totalHtDistributed),
        }))
        setAllocationData(formattedAllocation)

        // Fetch recent deposit requests for activity
        const recentDeposits = await depositRequestService.getHospitalRequests('all')
        const activityItems = recentDeposits.slice(0, 4).map((deposit) => ({
          action: 'Deposit ' + (deposit.status === 'approved' ? 'Approved' : deposit.status === 'pending' ? 'Pending' : 'Review'),
          description: `${deposit.assetType} - PKR ${deposit.assetValue?.toLocaleString() || 0}`,
          time: new Date(deposit.submittedAt).toLocaleDateString() === new Date().toLocaleDateString() 
            ? 'Today' 
            : new Date(deposit.submittedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              }),
          status: deposit.status === 'approved' ? 'success' : 'pending',
        }))
        setRecentActivity(activityItems)

        // Calculate asset type distribution from deposits
        const assetCounts = recentDeposits.reduce((acc: Record<string, number>, deposit) => {
          acc[deposit.assetType] = (acc[deposit.assetType] || 0) + 1
          return acc
        }, {})
        
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6']
        const distribution = Object.entries(assetCounts).map(([type, count], idx) => ({
          name: type,
          value: count,
          color: colors[idx % colors.length],
        }))
        setAssetTypeDistribution(distribution)

        // Generate mock minting data based on allocation history
        const mintingHistory = allocationHistory.slice(-6).map((item, idx) => ({
          month: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short' }),
          minted: Math.round(item.totalHtDistributed * 0.6 + Math.random() * 1000),
        }))
        setMintingData(mintingHistory)

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  
  
  const stats = summary ? [
    { label: 'Total AT Minted', value: summary.totalPatients ? `${Math.round(summary.totalPatients * 10 / 100)}K` : '0', icon: Coins, change: '+12%', trend: 'up' as const, subtext: 'this month' },
    { label: 'Total HT Allocated', value: summary.totalProfitDistributed ? `${Math.round(summary.totalProfitDistributed / 1000000)}M` : '0', icon: Users, change: '+5%', trend: 'up' as const, subtext: 'this month' },
    { label: 'Pending Deposits', value: String(summary.pendingDeposits), icon: Clock, change: String(summary.pendingDeposits > 0 ? summary.pendingDeposits + ' waiting' : 'None'), trend: 'neutral' as const, subtext: 'requires action' },
    { label: 'Hospital Revenue', value: 'PKR 45M', icon: DollarSign, change: '+8%', trend: 'up' as const, subtext: 'this month' },
    { label: 'Active Patients', value: String(summary.totalPatients?.toLocaleString() || 0), icon: Activity, change: '+23', trend: 'up' as const, subtext: 'this week' },
    { label: 'Trading Volume', value: 'PKR 230M', icon: TrendingUp, change: '+15%', trend: 'up' as const, subtext: 'last 30 days' },
  ] : []

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
          <p className="text-muted-foreground mt-1">Overview of minting, allocation, and hospital performance.</p>
        </div>
        <div className="flex gap-2">
             <Link href="/hospitaladmin/minting"><Button>Mint Tokens</Button></Link>
             <Link href="/hospitaladmin/trading"><Button variant="outline">Simulate Trade</Button></Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardContent>
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
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <div className="flex items-center gap-2">
                      {stat.trend !== 'neutral' && (
                        <Badge variant={isPositive ? 'default' : 'secondary'} className="text-xs">
                          <TrendIcon className="w-3 h-3 mr-1" />
                          {stat.change}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{stat.subtext}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AT Minting History</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setTimeRange('week')}>Week</Button>
                <Button variant="outline" size="sm" onClick={() => setTimeRange('month')}>Month</Button>
                <Button variant="outline" size="sm" onClick={() => setTimeRange('year')}>Year</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {mintingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mintingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minted" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No minting data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>HT Allocation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {allocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={allocationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="allocated" stroke="var(--color-secondary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No allocation data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Asset Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {assetTypeDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={assetTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {assetTypeDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No asset data available
              </div>
            )}
          </CardContent>
        </Card>
          
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className={`mt-1 p-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm">{activity.action}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No recent activity
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4">View All Activity</Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {summary && summary.pendingDeposits > 0 ? (
                        [...Array(Math.min(summary.pendingDeposits, 3))].map((_, i) => (
                            <div key={i} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm">Pending Bank Review</p>
                                    <p className="text-xs text-muted-foreground">Deposit is waiting for bank approval.</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground text-sm py-4">
                            <CheckCircle className="w-5 h-5 mx-auto mb-2 text-green-600" />
                            No pending alerts
                        </div>
                    )}
                </div>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Link href="/hospitaladmin/deposits" className="block"><Button variant="ghost" className="w-full justify-start">Review Pending Deposits</Button></Link>
                <Link href="/hospitaladmin/allocation" className="block"><Button variant="ghost" className="w-full justify-start">Allocate Profits</Button></Link>
                <Link href="/hospitaladmin/staff" className="block"><Button variant="ghost" className="w-full justify-start">Manage Staff</Button></Link>
                <Link href="/hospitaladmin/reports" className="block"><Button variant="ghost" className="w-full justify-start">Generate Monthly Report</Button></Link>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
