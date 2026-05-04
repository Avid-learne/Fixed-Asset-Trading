'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalClose } from '@/components/ui/Modal'
import { ShieldCheck, FileBadge2 } from 'lucide-react'
import { fractionalizationService, FractionalizationRequestView } from '@/services/fractionalizationService'
import { NocCertificate } from '@/components/shared/NocCertificate'

export default function HospitalAdminFractionalizationPage() {
  const [requests, setRequests] = useState<FractionalizationRequestView[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<FractionalizationRequestView | null>(null)
  const [open, setOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // Post-approval certificate modal — shows the NOC the backend just generated.
  const [issuedNoc, setIssuedNoc] = useState<FractionalizationRequestView | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setRequests(await fractionalizationService.pendingForAdmin())
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openReview = (r: FractionalizationRequestView) => {
    setSelected(r)
    setRejectionReason('')
    setOpen(true)
  }

  const approveAndIssueNoc = async () => {
    if (!selected) return
    setProcessing(true)
    try {
      const issued = await fractionalizationService.adminApproveAndIssueNoc(selected.requestId)
      setOpen(false)
      setSelected(null)
      setIssuedNoc(issued)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Approve failed')
    } finally {
      setProcessing(false)
    }
  }

  const reject = async () => {
    if (!selected) return
    if (!rejectionReason.trim()) {
      alert('Rejection reason is required')
      return
    }
    setProcessing(true)
    try {
      await fractionalizationService.reject(selected.requestId, rejectionReason.trim())
      setOpen(false)
      setSelected(null)
      await load()
      alert('Request rejected')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Reject failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fractionalization Review</h1>
        <p className="text-muted-foreground">
          Hospital admin approves the request directly. The backend auto-issues the NOC certificate
          to the patient and to all beneficiaries — no separate insurer step.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            Review eligibility, then approve to issue the NOC. Approval immediately deducts the
            primary patient&apos;s HT and credits each beneficiary&apos;s allocation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-muted-foreground">No pending requests.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Primary User</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>HT</TableHead>
                  <TableHead>Beneficiaries</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.requestId}>
                    <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</TableCell>
                    <TableCell className="font-mono text-xs">{r.primaryUserId.slice(0, 12)}...</TableCell>
                    <TableCell>{r.source}</TableCell>
                    <TableCell>{r.fractionalizeHtAmount}</TableCell>
                    <TableCell>{r.beneficiaries.length}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => openReview(r)}>Review</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review + decide modal */}
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>Review Request</ModalTitle>
          </ModalHeader>

          {selected && (
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Request ID</p>
                  <p className="font-mono text-xs">{selected.requestId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Primary User</p>
                  <p className="font-mono text-xs">{selected.primaryUserId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="text-sm font-medium">{selected.source}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">HT to fractionalize</p>
                  <p className="text-sm font-medium">{selected.fractionalizeHtAmount} HT</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Beneficiaries</p>
                <div className="space-y-1 mt-1">
                  {selected.beneficiaries.map((b) => (
                    <div key={b.beneficiaryUserId} className="text-sm">
                      <span className="font-mono text-xs">{b.beneficiaryRegistrationId || '—'}</span>
                      {' — '}
                      {b.fractionPercent}% ({b.allocatedHt} HT)
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <p className="font-semibold">Approving will:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Deduct {selected.fractionalizeHtAmount} HT from the primary patient&apos;s {selected.source.toLowerCase()} pool.</li>
                  <li>Issue a NOC certificate (1-year validity) under &quot;Hospital Direct Authorization&quot;.</li>
                  <li>Credit each beneficiary with their fractional HT allocation.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">To reject instead, enter a reason:</p>
                <Input
                  placeholder="Rejection reason (required only if rejecting)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={approveAndIssueNoc}
                  disabled={processing}
                >
                  <ShieldCheck className="h-4 w-4 mr-1" />
                  {processing ? 'Issuing NOC...' : 'Approve & Issue NOC'}
                </Button>
                <Button variant="destructive" onClick={reject} disabled={processing}>
                  Reject
                </Button>
              </div>
            </div>
          )}

          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline" disabled={processing}>Close</Button>
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* NOC certificate — shown right after a successful approval */}
      <Modal open={!!issuedNoc} onOpenChange={(o) => !o && setIssuedNoc(null)}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2 text-emerald-700">
              <FileBadge2 className="h-5 w-5" />
              NOC Certificate Issued
            </ModalTitle>
          </ModalHeader>
          {issuedNoc && (
            <div className="p-4">
              <NocCertificate request={issuedNoc} />
            </div>
          )}
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline">Done</Button>
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

