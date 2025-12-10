'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Search,
  Download,
  Filter,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  Building2,
  PieChart
} from 'lucide-react'

// Profit distribution entry type
interface ProfitDistribution {
  id: string
  distributionDate: string
  period: string
  patientId: string
  patientName: string
  patientCNIC: string
  tokenBalance: number
  profitShare: number
  profitAmount: number
  distributionStatus: 'completed' | 'pending' | 'processing'
  transactionHash?: string
  investmentType: string
  profitRate: number
}

// Mock profit distribution data
const MOCK_PROFIT_DISTRIBUTIONS: ProfitDistribution[] = [
  {
    id: 'DIST-001',
    distributionDate: '2025-12-10T10:00:00Z',
    period: 'November 2025',
    patientId: 'PAT-001',
    patientName: 'Ahmed Khan',
    patientCNIC: '42101-1234567-1',
    tokenBalance: 25000,
    profitShare: 5.2,
    profitAmount: 13000,
    distributionStatus: 'completed',
    transactionHash: '0x1234...5678',
    investmentType: 'Commercial Real Estate',
    profitRate: 8.5
  },
  {
    id: 'DIST-002',
    distributionDate: '2025-12-10T10:05:00Z',
    period: 'November 2025',
    patientId: 'PAT-002',
    patientName: 'Fatima Ali',
    patientCNIC: '42201-9876543-2',
    tokenBalance: 18000,
    profitShare: 3.8,
    profitAmount: 9360,
    distributionStatus: 'completed',
    transactionHash: '0x2345...6789',
    investmentType: 'Government Bonds',
    profitRate: 6.5
  },
  {
    id: 'DIST-003',
    distributionDate: '2025-12-10T10:10:00Z',
    period: 'November 2025',
    patientId: 'PAT-003',
    patientName: 'Hassan Raza',
    patientCNIC: '42301-5555555-3',
    tokenBalance: 32000,
    profitShare: 6.7,
    profitAmount: 16640,
    distributionStatus: 'processing',
    investmentType: 'Residential Property',
    profitRate: 7.2
  },
  {
    id: 'DIST-004',
    distributionDate: '2025-12-09T14:30:00Z',
    period: 'November 2025',
    patientId: 'PAT-004',
    patientName: 'Ayesha Malik',
    patientCNIC: '42401-7777777-4',
    tokenBalance: 15000,
    profitShare: 3.1,
    profitAmount: 7650,
    distributionStatus: 'completed',
    transactionHash: '0x3456...7890',
    investmentType: 'Corporate Bonds',
    profitRate: 5.8
  },
  {
    id: 'DIST-005',
    distributionDate: '2025-12-09T14:35:00Z',
    period: 'November 2025',
    patientId: 'PAT-005',
    patientName: 'Usman Sheikh',
    patientCNIC: '42501-2222222-5',
    tokenBalance: 28000,
    profitShare: 5.9,
    profitAmount: 14560,
    distributionStatus: 'completed',
    transactionHash: '0x4567...8901',
    investmentType: 'Industrial Property',
    profitRate: 8.0
  },
  {
    id: 'DIST-006',
    distributionDate: '2025-12-09T14:40:00Z',
    period: 'November 2025',
    patientId: 'PAT-006',
    patientName: 'Sara Ahmed',
    patientCNIC: '42601-8888888-6',
    tokenBalance: 22000,
    profitShare: 4.6,
    profitAmount: 11440,
    distributionStatus: 'pending',
    investmentType: 'Retail Spaces',
    profitRate: 7.5
  },
  {
    id: 'DIST-007',
    distributionDate: '2025-12-08T09:00:00Z',
    period: 'October 2025',
    patientId: 'PAT-001',
    patientName: 'Ahmed Khan',
    patientCNIC: '42101-1234567-1',
    tokenBalance: 25000,
    profitShare: 5.3,
    profitAmount: 13250,
    distributionStatus: 'completed',
    transactionHash: '0x5678...9012',
    investmentType: 'Commercial Real Estate',
    profitRate: 8.5
  },
  {
    id: 'DIST-008',
    distributionDate: '2025-12-08T09:05:00Z',
    period: 'October 2025',
    patientId: 'PAT-002',
    patientName: 'Fatima Ali',
    patientCNIC: '42201-9876543-2',
    tokenBalance: 18000,
    profitShare: 3.8,
    profitAmount: 9540,
    distributionStatus: 'completed',
    transactionHash: '0x6789...0123',
    investmentType: 'Government Bonds',
    profitRate: 6.5
  },
  {
    id: 'DIST-009',
    distributionDate: '2025-12-08T09:10:00Z',
    period: 'October 2025',
    patientId: 'PAT-003',
    patientName: 'Hassan Raza',
    patientCNIC: '42301-5555555-3',
    tokenBalance: 30000,
    profitShare: 6.3,
    profitAmount: 15600,
    distributionStatus: 'completed',
    transactionHash: '0x7890...1234',
    investmentType: 'Residential Property',
    profitRate: 7.2
  },
  {
    id: 'DIST-010',
    distributionDate: '2025-12-08T09:15:00Z',
    period: 'October 2025',
    patientId: 'PAT-004',
    patientName: 'Ayesha Malik',
    patientCNIC: '42401-7777777-4',
    tokenBalance: 15000,
    profitShare: 3.2,
    profitAmount: 7800,
    distributionStatus: 'completed',
    transactionHash: '0x8901...2345',
    investmentType: 'Corporate Bonds',
    profitRate: 5.8
  }
]

