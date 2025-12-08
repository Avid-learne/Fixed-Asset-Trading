'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { TrendingUp, TrendingDown, Search, DollarSign, Users, Building2, Activity, Coins, Shield, ArrowUpDown, Clock, CheckCircle, XCircle, AlertCircle, Landmark, Wallet, Star, CreditCard } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar } from 'recharts'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

interface Trade {
  id: string
  time: string
  price: number
  amount: number
  type: 'buy' | 'sell'
}

interface TradingPair {
  id: string
  name: string
  symbol: string
  pair: string // e.g., "AT/PKR"
  investmentType: 'government-bond' | 'etf' | 'healthcare-fund'
  currentPrice: number
  change24h: number
  high24h: number
  low24h: number
  volume24h: number
  investedAmount: number // Total PKR invested
  tokenSupply: number // Total AT issued
  apy: number
  maturityDate?: string
  description: string
  riskLevel: 'low' | 'medium' | 'high'
}

// Real-world investment instruments
const tradingPairs: TradingPair[] = [
  {
    id: 'PIB-10Y',
    name: 'Pakistan Investment Bonds - 10 Year',
    symbol: 'PIB10Y',
    pair: 'PIB10Y/PKR',
    investmentType: 'government-bond',
    currentPrice: 12.85,
    change24h: 0.23,
    high24h: 12.95,
    low24h: 12.78,
    volume24h: 45000000,
    investedAmount: 150000000,
    tokenSupply: 11673152,
    apy: 12.5,
    maturityDate: '2034-12-31',
    description: 'Government-backed bonds invested from patient asset deposits',
    riskLevel: 'low'
  },
  {
    id: 'TRSRY-3Y',
    name: 'Pakistan Treasury Bills - 3 Year',
    symbol: 'TBILL3Y',
    pair: 'TBILL3Y/PKR',
    investmentType: 'government-bond',
    currentPrice: 10.45,
    change24h: -0.15,
    high24h: 10.58,
    low24h: 10.42,
    volume24h: 32000000,
    investedAmount: 95000000,
    tokenSupply: 9090909,
    apy: 10.8,
    maturityDate: '2028-12-31',
    description: 'Short-term government securities from subscription pools',
    riskLevel: 'low'
  },
  {
    id: 'HEALTH-ETF',
    name: 'Pakistan Healthcare ETF',
    symbol: 'HLTHPK',
    pair: 'HLTHPK/PKR',
    investmentType: 'etf',
    currentPrice: 156.75,
    change24h: 1.85,
    high24h: 158.20,
    low24h: 154.30,
    volume24h: 12500000,
    investedAmount: 75000000,
    tokenSupply: 478326,
    apy: 14.2,
    description: 'Diversified healthcare sector investments (ICI, Searle, AGP)',
    riskLevel: 'medium'
  },
  {
    id: 'PHARMA-FUND',
    name: 'Pharmaceutical Companies Fund',
    symbol: 'PHARMPK',
    pair: 'PHARMPK/PKR',
    investmentType: 'healthcare-fund',
    currentPrice: 89.40,
    change24h: 2.15,
    high24h: 90.10,
    low24h: 87.50,
    volume24h: 18000000,
    investedAmount: 60000000,
    tokenSupply: 671141,
    apy: 15.8,
    description: 'Healthcare company stocks (Getz Pharma, Ferozsons, Highnoon)',
    riskLevel: 'medium'
  },
  {
    id: 'SUKUK-5Y',
    name: 'Sukuk Bonds - 5 Year',
    symbol: 'SUKUK5Y',
    pair: 'SUKUK5Y/PKR',
    investmentType: 'government-bond',
    currentPrice: 11.20,
    change24h: 0.45,
    high24h: 11.28,
    low24h: 11.15,
    volume24h: 28000000,
    investedAmount: 85000000,
    tokenSupply: 7589286,
    apy: 11.5,
    maturityDate: '2030-06-30',
    description: 'Shariah-compliant government bonds from patient deposits',
    riskLevel: 'low'
  }
]

