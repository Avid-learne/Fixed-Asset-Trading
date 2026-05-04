'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, Building2, Users, Coins, Activity, AlertCircle } from 'lucide-react'
import { ChartCard } from '../components'
import { superAdminService } from '@/services/superAdminService'
import type { SuperAdminDashboardSummary } from '@/services/dashboardService'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<SuperAdminDashboardSummary | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        setSummary(await superAdminService.getSummary())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const hospitals = summary?.hospitals || []
  const trades = summary?.marketplaceTrades || []
  const banks = summary?.banks || []

  const hospitalComparison = useMemo(() =>
    hospitals.map((h) => ({
      hospital: h.hospitalName,
      patients: Number(h.patientCount || 0),
      totalAT: Number(h.totalAT || 0),
      totalAssets: Number(h.totalAssets || 0),
    })), [hospitals])

  const tradePerformance = useMemo(() =>
    trades.map((t) => ({
      title: t.tradeTitle,
      amountInvested: Number(t.amountInvested || 0),
      profitLoss: Number(t.profitLoss || 0),
    })), [trades])

  const verificationStats = useMemo(() => {
    const all = [...hospitals.map((h) => h.verificationStatus), ...banks.map((b) => b.verificationStatus)]
    const total = all.length || 1
    const approved = all.filter((v) => (v || '').toUpperCase() === 'VERIFIED').length
    const pending = all.filter((v) => (v || '').toUpperCase() === 'PENDING').length
    const rejected = total - approved - pending

    return [
      { category: 'Approved', count: approved, percentage: Math.round((approved / total) * 100) },
      { category: 'Pending', count: pending, percentage: Math.round((pending / total) * 100) },
      { category: 'Rejected', count: rejected, percentage: Math.round((rejected / total) * 100) },
    ]
  }, [hospitals, banks])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Live platform analytics from backend summary</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Total Hospitals</p><p className="text-3xl font-bold text-gray-900">{summary?.totalHospitals || 0}</p><div className="mt-2 flex items-center gap-1 text-xs text-green-600"><TrendingUp className="h-3 w-3" />Live</div></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Active Patients</p><p className="text-3xl font-bold text-gray-900">{summary?.activePatients?.toLocaleString() || 0}</p><div className="mt-2 text-xs text-gray-500">of {summary?.totalPatients || 0}</div></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">AT Minted</p><p className="text-3xl font-bold text-gray-900">{Math.round((summary?.totalATMinted || 0) / 1000000)}M</p><Coins className="h-4 w-4 text-purple-600 mt-2" /></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Trade Volume</p><p className="text-3xl font-bold text-gray-900">PKR {Math.round((summary?.totalTransactionVolume || 0) / 1000000)}M</p><Activity className="h-4 w-4 text-green-600 mt-2" /></CardContent></Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Hospital Comparison (Patients)"
          chartType="bar"
          data={hospitalComparison}
          dataKey="patients"
          xKey="hospital"
          height={280}
          color="#0891b2"
        />

        <ChartCard
          title="Marketplace Trades (Invested)"
          chartType="bar"
          data={tradePerformance}
          dataKey="amountInvested"
          xKey="title"
          height={280}
          color="#10b981"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verification Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationStats.map((stat) => (
            <div key={stat.category}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{stat.category}</span>
                <span className="text-sm text-gray-900">{stat.count} ({stat.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stat.category === 'Approved' ? 'bg-green-600' :
                    stat.category === 'Pending' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hospital Performance Ranking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hospitals.length === 0 ? (
            <div className="text-gray-500">No hospital performance data available.</div>
          ) : hospitals
            .slice()
            .sort((a, b) => Number(b.totalAssets || 0) - Number(a.totalAssets || 0))
            .slice(0, 6)
            .map((hospital, index) => (
              <div key={hospital.hospitalId} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-900">#{index + 1} {hospital.hospitalName}</p>
                  <p className="text-xs text-gray-500">Patients: {hospital.patientCount} • {hospital.verificationStatus}</p>
                </div>
                <div className="text-right text-sm text-gray-700">
                  <p>AT: {Math.round(Number(hospital.totalAT || 0)).toLocaleString()}</p>
                  <p>Assets: PKR {Math.round(Number(hospital.totalAssets || 0)).toLocaleString()}</p>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5"><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-cyan-600" /><span className="text-sm">Hospitals listed</span></div><div className="text-2xl font-bold mt-2">{hospitals.length}</div></CardContent></Card>
        <Card><CardContent className="pt-5"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" /><span className="text-sm">Bank partners</span></div><div className="text-2xl font-bold mt-2">{banks.length}</div></CardContent></Card>
        <Card><CardContent className="pt-5"><div className="flex items-center gap-2"><Coins className="h-4 w-4 text-purple-600" /><span className="text-sm">Trades tracked</span></div><div className="text-2xl font-bold mt-2">{trades.length}</div></CardContent></Card>
        <Card><CardContent className="pt-5"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-green-600" /><span className="text-sm">System uptime</span></div><div className="text-2xl font-bold mt-2">{summary?.systemUptime?.toFixed(2) || '0.00'}%</div></CardContent></Card>
      </div>
    </div>
  )
}
