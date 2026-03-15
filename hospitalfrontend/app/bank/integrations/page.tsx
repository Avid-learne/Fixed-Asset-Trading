'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, RefreshCw, Search, Unlink } from 'lucide-react'
import { bankIntegrationService, type BankHospitalIntegration } from '@/services/bankIntegrationService'

const toNumber = (value: number | string | undefined | null) => Number(value || 0)

export default function BankIntegrationsPage() {
  const [rows, setRows] = useState<BankHospitalIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<BankHospitalIntegration | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await bankIntegrationService.getBankIntegrations()
      setRows(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integrations')
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
        item.hospitalName.toLowerCase().includes(q) ||
        item.hospitalEmail.toLowerCase().includes(q) ||
        item.hospitalCity?.toLowerCase().includes(q)
      )
    })
  }, [rows, search])

  const unlink = async (partnershipId: string) => {
    try {
      setActionId(partnershipId)
      setError('')
      await bankIntegrationService.unlinkBankIntegration(partnershipId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove integration')
    } finally {
      setActionId(null)
    }
  }

  const approve = async (partnershipId: string) => {
    try {
      setActionId(partnershipId)
      setError('')
      await bankIntegrationService.approveIntegration(partnershipId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve integration')
    } finally {
      setActionId(null)
    }
  }

  const reject = async () => {
    if (!rejectTarget) return
    if (!rejectReason.trim()) {
      setError('Rejection reason is required')
      return
    }

    try {
      setActionId(rejectTarget.partnershipId)
      setError('')
      await bankIntegrationService.rejectIntegration(rejectTarget.partnershipId, rejectReason.trim())
      setRejectDialogOpen(false)
      setRejectTarget(null)
      setRejectReason('')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject integration')
    } finally {
      setActionId(null)
    }
  }

  const totalAssetValue = rows.reduce((sum, row) => sum + toNumber(row.totalAssetValuePkr), 0)
  const totalApproved = rows.reduce((sum, row) => sum + toNumber(row.approvedDeposits), 0)
  const totalPending = rows.reduce((sum, row) => sum + toNumber(row.pendingDeposits), 0)

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 pb-8 pt-2 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Hospital Integrations</h1>
        <p className="mt-1 text-sm text-slate-600">Manage hospital partnerships connected to this bank account.</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Requests</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{rows.length}</p></CardContent></Card>
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Approved Deposits</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-emerald-700">{totalApproved.toLocaleString()}</p></CardContent></Card>
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Pending Deposits</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-amber-700">{totalPending.toLocaleString()}</p></CardContent></Card>
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Asset Value (PKR)</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{totalAssetValue.toLocaleString()}</p></CardContent></Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">Integrated Hospitals</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Search hospital" />
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
                  <TableHead>Hospital</TableHead>
                  <TableHead>Hospital KYC</TableHead>
                  <TableHead>Integration Status</TableHead>
                  <TableHead className="text-right">Approved</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Asset Value</TableHead>
                  <TableHead>Partnership Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-slate-500">No hospital requests found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.partnershipId}>
                      <TableCell>
                        <p className="font-medium text-slate-900">{row.hospitalName}</p>
                        <p className="text-xs text-slate-500">{row.hospitalEmail}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.hospitalVerificationStatus === 'VERIFIED' ? 'default' : 'outline'}>
                          KYC {row.hospitalVerificationStatus}
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
                      <TableCell className="text-right">
                        {row.integrationStatus === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={actionId === row.partnershipId} onClick={() => approve(row.partnershipId)}>
                              {actionId === row.partnershipId ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-rose-200 text-rose-700 hover:bg-rose-50"
                              disabled={actionId === row.partnershipId}
                              onClick={() => {
                                setRejectTarget(row)
                                setRejectDialogOpen(true)
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : row.integrationStatus === 'APPROVED' ? (
                          <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50" disabled={actionId === row.partnershipId} onClick={() => unlink(row.partnershipId)}>
                            {actionId === row.partnershipId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
                            Unlink
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-500">{row.rejectionReason || 'Rejected'}</span>
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

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Integration Request</DialogTitle>
            <DialogDescription>
              Add a rejection reason for this hospital integration request.
            </DialogDescription>
          </DialogHeader>
          <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={!rejectReason.trim() || (rejectTarget ? actionId === rejectTarget.partnershipId : false)} onClick={reject}>
              {rejectTarget && actionId === rejectTarget.partnershipId ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
