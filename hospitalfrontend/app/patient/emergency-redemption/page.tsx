'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { walletService } from '@/services/walletService'
import {
  emergencyRedemptionService,
  EmergencyRedemptionDto,
} from '@/services/emergencyRedemptionService'

export default function EmergencyRedemptionPage() {
  const { user } = useAuth()
  const userId = user?.id || (user as any)?.userId

  const [walletAt, setWalletAt] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [requestedAtAmount, setRequestedAtAmount] = useState('')
  const [patientReason, setPatientReason] = useState('')
  const [supportingDocuments, setSupportingDocuments] = useState('')
  const [ack, setAck] = useState(false)

  const [requests, setRequests] = useState<EmergencyRedemptionDto[]>([])

  const canSubmit = useMemo(() => {
    const amt = Number(requestedAtAmount)
    return userId && ack && amt > 0
  }, [userId, ack, requestedAtAmount])

  const load = async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const [summary, list] = await Promise.all([
        walletService.getSummary(String(userId)),
        emergencyRedemptionService.listForPatient(String(userId)),
      ])
      setWalletAt(summary.totalAt)
      setRequests(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const onSubmit = async () => {
    if (!userId) return
    const amt = Number(requestedAtAmount)
    if (!amt || amt <= 0) {
      alert('Enter a valid AT amount')
      return
    }
    if (!ack) {
      alert('Please acknowledge the trade-off')
      return
    }

    setSubmitting(true)
    try {
      await emergencyRedemptionService.submit({
        requestedAtAmount: amt,
        patientReason: patientReason.trim() || undefined,
        supportingDocuments: supportingDocuments.trim() || undefined,
        tradeoffAcknowledged: true,
      })
      setRequestedAtAmount('')
      setPatientReason('')
      setSupportingDocuments('')
      setAck(false)
      await load()
      alert('Request submitted')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!userId) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Emergency AT→HT Conversion</CardTitle>
            <CardDescription>Please log in to submit a request.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Emergency AT→HT Conversion</h1>
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
          <CardTitle>Submit Request</CardTitle>
          <CardDescription>
            Available AT (wallet): <span className="font-semibold">{walletAt}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">AT to convert (requested)</label>
              <Input
                value={requestedAtAmount}
                onChange={(e) => setRequestedAtAmount(e.target.value)}
                placeholder="e.g. 50"
                type="number"
                min={0}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Supporting documents (optional)</label>
              <Input
                value={supportingDocuments}
                onChange={(e) => setSupportingDocuments(e.target.value)}
                placeholder="Notes / links"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Reason / medical need</label>
            <Textarea
              value={patientReason}
              onChange={(e) => setPatientReason(e.target.value)}
              placeholder="Explain the urgency and what you need right now"
              className="min-h-[120px]"
            />
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              className="mt-1"
            />
            <span className="text-muted-foreground">
              I understand converting AT before trading begins reduces my participation in the trading cycle and future profit/share benefits.
            </span>
          </label>

          <Button onClick={onSubmit} disabled={!canSubmit || submitting}>
            {submitting ? 'Submitting...' : 'Submit Emergency Request'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>Track approval and issued HT.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-muted-foreground">No requests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested AT</TableHead>
                  <TableHead>Approved AT</TableHead>
                  <TableHead>HT Issued</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.requestId}>
                    <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.requestedAtAmount}</TableCell>
                    <TableCell>{r.approvedAtAmount ?? '-'}</TableCell>
                    <TableCell>{r.htIssued ?? '-'}</TableCell>
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
