'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Search, Eye, Download, TrendingUp, Wallet, Activity, Clock, Coins, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'suspended'
  joinDate: string
  totalAssets: number
  totalTokens: number
  atBalance: number
  htBalance: number
  totalDeposits: number
  totalRedemptions: number
  assetHistory: {
    id: string
    type: 'deposit' | 'mint' | 'trade' | 'redemption' | 'allocation'
    assetType?: string
    description: string
    amount: number
    date: string
    status: 'completed' | 'pending' | 'failed'
  }[]
  portfolioValue: {
    month: string
    value: number
  }[]
}

const mockPatients: Patient[] = [
  {
    id: 'PAT-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    joinDate: '2024-06-15',
    totalAssets: 3,
    totalTokens: 28500,
    atBalance: 25000,
    htBalance: 3500,
    totalDeposits: 3,
    totalRedemptions: 0,
    assetHistory: [
      { id: 'TXN-001', type: 'deposit', assetType: 'Real Estate', description: 'Property Deposit - 123 Main St', amount: 250000, date: '2024-11-20', status: 'completed' },
      { id: 'TXN-002', type: 'mint', description: 'AT Minted for Real Estate', amount: 25000, date: '2024-11-21', status: 'completed' },
      { id: 'TXN-003', type: 'allocation', description: 'HT Profit Distribution', amount: 3500, date: '2024-11-25', status: 'completed' },
    ],
    portfolioValue: [
      { month: 'Jun', value: 0 },
      { month: 'Jul', value: 0 },
      { month: 'Aug', value: 150000 },
      { month: 'Sep', value: 180000 },
      { month: 'Oct', value: 220000 },
      { month: 'Nov', value: 285000 },
    ]
  },
  {
    id: 'PAT-002',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    joinDate: '2024-05-10',
    totalAssets: 2,
    totalTokens: 12800,
    atBalance: 8000,
    htBalance: 4800,
    totalDeposits: 2,
    totalRedemptions: 1,
    assetHistory: [
      { id: 'TXN-004', type: 'deposit', assetType: 'Medical Equipment', description: 'MRI Scanner Deposit', amount: 80000, date: '2024-10-15', status: 'completed' },
      { id: 'TXN-005', type: 'mint', description: 'AT Minted for Equipment', amount: 8000, date: '2024-10-16', status: 'completed' },
      { id: 'TXN-006', type: 'redemption', description: 'HT Redeemed for Services', amount: 2000, date: '2024-11-10', status: 'completed' },
      { id: 'TXN-007', type: 'allocation', description: 'HT Profit Distribution', amount: 4800, date: '2024-11-25', status: 'completed' },
    ],
    portfolioValue: [
      { month: 'Jun', value: 0 },
      { month: 'Jul', value: 0 },
      { month: 'Aug', value: 0 },
      { month: 'Sep', value: 0 },
      { month: 'Oct', value: 80000 },
      { month: 'Nov', value: 128000 },
    ]
  },
  {
    id: 'PAT-003',
    name: 'Michael Brown',
    email: 'mbrown@example.com',
    phone: '+1 (555) 345-6789',
    status: 'inactive',
    joinDate: '2024-08-22',
    totalAssets: 1,
    totalTokens: 4500,
    atBalance: 4500,
    htBalance: 0,
    totalDeposits: 1,
    totalRedemptions: 0,
    assetHistory: [
      { id: 'TXN-008', type: 'deposit', assetType: 'Vehicle', description: 'Tesla Model S Deposit', amount: 45000, date: '2024-11-22', status: 'pending' },
    ],
    portfolioValue: [
      { month: 'Jun', value: 0 },
      { month: 'Jul', value: 0 },
      { month: 'Aug', value: 0 },
      { month: 'Sep', value: 0 },
      { month: 'Oct', value: 0 },
      { month: 'Nov', value: 45000 },
    ]
  },
]

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Inactive' },
      suspended: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Suspended' },
    }
    const config = configs[status as keyof typeof configs]
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownRight className="w-4 h-4 text-blue-600" />
      case 'mint': return <Coins className="w-4 h-4 text-green-600" />
      case 'allocation': return <TrendingUp className="w-4 h-4 text-purple-600" />
      case 'redemption': return <ArrowUpRight className="w-4 h-4 text-orange-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-blue-50 border-blue-200'
      case 'mint': return 'bg-green-50 border-green-200'
      case 'allocation': return 'bg-purple-50 border-purple-200'
      case 'redemption': return 'bg-orange-50 border-orange-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const exportPatientData = (patient: Patient) => {
    const data = {
      patientInfo: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        status: patient.status,
        joinDate: patient.joinDate
      },
      balances: {
        atBalance: patient.atBalance,
        htBalance: patient.htBalance,
        totalAssets: patient.totalAssets
      },
      history: patient.assetHistory
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patient-${patient.id}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const totalPatients = patients.length
  const activePatients = patients.filter(p => p.status === 'active').length
  const totalATBalance = patients.reduce((sum, p) => sum + p.atBalance, 0)
  const totalHTBalance = patients.reduce((sum, p) => sum + p.htBalance, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
          <p className="text-muted-foreground mt-1">View and manage patient records, assets, and token balances.</p>
        </div>
        <Button variant="outline" onClick={() => {
          // Export all patients
          console.log('Exporting all patients...')
        }}>
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Total Patients
              <Users className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalPatients}</p>
            <p className="text-sm text-muted-foreground mt-1">{activePatients} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Total AT Balance
              <Coins className="w-4 h-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{(totalATBalance / 1000).toFixed(1)}K</p>
            <p className="text-sm text-muted-foreground mt-1">Asset Tokens</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Total HT Balance
              <Wallet className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{(totalHTBalance / 1000).toFixed(1)}K</p>
            <p className="text-sm text-muted-foreground mt-1">Health Tokens</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Total Assets
              <FileText className="w-4 h-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{patients.reduce((sum, p) => sum + p.totalAssets, 0)}</p>
            <p className="text-sm text-muted-foreground mt-1">Deposited</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Patient Directory</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">AT Balance</TableHead>
                <TableHead className="text-right">HT Balance</TableHead>
                <TableHead className="text-right">Assets</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No patients found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-mono text-xs">{patient.id}</TableCell>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{patient.email}</p>
                        <p className="text-xs text-muted-foreground">{patient.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{patient.atBalance.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">{patient.htBalance.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{patient.totalAssets}</TableCell>
                    <TableCell>{getStatusBadge(patient.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Patient Details - {selectedPatient?.name}</span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => selectedPatient && exportPatientData(selectedPatient)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DialogTitle>
            <DialogDescription>
              Comprehensive view of patient information, balances, and transaction history.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="balances">Balances</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Patient ID</label>
                    <p className="text-sm font-mono">{selectedPatient.id}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    {getStatusBadge(selectedPatient.status)}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm">{selectedPatient.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Join Date</label>
                    <p className="text-sm">{selectedPatient.joinDate}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm">{selectedPatient.email}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm">{selectedPatient.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Assets</p>
                    <p className="text-2xl font-bold">{selectedPatient.totalAssets}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Deposits</p>
                    <p className="text-2xl font-bold">{selectedPatient.totalDeposits}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Redemptions</p>
                    <p className="text-2xl font-bold">{selectedPatient.totalRedemptions}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Tokens</p>
                    <p className="text-2xl font-bold">{selectedPatient.totalTokens.toLocaleString()}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="balances" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2 border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
                        Asset Tokens (AT)
                        <Coins className="w-5 h-5 text-blue-600" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-blue-600">{selectedPatient.atBalance.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground mt-2">Current balance</p>
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <p className="text-xs text-muted-foreground">Equivalent Value</p>
                        <p className="text-lg font-semibold">${selectedPatient.atBalance.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 bg-green-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
                        Health Tokens (HT)
                        <Wallet className="w-5 h-5 text-green-600" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-green-600">{selectedPatient.htBalance.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground mt-2">Current balance</p>
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="text-xs text-muted-foreground">Equivalent Value</p>
                        <p className="text-lg font-semibold">${(selectedPatient.htBalance * 10).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">@ $10 per HT</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Balance Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">Total Portfolio Value</span>
                        <span className="font-bold">${(selectedPatient.atBalance + selectedPatient.htBalance * 10).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">AT Percentage</span>
                        <span className="font-medium">{((selectedPatient.atBalance / (selectedPatient.atBalance + selectedPatient.htBalance * 10)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">HT Percentage</span>
                        <span className="font-medium">{((selectedPatient.htBalance * 10 / (selectedPatient.atBalance + selectedPatient.htBalance * 10)) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="space-y-3">
                  {selectedPatient.assetHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No transaction history</p>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                      
                      {selectedPatient.assetHistory.map((transaction, index) => (
                        <div key={transaction.id} className="relative flex gap-4 pb-6">
                          {/* Timeline dot */}
                          <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getTransactionColor(transaction.type)}`}>
                            {getTransactionIcon(transaction.type)}
                          </div>
                          
                          {/* Transaction card */}
                          <Card className="flex-1">
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium">{transaction.description}</h4>
                                    <Badge variant="outline" className={
                                      transaction.status === 'completed' 
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : transaction.status === 'pending'
                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                    }>
                                      {transaction.status}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {transaction.date}
                                  </p>
                                  {transaction.assetType && (
                                    <p className="text-xs text-muted-foreground mt-1">Asset: {transaction.assetType}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className={`text-lg font-bold ${
                                    transaction.type === 'redemption' ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {transaction.type === 'redemption' ? '-' : '+'}
                                    {transaction.type === 'deposit' ? '$' : ''}
                                    {transaction.amount.toLocaleString()}
                                    {transaction.type !== 'deposit' ? (transaction.type === 'mint' || transaction.type === 'allocation' ? ' tokens' : '') : ''}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">ID: {transaction.id}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Portfolio Value Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={selectedPatient.portfolioValue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Transaction Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {['deposit', 'mint', 'allocation', 'redemption'].map(type => {
                          const count = selectedPatient.assetHistory.filter(t => t.type === type).length
                          const percentage = selectedPatient.assetHistory.length > 0 ? (count / selectedPatient.assetHistory.length) * 100 : 0
                          return (
                            <div key={type}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="capitalize">{type}</span>
                                <span>{count} ({percentage.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Activity Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-muted rounded-lg">
                          <span className="text-sm">Total Transactions</span>
                          <span className="font-bold">{selectedPatient.assetHistory.length}</span>
                        </div>
                        <div className="flex justify-between p-3 border rounded-lg">
                          <span className="text-sm">Completed</span>
                          <span className="font-medium text-green-600">
                            {selectedPatient.assetHistory.filter(t => t.status === 'completed').length}
                          </span>
                        </div>
                        <div className="flex justify-between p-3 border rounded-lg">
                          <span className="text-sm">Pending</span>
                          <span className="font-medium text-yellow-600">
                            {selectedPatient.assetHistory.filter(t => t.status === 'pending').length}
                          </span>
                        </div>
                        <div className="flex justify-between p-3 border rounded-lg">
                          <span className="text-sm">Failed</span>
                          <span className="font-medium text-red-600">
                            {selectedPatient.assetHistory.filter(t => t.status === 'failed').length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
