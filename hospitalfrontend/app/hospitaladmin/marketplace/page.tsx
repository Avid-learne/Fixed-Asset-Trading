'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Home, 
  Landmark, 
  Factory, 
  Store, 
  TrendingUp, 
  TrendingDown,
  Search,
  ArrowLeft,
  DollarSign,
  BarChart3,
  Wallet,
  Activity,
  Settings,
  Plus,
  Edit,
  X,
  Info,
  MapPin,
  Clock
} from 'lucide-react'
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Investment types available for trading
type InvestmentType = {
  id: string
  name: string
  symbol: string
  icon: any
  currentPrice: number
  change24h: number
  volume24h: number
  marketCap: number
  category: string
  description: string
}

// Trade data type
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
    description: 'Office buildings, retail spaces, and commercial properties'
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
    description: 'Apartments, houses, and residential units'
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
    description: 'Federal and state government securities'
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
    description: 'Warehouses, factories, and industrial facilities'
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
    description: 'Shopping centers, malls, and retail outlets'
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
    description: 'Investment-grade corporate debt securities'
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
    description: 'Undeveloped land and development projects'
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
    description: 'Class A and B office buildings'
  }
]

// Generate initial trades for selected investment
const generateInitialTrades = (investmentName: string, basePrice: number): Trade[] => {
  const trades: Trade[] = []
  const now = new Date()
  
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
      open: open * 10, // Store in PKR
      high: high * 10,
      low: low * 10,
      close: close * 10,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      liquidity: Math.floor(Math.random() * 10000000) + 1000000,
      profitLoss: profitLoss * 10, // Store in PKR
      status: Math.random() > 0.3 ? 'OPEN' : 'CLOSED',
      notes: ''
    })
  }
  
  return trades
}

