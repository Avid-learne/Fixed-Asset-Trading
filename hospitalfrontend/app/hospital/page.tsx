'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  TrendingUp, 
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  UserCheck,
  Wallet,
  Building2,
  PieChart,
  Calendar,
  FileText,
  BarChart3,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts'

// Dashboard stats data
interface DashboardStats {
  totalPatients: number
  activePatients: number
  patientChange: number
  totalTokensMinted: number
  tokenChange: number
  totalProfitDistributed: number
  profitChange: number
  pendingApprovals: number
  approvalChange: number
}

// Recent activity type
interface RecentActivity {
  id: string
  type: 'deposit' | 'approval' | 'minting' | 'profit' | 'kyc' | 'login'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'pending' | 'warning' | 'error'
  user: string
}

// Patient summary for quick view
interface PatientSummary {
  id: string
  name: string
  registrationId: string
  tokenBalance: number
  status: 'active' | 'inactive' | 'pending'
  lastActivity: string
  totalDeposits: number
}

// Investment performance
interface InvestmentPerformance {
  name: string
  value: number
  change: number
  patients: number
}

// Mock dashboard data
const mockStats: DashboardStats = {
  totalPatients: 1247,
  activePatients: 1089,
  patientChange: 8.2,
  totalTokensMinted: 2847500,
  tokenChange: 12.5,
  totalProfitDistributed: 3678900,
  profitChange: 15.8,
  pendingApprovals: 23,
  approvalChange: -5.2
}

const mockRecentActivities: RecentActivity[] = [
  {
    id: 'ACT-001',
    type: 'approval',
    title: 'Deposit Approved',
    description: 'Gold deposit of PKR 150,000 approved for Ahmed Khan',
    timestamp: '2025-12-10T10:30:00Z',
    status: 'success',
    user: 'Staff-001'
  },
  {
    id: 'ACT-002',
    type: 'minting',
    title: 'Tokens Minted',
    description: '15,000 AT tokens minted for patient PAT-001',
    timestamp: '2025-12-10T10:15:00Z',
    status: 'success',
    user: 'System'
  },
  {
    id: 'ACT-003',
    type: 'deposit',
    title: 'New Deposit Submitted',
    description: 'Hassan Raza submitted property deposit worth PKR 450,000',
    timestamp: '2025-12-10T09:45:00Z',
    status: 'pending',
    user: 'PAT-003'
  },
  {
    id: 'ACT-004',
    type: 'profit',
    title: 'Profit Distributed',
    description: 'November 2025 profit of PKR 456,780 distributed to 234 patients',
    timestamp: '2025-12-10T09:00:00Z',
    status: 'success',
    user: 'System'
  },
  {
    id: 'ACT-005',
    type: 'kyc',
    title: 'KYC Verification',
    description: 'Ayesha Malik completed KYC verification',
    timestamp: '2025-12-10T08:30:00Z',
    status: 'success',
    user: 'PAT-004'
  },
  {
    id: 'ACT-006',
    type: 'login',
    title: 'Failed Login Attempt',
    description: 'Multiple failed login attempts from IP 192.168.1.205',
    timestamp: '2025-12-10T08:15:00Z',
    status: 'warning',
    user: 'Unknown'
  }
]

const mockTopPatients: PatientSummary[] = [
  {
    id: 'PAT-001',
    name: 'Ahmed Khan',
    registrationId: 'LNH-2024-001',
    tokenBalance: 25000,
    status: 'active',
    lastActivity: '2025-12-10',
    totalDeposits: 250000
  },
  {
    id: 'PAT-003',
    name: 'Hassan Raza',
    registrationId: 'LNH-2024-003',
    tokenBalance: 32000,
    status: 'active',
    lastActivity: '2025-12-10',
    totalDeposits: 320000
  },
  {
    id: 'PAT-002',
    name: 'Fatima Ali',
    registrationId: 'LNH-2024-002',
    tokenBalance: 18000,
    status: 'active',
    lastActivity: '2025-12-09',
    totalDeposits: 180000
  },
  {
    id: 'PAT-005',
    name: 'Usman Tariq',
    registrationId: 'LNH-2024-005',
    tokenBalance: 22000,
    status: 'active',
    lastActivity: '2025-12-09',
    totalDeposits: 220000
  },
  {
    id: 'PAT-004',
    name: 'Ayesha Malik',
    registrationId: 'LNH-2024-004',
    tokenBalance: 15000,
    status: 'active',
    lastActivity: '2025-12-08',
    totalDeposits: 150000
  }
]

