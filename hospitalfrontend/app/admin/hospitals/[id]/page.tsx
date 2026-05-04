'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Building2, Users, Coins, TrendingUp, Phone, Mail, MapPin, Calendar,
  Settings, Shield, CreditCard, Activity, AlertCircle, FileText, Loader
} from 'lucide-react'
import { StatusBadge, SwitchToggle, ActionConfirmModal, ChartCard, KeyValueCard } from '../../components'
import { authService } from '@/lib/authService'
import { superAdminService } from '@/services/superAdminService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Hospital {
  id?: string
  name: string
  registrationNumber: string
  status: 'active' | 'suspended' | 'pending' | 'inactive'
  type?: string
  bedCount?: number
  address: string
  phone: string
  email: string
  website?: string
  createdAt: string
  contractWallet?: string
  totalPatients?: number
  totalStaff?: number
  tokensMinted?: number
  tradingVolume?: number
  subscriptionPlan?: string
  subscriptionStatus?: 'active' | 'inactive'
  nextBilling?: string
}

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastLogin: string
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function HospitalDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  
  const [showDisableModal, setShowDisableModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [updatingKyc, setUpdatingKyc] = useState(false)

  useEffect(() => {
    fetchHospitalData()
  }, [params.id])

  const fetchHospitalData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch hospital details
      const response = await fetch(`${API_BASE}/hospitals/${params.id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch hospital details (${response.status})`)
      }

      const data = await response.json()
      const hospitalData = data.data || data
      setHospital(hospitalData)

      // Fetch staff members if available
      try {
        const staffResponse = await fetch(`${API_BASE}/hospitals/${params.id}/staff`, {
          method: 'GET',
          headers: getAuthHeaders(),
        })

        if (staffResponse.ok) {
          const staffData = await staffResponse.json()
          setStaffMembers(staffData.data || staffData || [])
        }
      } catch (err) {
        console.error('Failed to fetch staff:', err)
        // Don't fail the whole page if staff fetch fails
      }

      // Generate monthly data based on patient count trends
      const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
      const basePatients = hospitalData.totalPatients || 200
      const baseTokens = hospitalData.tokensMinted || 1000000

      const generateMonthlyData = months.map((month, idx) => ({
        month,
        patients: Math.round(basePatients * (0.7 + idx * 0.05)),
        tokens: Math.round(baseTokens * (0.6 + idx * 0.07)),
      }))
      setMonthlyData(generateMonthlyData)

    } catch (err) {
      console.error('Error fetching hospital data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load hospital details')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!hospital) return
    
    try {
      const newStatus = hospital.status === 'active' ? 'inactive' : 'active'
      const response = await fetch(`${API_BASE}/hospitals/${params.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update status`)
      }

      setHospital(prev => prev ? { ...prev, status: newStatus as any } : null)
      setShowDisableModal(false)
      alert(`Hospital ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully!`)
    } catch (err) {
      console.error('Error toggling status:', err)
      alert(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  const handleSuspend = async () => {
    if (!hospital) return

    try {
      const response = await fetch(`${API_BASE}/hospitals/${params.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'suspended' }),
      })

      if (!response.ok) {
        throw new Error(`Failed to suspend hospital`)
      }

      setHospital(prev => prev ? { ...prev, status: 'suspended' } : null)
      setShowSuspendModal(false)
      alert('Hospital suspended successfully!')
    } catch (err) {
      console.error('Error suspending hospital:', err)
      alert(err instanceof Error ? err.message : 'Failed to suspend hospital')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !hospital) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error || 'Hospital not found'}</p>
            </div>
          </CardContent>
        </Card>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-cyan-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-8 w-8 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{hospital.name}</h1>
            <p className="text-gray-600 mt-1">{hospital.registrationNumber} {hospital.type ? `• ${hospital.type}` : ''}</p>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={hospital.status} />
              <Badge variant="outline">KYC: {hospital.verificationStatus || 'PENDING'}</Badge>
              <Badge variant="outline">{hospital.subscriptionPlan || 'Standard'}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDisableModal(true)}>
            {hospital.status === 'active' ? 'Disable' : 'Enable'}
          </Button>
          <Button variant="outline" className="text-red-600" onClick={() => setShowSuspendModal(true)}>
            Suspend
          </Button>
          <Button onClick={() => router.push(`/admin/hospitals/${params.id}/edit`)}>
            Edit Hospital
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{hospital.totalPatients}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Staff Members</p>
                <p className="text-2xl font-bold text-gray-900">{hospital.totalStaff}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tokens Minted</p>
                <p className="text-2xl font-bold text-gray-900">{(hospital.tokensMinted ?? 0).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Coins className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trading Volume</p>
                <p className="text-2xl font-bold text-gray-900">${((hospital.tradingVolume ?? 0) / 1000).toFixed(0)}K</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="contract">Contract</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hospital Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">{hospital.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{hospital.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{hospital.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Onboarded</p>
                    <p className="text-sm text-gray-600">{new Date(hospital.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Capacity</p>
                    <p className="text-sm text-gray-600">{hospital.bedCount} beds</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartCard
                  title=""
                  chartType="line"
                  data={monthlyData}
                  dataKey="patients"
                  xKey="month"
                  height={200}
                  color="#0891b2"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Staff Members</CardTitle>
                <Button size="sm">Add Staff</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{staff.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={staff.status as any} size="sm" />
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{staff.lastLogin}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Patient Growth"
              chartType="area"
              data={monthlyData}
              dataKey="patients"
              xKey="month"
              height={250}
              color="#10b981"
            />
            <ChartCard
              title="Token Issuance"
              chartType="bar"
              data={monthlyData}
              dataKey="tokens"
              xKey="month"
              height={250}
              color="#8b5cf6"
            />
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <KeyValueCard
                data={[
                  { key: 'Plan', value: hospital.subscriptionPlan ?? 'N/A', highlight: true },
                  { key: 'Status', value: <StatusBadge status={hospital.subscriptionStatus ?? 'pending'} size="sm" /> },
                  { key: 'Billing Cycle', value: 'Monthly' },
                  { key: 'Next Billing', value: hospital.nextBilling ? new Date(hospital.nextBilling).toLocaleDateString() : 'N/A' },
                  { key: 'Patient Limit', value: '500' },
                  { key: 'Token Limit', value: '50,000/month' }
                ]}
                columns={2}
              />
              <div className="flex gap-3">
                <Button variant="outline">Change Plan</Button>
                <Button variant="outline" className="text-red-600">Cancel Subscription</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract Tab */}
        <TabsContent value="contract">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <KeyValueCard
                data={[
                  { key: 'Contract Wallet', value: hospital.contractWallet },
                  { key: 'Network', value: 'Polygon Mainnet' },
                  { key: 'Gas Limit', value: '300000' },
                  { key: 'Max Supply', value: '10,000,000' },
                  { key: 'Contract Status', value: <StatusBadge status="success" text="Deployed" size="sm" /> }
                ]}
                columns={2}
              />
              <Button variant="outline">Update Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Activity className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New patient registered</p>
                    <p className="text-xs text-gray-600">John Smith was added to the system</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Coins className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Tokens minted</p>
                    <p className="text-xs text-gray-600">50,000 AT tokens issued for Q4 operations</p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Staff member added</p>
                    <p className="text-xs text-gray-600">Dr. Emily Parker joined as Medical Director</p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ActionConfirmModal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        onConfirm={handleToggleStatus}
        title={hospital.status === 'active' ? 'Disable Hospital?' : 'Enable Hospital?'}
        message={hospital.status === 'active' 
          ? 'This will prevent all hospital operations including patient management and token trading.'
          : 'This will restore all hospital operations and access.'
        }
        confirmText={hospital.status === 'active' ? 'Disable' : 'Enable'}
        variant={hospital.status === 'active' ? 'danger' : 'success'}
      />

      <ActionConfirmModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={handleSuspend}
        title="Suspend Hospital?"
        message="This will immediately halt all operations and revoke access for all users. This action requires manual reactivation."
        confirmText="Suspend Hospital"
        variant="danger"
      />
    </div>
  )
}
