'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Users, History, AlertCircle, ArrowRight, Loader2, RefreshCw, Coins } from 'lucide-react'
import { profitAllocationService, ProfitAllocationHistoryItem, ProfitAllocationPreview } from '@/services/profitAllocationService'

export default function ProfitAllocationPage() {
  const [profit, setProfit] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [allocating, setAllocating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<ProfitAllocationPreview | null>(null)
  const [history, setHistory] = useState<ProfitAllocationHistoryItem[]>([])

  const availableProfit = preview?.availableProfit ?? 0
  const tokenMintPool = preview?.tokenMintPoolPkr ?? 0
  const totalHT = preview?.totalHtToDistribute ?? 0
  const recipients = preview?.totalRecipients ?? 0
  const htConversionRate = preview?.htConversionRate ?? 10

  const loadHistory = async () => {
    const items = await profitAllocationService.getHistory()
    setHistory(items)
  }

  const loadPreview = async (profitValue: number | null, init = false) => {
    const data = await profitAllocationService.getPreview(profitValue)
    setPreview(data)
    if (init) {
      setProfit(Math.round(data.totalProfit))
    }
  }

  const initialize = async () => {
    setLoading(true)
    setError('')
    try {
      await Promise.all([loadPreview(null, true), loadHistory()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load allocation data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initialize()
  }, [])

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      setError('')
      await Promise.all([loadPreview(profit), loadHistory()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh allocation data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleReview = async () => {
    try {
      setRefreshing(true)
      setError('')
      await loadPreview(profit)
      setShowConfirmation(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate review')
    } finally {
      setRefreshing(false)
    }
  }

  const handleDistribute = async () => {
    try {
      setAllocating(true)
      setError('')
      await profitAllocationService.distribute(profit)
      setShowConfirmation(false)
      await Promise.all([loadPreview(profit), loadHistory()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Distribution failed')
    } finally {
      setAllocating(false)
    }
  }

  const updatedAllocations = useMemo(() => preview?.allocations ?? [], [preview])
  const totalAssetContribution = preview?.totalAssetContributionPkr ?? 0
  const formattedMintNow = totalHT.toLocaleString(undefined, { maximumFractionDigits: 2 })

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
        <p className="mt-1 text-sm text-slate-600">Minted HT are distributed immediately to patient wallets by approved asset contribution. No HT is kept in hospital wallet.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Mint Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Profit Input (PKR)</label>
                <Input
                  type="number"
                  value={profit}
                  onChange={(e) => setProfit(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-slate-500 mt-1">Minted HT = Profit / {htConversionRate}. Distribution is one-time against available undistributed profit.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 items-end">
                <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </Button>
                <Button variant="outline" onClick={handleReview}>
                  Review
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setShowConfirmation(true)}
                  disabled={allocating || availableProfit <= 0 || recipients <= 0}
                >
                  Distribute Profit
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-emerald-700"><Coins className="h-4 w-4" />Mint Result</div>
                <p className="text-2xl font-semibold text-emerald-700">{formattedMintNow} HT</p>
                <p className="text-xs text-emerald-700">From PKR {tokenMintPool.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-700"><Users className="h-4 w-4" />Distribution</div>
                <p className="text-2xl font-semibold text-slate-900">{recipients.toLocaleString()} wallets</p>
                <p className="text-xs text-slate-600">Based on approved asset contribution only</p>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Mint Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.slice(0, 6).map((item) => (
                <div key={item.distributionId} className="flex items-center justify-between p-3 border-b last:border-0">
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
              ))}

              {history.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-6">No allocation history yet</div>
              )}
            </div>
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
                    No eligible recipients found. Patients need a wallet address and approved asset deposit.
                  </TableCell>
                </TableRow>
              )}

              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">PKR {totalAssetContribution.toLocaleString()}</TableCell>
                <TableCell className="text-right">{updatedAllocations.length > 0 ? '100%' : '0%'}</TableCell>
                <TableCell className="text-right text-green-600">{totalHT.toFixed(2)} HT</TableCell>
                <TableCell className="text-right">PKR {tokenMintPool.toLocaleString()}</TableCell>
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
              <p className="text-3xl font-bold text-green-700">PKR {tokenMintPool.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">Converting to {totalHT.toFixed(2)} HT</p>
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
    </div>
  )
}