const mockInvestments: InvestmentPerformance[] = [
  { name: 'Commercial Real Estate', value: 7850250, change: 8.5, patients: 234 },
  { name: 'Government Bonds', value: 5240000, change: 6.5, patients: 189 },
  { name: 'Residential Property', value: 6180000, change: 7.2, patients: 267 },
  { name: 'Corporate Bonds', value: 3920000, change: 5.8, patients: 145 },
  { name: 'Industrial Property', value: 4560000, change: 6.9, patients: 178 }
]

// Chart data
const tokenTrendData = [
  { month: 'Jun', minted: 420000, distributed: 380000 },
  { month: 'Jul', minted: 520000, distributed: 470000 },
  { month: 'Aug', minted: 680000, distributed: 590000 },
  { month: 'Sep', minted: 750000, distributed: 650000 },
  { month: 'Oct', minted: 890000, distributed: 780000 },
  { month: 'Nov', minted: 1050000, distributed: 920000 },
  { month: 'Dec', minted: 847500, distributed: 678900 }
]

const patientGrowthData = [
  { month: 'Jun', active: 820, total: 945 },
  { month: 'Jul', active: 875, total: 1005 },
  { month: 'Aug', active: 920, total: 1058 },
  { month: 'Sep', active: 965, total: 1110 },
  { month: 'Oct', active: 1005, total: 1156 },
  { month: 'Nov', active: 1045, total: 1203 },
  { month: 'Dec', active: 1089, total: 1247 }
]

const investmentDistribution = [
  { name: 'Commercial RE', value: 28, color: '#3b82f6' },
  { name: 'Government Bonds', value: 19, color: '#10b981' },
  { name: 'Residential', value: 22, color: '#f59e0b' },
  { name: 'Corporate Bonds', value: 14, color: '#ef4444' },
  { name: 'Industrial', value: 17, color: '#8b5cf6' }
]

const activityByHour = [
  { hour: '00:00', deposits: 2, approvals: 1 },
  { hour: '03:00', deposits: 1, approvals: 0 },
  { hour: '06:00', deposits: 5, approvals: 3 },
  { hour: '09:00', deposits: 18, approvals: 12 },
  { hour: '12:00', deposits: 25, approvals: 20 },
  { hour: '15:00', deposits: 22, approvals: 18 },
  { hour: '18:00', deposits: 15, approvals: 10 },
  { hour: '21:00', deposits: 8, approvals: 5 }
]

