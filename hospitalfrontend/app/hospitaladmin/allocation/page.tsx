'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, History, AlertCircle, ArrowRight, Loader2, RefreshCw, Coins, CheckCircle2 } from 'lucide-react'
import { profitAllocationService, ProfitAllocationHistoryItem, ProfitAllocationPreview } from '@/services/profitAllocationService'
import { marketplaceService, MarketplaceTrade } from '@/services/marketplaceService'
import { authService } from '@/lib/authService'

export default function ProfitAllocationPage() {
  const [profit, setProfit] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [allocating, setAllocating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successDetails, setSuccessDetails] = useState<{
    recipients: number
    totalHt: number
    profit: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<ProfitAllocationPreview | null>(null)
  const [totals, setTotals] = useState<ProfitAllocationPreview | null>(null)
  const [history, setHistory] = useState<ProfitAllocationHistoryItem[]>([])
  const [closedTrades, setClosedTrades] = useState<MarketplaceTrade[]>([])
  const [selectedTradeId, setSelectedTradeId] = useState<string>('')
  const [showAllHistory, setShowAllHistory] = useState(false)

  // Hospital-wide totals (used in the top stat cards)
  const availableProfit = totals?.availableProfit ?? 0
  const totalHT = totals?.totalHtToDistribute ?? 0
  const recipients = totals?.totalRecipients ?? 0
  const patientSharePct = totals?.patientSharePercent ?? 40
  const hospitalSharePct = totals?.hospitalSharePercent ?? 50
  const bankSharePct = totals?.bankSharePercent ?? 10
  const patientAmountPkr = totals?.patientAmountPkr ?? 0
  const hospitalAmountPkr = totals?.hospitalAmountPkr ?? 0
  const bankAmountPkr = totals?.bankAmountPkr ?? 0

  // Selected-trade values (used in Mint Controls widgets and Patient Distribution table)
  const tradeTokenMintPool = preview?.tokenMintPoolPkr ?? 0
  const tradeTotalHT = preview?.totalHtToDistribute ?? 0
  const tradeRecipients = preview?.totalRecipients ?? 0

  const loadHistory = async () => {
    const items = await profitAllocationService.getHistory()
    setHistory(items)
    return items
  }

  const loadTotals = async () => {
    try {
      const data = await profitAllocationService.getPreview(null, null)
      setTotals(data)
    } catch {
      setTotals(null)
    }
  }

  const loadPreview = async (
    profitValue: number | null,
    tradeId: string | null,
    init = false,
  ) => {
    if (!tradeId) {
      setPreview(null)
      if (init) {
        setProfit(0)
      }
      return
    }
    const data = await profitAllocationService.getPreview(profitValue, tradeId)
    setPreview(data)
    if (init) {
      setProfit(Math.round(data.totalProfit))
    }
  }

  const loadClosedTrades = async (
    historyItems: ProfitAllocationHistoryItem[],
  ): Promise<MarketplaceTrade[]> => {
    const hospitalId = authService.getUser()?.hospitalId || ''
    if (!hospitalId) {
      return []
    }
    const distributedTradeIds = new Set(
      historyItems
        .map((h) => h.tradeId)
        .filter((id): id is string => Boolean(id))
        .map((id) => id.toLowerCase()),
    )
    const trades = await marketplaceService.getHospitalTrades(hospitalId)
    const eligible = trades.filter(
      (t) => t.status === 'CLOSED' && t.profitLoss > 0 && !distributedTradeIds.has(t.id.toLowerCase()),
    )
    setClosedTrades(eligible)
    return eligible
  }

  const initialize = async () => {
    setLoading(true)
    setError('')
    try {
      const historyItems = await loadHistory()
      const [eligible] = await Promise.all([
        loadClosedTrades(historyItems),
        loadTotals(),
      ])
      const firstTradeId = eligible[0]?.id || ''
      setSelectedTradeId(firstTradeId)
      await loadPreview(null, firstTradeId || null, true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load allocation data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initialize()
  }, [])

  const handleTradeChange = async (tradeId: string) => {
    setSelectedTradeId(tradeId)
    setError('')
    if (!tradeId) {
      setPreview(null)
      setProfit(0)
      return
    }
    try {
      setRefreshing(true)
      const selected = closedTrades.find((t) => t.id === tradeId)
      const initialProfit = selected ? Math.round(selected.profitLoss) : 0
      setProfit(initialProfit)
      await loadPreview(initialProfit > 0 ? initialProfit : null, tradeId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trade preview')
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      setError('')
      const historyItems = await loadHistory()
      const [eligible] = await Promise.all([
        loadClosedTrades(historyItems),
        loadTotals(),
      ])
      const stillEligible = eligible.some((t) => t.id === selectedTradeId)
        ? selectedTradeId
        : eligible[0]?.id || ''
      setSelectedTradeId(stillEligible)
      await loadPreview(profit > 0 ? profit : null, stillEligible || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh allocation data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleReview = async () => {
    if (!selectedTradeId) {
      setError('Select a closed trade to review distribution')
      return
    }
    try {
      setRefreshing(true)
      setError('')
      await loadPreview(profit, selectedTradeId)
      setShowConfirmation(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate review')
    } finally {
      setRefreshing(false)
    }
  }

  const handleDistribute = async () => {
    if (!selectedTradeId) {
      setError('Select a closed trade before distributing profit')
      return
    }
    try {
      setAllocating(true)
      setError('')
      const result = await profitAllocationService.distribute(profit, selectedTradeId)
      setShowConfirmation(false)
      setSuccessDetails({
        recipients: Number(result?.recipients ?? tradeRecipients),
        totalHt: Number(result?.totalHtDistributed ?? tradeTotalHT),
        profit,
      })
      setShowSuccess(true)
      const historyItems = await loadHistory()
      const [eligible] = await Promise.all([
        loadClosedTrades(historyItems),
        loadTotals(),
      ])
      const nextTradeId = eligible[0]?.id || ''
      setSelectedTradeId(nextTradeId)
      await loadPreview(null, nextTradeId || null, true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Distribution failed')
    } finally {
      setAllocating(false)
    }
  }

  const updatedAllocations = useMemo(() => preview?.allocations ?? [], [preview])
  const totalAssetContribution = preview?.totalAssetContributionPkr ?? 0
  const formattedMintNow = tradeTotalHT.toLocaleString(undefined, { maximumFractionDigits: 2 })

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">HT Mint & Distribution</h1>
        <p className="mt-1 text-sm text-slate-600">Pick a closed trade. HT is minted only to the patients who funded that trade, in proportion to their AT contribution.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Available Profit</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-semibold text-slate-900">PKR {availableProfit.toLocaleString()}</p></CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">HT To Mint Now</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-semibold text-emerald-700">{formattedMintNow} HT</p></CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-slate-500">Eligible Wallets</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-semibold text-slate-900">{recipients.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-emerald-700">
              Patients ({Number(patientSharePct).toFixed(0)}%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-emerald-800">PKR {Number(patientAmountPkr).toLocaleString()}</p>
            <p className="text-xs text-emerald-700 mt-1">Distributed to trade participants</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-blue-700">
              Hospital ({Number(hospitalSharePct).toFixed(0)}%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-blue-800">PKR {Number(hospitalAmountPkr).toLocaleString()}</p>
            <p className="text-xs text-blue-700 mt-1">Retained to fund next trading cycle</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-amber-700">
              Bank ({Number(bankSharePct).toFixed(0)}%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-amber-800">PKR {Number(bankAmountPkr).toLocaleString()}</p>
            <p className="text-xs text-amber-700 mt-1">Custodian fee for safeguarding the asset</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Mint Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Closed Trade</label>
              <Select
                value={selectedTradeId}
                onValueChange={handleTradeChange}
                disabled={refreshing || closedTrades.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={closedTrades.length === 0 ? 'No closed trades pending distribution' : 'Select a closed trade'} />
                </SelectTrigger>
                <SelectContent
                  className="bg-white"
                  style={{ backgroundColor: '#ffffff', opacity: 1 }}
                >
                  {closedTrades.map((t) => (
                    <SelectItem
                      key={t.id}
                      value={t.id}
                      className="focus:bg-emerald-600 focus:text-white data-[highlighted]:bg-emerald-600 data-[highlighted]:text-white"
                    >
                      {t.title} — P&amp;L PKR {Number(t.profitLoss).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">Only patients who funded the selected trade will receive HT.</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Trade Profit (PKR)</label>
              <Input
                type="number"
                value={profit}
                readOnly
                disabled
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowConfirmation(true)}
                disabled={allocating || !selectedTradeId || profit <= 0 || tradeRecipients <= 0}
              >
                Distribute Profit
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-emerald-700"><Coins className="h-4 w-4" />Mint Result</div>
                <p className="text-2xl font-semibold text-emerald-700">{formattedMintNow} HT</p>
                <p className="text-xs text-emerald-700">From PKR {tradeTokenMintPool.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-700"><Users className="h-4 w-4" />Distribution</div>
                <p className="text-2xl font-semibold text-slate-900">{tradeRecipients.toLocaleString()} wallets</p>
                <p className="text-xs text-slate-600">Trade participants who funded with AT</p>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Mint Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={showAllHistory ? 'space-y-4 max-h-96 overflow-y-auto pr-1' : 'space-y-4'}>
              {(showAllHistory ? history : history.slice(0, 1)).map((item) => (
                <div key={item.distributionId} className="p-3 border-b last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <History className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Distribution #{item.distributionId.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{item.totalHtDistributed.toFixed(2)} HT</p>
                      <p className="text-xs text-muted-foreground">from PKR {item.totalProfit.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">
                      Patient: PKR {Number(item.patientAmountPkr ?? 0).toLocaleString()}
                    </div>
                    <div className="rounded bg-blue-50 px-2 py-1 text-blue-700">
                      Hospital: PKR {Number(item.hospitalAmountPkr ?? 0).toLocaleString()}
                    </div>
                    <div className="rounded bg-amber-50 px-2 py-1 text-amber-700">
                      Bank: PKR {Number(item.bankAmountPkr ?? 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}

              {history.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-6">No allocation history yet</div>
              )}
            </div>

            {history.length > 1 && (
              <button
                type="button"
                onClick={() => setShowAllHistory((v) => !v)}
                className="mt-3 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                {showAllHistory ? 'Show less' : `View all (${history.length})`}
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Patient Distribution Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead className="text-right">Asset Contribution (PKR)</TableHead>
                <TableHead className="text-right">Share %</TableHead>
                <TableHead className="text-right">HT Amount</TableHead>
                <TableHead className="text-right">PKR Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {updatedAllocations.map((patient) => (
                <TableRow key={patient.patientId}>
                  <TableCell className="font-mono text-xs">{patient.patientId.slice(0, 8)}</TableCell>
                  <TableCell className="font-medium">{patient.patientName}</TableCell>
                  <TableCell className="font-mono text-xs">{patient.walletAddress}</TableCell>
                  <TableCell className="text-right">PKR {patient.assetContributionPkr.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{patient.sharePercent.toFixed(2)}%</TableCell>
                  <TableCell className="text-right font-bold text-green-600">{patient.htAmount.toFixed(2)} HT</TableCell>
                  <TableCell className="text-right">PKR {patient.pkrValue.toFixed(2)}</TableCell>
                </TableRow>
              ))}

              {updatedAllocations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                    {selectedTradeId
                      ? 'No participants found for this trade.'
                      : 'Select a closed trade above to preview its participant distribution.'}
                  </TableCell>
                </TableRow>
              )}

              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">PKR {totalAssetContribution.toLocaleString()}</TableCell>
                <TableCell className="text-right">{updatedAllocations.length > 0 ? '100%' : '0%'}</TableCell>
                <TableCell className="text-right text-green-600">{tradeTotalHT.toFixed(2)} HT</TableCell>
                <TableCell className="text-right">PKR {tradeTokenMintPool.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Profit Distribution</DialogTitle>
            <DialogDescription>
              Review backend-calculated distribution details before confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Profit Input</p>
                <p className="text-2xl font-bold">PKR {profit.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-bold">{updatedAllocations.length}</p>
              </div>
            </div>

            <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-green-900">HT Minted & Distributed</p>
                <Badge variant="default">Single execution</Badge>
              </div>
              <p className="text-3xl font-bold text-green-700">PKR {tradeTokenMintPool.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">Converting to {tradeTotalHT.toFixed(2)} HT</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Important Notice</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Minted HT are distributed immediately and fully to recipients in this run. Re-allocation of the same distributed profit is blocked by backend available-profit checks.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={allocating}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleDistribute} disabled={allocating}>
              {allocating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
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

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Profit Distributed
            </DialogTitle>
            <DialogDescription>
              The HT mint has been recorded and credited to all eligible patient wallets.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-xs uppercase tracking-wide text-green-700">HT Distributed</p>
              <p className="text-3xl font-bold text-green-700">
                {(successDetails?.totalHt ?? 0).toFixed(2)} HT
              </p>
              <p className="text-xs text-green-700 mt-1">
                from PKR {(successDetails?.profit ?? 0).toLocaleString()} profit
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Recipients</p>
                <p className="text-lg font-semibold">{successDetails?.recipients ?? 0}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-lg font-semibold text-green-700">Completed</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowSuccess(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
