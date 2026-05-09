'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Search,
  PieChart,
  Loader2,
  AlertCircle,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react'
import {
  profitAllocationService,
  type ProfitAllocationHistoryItem,
} from '@/services/profitAllocationService'

interface AllocationRow {
  distributionId: string
  distributionDate: string
  patientId: string
  patientName: string
  htAmount: number
  sharePercent: number
  totalProfit: number
  tradeId?: string
  tradeTitle?: string
  tradeDescription?: string
  tradeType?: string
  tradeProfitLoss?: number
  tradeEndTime?: string
}

export default function HospitalProfitDistribution() {
  const [history, setHistory] = useState<ProfitAllocationHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [periodFilter, setPeriodFilter] = useState<string>('all')

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await profitAllocationService.getHistory()
      setHistory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profit distribution history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const flatRows: AllocationRow[] = useMemo(() => {
    const rows: AllocationRow[] = []
    history.forEach((h) => {
      const recipients = h.recipientDetails || []
      recipients.forEach((r) => {
        rows.push({
          distributionId: h.distributionId,
          distributionDate: h.timestamp,
          patientId: r.patientId,
          patientName: r.patientName,
          htAmount: Number(r.htAmount || 0),
          sharePercent: Number(r.sharePercent || 0),
          totalProfit: Number(h.totalProfit || 0),
          tradeId: h.tradeId,
          tradeTitle: h.tradeTitle,
          tradeDescription: h.tradeDescription,
          tradeType: h.tradeType,
          tradeProfitLoss: h.tradeProfitLoss,
          tradeEndTime: h.tradeEndTime,
        })
      })
    })
    return rows.sort((a, b) => {
      const ta = new Date(a.distributionDate).getTime() || 0
      const tb = new Date(b.distributionDate).getTime() || 0
      return tb - ta
    })
  }, [history])

  const periodOf = (iso: string) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  const uniquePeriods = useMemo(() => {
    const set = new Set(flatRows.map((r) => periodOf(r.distributionDate)).filter(Boolean))
    return Array.from(set).sort().reverse()
  }, [flatRows])

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return flatRows.filter((r) => {
      const period = periodOf(r.distributionDate)
      const matchesPeriod = periodFilter === 'all' || period === periodFilter
      const matchesSearch = !q || r.patientName?.toLowerCase().includes(q)
      return matchesSearch && matchesPeriod
    })
  }, [flatRows, searchQuery, periodFilter])

  const totalAllocations = flatRows.length
  const totalHtAllocated = useMemo(
    () => flatRows.reduce((sum, r) => sum + r.htAmount, 0),
    [flatRows],
  )
  const uniquePatients = useMemo(
    () => new Set(flatRows.map((r) => r.patientId)).size,
    [flatRows],
  )
  const totalDistributions = history.length

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading profit allocation log...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profit Allocation Log</h1>
          <p className="text-slate-600 mt-1">Per-patient HT allocations from each distribution event with trade context.</p>
        </div>
        <Button variant="outline" onClick={loadHistory}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Distribution Events</p>
                <p className="text-2xl font-bold text-slate-900">{totalDistributions}</p>
                <p className="text-xs text-slate-500 mt-1">Total runs</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Allocations</p>
                <p className="text-2xl font-bold text-slate-900">{totalAllocations}</p>
                <p className="text-xs text-slate-500 mt-1">Per-patient rows</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total HT Allocated</p>
                <p className="text-2xl font-bold text-slate-900">{totalHtAllocated.toLocaleString()} HT</p>
                <p className="text-xs text-slate-500 mt-1">Sum across patients</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Unique Patients</p>
                <p className="text-2xl font-bold text-slate-900">{uniquePatients}</p>
                <p className="text-xs text-slate-500 mt-1">Distinct recipients</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm"
            >
              <option value="all">All Periods</option>
              {uniquePeriods.map((period) => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allocations ({filteredRows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRows.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No allocations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">When</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Patient</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">HT Allocated</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Share %</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Total Profit (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, idx) => (
                    <tr key={`${r.distributionId}-${r.patientId}-${idx}`} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{formatTs(r.distributionDate)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-3 w-3 text-slate-400" />
                          <p className="text-sm font-medium text-slate-900">{r.patientName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-bold text-green-600">{r.htAmount.toLocaleString()} HT</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{r.sharePercent.toFixed(2)}%</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-700">PKR {r.totalProfit.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatTs(ts: string): string {
  if (!ts) return 'N/A'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString()
}
