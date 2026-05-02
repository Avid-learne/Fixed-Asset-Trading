'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Clock, Lock, Unlock, Coins, ShieldOff } from 'lucide-react'
import { marketplaceService, PatientAssetToken } from '@/services/marketplaceService'
import { depositRequestService } from '@/services/depositRequestService'
import { dashboardService, type AssetPrices } from '@/services/dashboardService'

import { formatDate, formatNumber } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'



const assetTypeConfig = {
  GOLD: { label: 'Gold', color: 'bg-amber-50' },
  SILVER: { label: 'Silver', color: 'bg-slate-50' },
  CASH: { label: 'Cash', color: 'bg-green-50' },
  PROPERTY: { label: 'Property', color: 'bg-blue-50' }
}

const availabilityConfig = {
  WITH_PATIENT: { label: 'Pool 1 — Available (Redeemable)', color: 'bg-amber-100 text-amber-800', icon: Coins },
  AVAILABLE: { label: 'Pool 2 — In Trading Pool', color: 'bg-green-100 text-green-800', icon: Unlock },
  UNAVAILABLE: { label: 'In Trade', color: 'bg-orange-100 text-orange-800', icon: Lock }
}

interface LinkedAssetWithToken extends PatientAssetToken {
  depositInfo?: Record<string, unknown>
}

