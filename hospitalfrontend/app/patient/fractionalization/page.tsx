'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalClose } from '@/components/ui/Modal'
import { FileBadge2 } from 'lucide-react'
import { fractionalizationService, FractionalAllocationView, FractionalizationRequestView } from '@/services/fractionalizationService'
import { NocCertificate } from '@/components/shared/NocCertificate'

type BeneficiaryDraft = { beneficiaryUserId: string; fractionPercent: string }

export default function PatientFractionalizationPage() {
  const [source, setSource] = useState<'SUBSCRIPTION' | 'ASSET'>('SUBSCRIPTION')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryDraft[]>([{ beneficiaryUserId: '', fractionPercent: '' }])

  const [requests, setRequests] = useState<FractionalizationRequestView[]>([])
  const [allocations, setAllocations] = useState<FractionalAllocationView[]>([])
  const [beneficiaryAllocations, setBeneficiaryAllocations] = useState<FractionalAllocationView[]>([])
  const [redeemAmount, setRedeemAmount] = useState<Record<string, string>>({})

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // The NOC the patient is currently viewing (opened via "View NOC" button on an ACTIVE row).
  const [viewingNoc, setViewingNoc] = useState<FractionalizationRequestView | null>(null)

  const totalPercent = useMemo(
    () => beneficiaries.reduce((s, b) => s + (Number(b.fractionPercent) || 0), 0),
    [beneficiaries],
  )

  const load = async () => {
    setLoading(true)
    try {
      const [reqs, allocs] = await Promise.all([
        fractionalizationService.myRequests(),
        fractionalizationService.myPrimaryAllocations(),
      ])
      setRequests(reqs)
      setAllocations(allocs)
      setBeneficiaryAllocations(await fractionalizationService.myBeneficiaryAllocations())
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const updateBeneficiary = (idx: number, patch: Partial<BeneficiaryDraft>) => {
    const next = [...beneficiaries]
    next[idx] = { ...next[idx], ...patch }
    setBeneficiaries(next)
  }

  const addBeneficiary = () => setBeneficiaries((prev) => [...prev, { beneficiaryUserId: '', fractionPercent: '' }])

  const removeBeneficiary = (idx: number) => setBeneficiaries((prev) => prev.filter((_, i) => i !== idx))

  const submit = async () => {
    const parsedAmount = Number(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      alert('Enter a valid HT amount')
      return
    }

    const rows = beneficiaries
      .filter((b) => b.beneficiaryUserId.trim() && Number(b.fractionPercent) > 0)
      .map((b) => ({ beneficiaryUserId: b.beneficiaryUserId.trim(), fractionPercent: Number(b.fractionPercent) }))

    if (rows.length === 0) {
      alert('Add at least one valid beneficiary')
      return
    }

    if (rows.reduce((s, r) => s + r.fractionPercent, 0) > 100) {
      alert('Total beneficiary percent cannot exceed 100')
      return
    }

    setSubmitting(true)
    try {
      await fractionalizationService.submitRequest({
        source,
        fractionalizeHtAmount: parsedAmount,
        patientNote: note.trim() || undefined,
        beneficiaries: rows,
      })

      setAmount('')
      setNote('')
      setBeneficiaries([{ beneficiaryUserId: '', fractionPercent: '' }])
      await load()
      alert('Request submitted for hospital admin + insurance NOC review')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  const revoke = async (allocationId: string) => {
    if (!confirm('Revoke this allocation and return unspent HT to your wallet?')) return
    try {
      await fractionalizationService.revoke(allocationId, 'Requested by primary patient')
      await load()
      alert('Allocation revoked')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Revoke failed')
    }
  }

  const redeemOwn = async (allocationId: string) => {
    const amount = Number(redeemAmount[allocationId] || 0)
    if (!amount || amount <= 0) {
      alert('Enter valid redeem amount')
      return
    }

    try {
      await fractionalizationService.redeemFromOwnProfile(allocationId, amount, 'Beneficiary portal redemption')
      setRedeemAmount((prev) => ({ ...prev, [allocationId]: '' }))
      await load()
      alert('Redeemed successfully')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Redeem failed')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">HT Fractionalization</h1>
        <p className="text-muted-foreground">
          Split HT usage rights to beneficiaries. Activation requires hospital admin approval and insurer NOC.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Fractionalization Request</CardTitle>
          <CardDescription>
            Beneficiary percentages can be up to 100%. Any remainder stays with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Source</label>
              <select
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={source}
                onChange={(e) => setSource(e.target.value as 'SUBSCRIPTION' | 'ASSET')}
              >
                <option value="SUBSCRIPTION">Subscription Card HT</option>
                <option value="ASSET">Asset Health Card HT</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">HT to fractionalize</label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={0} />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Patient note (optional)</label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[90px]" />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Beneficiaries</p>
            {beneficiaries.map((b, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                <Input
                  className="md:col-span-7"
                  placeholder="Beneficiary user UUID"
                  value={b.beneficiaryUserId}
                  onChange={(e) => updateBeneficiary(idx, { beneficiaryUserId: e.target.value })}
                />
                <Input
                  className="md:col-span-3"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="%"
                  value={b.fractionPercent}
                  onChange={(e) => updateBeneficiary(idx, { fractionPercent: e.target.value })}
                />
                <Button className="md:col-span-2" variant="outline" onClick={() => removeBeneficiary(idx)}>
                  Remove
                </Button>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={addBeneficiary}>Add Beneficiary</Button>
              <p className="text-sm text-muted-foreground">Total beneficiary split: {totalPercent}%</p>
            </div>
          </div>

          <Button onClick={submit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit For NOC Approval'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-muted-foreground">No requests found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>HT</TableHead>
                  <TableHead>NOC</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.requestId}>
                    <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.source}</TableCell>
                    <TableCell>{r.fractionalizeHtAmount}</TableCell>
                    <TableCell className="font-mono text-xs">{r.nocNumber || '-'}</TableCell>
                    <TableCell>
                      {r.status === 'ACTIVE' && r.nocNumber && (
                        <Button size="sm" variant="outline" onClick={() => setViewingNoc(r)}>
                          <FileBadge2 className="h-3 w-3 mr-1" />
                          View NOC
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Allocations You Created</CardTitle>
        </CardHeader>
        <CardContent>
          {allocations.length === 0 ? (
            <p className="text-muted-foreground">No allocations.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beneficiary</TableHead>
                  <TableHead>Remaining HT</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>NOC Expiry</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((a) => (
                  <TableRow key={a.allocationId}>
                    <TableCell className="font-mono text-xs">{a.beneficiaryUserId.slice(0, 12)}...</TableCell>
                    <TableCell>{a.remainingHt}</TableCell>
                    <TableCell>{a.status}</TableCell>
                    <TableCell>{a.nocExpiresAt ? new Date(a.nocExpiresAt).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      {(a.status === 'ACTIVE' || a.status === 'FROZEN') && (
                        <Button size="sm" variant="outline" onClick={() => revoke(a.allocationId)}>
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allocations Assigned To You</CardTitle>
          <CardDescription>
            You can redeem independently from your own profile within your remaining share and active NOC period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {beneficiaryAllocations.length === 0 ? (
            <p className="text-muted-foreground">No beneficiary allocations.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Primary User</TableHead>
                  <TableHead>Remaining HT</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>NOC Expiry</TableHead>
                  <TableHead>Redeem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beneficiaryAllocations.map((a) => (
                  <TableRow key={a.allocationId}>
                    <TableCell className="font-mono text-xs">{a.primaryUserId.slice(0, 12)}...</TableCell>
                    <TableCell>{a.remainingHt}</TableCell>
                    <TableCell>{a.status}</TableCell>
                    <TableCell>{a.nocExpiresAt ? new Date(a.nocExpiresAt).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Input
                          value={redeemAmount[a.allocationId] || ''}
                          onChange={(e) => setRedeemAmount((prev) => ({ ...prev, [a.allocationId]: e.target.value }))}
                          type="number"
                          min={0}
                          className="h-8 w-28"
                        />
                        <Button
                          size="sm"
                          disabled={a.status !== 'ACTIVE'}
                          onClick={() => redeemOwn(a.allocationId)}
                        >
                          Redeem
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* NOC certificate viewer — opened from a "View NOC" button on an ACTIVE request row. */}
      <Modal open={!!viewingNoc} onOpenChange={(o) => !o && setViewingNoc(null)}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2 text-emerald-700">
              <FileBadge2 className="h-5 w-5" />
              Your NOC Certificate
            </ModalTitle>
          </ModalHeader>
          {viewingNoc && (
            <div className="p-4">
              <NocCertificate request={viewingNoc} />
            </div>
          )}
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline">Close</Button>
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
