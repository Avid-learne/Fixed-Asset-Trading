'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Coins, TrendingUp, TrendingDown, CheckCircle, Activity, Wallet, AlertCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface AvailableToken {
  id: string
  depositId: string
  patientName: string
  assetType: 'Gold' | 'Silver'
  weight: number
  atTokens: number
  mintedDate: string
  currentlyInTrading: boolean
}

interface TradePosition {
  id: string
  tokenId: string
  atAmount: number
  investedValue: number
  currentValue: number
  profitLoss: number
  profitLossPercent: number
  entryDate: string
  status: 'active' | 'closed'
}

const mockAvailableTokens: AvailableToken[] = [
  {
    id: 'AT-001',
    depositId: 'DEP-1001',
    patientName: 'John Patient',
    assetType: 'Gold',
    weight: 50,
    atTokens: 7500,
    mintedDate: '2024-12-05',
    currentlyInTrading: false
  },
  {
    id: 'AT-002',
    depositId: 'DEP-1002',
    patientName: 'Sarah Johnson',
    assetType: 'Silver',
    weight: 200,
    atTokens: 500,
    mintedDate: '2024-12-06',
    currentlyInTrading: false
  }
]

const mockActivePositions: TradePosition[] = []

const assetPoolData = [
  { month: 'Jul', value: 100 },
  { month: 'Aug', value: 103 },
  { month: 'Sep', value: 107 },
  { month: 'Oct', value: 105 },
  { month: 'Nov', value: 112 },
  { month: 'Dec', value: 118 },
]

