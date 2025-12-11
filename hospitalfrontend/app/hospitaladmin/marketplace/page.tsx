"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { TrendingUp, TrendingDown, Search, DollarSign, Users, Building2, Activity, Coins, Shield, Clock, CheckCircle, XCircle, AlertCircle, Landmark, Wallet, Star } from 'lucide-react'
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ComposedChart, Area, Line, ReferenceArea } from 'recharts'
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

interface TradeRectangle {
  id: string
  label: string
  startTime: string
  endTime: string
  startAT: number
  endAT: number
  pool: 'asset' | 'subscription'
  investmentType: 'government-bond' | 'etf' | 'healthcare-fund'
  principalAT: number
  profitPKR: number
  profitAT: number
  apy: number
  riskLevel: 'low' | 'medium' | 'high'
  status: 'running' | 'matured' | 'planned'
}

interface MarketPoint {
  time: string
  atBalance: number
}

const mockTrades: TradeRectangle[] = [
  {
    id: "trade-1",
    label: "Government Bonds - Asset Pool",
    startTime: "09:00",
    endTime: "12:00",
    startAT: 50000,
    endAT: 50625,
    pool: "asset",
    investmentType: "government-bond",
    principalAT: 50000,
    profitPKR: 62500,
    profitAT: 625,
    apy: 12.5,
    riskLevel: "low",
    status: "running"
  },
  {
    id: "trade-2",
    label: "Healthcare ETF - Subscription Pool",
    startTime: "10:00",
    endTime: "15:00",
    startAT: 30000,
    endAT: 30615,
    pool: "subscription",
    investmentType: "etf",
    principalAT: 30000,
    profitPKR: 61500,
    profitAT: 615,
    apy: 8.2,
    riskLevel: "medium",
    status: "running"
  },
  {
    id: "trade-3",
    label: "Sukuk - Asset Pool",
    startTime: "11:00",
    endTime: "18:00",
    startAT: 20000,
    endAT: 20230,
    pool: "asset",
    investmentType: "government-bond",
    principalAT: 20000,
    profitPKR: 23000,
    profitAT: 230,
    apy: 11.5,
    riskLevel: "low",
    status: "planned"
  }
]

