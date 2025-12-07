'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Search, Shield, DollarSign, Percent, BarChart3, Building2, AlertCircle } from 'lucide-react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface InvestmentOpportunity {
  id: string
  hospital: string
  assetType: 'equipment' | 'real_estate' | 'receivables' | 'patents'
  assetName: string
  totalValue: number
  requestedFunding: number
  fundedAmount: number
  apy: number
  duration: number // months
  riskScore: number // 1-10
  complianceScore: number
  status: 'open' | 'funded' | 'closed'
  priceChange24h: number
  volume24h: number
}

const mockInvestments: InvestmentOpportunity[] = [
  {
    id: 'INV-001',
    hospital: 'City General Hospital',
    assetType: 'equipment',
    assetName: 'Advanced MRI System',
    totalValue: 1250000,
    requestedFunding: 1000000,
    fundedAmount: 750000,
    apy: 8.5,
    duration: 36,
    riskScore: 3,
    complianceScore: 98,
    status: 'open',
    priceChange24h: 2.4,
    volume24h: 125000
  },
  {
    id: 'INV-002',
    hospital: 'Metro Medical Center',
    assetType: 'real_estate',
    assetName: 'Medical Office Building Expansion',
    totalValue: 4500000,
    requestedFunding: 3600000,
    fundedAmount: 3600000,
    apy: 6.2,
    duration: 60,
    riskScore: 2,
    complianceScore: 99,
    status: 'funded',
    priceChange24h: -0.5,
    volume24h: 280000
  },
  {
    id: 'INV-003',
    hospital: 'Regional Health System',
    assetType: 'receivables',
    assetName: 'Patient Receivables Pool Q4',
    totalValue: 850000,
    requestedFunding: 680000,
    fundedAmount: 510000,
    apy: 9.5,
    duration: 12,
    riskScore: 4,
    complianceScore: 96,
    status: 'open',
    priceChange24h: 3.2,
    volume24h: 95000
  },
  {
    id: 'INV-004',
    hospital: 'Sunrise Medical',
    assetType: 'equipment',
    assetName: 'Surgical Robotics Suite',
    totalValue: 2100000,
    requestedFunding: 1680000,
    fundedAmount: 1260000,
    apy: 7.8,
    duration: 48,
    riskScore: 3,
    complianceScore: 97,
    status: 'open',
    priceChange24h: 5.1,
    volume24h: 185000
  },
  {
    id: 'INV-005',
    hospital: 'Innovation Health',
    assetType: 'patents',
    assetName: 'Medical Device Patent Portfolio',
    totalValue: 1800000,
    requestedFunding: 1440000,
    fundedAmount: 720000,
    apy: 11.2,
    duration: 24,
    riskScore: 6,
    complianceScore: 94,
    status: 'open',
    priceChange24h: 8.3,
    volume24h: 65000
  }
]

