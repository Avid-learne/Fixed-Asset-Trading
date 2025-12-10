'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Building2, Home, Landmark, Factory, Store, TrendingUp, TrendingDown, Search, ArrowLeft, BarChart3, MapPin, Clock, Info, Eye, Activity, ShieldCheck, Edit2, Users, type LucideIcon } from 'lucide-react'
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Investment types available for monitoring
type InvestmentType = {
  id: string
  name: string
  symbol: string
  icon: LucideIcon
  currentPrice: number
  change24h: number
  volume24h: number
  marketCap: number
  category: string
  description: string
  status: 'active' | 'pending' | 'suspended'
  approvedBy?: string
  approvedDate?: string
  totalPatients: number
}

// Trade data type for monitoring
type Trade = {
  id: string
  timestamp: Date
  type: 'BUY' | 'SELL'
  investment: string
  location: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  liquidity: number
  profitLoss: number
  status: 'OPEN' | 'CLOSED'
  patientId: string
  patientName: string
  notes: string
}

// Order book type
type OrderBookItem = {
  price: number
  volume: number
  total: number
  type: 'BID' | 'ASK'
}

// Investment categories with real estate and financial instruments
const INVESTMENT_TYPES: InvestmentType[] = [
  {
    id: 'commercial-real-estate',
    name: 'Commercial Real Estate',
    symbol: 'CRE',
    icon: Building2,
    currentPrice: 7850.25,
    change24h: 2.45,
    volume24h: 45000000,
    marketCap: 2800000000,
    category: 'Real Estate',
    description: 'Office buildings, retail spaces, and commercial properties',
    status: 'active',
    approvedBy: 'Admin Team',
    approvedDate: '2024-01-15',
    totalPatients: 234
  },
  {
    id: 'residential-property',
    name: 'Residential Property',
    symbol: 'RES',
    icon: Home,
    currentPrice: 4520.80,
    change24h: -1.23,
    volume24h: 32000000,
    marketCap: 1950000000,
    category: 'Real Estate',
    description: 'Apartments, houses, and residential units',
    status: 'active',
    approvedBy: 'Admin Team',
    approvedDate: '2024-01-10',
    totalPatients: 189
  },
  {
    id: 'government-bonds',
    name: 'Government Bonds',
    symbol: 'GOV',
    icon: Landmark,
    currentPrice: 1050.00,
    change24h: 0.15,
    volume24h: 85000000,
    marketCap: 5600000000,
    category: 'Bonds',
    description: 'Federal and state government securities',
    status: 'active',
    approvedBy: 'Admin Team',
    approvedDate: '2024-01-05',
    totalPatients: 567
  },
  {
    id: 'industrial-property',
    name: 'Industrial Property',
    symbol: 'IND',
    icon: Factory,
    currentPrice: 6320.50,
    change24h: 3.82,
    volume24h: 28000000,
    marketCap: 1450000000,
    category: 'Real Estate',
    description: 'Warehouses, factories, and industrial facilities',
    status: 'active',
    approvedBy: 'Admin Team',
    approvedDate: '2024-01-20',
    totalPatients: 156
  },
  {
    id: 'retail-spaces',
    name: 'Retail Spaces',
    symbol: 'RET',
    icon: Store,
    currentPrice: 3890.30,
    change24h: -2.10,
    volume24h: 19000000,
    marketCap: 980000000,
    category: 'Real Estate',
    description: 'Shopping centers, malls, and retail outlets',
    status: 'active',
    approvedBy: 'Admin Team',
    approvedDate: '2024-01-12',
    totalPatients: 98
  },
  {
    id: 'corporate-bonds',
    name: 'Corporate Bonds',
    symbol: 'COR',
    icon: Landmark,
    currentPrice: 980.75,
    change24h: 0.85,
    volume24h: 62000000,
    marketCap: 4200000000,
    category: 'Bonds',
    description: 'Investment-grade corporate debt securities',
    status: 'pending',
    approvedBy: undefined,
    approvedDate: undefined,
    totalPatients: 0
  },
  {
    id: 'land-development',
    name: 'Land Development',
    symbol: 'LND',
    icon: Building2,
    currentPrice: 5640.90,
    change24h: 4.25,
    volume24h: 21000000,
    marketCap: 1120000000,
    category: 'Real Estate',
    description: 'Undeveloped land and development projects',
    status: 'active',
    approvedBy: 'Admin Team',
    approvedDate: '2024-01-18',
    totalPatients: 145
  },
  {
    id: 'office-space',
    name: 'Office Space',
    symbol: 'OFC',
    icon: Building2,
    currentPrice: 6890.40,
    change24h: 1.67,
    volume24h: 35000000,
    marketCap: 2100000000,
    category: 'Real Estate',
    description: 'Class A and B office buildings',
    status: 'active',
    approvedBy: 'Admin Team',
    approvedDate: '2024-01-08',
    totalPatients: 312
  }
]

