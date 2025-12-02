// src/app/hospital/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Clock, CheckCircle, XCircle, Users, Coins, TrendingUp } from 'lucide-react'
import { assetService } from '@/services/assetService'
import { formatNumber, formatDate, getStatusColor } from '@/lib/utils'
import { Asset, DashboardStats } from '@/types'
import Link from 'next/link'

const COLORS = ['#38ADA9', '#0A3D62', '#3C6382', '#E2B93B']

export default function HospitalDashboard() {
  const [pendingAssets, setPendingAssets] = useState<Asset[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const assetsRes = await assetService.getAssets({ status: 'Pending', page: 1, pageSize: 10 })
      
      setPendingAssets(assetsRes.data)
      
      setStats({
        totalAssets: 245,
        totalTokens: 1250000,
        pendingDeposits: assetsRes.data.length,
        activePatients: 892,
        totalTradeValue: 5430000,
        monthlyGrowth: 12.5
      })

      setChartData([
        { name: 'Jan', deposits: 40, approved: 35 },
        { name: 'Feb', deposits: 52, approved: 48 },
        { name: 'Mar', deposits: 38, approved: 36 },
        { name: 'Apr', deposits: 65, approved: 58 },
        { name: 'May', deposits: 71, approved: 68 },
        { name: 'Jun', deposits: 58, approved: 52 }
      ])
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
      </div>
    )
  }

  const statusData = [
    { name: 'Pending', value: stats?.pendingDeposits || 0 },
    { name: 'Approved', value: 156 },
    { name: 'Rejected', value: 23 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hospital Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage asset deposits and token minting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Deposits</CardTitle>
            <Clock className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.pendingDeposits || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Assets</CardTitle>
            <CheckCircle className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats?.totalAssets || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Processed assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Patients</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats?.activePatients || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tokens Minted</CardTitle>
            <Coins className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats?.totalTokens || 0)}
            </div>
            <p className="text-xs text-success mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +{stats?.monthlyGrowth}% this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Deposit Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="deposits" fill="#3C6382" name="Deposits" />
                <Bar dataKey="approved" fill="#38ADA9" name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending Asset Approvals</CardTitle>
          <Link href="/hospital/deposits">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {pendingAssets.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <p className="text-gray-500">No pending deposits at this time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAssets.slice(0, 5).map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {asset.patientId.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{asset.assetName}</p>
                        <p className="text-sm text-gray-500">{asset.assetType}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mr-6">
                    <p className="font-medium text-gray-900">
                      ${formatNumber(asset.estimatedValue)}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(asset.submittedAt)}</p>
                  </div>
                  <div>
                    <Badge className={getStatusColor(asset.status)}>
                      {asset.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}