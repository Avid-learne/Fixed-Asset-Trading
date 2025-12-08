'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, Users, Banknote, Coins, TrendingUp, AlertCircle, 
  CheckCircle, Server, Activity, Clock, ArrowUpRight, RefreshCw 
} from 'lucide-react'
import { ChartCard } from './components/ChartCard'
import { StatusBadge } from './components/StatusBadge'
import { KeyValueCard } from './components/KeyValueCard'

const monthlyData = [
  { month: 'Jun', hospitals: 12, patients: 450, volume: 1200000 },
  { month: 'Jul', hospitals: 15, patients: 580, volume: 1450000 },
  { month: 'Aug', hospitals: 18, patients: 720, volume: 1680000 },
  { month: 'Sep', hospitals: 22, patients: 890, volume: 1920000 },
  { month: 'Oct', hospitals: 25, patients: 1050, volume: 2150000 },
  { month: 'Nov', hospitals: 28, patients: 1240, volume: 2450000 },
]

const tokenData = [
  { month: 'Jun', AT: 4500000, HT: 890000 },
  { month: 'Jul', AT: 5200000, HT: 1020000 },
  { month: 'Aug', AT: 5800000, HT: 1150000 },
  { month: 'Sep', AT: 6400000, HT: 1280000 },
  { month: 'Oct', AT: 7100000, HT: 1420000 },
  { month: 'Nov', AT: 7850000, HT: 1580000 },
]

const pendingRequests = [
  { id: 'HOS-001', name: 'Metro General Hospital', type: 'Hospital Onboarding', status: 'pending', date: '2024-12-03' },
  { id: 'BANK-012', name: 'Capital Trust Bank', type: 'Bank Verification', status: 'pending', date: '2024-12-02' },
  { id: 'HOS-002', name: 'City Medical Center', type: 'Subscription Upgrade', status: 'pending', date: '2024-12-01' },
]

const systemAlerts = [
  { id: 'ALT-001', type: 'error', message: 'Failed minting transaction for HOS-015', time: '10 minutes ago' },
  { id: 'ALT-002', type: 'warning', message: 'High API latency detected', time: '25 minutes ago' },
  { id: 'ALT-003', type: 'info', message: 'Scheduled maintenance in 2 days', time: '1 hour ago' },
]

export default function SuperadminDashboard() {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
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

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-cyan-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hospitals</p>
                <p className="text-3xl font-bold text-gray-900">28</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +3 this month
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
                <p className="text-3xl font-bold text-gray-900">12</p>
                <p className="text-xs text-gray-600 mt-1">All active</p>
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
                <p className="text-3xl font-bold text-gray-900">1,240</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +18% growth
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
                <p className="text-3xl font-bold text-gray-900">PKR 245M</p>
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
              <span className="text-sm font-semibold text-green-600">99.99%</span>
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
              <span className="text-sm font-semibold text-gray-900">7.85M</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total HT Allocated</span>
              <span className="text-sm font-semibold text-gray-900">1.58M</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AT in Circulation</span>
              <span className="text-sm font-semibold text-gray-900">7.12M</span>
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
