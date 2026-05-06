'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, TrendingDown, TrendingUp, Info, AlertCircle, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { marketplaceService, type MarketplaceTrade, type TradeParticipantDetail } from '@/services/marketplaceService'
import { dashboardService, type AssetPrices } from '@/services/dashboardService'
import { UserRole } from '@/types'

const AT_TO_PKR = 100

export default function HospitalMarketplace() {
  const { user } = useAuth()
  const hospitalId = user?.hospitalId || ''
  const hospitalName = user?.hospital?.name?.trim() || 'Not Assigned'
  const isStaffUser = user?.role === UserRole.HOSPITAL_STAFF

  const [trades, setTrades] = useState<MarketplaceTrade[]>([])
  const [assetPrices, setAssetPrices] = useState<AssetPrices | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ratesError, setRatesError] = useState('')
  const [query, setQuery] = useState('')
  const [participantQuery, setParticipantQuery] = useState('')
  const [assetTypeFilter, setAssetTypeFilter] = useState('ALL')
  const [participantsByTradeId, setParticipantsByTradeId] = useState<Record<string, TradeParticipantDetail[]>>({})
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null)

  const tokenPricePerPkr = assetPrices?.tokenPricePerPkr && assetPrices.tokenPricePerPkr > 0
    ? assetPrices.tokenPricePerPkr
    : AT_TO_PKR

  const convertPKRtoAT = (pkr: number) => pkr / tokenPricePerPkr

  useEffect(() => {
    const loadTrades = async () => {
      try {
        setLoading(true)
        setError('')
        setRatesError('')

        const pricesPromise = dashboardService.getAssetPrices().catch((err) => {
          setRatesError(err instanceof Error ? err.message : 'Failed to load live rates')
          return null
        })

        if (!hospitalId) {
          const prices = await pricesPromise
          setAssetPrices(prices)
          setTrades([])
          setError('Hospital information is missing for this account.')
          return
        }

        const [data, prices] = await Promise.all([
          marketplaceService.getHospitalTrades(hospitalId),
          pricesPromise,
        ])

        setTrades(data)
        setAssetPrices(prices)

        // Load participants for each trade (used for participant-name filtering)
        const participantResults = await Promise.allSettled(
          data.map(async (trade) => {
            const participants = await marketplaceService.getTradeParticipants(trade.id)
            return { tradeId: trade.id, participants }
          })
        )

        const nextParticipants: Record<string, TradeParticipantDetail[]> = {}
        for (const result of participantResults) {
          if (result.status === 'fulfilled') {
            nextParticipants[result.value.tradeId] = result.value.participants
          }
        }
        setParticipantsByTradeId(nextParticipants)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load marketplace data')
      } finally {
        setLoading(false)
      }
    }

    loadTrades()
  }, [hospitalId])

  const assetTypes = useMemo(() => {
    return ['ALL', ...Array.from(new Set(trades.map((trade) => trade.assetType || trade.investment).filter(Boolean)))]
  }, [trades])

  const filteredTrades = useMemo(() => {
    const lowerQuery = query.toLowerCase()
    const lowerParticipantQuery = participantQuery.trim().toLowerCase()

    return trades.filter((trade) => {
      const tradeLabel = trade.title || trade.assetName || trade.investment || trade.assetType || ''
      const matchesQuery =
        trade.id.toLowerCase().includes(lowerQuery) ||
        tradeLabel.toLowerCase().includes(lowerQuery) ||
        trade.assetType.toLowerCase().includes(lowerQuery)
      const matchesType = assetTypeFilter === 'ALL' || (trade.assetType || trade.investment) === assetTypeFilter

      const matchesParticipant = (() => {
        if (!lowerParticipantQuery) return true
        const participants = participantsByTradeId[trade.id] || []
        return participants.some((p) => (p.patientName || '').toLowerCase().includes(lowerParticipantQuery))
      })()

      return matchesQuery && matchesType && matchesParticipant
    })
  }, [trades, query, participantQuery, assetTypeFilter, participantsByTradeId])

  const totals = useMemo(() => {
    return filteredTrades.reduce(
      (acc, trade) => {
        acc.invested += trade.amountInvested || trade.buyPrice || 0
        acc.current += trade.currentValue || trade.currentValueTotal || 0
        acc.pnl += trade.unrealizedPnl || trade.profitLoss || 0
        return acc
      },
      { invested: 0, current: 0, pnl: 0 }
    )
  }, [filteredTrades])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Investment Marketplace</h1>
        <p className="text-slate-600 mt-1">Monitor patient investments and market activity. All values are shown in AT (Asset Token).</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {ratesError && <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Live rates unavailable: {ratesError}</div>}

      {isStaffUser && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">View-Only Access</p>
            <p className="text-sm text-blue-700">You have viewing permissions only. For trading operations, contact your hospital administrator.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Connected Hospital</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-slate-900">{hospitalName}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Gold Rate (PKR / gram)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">
              {assetPrices?.goldPricePerGram
                ? Number(assetPrices.goldPricePerGram).toLocaleString(undefined, { maximumFractionDigits: 2 })
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Silver Rate (PKR / gram)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">
              {assetPrices?.silverPricePerGram
                ? Number(assetPrices.silverPricePerGram).toLocaleString(undefined, { maximumFractionDigits: 2 })
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Invested</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{convertPKRtoAT(totals.invested).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Current Value</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{convertPKRtoAT(totals.current).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Total P&L</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totals.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {totals.pnl >= 0 ? '+' : ''}{convertPKRtoAT(totals.pnl).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="Search by trade ID, investment, or asset type"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="Filter by participant name"
              value={participantQuery}
              onChange={(e) => setParticipantQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {assetTypes.map((type) => (
              <Button
                key={type}
                variant={assetTypeFilter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAssetTypeFilter(type)}
              >
                {type === 'ALL' ? 'All' : type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading trades...</p>
          ) : filteredTrades.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Info className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No trade data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTrades.map((trade) => {
                const pnl = trade.unrealizedPnl || trade.profitLoss || 0
                const isPositive = pnl >= 0
                const tradeLabel = trade.title || trade.assetName || trade.investment || trade.assetType
                const participantRows = participantsByTradeId[trade.id] || []
                const isExpanded = expandedTradeId === trade.id

                return (
                  <div key={trade.id} className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{tradeLabel}</p>
                        <p className="text-sm text-slate-600">{trade.assetType}</p>
                      </div>
                      <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'} className="flex items-center gap-1">
                        {trade.type === 'BUY' ? (
                          <>
                            <TrendingUp className="h-3 w-3" />
                            Buy
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3" />
                            Sell
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Investment Amount</p>
                        <p className="font-medium">{convertPKRtoAT(trade.amountInvested || trade.buyPrice || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Current Value</p>
                        <p className="font-medium">{convertPKRtoAT(trade.currentValue || trade.currentValueTotal || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT</p>
                      </div>
                      <div>
                        <p className="text-slate-500">P&amp;L</p>
                        <p className={`font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{convertPKRtoAT(pnl).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>Quantity: {trade.quantity}</span>
                      <span>Status: <Badge variant="outline" className="ml-1">{trade.status}</Badge></span>
                    </div>

                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedTradeId((prev) => (prev === trade.id ? null : trade.id))}
                        className="text-slate-700 hover:text-slate-900 px-2"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {isExpanded ? 'Hide participants' : 'View participants'}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </Button>

                      {isExpanded && (
                        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                          {participantRows.length === 0 ? (
                            <p className="text-sm text-slate-500">No participants recorded for this trade.</p>
                          ) : (
                            (() => {
                              const totalAt = participantRows.reduce((sum, r) => sum + Number(r.atAllocated || 0), 0)
                              const totalPkr = participantRows.reduce((sum, r) => sum + Number(r.atMonetaryValuePkr || 0), 0)

                              return (
                                <div className="space-y-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                                    <p className="font-semibold text-slate-900">
                                      {participantRows.length} {participantRows.length === 1 ? 'patient funded' : 'patients funded'} this trade
                                    </p>
                                    <p>
                                      Total AT used:{' '}
                                      <span className="font-semibold text-emerald-700">
                                        {totalAt.toLocaleString(undefined, { maximumFractionDigits: 2 })} AT
                                      </span>
                                      {' · '}
                                      PKR {totalPkr.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </p>
                                  </div>

                                  <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                                    <table className="min-w-full text-sm">
                                      <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                                        <tr>
                                          <th className="px-3 py-2 text-left font-medium">Patient</th>
                                          <th className="px-3 py-2 text-right font-medium">AT Used</th>
                                          <th className="px-3 py-2 text-right font-medium">PKR Value</th>
                                          <th className="px-3 py-2 text-left font-medium">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {participantRows.map((r) => (
                                          <tr key={r.participationId} className="border-t border-slate-200">
                                            <td className="px-3 py-2">
                                              <p className="font-medium text-slate-900">{r.patientName || 'Unknown patient'}</p>
                                              <p className="text-xs text-slate-500 font-mono">
                                                {r.patientRegistrationId
                                                  ? `Reg ${r.patientRegistrationId}`
                                                  : `#${r.patientId.slice(0, 8)}`}
                                              </p>
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold text-emerald-700">
                                              {Number(r.atAllocated || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT
                                            </td>
                                            <td className="px-3 py-2 text-right text-slate-700">
                                              PKR {Number(r.atMonetaryValuePkr || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )
                            })()
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