export default function LinkedAssetsPage() {
  const { user } = useAuth()
  const [assetTokens, setAssetTokens] = useState<LinkedAssetWithToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'combined' | 'tokens-only'>('combined')
  const [optOutToggling, setOptOutToggling] = useState<string | null>(null)
  const [assetPrices, setAssetPrices] = useState<AssetPrices | null>(null)

  // Live AT/PKR rate from the DB (TokenPriceService). Falls back to 100 — the backend's
  // own default — so per-token PKR figures here always agree with what marketplace and
  // pool views display.
  const tokenPricePerPkr = assetPrices?.tokenPricePerPkr && assetPrices.tokenPricePerPkr > 0
    ? assetPrices.tokenPricePerPkr
    : 100

  useEffect(() => {
    dashboardService.getAssetPrices().then(setAssetPrices).catch(() => setAssetPrices(null))
  }, [])

  const handleToggleOptOut = async (assetId: string, currentlyOptedOut: boolean) => {
    try {
      setOptOutToggling(assetId)
      await depositRequestService.toggleTradingOptOut(assetId, !currentlyOptedOut)
      setAssetTokens((prev) =>
        prev.map((t) =>
          String(t.assetId) === assetId ? { ...t, tradingOptOut: !currentlyOptedOut } : t,
        ),
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update opt-out')
    } finally {
      setOptOutToggling(null)
    }
  }

  const fetchAssetTokens = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Attempt 1 — new /me endpoint (no patientId needed)
    try {
      const tokens = await marketplaceService.getMyAssetTokens()
      if (tokens && tokens.length > 0) {
        setAssetTokens(tokens as LinkedAssetWithToken[])
        setLoading(false)
        return
      }
    } catch (err) {
      console.warn('[linked-assets] /me/asset-tokens failed, trying old endpoint:', err)
    }

    // Attempt 2 — old endpoint, only if localStorage has patientId
    if (user?.patientId) {
      try {
        const tokens = await marketplaceService.getPatientAssetTokens(user.patientId)
        if (tokens && tokens.length > 0) {
          setAssetTokens(tokens as LinkedAssetWithToken[])
          setLoading(false)
          return
        }
      } catch (err) {
        console.warn('[linked-assets] /patient/{id}/asset-tokens failed, falling back to deposits:', err)
      }
    }

    // Attempt 3 — derive cards from /asset-deposits/mine (always works via JWT)
    try {
      const deposits = await depositRequestService.getMyRequests('all')
      const cards = (deposits || []).map((d) => {
        const expected = Number(d.expectedTokens ?? 0)
        const status = String(d.custodyStatus || '').toLowerCase() === 'confirmed'
          ? 'WITH_PATIENT'
          : 'PENDING_BANK_APPROVAL'
        return {
          assetId: d.assetId,
          assignmentId: d.assetId,
          patientId: d.patientId,
          patientName: d.patientName,
          patientEmail: d.patientEmail,
          hospitalId: d.hospitalId,
          hospitalName: d.hospitalName,
          assetType: d.assetType,
          assetValue: Number(d.assetValue ?? 0),
          weight: d.weight,
          totalAtAssigned: expected,
          availableAt: status === 'WITH_PATIENT' ? expected : 0,
          unavailableAt: 0,
          availabilityStatus: status,
          tradingOptOut: false,
          monetaryValuePkr: Number(d.assetValue ?? 0),
          availableMonetaryValuePkr: status === 'WITH_PATIENT' ? Number(d.assetValue ?? 0) : 0,
          unavailableMonetaryValuePkr: 0,
          depositStatus: d.status,
          submittedAt: d.submittedAt,
          approvedAt: d.approvedAt,
          assignedAt: d.custodyConfirmedAt,
        } as unknown as LinkedAssetWithToken
      }).filter((c) => Number(c.totalAtAssigned) > 0)
      setAssetTokens(cards)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load asset tokens')
      console.error('[linked-assets] all attempts failed:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.patientId])

  useEffect(() => {
    if (user) {
      fetchAssetTokens()
    } else {
      setLoading(false)
    }
  }, [user, fetchAssetTokens])

  const getTotalAvailableAt = () =>
    assetTokens.reduce((sum, token) => sum + Number(token.availableAt || 0), 0)

  const getTotalUnavailableAt = () => getTotalAt() - getTotalAvailableAt()

  const getTotalAt = () =>
    assetTokens.reduce((sum, token) => sum + Number(token.totalAtAssigned || 0), 0)

  // Prefer the per-token PKR fields the backend already returns (computed with the live
  // AT price). Fall back to local conversion only if the field is missing.
  const getTotalMonetaryValuePkr = () =>
    assetTokens.reduce((sum, token) => {
      const pkr = Number(token.monetaryValuePkr ?? 0)
      if (pkr > 0) return sum + pkr
      return sum + Number(token.totalAtAssigned || 0) * tokenPricePerPkr
    }, 0)

  const renderAvailabilityBadge = (status: 'WITH_PATIENT' | 'AVAILABLE' | 'UNAVAILABLE' | 'PENDING_BANK_APPROVAL' | string) => {
    if (status === 'PENDING_BANK_APPROVAL') {
      return (
        <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
          <Clock className="w-3 h-3 mr-1" />
          Hospital Approved → Bank Review
        </Badge>
      )
    }
    const config = availabilityConfig[status as keyof typeof availabilityConfig]
    if (!config) return null

    const IconComponent = config.icon
    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Linked Asset Tokens</h1>
          <p className="text-gray-500 mt-1">View your asset tokens and their availability status</p>
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Linked Asset Tokens</h1>
        <p className="text-gray-500 mt-1">View your asset tokens and their availability status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total AT Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 truncate">
              {formatNumber(getTotalAt())}
            </div>
            <p className="text-xs text-gray-500 mt-2">Asset tokens assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available AT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 truncate">
              {formatNumber(getTotalAvailableAt())}
            </div>
            <p className="text-xs text-gray-500 mt-2">Ready to trade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Trade AT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 truncate">
              {formatNumber(getTotalUnavailableAt())}
            </div>
            <p className="text-xs text-gray-500 mt-2">Locked in trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monetary Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 truncate">
              PKR {formatNumber(getTotalMonetaryValuePkr())}
            </div>
            <p className="text-xs text-gray-500 mt-2">1 AT = {tokenPricePerPkr} PKR</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('combined')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'combined'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Combined View
        </button>
        <button
          onClick={() => setViewMode('tokens-only')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'tokens-only'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tokens Only
        </button>
      </div>

      {/* Asset Tokens List */}
      {assetTokens.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No Asset Tokens Found</h3>
            <p className="text-gray-500 mt-2">
              You haven&apos;t submitted any asset deposits yet or no tokens have been assigned.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assetTokens.map((token) => {
            const config = assetTypeConfig[token.assetType as keyof typeof assetTypeConfig] || { color: 'bg-white' }
            const isInTrade = (Number(token.totalAtAssigned || 0) - Number(token.availableAt || 0)) > 0
            const isPending = String(token.availabilityStatus) === 'PENDING_BANK_APPROVAL'

            return (
              <Card key={token.assignmentId || token.assetId} className={isPending ? 'border-yellow-200 bg-yellow-50' : config.color}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        {token.assetType && (
                          <Badge variant="outline" className="font-semibold">
                            {token.assetType}
                          </Badge>
                        )}
                        {renderAvailabilityBadge(token.availabilityStatus)}
                        {token.depositStatus && (
                          <Badge variant="secondary">{token.depositStatus}</Badge>
                        )}
                      </div>
                      {token.assetValue && (
                        <p className="text-sm text-gray-600 mt-2">
                          Asset Value: <span className="font-semibold">PKR {formatNumber(token.assetValue)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Token Assignment Details */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Token Assignment</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total AT</p>
                        <p className="text-lg font-bold text-blue-600">{formatNumber(token.totalAtAssigned)}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Available AT</p>
                        <p className="text-lg font-bold text-green-600">{formatNumber(token.availableAt)}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">In Trade AT</p>
                        <p className="text-lg font-bold text-orange-600">{formatNumber(Number(token.totalAtAssigned || 0) - Number(token.availableAt || 0))}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                        <p className="text-sm font-bold">
                          {String(token.availabilityStatus) === 'WITH_PATIENT' && <span className="text-amber-600">Pool 1 (Redeemable)</span>}
                          {String(token.availabilityStatus) === 'AVAILABLE' && <span className="text-green-600">Pool 2 (Trading)</span>}
                          {String(token.availabilityStatus) === 'UNAVAILABLE' && <span className="text-orange-600">In Trade</span>}
                          {String(token.availabilityStatus) === 'PENDING_BANK_APPROVAL' && <span className="text-blue-600">Pending Bank</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Monetary Value */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Monetary Value (PKR)</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Total Value</p>
                        <p className="text-lg font-bold text-purple-600">
                          {formatNumber(token.monetaryValuePkr)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600">Available Value</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatNumber(token.availableMonetaryValuePkr)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600">In Trade Value</p>
                        <p className="text-lg font-bold text-orange-600">
                          {formatNumber(
                            Number(token.unavailableMonetaryValuePkr ?? 0) > 0
                              ? Number(token.unavailableMonetaryValuePkr)
                              : (Number(token.totalAtAssigned || 0) - Number(token.availableAt || 0)) * tokenPricePerPkr,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Asset Details */}
                  {token.weight && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Asset Details</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Weight: </span>
                          <span className="font-semibold">{token.weight} g</span>
                        </div>
                        {token.submittedAt && (
                          <div>
                            <span className="text-gray-600">Submitted: </span>
                            <span className="font-semibold">{formatDate(token.submittedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  {(token.submittedAt || token.approvedAt || token.assignedAt) && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      {token.submittedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deposit Submitted:</span>
                          <span className="font-semibold">{formatDate(token.submittedAt)}</span>
                        </div>
                      )}
                      {token.approvedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hospital Approved:</span>
                          <span className="font-semibold text-green-600">{formatDate(token.approvedAt)}</span>
                        </div>
                      )}
                      {token.assignedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">AT Assigned:</span>
                          <span className="font-semibold text-blue-600">{formatDate(token.assignedAt)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Availability Indicator */}
                  {isInTrade && (
                    <Alert className="bg-orange-50 border-orange-200">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        <strong>{formatNumber(Number(token.totalAtAssigned || 0) - Number(token.availableAt || 0))} AT</strong> are currently locked in active trades and cannot be used until the trades are settled.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Pool 1 — AT minted but still with patient */}
                  {String(token.availabilityStatus) === 'WITH_PATIENT' && (
                    <>
                      <Alert className="bg-amber-50 border-amber-200">
                        <Coins className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          <strong>{formatNumber(token.totalAtAssigned)} AT</strong> are sitting in Pool 1 (Available Pool). They are
                          idle and fully redeemable through Emergency Redemption. Monthly baseline HT and profit share
                          will start once the hospital admin moves them into the Trading Pool.
                        </AlertDescription>
                      </Alert>

                      <div className={`rounded-md border p-3 flex items-start justify-between gap-3 ${token.tradingOptOut ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="flex items-start gap-2">
                          <ShieldOff className={`h-4 w-4 mt-0.5 ${token.tradingOptOut ? 'text-rose-700' : 'text-slate-500'}`} />
                          <div>
                            <p className={`text-sm font-medium ${token.tradingOptOut ? 'text-rose-800' : 'text-slate-700'}`}>
                              {token.tradingOptOut ? 'Excluded from trading' : 'Available for trading'}
                            </p>
                            <p className={`text-xs ${token.tradingOptOut ? 'text-rose-700' : 'text-slate-500'} mt-1`}>
                              {token.tradingOptOut
                                ? 'Hospital cannot move this AT into the Trading Pool while this flag is on.'
                                : 'Turn this on if you don’t want this asset used for trading. You can flip it back anytime while it is in Pool 1.'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={optOutToggling === String(token.assetId)}
                          onClick={() => handleToggleOptOut(String(token.assetId), Boolean(token.tradingOptOut))}
                          className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                            token.tradingOptOut
                              ? 'bg-rose-600 text-white hover:bg-rose-700'
                              : 'bg-slate-700 text-white hover:bg-slate-800'
                          } ${optOutToggling === String(token.assetId) ? 'opacity-60 cursor-wait' : ''}`}
                        >
                          {optOutToggling === String(token.assetId)
                            ? 'Saving...'
                            : token.tradingOptOut
                              ? 'Allow Trading'
                              : 'Block Trading'}
                        </button>
                      </div>
                    </>
                  )}

                  {/* Pool 2 — AT in trading pool */}
                  {String(token.availabilityStatus) === 'AVAILABLE' && (
                    <Alert className="bg-green-50 border-green-200">
                      <Unlock className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>{formatNumber(token.availableAt)} AT</strong> are in Pool 2 (Trading Pool). They are locked for
                        the trading cycle and earn monthly baseline HT plus a profit share at cycle end. Emergency
                        Redemption is no longer available against this AT.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
