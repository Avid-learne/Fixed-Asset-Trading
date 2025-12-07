// hospitalfrontend/app/admin/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Building2, Users, Banknote, Coins, TrendingUp, AlertCircle, Shield, FileText, XCircle } from 'lucide-react'

// Data from hospitals page
const totalHospitals = 1
const totalPatients = 1250
const tokensMinted = 12500

// Data from banks page
const totalBanks = 1
const totalAssets = 85000000
const complianceScore = 98

// Data from reports/analytics page
const platformGrowth = [
  { month: 'Jun', hospitals: 12, patients: 450, tokens: 4500000, volume: 1200000 },
  { month: 'Jul', hospitals: 15, patients: 580, tokens: 5200000, volume: 1450000 },
  { month: 'Aug', hospitals: 18, patients: 720, tokens: 5800000, volume: 1680000 },
  { month: 'Sep', hospitals: 22, patients: 890, tokens: 6400000, volume: 1920000 },
  { month: 'Oct', hospitals: 25, patients: 1050, tokens: 7100000, volume: 2150000 },
  { month: 'Nov', hospitals: 28, patients: 1240, tokens: 7850000, volume: 2450000 },
]

// Financial data from reports page
const financialData = [
  { month: 'Jan', revenue: 185000, expenses: 120000, profit: 65000 },
  { month: 'Feb', revenue: 195000, expenses: 125000, profit: 70000 },
  { month: 'Mar', revenue: 215000, expenses: 135000, profit: 80000 },
  { month: 'Apr', revenue: 225000, expenses: 140000, profit: 85000 },
  { month: 'May', revenue: 240000, expenses: 145000, profit: 95000 },
  { month: 'Jun', revenue: 260000, expenses: 150000, profit: 110000 },
]

// Audit log stats from logs page
const auditLogStats = {
  total: 6,
  success: 4,
  error: 1,
  warning: 1
}

// Error log stats from logs page
const errorLogStats = {
  total: 5,
  critical: 2,
  unresolved: 2
}

// Recent audit activities from logs page
const recentActivities = [
  {
    id: 'AUD-001',
    action: 'Created Hospital',
    user: 'admin@superadmin.com',
    details: 'Created new hospital: Sunrise Medical Institute',
    timestamp: '2024-12-04 14:30:22',
    status: 'success' as const
  },
  {
    id: 'AUD-002',
    action: 'Minted Tokens',
    user: 'admin@metrogeneral.com',
    details: 'Minted 50,000 AT tokens for Q4 operations',
    timestamp: '2024-12-04 13:15:45',
    status: 'success' as const
  },
  {
    id: 'AUD-003',
    action: 'Suspended Hospital',
    user: 'admin@superadmin.com',
    details: 'Suspended hospital: Regional Health Network due to compliance issues',
    timestamp: '2024-12-04 12:45:18',
    status: 'warning' as const
  },
  {
    id: 'AUD-005',
    action: 'Updated System Config',
    user: 'admin@superadmin.com',
    details: 'Failed to update gas limit configuration - invalid value',
    timestamp: '2024-12-04 10:05:12',
    status: 'error' as const
  }
]

export default function AdminHome() {
  const totalRevenue = financialData.reduce((sum, d) => sum + d.revenue, 0)
  const totalProfit = financialData.reduce((sum, d) => sum + d.profit, 0)

  const stats = [
    { label: 'Total Hospitals', value: totalHospitals.toString(), icon: Building2, change: 'Active', color: 'text-cyan-600' },
    { label: 'Total Patients', value: totalPatients.toLocaleString(), icon: Users, change: '+50 this month', color: 'text-blue-600' },
    { label: 'Tokens Minted', value: tokensMinted.toLocaleString(), icon: Coins, change: '+500 this month', color: 'text-purple-600' },
    { label: 'Total Banks', value: totalBanks.toString(), icon: Banknote, change: `${complianceScore}% compliance`, color: 'text-yellow-600' },
    { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(0)}K`, icon: TrendingUp, change: '+12% growth', color: 'text-green-600' },
    { label: 'System Errors', value: errorLogStats.unresolved.toString(), icon: XCircle, change: `${errorLogStats.total} total`, color: 'text-red-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Overview Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor hospitals, banks, patients, financial metrics, and system logs</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
                  {stat.label}
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Audit & Error Log Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Audit Log Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-700">{auditLogStats.success}</p>
                <p className="text-xs text-green-600 mt-1">Success</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-2xl font-bold text-yellow-700">{auditLogStats.warning}</p>
                <p className="text-xs text-yellow-600 mt-1">Warning</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-2xl font-bold text-red-700">{auditLogStats.error}</p>
                <p className="text-xs text-red-600 mt-1">Error</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Hospitals</span>
                <Badge className="bg-green-100 text-green-800">{totalHospitals}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Banks</span>
                <Badge className="bg-green-100 text-green-800">{totalBanks}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Critical Errors</span>
                <Badge className="bg-red-100 text-red-800">{errorLogStats.critical}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Unresolved Issues</span>
                <Badge className="bg-orange-100 text-orange-800">{errorLogStats.unresolved}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bank Compliance</span>
                <Badge className="bg-blue-100 text-blue-800">{complianceScore}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Growth - Hospitals & Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="hospitals" fill="#0891b2" name="Hospitals" />
                <Bar yAxisId="right" dataKey="patients" fill="#3b82f6" name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => typeof value === 'number' ? `$${value.toLocaleString()}` : value} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities from Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between border-b border-border pb-3 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <Badge className={
                      activity.status === 'success' ? 'bg-green-100 text-green-800' :
                      activity.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">by {activity.user}</p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">{activity.timestamp.split(' ')[1]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-end gap-3">
        <Link href="/admin/hospitals">
          <Button variant="outline">Manage Hospitals</Button>
        </Link>
        <Link href="/admin/banks">
          <Button variant="outline">Manage Banks</Button>
        </Link>
        <Link href="/admin/logs">
          <Button variant="outline">View Logs</Button>
        </Link>
        <Link href="/admin/reports">
          <Button>View Reports</Button>
        </Link>
      </div>
    </div>
  )
}