export default function HospitalProfitDistribution() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')

  // Filter distributions
  const filteredDistributions = MOCK_PROFIT_DISTRIBUTIONS.filter(dist => {
    const matchesSearch = 
      dist.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dist.patientCNIC.includes(searchQuery) ||
      dist.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dist.investmentType.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || dist.distributionStatus === statusFilter
    const matchesPeriod = periodFilter === 'all' || dist.period === periodFilter
    
    return matchesSearch && matchesStatus && matchesPeriod
  })

  // Calculate summary statistics
  const totalDistributed = MOCK_PROFIT_DISTRIBUTIONS
    .filter(d => d.distributionStatus === 'completed')
    .reduce((sum, d) => sum + d.profitAmount, 0)
  
  const totalPatients = new Set(MOCK_PROFIT_DISTRIBUTIONS.map(d => d.patientId)).size
  
  const completedDistributions = MOCK_PROFIT_DISTRIBUTIONS.filter(d => d.distributionStatus === 'completed').length
  
  const pendingAmount = MOCK_PROFIT_DISTRIBUTIONS
    .filter(d => d.distributionStatus === 'pending' || d.distributionStatus === 'processing')
    .reduce((sum, d) => sum + d.profitAmount, 0)

  const uniquePeriods = [...new Set(MOCK_PROFIT_DISTRIBUTIONS.map(d => d.period))].sort().reverse()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'processing': return <TrendingUp className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profit Distribution</h1>
          <p className="text-slate-600 mt-1">View profit distribution details among patients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Distributed</p>
                <p className="text-2xl font-bold text-slate-900">PKR {totalDistributed.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">{completedDistributions} distributions</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
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
                <p className="text-xs text-slate-500 mt-1">Receiving profits</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Amount</p>
                <p className="text-2xl font-bold text-slate-900">PKR {pendingAmount.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">In processing</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg. Profit Rate</p>
                <p className="text-2xl font-bold text-slate-900">7.2%</p>
                <p className="text-xs text-slate-500 mt-1">Overall return</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient name, CNIC, or investment type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm"
            >
              <option value="all">All Periods</option>
              {uniquePeriods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Profit Distribution Tables */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Distributions ({filteredDistributions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="by-patient">By Patient</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Profit Distributions</CardTitle>
              <CardDescription>Complete history of profit distributions to patients</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDistributions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No distributions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Distribution ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Period</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Patient</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Token Balance</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Profit Share %</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Profit Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Investment Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDistributions.map((dist) => (
                        <tr key={dist.id} className="border-b hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-slate-900">{dist.id}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <span>{new Date(dist.distributionDate).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-slate-700">{dist.period}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{dist.patientName}</p>
                              <p className="text-xs text-slate-500">{dist.patientId}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-semibold text-slate-900">{dist.tokenBalance.toLocaleString()} AT</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <ArrowUpRight className="h-3 w-3 text-green-600" />
                              <span className="text-sm font-semibold text-green-600">{dist.profitShare}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-bold text-green-600">PKR {dist.profitAmount.toLocaleString()}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <Building2 className="h-3 w-3 text-slate-400" />
                              <span>{dist.investmentType}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(dist.distributionStatus)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(dist.distributionStatus)}
                                <span>{dist.distributionStatus}</span>
                              </div>
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed Distributions</CardTitle>
              <CardDescription>Successfully distributed profits with transaction records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Distribution ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Period</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Patient</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Profit Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Transaction Hash</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Investment Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDistributions.filter(d => d.distributionStatus === 'completed').map((dist) => (
                      <tr key={dist.id} className="border-b hover:bg-green-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-slate-900">{dist.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span>{new Date(dist.distributionDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-slate-700">{dist.period}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{dist.patientName}</p>
                            <p className="text-xs text-slate-500">{dist.patientCNIC}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-bold text-green-600">PKR {dist.profitAmount.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                            {dist.transactionHash}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-slate-600">{dist.investmentType}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending & Processing Distributions</CardTitle>
              <CardDescription>Distributions awaiting completion or in process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Distribution ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Period</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Patient</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Token Balance</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Profit Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Investment Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDistributions.filter(d => d.distributionStatus === 'pending' || d.distributionStatus === 'processing').map((dist) => (
                      <tr key={dist.id} className="border-b hover:bg-yellow-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-slate-900">{dist.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-slate-700">{dist.period}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{dist.patientName}</p>
                            <p className="text-xs text-slate-500">{dist.patientId}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-slate-900">{dist.tokenBalance.toLocaleString()} AT</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-bold text-yellow-600">PKR {dist.profitAmount.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-slate-600">{dist.investmentType}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(dist.distributionStatus)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(dist.distributionStatus)}
                              <span>{dist.distributionStatus}</span>
                            </div>
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-patient" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribution by Patient</CardTitle>
              <CardDescription>Aggregated profit distribution per patient</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Patient ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Patient Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">CNIC</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Current Tokens</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Total Distributions</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Total Profit</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Avg. Profit Rate</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const patientGroups = MOCK_PROFIT_DISTRIBUTIONS.reduce((acc, dist) => {
                        if (!acc[dist.patientId]) {
                          acc[dist.patientId] = {
                            patientId: dist.patientId,
                            patientName: dist.patientName,
                            patientCNIC: dist.patientCNIC,
                            tokenBalance: dist.tokenBalance,
                            distributions: [],
                            totalProfit: 0,
                            avgProfitRate: 0
                          }
                        }
                        acc[dist.patientId].distributions.push(dist)
                        acc[dist.patientId].totalProfit += dist.profitAmount
                        return acc
                      }, {} as Record<string, any>)

                      return Object.values(patientGroups).map((patient: any) => {
                        const avgRate = patient.distributions.reduce((sum: number, d: any) => sum + d.profitRate, 0) / patient.distributions.length
                        
                        return (
                          <tr key={patient.patientId} className="border-b hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-slate-900">{patient.patientId}</span>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm font-medium text-slate-900">{patient.patientName}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-slate-600">{patient.patientCNIC}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-semibold text-slate-900">{patient.tokenBalance.toLocaleString()} AT</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{patient.distributions.length} distributions</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-bold text-green-600">PKR {patient.totalProfit.toLocaleString()}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-semibold text-purple-600">{avgRate.toFixed(2)}%</span>
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                    })()}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
