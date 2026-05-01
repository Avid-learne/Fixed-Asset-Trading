'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Clock, Lock, Unlock } from 'lucide-react'
import { marketplaceService, PatientAssetToken } from '@/services/marketplaceService'

import { formatDate, formatNumber } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'



const assetTypeConfig = {
  GOLD: { label: 'Gold', color: 'bg-amber-50' },
  SILVER: { label: 'Silver', color: 'bg-slate-50' },
  CASH: { label: 'Cash', color: 'bg-green-50' },
  PROPERTY: { label: 'Property', color: 'bg-blue-50' }
}

const availabilityConfig = {
  AVAILABLE: { label: 'Available', color: 'bg-green-100 text-green-800', icon: Unlock },
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

  const fetchAssetTokens = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!user?.patientId) {
        throw new Error('Patient ID not available')
      }

      const tokens = await marketplaceService.getPatientAssetTokens(user.patientId)
      setAssetTokens(tokens as LinkedAssetWithToken[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load asset tokens')
      console.error('Error fetching asset tokens:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.patientId])

  useEffect(() => {
    console.log('LinkedAssets: user=', user)
    console.log('LinkedAssets: patientId=', user?.patientId)
    if (user?.patientId) {
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

  const renderAvailabilityBadge = (status: 'AVAILABLE' | 'UNAVAILABLE' | 'PENDING_BANK_APPROVAL' | string) => {
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
              PKR {formatNumber(getTotalAt() * 10)}
            </div>
            <p className="text-xs text-gray-500 mt-2">1 AT = 10 PKR</p>
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
                          {token.availabilityStatus === 'AVAILABLE' ? (
                            <span className="text-green-600">Available</span>
                          ) : (
                            <span className="text-orange-600">In Trade</span>
                          )}
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
                          {formatNumber((Number(token.totalAtAssigned || 0) - Number(token.availableAt || 0)) * 10)}
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
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
