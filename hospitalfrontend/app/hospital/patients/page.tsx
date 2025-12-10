'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  UserCheck, 
  UserX, 
  Users, 
  TrendingUp, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Wallet,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { PatientProfile, PatientTokenBalance, AssetDeposit, Transaction, KYCStatus, PatientStatus } from '@/types/patient'

// Extended patient data for hospital staff view
interface HospitalPatientData extends PatientProfile {
  tokenBalance: PatientTokenBalance
  recentDeposits: AssetDeposit[]
  recentTransactions: Transaction[]
  kycStatus: KYCStatus
  totalDepositsValue: number
  totalTransactions: number
  lastActivity?: string
}

// Mock patient data for Liaquat National Hospital
const MOCK_PATIENTS: HospitalPatientData[] = [
  {
    id: 'PAT-001',
    registrationId: 'LNH-2024-001',
    fullName: 'Ahmed Khan',
    email: 'ahmed.khan@email.com',
    phone: '+92 300 1234567',
    dateOfBirth: '1985-03-15',
    bloodGroup: 'A+',
    address: 'House 45, Block C, Gulshan-e-Iqbal, Karachi',
    location: 'Karachi',
    status: 'active',
    profileCompletion: 95,
    memberSince: '2024-01-15',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    createdAt: '2024-01-15',
    kycStatus: 'verified',
    totalDepositsValue: 250000,
    totalTransactions: 45,
    lastActivity: '2024-12-09',
    tokenBalance: {
      assetToken: 25000,
      healthToken: 18500,
      lastUpdated: '2024-12-10'
    },
    recentDeposits: [
      {
        id: 'DEP-001',
        patientId: 'PAT-001',
        assetType: 'gold',
        assetValue: 150000,
        weight: 50,
        status: 'approved',
        submittedAt: '2024-12-01',
        approvedAt: '2024-12-02',
        hospitalName: 'Liaquat National Hospital',
        tokenAmount: 15000
      }
    ],
    recentTransactions: [
      {
        id: 'TXN-001',
        date: '2024-12-09',
        type: 'Purchase',
        amount: 2500,
        token: 'HT',
        status: 'success',
        description: 'Health checkup package'
      }
    ]
  },
  {
    id: 'PAT-002',
    registrationId: 'LNH-2024-002',
    fullName: 'Fatima Ali',
    email: 'fatima.ali@email.com',
    phone: '+92 321 9876543',
    dateOfBirth: '1990-07-22',
    bloodGroup: 'B+',
    address: 'Apartment 12, Clifton Block 5, Karachi',
    location: 'Karachi',
    status: 'active',
    profileCompletion: 88,
    memberSince: '2024-02-10',
    walletAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    createdAt: '2024-02-10',
    kycStatus: 'verified',
    totalDepositsValue: 180000,
    totalTransactions: 32,
    lastActivity: '2024-12-10',
    tokenBalance: {
      assetToken: 18000,
      healthToken: 12300,
      lastUpdated: '2024-12-10'
    },
    recentDeposits: [
      {
        id: 'DEP-002',
        patientId: 'PAT-002',
        assetType: 'silver',
        assetValue: 80000,
        weight: 1000,
        status: 'approved',
        submittedAt: '2024-11-28',
        approvedAt: '2024-11-29',
        hospitalName: 'Liaquat National Hospital',
        tokenAmount: 8000
      }
    ],
    recentTransactions: [
      {
        id: 'TXN-002',
        date: '2024-12-08',
        type: 'Transfer',
        amount: 1500,
        token: 'HT',
        status: 'success',
        description: 'Transfer to savings'
      }
    ]
  },
  {
    id: 'PAT-003',
    registrationId: 'LNH-2024-003',
    fullName: 'Hassan Raza',
    email: 'hassan.raza@email.com',
    phone: '+92 333 4567890',
    dateOfBirth: '1988-11-05',
    bloodGroup: 'O+',
    address: 'House 78, DHA Phase 6, Karachi',
    location: 'Karachi',
    status: 'active',
    profileCompletion: 92,
    memberSince: '2024-01-20',
    walletAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    createdAt: '2024-01-20',
    kycStatus: 'verified',
    totalDepositsValue: 320000,
    totalTransactions: 58,
    lastActivity: '2024-12-10',
    tokenBalance: {
      assetToken: 32000,
      healthToken: 25600,
      lastUpdated: '2024-12-10'
    },
    recentDeposits: [
      {
        id: 'DEP-003',
        patientId: 'PAT-003',
        assetType: 'gold',
        assetValue: 200000,
        weight: 75,
        status: 'approved',
        submittedAt: '2024-12-05',
        approvedAt: '2024-12-06',
        hospitalName: 'Liaquat National Hospital',
        tokenAmount: 20000
      }
    ],
    recentTransactions: [
      {
        id: 'TXN-003',
        date: '2024-12-10',
        type: 'Mint',
        amount: 5000,
        token: 'AT',
        status: 'success',
        description: 'Asset tokens minted'
      }
    ]
  },
  {
    id: 'PAT-004',
    registrationId: 'LNH-2024-004',
    fullName: 'Ayesha Malik',
    email: 'ayesha.malik@email.com',
    phone: '+92 345 1122334',
    dateOfBirth: '1992-04-18',
    bloodGroup: 'AB+',
    address: 'Flat 301, Nishat Commercial, Karachi',
    location: 'Karachi',
    status: 'Pending Verification',
    profileCompletion: 65,
    memberSince: '2024-11-28',
    walletAddress: '0x1a92f7381B9F03921564a437210bB9396471050C',
    createdAt: '2024-11-28',
    kycStatus: 'pending',
    totalDepositsValue: 0,
    totalTransactions: 5,
    lastActivity: '2024-12-08',
    tokenBalance: {
      assetToken: 0,
      healthToken: 5000,
      lastUpdated: '2024-12-10'
    },
    recentDeposits: [],
    recentTransactions: [
      {
        id: 'TXN-004',
        date: '2024-12-05',
        type: 'Reward',
        amount: 5000,
        token: 'HT',
        status: 'success',
        description: 'Welcome bonus'
      }
    ]
  },
  {
    id: 'PAT-005',
    registrationId: 'LNH-2024-005',
    fullName: 'Usman Sheikh',
    email: 'usman.sheikh@email.com',
    phone: '+92 311 7788990',
    dateOfBirth: '1987-09-30',
    bloodGroup: 'A-',
    address: 'Villa 15, Bahria Town, Karachi',
    location: 'Karachi',
    status: 'active',
    profileCompletion: 98,
    memberSince: '2024-01-08',
    walletAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    createdAt: '2024-01-08',
    kycStatus: 'verified',
    totalDepositsValue: 450000,
    totalTransactions: 72,
    lastActivity: '2024-12-10',
    tokenBalance: {
      assetToken: 45000,
      healthToken: 38200,
      lastUpdated: '2024-12-10'
    },
    recentDeposits: [
      {
        id: 'DEP-005',
        patientId: 'PAT-005',
        assetType: 'gold',
        assetValue: 300000,
        weight: 100,
        status: 'approved',
        submittedAt: '2024-12-03',
        approvedAt: '2024-12-04',
        hospitalName: 'Liaquat National Hospital',
        tokenAmount: 30000
      }
    ],
    recentTransactions: [
      {
        id: 'TXN-005',
        date: '2024-12-10',
        type: 'Trade',
        amount: 10000,
        token: 'AT',
        status: 'success',
        description: 'Investment trade'
      }
    ]
  },
  {
    id: 'PAT-006',
    registrationId: 'LNH-2024-006',
    fullName: 'Sara Ibrahim',
    email: 'sara.ibrahim@email.com',
    phone: '+92 300 5566778',
    dateOfBirth: '1995-12-12',
    bloodGroup: 'B-',
    address: 'House 22, Pechs Block 2, Karachi',
    location: 'Karachi',
    status: 'inactive',
    profileCompletion: 45,
    memberSince: '2024-08-15',
    createdAt: '2024-08-15',
    kycStatus: 'incomplete',
    totalDepositsValue: 0,
    totalTransactions: 2,
    lastActivity: '2024-09-10',
    tokenBalance: {
      assetToken: 0,
      healthToken: 1000,
      lastUpdated: '2024-09-10'
    },
    recentDeposits: [],
    recentTransactions: []
  }
]

