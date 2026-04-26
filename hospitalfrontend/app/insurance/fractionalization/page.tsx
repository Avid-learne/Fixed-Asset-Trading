'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalClose } from '@/components/ui/Modal'
import { fractionalizationService, FractionalizationRequestView } from '@/services/fractionalizationService'

export default function InsuranceFractionalizationPage() {
  const [requests, setRequests] = useState<FractionalizationRequestView[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<FractionalizationRequestView | null>(null)
  const [open, setOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  const [insurerName, setInsurerName] = useState('')
  const [nocNumber, setNocNumber] = useState('')
  const [nocIssuedAt, setNocIssuedAt] = useState('')
  const [nocExpiresAt, setNocExpiresAt] = useState('')
  const [nocDocument, setNocDocument] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setRequests(await fractionalizationService.pendingForInsurer())
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
    setInsurerName('')
    setNocNumber('')
    setNocIssuedAt('')
    setNocExpiresAt('')
    setNocDocument('')
    setRejectionReason('')
    setOpen(true)
  }

  const approve = async () => {
    if (!selected) return
    if (!insurerName || !nocNumber || !nocIssuedAt || !nocExpiresAt) {
      alert('Insurer, NOC number, issue and expiry are required')
      return
    }

    setProcessing(true)
    try {
      await fractionalizationService.approve(selected.requestId, {
        insurerName,
        nocNumber,
        nocIssuedAt: new Date(nocIssuedAt).toISOString(),
        nocExpiresAt: new Date(nocExpiresAt).toISOString(),
        nocDocument: nocDocument || undefined,
      })
      setOpen(false)
      setSelected(null)
      await load()
      alert('NOC issued and allocations activated')
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
        <h1 className="text-2xl font-bold">Insurance NOC Review</h1>
        <p className="text-muted-foreground">Issue NOCs after verifying beneficiaries and relationships.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending NOC Requests</CardTitle>
          <CardDescription>Requests forwarded by hospital admins.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-muted-foreground">No insurer-pending requests.</p>
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
            <ModalTitle>Issue NOC</ModalTitle>
          </ModalHeader>

          {selected && (
            <div className="space-y-4 p-4">
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

              <Input placeholder="Insurer name" value={insurerName} onChange={(e) => setInsurerName(e.target.value)} />
              <Input placeholder="NOC number" value={nocNumber} onChange={(e) => setNocNumber(e.target.value)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input type="datetime-local" value={nocIssuedAt} onChange={(e) => setNocIssuedAt(e.target.value)} />
                <Input type="datetime-local" value={nocExpiresAt} onChange={(e) => setNocExpiresAt(e.target.value)} />
              </div>
              <Input placeholder="NOC document link/ref (optional)" value={nocDocument} onChange={(e) => setNocDocument(e.target.value)} />
              <Input placeholder="Rejection reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />

              <div className="flex gap-2">
                <Button onClick={approve} disabled={processing}>{processing ? 'Processing...' : 'Issue NOC & Activate'}</Button>
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