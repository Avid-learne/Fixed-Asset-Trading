'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, Percent, PieChart as PieChartIcon, Download } from 'lucide-react'

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

export default function FinancialReportsPage() {
  const [dateRange, setDateRange] = useState('6m')
  const [selectedMetric, setSelectedMetric] = useState('all')

  const totalRevenue = financialData.reduce((sum, d) => sum + d.revenue, 0)
  const totalExpenses = financialData.reduce((sum, d) => sum + d.expenses, 0)
  const totalProfit = financialData.reduce((sum, d) => sum + d.profit, 0)
  const averageMargin = ((totalProfit / totalRevenue) * 100).toFixed(1)
  const totalTokenValue = tokenDistributionData.reduce((sum, d) => sum + d.value, 0)

  const handleExport = () => {
    alert('Financial report export initiated')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-500 mt-1">Platform-wide financial analytics and token distribution tracking</p>
        </div>
        <div className="flex gap-2">
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
      </div>

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
    </div>
  )
}
