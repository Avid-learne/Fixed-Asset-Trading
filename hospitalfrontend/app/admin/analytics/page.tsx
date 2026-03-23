'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Building2, Users, Coins, Activity, AlertCircle } from 'lucide-react'
import { ChartCard } from '../components'
import { dashboardService, type SuperAdminDashboardSummary } from '@/services/dashboardService'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [summary, setSummary] = useState<SuperAdminDashboardSummary | null>(null)
  const [platformGrowth, setPlatformGrowth] = useState<any[]>([])
  const [hospitalComparison, setHospitalComparison] = useState<any[]>([])
  const [verificationStats, setVerificationStats] = useState<any[]>([])
  const [tokenDistribution, setTokenDistribution] = useState<any[]>([])

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch super admin summary
      const dashboardData = await dashboardService.getSuperAdminSummary()
      setSummary(dashboardData)

      // Generate platform growth data
      const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
      const generatedGrowth = months.map((month, idx) => ({
        month,
        hospitals: Math.round(dashboardData.totalHospitals * (0.6 + idx * 0.1)),
        patients: Math.round(dashboardData.totalPatients * (0.4 + idx * 0.15)),
        tokens: Math.round(dashboardData.totalATMinted * (0.5 + idx * 0.1)),
        volume: Math.round(dashboardData.totalTransactionVolume * (0.3 + idx * 0.12) / 6),
      }))
      setPlatformGrowth(generatedGrowth)

      // Generate hospital comparison (mock based on summary)
      const generatedComparison = [
        { hospital: 'Top Hospital 1', patients: Math.round(dashboardData.totalPatients * 0.25), tokens: Math.round(dashboardData.totalATMinted * 0.25), volume: Math.round(dashboardData.totalTransactionVolume * 0.25) },
        { hospital: 'Top Hospital 2', patients: Math.round(dashboardData.totalPatients * 0.2), tokens: Math.round(dashboardData.totalATMinted * 0.2), volume: Math.round(dashboardData.totalTransactionVolume * 0.2) },
        { hospital: 'Top Hospital 3', patients: Math.round(dashboardData.totalPatients * 0.15), tokens: Math.round(dashboardData.totalATMinted * 0.15), volume: Math.round(dashboardData.totalTransactionVolume * 0.15) },
        { hospital: 'Top Hospital 4', patients: Math.round(dashboardData.totalPatients * 0.12), tokens: Math.round(dashboardData.totalATMinted * 0.12), volume: Math.round(dashboardData.totalTransactionVolume * 0.12) },
        { hospital: 'Others', patients: Math.round(dashboardData.totalPatients * 0.28), tokens: Math.round(dashboardData.totalATMinted * 0.28), volume: Math.round(dashboardData.totalTransactionVolume * 0.28) }
      ]
      setHospitalComparison(generatedComparison)

      // Generate verification stats
      const total = 1450
      const approved = Math.round(total * 0.958)
      const pending = Math.round(total * 0.016)
      const rejected = total - approved - pending

      setVerificationStats([
        { category: 'Approved', count: approved, percentage: (approved / total * 100).toFixed(1) },
        { category: 'Pending', count: pending, percentage: (pending / total * 100).toFixed(1) },
        { category: 'Rejected', count: rejected, percentage: (rejected / total * 100).toFixed(1) }
      ])

      // Generate token distribution
      const totalAT = dashboardData.totalATMinted
      const atInCirculation = dashboardData.totalATMinted * 0.9
      const atBurned = dashboardData.totalATMinted * 0.1
      const htAllocated = dashboardData.totalHTIssued

      setTokenDistribution([
        { type: 'AT Minted', value: Math.round(totalAT) },
        { type: 'AT in Circulation', value: Math.round(atInCirculation) },
        { type: 'AT Burned', value: Math.round(atBurned) },
        { type: 'HT Allocated', value: Math.round(htAllocated) }
      ])

    } catch (err) {
      console.error('Failed to fetch analytics data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const kpis = summary ? {
    totalHospitals: summary.totalHospitals,
    hospitalGrowth: '+12%',
    totalPatients: summary.totalPatients,
    patientGrowth: '+18%',
    totalTokens: Math.round(summary.totalATMinted / 1000000),
    tokenGrowth: '+15%',
    totalVolume: Math.round(summary.totalTransactionVolume / 1000000),
    volumeGrowth: '+14%'
  } : {
    totalHospitals: 0,
    hospitalGrowth: '+0%',
    totalPatients: 0,
    patientGrowth: '+0%',
    totalTokens: 0,
    tokenGrowth: '+0%',
    totalVolume: 0,
    volumeGrowth: '+0%'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">System-wide performance and growth metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Hospitals</p>
                    <p className="text-3xl font-bold text-gray-900">{kpis.totalHospitals}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">{kpis.hospitalGrowth}</span>
                      <span className="text-xs text-gray-600">vs last period</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-cyan-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Patients</p>
                <p className="text-3xl font-bold text-gray-900">{kpis.totalPatients.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">{kpis.patientGrowth}</span>
                  <span className="text-xs text-gray-600">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tokens</p>
                    <p className="text-3xl font-bold text-gray-900">{kpis.totalTokens}M</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">{kpis.tokenGrowth}</span>
                      <span className="text-xs text-gray-600">vs last period</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Coins className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Trading Volume</p>
                    <p className="text-3xl font-bold text-gray-900">PKR {kpis.totalVolume}M</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">{kpis.volumeGrowth}</span>
                      <span className="text-xs text-gray-600">vs last period</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Platform Growth - Hospitals & Patients"
          chartType="line"
          data={platformGrowth}
          dataKey="hospitals"
          xKey="month"
          height={300}
          color="#0891b2"
        />

        <ChartCard
          title="Token Issuance Trend"
          chartType="area"
          data={platformGrowth}
          dataKey="tokens"
          xKey="month"
          height={300}
          color="#8b5cf6"
        />

        <ChartCard
          title="Trading Volume Growth"
          chartType="bar"
          data={platformGrowth}
          dataKey="volume"
          xKey="month"
          height={300}
          color="#10b981"
        />

        <ChartCard
          title="Hospital Comparison - Patient Count"
          chartType="bar"
          data={hospitalComparison}
          dataKey="patients"
          xKey="hospital"
          height={300}
          color="#f59e0b"
        />
      </div>

      {/* Verification & Token Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Verification Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verificationStats.map((stat) => (
                <div key={stat.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{stat.category}</span>
                    <span className="text-sm text-gray-900">{stat.count} ({stat.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        stat.category === 'Approved' ? 'bg-green-600' :
                        stat.category === 'Pending' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tokenDistribution.map((item) => (
                <div key={item.type} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{item.type}</span>
                  <span className="text-lg font-bold text-gray-900">
                    {(item.value / 1000000).toFixed(2)}M
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Hospitals */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Hospitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hospitalComparison.slice(0, 4).map((hospital, index) => (
              <div key={hospital.hospital} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-cyan-600">#{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{hospital.hospital}</div>
                  <div className="text-sm text-gray-600">{hospital.patients} patients</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{(hospital.tokens / 1000000).toFixed(2)}M tokens</div>
                  <div className="text-sm text-gray-600">${(hospital.volume / 1000).toFixed(0)}K volume</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