const portfolioData = [
  { name: 'Equipment', value: 35, amount: 3500000 },
  { name: 'Real Estate', value: 40, amount: 4000000 },
  { name: 'Receivables', value: 15, amount: 1500000 },
  { name: 'Patents', value: 10, amount: 1000000 }
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

const performanceData = [
  { month: 'Jul', returns: 6.5, volume: 8500000 },
  { month: 'Aug', returns: 7.2, volume: 9200000 },
  { month: 'Sep', returns: 6.8, volume: 8800000 },
  { month: 'Oct', returns: 7.5, volume: 9800000 },
  { month: 'Nov', returns: 8.2, volume: 10500000 },
  { month: 'Dec', returns: 8.8, volume: 11200000 }
]

export default function BankMarketplace() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('apy')
  const [riskFilter, setRiskFilter] = useState('all')

  const assetTypes = [
    { value: 'all', label: 'All Assets' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'receivables', label: 'Receivables' },
    { value: 'patents', label: 'Patents' }
  ]

  const riskLevels = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk (1-3)' },
    { value: 'medium', label: 'Medium Risk (4-6)' },
    { value: 'high', label: 'High Risk (7-10)' }
  ]

  const filteredInvestments = mockInvestments.filter(inv => {
    const matchesSearch = inv.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inv.assetName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || inv.assetType === selectedType
    const matchesRisk = riskFilter === 'all' || 
                       (riskFilter === 'low' && inv.riskScore <= 3) ||
                       (riskFilter === 'medium' && inv.riskScore >= 4 && inv.riskScore <= 6) ||
                       (riskFilter === 'high' && inv.riskScore >= 7)
    return matchesSearch && matchesType && matchesRisk
  })

  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    switch (sortBy) {
      case 'apy': return b.apy - a.apy
      case 'funding': return (b.fundedAmount / b.requestedFunding) - (a.fundedAmount / a.requestedFunding)
      case 'risk': return a.riskScore - b.riskScore
      case 'compliance': return b.complianceScore - a.complianceScore
      case 'volume': return b.volume24h - a.volume24h
      default: return b.apy - a.apy
    }
  })

  const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.fundedAmount, 0)
  const avgAPY = (mockInvestments.reduce((sum, inv) => sum + inv.apy, 0) / mockInvestments.length).toFixed(2)
  const avgCompliance = (mockInvestments.reduce((sum, inv) => sum + inv.complianceScore, 0) / mockInvestments.length).toFixed(1)

  const getRiskBadge = (score: number) => {
    if (score <= 3) return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
    if (score <= 6) return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
    return <Badge className="bg-red-100 text-red-800">High Risk</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Investment Marketplace</h1>
        <p className="text-muted-foreground mt-1">Explore and fund tokenized hospital assets</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  ${(totalInvested / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg APY</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{avgAPY}%</p>
              </div>
              <Percent className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Compliance</p>
                <p className="text-2xl font-bold text-foreground mt-1">{avgCompliance}%</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Deals</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {mockInvestments.filter(i => i.status === 'open').length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any, name: any, props: any) => [`$${props.payload.amount.toLocaleString()}`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Returns & Volume Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="returns" stroke="#10B981" strokeWidth={2} name="Returns %" />
                <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#3B82F6" strokeWidth={2} name="Volume ($)" />
              </LineChart>
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
                placeholder="Search hospitals or assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {riskLevels.map(risk => (
                  <SelectItem key={risk.value} value={risk.value}>
                    {risk.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apy">APY: High to Low</SelectItem>
                <SelectItem value="funding">Funding Progress</SelectItem>
                <SelectItem value="risk">Risk: Low to High</SelectItem>
                <SelectItem value="compliance">Compliance Score</SelectItem>
                <SelectItem value="volume">24h Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Investment Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedInvestments.map(inv => {
              const fundingProgress = (inv.fundedAmount / inv.requestedFunding) * 100

              return (
                <div key={inv.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{inv.assetName}</h3>
                        <Badge variant="outline">{inv.assetType.replace('_', ' ')}</Badge>
                        {getRiskBadge(inv.riskScore)}
                        {inv.status === 'open' && (
                          <Badge className="bg-green-100 text-green-800">Open</Badge>
                        )}
                        {inv.status === 'funded' && (
                          <Badge className="bg-blue-100 text-blue-800">Fully Funded</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{inv.hospital}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">APY: </span>
                          <span className="font-semibold text-green-600">{inv.apy}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration: </span>
                          <span className="font-semibold">{inv.duration} months</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Compliance: </span>
                          <span className="font-semibold">{inv.complianceScore}%</span>
                        </div>
                        <div className={`flex items-center gap-1 ${inv.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {inv.priceChange24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {inv.priceChange24h >= 0 ? '+' : ''}{inv.priceChange24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Due Diligence</Button>
                      <Button size="sm" disabled={inv.status === 'funded'}>
                        {inv.status === 'funded' ? 'Funded' : 'Invest'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Funding Progress: ${inv.fundedAmount.toLocaleString()} / ${inv.requestedFunding.toLocaleString()}
                      </span>
                      <span className="font-semibold">{fundingProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${fundingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
