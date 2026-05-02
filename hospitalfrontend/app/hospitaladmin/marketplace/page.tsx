'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Users } from 'lucide-react'
import { authService } from '@/lib/authService'
import {
  marketplaceService,
  type HospitalAtPool,
  type MarketplaceTrade,
  type TradeParticipantDetail,
  type TradeStatus,
} from '@/services/marketplaceService'
import { depositRequestService, type AssetDepositItem } from '@/services/depositRequestService'
import { dashboardService, type AssetPrices } from '@/services/dashboardService'
import { useToast } from '@/hooks/use-toast'

const assetTypeOptions = ['Real Estate', 'Bonds', 'Machinery', 'Equipment', 'Other']
// Backend default (TokenPriceService) is 100 PKR per AT. Used only as fallback
// when the live rate can't be fetched — must match the backend or trade math
// (allocation validation, P/L display, Pool 1 reconciliation) goes off by 10×.
const AT_TO_PKR_FALLBACK = 100

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

const formatPKR = (value: number) => `PKR ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

const compactNumber = (value: number) => new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: value >= 1000000 ? 2 : 1,
}).format(value)

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isUuid = (value?: string | null): value is string => Boolean(value && UUID_REGEX.test(value))

const emptyPool: HospitalAtPool = {
  hospitalId: '',
  patientCount: 0,
  openTrades: 0,
  totalAtPool: 0,
  totalAtPoolPkr: 0,
  allocatedAt: 0,
  allocatedPkr: 0,
  availableAt: 0,
  availablePkr: 0,
}

export default function HospitalAdminMarketplace() {
  const { toast } = useToast()
  const [hospitalId, setHospitalId] = useState('')

  const [trades, setTrades] = useState<MarketplaceTrade[]>([])
  const [atPool, setAtPool] = useState<HospitalAtPool>(emptyPool)
  const [assetPrices, setAssetPrices] = useState<AssetPrices | null>(null)
  const [loading, setLoading] = useState(true)
  const [poolLoading, setPoolLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Live AT/PKR rate from the backend so admin display matches what the backend
  // actually locks/settles. Falls back to 100 (the backend's own default).
  const tokenPricePerPkr = assetPrices?.tokenPricePerPkr && assetPrices.tokenPricePerPkr > 0
    ? assetPrices.tokenPricePerPkr
    : AT_TO_PKR_FALLBACK
  const convertPKRtoAT = (pkr: number) => pkr / tokenPricePerPkr
  const formatAT = (pkr: number) =>
    `${convertPKRtoAT(pkr).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT`
  const formatATCompact = (pkr: number) => `${compactNumber(convertPKRtoAT(pkr))} AT`

  const [form, setForm] = useState<NewTradeForm>(initialForm)

  const [assetTypeFilter, setAssetTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | TradeStatus>('ALL')
  const [pnlSort, setPnlSort] = useState<'NONE' | 'ASC' | 'DESC'>('NONE')

  const [currentValueByTrade, setCurrentValueByTrade] = useState<Record<string, string>>({})
  const [exitValueByTrade, setExitValueByTrade] = useState<Record<string, string>>({})

  // Pool 2 selection — admin picks which patient assets fund the new trade.
  const [pool2Assets, setPool2Assets] = useState<AssetDepositItem[]>([])
  const [allocations, setAllocations] = useState<Record<string, string>>({})

  // Per-trade participants (lazy-loaded when admin expands the trade card).
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null)
  const [participantsByTrade, setParticipantsByTrade] = useState<Record<string, TradeParticipantDetail[]>>({})
  const [participantsLoading, setParticipantsLoading] = useState<Record<string, boolean>>({})
  const [participantsError, setParticipantsError] = useState<Record<string, string>>({})

  const allocationsList = useMemo(
    () =>
      pool2Assets
        .map((a) => ({
          patientId: a.patientId,
          assetId: a.assetId,
          atAmount: asNumber(allocations[a.assetId]),
        }))
        .filter((s) => s.atAmount > 0),
    [pool2Assets, allocations],
  )
  const totalAllocatedAt = allocationsList.reduce((sum, s) => sum + s.atAmount, 0)
  const totalAllocatedPkr = totalAllocatedAt * tokenPricePerPkr

  useEffect(() => {
    const resolveHospitalId = async () => {
      const cached = authService.getUser()?.hospitalId || ''
      if (isUuid(cached)) {
        setHospitalId(cached)
        return
      }

      const refreshed = await authService.fetchCurrentUser()
      const refreshedHospitalId = refreshed?.hospitalId || authService.getUser()?.hospitalId || ''
      if (isUuid(refreshedHospitalId)) {
        setHospitalId(refreshedHospitalId)
        return
      }

      setError('Hospital account link is missing or invalid. Please sign in again.')
      setLoading(false)
      setPoolLoading(false)
    }

    resolveHospitalId()
  }, [])

  const loadMarketplaceData = async () => {
    if (!isUuid(hospitalId)) {
      setError('Hospital account link is missing or invalid. Please sign in again.')
      setLoading(false)
      setPoolLoading(false)
      return
    }

    try {
      setLoading(true)
      setPoolLoading(true)
      setError('')
      const [data, pool, p2, prices] = await Promise.all([
        marketplaceService.getHospitalTrades(hospitalId),
        marketplaceService.getHospitalAtPool(hospitalId),
        depositRequestService.getHospitalPool2().catch(() => [] as AssetDepositItem[]),
        dashboardService.getAssetPrices().catch(() => null),
      ])
      setTrades(data)
      setAtPool(pool)
      setPool2Assets(
        (p2 || []).filter((row) => Number(row.currentPool1At ?? row.expectedTokens ?? 0) > 0),
      )
      setAssetPrices(prices)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades')
    } finally {
      setLoading(false)
      setPoolLoading(false)
    }
  }

  useEffect(() => {
    loadMarketplaceData()
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
    if (!isUuid(hospitalId)) {
      setError('Hospital account link is missing or invalid. Please sign in again.')
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
      const currentValue = form.currentValue ? asNumber(form.currentValue) : buyPrice

      if (allocationsList.length === 0) {
        setError('Select at least one Pool 2 asset and allocate AT for the trade.')
        return
      }
      const selectedPkr = totalAllocatedAt * tokenPricePerPkr
      if (selectedPkr + 0.01 < investedAmount) {
        setError(
          `Allocated AT (${totalAllocatedAt.toLocaleString()} AT = PKR ${selectedPkr.toLocaleString()}) ` +
            `is less than the trade's investment amount (PKR ${investedAmount.toLocaleString()}). ` +
            `Either increase per-patient AT or lower the buy price.`,
        )
        return
      }

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
        selections: allocationsList,
      })

      toast({
        title: 'Trade added',
        description: `${form.assetName} has been logged as active trade.`,
      })
      setForm(initialForm)
      setAllocations({})
      await loadMarketplaceData()
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
      await loadMarketplaceData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update current value')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseTrade = async (trade: MarketplaceTrade) => {
    const exitTotal = asNumber(exitValueByTrade[trade.id])
    if (exitTotal < 0 || !Number.isFinite(exitTotal)) {
      setError('Enter a valid total close value (PKR) before closing.')
      return
    }

    try {
      setSaving(true)
      setError('')
      await marketplaceService.closeTrade(trade.id, {
        exitValue: exitTotal,
      })

      toast({
        title: 'Trade closed',
        description: `${trade.assetName} has been closed and realized P&L computed.`,
      })
      await loadMarketplaceData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close trade')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleParticipants = async (tradeId: string) => {
    if (expandedTradeId === tradeId) {
      setExpandedTradeId(null)
      return
    }
    setExpandedTradeId(tradeId)
    if (participantsByTrade[tradeId]) {
      return
    }
    setParticipantsLoading((p) => ({ ...p, [tradeId]: true }))
    setParticipantsError((p) => ({ ...p, [tradeId]: '' }))
    try {
      const data = await marketplaceService.getTradeParticipants(tradeId)
      setParticipantsByTrade((p) => ({ ...p, [tradeId]: data }))
    } catch (err) {
      setParticipantsError((p) => ({
        ...p,
        [tradeId]: err instanceof Error ? err.message : 'Failed to load participants',
      }))
    } finally {
      setParticipantsLoading((p) => ({ ...p, [tradeId]: false }))
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 pb-8 pt-2 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Hospital Admin Trade Management</h1>
        <p className="mt-1 text-sm text-slate-600">All patient AT is combined into one hospital pool, then traded centrally. Admin enters amounts in PKR; values are shown in AT.</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-slate-500">AT Pool Available</CardTitle></CardHeader><CardContent><p className="text-xl font-semibold text-emerald-700">{poolLoading ? '...' : formatATCompact(atPool.availablePkr)}</p><p className="mt-1 text-xs text-slate-500">{poolLoading ? 'Loading pool' : `${atPool.patientCount} patients pooled`}</p></CardContent></Card>
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
          <div className="space-y-2"><Label>Current Value Per Unit (PKR, Optional)</Label><Input type="number" value={form.currentValue} onChange={(e) => setForm((p) => ({ ...p, currentValue: e.target.value }))} /><p className="text-xs text-slate-500">Per unit: {formatAT(asNumber(form.currentValue))}</p><p className="text-xs text-slate-500">Total: {formatAT(asNumber(form.currentValue) * asNumber(form.quantity))}</p></div>
          <div className="md:col-span-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Allocate AT from Pool 2</p>
                <p className="text-xs text-slate-500">
                  Pick which patient assets fund this trade. Only these patients share the P/L when it settles.
                </p>
              </div>
              <div className="text-right text-xs">
                <p className="text-slate-500">Allocated</p>
                <p className="font-semibold text-emerald-700">
                  {totalAllocatedAt.toLocaleString()} AT · PKR {totalAllocatedPkr.toLocaleString()}
                </p>
                <p className="text-slate-500">
                  Required: PKR {(asNumber(form.buyPrice) * asNumber(form.quantity)).toLocaleString()}
                </p>
              </div>
            </div>
            {pool2Assets.length === 0 ? (
              <p className="text-sm text-rose-700">
                No assets in Pool 2. Move some from Pool 1 (Pool Management) before creating a trade.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-auto">
                {pool2Assets.map((a) => {
                  const remaining = Number(a.currentPool1At ?? a.expectedTokens ?? 0)
                  const value = Number(allocations[a.assetId] ?? '')
                  return (
                    <div
                      key={a.assetId}
                      className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {a.patientName}{' '}
                          <span className="font-mono text-xs text-slate-500">#{a.assetId.slice(0, 8)}</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {a.assetType} · {remaining.toLocaleString()} AT in Pool 2
                        </p>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        max={remaining}
                        value={allocations[a.assetId] ?? ''}
                        onChange={(e) =>
                          setAllocations((prev) => ({ ...prev, [a.assetId]: e.target.value }))
                        }
                        placeholder="AT to use"
                        className="w-32"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setAllocations((prev) => ({ ...prev, [a.assetId]: String(remaining) }))
                        }
                        className="text-xs"
                      >
                        Max
                      </Button>
                      {value > remaining && (
                        <span className="text-xs text-rose-700">Exceeds remaining</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="md:col-span-3 space-y-2">
            <Button disabled={saving || poolLoading} onClick={handleAddTrade} className="bg-emerald-600 hover:bg-emerald-700">Add Trade</Button>
            <p className="text-xs text-slate-500">Pool available for new trades: {poolLoading ? 'Loading...' : formatAT(atPool.availablePkr)}</p>
          </div>
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
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Invested</p><p className="mt-1 font-semibold text-slate-900">{formatATCompact(asNumber(trade.amountInvested))}</p><p className="text-xs text-slate-500">{formatPKR(asNumber(trade.amountInvested))}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Current Value</p><p className="mt-1 font-semibold text-slate-900">{formatATCompact(asNumber(trade.currentValueTotal))}</p><p className="text-xs text-slate-500">{formatPKR(asNumber(trade.currentValueTotal))}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Unrealized P&amp;L</p><p className={`mt-1 font-semibold ${asNumber(trade.unrealizedPnl) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{asNumber(trade.unrealizedPnl) >= 0 ? '+' : '-'}{formatATCompact(Math.abs(asNumber(trade.unrealizedPnl)))}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Realized P&amp;L</p><p className={`mt-1 font-semibold ${asNumber(trade.realizedPnl) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{asNumber(trade.realizedPnl) >= 0 ? '+' : '-'}{formatATCompact(Math.abs(asNumber(trade.realizedPnl)))}</p></div>
                  </div>

                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleParticipants(trade.id)}
                      className="text-slate-700 hover:text-slate-900 px-2"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {expandedTradeId === trade.id ? 'Hide participants' : 'View participants'}
                      {expandedTradeId === trade.id
                        ? <ChevronUp className="h-4 w-4 ml-1" />
                        : <ChevronDown className="h-4 w-4 ml-1" />}
                    </Button>

                    {expandedTradeId === trade.id && (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        {participantsLoading[trade.id] && (
                          <p className="text-sm text-slate-500">Loading participants...</p>
                        )}
                        {participantsError[trade.id] && (
                          <p className="text-sm text-rose-700">{participantsError[trade.id]}</p>
                        )}
                        {!participantsLoading[trade.id] && !participantsError[trade.id] && (() => {
                          const rows = participantsByTrade[trade.id] || []
                          if (rows.length === 0) {
                            return <p className="text-sm text-slate-500">No participants recorded for this trade.</p>
                          }
                          const totalAt = rows.reduce((sum, r) => sum + asNumber(r.atAllocated), 0)
                          const totalPkr = rows.reduce((sum, r) => sum + asNumber(r.atMonetaryValuePkr), 0)
                          return (
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                                <p className="font-semibold text-slate-900">
                                  {rows.length} {rows.length === 1 ? 'patient funded' : 'patients funded'} this trade
                                </p>
                                <p>
                                  Total AT used: <span className="font-semibold text-emerald-700">{totalAt.toLocaleString(undefined, { maximumFractionDigits: 2 })} AT</span>
                                  {' · '}
                                  {formatPKR(totalPkr)}
                                </p>
                              </div>
                              <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                                <table className="min-w-full text-sm">
                                  <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                                    <tr>
                                      <th className="px-3 py-2 text-left font-medium">Patient</th>
                                      <th className="px-3 py-2 text-left font-medium">Asset</th>
                                      <th className="px-3 py-2 text-right font-medium">AT Used</th>
                                      <th className="px-3 py-2 text-right font-medium">PKR Value</th>
                                      <th className="px-3 py-2 text-right font-medium">% of Trade</th>
                                      <th className="px-3 py-2 text-left font-medium">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.map((r) => {
                                      const at = asNumber(r.atAllocated)
                                      const pkr = asNumber(r.atMonetaryValuePkr)
                                      const share = totalAt > 0 ? (at / totalAt) * 100 : 0
                                      return (
                                        <tr key={r.participationId} className="border-t border-slate-200">
                                          <td className="px-3 py-2">
                                            <p className="font-medium text-slate-900">{r.patientName || 'Unknown patient'}</p>
                                            <p className="text-xs text-slate-500 font-mono">
                                              {r.patientRegistrationId
                                                ? `Reg ${r.patientRegistrationId}`
                                                : `#${r.patientId.slice(0, 8)}`}
                                            </p>
                                          </td>
                                          <td className="px-3 py-2">
                                            <p className="text-slate-900">{r.assetType || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500 font-mono">#{r.assetId.slice(0, 8)}</p>
                                          </td>
                                          <td className="px-3 py-2 text-right font-semibold text-emerald-700">
                                            {at.toLocaleString(undefined, { maximumFractionDigits: 2 })} AT
                                          </td>
                                          <td className="px-3 py-2 text-right text-slate-700">
                                            {formatPKR(pkr)}
                                          </td>
                                          <td className="px-3 py-2 text-right text-slate-700">
                                            {share.toFixed(2)}%
                                          </td>
                                          <td className="px-3 py-2">
                                            <Badge
                                              className={
                                                r.participationStatus === 'ACTIVE'
                                                  ? 'bg-emerald-600 hover:bg-emerald-600'
                                                  : r.participationStatus === 'SETTLED'
                                                  ? 'bg-slate-700 hover:bg-slate-700'
                                                  : 'bg-amber-600 hover:bg-amber-600'
                                              }
                                            >
                                              {r.participationStatus || 'UNKNOWN'}
                                            </Badge>
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>

                  {trade.status === 'OPEN' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-2">
                          <Label>Update Current Value Per Unit (PKR)</Label>
                          <Input
                            type="number"
                            value={currentValueByTrade[trade.id] ?? ''}
                            onChange={(e) => setCurrentValueByTrade((p) => ({ ...p, [trade.id]: e.target.value }))}
                            placeholder="Enter current value per unit"
                          />
                          <p className="text-xs text-slate-500">Per unit: {formatAT(asNumber(currentValueByTrade[trade.id]))}</p>
                          <p className="text-xs text-slate-500">Total: {formatAT(asNumber(currentValueByTrade[trade.id]) * asNumber(trade.quantity))}</p>
                        </div>
                        <Button disabled={saving} className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateCurrentValue(trade)}>Update Value</Button>
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-2">
                          <Label>Sell / Exit Total Value (PKR)</Label>
                          <Input
                            type="number"
                            value={exitValueByTrade[trade.id] ?? ''}
                            onChange={(e) => setExitValueByTrade((p) => ({ ...p, [trade.id]: e.target.value }))}
                            placeholder="Enter total PKR the trade closed at"
                          />
                          <p className="text-xs text-slate-500">Total close value: {formatAT(asNumber(exitValueByTrade[trade.id]))}</p>
                          <p className="text-xs text-slate-500">Per unit: {asNumber(trade.quantity) > 0 ? formatAT(asNumber(exitValueByTrade[trade.id]) / asNumber(trade.quantity)) : '—'}</p>
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
