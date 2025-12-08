// hospitalfrontend/app/bank/assets/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Building2, Lock, Eye, Archive } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

type AssetStatus = 'secured' | 'pending' | 'released'

interface Asset {
  id: string
  hospitalName: string
  assetType: string
  description: string
  valuation: number
  fundingProvided: number
  status: AssetStatus
  storageLocation: string
  depositDate: string
}

export default function AssetCustodyPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [assetFilter, setAssetFilter] = useState('all')

  const handleViewAsset = (asset: Asset) => {
    alert(`Asset Details:\n\nID: ${asset.id}\nHospital: ${asset.hospitalName}\nType: ${asset.description}\nValue: $${asset.valuation.toLocaleString()}\nFunding: $${asset.fundingProvided.toLocaleString()}\nLocation: ${asset.storageLocation}\nStatus: ${asset.status}\n\nIn production, this would open a detailed modal.`)
  }

  // Mock data for assets in custody
  const assetsInCustody: Asset[] = [
    {
      id: 'AST-001',
      hospitalName: 'Liaquat National Hospital',
      assetType: 'Gold',
      description: '100g Gold Bars (99.9% purity)',
      valuation: 520000,
      fundingProvided: 416000,
      status: 'secured',
      storageLocation: 'Vault A-12',
      depositDate: '2024-11-15'
    },
    {
      id: 'AST-002',
      hospitalName: 'Liaquat National Hospital',
      assetType: 'Silver',
      description: '500g Silver Bars (99.5% purity)',
      valuation: 180000,
      fundingProvided: 144000,
      status: 'secured',
      storageLocation: 'Vault B-05',
      depositDate: '2024-11-20'
    },
    {
      id: 'AST-003',
      hospitalName: 'Liaquat National Hospital',
      assetType: 'Gold',
      description: '75g Gold Coins',
      valuation: 390000,
      fundingProvided: 312000,
      status: 'secured',
      storageLocation: 'Vault A-08',
      depositDate: '2024-12-01'
    },
    {
      id: 'AST-004',
      hospitalName: 'Liaquat National Hospital',
      assetType: 'Gold',
      description: '120g Gold Bars',
      valuation: 624000,
      fundingProvided: 499200,
      status: 'pending',
      storageLocation: 'Processing',
      depositDate: '2024-12-07'
    },
    {
      id: 'AST-005',
      hospitalName: 'Liaquat National Hospital',
      assetType: 'Gold',
      description: '150g Gold Jewelry',
      valuation: 780000,
      fundingProvided: 624000,
      status: 'pending',
      storageLocation: 'Appraisal Dept',
      depositDate: '2024-12-08'
    },
    {
      id: 'AST-006',
      hospitalName: 'Liaquat National Hospital',
      assetType: 'Silver',
      description: '1kg Silver Coins',
      valuation: 360000,
      fundingProvided: 288000,
      status: 'pending',
      storageLocation: 'Verification',
      depositDate: '2024-12-07'
    },
  ]

  const totalValue = assetsInCustody.reduce((sum, asset) => sum + asset.valuation, 0)
  const totalFunding = assetsInCustody.reduce((sum, asset) => sum + asset.fundingProvided, 0)
  const securedAssets = assetsInCustody.filter(a => a.status === 'secured').length
  const pendingAssets = assetsInCustody.filter(a => a.status === 'pending').length

  const filteredAssets = assetsInCustody.filter(asset => {
    const matchesSearch = asset.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = assetFilter === 'all' || asset.assetType.toLowerCase() === assetFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'secured':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><Lock className="w-3 h-3 mr-1" />Secured</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'released':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Released</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Asset Custody</h1>
        <p className="text-muted-foreground mt-1">Physical assets held in secure bank vaults</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Asset Value</CardTitle>
            <Archive className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">In secure custody</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Secured Assets</CardTitle>
            <Lock className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{securedAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">In vault storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Funding Provided</CardTitle>
            <Building2 className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalFunding)}</div>
            <p className="text-xs text-muted-foreground mt-1">To hospitals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Processing</CardTitle>
            <Archive className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingAssets}</div>
            <p className="text-xs text-orange-600 mt-1">Awaiting vault storage</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assets in Custody</CardTitle>
          <CardDescription>Physical assets stored in bank vaults</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by hospital, asset type, or ID..."
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
              <Button
                variant={assetFilter === 'gold' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAssetFilter('gold')}
              >
                Gold
              </Button>
              <Button
                variant={assetFilter === 'silver' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAssetFilter('silver')}
              >
                Silver
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset ID</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Valuation</TableHead>
                <TableHead>Funding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No assets found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.id}</TableCell>
                    <TableCell>{asset.hospitalName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.assetType}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">{asset.description}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(asset.valuation)}</TableCell>
                    <TableCell className="text-green-600">{formatCurrency(asset.fundingProvided)}</TableCell>
                    <TableCell>{getStatusBadge(asset.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{asset.storageLocation}</TableCell>
                    <TableCell>{asset.depositDate}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleViewAsset(asset)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}