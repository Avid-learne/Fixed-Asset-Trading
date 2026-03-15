'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { authService } from '@/lib/authService'
import { marketplaceService, type MarketplaceTrade, type TradeStatus } from '@/services/marketplaceService'
import { useToast } from '@/hooks/use-toast'

const assetTypeOptions = ['Real Estate', 'Bonds', 'Machinery', 'Equipment', 'Other']
const AT_TO_PKR = 10

type NewTradeForm = {
  assetName: string
  assetType: string
  buyPrice: string
  quantity: string
  tradeDate: string
  currentValue: string
}

const initialForm: NewTradeForm = {
  assetName: '',
  assetType: 'Real Estate',
  buyPrice: '',
  quantity: '',
  tradeDate: new Date().toISOString().slice(0, 10),
  currentValue: '',
}

const asNumber = (value: string | number | undefined | null): number => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const convertPKRtoAT = (pkr: number) => pkr / AT_TO_PKR

const formatAT = (pkr: number) => `${convertPKRtoAT(pkr).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT`

const compactNumber = (value: number) => new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: value >= 1000000 ? 2 : 1,
}).format(value)

const formatATCompact = (pkr: number) => `${compactNumber(convertPKRtoAT(pkr))} AT`

export default function HospitalAdminMarketplace() {
  const { toast } = useToast()
  const currentUser = authService.getUser()
  const hospitalId = currentUser?.hospitalId || ''

  const [trades, setTrades] = useState<MarketplaceTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<NewTradeForm>(initialForm)

  const [assetTypeFilter, setAssetTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | TradeStatus>('ALL')
  const [pnlSort, setPnlSort] = useState<'NONE' | 'ASC' | 'DESC'>('NONE')

  const [currentValueByTrade, setCurrentValueByTrade] = useState<Record<string, string>>({})
  const [exitValueByTrade, setExitValueByTrade] = useState<Record<string, string>>({})

  const loadTrades = async () => {
    if (!hospitalId) {
      setError('Hospital is not linked to this account. Contact admin.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const data = await marketplaceService.getHospitalTrades(hospitalId)
      setTrades(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrades()
  }, [hospitalId])

  const portfolio = useMemo(() => {
    return trades.reduce(
      (acc, trade) => {
        acc.totalInvested += asNumber(trade.amountInvested)
        acc.totalCurrent += asNumber(trade.currentValueTotal)
        acc.totalRealized += asNumber(trade.realizedPnl)
        acc.totalUnrealized += asNumber(trade.unrealizedPnl)
        return acc
      },
      { totalInvested: 0, totalCurrent: 0, totalRealized: 0, totalUnrealized: 0 }
    )
  }, [trades])

  const filteredTrades = useMemo(() => {
    const rows = trades.filter((trade) => {
      const typeOk = assetTypeFilter === 'ALL' || trade.assetType === assetTypeFilter
      const statusOk = statusFilter === 'ALL' || trade.status === statusFilter
      return typeOk && statusOk
    })

    if (pnlSort === 'ASC') {
      rows.sort((a, b) => asNumber(a.profitLoss) - asNumber(b.profitLoss))
    } else if (pnlSort === 'DESC') {
      rows.sort((a, b) => asNumber(b.profitLoss) - asNumber(a.profitLoss))
    }

    return rows
  }, [trades, assetTypeFilter, statusFilter, pnlSort])

  const assetTypeFilters = useMemo(() => {
    const types = Array.from(new Set(trades.map((trade) => trade.assetType).filter(Boolean)))
    return ['ALL', ...types]
  }, [trades])

  const handleAddTrade = async () => {
    if (!hospitalId) {
      setError('Hospital is not linked to this account. Contact admin.')
      return
    }

    if (!form.assetName || !form.assetType || !form.buyPrice || !form.quantity || !form.tradeDate) {
      setError('Asset name, type, buy price, quantity and trade date are required.')
      return
    }

    try {
      setSaving(true)
      setError('')

      const buyPrice = asNumber(form.buyPrice)
      const quantity = asNumber(form.quantity)
      const investedAmount = buyPrice * quantity
      const currentValue = form.currentValue ? asNumber(form.currentValue) : investedAmount

      await marketplaceService.createTrade({
        hospitalId,
        tradeType: 'BUY',
        assetName: form.assetName,
        assetType: form.assetType,
        buyPrice,
        quantity,
        tradeDate: form.tradeDate,
        currentValue,
        title: form.assetName,
        description: `${form.assetType} investment`,
        investment: form.assetType,
        location: '',
        openingPrice: buyPrice,
        high: buyPrice,
        low: buyPrice,
        closingPrice: buyPrice,
        notes: '',
      })

      toast({
        title: 'Trade added',
        description: `${form.assetName} has been logged as active trade.`,
      })
      setForm(initialForm)
      await loadTrades()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add trade')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateCurrentValue = async (trade: MarketplaceTrade) => {
    const value = asNumber(currentValueByTrade[trade.id])
    if (value <= 0) {
      setError('Enter a valid current value before updating.')
      return
    }

    try {
      setSaving(true)
      setError('')
      await marketplaceService.updateTrade(trade.id, {
        tradeType: trade.type,
        status: 'OPEN',
        assetName: trade.assetName,
        assetType: trade.assetType,
        buyPrice: trade.buyPrice,
        quantity: trade.quantity,
        tradeDate: trade.tradeDate,
        currentValue: value,
        title: trade.title,
        description: trade.description,
        investment: trade.assetType,
        location: trade.location,
        openingPrice: trade.buyPrice,
        high: trade.high,
        low: trade.low,
        closingPrice: trade.close,
        notes: trade.notes,
      })

      toast({
        title: 'Current value updated',
        description: `${trade.assetName} current value has been updated.`,
      })
      await loadTrades()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update current value')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseTrade = async (trade: MarketplaceTrade) => {
    const exitValue = asNumber(exitValueByTrade[trade.id])
    if (exitValue <= 0) {
      setError('Enter a valid sell/exit value before closing.')
      return
    }

    try {
      setSaving(true)
      setError('')
      await marketplaceService.updateTrade(trade.id, {
        tradeType: trade.type,
        status: 'CLOSED',
        assetName: trade.assetName,
        assetType: trade.assetType,
        buyPrice: trade.buyPrice,
        quantity: trade.quantity,
        tradeDate: trade.tradeDate,
        currentValue: exitValue,
        exitValue,
        title: trade.title,
        description: trade.description,
        investment: trade.assetType,
        location: trade.location,
        openingPrice: trade.buyPrice,
        high: trade.high,
        low: trade.low,
        closingPrice: trade.close,
        notes: trade.notes,
      })

      toast({
        title: 'Trade closed',
        description: `${trade.assetName} has been closed and realized P&L computed.`,
      })
      await loadTrades()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close trade')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 pb-8 pt-2 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Hospital Admin Trade Management</h1>
        <p className="mt-1 text-sm text-slate-600">Admin enters amounts in PKR. All displayed trade values and P&amp;L are shown in AT.</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Invested</CardTitle></CardHeader><CardContent><p className="text-xl font-semibold text-slate-900">{formatATCompact(portfolio.totalInvested)}</p><p className="mt-1 text-xs text-slate-500">{formatAT(portfolio.totalInvested)}</p></CardContent></Card>
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Current Value</CardTitle></CardHeader><CardContent><p className="text-xl font-semibold text-slate-900">{formatATCompact(portfolio.totalCurrent)}</p><p className="mt-1 text-xs text-slate-500">{formatAT(portfolio.totalCurrent)}</p></CardContent></Card>
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Realized P&amp;L</CardTitle></CardHeader><CardContent><p className={`text-xl font-semibold ${portfolio.totalRealized >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{portfolio.totalRealized >= 0 ? '+' : '-'}{formatATCompact(Math.abs(portfolio.totalRealized))}</p><p className="mt-1 text-xs text-slate-500">{formatAT(Math.abs(portfolio.totalRealized))}</p></CardContent></Card>
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Unrealized P&amp;L</CardTitle></CardHeader><CardContent><p className={`text-xl font-semibold ${portfolio.totalUnrealized >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{portfolio.totalUnrealized >= 0 ? '+' : '-'}{formatATCompact(Math.abs(portfolio.totalUnrealized))}</p><p className="mt-1 text-xs text-slate-500">{formatAT(Math.abs(portfolio.totalUnrealized))}</p></CardContent></Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4"><CardTitle className="text-xl">Add New Trade</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Asset Name</Label><Input value={form.assetName} onChange={(e) => setForm((p) => ({ ...p, assetName: e.target.value }))} placeholder="Hospital Tower Phase II" /></div>
          <div className="space-y-2"><Label>Asset Type</Label><Select value={form.assetType} onValueChange={(v) => setForm((p) => ({ ...p, assetType: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{assetTypeOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Trade Date</Label><Input type="date" value={form.tradeDate} onChange={(e) => setForm((p) => ({ ...p, tradeDate: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Buy Price (PKR)</Label><Input type="number" value={form.buyPrice} onChange={(e) => setForm((p) => ({ ...p, buyPrice: e.target.value }))} /><p className="text-xs text-slate-500">Display: {formatAT(asNumber(form.buyPrice))}</p></div>
          <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Current Value (PKR, Optional)</Label><Input type="number" value={form.currentValue} onChange={(e) => setForm((p) => ({ ...p, currentValue: e.target.value }))} /><p className="text-xs text-slate-500">Display: {formatAT(asNumber(form.currentValue))}</p></div>
          <div className="md:col-span-3"><Button disabled={saving} onClick={handleAddTrade} className="bg-emerald-600 hover:bg-emerald-700">Add Trade</Button></div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-4"><CardTitle className="text-xl">Trade Filters</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Asset Type</Label><Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{assetTypeFilters.map((t) => <SelectItem key={t} value={t}>{t === 'ALL' ? 'All' : t}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Status</Label><Select value={statusFilter} onValueChange={(v: 'ALL' | TradeStatus) => setStatusFilter(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All</SelectItem><SelectItem value="OPEN">Active</SelectItem><SelectItem value="CLOSED">Closed</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Sort by P&L</Label><Select value={pnlSort} onValueChange={(v: 'NONE' | 'ASC' | 'DESC') => setPnlSort(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NONE">None</SelectItem><SelectItem value="DESC">Highest First</SelectItem><SelectItem value="ASC">Lowest First</SelectItem></SelectContent></Select></div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-4"><CardTitle className="text-xl">Trades</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-slate-500">Loading trades...</p> : (
            <div className="space-y-3">
              {filteredTrades.map((trade) => (
                <div key={trade.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{trade.assetName}</p>
                      <p className="text-sm text-slate-600">{trade.assetType} | Date: {trade.tradeDate || new Date(trade.timestamp).toISOString().slice(0, 10)}</p>
                    </div>
                    <Badge className={trade.status === 'OPEN' ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-slate-700 hover:bg-slate-700'}>{trade.status === 'OPEN' ? 'ACTIVE' : 'CLOSED'}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-6 text-sm">
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Buy Price</p><p className="mt-1 font-semibold text-slate-900">{formatATCompact(asNumber(trade.buyPrice))}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Quantity</p><p className="mt-1 font-semibold text-slate-900">{compactNumber(asNumber(trade.quantity))}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Invested</p><p className="mt-1 font-semibold text-slate-900">{formatATCompact(asNumber(trade.amountInvested))}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Current Value</p><p className="mt-1 font-semibold text-slate-900">{formatATCompact(asNumber(trade.currentValue))}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Unrealized P&amp;L</p><p className={`mt-1 font-semibold ${asNumber(trade.unrealizedPnl) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{asNumber(trade.unrealizedPnl) >= 0 ? '+' : '-'}{formatATCompact(Math.abs(asNumber(trade.unrealizedPnl)))}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Realized P&amp;L</p><p className={`mt-1 font-semibold ${asNumber(trade.realizedPnl) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{asNumber(trade.realizedPnl) >= 0 ? '+' : '-'}{formatATCompact(Math.abs(asNumber(trade.realizedPnl)))}</p></div>
                  </div>

                  {trade.status === 'OPEN' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-2">
                          <Label>Update Current Value (PKR)</Label>
                          <Input
                            type="number"
                            value={currentValueByTrade[trade.id] ?? ''}
                            onChange={(e) => setCurrentValueByTrade((p) => ({ ...p, [trade.id]: e.target.value }))}
                            placeholder="Enter appraisal/depreciated/current value"
                          />
                          <p className="text-xs text-slate-500">Display: {formatAT(asNumber(currentValueByTrade[trade.id]))}</p>
                        </div>
                        <Button disabled={saving} className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateCurrentValue(trade)}>Update Value</Button>
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-2">
                          <Label>Sell / Exit Value (PKR)</Label>
                          <Input
                            type="number"
                            value={exitValueByTrade[trade.id] ?? ''}
                            onChange={(e) => setExitValueByTrade((p) => ({ ...p, [trade.id]: e.target.value }))}
                            placeholder="Enter exit value to close"
                          />
                          <p className="text-xs text-slate-500">Display: {formatAT(asNumber(exitValueByTrade[trade.id]))}</p>
                        </div>
                        <Button disabled={saving} variant="outline" className="border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700" onClick={() => handleCloseTrade(trade)}>Close Trade</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredTrades.length === 0 && <p className="text-sm text-slate-500">No trades found for selected filters.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
