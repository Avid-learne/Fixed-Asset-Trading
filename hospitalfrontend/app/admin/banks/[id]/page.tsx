'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Banknote, ArrowLeft, Loader2 } from 'lucide-react'
import { superAdminService, type SuperAdminBankDetails } from '@/services/superAdminService'

const statusClass = (status?: string) => {
  const normalized = (status || '').toUpperCase()
  if (normalized === 'VERIFIED' || normalized === 'ACTIVE' || normalized === 'APPROVED') {
    return 'bg-green-100 text-green-800 border-green-200'
  }
  if (normalized === 'PENDING') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-red-100 text-red-800 border-red-200'
}

export default function BankDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [bank, setBank] = useState<SuperAdminBankDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const details = await superAdminService.getBankDetails(params.id)
        setBank(details)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bank details')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [params.id])

  const approvedLinks = useMemo(() => {
    return (bank?.linkedHospitals || []).filter((link) => (link.integrationStatus || '').toUpperCase() === 'APPROVED')
  }, [bank])

  const handleVerify = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!bank) return
    try {
      setUpdatingStatus(true)
      await superAdminService.updateBankStatus(bank.bankId, status)
      setBank((prev) => prev ? { ...prev, verificationStatus: status } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bank status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
        Loading bank details...
      </div>
    )
  }

  if (error) {
    return <div className="text-red-700 text-sm">{error}</div>
  }

  if (!bank) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Bank not found.</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Banknote className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{bank.bankName}</h1>
            <p className="text-gray-600">Bank ID: {bank.bankId}</p>
          </div>
        </div>
        <Link href="/admin/banks">
          <Button variant="outline">All Banks</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Status</CardTitle></CardHeader><CardContent><Badge className={statusClass(bank.verificationStatus)}>{bank.verificationStatus}</Badge></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active Partnerships</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{bank.activePartnerships}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Confirmed Deposits</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{bank.totalDeposits.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Asset Value (PKR)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">PKR {Math.round(Number(bank.totalAssetValuePkr || 0)).toLocaleString()}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Bank Profile</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-gray-500">Registration:</span> {bank.registration || '—'}</p>
            <p><span className="text-gray-500">SWIFT:</span> {bank.swiftCode || '—'}</p>
            <p><span className="text-gray-500">Bank Code:</span> {bank.bankCode || '—'}</p>
            <p><span className="text-gray-500">Email:</span> {bank.email || '—'}</p>
            <p><span className="text-gray-500">Contact:</span> {bank.contactNum || '—'}</p>
            <p><span className="text-gray-500">City:</span> {bank.city || '—'}</p>
            <p><span className="text-gray-500">Address:</span> {bank.address || '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Integration Snapshot</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-gray-500">Total Linked Hospitals:</span> {bank.linkedHospitals.length}</p>
            <p><span className="text-gray-500">Approved Links:</span> {approvedLinks.length}</p>
            <p><span className="text-gray-500">Pending Links:</span> {bank.linkedHospitals.filter((l) => (l.integrationStatus || '').toUpperCase() === 'PENDING').length}</p>
            <p><span className="text-gray-500">Rejected Links:</span> {bank.linkedHospitals.filter((l) => (l.integrationStatus || '').toUpperCase() === 'REJECTED').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Bank KYC</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button disabled={updatingStatus} onClick={() => handleVerify('VERIFIED')}>Verify KYC</Button>
          <Button disabled={updatingStatus} variant="outline" className="text-red-600" onClick={() => handleVerify('REJECTED')}>Reject KYC</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrated Hospitals</CardTitle>
        </CardHeader>
        <CardContent>
          {bank.linkedHospitals.length === 0 ? (
            <p className="text-sm text-gray-500">No hospital integrations found for this bank.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Hospital Status</TableHead>
                  <TableHead>Integration</TableHead>
                  <TableHead>Confirmed Deposits</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Asset Value (PKR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bank.linkedHospitals.map((link) => (
                  <TableRow key={link.partnershipId}>
                    <TableCell className="font-medium">{link.hospitalName}</TableCell>
                    <TableCell><Badge className={statusClass(link.hospitalVerificationStatus)}>{link.hospitalVerificationStatus}</Badge></TableCell>
                    <TableCell><Badge className={statusClass(link.integrationStatus)}>{link.integrationStatus}</Badge></TableCell>
                    <TableCell>{link.totalDeposits.toLocaleString()}</TableCell>
                    <TableCell>{link.approvedDeposits.toLocaleString()}</TableCell>
                    <TableCell>{link.pendingDeposits.toLocaleString()}</TableCell>
                    <TableCell>PKR {Math.round(Number(link.totalAssetValuePkr || 0)).toLocaleString()}</TableCell>
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
