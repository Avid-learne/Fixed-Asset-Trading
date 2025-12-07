'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TrendingUp, TrendingDown, Search, DollarSign, Users, Building2, Activity, Coins, Shield } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface AssetListing {
  id: string
  name: string
  type: 'equipment' | 'real_estate' | 'receivables' | 'patents'
  price: number
  priceChange24h: number
  volume24h: number
  marketCap: number
  totalSupply: number
  circulatingSupply: number
  apy: number
  status: 'active' | 'pending' | 'funded'
  fundingProgress?: number
}

const mockAssetData: AssetListing[] = [
  {
    id: 'AST-001',
    name: 'MRI Equipment Token',
    type: 'equipment',
    price: 25000,
    priceChange24h: 3.2,
    volume24h: 850000,
    marketCap: 12500000,
    totalSupply: 500,
    circulatingSupply: 400,
    apy: 8.5,
    status: 'active',
    fundingProgress: 100
  },
  {
    id: 'AST-002',
    name: 'Medical Building A',
    type: 'real_estate',
    price: 450000,
    priceChange24h: 1.8,
    volume24h: 2250000,
    marketCap: 45000000,
    totalSupply: 100,
    circulatingSupply: 85,
    apy: 6.2,
    status: 'active',
    fundingProgress: 100
  },
  {
    id: 'AST-003',
    name: 'Patient Receivables Q1',
    type: 'receivables',
    price: 75000,
    priceChange24h: -1.2,
    volume24h: 1125000,
    marketCap: 18750000,
    totalSupply: 250,
    circulatingSupply: 220,
    apy: 11.2,
    status: 'active',
    fundingProgress: 100
  },
  {
    id: 'AST-004',
    name: 'Surgical Robotics Patent',
    type: 'patents',
    price: 180000,
    priceChange24h: 5.4,
    volume24h: 540000,
    marketCap: 5400000,
    totalSupply: 30,
    circulatingSupply: 25,
    apy: 9.8,
    status: 'pending',
    fundingProgress: 65
  },
  {
    id: 'AST-005',
    name: 'CT Scanner Fleet',
    type: 'equipment',
    price: 35000,
    priceChange24h: 2.1,
    volume24h: 630000,
    marketCap: 10500000,
    totalSupply: 300,
    circulatingSupply: 280,
    apy: 7.9,
    status: 'active',
    fundingProgress: 100
  }
]

const performanceData = [
  { month: 'Jul', equipment: 8200, real_estate: 12500, receivables: 6800 },
  { month: 'Aug', equipment: 9100, real_estate: 13200, receivables: 7200 },
  { month: 'Sep', equipment: 8900, real_estate: 14100, receivables: 7800 },
  { month: 'Oct', equipment: 10200, real_estate: 15300, receivables: 8400 },
  { month: 'Nov', equipment: 11500, real_estate: 16800, receivables: 9100 },
  { month: 'Dec', equipment: 12800, real_estate: 18200, receivables: 9800 }
]