export default function TradingPage() {
  const [availableTokens] = useState<AvailableToken[]>(mockAvailableTokens)
  const [activePositions] = useState<TradePosition[]>(mockActivePositions)
  const [selectedToken, setSelectedToken] = useState<AvailableToken | null>(null)
  const [showTradeDialog, setShowTradeDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('available')

  const handleOpenTrade = (token: AvailableToken) => {
    setSelectedToken(token)
    setShowTradeDialog(true)
  }

  const handleExecuteTrade = () => {
    setShowTradeDialog(false)
    setSelectedToken(null)
  }

  const totalATInTrading = activePositions.reduce((sum, pos) => sum + pos.atAmount, 0)
  const totalInvestedValue = activePositions.reduce((sum, pos) => sum + pos.investedValue, 0)
  const totalCurrentValue = activePositions.reduce((sum, pos) => sum + pos.currentValue, 0)
  const totalProfitLoss = totalCurrentValue - totalInvestedValue
  const totalProfitLossPercent = totalInvestedValue > 0 ? ((totalProfitLoss / totalInvestedValue) * 100).toFixed(2) : '0.00'

  // Token breakdown
  const assetTokensInTrading = availableTokens.filter(t => t.currentlyInTrading).reduce((sum, t) => sum + t.atTokens, 0)
  const assetTokensAvailable = availableTokens.filter(t => !t.currentlyInTrading).reduce((sum, t) => sum + t.atTokens, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AT Token Trading</h1>
        <p className="text-muted-foreground mt-1">Trade Asset Tokens (AT) in dedicated pools for maximum returns.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Total AT in Trading
              <Coins className="w-4 h-4 text-accent" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalATInTrading.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Asset Tokens</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Invested Value
              <Wallet className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">PKR {(totalInvestedValue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground mt-1">Total investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Current Value
              <TrendingUp className="w-4 h-4 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">PKR {(totalCurrentValue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground mt-1">Portfolio value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Profit/Loss
              {totalProfitLoss >= 0 ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-error" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-success' : 'text-error'}`}>
              PKR {Math.abs(totalProfitLoss).toLocaleString()}
            </p>
            <p className={`text-sm mt-1 ${totalProfitLoss >= 0 ? 'text-success' : 'text-error'}`}>
              {totalProfitLoss >= 0 ? '+' : '-'}{Math.abs(parseFloat(totalProfitLossPercent))}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AT Token Source Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-warning/20 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-warning">●</span>
              AT Tokens from Asset Deposits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">In Trading:</span>
              <span className="text-2xl font-bold text-warning">{assetTokensInTrading.toLocaleString()} AT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Available:</span>
              <span className="text-xl font-semibold">{assetTokensAvailable.toLocaleString()} AT</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="text-lg font-bold">{(assetTokensInTrading + assetTokensAvailable).toLocaleString()} AT</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From gold/silver deposits. Currently in Asset Pool (12.5% APY)
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[450px]">
          <TabsTrigger value="available">Available Tokens</TabsTrigger>
          <TabsTrigger value="positions">Active Positions</TabsTrigger>
          <TabsTrigger value="pools">Pool Analytics</TabsTrigger>
        </TabsList>

        {/* Available Tokens Tab */}
        <TabsContent value="available" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available AT Tokens for Trading</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Tokens not currently in trading pools. Select to start trading.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                      <TableHead>Token ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Asset Type</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead className="text-right">AT Tokens</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableTokens.map((token) => (
                    <TableRow key={token.id}>
                      <TableCell className="font-mono text-xs">{token.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{token.patientName}</p>
                          <p className="text-xs text-muted-foreground">{token.depositId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          token.assetType === 'Gold' 
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }>
                          {token.assetType}
                        </Badge>
                      </TableCell>
                      <TableCell>{token.weight}g</TableCell>
                      <TableCell className="text-right font-bold text-accent">
                        {token.atTokens.toLocaleString()} AT
                      </TableCell>
                      <TableCell>
                        {token.currentlyInTrading ? (
                          <Badge className="bg-success">In Trading</Badge>
                        ) : (
                          <Badge variant="outline">Available</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm"
                          onClick={() => handleOpenTrade(token)}
                          disabled={token.currentlyInTrading}
                        >
                          Start Trading
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Positions Tab */}
        <TabsContent value="positions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Trading Positions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Currently active positions in trading pools with live profit/loss tracking.
              </p>
            </CardHeader>
            <CardContent>
              {activePositions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Activity className="w-16 h-16 mb-4 opacity-20" />
                  <p>No active trading positions</p>
                  <p className="text-sm mt-1">Start trading AT tokens to see positions here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position ID</TableHead>
                      <TableHead>Token ID</TableHead>
                      <TableHead className="text-right">AT Amount</TableHead>
                      <TableHead className="text-right">Invested (PKR)</TableHead>
                      <TableHead className="text-right">Current (PKR)</TableHead>
                      <TableHead className="text-right">P/L</TableHead>
                      <TableHead>Entry Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activePositions.map((position) => (
                      <TableRow key={position.id}>
                        <TableCell className="font-mono text-xs">{position.id}</TableCell>
                        <TableCell className="font-mono text-xs">{position.tokenId}</TableCell>
                        <TableCell className="text-right font-bold text-accent">
                          {position.atAmount.toLocaleString()} AT
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {position.investedValue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {position.currentValue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={position.profitLoss >= 0 ? 'text-success' : 'text-error'}>
                            <p className="font-bold">
                              {position.profitLoss >= 0 ? '+' : ''}{position.profitLoss.toLocaleString()}
                            </p>
                            <p className="text-xs">
                              ({position.profitLoss >= 0 ? '+' : ''}{position.profitLossPercent}%)
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{position.entryDate}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            Close Position
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pool Analytics Tab */}
        <TabsContent value="pools" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Pool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Asset Pool Performance</span>
                  <Badge className="bg-warning">Asset Deposits</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  AT tokens from gold/silver asset deposits
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-warning/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Current APY</p>
                    <p className="text-2xl font-bold text-warning">12.5%</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Pool Size</p>
                    <p className="text-2xl font-bold">PKR 850K</p>
                  </div>
                </div>

                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={assetPoolData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level:</span>
                    <span className="font-medium">Medium-High</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Positions:</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Hold Time:</span>
                    <span className="font-medium">45 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Trade Dialog */}
      <Dialog open={showTradeDialog} onOpenChange={setShowTradeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Start Trading Position</DialogTitle>
            <DialogDescription>
              Add AT tokens to a trading pool to start earning returns
            </DialogDescription>
          </DialogHeader>
          
          {selectedToken && (
            <div className="space-y-6 py-4">
              {/* Token Info */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Token Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token ID:</span>
                    <span className="font-mono font-medium">{selectedToken.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient:</span>
                    <span className="font-medium">{selectedToken.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset Type:</span>
                    <Badge variant="outline" className={
                      selectedToken.assetType === 'Gold' 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }>
                      {selectedToken.assetType}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="font-medium">{selectedToken.weight} grams</span>
                  </div>
                  <div className="flex justify-between col-span-2 pt-2 border-t">
                    <span className="text-muted-foreground">AT Tokens:</span>
                    <span className="font-bold text-lg text-accent">{selectedToken.atTokens.toLocaleString()} AT</span>
                  </div>
                </div>
              </div>

              {/* Pool Details */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-semibold">Asset Pool Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected APY:</span>
                    <span className="font-bold text-success">
                      12.5%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level:</span>
                    <span className="font-medium">
                      Medium-High
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min. Hold Period:</span>
                    <span className="font-medium">30 days</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Investment Value:</span>
                    <span className="font-bold">PKR {(selectedToken.atTokens * 100).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Important Information</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Once tokens enter a trading pool, they cannot be withdrawn for minimum 30 days. 
                    Returns are calculated daily and compounded monthly.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExecuteTrade} className="bg-success hover:bg-success/90">
              <CheckCircle className="w-4 h-4 mr-2" />
              Start Trading
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