// Generate monitoring trades
const generateMonitoringTrades = (investmentName: string, basePrice: number): Trade[] => {
  const trades: Trade[] = []
  const now = new Date()
  const patientNames = ['Ahmed Khan', 'Fatima Ali', 'Hassan Raza', 'Ayesha Malik', 'Usman Sheikh']
  
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now.getTime() - (49 - i) * 2 * 60 * 60 * 1000)
    const volatility = basePrice * 0.02
    const open = basePrice + (Math.random() - 0.5) * volatility
    const close = open + (Math.random() - 0.5) * volatility
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    const profitLoss = (close - open) * (Math.random() * 1000)
    
    trades.push({
      id: `TRD-${Date.now()}-${i}`,
      timestamp,
      type: Math.random() > 0.5 ? 'BUY' : 'SELL',
      investment: investmentName,
      location: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad'][Math.floor(Math.random() * 5)],
      open: open * 10,
      high: high * 10,
      low: low * 10,
      close: close * 10,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      liquidity: Math.floor(Math.random() * 10000000) + 1000000,
      profitLoss: profitLoss * 10,
      status: Math.random() > 0.3 ? 'OPEN' : 'CLOSED',
      patientId: `PAT-${Math.floor(Math.random() * 1000)}`,
      patientName: patientNames[Math.floor(Math.random() * patientNames.length)],
      notes: ''
    })
  }
  
  return trades
}

// Generate order book
const generateOrderBook = (basePrice: number) => {
  const bids: OrderBookItem[] = []
  const asks: OrderBookItem[] = []
  const price = basePrice * 10
  
  for (let i = 0; i < 8; i++) {
    const volume = Math.floor(Math.random() * 100) + 10
    bids.push({
      price: price - i * 100 - 50,
      volume,
      total: (price - i * 100) * volume,
      type: 'BID'
    })
  }
  
  for (let i = 0; i < 8; i++) {
    const volume = Math.floor(Math.random() * 100)
    asks.push({
      price: price + i * 100,
      volume,
      total: (price + i * 100) * volume,
      type: 'ASK'
    })
  }
  
  return { bids, asks }
}

// Conversion rate: 1 AT = 10 PKR
const AT_TO_PKR = 10
const convertPKRtoAT = (pkr: number) => pkr / AT_TO_PKR