export default function HospitalPatientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [kycFilter, setKycFilter] = useState<string>('all')
  const [selectedPatient, setSelectedPatient] = useState<HospitalPatientData | null>(null)

  // Filter patients
  const filteredPatients = MOCK_PATIENTS.filter(patient => {
    const matchesSearch = 
      patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.registrationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter
    const matchesKyc = kycFilter === 'all' || patient.kycStatus === kycFilter
    
    return matchesSearch && matchesStatus && matchesKyc
  })

  // Calculate summary stats
  const totalPatients = MOCK_PATIENTS.length
  const activePatients = MOCK_PATIENTS.filter(p => p.status === 'active').length
  const verifiedPatients = MOCK_PATIENTS.filter(p => p.kycStatus === 'verified').length
  const pendingKyc = MOCK_PATIENTS.filter(p => p.kycStatus === 'pending' || p.kycStatus === 'incomplete').length
  const totalAssetValue = MOCK_PATIENTS.reduce((sum, p) => sum + p.totalDepositsValue, 0)
  const totalTokensInCirculation = MOCK_PATIENTS.reduce((sum, p) => sum + p.tokenBalance.assetToken + p.tokenBalance.healthToken, 0)

  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'Verified Patient': return 'bg-blue-100 text-blue-800'
      case 'Pending Verification': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getKycColor = (status: KYCStatus) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'incomplete': return 'bg-orange-100 text-orange-800'
      case 'not_submitted': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getKycIcon = (status: KYCStatus) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'incomplete': return <AlertCircle className="h-4 w-4" />
      case 'not_submitted': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (selectedPatient) {
    return <PatientDetailView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patient Management</h1>
          <p className="text-slate-600 mt-1">Liaquat National Hospital - Patient Database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
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
                <p className="text-sm text-slate-600">Total Patients</p>
                <p className="text-2xl font-bold text-slate-900">{totalPatients}</p>
                <p className="text-xs text-slate-500 mt-1">{activePatients} active</p>
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
                <p className="text-sm text-slate-600">KYC Verified</p>
                <p className="text-2xl font-bold text-slate-900">{verifiedPatients}</p>
                <p className="text-xs text-slate-500 mt-1">{pendingKyc} pending review</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Assets Value</p>
                <p className="text-2xl font-bold text-slate-900">₨{(totalAssetValue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-slate-500 mt-1">Under management</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Tokens Circulation</p>
                <p className="text-2xl font-bold text-slate-900">{(totalTokensInCirculation / 1000).toFixed(0)}K</p>
                <p className="text-xs text-slate-500 mt-1">AT + HT combined</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, ID, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="Pending Verification">Pending Verification</option>
              </select>
              <select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                className="px-4 py-2 border rounded-md text-sm"
              >
                <option value="all">All KYC Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="incomplete">Incomplete</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Database ({filteredPatients.length})</CardTitle>
          <CardDescription>Complete list of patients registered with Liaquat National Hospital</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPatient(patient)}>
                <CardContent className="p-6">
                  {/* Top Section: Avatar, Name, and Badges */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold shrink-0">
                        {patient.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900">{patient.fullName}</h3>
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                          <Badge className={getKycColor(patient.kycStatus)} variant="outline">
                            {getKycIcon(patient.kycStatus)}
                            <span className="ml-1">{patient.kycStatus}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                            <span>{patient.registrationId}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{patient.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate max-w-[200px]">{patient.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>Member since {new Date(patient.memberSince).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="shrink-0">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>

                  {/* Bottom Section: Financial Stats */}
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">AT Balance</p>
                      <p className="text-lg font-semibold text-slate-900">{patient.tokenBalance.assetToken.toLocaleString()}</p>
                    </div>
                    <div className="text-center border-l border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">HT Balance</p>
                      <p className="text-lg font-semibold text-slate-900">{patient.tokenBalance.healthToken.toLocaleString()}</p>
                    </div>
                    <div className="text-center border-l border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Total Deposits</p>
                      <p className="text-lg font-semibold text-slate-900">₨{(patient.totalDepositsValue / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="text-center border-l border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Transactions</p>
                      <p className="text-lg font-semibold text-slate-900">{patient.totalTransactions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <UserX className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600">No patients found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Patient Detail View Component
function PatientDetailView({ patient, onBack }: { patient: HospitalPatientData; onBack: () => void }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            ← Back to List
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
              {patient.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{patient.fullName}</h1>
              <p className="text-slate-600">{patient.registrationId}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {patient.status}
          </Badge>
          <Badge className={patient.kycStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
            KYC: {patient.kycStatus}
          </Badge>
        </div>
      </div>

      {/* Patient Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Asset Tokens</p>
                <p className="text-2xl font-bold text-slate-900">{patient.tokenBalance.assetToken.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">AT Balance</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Health Tokens</p>
                <p className="text-2xl font-bold text-slate-900">{patient.tokenBalance.healthToken.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">HT Balance</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Deposits</p>
                <p className="text-2xl font-bold text-slate-900">₨{(patient.totalDepositsValue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-slate-500 mt-1">Asset Value</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Transactions</p>
                <p className="text-2xl font-bold text-slate-900">{patient.totalTransactions}</p>
                <p className="text-xs text-slate-500 mt-1">Total Count</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Full Name</p>
                  <p className="font-medium">{patient.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Registration ID</p>
                  <p className="font-medium">{patient.registrationId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Phone</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Date of Birth</p>
                  <p className="font-medium">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Blood Group</p>
                  <p className="font-medium">{patient.bloodGroup || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600 mb-1">Address</p>
                  <p className="font-medium">{patient.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Location</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {patient.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Member Since</p>
                  <p className="font-medium">{new Date(patient.memberSince).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Profile Completion</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${patient.profileCompletion}%` }}
                      />
                    </div>
                    <span className="font-medium">{patient.profileCompletion}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Last Activity</p>
                  <p className="font-medium">{patient.lastActivity ? new Date(patient.lastActivity).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deposits</CardTitle>
              <CardDescription>Asset deposits submitted by patient</CardDescription>
            </CardHeader>
            <CardContent>
              {patient.recentDeposits.length > 0 ? (
                <div className="space-y-3">
                  {patient.recentDeposits.map((deposit) => (
                    <Card key={deposit.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge>{deposit.assetType}</Badge>
                              <Badge className={
                                deposit.status === 'approved' ? 'bg-green-100 text-green-800' :
                                deposit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {deposit.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-slate-600">Weight</p>
                                <p className="font-medium">{deposit.weight}g</p>
                              </div>
                              <div>
                                <p className="text-slate-600">Value</p>
                                <p className="font-medium">₨{deposit.assetValue.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-slate-600">Tokens Minted</p>
                                <p className="font-medium">{deposit.tokenAmount?.toLocaleString() || 'N/A'} AT</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-slate-600">Submitted</p>
                            <p className="font-medium">{new Date(deposit.submittedAt).toLocaleDateString()}</p>
                            {deposit.approvedAt && (
                              <>
                                <p className="text-slate-600 mt-2">Approved</p>
                                <p className="font-medium">{new Date(deposit.approvedAt).toLocaleDateString()}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No deposits found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest patient transaction activity</CardDescription>
            </CardHeader>
            <CardContent>
              {patient.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {patient.recentTransactions.map((txn) => (
                    <Card key={txn.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge>{txn.type}</Badge>
                              <Badge variant="outline">{txn.token}</Badge>
                              <Badge className={
                                txn.status === 'success' ? 'bg-green-100 text-green-800' :
                                txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {txn.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">{txn.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">{txn.amount.toLocaleString()} {txn.token}</p>
                            <p className="text-xs text-slate-500">{new Date(txn.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Information</CardTitle>
              <CardDescription>Patient's blockchain wallet details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Wallet Address</p>
                <p className="font-mono text-sm bg-slate-100 p-3 rounded">{patient.walletAddress || 'Not connected'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Network</p>
                  <p className="font-medium">Polygon (MATIC)</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Token Standard</p>
                  <p className="font-medium">ERC-20</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
