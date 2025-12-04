// app/hospital/reports/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Download, FileText, TrendingUp, Calendar, Filter } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

const COLORS = ['#0A3D62', '#3C6382', '#38ADA9', '#E2B93B', '#27AE60']

export default function HospitalReportsPage() {
  const [reportType, setReportType] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')

  const assetsByType = [
    { name: 'Real Estate', value: 0 },
    { name: 'Vehicles', value: 0 },
    { name: 'Jewelry', value: 0 },
    { name: 'Electronics', value: 0 },
    { name: 'Other', value: 0 }
  ]

  const monthlyPerformance = [
    { month: 'Jan', deposits: 0, approvals: 0, tokens: 0 },
    { month: 'Feb', deposits: 0, approvals: 0, tokens: 0 },
    { month: 'Mar', deposits: 0, approvals: 0, tokens: 0 },
    { month: 'Apr', deposits: 0, approvals: 0, tokens: 0 },
    { month: 'May', deposits: 0, approvals: 0, tokens: 0 },
    { month: 'Jun', deposits: 0, approvals: 0, tokens: 0 }
  ]

  const tradingPerformance = [
    { month: 'Jan', profit: 0, loss: 0 },
    { month: 'Feb', profit: 0, loss: 0 },
    { month: 'Mar', profit: 0, loss: 0 },
    { month: 'Apr', profit: 0, loss: 0 },
    { month: 'May', profit: 0, loss: 0 },
    { month: 'Jun', profit: 0, loss: 0 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Comprehensive hospital performance reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['overview', 'deposits', 'trading', 'patients', 'financial'].map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              reportType === type
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {reportType === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Assets Processed</CardTitle>
                <FileText className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(0)}</div>
                <p className="text-xs text-gray-500 mt-1">All-time total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Tokens Minted</CardTitle>
                <TrendingUp className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(0)}</div>
                <p className="text-xs text-success mt-1">Total health tokens</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Trading Profit</CardTitle>
                <TrendingUp className="w-4 h-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(0)}</div>
                <p className="text-xs text-gray-500 mt-1">Total profit generated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Patients</CardTitle>
                <TrendingUp className="w-4 h-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(0)}</div>
                <p className="text-xs text-gray-500 mt-1">Registered patients</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Distribution by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetsByType.map((entry, index) => (
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
                <CardTitle>Monthly Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="deposits" stroke="#0A3D62" name="Deposits" />
                    <Line type="monotone" dataKey="approvals" stroke="#38ADA9" name="Approvals" />
                    <Line type="monotone" dataKey="tokens" stroke="#E2B93B" name="Tokens" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Trading Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tradingPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="profit" fill="#27AE60" name="Profit" />
                  <Bar dataKey="loss" fill="#E74C3C" name="Loss" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {reportType === 'deposits' && (
        <Card>
          <CardHeader>
            <CardTitle>Deposit Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Detailed deposit analytics will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'trading' && (
        <Card>
          <CardHeader>
            <CardTitle>Trading Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Trading performance analytics will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'patients' && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Patient engagement analytics will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'financial' && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Financial performance reports will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
