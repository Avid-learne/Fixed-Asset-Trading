'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Search, Building2, Users, Coins, BarChart3, FileText } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AssetListing {
  id: string
  assetType: 'equipment' | 'real_estate' | 'receivables' | 'patents'
  name: string
  hospital: string
  price: number // in AT tokens
  priceChange24h: number
  volume24h: number
  marketCap: number
  totalSupply: number
  circulatingSupply: number
  status: 'active' | 'pending' | 'funded'
  apy: number
}

const mockAssetListings: AssetListing[] = [
  {
    id: 'AT-001',
    assetType: 'equipment',
    name: 'MRI Machine - Advanced 3T',
    hospital: 'City General Hospital',
    price: 125000,
    priceChange24h: 2.4,
    volume24h: 850000,
    marketCap: 12500000,
    totalSupply: 100,
    circulatingSupply: 75,
    status: 'active',
    apy: 8.5
  },
  {
    id: 'AT-002',
    assetType: 'real_estate',
    name: 'Medical Office Building',
    hospital: 'Metro Health Center',
    price: 450000,
    priceChange24h: -1.2,
    volume24h: 1200000,
    marketCap: 45000000,
    totalSupply: 100,
    circulatingSupply: 60,
    status: 'active',
    apy: 6.2
  },
  {
    id: 'AT-003',
    assetType: 'equipment',
    name: 'CT Scanner - Latest Gen',
    hospital: 'Regional Medical',
    price: 85000,
    priceChange24h: 5.8,
    volume24h: 680000,
    marketCap: 8500000,
    totalSupply: 100,
    circulatingSupply: 85,
    status: 'active',
    apy: 7.8
  },
  {
    id: 'AT-004',
    assetType: 'receivables',
    name: 'Patient Receivables Pool Q4',
    hospital: 'Sunrise Medical',
    price: 25000,
    priceChange24h: 3.2,
    volume24h: 450000,
    marketCap: 2500000,
    totalSupply: 100,
    circulatingSupply: 90,
    status: 'active',
    apy: 9.5
  },
  {
    id: 'AT-005',
    assetType: 'patents',
    name: 'Medical Device Patent Portfolio',
    hospital: 'Innovation Health',
    price: 180000,
    priceChange24h: 12.5,
    volume24h: 320000,
    marketCap: 18000000,
    totalSupply: 100,
    circulatingSupply: 45,
    status: 'pending',
    apy: 11.2
  }
]

const performanceData = [
  { month: 'Jul', equipment: 125000, real_estate: 420000, receivables: 23000 },
  { month: 'Aug', equipment: 132000, real_estate: 435000, receivables: 24500 },
  { month: 'Sep', equipment: 128000, real_estate: 445000, receivables: 25200 },
  { month: 'Oct', equipment: 135000, real_estate: 450000, receivables: 26000 },
  { month: 'Nov', equipment: 142000, real_estate: 458000, receivables: 27500 },
  { month: 'Dec', equipment: 145000, real_estate: 465000, receivables: 28200 }
]

export default function HospitalMarketplace() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('volume')

  const assetTypes = [
    { value: 'all', label: 'All Assets' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'receivables', label: 'Receivables' },
    { value: 'patents', label: 'Patents' }
  ]

  const filteredAssets = mockAssetListings.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.hospital.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || asset.assetType === selectedType
    return matchesSearch && matchesType
  })

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc': return a.price - b.price
      case 'price_desc': return b.price - a.price
      case 'apy': return b.apy - a.apy
      case 'gainers': return b.priceChange24h - a.priceChange24h
      default: return b.volume24h - a.volume24h
    }
  })

  const totalMarketCap = mockAssetListings.reduce((sum, asset) => sum + asset.marketCap, 0)
  const totalVolume24h = mockAssetListings.reduce((sum, asset) => sum + asset.volume24h, 0)
  const avgAPY = (mockAssetListings.reduce((sum, asset) => sum + asset.apy, 0) / mockAssetListings.length).toFixed(2)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Asset Tokenization Marketplace</h1>
        <p className="text-muted-foreground mt-1">Trade tokenized hospital assets and manage your portfolio</p>
      </div>

      {/* Market Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Market Cap</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  ${(totalMarketCap / 1000000).toFixed(1)}M
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  ${(totalVolume24h / 1000000).toFixed(1)}M
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg APY</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{avgAPY}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {mockAssetListings.filter(a => a.status === 'active').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Price Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="equipment" stroke="#3B82F6" strokeWidth={2} name="Equipment" />
              <Line type="monotone" dataKey="real_estate" stroke="#10B981" strokeWidth={2} name="Real Estate" />
              <Line type="monotone" dataKey="receivables" stroke="#F59E0B" strokeWidth={2} name="Receivables" />
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
                placeholder="Search assets or hospitals..."
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
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="apy">APY: High to Low</SelectItem>
                <SelectItem value="gainers">Top Gainers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Asset Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedAssets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {asset.assetType.substring(0, 2).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{asset.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {asset.assetType.replace('_', ' ')}
                      </Badge>
                      {asset.status === 'active' && (
                        <Badge className="text-xs bg-green-100 text-green-800">Active</Badge>
                      )}
                      {asset.status === 'pending' && (
                        <Badge className="text-xs bg-yellow-100 text-yellow-800">Pending</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{asset.hospital}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Supply: {asset.circulatingSupply}/{asset.totalSupply}</span>
                      <span>Market Cap: ${(asset.marketCap / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
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
                    <p className="font-semibold text-green-600">{asset.apy}%</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button size="sm">Trade</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