export default function HospitalDashboard() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month')

  // Filter data based on time range
  const getFilteredStats = () => {
    const multipliers = {
      today: 0.03,
      week: 0.2,
      month: 1,
      year: 12
    }
    const multiplier = multipliers[timeRange]
    
    return {
      totalPatients: Math.round(mockStats.totalPatients * (timeRange === 'year' ? 1 : multiplier)),
      activePatients: Math.round(mockStats.activePatients * (timeRange === 'year' ? 1 : multiplier)),
      patientChange: mockStats.patientChange * (timeRange === 'today' ? 0.1 : timeRange === 'week' ? 0.5 : 1),
      totalTokensMinted: Math.round(mockStats.totalTokensMinted * multiplier),
      tokenChange: mockStats.tokenChange * (timeRange === 'today' ? 0.2 : timeRange === 'week' ? 0.6 : 1),
      totalProfitDistributed: Math.round(mockStats.totalProfitDistributed * multiplier),
      profitChange: mockStats.profitChange * (timeRange === 'today' ? 0.15 : timeRange === 'week' ? 0.55 : 1),
      pendingApprovals: timeRange === 'today' ? mockStats.pendingApprovals : 
                        timeRange === 'week' ? Math.round(mockStats.pendingApprovals * 1.5) :
                        timeRange === 'month' ? mockStats.pendingApprovals :
                        Math.round(mockStats.pendingApprovals * 2.5),
      approvalChange: mockStats.approvalChange
    }
  }

  const filteredStats = getFilteredStats()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return null
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <Wallet className="h-4 w-4" />
      case 'approval': return <CheckCircle className="h-4 w-4" />
      case 'minting': return <Activity className="h-4 w-4" />
      case 'profit': return <DollarSign className="h-4 w-4" />
      case 'kyc': return <ShieldCheck className="h-4 w-4" />
      case 'login': return <UserCheck className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Dashboard</h1>
          <p className="text-gray-600 mt-1">Liaquat National Hospital - Staff Portal</p>
        </div>
        <div className="flex gap-2">
          <Button variant={timeRange === 'today' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('today')}>
            Today
          </Button>
          <Button variant={timeRange === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('week')}>
            Week
          </Button>
          <Button variant={timeRange === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('month')}>
            Month
          </Button>
          <Button variant={timeRange === 'year' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('year')}>
            Year
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">
              {filteredStats.activePatients.toLocaleString()} active
            </p>
            <div className="flex items-center mt-2">
              {filteredStats.patientChange > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ml-1 ${filteredStats.patientChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(filteredStats.patientChange).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last {timeRange === 'today' ? 'hour' : timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'year'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Minted</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.totalTokensMinted.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">AT Tokens</p>
            <div className="flex items-center mt-2">
              {filteredStats.tokenChange > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ml-1 ${filteredStats.tokenChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(filteredStats.tokenChange).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last {timeRange === 'today' ? 'hour' : timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'year'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Distributed</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {(filteredStats.totalProfitDistributed / 1000).toFixed(0)}K</div>
            <p className="text-xs text-gray-600 mt-1">{timeRange === 'today' ? 'Today' : timeRange === 'week' ? 'This week' : timeRange === 'month' ? 'This month' : 'This year'}</p>
            <div className="flex items-center mt-2">
              {filteredStats.profitChange > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ml-1 ${filteredStats.profitChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(filteredStats.profitChange).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last {timeRange === 'today' ? 'hour' : timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'year'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.pendingApprovals}</div>
            <p className="text-xs text-gray-600 mt-1">Requires action</p>
            <div className="flex items-center mt-2">
              {filteredStats.approvalChange < 0 ? (
                <ArrowDownRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ml-1 ${filteredStats.approvalChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(filteredStats.approvalChange).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last {timeRange === 'today' ? 'hour' : timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'year'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Token Activity Trends
            </CardTitle>
            <CardDescription>Monthly minting and distribution overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tokenTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="minted" fill="#3b82f6" name="Minted" />
                <Bar dataKey="distributed" fill="#10b981" name="Distributed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Patient Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Patient Growth
            </CardTitle>
            <CardDescription>Active vs total patient registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={patientGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Total" />
                <Area type="monotone" dataKey="active" stroke="#10b981" fill="#10b981" fillOpacity={0.5} name="Active" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Recent Activities
              </CardTitle>
              <CardDescription>Latest system events and actions</CardDescription>
            </div>
            <Link href="/hospital/audit">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRecentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'success' ? 'bg-green-100' :
                    activity.status === 'pending' ? 'bg-yellow-100' :
                    activity.status === 'warning' ? 'bg-orange-100' :
                    'bg-red-100'
                  }`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      {getStatusIcon(activity.status)}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTimestamp(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Investment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-orange-600" />
              Investment Mix
            </CardTitle>
            <CardDescription>Portfolio distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={investmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {investmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {investmentDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Top Patients & Investment Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Top Patients by Token Balance
              </CardTitle>
              <CardDescription>Patients with highest asset tokens</CardDescription>
            </div>
            <Link href="/hospital/patients">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Deposits</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTopPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{patient.name}</p>
                        <p className="text-xs text-gray-500">{patient.lastActivity}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{patient.registrationId}</TableCell>
                    <TableCell className="font-medium">{patient.tokenBalance.toLocaleString()} AT</TableCell>
                    <TableCell className="text-sm">PKR {(patient.totalDeposits / 1000).toFixed(0)}K</TableCell>
                    <TableCell>
                      <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                        {patient.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Investment Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Investment Performance
              </CardTitle>
              <CardDescription>Current investment portfolio overview</CardDescription>
            </div>
            <Link href="/hospital/marketplace">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Marketplace
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockInvestments.map((investment, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{investment.name}</p>
                    <p className="text-xs text-gray-500">{investment.patients} patients invested</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">PKR {(investment.value / 1000000).toFixed(2)}M</p>
                    <div className="flex items-center justify-end mt-1">
                      {investment.change > 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-xs font-medium ml-1 ${investment.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {investment.change}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Link href="/hospital/patients?filter=pending">
              <Button variant="outline" className="w-full h-20 flex-col">
                <UserCheck className="h-6 w-6 mb-2" />
                <span className="text-xs">Pending KYC</span>
              </Button>
            </Link>
            <Link href="/hospital/marketplace">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Building2 className="h-6 w-6 mb-2" />
                <span className="text-xs">Marketplace</span>
              </Button>
            </Link>
            <Link href="/hospital/profit">
              <Button variant="outline" className="w-full h-20 flex-col">
                <DollarSign className="h-6 w-6 mb-2" />
                <span className="text-xs">Profit</span>
              </Button>
            </Link>
            <Link href="/hospital/audit">
              <Button variant="outline" className="w-full h-20 flex-col">
                <ShieldCheck className="h-6 w-6 mb-2" />
                <span className="text-xs">Audit Logs</span>
              </Button>
            </Link>
            <Link href="/hospital/settings">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Activity className="h-6 w-6 mb-2" />
                <span className="text-xs">Settings</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
