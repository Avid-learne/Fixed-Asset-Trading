'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { profitDistributionService, type PatientShareDistributionRow } from '@/services/profitDistributionService'
import { 
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Search,
  Download,
  Filter,
  Clock,
  PieChart
} from 'lucide-react'

const parseMonthLabel = (month: string) => {
  // backend sends LocalDate like YYYY-MM-DD
  const dt = new Date(`${month}T00:00:00Z`)
  return Number.isNaN(dt.getTime())
    ? month
    : dt.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

const formatDateTime = (value: string | null) => {
  if (!value) return '—'
  const dt = new Date(value)
  return Number.isNaN(dt.getTime()) ? value : dt.toLocaleString()
}

export default function HospitalProfitDistribution() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')
  const [rows, setRows] = useState<PatientShareDistributionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    profitDistributionService
      .getHospitalPatientShareDistributions()
      .then((data) => {
        if (!mounted) return
        setRows(Array.isArray(data) ? data : [])
      })
      .catch((e: unknown) => {
        if (!mounted) return
        setRows([])
        setError(e instanceof Error ? e.message : 'Failed to load distributions')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const filteredRows = useMemo(() => {
    const lowerSearch = searchQuery.trim().toLowerCase()

    return rows.filter((dist) => {
      const patientIdDisplay = dist.patientRegistrationId || dist.patientId
      const matchesSearch =
        !lowerSearch ||
        dist.patientName.toLowerCase().includes(lowerSearch) ||
        (dist.patientCnic || '').toLowerCase().includes(lowerSearch) ||
        patientIdDisplay.toLowerCase().includes(lowerSearch) ||
        dist.tradeId.toLowerCase().includes(lowerSearch)

      const rowStatus = dist.isDistributed ? 'distributed' : 'pending'
      const matchesStatus = statusFilter === 'all' || rowStatus === statusFilter
      const matchesPeriod = periodFilter === 'all' || dist.distributionMonth === periodFilter

      return matchesSearch && matchesStatus && matchesPeriod
    })
  }, [rows, searchQuery, statusFilter, periodFilter])

  const totalHtDistributed = useMemo(() => {
    return rows.filter((r) => r.isDistributed).reduce((sum, r) => sum + (r.htAmount || 0), 0)
  }, [rows])

  const pendingHtAmount = useMemo(() => {
    return rows.filter((r) => !r.isDistributed).reduce((sum, r) => sum + (r.htAmount || 0), 0)
  }, [rows])

  const totalPatients = useMemo(() => {
    return new Set(rows.map((r) => r.patientId)).size
  }, [rows])

  const totalAtAllocated = useMemo(() => {
    const seen = new Set<string>()
    let sum = 0
    for (const r of rows) {
      if (!r.participationId || seen.has(r.participationId)) continue
      seen.add(r.participationId)
      sum += r.atAllocated || 0
    }
    return sum
  }, [rows])

  const uniqueMonths = useMemo(() => {
    return [...new Set(rows.map((r) => r.distributionMonth))].sort().reverse()
  }, [rows])

  const getStatusColor = (isDistributed: boolean) => {
    return isDistributed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profit Distribution</h1>
          <p className="text-slate-600 mt-1">Patient share (AT & HT) by trade and time</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">HT Distributed</p>
                <p className="text-2xl font-bold text-slate-900">{totalHtDistributed.toLocaleString()} HT</p>
                <p className="text-xs text-slate-500 mt-1">Distributed rows</p>
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
                <p className="text-sm text-slate-600">Total Patients</p>
                <p className="text-2xl font-bold text-slate-900">{totalPatients}</p>
                <p className="text-xs text-slate-500 mt-1">Receiving profits</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending HT</p>
                <p className="text-2xl font-bold text-slate-900">{pendingHtAmount.toLocaleString()} HT</p>
                <p className="text-xs text-slate-500 mt-1">Not yet distributed</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">AT Allocated</p>
                <p className="text-2xl font-bold text-slate-900">{totalAtAllocated.toLocaleString()} AT</p>
                <p className="text-xs text-slate-500 mt-1">Unique trade participations</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient, CNIC, patient ID, or trade ID..."
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
              <option value="all">All Months</option>
              {uniqueMonths.map((month) => (
                <option key={month} value={month}>{parseMonthLabel(month)}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="distributed">Distributed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Patient Share Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Share Distributions</CardTitle>
          <CardDescription>
            Which patient received how much AT/HT, when, and for which trade
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-500">
              <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Loading distributions…</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-slate-500">
              <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{error}</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No distributions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Patient</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">CNIC</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Trade</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">AT Allocated</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">AT Allocated At</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">HT Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Month</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">HT Distributed At</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r.distributionId} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{r.patientName}</p>
                          <p className="text-xs text-slate-500">{r.patientRegistrationId || r.patientId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-600">{r.patientCnic || '—'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-slate-700">{r.tradeId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-slate-900">{(r.atAllocated ?? 0).toLocaleString()} AT</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{formatDateTime(r.atAllocatedAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-bold text-green-600">{(r.htAmount ?? 0).toLocaleString()} HT</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-700">{parseMonthLabel(r.distributionMonth)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{formatDateTime(r.htDistributedAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(!!r.isDistributed)}>
                          {r.isDistributed ? 'distributed' : 'pending'}
                        </Badge>
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
