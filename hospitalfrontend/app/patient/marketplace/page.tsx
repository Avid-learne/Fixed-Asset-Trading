'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, TrendingDown, TrendingUp, Info } from 'lucide-react'
import { authService } from '@/lib/authService'
import { marketplaceService, type PatientMarketplaceTrade } from '@/services/marketplaceService'
import { dashboardService, type AssetPrices } from '@/services/dashboardService'

const AT_TO_PKR = 100

export default function PatientMarketplace() {
  const currentUser = authService.getUser()
  const hospitalId = currentUser?.hospitalId || ''
  const connectedHospitalName = currentUser?.hospitalName?.trim() || 'Not Assigned'

  const [trades, setTrades] = useState<PatientMarketplaceTrade[]>([])
  const [assetPrices, setAssetPrices] = useState<AssetPrices | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ratesError, setRatesError] = useState('')
  const [query, setQuery] = useState('')
  const [assetTypeFilter, setAssetTypeFilter] = useState('ALL')

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
          marketplaceService.getPatientViewTrades(hospitalId),
          pricesPromise,
        ])
        setTrades(data)
        setAssetPrices(prices)
        console.log('Loaded prices:', prices)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load marketplace data')
      } finally {
        setLoading(false)
      }
    }

    loadTrades()
  }, [hospitalId])

  const assetTypes = useMemo(() => ['ALL', ...Array.from(new Set(trades.map((trade) => trade.assetType).filter(Boolean)))], [trades])

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const matchesQuery =
        trade.tradeName.toLowerCase().includes(query.toLowerCase()) ||
        trade.assetType.toLowerCase().includes(query.toLowerCase())
      const matchesType = assetTypeFilter === 'ALL' || trade.assetType === assetTypeFilter
      return matchesQuery && matchesType
    })
  }, [trades, query, assetTypeFilter])

  const totals = useMemo(() => {
    return filteredTrades.reduce(
      (acc, trade) => {
        acc.invested += trade.investmentAmount
        acc.current += trade.currentValue
        acc.pnl += trade.pnl
        return acc
      },
      { invested: 0, current: 0, pnl: 0 }
    )
  }, [filteredTrades])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Investment Portal</h1>
        <p className="text-slate-600 mt-1">Your hospital-managed investments shown in AT. Admin enters values in PKR, portal converts them for display.</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {ratesError && <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Live rates unavailable: {ratesError}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Connected Hospital</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-slate-900">{connectedHospitalName}</p></CardContent>
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
        <Card><CardHeader><CardTitle className="text-sm">Invested</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{convertPKRtoAT(totals.invested).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Current Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{convertPKRtoAT(totals.current).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">P&L</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${totals.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{totals.pnl >= 0 ? '+' : ''}{convertPKRtoAT(totals.pnl).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="pl-10" placeholder="Search trade or asset type" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {assetTypes.map((type) => (
              <Button key={type} variant={assetTypeFilter === type ? 'default' : 'outline'} size="sm" onClick={() => setAssetTypeFilter(type)}>
                {type === 'ALL' ? 'All' : type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Trades</CardTitle></CardHeader>
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
                const isPositive = trade.pnl >= 0
                return (
                  <div key={trade.tradeId} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{trade.tradeName}</p>
                        <p className="text-sm text-slate-600">{trade.assetType}</p>
                      </div>
                      <Badge variant={isPositive ? 'default' : 'destructive'} className="flex items-center gap-1">
                        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isPositive ? 'Profit' : 'Loss'}
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Investment Amount</p>
                        <p className="font-medium">{convertPKRtoAT(trade.investmentAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Current Value</p>
                        <p className="font-medium">{convertPKRtoAT(trade.currentValue).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT</p>
                      </div>
                      <div>
                        <p className="text-slate-500">P&L</p>
                        <p className={`font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>{isPositive ? '+' : ''}{convertPKRtoAT(trade.pnl).toLocaleString(undefined, { maximumFractionDigits: 2 })} AT</p>
                      </div>
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