export default function HospitalAdminMarketplace() {
  const [selectedPair, setSelectedPair] = useState(tradingPairs[0])
  const [currentPrice, setCurrentPrice] = useState(selectedPair.currentPrice)
  const [candleData, setCandleData] = useState<CandleData[]>([])
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [recentTrades, setRecentTrades] = useState<Trade[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'government-bond' | 'etf' | 'healthcare-fund'>('all')

  useEffect(() => {
    generateInitialData()
  }, [selectedPair])

  useEffect(() => {
    const interval = setInterval(() => {
      updateLiveData()
    }, 2000)
    return () => clearInterval(interval)
  }, [currentPrice])

  const generateInitialData = () => {
    // Generate candle data
    const candles: CandleData[] = []
    let price = selectedPair.currentPrice
    for (let i = 30; i >= 0; i--) {
      const open = price
      const change = (Math.random() - 0.5) * 2
      const close = open + change
      const high = Math.max(open, close) + Math.random()
      const low = Math.min(open, close) - Math.random()
      const now = new Date()
      candles.push({
        time: new Date(now.getTime() - i * 300000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(Math.random() * 100000) + 50000
      })
      price = close
    }
    setCandleData(candles)

    // Generate order book
    const newBids: OrderBookEntry[] = []
    const newAsks: OrderBookEntry[] = []
    const basePrice = selectedPair.currentPrice

    for (let i = 0; i < 15; i++) {
      const bidPrice = basePrice - (i + 1) * 0.05
      const askPrice = basePrice + (i + 1) * 0.05
      const bidAmount = Math.floor(Math.random() * 5000) + 1000
      const askAmount = Math.floor(Math.random() * 5000) + 1000

      newBids.push({
        price: Number(bidPrice.toFixed(2)),
        amount: bidAmount,
        total: Number((bidPrice * bidAmount).toFixed(2))
      })

      newAsks.push({
        price: Number(askPrice.toFixed(2)),
        amount: askAmount,
        total: Number((askPrice * askAmount).toFixed(2))
      })
    }

    setBids(newBids)
    setAsks(newAsks)

    // Generate recent trades
    const trades: Trade[] = []
    const now = new Date()
    for (let i = 0; i < 20; i++) {
      const tradePrice = basePrice + (Math.random() - 0.5) * 2
      trades.push({
        id: `trade-${i}`,
        time: new Date(now.getTime() - i * 5000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        price: Number(tradePrice.toFixed(2)),
        amount: Math.floor(Math.random() * 1000) + 100,
        type: Math.random() > 0.5 ? 'buy' : 'sell'
      })
    }
    setRecentTrades(trades)
  }

  const updateLiveData = () => {
    // Update price
    setCurrentPrice(prev => {
      const change = (Math.random() - 0.5) * 0.2
      return Number((prev + change).toFixed(2))
    })

    // Add new trade
    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      price: currentPrice,
      amount: Math.floor(Math.random() * 1000) + 100,
      type: Math.random() > 0.5 ? 'buy' : 'sell'
    }
    setRecentTrades(prev => [newTrade, ...prev.slice(0, 19)])

    // Update order book occasionally
    if (Math.random() > 0.7) {
      setBids(prev => {
        const updated = [...prev]
        const idx = Math.floor(Math.random() * 5)
        updated[idx].amount = Math.floor(Math.random() * 5000) + 1000
        updated[idx].total = Number((updated[idx].price * updated[idx].amount).toFixed(2))
        return updated
      })
    }
  }

  const getInvestmentTypeColor = (type: string) => {
    switch (type) {
      case 'government-bond': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'etf': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'healthcare-fund': return 'bg-emerald-100 text-emerald-700 border-emerald-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return <Badge className="bg-green-100 text-green-700">Low Risk</Badge>
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-700">Medium Risk</Badge>
      case 'high': return <Badge className="bg-red-100 text-red-700">High Risk</Badge>
    }
  }

  const filteredPairs = tradingPairs.filter(pair => {
    const matchesSearch = pair.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pair.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || pair.investmentType === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
            <Landmark className="w-8 h-8 text-emerald-600" />
            Sehat Vault - Investment Marketplace
          </h1>
          <p className="text-sm text-gray-600 mt-1">Real-time government bonds, ETFs & healthcare funds trading</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-600 text-white px-3 py-1">
            <Activity className="w-3 h-3 mr-1" />
            Live Market
          </Badge>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            <Wallet className="w-4 h-4 mr-2" />
            Deposit Assets
          </Button>
        </div>
      </div>

      {/* Market Overview Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Invested</p>
                <p className="text-xl font-bold text-gray-900">PKR {(tradingPairs.reduce((sum, p) => sum + p.investedAmount, 0) / 1000000).toFixed(1)}M</p>
              </div>
              <Landmark className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">24h Volume</p>
                <p className="text-xl font-bold text-gray-900">PKR {(tradingPairs.reduce((sum, p) => sum + p.volume24h, 0) / 1000000).toFixed(1)}M</p>
              </div>
              <Activity className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Avg APY</p>
                <p className="text-xl font-bold text-emerald-600">{(tradingPairs.reduce((sum, p) => sum + p.apy, 0) / tradingPairs.length).toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Active Instruments</p>
                <p className="text-xl font-bold text-gray-900">{tradingPairs.length}</p>
              </div>
              <Coins className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Sidebar - Market Pairs */}
        <div className="col-span-3">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Markets</CardTitle>
                <Star className="w-4 h-4 text-gray-400" />
              </div>
              <div className="mt-2">
                <Input
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border-gray-300 text-gray-900 text-sm"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs"
                  onClick={() => setFilterType('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterType === 'government-bond' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs"
                  onClick={() => setFilterType('government-bond')}
                >
                  Bonds
                </Button>
                <Button
                  variant={filterType === 'etf' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs"
                  onClick={() => setFilterType('etf')}
                >
                  ETF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[700px] overflow-y-auto">
                <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-600 sticky top-0 border-b border-gray-200">
                  <div>Pair</div>
                  <div className="text-right">Price</div>
                  <div className="text-right">Change</div>
                </div>
                {filteredPairs.map((pair) => (
                  <div
                    key={pair.id}
                    onClick={() => {
                      setSelectedPair(pair)
                      setCurrentPrice(pair.currentPrice)
                    }}
                    className={`grid grid-cols-3 gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-emerald-50 transition-colors border-b border-gray-100 ${
                      selectedPair.id === pair.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{pair.symbol}</div>
                      <div className="text-[10px] text-gray-500">{pair.investmentType.replace('-', ' ').toUpperCase()}</div>
                    </div>
                    <div className="text-right font-medium text-gray-900">{pair.currentPrice.toFixed(2)}</div>
                    <div className={`text-right ${pair.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {pair.change24h >= 0 ? '+' : ''}{pair.change24h}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center - Chart & Order Book */}
        <div className="col-span-6">
          {/* Selected Pair Header */}
          <Card className="bg-white border-gray-200 shadow-sm mb-4">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPair.symbol}/PKR</h2>
                    <Badge className={getInvestmentTypeColor(selectedPair.investmentType)}>
                      {selectedPair.investmentType.replace('-', ' ').toUpperCase()}
                    </Badge>
                    {getRiskBadge(selectedPair.riskLevel)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{selectedPair.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">PKR {currentPrice.toFixed(2)}</div>
                  <div className={`text-sm ${selectedPair.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedPair.change24h >= 0 ? '+' : ''}{selectedPair.change24h}% (24h)
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">24h High</p>
                  <p className="text-sm font-semibold text-gray-900">PKR {selectedPair.high24h.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">24h Low</p>
                  <p className="text-sm font-semibold text-gray-900">PKR {selectedPair.low24h.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">24h Volume</p>
                  <p className="text-sm font-semibold text-gray-900">PKR {(selectedPair.volume24h / 1000000).toFixed(2)}M</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">APY</p>
                  <p className="text-sm font-semibold text-emerald-600">{selectedPair.apy}%</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-500">Total Invested</p>
                  <p className="text-sm font-semibold text-gray-900">PKR {(selectedPair.investedAmount / 1000000).toFixed(2)}M</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Token Supply</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedPair.tokenSupply.toLocaleString()} AT</p>
                </div>
                {selectedPair.maturityDate && (
                  <div>
                    <p className="text-xs text-gray-500">Maturity</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedPair.maturityDate}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Price Chart */}
          <Card className="bg-white border-gray-200 shadow-sm mb-4">
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={candleData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" />
                  <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ color: '#6b7280', fontWeight: '600' }}
                  />
                  <Area type="monotone" dataKey="close" stroke="#10b981" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Book */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Order Book</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-3 gap-2 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-600 border-b border-gray-200">
                <div>Price (PKR)</div>
                <div className="text-right">Amount (AT)</div>
                <div className="text-right">Total (PKR)</div>
              </div>
              
              {/* Asks (Sell Orders) */}
              <div className="max-h-[180px] overflow-auto">
                {[...asks].reverse().slice(0, 8).reverse().map((ask, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-red-50 relative border-b border-gray-100">
                    <div className="absolute left-0 top-0 bottom-0 bg-red-100 opacity-40" style={{ width: `${(ask.amount / Math.max(...asks.map(a => a.amount))) * 100}%` }} />
                    <div className="text-red-600 font-medium relative z-10">{ask.price.toFixed(2)}</div>
                    <div className="text-right text-gray-700 relative z-10">{ask.amount.toLocaleString()}</div>
                    <div className="text-right text-gray-500 text-[11px] relative z-10">{ask.total.toLocaleString()}</div>
                  </div>
                ))}
              </div>

              {/* Current Price */}
              <div className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border-y-2 border-emerald-500">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-700">PKR {currentPrice.toFixed(2)}</span>
                  <Badge className="bg-emerald-600 text-white">Market Price</Badge>
                </div>
              </div>

              {/* Bids (Buy Orders) */}
              <div className="max-h-[180px] overflow-auto">
                {bids.slice(0, 8).map((bid, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-green-50 relative border-b border-gray-100">
                    <div className="absolute left-0 top-0 bottom-0 bg-green-100 opacity-40" style={{ width: `${(bid.amount / Math.max(...bids.map(b => b.amount))) * 100}%` }} />
                    <div className="text-green-600 font-medium relative z-10">{bid.price.toFixed(2)}</div>
                    <div className="text-right text-gray-700 relative z-10">{bid.amount.toLocaleString()}</div>
                    <div className="text-right text-gray-500 text-[11px] relative z-10">{bid.total.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Trades & Info */}
        <div className="col-span-3">
          {/* Recent Trades */}
          <Card className="bg-white border-gray-200 shadow-sm mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Recent Trades
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-600 border-b border-gray-200">
                <div>Price (PKR)</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Time</div>
              </div>
              <div className="max-h-[400px] overflow-auto">
                {recentTrades.map((trade, idx) => (
                  <div key={trade.id} className={`grid grid-cols-3 gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 border-b border-gray-100 ${
                    idx === 0 ? 'bg-emerald-50' : ''
                  }`}>
                    <div className={`font-medium ${trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.price.toFixed(2)}
                    </div>
                    <div className="text-right text-gray-700">{trade.amount.toLocaleString()}</div>
                    <div className="text-right text-gray-500 text-[10px]">{trade.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Investment Details */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Investment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-700">Source of Funds</p>
                </div>
                <p className="text-xs text-gray-700">Patient asset deposits (land, gold) + Monthly subscription fees pooled and tokenized</p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-semibold text-emerald-700">Investment Strategy</p>
                </div>
                <p className="text-xs text-gray-700">{selectedPair.description}</p>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <p className="text-xs font-semibold text-purple-700">Returns Distribution</p>
                </div>
                <p className="text-xs text-gray-700">Profits distributed as HealthTokens (HT) for medical discounts, free OPD visits, and insurance coverage</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Expected APY:</span>
                  <span className="text-emerald-600 font-semibold">{selectedPair.apy}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Risk Level:</span>
                  <span>{getRiskBadge(selectedPair.riskLevel)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Token Price:</span>
                  <span className="text-gray-900 font-semibold">1 AT = PKR {(selectedPair.investedAmount / selectedPair.tokenSupply).toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                <Wallet className="w-4 h-4 mr-2" />
                Invest Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
