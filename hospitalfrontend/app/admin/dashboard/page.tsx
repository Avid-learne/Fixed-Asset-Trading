'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Banknote, TrendingUp, Activity, AlertCircle, Loader2 } from 'lucide-react'
import { superAdminService } from '@/services/superAdminService'
import type { SuperAdminDashboardSummary } from '@/services/dashboardService'

const badgeClass = (status?: string) => {
  const value = (status || '').toUpperCase()
  if (value === 'VERIFIED' || value === 'ACTIVE') return 'bg-green-100 text-green-800 border-green-200'
  if (value === 'PENDING') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-red-100 text-red-800 border-red-200'
}

export default function SuperadminDashboard() {
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
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const hospitals = summary?.hospitals || []
  const banks = summary?.banks || []
  const trades = summary?.marketplaceTrades || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Control Center</h1>
          <p className="text-gray-600 mt-1">Live overview from dashboard APIs</p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 text-red-700 text-sm">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-500"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Loading dashboard...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Total Hospitals</p><p className="text-3xl font-bold text-gray-900">{summary?.totalHospitals || 0}</p><Building2 className="h-4 w-4 text-cyan-600 mt-2" /></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Bank Partners</p><p className="text-3xl font-bold text-gray-900">{summary?.totalBanks || 0}</p><Banknote className="h-4 w-4 text-blue-600 mt-2" /></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Active Patients</p><p className="text-3xl font-bold text-gray-900">{summary?.activePatients?.toLocaleString() || 0}</p><Users className="h-4 w-4 text-green-600 mt-2" /></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Trade Volume</p><p className="text-3xl font-bold text-gray-900">PKR {Math.round((summary?.totalTransactionVolume || 0) / 1000000)}M</p><TrendingUp className="h-4 w-4 text-purple-600 mt-2" /></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Hospital Registry</CardTitle>
                  <Link href="/admin/hospitals"><Button variant="link" size="sm">Manage</Button></Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {hospitals.length === 0 ? <p className="text-sm text-gray-500">No hospital records available.</p> : hospitals.map((hospital) => (
                  <div key={hospital.hospitalId} className="border rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{hospital.hospitalName}</p>
                      <p className="text-xs text-gray-500">Patients: {hospital.patientCount}</p>
                    </div>
                    <Badge className={badgeClass(hospital.verificationStatus)}>{hospital.verificationStatus}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Bank Registry</CardTitle>
                  <Link href="/admin/banks"><Button variant="link" size="sm">Manage</Button></Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {banks.length === 0 ? <p className="text-sm text-gray-500">No bank records available.</p> : banks.map((bank) => (
                  <div key={bank.bankId} className="border rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{bank.bankName}</p>
                      <p className="text-xs text-gray-500">Partnerships: {bank.activePartnerships}</p>
                    </div>
                    <Badge className={badgeClass(bank.verificationStatus)}>{bank.verificationStatus}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-purple-600" />Marketplace Trades</CardTitle>
                <Link href="/admin/marketplace"><Button variant="link" size="sm">Inspect</Button></Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {trades.length === 0 ? <p className="text-sm text-gray-500">No trade records available.</p> : trades.map((trade) => (
                <div key={trade.tradeId} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{trade.tradeTitle}</p>
                    <p className="text-xs text-gray-500">{trade.tradeType} • {trade.hospitalName || trade.hospitalId}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{trade.status}</Badge>
                    <p className="text-xs text-gray-500 mt-1">PKR {Math.round(Number(trade.amountInvested || 0)).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Health</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-xl font-bold text-gray-900">{summary?.systemUptime?.toFixed(2) || '0.00'}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Hospitals</p>
                <p className="text-xl font-bold text-yellow-700">{summary?.pendingHospitals || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Banks</p>
                <p className="text-xl font-bold text-yellow-700">{summary?.pendingBanks || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Disabled Entities</p>
                <p className="text-xl font-bold text-red-700">{(summary?.disabledHospitals || 0) + (summary?.disabledBanks || 0)}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
