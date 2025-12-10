'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TrendingUp, TrendingDown, Search, Star, Eye, BarChart3, Sparkles, CheckCircle, XCircle, Edit } from 'lucide-react'

interface MarketItem {
  id: string
  name: string
  category: 'healthcare' | 'dental' | 'vision' | 'pharmacy' | 'wellness' | 'mental_health'
  price: number
  priceChange24h: number
  volume24h: number
  description: string
  provider: string
  rating: number
  reviews: number
  trending?: boolean
  new?: boolean
  popular?: boolean
  status: 'active' | 'pending' | 'paused'
  totalSales: number
}

const mockMarketData: MarketItem[] = [
  {
    id: 'HC-001',
    name: 'Premium Health Checkup',
    category: 'healthcare',
    price: 2500,
    priceChange24h: 5.2,
    volume24h: 125000,
    description: 'Comprehensive health screening package',
    provider: 'Liaquat National Hospital',
    rating: 4.8,
    reviews: 234,
    trending: true,
    popular: true,
    status: 'active',
    totalSales: 456
  },
  {
    id: 'DN-001',
    name: 'Dental Cleaning & Whitening',
    category: 'dental',
    price: 1800,
    priceChange24h: -2.3,
    volume24h: 89000,
    description: 'Professional dental care service',
    provider: 'Smile Dental Clinic',
    rating: 4.6,
    reviews: 189,
    new: true,
    status: 'active',
    totalSales: 312
  },
  {
    id: 'VS-001',
    name: 'Eye Exam & Glasses',
    category: 'vision',
    price: 1200,
    priceChange24h: 3.1,
    volume24h: 67000,
    description: 'Complete vision care package',
    provider: 'Vision Care Center',
    rating: 4.7,
    reviews: 156,
    popular: true,
    status: 'active',
    totalSales: 278
  },
  {
    id: 'PH-001',
    name: 'Prescription Medications',
    category: 'pharmacy',
    price: 850,
    priceChange24h: 1.5,
    volume24h: 234000,
    description: '30-day supply of common medications',
    provider: 'MediCare Pharmacy',
    rating: 4.9,
    reviews: 567,
    trending: true,
    status: 'active',
    totalSales: 892
  },
  {
    id: 'WL-001',
    name: 'Fitness & Nutrition Plan',
    category: 'wellness',
    price: 3200,
    priceChange24h: 8.7,
    volume24h: 45000,
    description: '3-month personalized wellness program',
    provider: 'WellnessHub',
    rating: 4.5,
    reviews: 98,
    new: true,
    status: 'pending',
    totalSales: 145
  },
  {
    id: 'MH-001',
    name: 'Mental Health Counseling',
    category: 'mental_health',
    price: 1500,
    priceChange24h: 4.2,
    volume24h: 78000,
    description: '5 therapy sessions with licensed counselor',
    provider: 'MindCare Center',
    rating: 4.9,
    reviews: 432,
    trending: true,
    status: 'active',
    totalSales: 623
  }
]

