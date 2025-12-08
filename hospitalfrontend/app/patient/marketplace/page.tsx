'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TrendingUp, TrendingDown, Search, Star, Filter, Heart, ShoppingCart, Sparkles, X } from 'lucide-react'

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
    popular: true
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
    new: true
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
    popular: true
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
    trending: true
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
    new: true
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
    trending: true
  }
]

export default function PatientMarketplace() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [favorites, setFavorites] = useState<string[]>([])
  const [cart, setCart] = useState<string[]>([])
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
      case 'gainers': return b.priceChange24h - a.priceChange24h
      default: return (b.rating * b.reviews) - (a.rating * a.reviews)
    }
  })

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const toggleCart = (id: string) => {
    setCart(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const trendingItems = mockMarketData.filter(item => item.trending).slice(0, 3)
  const newItems = mockMarketData.filter(item => item.new).slice(0, 3)
  const topGainers = [...mockMarketData].sort((a, b) => b.priceChange24h - a.priceChange24h).slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Health Benefits Marketplace</h1>
          <p className="text-muted-foreground mt-1">Browse and purchase healthcare services with HT tokens</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="relative">
            <Heart className="w-4 h-4 mr-2" />
            Favorites
            {favorites.length > 0 && (
              <Badge className="ml-2 bg-red-500">{favorites.length}</Badge>
            )}
          </Button>
          <Button className="relative">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart
            {cart.length > 0 && (
              <Badge className="ml-2 bg-green-500">{cart.length}</Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Listings</p>
                <div className="flex items-center gap-2 mt-1">
                  {newItems.map(item => (
                    <Badge key={item.id} variant="outline" className="text-xs bg-blue-50">
                      {item.name.split(' ')[0]}
                    </Badge>
                  ))}
                </div>
              </div>
              <Star className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Gainers</p>
                <div className="flex items-center gap-2 mt-1">
                  {topGainers.map(item => (
                    <Badge key={item.id} className="text-xs bg-green-100 text-green-800">
                      +{item.priceChange24h.toFixed(1)}%
                    </Badge>
                  ))}
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="cart">Cart ({cart.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-3">
            {sortedItems.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Heart
                          className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                        />
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          {item.trending && <Badge variant="outline" className="text-xs bg-yellow-50">Trending</Badge>}
                          {item.new && <Badge variant="outline" className="text-xs bg-blue-50">New</Badge>}
                          {item.popular && <Badge variant="outline" className="text-xs bg-green-50">Popular</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{item.provider}</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {item.rating} ({item.reviews})
                          </span>
                          <Badge variant="outline" className="text-xs">{item.category.replace('_', ' ')}</Badge>
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
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCart(item.id)}
                          className={cart.includes(item.id) ? 'bg-green-50 border-green-500' : ''}
                        >
                          {cart.includes(item.id) ? 'In Cart' : 'Add to Cart'}
                        </Button>
                        <Button size="sm">Buy Now</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="mt-6">
          <div className="space-y-3">
            {sortedItems.filter(item => item.trending).map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-foreground">{item.price.toLocaleString()} HT</p>
                        <p className="text-sm text-green-600">+{item.priceChange24h.toFixed(2)}%</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCart(item.id)}
                          className={cart.includes(item.id) ? 'bg-green-50 border-green-500' : ''}
                        >
                          {cart.includes(item.id) ? 'In Cart' : 'Add to Cart'}
                        </Button>
                        <Button size="sm" onClick={() => setSelectedItem(item)}>View</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <div className="space-y-3">
            {sortedItems.filter(item => item.new).map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Star className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-foreground">{item.price.toLocaleString()} HT</p>
                        <Badge className="mt-1 bg-blue-100 text-blue-800">New Listing</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCart(item.id)}
                          className={cart.includes(item.id) ? 'bg-green-50 border-green-500' : ''}
                        >
                          {cart.includes(item.id) ? 'In Cart' : 'Add to Cart'}
                        </Button>
                        <Button size="sm" onClick={() => setSelectedItem(item)}>View</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">No favorites yet. Start adding services you're interested in!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedItems.filter(item => favorites.includes(item.id)).map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => toggleFavorite(item.id)}>
                          <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                        </button>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.price.toLocaleString()} HT</p>
                        </div>
                      </div>
                      <Button size="sm">Purchase</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cart" className="mt-6">
          {cart.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">Your cart is empty. Add services to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {sortedItems.filter(item => cart.includes(item.id)).map(item => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold">{item.price.toLocaleString()} HT</p>
                          <Button variant="outline" size="sm" onClick={() => toggleCart(item.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      {sortedItems.filter(item => cart.includes(item.id)).reduce((sum, item) => sum + item.price, 0).toLocaleString()} HT
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Service Fee (2%)</span>
                    <span>
                      {(sortedItems.filter(item => cart.includes(item.id)).reduce((sum, item) => sum + item.price, 0) * 0.02).toLocaleString()} HT
                    </span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>
                      {(sortedItems.filter(item => cart.includes(item.id)).reduce((sum, item) => sum + item.price, 0) * 1.02).toLocaleString()} HT
                    </span>
                  </div>
                  <Button className="w-full mt-4" size="lg">
                    Checkout ({cart.length} items)
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
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
                {/* Price and Rating */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-3xl font-bold text-foreground">{selectedItem.price.toLocaleString()} HT</p>
                    <div className={`flex items-center gap-1 text-sm mt-1 ${selectedItem.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedItem.priceChange24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {selectedItem.priceChange24h >= 0 ? '+' : ''}{selectedItem.priceChange24h.toFixed(2)}% (24h)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold">{selectedItem.rating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedItem.reviews} reviews</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedItem.description}</p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Category</h3>
                    <Badge variant="outline">{selectedItem.category.replace('_', ' ')}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">24h Volume</h3>
                    <p className="text-muted-foreground">{(selectedItem.volume24h / 1000).toFixed(0)}K HT</p>
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
                    onClick={() => {
                      toggleFavorite(selectedItem.id)
                      setSelectedItem(null)
                    }}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${favorites.includes(selectedItem.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    {favorites.includes(selectedItem.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      toggleCart(selectedItem.id)
                      setSelectedItem(null)
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {cart.includes(selectedItem.id) ? 'Remove from Cart' : 'Add to Cart'}
                  </Button>
                  <Button className="flex-1" onClick={() => setSelectedItem(null)}>
                    Buy Now
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
