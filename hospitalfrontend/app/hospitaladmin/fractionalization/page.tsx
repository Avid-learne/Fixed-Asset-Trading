'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalClose } from '@/components/ui/Modal'
import { fractionalizationService, FractionalizationRequestView } from '@/services/fractionalizationService'

export default function HospitalAdminFractionalizationPage() {
  const [requests, setRequests] = useState<FractionalizationRequestView[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<FractionalizationRequestView | null>(null)
  const [open, setOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

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

  const forward = async () => {
    if (!selected) return
    setProcessing(true)
    try {
      await fractionalizationService.forwardToInsurer(selected.requestId)
      setOpen(false)
      setSelected(null)
      await load()
      alert('Request forwarded to insurer')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Forward failed')
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
        <p className="text-muted-foreground">Hospital admin review + insurance NOC activation.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>Review eligibility, then forward the request to the insurance company for NOC issuance.</CardDescription>
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
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Beneficiaries</p>
                <div className="space-y-1 mt-1">
                  {selected.beneficiaries.map((b) => (
                    <div key={b.beneficiaryUserId} className="text-sm">
                      {b.beneficiaryUserId} - {b.fractionPercent}% ({b.allocatedHt} HT)
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Input placeholder="Rejection reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
              </div>

              <div className="flex gap-2">
                <Button onClick={forward} disabled={processing}>{processing ? 'Processing...' : 'Forward to Insurer'}</Button>
                <Button variant="destructive" onClick={reject} disabled={processing}>Reject</Button>
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
    </div>
  )
}