export default function HospitalAdminMarketplace() {
  const [trades, setTrades] = useState<TradeRectangle[]>(mockTrades)
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M'>('1D')
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false)
  const [newTrade, setNewTrade] = useState<Omit<TradeRectangle, 'id' | 'endAT' | 'profitAT'>>({
    label: '',
    startTime: '09:00',
    endTime: '12:00',
    startAT: 0,
    pool: 'asset',
    investmentType: 'government-bond',
    principalAT: 0,
    profitPKR: 0,
    apy: 12.5,
    riskLevel: 'low',
    status: 'planned'
  })

  const chartData: MarketPoint[] = useMemo(() => {
    const baseTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
    return baseTimes.map(time => {
      const activeTrades = trades.filter(t => t.startTime <= time && t.endTime >= time)
      const totalAT = activeTrades.reduce((sum, t) => sum + (t.startAT + (t.endAT - t.startAT) * 0.5), 0)
      return {
        time,
        atBalance: totalAT
      }
    })
  }, [trades])

  // Calculate stats from trades
  const totalInvested = trades.reduce((sum, t) => sum + (t.principalAT * 100), 0)
  const totalProfit = trades.reduce((sum, t) => sum + t.profitPKR, 0)
  const avgAPY = trades.reduce((sum, t) => sum + t.apy, 0) / trades.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AT Token Investment Marketplace</h1>
          <p className="text-sm text-gray-600 mt-1">Real-time government bonds, ETFs & healthcare funds trading</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-600 text-white px-3 py-1">
            <Activity className="w-3 h-3 mr-1" />
            Live Market
          </Badge>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={() => setIsNewTradeOpen(true)}>
            <Wallet className="w-4 h-4 mr-2" />
            New Trade
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
                <p className="text-xl font-bold text-gray-900">PKR {(totalInvested / 1000000).toFixed(1)}M</p>
              </div>
              <Landmark className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Profit</p>
                <p className="text-xl font-bold text-gray-900">PKR {(totalProfit / 1000000).toFixed(1)}M</p>
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
                <p className="text-xl font-bold text-emerald-600">{avgAPY.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Active Trades</p>
                <p className="text-xl font-bold text-gray-900">{trades.filter(t => t.status === 'running').length}</p>
              </div>
              <Coins className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart - AT Token Balance Over Time */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">AT Token Balance Over Time</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={timeRange === '1D' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('1D')}
              >
                1D
              </Button>
              <Button
                variant={timeRange === '1W' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('1W')}
              >
                1W
              </Button>
              <Button
                variant={timeRange === '1M' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('1M')}
              >
                1M
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} label={{ value: 'AT Tokens', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                labelStyle={{ color: '#6b7280', fontWeight: '600' }}
              />
              <Legend />
              <Area type="monotone" dataKey="atBalance" fill="#10b981" fillOpacity={0.2} stroke="#10b981" strokeWidth={2} name="AT Balance" />
              <Line type="monotone" dataKey="atBalance" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} name="Current Balance" />
              {/* Trade Rectangles */}
              {trades.map((trade, index) => (
                <ReferenceArea
                  key={trade.id}
                  x1={trade.startTime}
                  x2={trade.endTime}
                  y1={trade.startAT}
                  y2={trade.endAT}
                  stroke={index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#8b5cf6'}
                  strokeWidth={2}
                  fill={index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#8b5cf6'}
                  fillOpacity={0.2}
                  label={{
                    value: trade.label,
                    position: 'center',
                    fill: '#000',
                    fontSize: 11,
                    fontWeight: 600
                  }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Trades List */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Active Trades</CardTitle>
            <Badge className="bg-blue-100 text-blue-700">{trades.length} Total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trades.map((trade) => (
              <Card key={trade.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{trade.label}</h3>
                        <Badge variant={trade.pool === 'asset' ? 'default' : 'secondary'}>
                          {trade.pool === 'asset' ? 'Asset Pool' : 'Subscription Pool'}
                        </Badge>
                        <Badge variant={trade.status === 'running' ? 'default' : trade.status === 'matured' ? 'secondary' : 'outline'}>
                          {trade.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                        <div>
                          <p className="text-gray-500 text-xs">Principal AT</p>
                          <p className="font-semibold text-gray-900">{trade.principalAT.toLocaleString()} AT</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Profit (PKR)</p>
                          <p className="font-semibold text-green-600">+{trade.profitPKR.toLocaleString()} PKR</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Profit (AT)</p>
                          <p className="font-semibold text-green-600">+{trade.profitAT} AT</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">APY</p>
                          <p className="font-semibold text-emerald-600">{trade.apy}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Time Range</p>
                          <p className="font-semibold text-gray-900">{trade.startTime} - {trade.endTime}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Risk Level</p>
                          <Badge variant={trade.riskLevel === 'low' ? 'secondary' : trade.riskLevel === 'medium' ? 'default' : 'destructive'}>
                            {trade.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Trade Dialog */}
      <Dialog open={isNewTradeOpen} onOpenChange={setIsNewTradeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Trade</DialogTitle>
            <DialogDescription>
              Add a new investment trade to the marketplace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Trade Label</Label>
              <Input
                value={newTrade.label}
                onChange={(e) => setNewTrade({...newTrade, label: e.target.value})}
                placeholder="e.g., Government Bonds - Asset Pool"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pool</Label>
                <Select value={newTrade.pool} onValueChange={(value: any) => setNewTrade({...newTrade, pool: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset Pool</SelectItem>
                    <SelectItem value="subscription">Subscription Pool</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Investment Type</Label>
                <Select value={newTrade.investmentType} onValueChange={(value: any) => setNewTrade({...newTrade, investmentType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government-bond">Government Bond</SelectItem>
                    <SelectItem value="etf">ETF</SelectItem>
                    <SelectItem value="healthcare-fund">Healthcare Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Principal AT Tokens</Label>
                <Input
                  type="number"
                  value={newTrade.principalAT}
                  onChange={(e) => setNewTrade({...newTrade, principalAT: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Expected Profit (PKR)</Label>
                <Input
                  type="number"
                  value={newTrade.profitPKR}
                  onChange={(e) => setNewTrade({...newTrade, profitPKR: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>APY (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newTrade.apy}
                  onChange={(e) => setNewTrade({...newTrade, apy: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Risk Level</Label>
                <Select value={newTrade.riskLevel} onValueChange={(value: any) => setNewTrade({...newTrade, riskLevel: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTradeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const newTradeComplete: TradeRectangle = {
                  ...newTrade,
                  id: `trade-${trades.length + 1}`,
                  endAT: newTrade.startAT + (newTrade.profitPKR / 100),
                  profitAT: newTrade.profitPKR / 100,
                }
                setTrades([...trades, newTradeComplete])
                setIsNewTradeOpen(false)
              }}
            >
              Create Trade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}