export default function HospitalMarketplace() {
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentType | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  // Filter investments
  const filteredInvestments = INVESTMENT_TYPES.filter(inv => {
    const matchesSearch = inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inv.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || inv.category === categoryFilter
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(INVESTMENT_TYPES.map(inv => inv.category)))]
  const statuses = ['All', 'active', 'pending', 'suspended']

  // Calculate summary stats
  const activeCount = INVESTMENT_TYPES.filter(inv => inv.status === 'active').length
  const pendingCount = INVESTMENT_TYPES.filter(inv => inv.status === 'pending').length
  const totalVolume = INVESTMENT_TYPES.reduce((sum, inv) => sum + inv.volume24h, 0)
  const totalPatients = INVESTMENT_TYPES.reduce((sum, inv) => sum + inv.totalPatients, 0)

  if (!selectedInvestment) {
    // INVESTMENT MONITORING VIEW
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Investment Marketplace - Hospital View</h1>
            <p className="text-slate-600 mt-1">Monitor patient investments and market activity</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Audit Log
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Investments</p>
                  <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Approved & Trading</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Awaiting Review</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Volume (24h)</p>
                  <p className="text-2xl font-bold text-slate-900">₨{(totalVolume / 1000000000).toFixed(2)}B</p>
                  <p className="text-xs text-slate-500 mt-1">Across All Markets</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Patients</p>
                  <p className="text-2xl font-bold text-slate-900">{totalPatients}</p>
                  <p className="text-xs text-slate-500 mt-1">Active Investors</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search investments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            {statuses.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="whitespace-nowrap capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Investment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredInvestments.map((investment) => {
            const Icon = investment.icon
            const isPositive = investment.change24h >= 0
            
            return (
              <Card
                key={investment.id}
                className="hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300"
                onClick={() => setSelectedInvestment(investment)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{investment.symbol}</h3>
                        <p className="text-xs text-slate-500">{investment.category}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        investment.status === 'active' ? 'default' : 
                        investment.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {investment.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{investment.name}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Price:</span>
                      <span className="font-semibold">{investment.currentPrice.toLocaleString()} AT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">24h Change:</span>
                      <span className={`font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isPositive ? '+' : ''}{investment.change24h.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Patients:</span>
                      <span className="font-medium">{investment.totalPatients}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Volume (24h):</span>
                      <span className="font-medium">₨{(investment.volume24h / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    <Eye className="h-4 w-4 mr-2" />
                    Monitor Activity
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredInvestments.length === 0 && (
          <div className="text-center py-12">
            <Info className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600">No investments found matching your criteria</p>
          </div>
        )}
      </div>
    )
  }

  // MONITORING DASHBOARD VIEW
  return <MonitoringDashboard investment={selectedInvestment} onBack={() => setSelectedInvestment(null)} />
}

// Monitoring Dashboard Component
function MonitoringDashboard({ investment, onBack }: { investment: InvestmentType; onBack: () => void }) {
  const [trades] = useState<Trade[]>(generateMonitoringTrades(investment.name, investment.currentPrice))
  const [orderBook] = useState(generateOrderBook(investment.currentPrice))
  
  // Chart data type
  interface ChartDataPoint {
    time: string
    open: number
    high: number
    low: number
    close: number
    volume: number
    liquidity: number
    profitLoss: number
    fullData: Trade
  }
  
  const [hoveredCandle, setHoveredCandle] = useState<ChartDataPoint | null>(null)
  
  // Calculate market stats
  const latestTrade = trades[trades.length - 1]
  const previousTrade = trades[trades.length - 2]
  const priceChange = latestTrade && previousTrade ? latestTrade.close - previousTrade.close : 0
  const priceChangePercent = previousTrade ? (priceChange / previousTrade.close) * 100 : 0
  const totalVolume = trades.reduce((sum, t) => sum + t.volume, 0)
  const avgLiquidity = trades.reduce((sum, t) => sum + t.liquidity, 0) / trades.length
  const totalProfitLoss = trades.reduce((sum, t) => sum + t.profitLoss, 0)
  const openTrades = trades.filter(t => t.status === 'OPEN').length

  // Format chart data
  const chartData = trades.map(trade => ({
    time: trade.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    open: trade.open,
    high: trade.high,
    low: trade.low,
    close: trade.close,
    volume: trade.volume,
    liquidity: trade.liquidity,
    profitLoss: trade.profitLoss,
    fullData: trade
  }))

  // Custom candlestick rendering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomCandlestick = (props: Record<string, unknown>) => {
    const { x, y, width, height, payload } = props as any
    const trade = (payload as any)?.fullData as Trade
    
    if (!trade) return null
    
    const isGreen = trade.close >= trade.open
    const bodyHeight = Math.abs(y - height)
    const wickTop = Math.min(y, height)
    
    const chartDataPoint = chartData.find(d => d.fullData.id === trade.id)
    
    return (
      <g
        onMouseEnter={() => chartDataPoint && setHoveredCandle(chartDataPoint)}
        onMouseLeave={() => setHoveredCandle(null)}
        style={{ cursor: 'pointer' }}
      >
        <line
          x1={x + width / 2}
          y1={wickTop}
          x2={x + width / 2}
          y2={wickTop + bodyHeight}
          stroke={isGreen ? '#10b981' : '#ef4444'}
          strokeWidth={1}
        />
        <rect
          x={x + width * 0.25}
          y={Math.min(y, height)}
          width={width * 0.5}
          height={bodyHeight || 1}
          fill={isGreen ? '#10b981' : '#ef4444'}
          stroke={isGreen ? '#059669' : '#dc2626'}
          strokeWidth={1}
          opacity={hoveredCandle?.fullData.id === trade.id ? 1 : 0.8}
        />
      </g>
    )
  }

  const Icon = investment.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{investment.symbol} - Monitoring Dashboard</h1>
              <p className="text-slate-600">{investment.name}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" />
            Manage
          </Button>
          <Button variant="outline" size="sm">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Audit Trail
          </Button>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Current Price</p>
                <p className="text-2xl font-bold text-slate-900">
                  {latestTrade?.close ? convertPKRtoAT(latestTrade.close).toLocaleString(undefined, {maximumFractionDigits: 2}) : '0'} AT
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {priceChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {priceChangePercent.toFixed(2)}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">1 AT = {AT_TO_PKR} PKR</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Volume</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(totalVolume / 1000000).toFixed(2)}M
                </p>
                <p className="text-xs text-slate-500 mt-1">{trades.length} trades monitored</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Patients</p>
                <p className="text-2xl font-bold text-slate-900">
                  {investment.totalPatients}
                </p>
                <p className="text-xs text-slate-500 mt-1">{openTrades} open positions</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total P&L</p>
                <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {totalProfitLoss >= 0 ? '+' : ''}{convertPKRtoAT(totalProfitLoss / 1000).toFixed(0)}K AT
                </p>
                <p className="text-xs text-slate-500 mt-1">Patient Portfolio</p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${totalProfitLoss >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <Activity className={`h-6 w-6 ${totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candlestick Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Price Chart - {investment.symbol}
              </CardTitle>
              <CardDescription>Market activity and price movements</CardDescription>
            </div>
            <div className="flex gap-2">
              {['1H', '4H', '1D', '1W', '1M'].map((timeRange) => (
                <Button
                  key={timeRange}
                  variant="outline"
                  size="sm"
                  className={timeRange === '1D' ? 'border-blue-200 bg-blue-50 text-blue-600' : ''}
                >
                  {timeRange}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {hoveredCandle && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Time</p>
                  <p className="font-semibold text-slate-900">{hoveredCandle.time}</p>
                </div>
                <div>
                  <p className="text-slate-600">Open</p>
                  <p className="font-semibold text-slate-900">{convertPKRtoAT(hoveredCandle.open).toFixed(2)} AT</p>
                </div>
                <div>
                  <p className="text-slate-600">High</p>
                  <p className="font-semibold text-slate-900">{convertPKRtoAT(hoveredCandle.high).toFixed(2)} AT</p>
                </div>
                <div>
                  <p className="text-slate-600">Low</p>
                  <p className="font-semibold text-slate-900">{convertPKRtoAT(hoveredCandle.low).toFixed(2)} AT</p>
                </div>
                <div>
                  <p className="text-slate-600">Close</p>
                  <p className="font-semibold text-slate-900">{convertPKRtoAT(hoveredCandle.close).toFixed(2)} AT</p>
                </div>
                <div>
                  <p className="text-slate-600">Volume</p>
                  <p className="font-semibold text-slate-900">{(hoveredCandle.volume / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-slate-600">Patient</p>
                  <p className="font-semibold text-slate-900">{hoveredCandle.fullData.patientName}</p>
                </div>
                <div>
                  <p className="text-slate-600">P&L</p>
                  <p className={`font-semibold ${hoveredCandle.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {hoveredCandle.profitLoss >= 0 ? '+' : ''}{convertPKRtoAT(hoveredCandle.profitLoss).toFixed(2)} AT
                  </p>
                </div>
              </div>
            </div>
          )}
          <ResponsiveContainer width="100%" height={500}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="price"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="volume"
                orientation="right"
                stroke="#cbd5e1"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar 
                yAxisId="volume"
                dataKey="volume" 
                fill="#94a3b8"
                opacity={0.3}
                radius={0}
                isAnimationActive={false}
                name="Volume"
              />
              <Bar 
                yAxisId="price"
                dataKey="high" 
            
                shape={<CustomCandlestick />}
                isAnimationActive={false}
                name="Price"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Book */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Book</CardTitle>
            <CardDescription>Live bid and ask prices</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="bids" className="text-xs">Bids</TabsTrigger>
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="asks" className="text-xs">Asks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-2">
                <div className="space-y-1">
                  {orderBook.asks.slice().reverse().map((ask, idx) => (
                    <div key={`ask-${idx}`} className="flex justify-between items-center text-xs py-1 px-2 rounded hover:bg-red-50">
                      <span className="text-red-600 font-medium">{convertPKRtoAT(ask.price).toFixed(2)} AT</span>
                      <span className="text-slate-600">{ask.volume}</span>
                      <span className="text-slate-500">{(ask.total / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
                
                <div className="py-2 px-2 bg-slate-100 rounded text-center">
                  <span className="text-xs font-semibold text-slate-700">
                    Spread: {convertPKRtoAT(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)} AT
                  </span>
                </div>
                
                <div className="space-y-1">
                  {orderBook.bids.map((bid, idx) => (
                    <div key={`bid-${idx}`} className="flex justify-between items-center text-xs py-1 px-2 rounded hover:bg-emerald-50">
                      <span className="text-emerald-600 font-medium">{convertPKRtoAT(bid.price).toFixed(2)} AT</span>
                      <span className="text-slate-600">{bid.volume}</span>
                      <span className="text-slate-500">{(bid.total / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="bids">
                <div className="space-y-1">
                  {orderBook.bids.map((bid, idx) => (
                    <div key={`bid-${idx}`} className="flex justify-between items-center text-xs py-1 px-2 rounded hover:bg-emerald-50">
                      <span className="text-emerald-600 font-medium">{convertPKRtoAT(bid.price).toFixed(2)} AT</span>
                      <span className="text-slate-600">{bid.volume}</span>
                      <span className="text-slate-500">{(bid.total / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="asks">
                <div className="space-y-1">
                  {orderBook.asks.map((ask, idx) => (
                    <div key={`ask-${idx}`} className="flex justify-between items-center text-xs py-1 px-2 rounded hover:bg-red-50">
                      <span className="text-red-600 font-medium">{convertPKRtoAT(ask.price).toFixed(2)} AT</span>
                      <span className="text-slate-600">{ask.volume}</span>
                      <span className="text-slate-500">{(ask.total / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Patient Trades Monitoring */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Patient Trades - Monitoring View</CardTitle>
            <CardDescription>View patient trading activity for compliance and support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {trades.map((trade) => (
                <div key={trade.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                          {trade.type}
                        </Badge>
                        <span className="font-semibold text-slate-900 text-sm">{trade.id}</span>
                        <Badge variant="outline" className="text-xs">
                          {trade.status}
                        </Badge>
                        <span className="text-xs text-slate-600">Patient: {trade.patientName}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-2 text-slate-600 mb-1">
                            <MapPin className="h-4 w-4" />
                            <span>{trade.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs">{trade.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Entry:</span>
                            <span className="font-medium">{convertPKRtoAT(trade.open).toFixed(2)} AT</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Current:</span>
                            <span className="font-medium">{convertPKRtoAT(trade.close).toFixed(2)} AT</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">P&L:</span>
                            <span className={`font-medium ${trade.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {trade.profitLoss >= 0 ? '+' : ''}{convertPKRtoAT(trade.profitLoss).toFixed(0)} AT
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
              
              {trades.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No trades to monitor</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { fullData: Trade } }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload.fullData as Trade
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="text-xs text-slate-600 mb-2">{data.timestamp.toLocaleString()}</p>
        <p className="text-xs text-slate-600 mb-2">Patient: {data.patientName}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-slate-600">Open:</span>
            <span className="font-medium">{convertPKRtoAT(data.open).toFixed(2)} AT</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-600">High:</span>
            <span className="font-medium text-emerald-600">{convertPKRtoAT(data.high).toFixed(2)} AT</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-600">Low:</span>
            <span className="font-medium text-red-600">{convertPKRtoAT(data.low).toFixed(2)} AT</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-600">Close:</span>
            <span className="font-medium">{convertPKRtoAT(data.close).toFixed(2)} AT</span>
          </div>
          <div className="border-t pt-1 mt-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">Volume:</span>
              <span className="font-medium">{data.volume.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return null
}
