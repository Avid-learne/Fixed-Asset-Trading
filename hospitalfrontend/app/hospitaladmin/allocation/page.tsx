'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Gift, Users, CheckCircle, History, AlertCircle, ArrowRight, Download, Loader2, RefreshCw } from 'lucide-react'
import { profitAllocationService, ProfitAllocationHistoryItem, ProfitAllocationPreview } from '@/services/profitAllocationService'

export default function ProfitAllocationPage() {
  const [profit, setProfit] = useState(0)
  const [patientShare, setPatientShare] = useState(70)
  const [hospitalShare, setHospitalShare] = useState(30)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [allocating, setAllocating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<ProfitAllocationPreview | null>(null)
  const [history, setHistory] = useState<ProfitAllocationHistoryItem[]>([])

  const patientAmount = preview?.patientAmountPkr ?? 0
  const hospitalAmount = preview?.hospitalAmountPkr ?? 0
  const totalHT = preview?.totalHtToDistribute ?? 0
  const htConversionRate = preview?.htConversionRate ?? 10

  const loadHistory = async () => {
    const items = await profitAllocationService.getHistory()
    setHistory(items)
  }

  const loadPreview = async (profitValue: number | null, share: number, init = false) => {
    const data = await profitAllocationService.getPreview(profitValue, share)
    setPreview(data)
    if (init) {
      setProfit(Math.round(data.totalProfit))
    }
  }

  const initialize = async () => {
    setLoading(true)
    setError('')
    try {
      await Promise.all([loadPreview(null, patientShare, true), loadHistory()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load allocation data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initialize()
  }, [])

  const handleSliderChange = async (value: number[]) => {
    const nextPatientShare = value[0]
    setPatientShare(nextPatientShare)
    setHospitalShare(100 - nextPatientShare)

    try {
      setRefreshing(true)
      setError('')
      await loadPreview(profit, nextPatientShare)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to recalculate preview')
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      setError('')
      await Promise.all([loadPreview(profit, patientShare), loadHistory()])
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
      await loadPreview(profit, patientShare)
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
      await profitAllocationService.distribute(profit, patientShare)
      setShowConfirmation(false)
      await Promise.all([loadPreview(profit, patientShare), loadHistory()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Distribution failed')
    } finally {
      setAllocating(false)
    }
  }

  const updatedAllocations = useMemo(() => preview?.allocations ?? [], [preview])
  const totalATHolding = preview?.totalAtHolding ?? 0

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading profit allocation data...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profit Allocation</h1>
        <p className="text-muted-foreground mt-1">Distribute real trading profits to patients as Health Tokens (HT).</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Allocation Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm text-green-800 font-medium">Total Profit Available</p>
                <p className="text-3xl font-bold text-green-700">PKR {(preview?.availableProfit ?? 0).toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">Live from backend marketplace profit minus already distributed allocations</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Profit to Distribute (PKR)</label>
                <Input
                  type="number"
                  value={profit}
                  onChange={(e) => setProfit(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground mt-1">You can allocate all or part of available profit</p>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={handleRefresh} disabled={refreshing}>
                  Recalculate Preview
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span>Patients ({patientShare}%)</span>
                <span>Hospital ({hospitalShare}%)</span>
              </div>
              <Slider
                value={[patientShare]}
                max={100}
                step={1}
                onValueChange={handleSliderChange}
                className="py-4"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border-2 border-primary rounded-lg text-center bg-primary/5">
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">To Patients</p>
                  <p className="text-2xl font-bold">PKR {patientAmount.toLocaleString()}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">= {totalHT.toFixed(2)} HT</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Gift className="w-6 h-6 mx-auto mb-2 text-secondary" />
                  <p className="text-sm text-muted-foreground">To Hospital</p>
                  <p className="text-2xl font-bold">PKR {hospitalAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Hospital Revenue</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-900">Distribution Formula</p>
                <p className="text-xs text-emerald-700 mt-1">
                  HT distribution is proportional to patient AT holdings in `patient_token_balances.total_at`.
                  Conversion rate: PKR {htConversionRate} = 1 HT.
                </p>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleReview}>
              Review Distribution Details
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocation History</CardTitle>
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
                    <p className="text-sm font-bold text-green-600">PKR {item.totalProfit.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{item.totalHtDistributed.toFixed(2)} HT</p>
                  </div>
                </div>
              ))}

              {history.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-6">No allocation history yet</div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4" size="sm" disabled>
              <Download className="w-4 h-4 mr-2" />
              Export History (next)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient-Wise Distribution Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">AT Holdings</TableHead>
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
                  <TableCell className="text-right">{patient.atHolding.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{patient.sharePercent.toFixed(2)}%</TableCell>
                  <TableCell className="text-right font-bold text-green-600">{patient.htAmount.toFixed(2)} HT</TableCell>
                  <TableCell className="text-right">PKR {patient.pkrValue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">{totalATHolding.toLocaleString()}</TableCell>
                <TableCell className="text-right">100%</TableCell>
                <TableCell className="text-right text-green-600">{totalHT.toFixed(2)} HT</TableCell>
                <TableCell className="text-right">PKR {patientAmount.toLocaleString()}</TableCell>
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
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold">PKR {profit.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-bold">{updatedAllocations.length}</p>
              </div>
            </div>

            <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-green-900">Patient Allocation</p>
                <Badge variant="default">{patientShare}%</Badge>
              </div>
              <p className="text-3xl font-bold text-green-700">PKR {patientAmount.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">Converting to {totalHT.toFixed(2)} HT</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Hospital Revenue</p>
                <Badge variant="outline">{hospitalShare}%</Badge>
              </div>
              <p className="text-2xl font-bold">PKR {hospitalAmount.toLocaleString()}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Important Notice</p>
                <p className="text-xs text-yellow-700 mt-1">
                  This writes to `profit_distributions`, `profit_allocations`, and updates `patient_token_balances.total_ht`.
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
