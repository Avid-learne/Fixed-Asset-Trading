'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, AlertTriangle, CheckCircle, ArrowRight, BarChart3, PieChart as PieChartIcon, Target } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts'

const poolPerformanceData = [
  { pool: 'Pool A', apy: 8.2, risk: 'Medium', volume: 'PKR 120M', allocation: 45 },
  { pool: 'Pool B', apy: 12.5, risk: 'High', volume: 'PKR 85M', allocation: 30 },
  { pool: 'Pool C', apy: 4.5, risk: 'Low', volume: 'PKR 210M', allocation: 25 },
]

const historicalData = [
  { month: 'Jan', poolA: 100, poolB: 100, poolC: 100 },
  { month: 'Feb', poolA: 102, poolB: 105, poolC: 101 },
  { month: 'Mar', poolA: 105, poolB: 108, poolC: 102 },
  { month: 'Apr', poolA: 104, poolB: 112, poolC: 103 },
  { month: 'May', poolA: 108, poolB: 115, poolC: 104 },
  { month: 'Jun', poolA: 112, poolB: 125, poolC: 105 },
]

const riskMetrics = [
  { name: 'Volatility', safe: 5, balanced: 15, aggressive: 30 },
  { name: 'Max Drawdown', safe: 3, balanced: 10, aggressive: 25 },
  { name: 'Liquidity Risk', safe: 2, balanced: 8, aggressive: 18 },
]

export default function TradingSimulatorPage() {
  const [strategy, setStrategy] = useState('balanced')
  const [pool, setPool] = useState('pool-a')
  const [amount, setAmount] = useState(1000000)
  const [duration, setDuration] = useState('6')
  const [simulating, setSimulating] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('simulator')

  const runSimulation = () => {
    setSimulating(true)
    setTimeout(() => {
      const baseReturn = strategy === 'aggressive' ? 12.5 : strategy === 'balanced' ? 8.2 : 4.5
      const projectedValue = amount * (1 + baseReturn / 100)
      
      setResults({
        projectedReturn: `${baseReturn}%`,
        riskScore: strategy === 'aggressive' ? 'High' : strategy === 'balanced' ? 'Medium' : 'Low',
        projectedValue: `$${(projectedValue / 1000).toFixed(0)}K`,
        projectedProfit: `$${((projectedValue - amount) / 1000).toFixed(0)}K`,
        sharpeRatio: strategy === 'aggressive' ? '1.8' : strategy === 'balanced' ? '2.1' : '1.5',
        maxDrawdown: strategy === 'aggressive' ? '-25%' : strategy === 'balanced' ? '-10%' : '-3%',
        chartData: Array.from({ length: parseInt(duration) }, (_, i) => ({
          month: `M${i + 1}`,
          value: 100 + (baseReturn / parseInt(duration)) * (i + 1) + (Math.random() * 2 - 1)
        }))
      })
      setSimulating(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trading Simulator</h1>
        <p className="text-muted-foreground mt-1">Simulate trading strategies and analyze performance before executing real trades.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="pools">Pool Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Simulation Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select AT Pool</label>
                  <Select value={pool} onValueChange={setPool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Pool" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pool-a">General Assets Pool A</SelectItem>
                      <SelectItem value="pool-b">Medical Equipment Pool B</SelectItem>
                      <SelectItem value="pool-c">Real Estate Pool C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Strategy</label>
                  <Select value={strategy} onValueChange={setStrategy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safe">Safe (Low Risk, Low Reward)</SelectItem>
                      <SelectItem value="balanced">Balanced (Medium Risk, Medium Reward)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (High Risk, High Reward)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Investment Amount ($)</label>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (months)</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full mt-4" onClick={runSimulation} disabled={simulating}>
                  {simulating ? 'Running Simulation...' : 'Run Simulation'}
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Simulation Results</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">Projected Return</p>
                        <p className="text-2xl font-bold text-green-600">{results.projectedReturn}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
                        <p className={`text-2xl font-bold ${results.riskScore === 'High' ? 'text-red-600' : results.riskScore === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>{results.riskScore}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">Projected Value</p>
                        <p className="text-2xl font-bold text-primary">{results.projectedValue}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">Est. Profit</p>
                        <p className="text-2xl font-bold text-green-600">{results.projectedProfit}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                        <p className="text-xl font-bold">{results.sharpeRatio}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Max Drawdown</p>
                        <p className="text-xl font-bold text-red-600">{results.maxDrawdown}</p>
                      </div>
                    </div>

                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={results.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setResults(null)}>Reset</Button>
                      <Button className="bg-green-600 hover:bg-green-700">Confirm & Execute Trade</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                    <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
                    <p>Run a simulation to see projected results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Pool Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {poolPerformanceData.map((pool, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{pool.pool}</CardTitle>
                          <Badge variant={pool.risk === 'High' ? 'destructive' : pool.risk === 'Medium' ? 'default' : 'secondary'}>
                            {pool.risk} Risk
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Annual APY</p>
                          <p className="text-3xl font-bold text-green-600">{pool.apy}%</p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Trading Volume</span>
                          <span className="font-medium">{pool.volume}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Allocation</span>
                          <span className="font-medium">{pool.allocation}%</span>
                        </div>
                        <Button variant="outline" className="w-full mt-2">Select Pool</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-base">Historical Performance (6 months)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="poolA" stroke="#3b82f6" name="Pool A" strokeWidth={2} />
                        <Line type="monotone" dataKey="poolB" stroke="#10b981" name="Pool B" strokeWidth={2} />
                        <Line type="monotone" dataKey="poolC" stroke="#f59e0b" name="Pool C" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="safe" fill="#10b981" name="Safe Strategy" />
                    <Bar dataKey="balanced" fill="#f59e0b" name="Balanced Strategy" />
                    <Bar dataKey="aggressive" fill="#ef4444" name="Aggressive Strategy" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Optimization Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-green-900">Recommended: Balanced Portfolio</p>
                    <p className="text-xs text-green-700 mt-1">40% Pool A, 35% Pool B, 25% Pool C provides optimal risk-reward ratio.</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex gap-3">
                  <Target className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-emerald-900">Diversification Score: 8.5/10</p>
                    <p className="text-xs text-emerald-700 mt-1">Your current allocation shows good diversification across asset types.</p>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-yellow-900">Market Condition Alert</p>
                    <p className="text-xs text-yellow-700 mt-1">Current gas fees are elevated. Consider delaying trades by 24-48 hours.</p>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <h4 className="font-medium text-sm">Key Performance Indicators</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Avg. Transaction Cost</p>
                      <p className="text-lg font-bold">0.3%</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Liquidity Score</p>
                      <p className="text-lg font-bold">9.2/10</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                      <p className="text-lg font-bold text-green-600">78%</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Avg. Hold Time</p>
                      <p className="text-lg font-bold">42 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
