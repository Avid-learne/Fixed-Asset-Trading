'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Search, Building2, Users, Coins, DollarSign, Activity, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MarketOverview {
  id: string
  category: 'hospital' | 'bank' | 'patient' | 'token'
  name: string
  value: number
  change24h: number
  volume24h: number
  participants: number
  status: 'healthy' | 'warning' | 'critical'
}

const mockMarketData: MarketOverview[] = [
  {
    id: 'MKT-001',
    category: 'hospital',
    name: 'Hospital Asset Tokens (AT)',
    value: 86500000,
    change24h: 3.2,
    volume24h: 3450000,
    participants: 28,
    status: 'healthy'
  },
  {
    id: 'MKT-002',
    category: 'patient',
    name: 'Health Benefit Tokens (HT)',
    value: 12450000,
    change24h: 1.8,
    volume24h: 890000,
    participants: 1240,
    status: 'healthy'
  },
  {
    id: 'MKT-003',
    category: 'bank',
    name: 'Investment Funding',
    value: 45200000,
    change24h: -0.5,
    volume24h: 1820000,
    participants: 12,
    status: 'healthy'
  },
  {
    id: 'MKT-004',
    category: 'token',
    name: 'Equipment Tokenization',
    value: 32800000,
    change24h: 5.4,
    volume24h: 1560000,
    participants: 18,
    status: 'healthy'
  },
  {
    id: 'MKT-005',
    category: 'token',
    name: 'Real Estate Tokens',
    value: 28900000,
    change24h: 2.1,
    volume24h: 980000,
    participants: 15,
    status: 'healthy'
  },
  {
    id: 'MKT-006',
    category: 'hospital',
    name: 'Receivables Pool',
    value: 8200000,
    change24h: 7.8,
    volume24h: 450000,
    participants: 22,
    status: 'warning'
  }
]

const marketVolumeData = [
  { month: 'Jul', hospitals: 2800000, patients: 650000, banks: 1450000 },
  { month: 'Aug', hospitals: 3100000, patients: 720000, banks: 1580000 },
  { month: 'Sep', hospitals: 2950000, patients: 780000, banks: 1620000 },
  { month: 'Oct', hospitals: 3250000, patients: 810000, banks: 1750000 },
  { month: 'Nov', hospitals: 3400000, patients: 850000, banks: 1800000 },
  { month: 'Dec', hospitals: 3450000, patients: 890000, banks: 1820000 }
]

const categoryDistribution = [
  { name: 'Hospital Assets', value: 42, amount: 86500000 },
  { name: 'Bank Investments', value: 22, amount: 45200000 },
  { name: 'Equipment', value: 16, amount: 32800000 },
  { name: 'Real Estate', value: 14, amount: 28900000 },
  { name: 'Patient Benefits', value: 6, amount: 12450000 }
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

interface Transaction {
  id: string
  type: 'mint' | 'trade' | 'redeem' | 'transfer'
  from: string
  to: string
  amount: number
  tokenType: 'AT' | 'HT'
  timestamp: string
  status: 'success' | 'pending' | 'failed'
}

const recentTransactions: Transaction[] = [
  {
    id: 'TX-001',
    type: 'mint',
    from: 'City General Hospital',
    to: 'Asset Pool',
    amount: 125000,
    tokenType: 'AT',
    timestamp: '2 min ago',
    status: 'success'
  },
  {
    id: 'TX-002',
    type: 'trade',
    from: 'First National Bank',
    to: 'Investment Pool',
    amount: 450000,
    tokenType: 'AT',
    timestamp: '5 min ago',
    status: 'success'
  },
  {
    id: 'TX-003',
    type: 'redeem',
    from: 'John Doe (Patient)',
    to: 'Benefits Provider',
    amount: 2500,
    tokenType: 'HT',
    timestamp: '12 min ago',
    status: 'success'
  },
  {
    id: 'TX-004',
    type: 'transfer',
    from: 'Metro Medical',
    to: 'Regional Health Bank',
    amount: 850000,
    tokenType: 'AT',
    timestamp: '18 min ago',
    status: 'pending'
  }
]

export default function AdminMarketplace() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('volume')
  const [timeframe, setTimeframe] = useState('24h')

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'hospital', label: 'Hospital Assets' },
    { value: 'bank', label: 'Bank Investments' },
    { value: 'patient', label: 'Patient Benefits' },
    { value: 'token', label: 'Token Markets' }
  ]

  const filteredMarkets = mockMarketData.filter(market => {
    const matchesSearch = market.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || market.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    switch (sortBy) {
      case 'value': return b.value - a.value
      case 'change': return b.change24h - a.change24h
      case 'participants': return b.participants - a.participants
      default: return b.volume24h - a.volume24h
    }
  })

  const totalMarketValue = mockMarketData.reduce((sum, m) => sum + m.value, 0)
  const totalVolume24h = mockMarketData.reduce((sum, m) => sum + m.volume24h, 0)
  const totalParticipants = mockMarketData.reduce((sum, m) => sum + m.participants, 0)
  const avgChange = (mockMarketData.reduce((sum, m) => sum + m.change24h, 0) / mockMarketData.length).toFixed(2)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marketplace Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor all market activities across the platform</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Market Value</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  ${(totalMarketValue / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-green-600 mt-1">+{avgChange}% avg</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
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
                <p className="text-xs text-blue-600 mt-1">Across all markets</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Participants</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalParticipants}</p>
                <p className="text-xs text-purple-600 mt-1">Hospitals & Banks</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Health</p>
                <p className="text-2xl font-bold text-green-600 mt-1">Healthy</p>
                <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Volume Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marketVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="hospitals" fill="#3B82F6" name="Hospitals" />
                <Bar dataKey="patients" fill="#10B981" name="Patients" />
                <Bar dataKey="banks" fill="#F59E0B" name="Banks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any, name: any, props: any) => [`$${props.payload.amount.toLocaleString()}`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
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
                <SelectItem value="volume">24h Volume</SelectItem>
                <SelectItem value="value">Market Value</SelectItem>
                <SelectItem value="change">Price Change</SelectItem>
                <SelectItem value="participants">Participants</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Market Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedMarkets.map(market => (
              <div key={market.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {market.category.substring(0, 2).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{market.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {market.category}
                      </Badge>
                      {market.status === 'healthy' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {market.status === 'warning' && (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {market.participants} participants
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground">
                      ${(market.value / 1000000).toFixed(1)}M
                    </p>
                    <div className={`flex items-center gap-1 text-sm ${market.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {market.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <p className="font-semibold text-foreground">
                      ${(market.volume24h / 1000000).toFixed(2)}M
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button size="sm">Manage</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {tx.type.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{tx.from} → {tx.to}</p>
                    <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{tx.amount.toLocaleString()} {tx.tokenType}</p>
                    <p className="text-xs text-muted-foreground">${(tx.amount * 1).toLocaleString()}</p>
                  </div>
                  {tx.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {tx.status === 'pending' && (
                    <Activity className="w-5 h-5 text-yellow-500 animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
