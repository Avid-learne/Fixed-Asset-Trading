// hospitalfrontend/app/admin/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Shield, Activity, Database, AlertTriangle, TrendingUp } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

const COLORS = ['#0A3D62', '#3C6382', '#38ADA9', '#E2B93B', '#27AE60']

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    systemHealth: 0,
    pendingApprovals: 0,
    securityAlerts: 0
  })

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const usersByRole = [
    { name: 'Patients', value: 0 },
    { name: 'Hospital Staff', value: 0 },
    { name: 'Bank Officers', value: 0 },
    { name: 'Admins', value: 0 }
  ]

  const systemMetrics = [
    { month: 'Jan', users: 0, transactions: 0 },
    { month: 'Feb', users: 0, transactions: 0 },
    { month: 'Mar', users: 0, transactions: 0 },
    { month: 'Apr', users: 0, transactions: 0 },
    { month: 'May', users: 0, transactions: 0 },
    { month: 'Jun', users: 0, transactions: 0 }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
        <p className="text-gray-500 mt-1">Monitor and manage platform operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.totalUsers)}
            </div>
            <p className="text-xs text-success mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            <Activity className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.activeUsers)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
            <Database className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.totalTransactions)}
            </div>
            <p className="text-xs text-gray-500 mt-1">All-time total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Security Alerts</CardTitle>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {stats.securityAlerts}
            </div>
            <p className="text-xs text-gray-500 mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={systemMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#0A3D62" strokeWidth={2} name="Users" />
                <Line type="monotone" dataKey="transactions" stroke="#38ADA9" strokeWidth={2} name="Transactions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Health Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">API Services</p>
                  <p className="text-sm text-gray-600">All services operational</p>
                </div>
              </div>
              <Badge variant="success">Healthy</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Database</p>
                  <p className="text-sm text-gray-600">Connection stable, optimal performance</p>
                </div>
              </div>
              <Badge variant="success">Healthy</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Blockchain Network</p>
                  <p className="text-sm text-gray-600">All contracts responding normally</p>
                </div>
              </div>
              <Badge variant="success">Healthy</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}