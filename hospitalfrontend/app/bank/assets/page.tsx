'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Lock, Archive, RefreshCw, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { depositRequestService, AssetDepositItem } from '@/services/depositRequestService'

export default function AssetCustodyPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [assetFilter, setAssetFilter] = useState('all')
  const [assets, setAssets] = useState<AssetDepositItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAssets = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await depositRequestService.getBankRequests('approved')
      setAssets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const totalValue = assets.reduce((sum, a) => sum + (a.assetValue || 0), 0)
  const totalAssets = assets.length
  const assetTypes = [...new Set(assets.map(a => a.assetType?.toUpperCase()).filter(Boolean))]

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      (asset.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.hospitalName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.assetType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.assetId || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = assetFilter === 'all' || (asset.assetType || '').toLowerCase() === assetFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asset Custody</h1>
          <p className="text-muted-foreground mt-1">Bank-approved assets from integrated hospitals</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAssets} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Asset Value</CardTitle>
            <Archive className="w-5 h-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved deposits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Assets</CardTitle>
            <Lock className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">In custody</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total AT Minted</CardTitle>
            <Archive className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {assets.reduce((sum, a) => sum + (a.expectedTokens || 0), 0).toLocaleString()} AT
            </div>
            <p className="text-xs text-muted-foreground mt-1">From approved deposits</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approved Deposits</CardTitle>
          <CardDescription>Assets approved by bank from integrated hospitals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient, hospital, type, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={assetFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAssetFilter('all')}
              >
                All
              </Button>
              {assetTypes.map((type) => (
                <Button
                  key={type}
                  variant={assetFilter.toUpperCase() === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAssetFilter(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading assets...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Value (PKR)</TableHead>
                  <TableHead>AT Minted</TableHead>
                  <TableHead>Approved On</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No approved assets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map((asset) => (
                    <TableRow key={asset.assetId}>
                      <TableCell>
                        <div className="font-medium">{asset.patientName}</div>
                        <div className="text-xs text-muted-foreground">{asset.patientEmail}</div>
                      </TableCell>
                      <TableCell>{asset.hospitalName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{asset.assetType}</Badge>
                      </TableCell>
                      <TableCell>{asset.weight}g</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(asset.assetValue)}</TableCell>
                      <TableCell className="text-emerald-600 font-medium">
                        {(asset.expectedTokens || 0).toLocaleString()} AT
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {asset.bankApprovedAt ? formatDate(asset.bankApprovedAt) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Lock className="w-3 h-3 mr-1" />Approved
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
