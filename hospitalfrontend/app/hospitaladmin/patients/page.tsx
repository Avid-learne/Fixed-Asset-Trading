'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Search, Eye, Download, TrendingUp, Wallet, Activity, Clock, Coins, FileText, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/lib/authService'
import { profileService, type ProfileData } from '@/services/profileService'
import { DocumentViewer } from '@/components/DocumentViewer'

/** Pull the friendly filename out of a data URL with a #filename= fragment. */
const friendlyDocumentName = (value: string | undefined | null): string => {
  if (!value) return 'Not attached'
  const fragMatch = value.match(/#filename=([^&]+)/)
  if (fragMatch) {
    try {
      return decodeURIComponent(fragMatch[1])
    } catch {
      return fragMatch[1]
    }
  }
  if (value.startsWith('data:')) return 'Uploaded file'
  return value.split('/').pop() || value
}

// Exchange rate: 1 USD = 280 PKR
const USD_TO_PKR = 280
const convertToPKR = (usdAmount: number) => usdAmount * USD_TO_PKR

interface Patient {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'suspended'
  kycStatus: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'
  kycSubmittedAt?: string
  kycReviewedAt?: string
  kycRejectionReason?: string
  kycDocumentFront?: string
  kycDocumentBack?: string
  kycSelfie?: string
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
    userId: 'PAT-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    kycStatus: 'APPROVED',
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
    userId: 'PAT-002',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    kycStatus: 'APPROVED',
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
    userId: 'PAT-003',
    name: 'Michael Brown',
    email: 'mbrown@example.com',
    phone: '+1 (555) 345-6789',
    status: 'inactive',
    kycStatus: 'PENDING',
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

const mapProfileToPatient = (profile: ProfileData): Patient => ({
  id: profile.registrationId || profile.patientId || profile.userId,
  userId: profile.userId,
  name: profile.name,
  email: profile.email,
  phone: profile.phoneNum || '',
  status: 'active',
  kycStatus: (profile.kycStatus || 'PENDING').toUpperCase() as Patient['kycStatus'],
  kycSubmittedAt: profile.kycSubmittedAt,
  kycReviewedAt: profile.kycReviewedAt,
  kycRejectionReason: profile.kycRejectionReason,
  kycDocumentFront: profile.kycDocumentFront,
  kycDocumentBack: profile.kycDocumentBack,
  kycSelfie: profile.kycSelfie,
  joinDate: new Date().toISOString().split('T')[0],
  totalAssets: Number(profile.totalAssets || 0),
  totalTokens: Number(profile.totalAt || 0) + Number(profile.totalHt || 0),
  atBalance: Number(profile.totalAt || 0),
  htBalance: Number(profile.totalHt || 0),
  totalDeposits: Number(profile.totalAssets || 0),
  totalRedemptions: 0,
  assetHistory: [],
  portfolioValue: [
    { month: 'Jun', value: 0 },
    { month: 'Jul', value: 0 },
    { month: 'Aug', value: 0 },
    { month: 'Sep', value: 0 },
    { month: 'Oct', value: 0 },
    { month: 'Nov', value: 0 },
  ],
})

export default function PatientsPage() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientDialogTab, setPatientDialogTab] = useState<'overview' | 'balances' | 'history' | 'analytics' | 'kyc'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewingKycId, setReviewingKycId] = useState<string | null>(null)
  const [kycRejectReasons, setKycRejectReasons] = useState<Record<string, string>>({})
  // Inline KYC document viewer state (renders the doc in a modal instead of a new browser tab).
  const [docViewer, setDocViewer] = useState<{ url: string; name: string } | null>(null)

  const fetchPatients = useCallback(async (): Promise<Patient[]> => {
    try {
      setIsLoading(true)
      setError(null)

      const token = authService.getToken()
      const currentUser = authService.getUser()
      const hospitalId = currentUser?.hospitalId

      const url = hospitalId
        ? `http://localhost:8000/api/profile/hospital/${hospitalId}/patients`
        : 'http://localhost:8000/api/profile/hospital/patients'

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error((errBody as any).message || 'Failed to fetch patients')
      }

      const data = await response.json()
      const transformedPatients = (data.data || []).map((profile: any) => ({
        ...mapProfileToPatient(profile),
        phone: profile.phoneNum || '',
      }))
      setPatients(transformedPatients)
      return transformedPatients
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients')
      setPatients([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

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

  const getKycBadge = (status: string) => {
    const normalized = status.toUpperCase()
    if (normalized === 'APPROVED') return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Approved</Badge>
    if (normalized === 'REJECTED') return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Rejected</Badge>
    if (normalized === 'IN_PROGRESS') return <Badge className="bg-sky-100 text-sky-800 border-sky-200">In Review</Badge>
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
  }

  const kycSubmissions = patients.filter(
    (patient) => patient.kycStatus === 'IN_PROGRESS' && !!patient.kycSubmittedAt
  )

  const openPatientDialog = (patient: Patient, tab: typeof patientDialogTab) => {
    setSelectedPatient(patient)
    setPatientDialogTab(tab)
  }

  const reviewKyc = async (patient: Patient, approved: boolean, reason?: string) => {
    try {
      setReviewingKycId(patient.userId)
      setError(null)
      await profileService.reviewKyc(patient.userId, {
        approved,
        reason: approved ? undefined : reason?.trim(),
      })
      setKycRejectReasons((prev) => ({ ...prev, [patient.userId]: '' }))
      const updatedPatients = await fetchPatients()
      const updated = updatedPatients.find((p) => p.userId === patient.userId)
      if (updated) setSelectedPatient(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update KYC review')
    } finally {
      setReviewingKycId(null)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownRight className="w-4 h-4 text-emerald-600" />
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

      {isLoading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-8 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <p className="text-blue-700 font-medium">Loading patients...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 flex items-center justify-between">
            <p className="text-red-700 font-medium">{error}</p>
            <Button size="sm" variant="outline" onClick={() => fetchPatients()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="directory" className="w-full">
        <TabsList>
          <TabsTrigger value="directory">Patient Directory</TabsTrigger>
          <TabsTrigger value="kyc">KYC Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6">
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
                    <Coins className="w-4 h-4 text-emerald-600" />
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
          )}

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
                    <TableHead>Assets</TableHead>
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
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{patient.totalAssets} Asset{patient.totalAssets !== 1 ? 's' : ''}</p>
                            <div className="text-xs text-muted-foreground mt-1 space-y-1">
                              {patient.assetHistory
                                .filter(asset => asset.type === 'deposit')
                                .map(asset => (
                                  <div key={asset.id} className="flex items-center gap-1">
                                    <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    <span>{asset.assetType || 'Asset'}: PKR {convertToPKR(asset.amount).toLocaleString()}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPatientDialog(patient, 'overview')}
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
        </TabsContent>

        <TabsContent value="kyc" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">KYC Submissions</CardTitle>
              <CardDescription>
                Review and verify submitted KYC documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kycSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No KYC submissions to review
                      </TableCell>
                    </TableRow>
                  ) : (
                    kycSubmissions.map((patient) => {
                      const isBusy = reviewingKycId === patient.userId

                      return (
                        <TableRow key={patient.userId}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-xs text-muted-foreground">{patient.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {patient.kycSubmittedAt ? new Date(patient.kycSubmittedAt).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="space-y-1">
                              <div>Front: {patient.kycDocumentFront || '—'}</div>
                              <div>Back: {patient.kycDocumentBack || '—'}</div>
                              <div>Selfie: {patient.kycSelfie || '—'}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getKycBadge(patient.kycStatus)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPatientDialog(patient, 'kyc')}
                                disabled={isBusy}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
            <Tabs value={patientDialogTab} onValueChange={(v) => setPatientDialogTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="balances">Balances</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="kyc">KYC Submission</TabsTrigger>
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
                        <p className="text-lg font-semibold">PKR {convertToPKR(selectedPatient.atBalance).toLocaleString()}</p>
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
                    </CardContent>
                  </Card>
                </div>

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
                                    {transaction.type === 'deposit' ? 'PKR ' : ''}
                                    {transaction.type === 'deposit' ? convertToPKR(transaction.amount).toLocaleString() : transaction.amount.toLocaleString()}
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

              <TabsContent value="kyc" className="space-y-4">
                <Card className="border-emerald-200 bg-emerald-50/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between gap-3">
                      <span>KYC Submission</span>
                      {getKycBadge(selectedPatient.kycStatus)}
                    </CardTitle>
                    <CardDescription>
                      Review the full submission before verifying or rejecting.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border bg-white p-3 text-sm">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Submitted</p>
                        <p className="mt-1 text-slate-900">
                          {selectedPatient.kycSubmittedAt ? new Date(selectedPatient.kycSubmittedAt).toLocaleString() : 'Not submitted'}
                        </p>
                      </div>
                      <div className="rounded-lg border bg-white p-3 text-sm">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Reviewed</p>
                        <p className="mt-1 text-slate-900">
                          {selectedPatient.kycReviewedAt ? new Date(selectedPatient.kycReviewedAt).toLocaleString() : 'Not reviewed yet'}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-sm font-medium text-slate-900">Submitted documents</p>
                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                          <div>ID front: {friendlyDocumentName(selectedPatient.kycDocumentFront)}</div>
                          {selectedPatient.kycDocumentFront && (
                            <button
                              type="button"
                              onClick={() => setDocViewer({ url: selectedPatient.kycDocumentFront!, name: 'KYC — ID Front' })}
                              className="text-sm text-primary hover:underline cursor-pointer"
                            >
                              View
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>ID back: {friendlyDocumentName(selectedPatient.kycDocumentBack)}</div>
                          {selectedPatient.kycDocumentBack && (
                            <button
                              type="button"
                              onClick={() => setDocViewer({ url: selectedPatient.kycDocumentBack!, name: 'KYC — ID Back' })}
                              className="text-sm text-primary hover:underline cursor-pointer"
                            >
                              View
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>Selfie / live photo: {friendlyDocumentName(selectedPatient.kycSelfie)}</div>
                          {selectedPatient.kycSelfie && (
                            <button
                              type="button"
                              onClick={() => setDocViewer({ url: selectedPatient.kycSelfie!, name: 'KYC — Selfie / live photo' })}
                              className="text-sm text-primary hover:underline cursor-pointer"
                            >
                              View
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedPatient.kycRejectionReason && (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                        Previous rejection reason: {selectedPatient.kycRejectionReason}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rejection reason (optional)</label>
                      <Input
                        value={kycRejectReasons[selectedPatient.userId] || ''}
                        onChange={(event) =>
                          setKycRejectReasons((prev) => ({ ...prev, [selectedPatient.userId]: event.target.value }))
                        }
                        placeholder="Add a note if rejecting"
                        disabled={reviewingKycId === selectedPatient.userId}
                      />
                    </div>

                    {!['APPROVED', 'REJECTED'].includes(selectedPatient.kycStatus?.toUpperCase()) && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() => reviewKyc(selectedPatient, false, kycRejectReasons[selectedPatient.userId])}
                          disabled={reviewingKycId === selectedPatient.userId}
                        >
                          Reject KYC
                        </Button>
                        <Button
                          onClick={() => reviewKyc(selectedPatient, true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={reviewingKycId === selectedPatient.userId}
                        >
                          Verify KYC
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Inline KYC document viewer — keeps the preview in-app instead of opening a new tab. */}
      <DocumentViewer
        isOpen={!!docViewer}
        onClose={() => setDocViewer(null)}
        documentUrl={docViewer?.url ?? null}
        documentName={docViewer?.name}
      />
    </div>
  )
}
