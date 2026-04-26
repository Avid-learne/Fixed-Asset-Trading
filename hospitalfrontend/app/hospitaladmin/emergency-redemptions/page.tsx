'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose } from '@/components/ui/Modal'
import {
  emergencyRedemptionService,
  EmergencyRedemptionDto,
  EmergencyUrgencyLevel,
} from '@/services/emergencyRedemptionService'

export default function HospitalEmergencyRedemptionsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requests, setRequests] = useState<EmergencyRedemptionDto[]>([])

  const [selected, setSelected] = useState<EmergencyRedemptionDto | null>(null)
  const [open, setOpen] = useState(false)

  const [urgency, setUrgency] = useState<EmergencyUrgencyLevel>('ROUTINE')
  const [atToConvert, setAtToConvert] = useState('')
  const [conversionRate, setConversionRate] = useState('1')
  const [staffJustification, setStaffJustification] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const [processing, setProcessing] = useState(false)

  const canApprove = useMemo(() => {
    const at = Number(atToConvert)
    const rate = Number(conversionRate)
    return selected && at > 0 && rate > 0
  }, [selected, atToConvert, conversionRate])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const pending = await emergencyRedemptionService.listPendingForHospital()
      setRequests(pending)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openRequest = (r: EmergencyRedemptionDto) => {
    setSelected(r)
    setUrgency('ROUTINE')
    setAtToConvert(String(r.requestedAtAmount || ''))
    setConversionRate('1')
    setStaffJustification('')
    setRejectionReason('')
    setOpen(true)
  }

  const approve = async () => {
    if (!selected) return
    const at = Number(atToConvert)
    const rate = Number(conversionRate)

    setProcessing(true)
    try {
      await emergencyRedemptionService.approve(selected.requestId, {
        urgencyLevel: urgency,
        atToConvert: at,
        conversionRate: rate,
        staffJustification: staffJustification.trim() || undefined,
      })
      setOpen(false)
      setSelected(null)
      await load()
      alert('Approved and converted')
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
      await emergencyRedemptionService.reject(selected.requestId, {
        rejectionReason: rejectionReason.trim(),
      })
      setOpen(false)
      setSelected(null)
      await load()
      alert('Rejected')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Reject failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Emergency AT→HT Requests</h1>
        <p className="text-muted-foreground">Review and execute emergency conversions.</p>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>Staff approval is required before AT can be converted to HT.</CardDescription>
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
                  <TableHead>Patient</TableHead>
                  <TableHead>Requested AT</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.requestId}>
                    <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</TableCell>
                    <TableCell className="font-mono text-xs">{r.patientId.slice(0, 12)}...</TableCell>
                    <TableCell>{r.requestedAtAmount}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => openRequest(r)}>
                        Review
                      </Button>
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
            <ModalTitle>Review Emergency Request</ModalTitle>
          </ModalHeader>

          {selected && (
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-mono text-xs">{selected.patientId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Requested AT</p>
                  <p className="font-semibold">{selected.requestedAtAmount}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Patient reason</p>
                <p className="text-sm whitespace-pre-wrap">{selected.patientReason || '-'}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Supporting documents</p>
                <p className="text-sm whitespace-pre-wrap">{selected.supportingDocuments || '-'}</p>
              </div>

              <Card className="bg-muted/40">
                <CardHeader>
                  <CardTitle className="text-base">Decision</CardTitle>
                  <CardDescription>
                    Approving will deduct AT (reducing trading participation) and credit HT immediately.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Urgency</label>
                      <select
                        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value as EmergencyUrgencyLevel)}
                      >
                        <option value="ROUTINE">Routine</option>
                        <option value="MODERATE">Moderate</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">AT to convert</label>
                      <Input
                        value={atToConvert}
                        onChange={(e) => setAtToConvert(e.target.value)}
                        type="number"
                        min={0}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">Rate (HT per AT)</label>
                      <Input
                        value={conversionRate}
                        onChange={(e) => setConversionRate(e.target.value)}
                        type="number"
                        min={0}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Staff justification (optional)</label>
                    <Textarea
                      value={staffJustification}
                      onChange={(e) => setStaffJustification(e.target.value)}
                      className="mt-1 min-h-[90px]"
                      placeholder="Clinical/admin justification and notes"
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    HT to issue (preview):{' '}
                    <span className="font-semibold">
                      {(Number(atToConvert) || 0) * (Number(conversionRate) || 0)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={approve} disabled={!canApprove || processing}>
                      {processing ? 'Processing...' : 'Approve & Convert'}
                    </Button>
                    <div className="flex-1" />
                    <Button variant="destructive" onClick={reject} disabled={processing}>
                      Reject
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Rejection reason (required to reject)</label>
                    <Input
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mt-1"
                      placeholder="Why is this being rejected?"
                    />
                  </div>
                </CardContent>
              </Card>
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
