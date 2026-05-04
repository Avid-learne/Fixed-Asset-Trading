'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Loader2, Trash2, BarChart3, TrendingUp, Coins, Users, DollarSign, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { authService } from '@/lib/authService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

function formatNumber(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return String(Math.round(v))
}

interface ReportLog {
  id: string; reportType: string; fromPeriod: string; toPeriod: string
  status: string; generatedAt: string; generatedByName: string
}

interface ReportData {
  reportType: string; fromPeriod: string; toPeriod: string; hospitalName: string; generatedAt: string
  totalPatients: number; totalDeposits: number; pendingDeposits: number; approvedDeposits: number
  totalAssetValue: number; totalAtMinted: number; totalHtAllocated: number
  totalProfitDistributed: number; tradingVolume: number; totalTrades: number
  assetBreakdown: Array<{ assetType: string; count: number; totalValue: number }>
  monthlyData: Array<{ month: string; deposits: number; mintedAt: number; profitDistributed: number }>
}

export default function ReportsPage() {
  const [history, setHistory] = useState<ReportLog[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState<ReportData | null>(null)

  const [fromPeriod, setFromPeriod] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1)
    return d.toISOString().split('T')[0]
  })
  const [toPeriod, setToPeriod] = useState(() => new Date().toISOString().split('T')[0])
  const [reportType, setReportType] = useState('FINANCIAL')

  const loadHistory = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/reports/history`, { headers: getAuthHeaders() })
      const result = await res.json()
      if (result.success) setHistory(result.data || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadHistory() }, [])

  const handleGenerate = async () => {
    if (!fromPeriod || !toPeriod) { setError('Select date range'); return }
    try {
      setGenerating(true); setError(''); setReportData(null)
      const res = await fetch(`${API_BASE}/reports/generate`, {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ fromPeriod, toPeriod, reportType }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to generate')
      setReportData(result.data)
      await loadHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_BASE}/reports/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
      await loadHistory()
    } catch {
      setError('Failed to delete report')
    }
  }

  

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">Generate and view hospital reports from real data.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Generate Report */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Generate Report</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent position="popper" className="z-[100] bg-white shadow-lg border">
                  <SelectItem value="FINANCIAL">Financial Summary</SelectItem>
                  <SelectItem value="DEPOSITS">Deposits Report</SelectItem>
                  <SelectItem value="MINTING">Token Minting Report</SelectItem>
                  <SelectItem value="PATIENTS">Patient Analytics</SelectItem>
                  <SelectItem value="TRADING">Trading Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={fromPeriod} onChange={(e) => setFromPeriod(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={toPeriod} onChange={(e) => setToPeriod(e.target.value)} />
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="h-10">
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Result */}
      {reportData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{reportData.reportType} Report — {reportData.hospitalName}</h2>
            {/* Export button removed per project policy */}
          </div>
          <p className="text-sm text-muted-foreground">{reportData.fromPeriod} to {reportData.toPeriod}</p>

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Patients', value: reportData.totalPatients, icon: Users },
              { label: 'Deposits', value: reportData.totalDeposits, icon: Clock },
              { label: 'Asset Value', value: reportData.totalAssetValue, icon: DollarSign, prefix: 'PKR ' },
              { label: 'AT Minted', value: reportData.totalAtMinted, icon: Coins },
              { label: 'HT Allocated', value: reportData.totalHtAllocated, icon: TrendingUp },
              { label: 'Trading Vol.', value: reportData.tradingVolume, icon: BarChart3, prefix: 'PKR ' },
            ].map((kpi, i) => (
              <Card key={i}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{kpi.label}</span>
                    <kpi.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-bold">{kpi.prefix || ''}{formatNumber(kpi.value)}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monthly chart */}
          {reportData.monthlyData.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Monthly Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.monthlyData} margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v: number) => formatNumber(v)} width={60} />
                    <Tooltip formatter={(v: number) => formatNumber(v)} />
                    <Legend />
                    <Bar dataKey="deposits" name="Deposits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="mintedAt" name="AT Minted" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profitDistributed" name="Profit Distributed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Asset breakdown table */}
          {reportData.assetBreakdown.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Asset Breakdown</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Type</TableHead>
                      <TableHead className="text-right">Deposits</TableHead>
                      <TableHead className="text-right">Total Value (PKR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.assetBreakdown.map((a, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{a.assetType}</TableCell>
                        <TableCell className="text-right">{a.count}</TableCell>
                        <TableCell className="text-right font-medium">PKR {a.totalValue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Report History */}
      <Card>
        <CardHeader><CardTitle>Report History</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No reports generated yet. Generate your first report above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Generated At</TableHead>
                  <TableHead>Generated By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="outline">{log.reportType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.fromPeriod} to {log.toPeriod}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.generatedAt ? new Date(log.generatedAt).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className="text-sm">{log.generatedByName}</TableCell>
                    <TableCell>
                      <Badge className={log.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(log.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
