'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Building2, Users, Coins, Activity, DollarSign, Percent, Download, BarChart3 } from 'lucide-react'
import { ChartCard } from '../components'

// ============= Analytics Data =============
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

// ============= Financial Data =============
interface FinancialData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

interface TokenDistribution {
  hospital: string
  tokens: number
  value: number
}

const financialData: FinancialData[] = [
  { month: 'Jan', revenue: 185000, expenses: 120000, profit: 65000 },
  { month: 'Feb', revenue: 195000, expenses: 125000, profit: 70000 },
  { month: 'Mar', revenue: 215000, expenses: 135000, profit: 80000 },
  { month: 'Apr', revenue: 225000, expenses: 140000, profit: 85000 },
  { month: 'May', revenue: 240000, expenses: 145000, profit: 95000 },
  { month: 'Jun', revenue: 260000, expenses: 150000, profit: 110000 },
]

const tokenDistributionData: TokenDistribution[] = [
  { hospital: 'City General Hospital', tokens: 12500, value: 625000 },
]

const pieChartData: any[] = [
  { name: 'Hospital Fees', value: 850000, color: '#3B82F6' },
  { name: 'Token Trading', value: 420000, color: '#10B981' },
  { name: 'Subscription Revenue', value: 280000, color: '#F59E0B' },
  { name: 'Bank Fees', value: 180000, color: '#8B5CF6' },
  { name: 'Other', value: 90000, color: '#6B7280' },
]

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('6months')
  const [dateRange, setDateRange] = useState('6m')

  // Analytics KPIs
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

  // Financial KPIs
  const totalRevenue = financialData.reduce((sum, d) => sum + d.revenue, 0)
  const totalExpenses = financialData.reduce((sum, d) => sum + d.expenses, 0)
  const totalProfit = financialData.reduce((sum, d) => sum + d.profit, 0)
  const averageMargin = ((totalProfit / totalRevenue) * 100).toFixed(1)
  const totalTokenValue = tokenDistributionData.reduce((sum, d) => sum + d.value, 0)

  const handleExport = () => {
    // Generate CSV data
    const csvHeaders = ['Month', 'Revenue', 'Expenses', 'Profit']
    const csvRows = financialData.map(row => [
      row.month,
      row.revenue.toString(),
      row.expenses.toString(),
      row.profit.toString()
    ])
    
    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `financial-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Financial Reports</h1>
        <p className="text-gray-600 mt-1">System-wide performance metrics and financial analytics</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Financial Reports
          </TabsTrigger>
        </TabsList>

        {/* ============= ANALYTICS TAB ============= */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex justify-end">
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
        </TabsContent>

        {/* ============= FINANCIAL REPORTS TAB ============= */}
        <TabsContent value="financial" className="space-y-6">
          <div className="flex justify-end gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="1m">Last 1 Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Financial KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1 text-green-600" />
                  Up 12% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
                <DollarSign className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</div>
                <p className="text-xs text-gray-500 mt-1">Operational & maintenance costs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
                <p className="text-xs text-gray-500 mt-1">Net income</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Profit Margin</CardTitle>
                <Percent className="w-4 h-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{averageMargin}%</div>
                <p className="text-xs text-gray-500 mt-1">Average margin</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue & Profit Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => typeof value === 'number' ? formatCurrency(value) : value} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => typeof value === 'number' ? formatCurrency(value) : value} />
                    <Bar dataKey="profit" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown & Token Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Token Distribution by Hospital</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tokenDistributionData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.hospital}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(item.value / totalTokenValue) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-medium text-gray-900">{item.tokens.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(item.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-l-4 border-primary pl-4">
                  <p className="text-sm text-gray-600 mb-1">Total Tokens Minted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tokenDistributionData.reduce((sum, d) => sum + d.tokens, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Across all hospitals</p>
                </div>
                <div className="border-l-4 border-secondary pl-4">
                  <p className="text-sm text-gray-600 mb-1">Total Asset Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalTokenValue)}</p>
                  <p className="text-xs text-gray-500 mt-1">Tokenized assets</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <p className="text-sm text-gray-600 mb-1">Average Transaction Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalTokenValue / (tokenDistributionData.reduce((sum, d) => sum + d.tokens, 0)))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Per token</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Allocation */}
          <Card>
            <CardHeader>
              <CardTitle>Profit Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Hospital Networks</p>
                    <p className="text-sm text-gray-500">Distribution to hospital partners</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary">45%</Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Banking Partners</p>
                    <p className="text-sm text-gray-500">Commission to financing banks</p>
                  </div>
                  <Badge className="bg-secondary/20 text-secondary">30%</Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Platform Operations</p>
                    <p className="text-sm text-gray-500">System maintenance and development</p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-600">15%</Badge>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Reserve Fund</p>
                    <p className="text-sm text-gray-500">Emergency and growth reserves</p>
                  </div>
                  <Badge className="bg-muted text-muted-foreground">10%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
