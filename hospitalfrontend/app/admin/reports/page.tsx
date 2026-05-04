'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'
import { superAdminService, type SuperAdminReportLog } from '@/services/superAdminService'
import type { SuperAdminDashboardSummary } from '@/services/dashboardService'

export default function ReportsPage() {
const mapTradeToReportLog = (trade: NonNullable<SuperAdminDashboardSummary['marketplaceTrades']>[number]): SuperAdminReportLog => {
  const generatedAt = trade.endTime || trade.startTime || new Date().toISOString()
  const period = generatedAt.split('T')[0]
  return {
    id: trade.tradeId,
    reportType: `${trade.tradeType} Trade Activity`,
    fromPeriod: period,
    toPeriod: period,
    status: trade.status,
    generatedAt,
    generatedByName: trade.hospitalName || 'Super Admin Dashboard',
  }
}
  const [rows, setRows] = useState<SuperAdminReportLog[]>([])
  const [summary, setSummary] = useState<SuperAdminDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [historyWarning, setHistoryWarning] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setHistoryWarning(null)
        const [historyResult, summaryResult] = await Promise.allSettled([
          superAdminService.getReportsHistory(),
          superAdminService.getSummary(),
        ])

        if (summaryResult.status === 'fulfilled') {
          const dashboard = summaryResult.value
          setSummary(dashboard)
          if (historyResult.status === 'rejected') {
            const trades = dashboard.marketplaceTrades || []
            setRows(trades.map(mapTradeToReportLog))
            setHistoryWarning('Report history is not available for this account, so the page is showing live trade activity instead.')
          }
        }

        if (historyResult.status === 'fulfilled') {
          setRows(historyResult.value)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filtered = useMemo(() => rows.filter((r) => {
    const q = searchTerm.toLowerCase()
    return (r.reportType || '').toLowerCase().includes(q) ||
      (r.status || '').toLowerCase().includes(q) ||
      (r.generatedByName || '').toLowerCase().includes(q)
  }), [rows, searchTerm])

  const reportTotals = useMemo(() => ({
    generated: rows.length,
    activeHospitals: summary?.activeHospitals || 0,
    activeBanks: summary?.activeBanks || 0,
    revenue: Math.round(summary?.totalRevenue || 0),
  }), [rows.length, summary])


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generated reports fetched from backend API</p>
        </div>
          {/* Export button removed per project policy */}
      </div>
      {historyWarning && <div className="text-sm text-amber-700">{historyWarning}</div>}
      {error && <div className="text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Generated Reports</p><p className="text-3xl font-bold text-gray-900">{reportTotals.generated}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Active Hospitals</p><p className="text-3xl font-bold text-gray-900">{reportTotals.activeHospitals}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Active Banks</p><p className="text-3xl font-bold text-gray-900">{reportTotals.activeBanks}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Revenue</p><p className="text-3xl font-bold text-gray-900">PKR {reportTotals.revenue.toLocaleString()}</p></CardContent></Card>
      </div>

      {summary?.hospitals && summary.hospitals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hospital Performance Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.hospitals
              .slice()
              .sort((a, b) => Number(b.totalAssets || 0) - Number(a.totalAssets || 0))
              .slice(0, 5)
              .map((hospital) => (
                <div key={hospital.hospitalId} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-medium text-gray-900">{hospital.hospitalName}</p>
                    <p className="text-xs text-gray-500">Patients: {hospital.patientCount} • Status: {hospital.verificationStatus}</p>
                  </div>
                  <div className="text-right text-sm text-gray-700">
                    <p>AT: {Math.round(Number(hospital.totalAT || 0)).toLocaleString()}</p>
                    <p>Assets: PKR {Math.round(Number(hospital.totalAssets || 0)).toLocaleString()}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search report type, status, or generated by..." />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Loading reports...</div>
          ) : filtered.length === 0 ? (
            <div className="text-gray-500">No reports found.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{report.reportType}</p>
                    <p className="text-xs text-gray-500">Period: {report.fromPeriod} - {report.toPeriod}</p>
                    <p className="text-xs text-gray-500">Generated by: {report.generatedByName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{report.status}</Badge>
                    <p className="text-xs text-gray-500 mt-1">{new Date(report.generatedAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
