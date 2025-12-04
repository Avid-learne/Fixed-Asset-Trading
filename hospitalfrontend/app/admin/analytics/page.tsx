'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Building2, Users, Coins, Activity } from 'lucide-react'
import { ChartCard } from '../components'

const platformGrowth = [
  { month: 'Jun', hospitals: 12, patients: 450, tokens: 4500000, volume: 1200000 },
  { month: 'Jul', hospitals: 15, patients: 580, tokens: 5200000, volume: 1450000 },
  { month: 'Aug', hospitals: 18, patients: 720, tokens: 5800000, volume: 1680000 },
  { month: 'Sep', hospitals: 22, patients: 890, tokens: 6400000, volume: 1920000 },
  { month: 'Oct', hospitals: 25, patients: 1050, tokens: 7100000, volume: 2150000 },
  { month: 'Nov', hospitals: 28, patients: 1240, tokens: 7850000, volume: 2450000 },
]

const hospitalComparison = [
  { hospital: 'Metro General', patients: 234, tokens: 1250000, volume: 450000 },
  { hospital: 'City Medical', patients: 189, tokens: 980000, volume: 320000 },
  { hospital: 'Regional Health', patients: 156, tokens: 750000, volume: 280000 },
  { hospital: 'Sunrise Medical', patients: 145, tokens: 680000, volume: 250000 },
  { hospital: 'Others', patients: 516, tokens: 4190000, volume: 1150000 }
]

const verificationStats = [
  { category: 'Approved', count: 1389, percentage: 95.8 },
  { category: 'Pending', count: 23, percentage: 1.6 },
  { category: 'Rejected', count: 38, percentage: 2.6 }
]

const tokenDistribution = [
  { type: 'AT Minted', value: 7850000 },
  { type: 'AT in Circulation', value: 7120000 },
  { type: 'AT Burned', value: 180000 },
  { type: 'HT Allocated', value: 1580000 }
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months')

  const kpis = {
    totalHospitals: 28,
    hospitalGrowth: '+12%',
    totalPatients: 1240,
    patientGrowth: '+18%',
    totalTokens: 7850000,
    tokenGrowth: '+15%',
    totalVolume: 2450000,
    volumeGrowth: '+14%'
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-3xl font-bold text-gray-900">{(kpis.totalTokens / 1000000).toFixed(1)}M</p>
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
                <p className="text-3xl font-bold text-gray-900">${(kpis.totalVolume / 1000000).toFixed(2)}M</p>
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
