'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { walletService } from '@/services/walletService'
import { marketplaceService, type PatientAssetToken } from '@/services/marketplaceService'
import {
  emergencyRedemptionService,
  EmergencyRedemptionDto,
} from '@/services/emergencyRedemptionService'

export default function EmergencyRedemptionPage() {
  const { user } = useAuth()
  const userId = user?.id || (user as any)?.userId
  const patientId = (user as any)?.patientId

  const [walletAt, setWalletAt] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [allAssets, setAllAssets] = useState<PatientAssetToken[]>([])
  const [selectedAssetId, setSelectedAssetId] = useState<string>('')
  const [requestedAtAmount, setRequestedAtAmount] = useState('')
  const [patientReason, setPatientReason] = useState('')
  const [supportingDocuments, setSupportingDocuments] = useState('')
  const [ack, setAck] = useState(false)

  const [requests, setRequests] = useState<EmergencyRedemptionDto[]>([])

  const pool1Assets = useMemo(
    () => allAssets.filter((a) => String(a.availabilityStatus) === 'WITH_PATIENT'),
    [allAssets],
  )
  const selectedAsset = useMemo(
    () => allAssets.find((a) => String(a.assetId) === selectedAssetId) || null,
    [allAssets, selectedAssetId],
  )
  const selectedAssetMaxAt = Number(selectedAsset?.availableAt || 0)

  const canSubmit = useMemo(() => {
    const amt = Number(requestedAtAmount)
    return (
      userId &&
      ack &&
      amt > 0 &&
      !!selectedAssetId &&
      amt <= selectedAssetMaxAt
    )
  }, [userId, ack, requestedAtAmount, selectedAssetId, selectedAssetMaxAt])

  const load = async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const [summary, list, tokens] = await Promise.all([
        walletService.getSummary(String(userId)),
        emergencyRedemptionService.listForPatient(String(userId)),
        patientId
          ? marketplaceService.getPatientAssetTokens(String(patientId))
          : Promise.resolve<PatientAssetToken[]>([]),
      ])
      setWalletAt(summary.totalAt)
      setRequests(list)
      // Show every asset that has been minted (excludes pre-mint placeholder rows)
      const minted = (tokens || []).filter(
        (t) => String(t.availabilityStatus) !== 'PENDING_BANK_APPROVAL',
      )
      setAllAssets(minted)
      // Reset selection if currently-selected asset is no longer in Pool 1
      const stillRedeemable = minted.some(
        (a) =>
          String(a.assetId) === selectedAssetId &&
          String(a.availabilityStatus) === 'WITH_PATIENT' &&
          Number(a.availableAt || 0) > 0,
      )
      if (selectedAssetId && !stillRedeemable) {
        setSelectedAssetId('')
      }
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

    if (!selectedAssetId) {
      alert('Please select a Pool 1 asset to redeem against')
      return
    }
    if (amt > selectedAssetMaxAt) {
      alert(`Selected asset has only ${selectedAssetMaxAt} AT remaining in Pool 1`)
      return
    }

    setSubmitting(true)
    try {
      await emergencyRedemptionService.submit({
        assetId: selectedAssetId,
        requestedAtAmount: amt,
        patientReason: patientReason.trim() || undefined,
        supportingDocuments: supportingDocuments.trim() || undefined,
        tradeoffAcknowledged: true,
      })
      setSelectedAssetId('')
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
            Wallet AT: <span className="font-semibold">{walletAt}</span> · Pool 1 assets available:{' '}
            <span className="font-semibold">{pool1Assets.length}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Asset picker — Pool 1 selectable, Pool 2 / In-Trade shown in red and disabled */}
          <div>
            <label className="text-sm text-muted-foreground">Select an asset to redeem against</label>
            {allAssets.length === 0 ? (
              <div className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                You don&apos;t have any minted AT yet. Once the bank confirms custody on a deposit, AT will appear here.
              </div>
            ) : (
              <div className="mt-1 space-y-2">
                {allAssets.map((a) => {
                  const id = String(a.assetId)
                  const status = String(a.availabilityStatus)
                  const remaining = Number(a.availableAt || 0)
                  const total = Number(a.totalAtAssigned || 0)
                  const inTradeAmount = Number(a.unavailableAt || 0)
                  const isPool1 = status === 'WITH_PATIENT' && remaining > 0
                  const isInTrade = status === 'UNAVAILABLE'
                  const isPool2Idle = status === 'AVAILABLE'
                  const isSelected = selectedAssetId === id

                  let statusBadge: React.ReactNode = null
                  let cardClass = 'border-slate-200 hover:bg-slate-50'
                  let amountClass = 'text-amber-700'
                  let amountLabel = 'remaining in Pool 1'

                  if (isPool1) {
                    if (isSelected) cardClass = 'border-amber-500 bg-amber-50 ring-1 ring-amber-400'
                    statusBadge = (
                      <span className="ml-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        Pool 1 — Redeemable
                      </span>
                    )
                  } else if (isPool2Idle) {
                    cardClass = 'border-rose-300 bg-rose-50 cursor-not-allowed opacity-90'
                    amountClass = 'text-rose-700'
                    amountLabel = 'in Trading Pool — locked'
                    statusBadge = (
                      <span className="ml-2 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
                        Pool 2 — Locked
                      </span>
                    )
                  } else if (isInTrade) {
                    cardClass = 'border-rose-400 bg-rose-50 cursor-not-allowed opacity-90'
                    amountClass = 'text-rose-700'
                    amountLabel = `${inTradeAmount.toLocaleString()} AT in active trade`
                    statusBadge = (
                      <span className="ml-2 inline-flex rounded-full bg-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-900">
                        In Trade — Locked
                      </span>
                    )
                  } else {
                    cardClass = 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-70'
                    amountClass = 'text-slate-600'
                    amountLabel = 'not available'
                  }

                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={!isPool1}
                      onClick={() => isPool1 && setSelectedAssetId(id)}
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${cardClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {a.assetType || 'Asset'}{' '}
                            <span className="font-mono text-xs text-slate-500">#{id.slice(0, 8)}</span>
                            {statusBadge}
                          </p>
                          <p className="text-xs text-slate-500">
                            Asset value: PKR {Number(a.assetValue || 0).toLocaleString()}
                            {a.weight ? ` · ${a.weight} g` : ''}
                            {!isPool1 && ` · Total minted: ${total.toLocaleString()} AT`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${amountClass}`}>
                            {(isPool1 ? remaining : isInTrade ? inTradeAmount : total).toLocaleString()} AT
                          </p>
                          <p className={`text-xs ${amountClass}`}>{amountLabel}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            {pool1Assets.length === 0 && allAssets.length > 0 && (
              <p className="mt-2 text-xs text-rose-700">
                None of your assets are in Pool 1 right now — they&apos;re all locked in the Trading Pool. AT becomes
                redeemable again after the trade cycle ends.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">
                AT to convert (requested){selectedAsset ? ` · max ${selectedAssetMaxAt}` : ''}
              </label>
              <Input
                value={requestedAtAmount}
                onChange={(e) => setRequestedAtAmount(e.target.value)}
                placeholder="e.g. 50"
                type="number"
                min={0}
                max={selectedAssetMaxAt || undefined}
                disabled={!selectedAssetId}
              />
              {selectedAsset && Number(requestedAtAmount) > selectedAssetMaxAt && (
                <p className="mt-1 text-xs text-rose-600">
                  Exceeds the {selectedAssetMaxAt} AT remaining on the selected asset.
                </p>
              )}
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
