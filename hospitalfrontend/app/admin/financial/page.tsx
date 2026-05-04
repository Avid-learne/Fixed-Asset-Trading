'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Percent, PieChart as PieChartIcon, Loader2 } from 'lucide-react'
import { superAdminService, type SuperAdminReportLog } from '@/services/superAdminService'
import type { SuperAdminDashboardSummary } from '@/services/dashboardService'

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<SuperAdminDashboardSummary | null>(null)
  const [reports, setReports] = useState<SuperAdminReportLog[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [summaryData, history] = await Promise.all([
          superAdminService.getSummary(),
          superAdminService.getReportsHistory(),
        ])
        setSummary(summaryData)
        setReports(history)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load financial data')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const hospitals = summary?.hospitals || []
  const totalAssetValue = useMemo(
    () => hospitals.reduce((sum, h) => sum + Number(h.totalAssets || 0), 0),
    [hospitals]
  )
  const totalTokens = useMemo(
    () => hospitals.reduce((sum, h) => sum + Number(h.totalAT || 0), 0),
    [hospitals]
  )
  const margin = summary?.totalRevenue
    ? ((summary.totalRevenue / Math.max(summary.totalTransactionVolume, 1)) * 100).toFixed(2)
    : '0.00'

  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-500 mt-1">Live financial overview from summary and generated reports API</p>
        </div>
        {/* Export button removed per project policy */}
      </div>

      {error && <div className="text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">PKR {Math.round(summary?.totalRevenue || 0).toLocaleString()}</div><DollarSign className="w-4 h-4 text-primary mt-2" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Transaction Volume</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">PKR {Math.round(summary?.totalTransactionVolume || 0).toLocaleString()}</div><TrendingUp className="w-4 h-4 text-green-600 mt-2" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Margin Ratio</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{margin}%</div><Percent className="w-4 h-4 text-secondary mt-2" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tokenized Asset Value</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">PKR {Math.round(totalAssetValue).toLocaleString()}</div><PieChartIcon className="w-4 h-4 text-accent mt-2" /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token Distribution by Hospital (Live)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Loading distribution...</div>
          ) : hospitals.length === 0 ? (
            <div className="text-gray-500">No hospital token data available.</div>
          ) : hospitals.map((item) => {
            const value = Number(item.totalAT || 0)
            const ratio = totalTokens > 0 ? (value / totalTokens) * 100 : 0
            return (
              <div key={item.hospitalId} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.hospitalName}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.max(2, ratio)}%` }} />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="font-medium text-gray-900">{Math.round(value).toLocaleString()} AT</p>
                  <p className="text-sm text-gray-500">{ratio.toFixed(2)}%</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Financial Reports (History API)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-gray-500">No generated reports found.</div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-medium text-gray-900">{report.reportType}</p>
                    <p className="text-xs text-gray-500">{report.fromPeriod} - {report.toPeriod}</p>
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
