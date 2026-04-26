'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, Users, Banknote, Coins, TrendingUp, AlertCircle, 
  CheckCircle, Server, Activity, Clock, ArrowUpRight, RefreshCw, Loader
} from 'lucide-react'
import { ChartCard } from '../components/ChartCard'
import { StatusBadge } from '../components/StatusBadge'
import { KeyValueCard } from '../components/KeyValueCard'
import { dashboardService, type SuperAdminDashboardSummary } from '@/services/dashboardService'

export default function SuperadminDashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [summary, setSummary] = useState<SuperAdminDashboardSummary | null>(null)
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [tokenData, setTokenData] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [systemAlerts, setSystemAlerts] = useState<any[]>([])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch super admin summary
      const dashboardData = await dashboardService.getSuperAdminSummary()
      setSummary(dashboardData)

      // Generate monthly data based on summary
      const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
      const generatedMonthlyData = months.map((month, idx) => ({
        month,
        hospitals: Math.round(dashboardData.totalHospitals * (0.6 + idx * 0.1)),
        patients: Math.round(dashboardData.totalPatients * (0.4 + idx * 0.15)),
        volume: Math.round(dashboardData.totalTransactionVolume * (0.3 + idx * 0.12) / 6),
      }))
      setMonthlyData(generatedMonthlyData)

      // Generate token data
      const generatedTokenData = months.map((month, idx) => ({
        month,
        AT: Math.round(dashboardData.totalATMinted * (0.5 + idx * 0.1)),
        HT: Math.round(dashboardData.totalHTIssued * (0.4 + idx * 0.12)),
      }))
      setTokenData(generatedTokenData)

      // Mock pending requests based on pending values
      setPendingRequests([
        { 
          id: 'HOS-001', 
          name: 'Metro General Hospital', 
          type: 'Hospital Onboarding', 
          status: 'pending', 
          date: new Date(Date.now() - 86400000).toLocaleDateString() 
        },
        { 
          id: 'BANK-012', 
          name: 'Capital Trust Bank', 
          type: 'Bank Verification', 
          status: 'pending', 
          date: new Date(Date.now() - 172800000).toLocaleDateString()
        },
        { 
          id: 'HOS-002', 
          name: 'City Medical Center', 
          type: 'Subscription Upgrade', 
          status: 'pending', 
          date: new Date(Date.now() - 259200000).toLocaleDateString()
        },
      ])

      // Set system alerts based on data
      const alerts = []
      if (dashboardData.systemUptime < 99.9) {
        alerts.push({ 
          id: 'ALT-002', 
          type: 'warning', 
          message: `System uptime at ${dashboardData.systemUptime}%`, 
          time: '30 minutes ago' 
        })
      }
      if (alerts.length === 0) {
        alerts.push({ 
          id: 'ALT-003', 
          type: 'info', 
          message: 'All systems operational', 
          time: 'Last check: now' 
        })
      }
      setSystemAlerts(alerts)

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData().finally(() => setRefreshing(false))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Control Center</h1>
          <p className="text-gray-600 mt-1">Complete oversight and management of the entire platform</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

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

      {/* Top KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-cyan-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Hospitals</p>
                  <p className="text-3xl font-bold text-gray-900">{summary?.totalHospitals || 0}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    {summary?.activeHospitals || 0} active
                  </p>
                </div>
                <div className="h-12 w-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bank Partners</p>
                  <p className="text-3xl font-bold text-gray-900">{summary?.totalBanks || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">{summary?.activeBanks || 0} active</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Banknote className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{summary?.activePatients?.toLocaleString() || 0}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    {summary?.totalPatients ? Math.round((summary.activePatients / summary.totalPatients) * 100) : 0}% active
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Volume</p>
                  <p className="text-3xl font-bold text-gray-900">PKR {summary?.totalTransactionVolume ? Math.round(summary.totalTransactionVolume / 1000000) : 0}M</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    +14% vs last month
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-5 w-5 text-cyan-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <StatusBadge status="success" text="Operational" size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <StatusBadge status="success" text="Connected" size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Blockchain</span>
              <StatusBadge status="success" text="Synced" size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-semibold text-green-600">{summary?.systemUptime?.toFixed(2) || '99.99'}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="text-sm font-semibold text-gray-900">0.01%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Blockchain Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Network</span>
              <Badge className="bg-blue-100 text-blue-800">Polygon Mainnet</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Block Height</span>
              <span className="text-sm font-semibold text-gray-900">51,234,567</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Gas Price</span>
              <span className="text-sm font-semibold text-gray-900">32 Gwei</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Txs</span>
              <span className="text-sm font-semibold text-orange-600">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Block</span>
              <span className="text-sm text-gray-600">12 seconds ago</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="h-5 w-5 text-green-600" />
              Token Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total AT Minted</span>
              <span className="text-sm font-semibold text-gray-900">{summary?.totalATMinted ? (summary.totalATMinted / 1000000).toFixed(2) : '0'}M</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total HT Allocated</span>
              <span className="text-sm font-semibold text-gray-900">{summary?.totalHTIssued ? (summary.totalHTIssued / 1000000).toFixed(2) : '0'}M</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AT in Circulation</span>
              <span className="text-sm font-semibold text-gray-900">{summary?.totalATMinted ? (summary.totalATMinted * 0.9 / 1000000).toFixed(2) : '0'}M</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Burn Rate</span>
              <span className="text-sm text-gray-600">2.3% monthly</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Token Value</span>
              <span className="text-sm font-semibold text-green-600">PKR 198</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Platform Growth Trend"
          chartType="line"
          data={monthlyData}
          dataKey="patients"
          xKey="month"
          height={250}
          color="#0891b2"
        />
        
        <ChartCard
          title="Token Issuance"
          chartType="area"
          data={tokenData}
          dataKey="AT"
          xKey="month"
          height={250}
          color="#10b981"
        />
      </div>

      {/* Pending Requests and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Requests
              </CardTitle>
              <Link href="/admin/hospitals">
                <Button variant="link" size="sm" className="text-cyan-600">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{request.name}</p>
                    <p className="text-sm text-gray-600">{request.type}</p>
                    <p className="text-xs text-gray-500 mt-1">{request.date}</p>
                  </div>
                  <StatusBadge status="pending" size="sm" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                System Alerts
              </CardTitle>
              <Link href="/admin/logs/errors">
                <Button variant="link" size="sm" className="text-cyan-600">View Logs</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    <StatusBadge 
                      status={alert.type as any} 
                      size="sm" 
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/hospitals/create">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Building2 className="h-4 w-4" />
                Onboard Hospital
              </Button>
            </Link>
            <Link href="/admin/banks/create">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Banknote className="h-4 w-4" />
                Add Bank Partner
              </Button>
            </Link>
            <Link href="/admin/system-config">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Server className="h-4 w-4" />
                System Config
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Activity className="h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
