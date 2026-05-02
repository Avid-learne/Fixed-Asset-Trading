'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, ArrowRight, Loader2, RefreshCw, CheckCircle2, Coins, Users, Building2, Landmark, History as HistoryIcon } from 'lucide-react'
import {
  profitAllocationService,
  type AllocationKpis,
  type ProfitableTrade,
  type TradeDistributionPreview,
  type ProfitAllocationHistoryItem,
} from '@/services/profitAllocationService'

const formatPKR = (v: number | undefined | null) =>
  `PKR ${(Number(v) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
const formatAT = (v: number | undefined | null) =>
  `${(Number(v) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT`
const formatHT = (v: number | undefined | null) =>
  `${(Number(v) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} HT`

export default function ProfitAllocationPage() {
  const [tab, setTab] = useState<'distribute' | 'history'>('distribute')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const [kpis, setKpis] = useState<AllocationKpis | null>(null)
  const [trades, setTrades] = useState<ProfitableTrade[]>([])
  const [history, setHistory] = useState<ProfitAllocationHistoryItem[]>([])

  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null)
  const [preview, setPreview] = useState<TradeDistributionPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [distributing, setDistributing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const loadAll = async () => {
    setError('')
    try {
      const [k, t, h] = await Promise.all([
        profitAllocationService.getKpis(),
        profitAllocationService.getProfitableTrades(),
        profitAllocationService.getHistory(),
      ])
      setKpis(k)
      setTrades(t)
      setHistory(h)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load allocation data')
    }
  }

  useEffect(() => {
    setLoading(true)
    loadAll().finally(() => setLoading(false))
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAll()
    if (selectedTradeId) {
      try {
        const p = await profitAllocationService.getTradePreview(selectedTradeId)
        setPreview(p)
      } catch {
        // ignore — refresh shouldn't surface preview errors
      }
    }
    setRefreshing(false)
  }

  const handleSelectTrade = async (tradeId: string) => {
    setSelectedTradeId(tradeId)
    setPreviewLoading(true)
    setError('')
    try {
      const p = await profitAllocationService.getTradePreview(tradeId)
      setPreview(p)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trade preview')
      setPreview(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleDistribute = async () => {
    if (!selectedTradeId) return
    setDistributing(true)
    setError('')
    try {
      await profitAllocationService.distributeTrade(selectedTradeId)
      setShowConfirmation(false)
      setShowSuccess(true)
      await loadAll()
      // Refresh the preview so the badge flips to "Distributed".
      const p = await profitAllocationService.getTradePreview(selectedTradeId)
      setPreview(p)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Distribution failed')
    } finally {
      setDistributing(false)
    }
  }

  const undistributed = useMemo(() => trades.filter((t) => !t.distributed), [trades])

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading profit allocation data...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-8 pt-2 lg:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Profit Allocation</h1>
          <p className="mt-1 text-sm text-slate-600">
            Distribute each profitable trade to its actual participants. Hospital and Bank shares are credited as AT
            (no burn). Patient shares burn AT and mint equivalent HT to patient wallets.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Available Profit</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-slate-900">{formatPKR(kpis?.availableProfitPkr)}</p>
            <p className="mt-1 text-xs text-slate-500">{formatAT(kpis?.availableProfitAt)} · {kpis?.undistributedTradesCount ?? 0} pending {kpis?.undistributedTradesCount === 1 ? 'trade' : 'trades'}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-blue-200 bg-blue-50">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-blue-700">Hospital Profit AT</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-blue-800">{formatAT(kpis?.hospitalProfitAt)}</p>
            <p className="mt-1 text-xs text-blue-700">{formatPKR(kpis?.hospitalProfitPkr)} · cumulative</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-amber-200 bg-amber-50">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-amber-700">Bank Profit AT</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-amber-800">{formatAT(kpis?.bankProfitAt)}</p>
            <p className="mt-1 text-xs text-amber-700">{formatPKR(kpis?.bankProfitPkr)} · cumulative</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-emerald-700">Patient HT Minted</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-emerald-800">{formatHT(kpis?.totalHtMintedToPatients)}</p>
            <p className="mt-1 text-xs text-emerald-700">{kpis?.distributionsCount ?? 0} distribution{kpis?.distributionsCount === 1 ? '' : 's'} done</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'distribute' | 'history')}>
        <TabsList>
          <TabsTrigger value="distribute">Distribute</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="distribute" className="space-y-6 pt-4">
          {/* Profitable trades table */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Profitable Trades</CardTitle>
              <p className="text-sm text-slate-500">
                {undistributed.length} pending distribution · {trades.length - undistributed.length} already distributed
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trade</TableHead>
                    <TableHead>Asset Type</TableHead>
                    <TableHead className="text-right">Profit (AT)</TableHead>
                    <TableHead className="text-right">Profit (PKR)</TableHead>
                    <TableHead>Closed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((t) => (
                    <TableRow
                      key={t.tradeId}
                      className={selectedTradeId === t.tradeId ? 'bg-emerald-50' : ''}
                    >
                      <TableCell>
                        <p className="font-medium text-slate-900">{t.tradeName || 'Untitled trade'}</p>
                        <p className="text-xs font-mono text-slate-500">#{t.tradeId.slice(0, 8)}</p>
                      </TableCell>
                      <TableCell className="text-slate-700">{t.assetType || '—'}</TableCell>
                      <TableCell className="text-right font-semibold text-emerald-700">{formatAT(t.profitAt)}</TableCell>
                      <TableCell className="text-right text-slate-700">{formatPKR(t.profitPkr)}</TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {t.closedAt ? new Date(t.closedAt).toLocaleString() : '—'}
                      </TableCell>
                      <TableCell>
                        {t.distributed ? (
                          <Badge className="bg-slate-700 hover:bg-slate-700">Distributed</Badge>
                        ) : (
                          <Badge className="bg-emerald-600 hover:bg-emerald-600">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={selectedTradeId === t.tradeId ? 'default' : 'outline'}
                          onClick={() => handleSelectTrade(t.tradeId)}
                        >
                          {selectedTradeId === t.tradeId ? 'Selected' : 'Select'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {trades.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                        No profitable trades yet. Close a trade with positive P/L to enable distribution.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Per-trade distribution preview */}
          {selectedTradeId && (
            <Card className="shadow-sm border-emerald-200">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">
                      Distribution Preview {preview?.tradeName ? `— ${preview.tradeName}` : ''}
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      Patients are split proportionally to their pre-trade allocation. Hospital and Bank get fixed
                      pool percentages from hospital settings.
                    </p>
                  </div>
                  {preview?.alreadyDistributed && (
                    <Badge className="bg-slate-700 hover:bg-slate-700">Already Distributed</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {previewLoading || !preview ? (
                  <div className="py-12 flex items-center justify-center text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading preview...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Total to distribute */}
                    <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-end justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-emerald-700">Total to Distribute</p>
                          <p className="text-3xl font-bold text-emerald-700">{formatAT(preview.totalProfitAt)}</p>
                          <p className="text-sm text-emerald-700">{formatPKR(preview.totalProfitPkr)}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="rounded-md bg-emerald-100 px-3 py-2">
                            <p className="text-emerald-700">Patients ({Number(preview.patientSharePercent).toFixed(0)}%)</p>
                            <p className="font-semibold text-emerald-900">{formatAT(preview.patientPoolAt)}</p>
                          </div>
                          <div className="rounded-md bg-blue-100 px-3 py-2">
                            <p className="text-blue-700">Hospital ({Number(preview.hospitalSharePercent).toFixed(0)}%)</p>
                            <p className="font-semibold text-blue-900">{formatAT(preview.hospitalPoolAt)}</p>
                          </div>
                          <div className="rounded-md bg-amber-100 px-3 py-2">
                            <p className="text-amber-700">Bank ({Number(preview.bankSharePercent).toFixed(0)}%)</p>
                            <p className="font-semibold text-amber-900">{formatAT(preview.bankPoolAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recipients table — patient rows + hospital + bank */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Share %</TableHead>
                          <TableHead className="text-right">AT Amount</TableHead>
                          <TableHead className="text-right">PKR Equivalent</TableHead>
                          <TableHead className="text-right">Outcome</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.rows.map((r, idx) => {
                          const isPatient = r.kind === 'PATIENT'
                          const isHospital = r.kind === 'HOSPITAL'
                          return (
                            <TableRow
                              key={`${r.kind}-${r.patientId ?? idx}`}
                              className={
                                isHospital
                                  ? 'bg-blue-50/50'
                                  : r.kind === 'BANK'
                                  ? 'bg-amber-50/50'
                                  : ''
                              }
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {isPatient && <Users className="h-4 w-4 text-emerald-600" />}
                                  {isHospital && <Building2 className="h-4 w-4 text-blue-600" />}
                                  {r.kind === 'BANK' && <Landmark className="h-4 w-4 text-amber-600" />}
                                  <div>
                                    <p className="font-medium text-slate-900">{r.name || '—'}</p>
                                    {isPatient && r.patientId && (
                                      <p className="text-xs font-mono text-slate-500">#{r.patientId.slice(0, 8)}</p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    isPatient
                                      ? 'border-emerald-300 text-emerald-700'
                                      : isHospital
                                      ? 'border-blue-300 text-blue-700'
                                      : 'border-amber-300 text-amber-700'
                                  }
                                >
                                  {r.kind}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-slate-700">
                                {Number(r.sharePercent).toFixed(2)}%
                              </TableCell>
                              <TableCell className="text-right font-semibold text-slate-900">
                                {formatAT(r.atAmount)}
                              </TableCell>
                              <TableCell className="text-right text-slate-700">{formatPKR(r.pkrAmount)}</TableCell>
                              <TableCell className="text-right text-xs text-slate-600">
                                {isPatient
                                  ? `Burns AT → mints ${formatHT(r.htAmount)}`
                                  : 'Credited as AT (no burn)'}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>

                    {/* Distribute action */}
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <div className="text-xs text-slate-500">
                        AT price: {formatPKR(preview.atPrice)} · HT price: {formatPKR(preview.htConversionRate)}
                      </div>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => setShowConfirmation(true)}
                        disabled={preview.alreadyDistributed || distributing}
                      >
                        {preview.alreadyDistributed ? 'Already Distributed' : 'Distribute This Trade'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Distribution History</CardTitle>
              <p className="text-sm text-slate-500">All past profit distributions for this hospital, newest first.</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Trade</TableHead>
                    <TableHead className="text-right">Total Profit</TableHead>
                    <TableHead className="text-right">Patient HT</TableHead>
                    <TableHead className="text-right">Hospital AT</TableHead>
                    <TableHead className="text-right">Bank AT</TableHead>
                    <TableHead className="text-right">Recipients</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.distributionId}>
                      <TableCell>
                        <p className="text-xs text-slate-600">{new Date(h.timestamp).toLocaleString()}</p>
                        <p className="text-xs font-mono text-slate-400">#{h.distributionId.slice(0, 8)}</p>
                      </TableCell>
                      <TableCell>
                        {h.tradeName ? (
                          <>
                            <p className="font-medium text-slate-900">{h.tradeName}</p>
                            {h.tradeId && (
                              <p className="text-xs font-mono text-slate-500">#{h.tradeId.slice(0, 8)}</p>
                            )}
                          </>
                        ) : (
                          <span className="text-xs italic text-slate-500">Legacy lump-sum</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-slate-700">{formatPKR(h.totalProfit)}</TableCell>
                      <TableCell className="text-right font-semibold text-emerald-700">
                        {formatHT(h.totalHtDistributed)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-blue-700">
                        {h.hospitalAtCredited !== undefined ? formatAT(h.hospitalAtCredited) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-amber-700">
                        {h.bankAtCredited !== undefined ? formatAT(h.bankAtCredited) : '—'}
                      </TableCell>
                      <TableCell className="text-right text-slate-700">{h.recipients}</TableCell>
                    </TableRow>
                  ))}
                  {history.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                        <HistoryIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        No allocation history yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirm Distribution dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Distribution</DialogTitle>
            <DialogDescription>
              This action mints HT to patient wallets and credits the hospital and bank balances. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="space-y-3 py-2">
              <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs uppercase tracking-wide text-emerald-700">Trade</p>
                <p className="text-lg font-semibold text-emerald-900">{preview.tradeName}</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">{formatAT(preview.totalProfitAt)}</p>
                <p className="text-xs text-emerald-700">{formatPKR(preview.totalProfitPkr)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3">
                  <p className="text-xs text-emerald-700">Patients</p>
                  <p className="font-semibold text-emerald-900">{formatAT(preview.patientPoolAt)}</p>
                  <p className="text-xs text-emerald-600">→ HT minted</p>
                </div>
                <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                  <p className="text-xs text-blue-700">Hospital</p>
                  <p className="font-semibold text-blue-900">{formatAT(preview.hospitalPoolAt)}</p>
                  <p className="text-xs text-blue-600">AT credited</p>
                </div>
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                  <p className="text-xs text-amber-700">Bank</p>
                  <p className="font-semibold text-amber-900">{formatAT(preview.bankPoolAt)}</p>
                  <p className="text-xs text-amber-600">AT credited</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  Patient AT will be burned and equivalent HT minted to their wallet. Hospital and Bank shares are
                  credited as AT — no burn. Re-distribution of this trade is blocked.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={distributing}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleDistribute}
              disabled={distributing}
            >
              {distributing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Distributing...
                </>
              ) : (
                <>
                  Confirm & Distribute
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              Distribution Complete
            </DialogTitle>
            <DialogDescription>
              HT minted to patients, AT credited to hospital and bank.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowSuccess(false)}>
              <Coins className="w-4 h-4 mr-2" /> OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