export default function HospitalAdminMarketplace() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('volume')
  const [selectedAsset, setSelectedAsset] = useState<AssetListing | null>(null)

  const assetTypes = [
    { value: 'all', label: 'All Assets' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'receivables', label: 'Receivables' },
    { value: 'patents', label: 'Patents' }
  ]

  const filteredAssets = mockAssetData.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || asset.type === selectedType
    return matchesSearch && matchesType
  })

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'price': return b.price - a.price
      case 'apy': return b.apy - a.apy
      case 'gainers': return b.priceChange24h - a.priceChange24h
      default: return b.volume24h - a.volume24h
    }
  })

  const totalMarketCap = mockAssetData.reduce((sum, asset) => sum + asset.marketCap, 0)
  const totalVolume24h = mockAssetData.reduce((sum, asset) => sum + asset.volume24h, 0)
  const avgAPY = mockAssetData.reduce((sum, asset) => sum + asset.apy, 0) / mockAssetData.length
  const activeListings = mockAssetData.filter(a => a.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asset Tokenization Marketplace</h1>
          <p className="text-muted-foreground mt-1">Manage and trade tokenized hospital assets</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Coins className="w-4 h-4 mr-2" />
            Create Asset
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Market Cap</p>
                <p className="text-2xl font-bold mt-1">${(totalMarketCap / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-600 mt-1">+12.5% this month</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold mt-1">${(totalVolume24h / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-600 mt-1">+8.3% from yesterday</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average APY</p>
                <p className="text-2xl font-bold mt-1">{avgAPY.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Across all assets</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold mt-1">{activeListings}</p>
                <p className="text-xs text-muted-foreground mt-1">{mockAssetData.length - activeListings} pending</p>
              </div>
              <Building2 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>6-Month Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="equipment" stroke="#3b82f6" strokeWidth={2} name="Equipment" />
              <Line type="monotone" dataKey="real_estate" stroke="#10b981" strokeWidth={2} name="Real Estate" />
              <Line type="monotone" dataKey="receivables" stroke="#f59e0b" strokeWidth={2} name="Receivables" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volume">24h Volume</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="apy">APY</SelectItem>
                <SelectItem value="gainers">Top Gainers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Asset Listings */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Assets</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="funded">Fully Funded</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-3">
            {sortedAssets.map(asset => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Coins className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{asset.name}</h3>
                          <Badge variant="outline" className={
                            asset.status === 'active' ? 'bg-green-50 text-green-700' :
                            asset.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-blue-50 text-blue-700'
                          }>
                            {asset.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Supply: {asset.circulatingSupply}/{asset.totalSupply}</span>
                          <span>Market Cap: ${(asset.marketCap / 1000000).toFixed(1)}M</span>
                          <Badge variant="outline" className="text-xs">{asset.type.replace('_', ' ')}</Badge>
                        </div>
                        {asset.fundingProgress && asset.fundingProgress < 100 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${asset.fundingProgress}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{asset.fundingProgress}% funded</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-lg text-foreground">${asset.price.toLocaleString()}</p>
                        <div className={`flex items-center gap-1 text-sm ${asset.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {asset.priceChange24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">24h Volume</p>
                        <p className="font-semibold text-foreground">${(asset.volume24h / 1000).toFixed(0)}K</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">APY</p>
                        <p className="font-semibold text-green-600">{asset.apy.toFixed(1)}%</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAsset(asset)}
                        >
                          View Details
                        </Button>
                        <Button size="sm">Manage</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-3">
            {sortedAssets.filter(asset => asset.status === 'active').map(asset => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{asset.name}</h3>
                        <p className="text-sm text-muted-foreground">APY: {asset.apy.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-foreground">${asset.price.toLocaleString()}</p>
                        <p className="text-sm text-green-600">+{asset.priceChange24h.toFixed(2)}%</p>
                      </div>
                      <Button size="sm">Trade</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-3">
            {sortedAssets.filter(asset => asset.status === 'pending').map(asset => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{asset.name}</h3>
                        <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${asset.fundingProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{asset.fundingProgress}% funded</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-foreground">${asset.price.toLocaleString()}</p>
                        <Badge className="mt-1 bg-yellow-100 text-yellow-800">Pending Approval</Badge>
                      </div>
                      <Button size="sm">Review</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="funded" className="mt-6">
          <div className="space-y-3">
            {sortedAssets.filter(asset => asset.fundingProgress === 100).map(asset => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Coins className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{asset.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {asset.circulatingSupply}/{asset.totalSupply} tokens circulating
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-foreground">${asset.price.toLocaleString()}</p>
                        <Badge className="mt-1 bg-blue-100 text-blue-800">Fully Funded</Badge>
                      </div>
                      <Button size="sm">View Stats</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Asset Details Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-3xl">
          {selectedAsset && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedAsset.name}</DialogTitle>
                <DialogDescription>Asset ID: {selectedAsset.id}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Price and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-3xl font-bold mt-1">${selectedAsset.price.toLocaleString()}</p>
                    <div className={`flex items-center gap-1 text-sm mt-1 ${selectedAsset.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAsset.priceChange24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {selectedAsset.priceChange24h >= 0 ? '+' : ''}{selectedAsset.priceChange24h.toFixed(2)}% (24h)
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={`mt-2 text-lg ${
                      selectedAsset.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedAsset.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedAsset.status.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">APY: {selectedAsset.apy.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Asset Details Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Asset Type</h3>
                    <Badge variant="outline">{selectedAsset.type.replace('_', ' ')}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Market Cap</h3>
                    <p className="text-muted-foreground">${(selectedAsset.marketCap / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">24h Volume</h3>
                    <p className="text-muted-foreground">${(selectedAsset.volume24h / 1000).toFixed(0)}K</p>
                  </div>
                </div>

                {/* Supply Information */}
                <div>
                  <h3 className="font-semibold mb-3">Token Supply</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Supply</p>
                      <p className="text-xl font-bold mt-1">{selectedAsset.totalSupply.toLocaleString()}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Circulating Supply</p>
                      <p className="text-xl font-bold mt-1">{selectedAsset.circulatingSupply.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full" 
                        style={{ width: `${(selectedAsset.circulatingSupply / selectedAsset.totalSupply * 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {((selectedAsset.circulatingSupply / selectedAsset.totalSupply) * 100).toFixed(1)}% in circulation
                    </p>
                  </div>
                </div>

                {/* Funding Progress */}
                {selectedAsset.fundingProgress && selectedAsset.fundingProgress < 100 && (
                  <div>
                    <h3 className="font-semibold mb-3">Funding Progress</h3>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-green-600 h-4 rounded-full" 
                        style={{ width: `${selectedAsset.fundingProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedAsset.fundingProgress}% funded • ${((selectedAsset.marketCap * selectedAsset.fundingProgress) / 100 / 1000000).toFixed(2)}M raised
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <Activity className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Users className="w-4 h-4 mr-2" />
                    Investor List
                  </Button>
                  <Button className="flex-1">
                    <Shield className="w-4 h-4 mr-2" />
                    Manage Asset
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
