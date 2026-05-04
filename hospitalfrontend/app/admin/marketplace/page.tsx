'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Loader2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { superAdminService } from '@/services/superAdminService'
import type { SuperAdminDashboardSummary } from '@/services/dashboardService'

type TradeRow = NonNullable<SuperAdminDashboardSummary['marketplaceTrades']>[number]
type PnlFilter = 'all' | 'profit' | 'loss'

const toNumber = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function AdminMarketplacePage() {
  const [rows, setRows] = useState<TradeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pnlFilter, setPnlFilter] = useState<PnlFilter>('all')

  const loadTrades = async () => {
    try {
      setLoading(true)
      setError(null)
      const summary = await superAdminService.getSummary()
      setRows(summary.marketplaceTrades || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marketplace trades')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrades()
  }, [])

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return rows.filter((row) => {
      const pnl = toNumber(row.profitLoss)
      const hospital = (row.hospitalName || row.hospitalId || '').toLowerCase()
      const title = (row.tradeTitle || '').toLowerCase()
      const type = (row.tradeType || '').toLowerCase()

      const matchesSearch =
        query.length === 0 ||
        hospital.includes(query) ||
        title.includes(query) ||
        type.includes(query)

      const matchesPnl =
        pnlFilter === 'all' ||
        (pnlFilter === 'profit' && pnl > 0) ||
        (pnlFilter === 'loss' && pnl < 0)

      return matchesSearch && matchesPnl
    })
  }, [rows, searchTerm, pnlFilter])

  const stats = useMemo(() => {
    const profitTrades = rows.filter((r) => toNumber(r.profitLoss) > 0).length
    const lossTrades = rows.filter((r) => toNumber(r.profitLoss) < 0).length
    const invested = rows.reduce((sum, r) => sum + toNumber(r.amountInvested), 0)
    return {
      total: rows.length,
      profitTrades,
      lossTrades,
      invested,
    }
  }, [rows])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace Trades</h1>
          <p className="text-gray-600 mt-1">Database-backed trades with hospital and P/L filters</p>
        </div>
        <Button variant="outline" onClick={loadTrades} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Trades</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Profit Trades</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-700">{stats.profitTrades}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Loss Trades</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-700">{stats.lossTrades}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Invested</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">PKR {Math.round(stats.invested).toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <CardTitle>Trades</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by hospital, title, or type"
                />
              </div>
              <select
                className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                value={pnlFilter}
                onChange={(e) => setPnlFilter(e.target.value as PnlFilter)}
              >
                <option value="all">All P/L</option>
                <option value="profit">Profit Trades</option>
                <option value="loss">Loss Trades</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Loading marketplace trades...
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No trades found for the current filters.</div>
          ) : (
            filteredRows.map((row) => {
              const pnl = toNumber(row.profitLoss)
              const isProfit = pnl > 0
              const hospitalLabel = row.hospitalName || row.hospitalId || 'Unknown hospital'

              return (
                <div key={row.tradeId} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{row.tradeTitle || 'Untitled trade'}</p>
                    <p className="text-xs text-gray-500">{row.tradeType} • {hospitalLabel}</p>
                    <p className="text-xs text-gray-500">Invested: PKR {Math.round(toNumber(row.amountInvested)).toLocaleString()}</p>
                  </div>

                  <div className="text-right">
                    <Badge variant="outline">{row.status}</Badge>
                    <p className={`text-sm mt-2 font-medium inline-flex items-center gap-1 ${isProfit ? 'text-green-600' : pnl < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {isProfit ? <TrendingUp className="h-3.5 w-3.5" /> : pnl < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                      {pnl > 0 ? '+' : ''}PKR {Math.round(pnl).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
