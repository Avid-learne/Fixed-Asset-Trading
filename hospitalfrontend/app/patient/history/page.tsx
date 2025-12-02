// src/app/patient/history/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Search, Download, Filter } from 'lucide-react'
import { tokenService } from '@/services/tokenService'
import { formatNumber, formatDateTime, getStatusColor } from '@/lib/utils'
import { TokenHistory, TransactionType } from '@/types'

export default function HistoryPage() {
  const [history, setHistory] = useState<TokenHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchHistory()
  }, [currentPage])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await tokenService.getHistory(currentPage, 20)
      setHistory(response.data)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: TransactionType) => {
    const icons = {
      [TransactionType.DEPOSIT]: '⬆️',
      [TransactionType.MINT]: '✨',
      [TransactionType.TRADE]: '🔄',
      [TransactionType.REDEEM]: '🎁',
      [TransactionType.TRANSFER]: '➡️',
    }
    return icons[type] || '📝'
  }

  const getTypeColor = (type: TransactionType) => {
    const colors = {
      [TransactionType.DEPOSIT]: 'text-blue-600 bg-blue-50',
      [TransactionType.MINT]: 'text-accent bg-teal-50',
      [TransactionType.TRADE]: 'text-primary bg-primary-50',
      [TransactionType.REDEEM]: 'text-purple-600 bg-purple-50',
      [TransactionType.TRANSFER]: 'text-gray-600 bg-gray-50',
    }
    return colors[type] || 'text-gray-600 bg-gray-50'
  }

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || item.type === filterType
    return matchesSearch && matchesFilter
  })

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Type', 'Amount', 'Balance', 'Description'],
      ...filteredHistory.map(item => [
        formatDateTime(item.timestamp),
        item.type,
        item.amount.toString(),
        item.balance.toString(),
        item.description
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transaction-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-500 mt-1">View all your token transactions and activities</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>All Transactions</CardTitle>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value={TransactionType.DEPOSIT}>Deposits</option>
                <option value={TransactionType.MINT}>Minting</option>
                <option value={TransactionType.TRADE}>Trading</option>
                <option value={TransactionType.REDEEM}>Redemptions</option>
                <option value={TransactionType.TRANSFER}>Transfers</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-gray-600">
                      {formatDateTime(item.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(item.type)}>
                        {getTypeIcon(item.type)} {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-gray-900">{item.description}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${item.amount >= 0 ? 'text-success' : 'text-error'}`}>
                        {item.amount >= 0 ? '+' : ''}{formatNumber(item.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-900">
                      {formatNumber(item.balance)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Transactions</span>
              <span className="font-semibold text-gray-900">{history.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Earned</span>
              <span className="font-semibold text-success">
                +{formatNumber(history.filter(h => h.amount > 0).reduce((sum, h) => sum + h.amount, 0))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Spent</span>
              <span className="font-semibold text-error">
                {formatNumber(history.filter(h => h.amount < 0).reduce((sum, h) => sum + h.amount, 0))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.values(TransactionType).map(type => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{type}</span>
                <span className="font-semibold text-gray-900">
                  {history.filter(h => h.type === type).length}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="font-semibold text-gray-900">
                {history.filter(h => {
                  const date = new Date(h.timestamp)
                  const now = new Date()
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                }).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="font-semibold text-gray-900">
                {history.filter(h => {
                  const date = new Date(h.timestamp)
                  const now = new Date()
                  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                  return date >= weekAgo
                }).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Today</span>
              <span className="font-semibold text-gray-900">
                {history.filter(h => {
                  const date = new Date(h.timestamp)
                  const now = new Date()
                  return date.toDateString() === now.toDateString()
                }).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}