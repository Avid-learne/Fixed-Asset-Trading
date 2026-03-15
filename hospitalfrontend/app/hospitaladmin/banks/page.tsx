'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, RefreshCw, Search } from 'lucide-react'
import {
  bankIntegrationService,
  type BankOption,
  type HospitalBankIntegration,
} from '@/services/bankIntegrationService'

const toNumber = (value: number | string | undefined | null) => Number(value || 0)

export default function HospitalAdminBankIntegrationsPage() {
  const [rows, setRows] = useState<HospitalBankIntegration[]>([])
  const [availableBanks, setAvailableBanks] = useState<BankOption[]>([])
  const [selectedBankId, setSelectedBankId] = useState('')

  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [showLinkDialog, setShowLinkDialog] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [integrationData, banksData] = await Promise.all([
        bankIntegrationService.getHospitalIntegrations(),
        bankIntegrationService.getAvailableBanks(),
      ])
      setRows(integrationData)
      setAvailableBanks(banksData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bank integrations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((item) => {
      return (
        item.bankName.toLowerCase().includes(q) ||
        item.bankEmail.toLowerCase().includes(q) ||
        item.bankCity?.toLowerCase().includes(q)
      )
    })
  }, [rows, search])

  const linkBank = async () => {
    if (!selectedBankId) {
      setError('Please select a bank to link')
      return
    }

    try {
      setLinking(true)
      setError('')
      await bankIntegrationService.linkBank(selectedBankId)
      setShowLinkDialog(false)
      setSelectedBankId('')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link bank')
    } finally {
      setLinking(false)
    }
  }

  const totalAssetValue = rows.reduce((sum, row) => sum + toNumber(row.totalAssetValuePkr), 0)
  const totalApproved = rows.reduce((sum, row) => sum + toNumber(row.approvedDeposits), 0)
  const totalPending = rows.reduce((sum, row) => sum + toNumber(row.pendingDeposits), 0)

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 pb-8 pt-2 lg:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Bank Integrations</h1>
          <p className="mt-1 text-sm text-slate-600">Link your hospital with custodian banks for asset deposit workflows.</p>
        </div>
        <Button onClick={() => setShowLinkDialog(true)} disabled={availableBanks.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Link New Bank
        </Button>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Total Requests</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{rows.length}</p></CardContent></Card>
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Approved Deposits</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-emerald-700">{totalApproved.toLocaleString()}</p></CardContent></Card>
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Pending Deposits</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-amber-700">{totalPending.toLocaleString()}</p></CardContent></Card>
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Asset Value (PKR)</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{totalAssetValue.toLocaleString()}</p></CardContent></Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">Bank Integration Requests</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Search bank" />
              </div>
              <Button variant="outline" onClick={loadData}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" />Loading integrations...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank</TableHead>
                  <TableHead>Bank KYC</TableHead>
                  <TableHead>Request Status</TableHead>
                  <TableHead className="text-right">Approved</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Asset Value</TableHead>
                  <TableHead>Partnership Date</TableHead>
                  <TableHead>Bank Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-slate-500">No bank requests found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.partnershipId}>
                      <TableCell>
                        <p className="font-medium text-slate-900">{row.bankName}</p>
                        <p className="text-xs text-slate-500">{row.bankEmail}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.bankVerificationStatus === 'VERIFIED' ? 'default' : 'outline'}>
                          KYC {row.bankVerificationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.integrationStatus === 'APPROVED'
                              ? 'default'
                              : row.integrationStatus === 'REJECTED'
                                ? 'destructive'
                                : 'outline'
                          }
                        >
                          {row.integrationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-emerald-700 font-medium">{toNumber(row.approvedDeposits).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-amber-700 font-medium">{toNumber(row.pendingDeposits).toLocaleString()}</TableCell>
                      <TableCell className="text-right">PKR {toNumber(row.totalAssetValuePkr).toLocaleString()}</TableCell>
                      <TableCell>{row.partnershipStarted ? new Date(row.partnershipStarted).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        {row.integrationStatus === 'REJECTED' ? (row.rejectionReason || 'Rejected by bank') : (
                          <span className="text-sm text-slate-600">
                            {row.integrationStatus === 'PENDING' ? 'Awaiting bank decision' : 'Approved by bank'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link New Bank</DialogTitle>
            <DialogDescription>
              Select a bank to create a new integration partnership for your hospital.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Select value={selectedBankId} onValueChange={setSelectedBankId}>
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {availableBanks.length === 0 ? (
                  <SelectItem value="none" disabled>No available banks</SelectItem>
                ) : (
                  availableBanks.map((bank) => (
                    <SelectItem key={bank.bankId} value={bank.bankId}>
                      {bank.bankName} ({bank.city || 'City N/A'})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedBankId && (
              <p className="text-xs text-slate-500">
                {availableBanks.find((b) => b.bankId === selectedBankId)?.email}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)} disabled={linking}>Cancel</Button>
            <Button onClick={linkBank} disabled={linking || !selectedBankId}>
              {linking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