// Generate order book
const generateOrderBook = (basePrice: number) => {
  const bids: OrderBookItem[] = []
  const asks: OrderBookItem[] = []
  const price = basePrice * 10 // Convert to PKR
  
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
const convertATtoPKR = (at: number) => at * AT_TO_PKR

export default function HospitalAdminMarketplace() {
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentType | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')

  // Filter investments
  const filteredInvestments = INVESTMENT_TYPES.filter(inv => {
    const matchesSearch = inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inv.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || inv.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(INVESTMENT_TYPES.map(inv => inv.category)))]

  if (!selectedInvestment) {
    // INVESTMENT SELECTION VIEW
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Investment Marketplace</h1>
          <p className="text-slate-600 mt-1">Select an investment type to start trading</p>
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
        </div>

        {/* Investment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredInvestments.map((investment) => {
            const Icon = investment.icon
            const isPositive = investment.change24h >= 0
            
            return (
              <Card
                key={investment.id}
                className="hover:shadow-lg transition-shadow cursor-pointer hover:border-emerald-300"
                onClick={() => setSelectedInvestment(investment)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{investment.symbol}</h3>
                        <p className="text-xs text-slate-500">{investment.category}</p>
                      </div>
                    </div>
                    <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
                      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {isPositive ? '+' : ''}{investment.change24h.toFixed(2)}%
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{investment.name}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Price:</span>
                      <span className="font-semibold">{investment.currentPrice.toLocaleString()} AT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Volume (24h):</span>
                      <span className="font-medium">${(investment.volume24h / 1000000).toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Market Cap:</span>
                      <span className="font-medium">${(investment.marketCap / 1000000000).toFixed(2)}B</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                    Trade Now
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

  // TRADING DASHBOARD VIEW
  return <TradingDashboard investment={selectedInvestment} onBack={() => setSelectedInvestment(null)} />
}

// Trading Dashboard Component
function TradingDashboard({ investment, onBack }: { investment: InvestmentType; onBack: () => void }) {
  const [trades, setTrades] = useState<Trade[]>(generateInitialTrades(investment.name, investment.currentPrice))
  const [orderBook, setOrderBook] = useState(generateOrderBook(investment.currentPrice))
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false)
  const [isEditTradeOpen, setIsEditTradeOpen] = useState(false)
  const [hoveredCandle, setHoveredCandle] = useState<Trade | null>(null)
  
  const [newTrade, setNewTrade] = useState({
    type: 'BUY' as 'BUY' | 'SELL',
    location: '',
    open: 0,
    volume: 0,
    liquidity: 0,
    notes: ''
  })

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
    fullData: trade
  }))

  // Custom candlestick rendering
  const CustomCandlestick = (props: any) => {
    const { x, y, width, height, payload } = props
    const trade = payload.fullData as Trade
    
    if (!trade) return null
    
    const isGreen = trade.close >= trade.open
    const bodyHeight = Math.abs(y - height)
    const wickTop = Math.min(y, height)
    
    return (
      <g
        onMouseEnter={() => setHoveredCandle(trade)}
        onMouseLeave={() => setHoveredCandle(null)}
        style={{ cursor: 'pointer' }}
      >
        {/* Wick */}
        <line
          x1={x + width / 2}
          y1={wickTop}
          x2={x + width / 2}
          y2={wickTop + bodyHeight}
          stroke={isGreen ? '#10b981' : '#ef4444'}
          strokeWidth={1}
        />
        
        {/* Body */}
        <rect
          x={x}
          y={Math.min(y, height)}
          width={width}
          height={bodyHeight || 1}
          fill={isGreen ? '#10b981' : '#ef4444'}
          stroke={isGreen ? '#059669' : '#dc2626'}
          strokeWidth={1}
          opacity={hoveredCandle?.id === trade.id ? 1 : 0.8}
        />
      </g>
    )
  }

  const handleCreateTrade = () => {
    const trade: Trade = {
      id: `TRD-${Date.now()}`,
      timestamp: new Date(),
      type: newTrade.type,
      investment: investment.name,
      location: newTrade.location,
      open: newTrade.open * 10, // Convert AT to PKR for storage
      high: newTrade.open * 10 * 1.02,
      low: newTrade.open * 10 * 0.98,
      close: newTrade.open * 10,
      volume: newTrade.volume,
      liquidity: newTrade.liquidity * 10, // Convert AT to PKR for storage
      profitLoss: 0,
      status: 'OPEN',
      notes: newTrade.notes
    }
    
    setTrades([...trades, trade])
    setIsNewTradeOpen(false)
    setNewTrade({
      type: 'BUY',
      location: '',
      open: 0,
      volume: 0,
      liquidity: 0,
      notes: ''
    })
  }

  const handleUpdateTrade = () => {
    if (selectedTrade) {
      setTrades(trades.map(t => t.id === selectedTrade.id ? selectedTrade : t))
      setIsEditTradeOpen(false)
    }
  }

  const handleCloseTrade = (tradeId: string) => {
    setTrades(trades.map(t => 
      t.id === tradeId ? { ...t, status: 'CLOSED' as const } : t
    ))
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
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <Icon className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{investment.symbol} Trading</h1>
              <p className="text-slate-600">{investment.name}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Dialog open={isNewTradeOpen} onOpenChange={setIsNewTradeOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                New Trade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Trade - {investment.symbol}</DialogTitle>
                <DialogDescription>
                  Enter the details of your {investment.name} trade
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trade Type</Label>
                    <Select 
                      value={newTrade.type} 
                      onValueChange={(value: 'BUY' | 'SELL') => setNewTrade({...newTrade, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">Buy</SelectItem>
                        <SelectItem value="SELL">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Opening Price (AT)</Label>
                    <Input 
                      type="number" 
                      placeholder={investment.currentPrice.toString()}
                      value={newTrade.open || ''}
                      onChange={(e) => setNewTrade({...newTrade, open: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    placeholder="Lahore, Pakistan"
                    value={newTrade.location}
                    onChange={(e) => setNewTrade({...newTrade, location: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Volume</Label>
                    <Input 
                      type="number" 
                      placeholder="500000"
                      value={newTrade.volume || ''}
                      onChange={(e) => setNewTrade({...newTrade, volume: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Liquidity (AT)</Label>
                    <Input 
                      type="number" 
                      placeholder="200000"
                      value={newTrade.liquidity || ''}
                      onChange={(e) => setNewTrade({...newTrade, liquidity: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    placeholder="Additional information about this trade..."
                    value={newTrade.notes}
                    onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewTradeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTrade} className="bg-emerald-600 hover:bg-emerald-700">
                  Create Trade
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                <DollarSign className="h-6 w-6 text-emerald-600" />
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
                <p className="text-xs text-slate-500 mt-1">{trades.length} trades | 1 AT = {AT_TO_PKR} PKR</p>
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
                <p className="text-sm text-slate-600">Avg Liquidity</p>
                <p className="text-2xl font-bold text-slate-900">
                  {convertPKRtoAT(avgLiquidity / 1000000).toFixed(2)}M AT
                </p>
                <p className="text-xs text-slate-500 mt-1">1 AT = {AT_TO_PKR} PKR</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-purple-600" />
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
                <p className="text-xs text-slate-500 mt-1">{openTrades} open | 1 AT = {AT_TO_PKR} PKR</p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${totalProfitLoss >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <Activity className={`h-6 w-6 ${totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Price Chart - {investment.symbol}</CardTitle>
              <CardDescription>Candlestick chart with volume and OHLC data</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">1H</Button>
              <Button variant="outline" size="sm">4H</Button>
              <Button variant="outline" size="sm" className="bg-emerald-50 text-emerald-600 border-emerald-200">1D</Button>
              <Button variant="outline" size="sm">1W</Button>
              <Button variant="outline" size="sm">1M</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Hover Info */}
          {hoveredCandle && (
            <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-600">Time</p>
                  <p className="text-sm font-semibold">{hoveredCandle.timestamp.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">O: {convertPKRtoAT(hoveredCandle.open).toFixed(2)} AT | H: {convertPKRtoAT(hoveredCandle.high).toFixed(2)} AT</p>
                  <p className="text-xs text-slate-600">L: {convertPKRtoAT(hoveredCandle.low).toFixed(2)} AT | C: {convertPKRtoAT(hoveredCandle.close).toFixed(2)} AT</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Location</p>
                  <p className="text-sm font-semibold">{hoveredCandle.location}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Volume</p>
                  <p className="text-sm font-semibold">{hoveredCandle.volume.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Liquidity</p>
                  <p className="text-sm font-semibold">{convertPKRtoAT(hoveredCandle.liquidity / 1000000).toFixed(2)}M AT</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">P&L</p>
                  <p className={`text-sm font-semibold ${hoveredCandle.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {hoveredCandle.profitLoss >= 0 ? '+' : ''}{convertPKRtoAT(hoveredCandle.profitLoss).toFixed(0)} AT
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Status</p>
                  <Badge variant={hoveredCandle.status === 'OPEN' ? 'default' : 'secondary'}>
                    {hoveredCandle.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={500}>
            <ComposedChart data={chartData}>
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
                domain={['auto', 'auto']}
              />
              <YAxis 
                yAxisId="volume"
                orientation="right"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Volume bars */}
              <Bar 
                yAxisId="volume"
                dataKey="volume" 
                fill="#94a3b8"
                opacity={0.3}
                name="Volume"
              />
              
              {/* Custom Candlesticks */}
              <Bar
                yAxisId="price"
                dataKey="high"
                shape={<CustomCandlestick />}
                name="Price"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Order Book and Trade Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Book */}
        <Card className="lg:col-span-1">
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
                {/* Asks */}
                <div className="space-y-1">
                  {orderBook.asks.slice().reverse().map((ask, idx) => (
                    <div key={`ask-${idx}`} className="flex justify-between items-center text-xs py-1 px-2 rounded hover:bg-red-50">
                      <span className="text-red-600 font-medium">{convertPKRtoAT(ask.price).toFixed(2)} AT</span>
                      <span className="text-slate-600">{ask.volume}</span>
                      <span className="text-slate-500">{(ask.total / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
                
                {/* Spread */}
                <div className="py-2 px-2 bg-slate-100 rounded text-center">
                  <span className="text-xs font-semibold text-slate-700">
                    Spread: {convertPKRtoAT(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)} AT
                  </span>
                </div>
                
                {/* Bids */}
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

        {/* Open Trades */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Active Trades</CardTitle>
            <CardDescription>Manage your open positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {trades.filter(t => t.status === 'OPEN').map((trade) => (
                <div key={trade.id} className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                          {trade.type}
                        </Badge>
                        <span className="font-semibold text-slate-900">{trade.id}</span>
                        <Badge variant="outline" className="text-xs">
                          {trade.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-2 text-slate-600 mb-1">
                            <MapPin className="h-4 w-4" />
                            <span>{trade.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="h-4 w-4" />
                            <span>{trade.timestamp.toLocaleString()}</span>
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
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedTrade(trade)
                          setIsEditTradeOpen(true)
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleCloseTrade(trade.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {trades.filter(t => t.status === 'OPEN').length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No open trades</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Trade Dialog */}
      <Dialog open={isEditTradeOpen} onOpenChange={setIsEditTradeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Trade - {selectedTrade?.id}</DialogTitle>
            <DialogDescription>
              Update trade details and profit/loss
            </DialogDescription>
          </DialogHeader>
          {selectedTrade && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trade Type</Label>
                  <Select 
                    value={selectedTrade.type} 
                    onValueChange={(value: 'BUY' | 'SELL') => setSelectedTrade({...selectedTrade, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">Buy</SelectItem>
                      <SelectItem value="SELL">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={selectedTrade.status} 
                    onValueChange={(value: 'OPEN' | 'CLOSED') => setSelectedTrade({...selectedTrade, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Open (PKR)</Label>
                  <Input 
                    type="number" 
                    value={selectedTrade.open}
                    onChange={(e) => setSelectedTrade({...selectedTrade, open: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>High (PKR)</Label>
                  <Input 
                    type="number" 
                    value={selectedTrade.high}
                    onChange={(e) => setSelectedTrade({...selectedTrade, high: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Low (PKR)</Label>
                  <Input 
                    type="number" 
                    value={selectedTrade.low}
                    onChange={(e) => setSelectedTrade({...selectedTrade, low: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Close (PKR)</Label>
                  <Input 
                    type="number" 
                    value={selectedTrade.close}
                    onChange={(e) => setSelectedTrade({...selectedTrade, close: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    value={selectedTrade.location}
                    onChange={(e) => setSelectedTrade({...selectedTrade, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Volume</Label>
                  <Input 
                    type="number" 
                    value={selectedTrade.volume}
                    onChange={(e) => setSelectedTrade({...selectedTrade, volume: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Liquidity (PKR)</Label>
                  <Input 
                    type="number" 
                    value={selectedTrade.liquidity}
                    onChange={(e) => setSelectedTrade({...selectedTrade, liquidity: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profit/Loss (PKR)</Label>
                  <Input 
                    type="number" 
                    value={selectedTrade.profitLoss}
                    onChange={(e) => setSelectedTrade({...selectedTrade, profitLoss: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  value={selectedTrade.notes}
                  onChange={(e) => setSelectedTrade({...selectedTrade, notes: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTradeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTrade} className="bg-emerald-600 hover:bg-emerald-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload.fullData as Trade
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="text-xs text-slate-600 mb-2">{data.timestamp.toLocaleString()}</p>
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
