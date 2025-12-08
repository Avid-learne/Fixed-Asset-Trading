// src/app/bank/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts'
import { 
  Shield, 
  Building, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  AlertCircle, 
  Banknote, 
  Building2, 
  Wallet, 
  Receipt, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye 
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

const COLORS = ['#0A3D62', '#38ADA9', '#EE5A6F', '#F8B739', '#6C5CE7', '#A29BFE']

type DepositStatus = 'pending' | 'approved' | 'rejected' | 'processing'

interface BankStats {
  totalAssets: number
  totalDeposits: number
  depositsValue: number
  hospitalsConnected: number
  totalRevenue: number
  monthlyRevenue: number
  revenueGrowth: number
  activePatients: number
  totalFundingProvided: number
  pendingApprovals: number
  complianceScore: number
}

interface Deposit {
  id: string
  patientName: string
  hospitalName: string
  assetType: string
  value: number
  status: DepositStatus
  submittedAt: string
  tokenAmount?: number
}

interface Hospital {
  id: string
  name: string
  location: string
  patientsCount: number
  depositsCount: number
  totalValue: number
  status: 'active' | 'inactive'
  joinedDate: string
}

interface RevenueData {
  month: string
  revenue: number
  deposits: number
  tokensFee: number
}

export default function BankDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<BankStats>({
    totalAssets: 2450000,
    totalDeposits: 156,
    depositsValue: 2100000,
    hospitalsConnected: 12,
    totalRevenue: 145000,
    monthlyRevenue: 28500,
    revenueGrowth: 12.4,
    activePatients: 342,
    totalFundingProvided: 2100000,
    pendingApprovals: 8,
    complianceScore: 97
  })

  const handleGenerateReport = () => {
    alert('Generating comprehensive bank activity report... In production, this would generate a downloadable PDF/Excel report.')
  }

  const handleViewAssets = () => {
    window.location.href = '/bank/assets'
  }

  const handleViewAllRequests = () => {
    window.location.href = '/bank/approvals'
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setLoading(false), 1000)
  }, [])


  const recentDeposits: Deposit[] = [
    { id: 'DEP-001', patientName: 'Ahmed Patient', hospitalName: 'Liaquat National Hospital', assetType: 'Gold', value: 50000, status: 'pending', submittedAt: '2025-12-08', tokenAmount: 50000 },
    { id: 'DEP-002', patientName: 'Ahmed Patient', hospitalName: 'Liaquat National Hospital', assetType: 'Silver', value: 25000, status: 'approved', submittedAt: '2025-12-07', tokenAmount: 25000 },
    { id: 'DEP-003', patientName: 'Ahmed Patient', hospitalName: 'Liaquat National Hospital', assetType: 'Gold', value: 75000, status: 'processing', submittedAt: '2025-12-07', tokenAmount: 75000 },
    { id: 'DEP-004', patientName: 'Ahmed Patient', hospitalName: 'Liaquat National Hospital', assetType: 'Silver', value: 30000, status: 'approved', submittedAt: '2025-12-06', tokenAmount: 30000 },
    { id: 'DEP-005', patientName: 'Ahmed Patient', hospitalName: 'Liaquat National Hospital', assetType: 'Gold', value: 60000, status: 'pending', submittedAt: '2025-12-06', tokenAmount: 60000 },
  ]

  const fundingRequests = [
    { id: 'FR-001', hospitalName: 'Liaquat National Hospital', assetValue: 520000, requestedAmount: 416000, assetType: 'Gold Bars (100g)', status: 'pending', submittedAt: '2025-12-08', purpose: 'Medical equipment purchase' },
    { id: 'FR-002', hospitalName: 'Liaquat National Hospital', assetValue: 180000, requestedAmount: 144000, assetType: 'Silver Bars (500g)', status: 'approved', submittedAt: '2025-12-07', purpose: 'Facility expansion' },
    { id: 'FR-003', hospitalName: 'Liaquat National Hospital', assetValue: 390000, requestedAmount: 312000, assetType: 'Gold Coins (75g)', status: 'approved', submittedAt: '2025-12-06', purpose: 'Staff recruitment' },
    { id: 'FR-004', hospitalName: 'Liaquat National Hospital', assetValue: 624000, requestedAmount: 499200, assetType: 'Gold Bars (120g)', status: 'processing', submittedAt: '2025-12-07', purpose: 'New wing construction' },
    { id: 'FR-005', hospitalName: 'Liaquat National Hospital', assetValue: 780000, requestedAmount: 624000, assetType: 'Gold Jewelry (150g)', status: 'pending', submittedAt: '2025-12-08', purpose: 'Advanced diagnostics equipment' },
  ]

  const connectedHospitals: Hospital[] = [
    { id: 'H001', name: 'Liaquat National Hospital', location: 'Karachi, Pakistan', patientsCount: 156, depositsCount: 42, totalValue: 2450000, status: 'active', joinedDate: '2024-03-15' },
  ]

  const revenueData: RevenueData[] = [
    { month: 'Jul', revenue: 18500, deposits: 12000, tokensFee: 6500 },
    { month: 'Aug', revenue: 22000, deposits: 15000, tokensFee: 7000 },
    { month: 'Sep', revenue: 24500, deposits: 16500, tokensFee: 8000 },
    { month: 'Oct', revenue: 26000, deposits: 17500, tokensFee: 8500 },
    { month: 'Nov', revenue: 27000, deposits: 18000, tokensFee: 9000 },
    { month: 'Dec', revenue: 28500, deposits: 19000, tokensFee: 9500 },
  ]

  const assetDistribution = [
    { name: 'Gold Deposits', value: 1250000 },
    { name: 'Silver Deposits', value: 850000 },
    { name: 'Other Assets', value: 350000 },
  ]

  const depositsByStatus = [
    { status: 'Approved', count: 98, percentage: 63 },
    { status: 'Pending', count: 28, percentage: 18 },
    { status: 'Processing', count: 22, percentage: 14 },
    { status: 'Rejected', count: 8, percentage: 5 },
  ]

  const getStatusBadge = (status: DepositStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Clock className="w-3 h-3 mr-1" />Processing</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bank Asset Custody Dashboard</h1>
          <p className="text-muted-foreground mt-1">Secure asset storage and funding management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateReport}>
            <Receipt className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button size="sm" onClick={handleViewAssets}>
            <Eye className="w-4 h-4 mr-2" />
            View Assets
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assets in Custody</CardTitle>
            <Wallet className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalAssets)}
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Securely stored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets Held</CardTitle>
            <Banknote className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalDeposits}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats.depositsValue)} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hospitals Served</CardTitle>
            <Building2 className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.hospitalsConnected}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active partnerships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Custody Fees Earned</CardTitle>
            <DollarSign className="w-5 h-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{stats.revenueGrowth}% this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Custody Fees</CardTitle>
            <Receipt className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">December 2025</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Funding Provided</CardTitle>
            <Banknote className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">
              {formatCurrency(stats.totalFundingProvided)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">To hospitals against assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
            <AlertCircle className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">
              {stats.pendingApprovals}
            </div>
            <p className="text-xs text-orange-600 mt-1">Funding requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Custody Fee Revenue (Last 6 Months)</CardTitle>
            <CardDescription>Fees earned for asset storage and security services</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="revenue" fill="#0A3D62" name="Total Fees" />
                <Bar dataKey="deposits" fill="#38ADA9" name="Storage Fees" />
                <Bar dataKey="tokensFee" fill="#F8B739" name="Security Fees" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Distribution</CardTitle>
            <CardDescription>Breakdown by asset type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Deposits Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Custody Status Overview</CardTitle>
          <CardDescription>Current status of assets held in custody</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {depositsByStatus.map((item) => (
              <div key={item.status} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">{item.status}</span>
                  <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{item.count}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.status === 'Approved' ? 'bg-green-600' :
                      item.status === 'Pending' ? 'bg-yellow-600' :
                      item.status === 'Processing' ? 'bg-blue-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Deposits Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Funding Requests</CardTitle>
              <CardDescription>Hospitals requesting funding against asset custody</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleViewAllRequests}>View All Requests</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Asset Type</TableHead>
                <TableHead>Asset Value</TableHead>
                <TableHead>Funding Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDeposits.map((deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell className="font-medium">{deposit.id}</TableCell>
                  <TableCell>{deposit.hospitalName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{deposit.assetType}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(deposit.value)}</TableCell>
                  <TableCell className="text-green-600 font-medium">{formatCurrency(deposit.tokenAmount || 0)}</TableCell>
                  <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                  <TableCell>{deposit.submittedAt}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Connected Hospitals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Partner Hospitals</CardTitle>
              <CardDescription>Hospitals with active asset custody agreements</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All Hospitals</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assets Held</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Funding Provided</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connectedHospitals.map((hospital) => (
                <TableRow key={hospital.id}>
                  <TableCell className="font-medium">{hospital.name}</TableCell>
                  <TableCell>{hospital.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      {hospital.depositsCount}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(hospital.totalValue)}</TableCell>
                  <TableCell className="text-green-600">{formatCurrency(hospital.totalValue * 0.8)}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </TableCell>
                  <TableCell>{hospital.joinedDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bank Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Custody Performance</CardTitle>
          <CardDescription>Asset security and compliance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Security & Compliance</span>
                <Badge className="bg-green-100 text-green-800">{stats.complianceScore}%</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.complianceScore}%` }} />
              </div>
              <p className="text-xs text-green-600">Excellent standing</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Asset Safety Rating</span>
                <Badge className="bg-blue-100 text-blue-800">AAA</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '98%' }} />
              </div>
              <p className="text-xs text-blue-600">Maximum security</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Funding Reliability</span>
                <Badge className="bg-purple-100 text-purple-800">99.2%</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '99%' }} />
              </div>
              <p className="text-xs text-purple-600">Highly reliable</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}