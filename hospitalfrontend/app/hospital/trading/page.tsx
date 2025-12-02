// src/app/hospital/trading/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Play, Pause, TrendingUp, DollarSign, Clock, BarChart3 } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface TradeData {
  time: number
  value: number
  profit: number
}

export default function TradingSimulationPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [tradeData, setTradeData] = useState<TradeData[]>([])
  const [currentValue, setCurrentValue] = useState(100000)
  const [totalProfit, setTotalProfit] = useState(0)
  const [tradeDuration, setTradeDuration] = useState(0)
  const [selectedAsset, setSelectedAsset] = useState('')
  const [tradeAmount, setTradeAmount] = useState('')

  const startTrading = () => {
    if (!selectedAsset || !tradeAmount) {
      alert('Please select an asset and enter trade amount')
      return
    }

    setIsRunning(true)
    const initialValue = parseFloat(tradeAmount)
    setCurrentValue(initialValue)
    
    const interval = setInterval(() => {
      setTradeDuration(prev => prev + 1)
      
      const change = (Math.random() - 0.48) * 1000
      setCurrentValue(prev => {
        const newValue = prev + change
        return newValue > 0 ? newValue : prev
      })
      
      setTotalProfit(prev => prev + change)
      
      setTradeData(prev => {
        const newData = [...prev, {
          time: prev.length,
          value: currentValue + change,
          profit: totalProfit + change
        }]
        return newData.slice(-50)
      })
    }, 1000)

    setTimeout(() => {
      clearInterval(interval)
      setIsRunning(false)
    }, 30000)
  }

  const stopTrading = () => {
    setIsRunning(false)
  }

  const resetTrading = () => {
    setIsRunning(false)
    setTradeData([])
    setCurrentValue(parseFloat(tradeAmount) || 100000)
    setTotalProfit(0)
    setTradeDuration(0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trading Simulation</h1>
        <p className="text-gray-500 mt-1">Simulate asset trading to generate returns on tokenized assets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current Value</CardTitle>
            <DollarSign className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentValue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Real-time value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Profit/Loss</CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-success' : 'text-error'}`}>
              {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {((totalProfit / parseFloat(tradeAmount || '100000')) * 100).toFixed(2)}% return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Duration</CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {tradeDuration}s
            </div>
            <p className="text-xs text-gray-500 mt-1">Time elapsed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
            <BarChart3 className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <Badge variant={isRunning ? 'success' : 'outline'}>
              {isRunning ? 'Running' : 'Stopped'}
            </Badge>
            <p className="text-xs text-gray-500 mt-2">
              {tradeData.length} data points
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trading Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Asset
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                disabled={isRunning}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Choose asset...</option>
                <option value="real_estate">Real Estate Portfolio</option>
                <option value="commodities">Commodities Bundle</option>
                <option value="securities">Securities Package</option>
                <option value="mixed">Mixed Assets</option>
              </select>
            </div>

            <Input
              label="Trade Amount (USD)"
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              placeholder="100000"
              disabled={isRunning}
            />

            <div className="flex items-end space-x-2">
              {!isRunning ? (
                <>
                  <Button onClick={startTrading} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Start Trading
                  </Button>
                  <Button onClick={resetTrading} variant="outline">
                    Reset
                  </Button>
                </>
              ) : (
                <Button onClick={stopTrading} variant="destructive" className="flex-1">
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Trading
                </Button>
              )}
            </div>
          </div>

          {isRunning && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Trading simulation in progress. The system is actively trading tokenized assets to generate returns.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Real-Time Trading Chart</CardTitle>
        </CardHeader>
        <CardContent>
          {tradeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={tradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                <YAxis 
                  label={{ value: 'Value (USD)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Value']}
                  labelFormatter={(label) => `Time: ${label}s`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#38ADA9" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                <p>Start trading to see real-time data</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trading Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">How Trading Works</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Tokenized assets are traded on financial markets
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Returns are generated through market movements
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Profits are converted to additional health tokens
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  All trades are recorded in the audit log
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Risk Management</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Diversified portfolio reduces risk exposure
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Stop-loss mechanisms protect capital
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Regular monitoring ensures optimal performance
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Bank oversight maintains regulatory compliance
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}