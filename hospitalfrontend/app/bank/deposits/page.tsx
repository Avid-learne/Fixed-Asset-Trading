'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle2, XCircle, Loader2, RefreshCw, Search, ShieldCheck } from 'lucide-react'
import { depositRequestService, type AssetDepositItem, type ConfirmCustodyPayload } from '@/services/depositRequestService'

const toNumber = (value: number | string | undefined | null) => Number(value || 0)

export default function BankDepositsPage() {
  const [rows, setRows] = useState<AssetDepositItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [bankStatusFilter, setBankStatusFilter] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<AssetDepositItem | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const [custodyOpen, setCustodyOpen] = useState(false)
  const [custodyTarget, setCustodyTarget] = useState<AssetDepositItem | null>(null)
  const [custodyForm, setCustodyForm] = useState<ConfirmCustodyPayload>({
    verifiedPurityPercent: 99.9,
    verifiedWeightGrams: 0,
    assetCondition: 'EXCELLENT',
    serialNumber: '',
    loanAmountApprovedPkr: 0,
    loanInterestRatePercent: 5,
    verificationNotes: '',
  })

  const loadRequests = async (bankStatus: string = bankStatusFilter) => {
    try {
      setLoading(true)
      setError('')
      const data = await depositRequestService.getBankRequests(bankStatus)
      setRows(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deposit requests')
    } finally {
      setLoading(false)
    }
  }

  const openCustodyDialog = (row: AssetDepositItem) => {
    setCustodyTarget(row)
    setCustodyForm({
      verifiedPurityPercent: 99.9,
      verifiedWeightGrams: toNumber(row.weight),
      assetCondition: 'EXCELLENT',
      serialNumber: '',
      loanAmountApprovedPkr: toNumber(row.assetValue),
      loanInterestRatePercent: 5,
      verificationNotes: '',
    })
    setCustodyOpen(true)
  }

  const submitCustody = async () => {
    if (!custodyTarget) return
    if (!custodyForm.verifiedWeightGrams || custodyForm.verifiedWeightGrams <= 0) {
      setError('Verified weight must be greater than 0')
      return
    }
    if (!custodyForm.loanAmountApprovedPkr || custodyForm.loanAmountApprovedPkr <= 0) {
      setError('Loan amount must be greater than 0')
      return
    }
    try {
      setActionLoadingId(custodyTarget.assetId)
      setError('')
      await depositRequestService.confirmCustody(custodyTarget.assetId, custodyForm)
      setCustodyOpen(false)
      setCustodyTarget(null)
      await loadRequests(bankStatusFilter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm custody')
    } finally {
      setActionLoadingId(null)
    }
  }

  useEffect(() => {
    loadRequests('pending')
  }, [])

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((item) => {
      return (
        item.patientName.toLowerCase().includes(query) ||
        item.patientEmail.toLowerCase().includes(query) ||
        item.assetId.toLowerCase().includes(query) ||
        item.hospitalName.toLowerCase().includes(query)
      )
    })
  }, [rows, searchTerm])

  const pendingCount = rows.filter((r) => (r.bankApprovalStatus || '').toLowerCase() === 'pending').length
  const approvedCount = rows.filter((r) => (r.bankApprovalStatus || '').toLowerCase() === 'approved').length
  const rejectedCount = rows.filter((r) => (r.bankApprovalStatus || '').toLowerCase() === 'rejected').length

  const approve = async (row: AssetDepositItem) => {
    try {
      setActionLoadingId(row.assetId)
      setError('')
      await depositRequestService.approveByBank(row.assetId)
      await loadRequests(bankStatusFilter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request')
    } finally {
      setActionLoadingId(null)
    }
  }

  const reject = async () => {
    if (!rejectTarget) return
    if (!rejectReason.trim()) {
      setError('Rejection reason is required')
      return
    }

    try {
      setActionLoadingId(rejectTarget.assetId)
      setError('')
      await depositRequestService.rejectByBank(rejectTarget.assetId, rejectReason.trim())
      setRejectOpen(false)
      setRejectTarget(null)
      setRejectReason('')
      await loadRequests(bankStatusFilter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request')
    } finally {
      setActionLoadingId(null)
    }
  }

  const bankStatusBadge = (status?: string) => {
    const value = (status || '').toLowerCase()
    if (value === 'approved') return <Badge className="bg-emerald-600 hover:bg-emerald-600">Bank Approved</Badge>
    if (value === 'rejected') return <Badge className="bg-rose-600 hover:bg-rose-600">Bank Rejected</Badge>
    return <Badge variant="outline">Pending Bank Review</Badge>
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 pb-8 pt-2 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Bank Deposit Requests</h1>
        <p className="mt-1 text-sm text-slate-600">Review only hospital-approved requests forwarded to this bank.</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{pendingCount}</p></CardContent></Card>
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Approved</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-emerald-700">{approvedCount}</p></CardContent></Card>
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Rejected</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-rose-700">{rejectedCount}</p></CardContent></Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">Bank Queue</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" placeholder="Search patient, hospital, request" />
              </div>
              <Select
                value={bankStatusFilter}
                onValueChange={async (value) => {
                  setBankStatusFilter(value)
                  await loadRequests(value)
                }}
              >
                <SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Bank Review</SelectItem>
                  <SelectItem value="approved">Bank Approved</SelectItem>
                  <SelectItem value="rejected">Bank Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => loadRequests(bankStatusFilter)}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" />Loading requests...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Bank Status</TableHead>
                  <TableHead>Forwarded At</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-slate-500">No requests found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => {
                    const bankStatus = (row.bankApprovalStatus || '').toLowerCase()
                    const custodyStatus = (row.custodyStatus || '').toLowerCase()
                    const isPending = bankStatus === 'pending'
                    const isApprovedAwaitingCustody = bankStatus === 'approved' && custodyStatus !== 'confirmed'
                    const isRejected = bankStatus === 'rejected'
                    return (
                      <TableRow key={row.assetId}>
                        <TableCell className="font-mono text-xs">{row.assetId.slice(0, 8)}</TableCell>
                        <TableCell>
                          <p className="font-medium text-slate-900">{row.patientName}</p>
                          <p className="text-xs text-slate-500">{row.patientEmail}</p>
                        </TableCell>
                        <TableCell>{row.hospitalName}</TableCell>
                        <TableCell>{row.assetType}</TableCell>
                        <TableCell className="text-right">PKR {toNumber(row.assetValue).toLocaleString()}</TableCell>
                        <TableCell>{bankStatusBadge(row.bankApprovalStatus)}</TableCell>
                        <TableCell>{row.approvedAt ? new Date(row.approvedAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="text-right">
                          {isPending && (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={actionLoadingId === row.assetId} onClick={() => approve(row)}>
                                {actionLoadingId === row.assetId ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                                disabled={actionLoadingId === row.assetId}
                                onClick={() => {
                                  setRejectTarget(row)
                                  setRejectOpen(true)
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {isApprovedAwaitingCustody && (
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                className="bg-indigo-600 hover:bg-indigo-700"
                                disabled={actionLoadingId === row.assetId}
                                onClick={() => openCustodyDialog(row)}
                              >
                                {actionLoadingId === row.assetId ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <ShieldCheck className="h-4 w-4 mr-1" />
                                )}
                                Confirm Physical Deposit
                              </Button>
                            </div>
                          )}
                          {!isPending && !isApprovedAwaitingCustody && (
                            <span className="text-xs text-slate-500">
                              {isRejected
                                ? (row.bankRejectionReason || row.rejectionReason || 'Rejected by bank')
                                : 'Completed (custody confirmed)'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Bank Review Request</DialogTitle>
            <DialogDescription>
              Add a reason for bank rejection. This will be visible in the request history.
            </DialogDescription>
          </DialogHeader>
          <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={!rejectReason.trim() || (rejectTarget ? actionLoadingId === rejectTarget.assetId : false)} onClick={reject}>
              {rejectTarget && actionLoadingId === rejectTarget.assetId ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={custodyOpen} onOpenChange={setCustodyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Physical Deposit</DialogTitle>
            <DialogDescription>
              Verify the asset received from {custodyTarget?.patientName}. On submit, AT will be minted into the patient&apos;s Pool 1 (Available Pool).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Verified Purity (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={custodyForm.verifiedPurityPercent}
                  onChange={(e) => setCustodyForm({ ...custodyForm, verifiedPurityPercent: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Verified Weight (g)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={custodyForm.verifiedWeightGrams}
                  onChange={(e) => setCustodyForm({ ...custodyForm, verifiedWeightGrams: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Asset Condition</label>
                <Select
                  value={custodyForm.assetCondition}
                  onValueChange={(v) => setCustodyForm({ ...custodyForm, assetCondition: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXCELLENT">Excellent</SelectItem>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="ACCEPTABLE">Acceptable</SelectItem>
                    <SelectItem value="POOR">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Serial Number (optional)</label>
                <Input
                  value={custodyForm.serialNumber || ''}
                  onChange={(e) => setCustodyForm({ ...custodyForm, serialNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Loan Amount (PKR)</label>
                <Input
                  type="number"
                  value={custodyForm.loanAmountApprovedPkr}
                  onChange={(e) => setCustodyForm({ ...custodyForm, loanAmountApprovedPkr: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Interest Rate (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={custodyForm.loanInterestRatePercent}
                  onChange={(e) => setCustodyForm({ ...custodyForm, loanInterestRatePercent: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Notes (optional)</label>
              <Textarea
                value={custodyForm.verificationNotes || ''}
                onChange={(e) => setCustodyForm({ ...custodyForm, verificationNotes: e.target.value })}
                placeholder="Any verification notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustodyOpen(false)}>Cancel</Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={!!custodyTarget && actionLoadingId === custodyTarget.assetId}
              onClick={submitCustody}
            >
              {custodyTarget && actionLoadingId === custodyTarget.assetId ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4 mr-1" />
              )}
              Confirm & Mint AT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
