// app/hospital/profit/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, DollarSign, Users, Calendar, Download } from 'lucide-react'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'

interface ProfitDistribution {
  id: string
  tradeId: string
  totalProfit: number
  distributedAmount: number
  beneficiaries: number
  distributedAt: string
  status: 'Pending' | 'Completed' | 'Failed'
}

export default function ProfitDistributionPage() {
  const [distributions, setDistributions] = useState<ProfitDistribution[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchDistributions()
  }, [])

  const fetchDistributions = async () => {
    try {
      setLoading(true)
      // Service call will be implemented when API is connected
      // const response = await profitService.getDistributions()
      // setDistributions(response.data)
      setDistributions([])
    } catch (error) {
      console.error('Error fetching distributions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Failed': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredDistributions = filter === 'all'
    ? distributions
    : distributions.filter(d => d.status === filter)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profit Distribution</h1>
          <p className="text-gray-500 mt-1">Track and manage benefit distribution to patients</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Profit Distributed</CardTitle>
            <DollarSign className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">All-time total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Distributed in current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Beneficiaries</CardTitle>
            <Users className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Patients receiving benefits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Distribution</CardTitle>
            <TrendingUp className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per patient average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Distribution History</CardTitle>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('Completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'Completed' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('Pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'Pending' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Pending
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDistributions.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No profit distributions found</p>
              <p className="text-sm text-gray-400 mt-2">
                Distributions will appear here after trading profits are generated
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Distribution ID</TableHead>
                  <TableHead>Trade Reference</TableHead>
                  <TableHead>Total Profit</TableHead>
                  <TableHead>Distributed Amount</TableHead>
                  <TableHead>Beneficiaries</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistributions.map((distribution) => (
                  <TableRow key={distribution.id}>
                    <TableCell className="font-medium text-gray-900">
                      {distribution.id}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {distribution.tradeId}
                    </TableCell>
                    <TableCell className="font-medium text-success">
                      {formatCurrency(distribution.totalProfit)}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {formatCurrency(distribution.distributedAmount)}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {formatNumber(distribution.beneficiaries)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(distribution.distributedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(distribution.status)}>
                        {distribution.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Profit Allocation</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Trading profits are calculated after each simulation
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Benefits distributed proportionally based on token holdings
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Health tokens are minted and allocated to patient accounts
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Distribution Process</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Automated distribution after trade settlement
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Patients receive notifications of benefit allocation
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Full audit trail maintained for compliance
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