export default function HospitalMarketplace() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null)

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'dental', label: 'Dental' },
    { value: 'vision', label: 'Vision' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'mental_health', label: 'Mental Health' }
  ]

  const filteredItems = mockMarketData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc': return a.price - b.price
      case 'price_desc': return b.price - a.price
      case 'volume': return b.volume24h - a.volume24h
      case 'sales': return b.totalSales - a.totalSales
      case 'gainers': return b.priceChange24h - a.priceChange24h
      default: return (b.rating * b.reviews) - (a.rating * a.reviews)
    }
  })

  const trendingItems = mockMarketData.filter(item => item.trending).slice(0, 3)
  const newItems = mockMarketData.filter(item => item.new).slice(0, 3)
  const topGainers = [...mockMarketData].sort((a, b) => b.priceChange24h - a.priceChange24h).slice(0, 3)
  const activeCount = mockMarketData.filter(item => item.status === 'active').length
  const pendingCount = mockMarketData.filter(item => item.status === 'pending').length
  const totalVolume = mockMarketData.reduce((sum, item) => sum + item.volume24h, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketplace Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage health benefit listings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Add New Listing
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold text-foreground mt-1">{activeCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-foreground mt-1">{pendingCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold text-foreground mt-1">{(totalVolume / 1000).toFixed(0)}K HT</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trending</p>
                <div className="flex items-center gap-2 mt-1">
                  {trendingItems.map(item => (
                    <Badge key={item.id} variant="outline" className="text-xs">
                      {item.name.split(' ')[0]}
                    </Badge>
                  ))}
                </div>
              </div>
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="sales">Total Sales</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="volume">24h Volume</SelectItem>
                <SelectItem value="gainers">Top Gainers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Marketplace Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Listings</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-3">
            {sortedItems.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          {item.trending && <Badge variant="outline" className="text-xs bg-yellow-50">Trending</Badge>}
                          {item.new && <Badge variant="outline" className="text-xs bg-blue-50">New</Badge>}
                          {item.popular && <Badge variant="outline" className="text-xs bg-green-50">Popular</Badge>}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              item.status === 'active' ? 'bg-green-50 text-green-700' : 
                              item.status === 'pending' ? 'bg-orange-50 text-orange-700' : 
                              'bg-gray-50 text-gray-700'
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{item.provider}</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {item.rating} ({item.reviews})
                          </span>
                          <Badge variant="outline" className="text-xs">{item.category.replace('_', ' ')}</Badge>
                          <span>Sales: {item.totalSales}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-lg text-foreground">{item.price.toLocaleString()} HT</p>
                        <div className={`flex items-center gap-1 text-sm ${item.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.priceChange24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {item.priceChange24h >= 0 ? '+' : ''}{item.priceChange24h.toFixed(2)}%
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">24h Volume</p>
                        <p className="font-semibold text-foreground">{(item.volume24h / 1000).toFixed(0)}K HT</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        {item.status === 'pending' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                        )}
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
            {sortedItems.filter(item => item.status === 'active').map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Sales: {item.totalSales}</span>
                          <span>Volume: {(item.volume24h / 1000).toFixed(0)}K HT</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {item.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-foreground">{item.price.toLocaleString()} HT</p>
                        <p className={`text-sm ${item.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.priceChange24h >= 0 ? '+' : ''}{item.priceChange24h.toFixed(2)}%
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pendingCount === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">No pending listings. All services are approved!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedItems.filter(item => item.status === 'pending').map(item => (
                <Card key={item.id} className="border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <XCircle className="w-5 h-5 text-orange-500" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          <Badge className="mt-2 bg-orange-100 text-orange-800">Awaiting Approval</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-foreground">{item.price.toLocaleString()} HT</p>
                          <p className="text-sm text-muted-foreground">{item.provider}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...mockMarketData].sort((a, b) => b.totalSales - a.totalSales).slice(0, 5).map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.totalSales}</p>
                        <p className="text-xs text-muted-foreground">sales</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.slice(1).map(cat => {
                    const count = mockMarketData.filter(item => item.category === cat.value).length
                    const percentage = (count / mockMarketData.length) * 100
                    return (
                      <div key={cat.value}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{cat.label}</span>
                          <span className="text-sm text-muted-foreground">{count} listings</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.slice(1).map(cat => {
                    const revenue = mockMarketData
                      .filter(item => item.category === cat.value)
                      .reduce((sum, item) => sum + (item.price * item.totalSales), 0)
                    return (
                      <div key={cat.value} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium">{cat.label}</span>
                        <span className="font-bold text-green-600">{(revenue / 1000).toFixed(1)}K HT</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Rated Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...mockMarketData].sort((a, b) => b.rating - a.rating).slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.reviews} reviews</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{item.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedItem.name}</DialogTitle>
                <DialogDescription>{selectedItem.provider}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Status and Price */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-3xl font-bold text-foreground">{selectedItem.price.toLocaleString()} HT</p>
                    <div className={`flex items-center gap-1 text-sm mt-1 ${selectedItem.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedItem.priceChange24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {selectedItem.priceChange24h >= 0 ? '+' : ''}{selectedItem.priceChange24h.toFixed(2)}% (24h)
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      className={`text-sm ${
                        selectedItem.status === 'active' ? 'bg-green-100 text-green-800' : 
                        selectedItem.status === 'pending' ? 'bg-orange-100 text-orange-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedItem.status}
                    </Badge>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold">{selectedItem.rating}</span>
                      <span className="text-sm text-muted-foreground ml-1">({selectedItem.reviews})</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedItem.description}</p>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold text-foreground">{selectedItem.totalSales}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <p className="text-2xl font-bold text-foreground">{(selectedItem.volume24h / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold text-foreground">{((selectedItem.price * selectedItem.totalSales) / 1000).toFixed(0)}K</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Category</h3>
                    <Badge variant="outline">{selectedItem.category.replace('_', ' ')}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Provider</h3>
                    <p className="text-muted-foreground">{selectedItem.provider}</p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex gap-2">
                    {selectedItem.trending && <Badge className="bg-yellow-100 text-yellow-800">Trending</Badge>}
                    {selectedItem.new && <Badge className="bg-blue-100 text-blue-800">New</Badge>}
                    {selectedItem.popular && <Badge className="bg-green-100 text-green-800">Popular</Badge>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedItem(null)}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Listing
                  </Button>
                  {selectedItem.status === 'pending' && (
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => setSelectedItem(null)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
