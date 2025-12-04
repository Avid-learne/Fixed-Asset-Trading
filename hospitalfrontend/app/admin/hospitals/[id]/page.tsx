'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Building2, Users, Coins, TrendingUp, Phone, Mail, MapPin, Calendar,
  Settings, Shield, CreditCard, Activity, AlertCircle, FileText
} from 'lucide-react'
import { StatusBadge, SwitchToggle, ActionConfirmModal, ChartCard, KeyValueCard } from '../../components'

// Mock data
const hospitalInfo = {
  id: 'HOS-001',
  name: 'Metro General Hospital',
  registrationNumber: 'REG-12345',
  status: 'active' as const,
  type: 'General Hospital',
  bedCount: 500,
  address: '123 Main Street, New York, NY 10001',
  phone: '+1 (555) 123-4567',
  email: 'contact@metrogeneral.com',
  website: 'https://metrogeneral.com',
  createdAt: '2024-06-15',
  contractWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  totalPatients: 234,
  totalStaff: 45,
  tokensMinted: 1250000,
  tradingVolume: 450000,
  subscriptionPlan: 'Professional',
  subscriptionStatus: 'active' as const,
  nextBilling: '2025-01-15'
}

const staffMembers = [
  { id: 'ST-001', name: 'Dr. Sarah Johnson', email: 'sarah.j@metrogeneral.com', role: 'Hospital Admin', status: 'active', lastLogin: '2024-12-03 14:30' },
  { id: 'ST-002', name: 'Dr. Mike Davis', email: 'mike.d@metrogeneral.com', role: 'Medical Director', status: 'active', lastLogin: '2024-12-03 10:15' },
  { id: 'ST-003', name: 'Lisa Anderson', email: 'lisa.a@metrogeneral.com', role: 'Finance Manager', status: 'active', lastLogin: '2024-12-02 16:45' }
]

const monthlyData = [
  { month: 'Jun', patients: 180, tokens: 950000 },
  { month: 'Jul', patients: 195, tokens: 1050000 },
  { month: 'Aug', patients: 210, tokens: 1120000 },
  { month: 'Sep', patients: 220, tokens: 1180000 },
  { month: 'Oct', patients: 230, tokens: 1220000 },
  { month: 'Nov', patients: 234, tokens: 1250000 },
]

export default function HospitalDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [hospital, setHospital] = useState(hospitalInfo)
  const [showDisableModal, setShowDisableModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)

  const handleToggleStatus = () => {
    setHospital(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'inactive' : 'active'
    }))
    setShowDisableModal(false)
    alert(`Hospital ${hospital.status === 'active' ? 'disabled' : 'enabled'} successfully!`)
  }

  const handleSuspend = () => {
    setHospital(prev => ({ ...prev, status: 'suspended' }))
    setShowSuspendModal(false)
    alert('Hospital suspended successfully!')
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
            <p className="text-gray-600 mt-1">{hospital.registrationNumber} • {hospital.type}</p>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={hospital.status} />
              <Badge variant="outline">{hospital.subscriptionPlan}</Badge>
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
                <p className="text-2xl font-bold text-gray-900">{hospital.tokensMinted.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900">${(hospital.tradingVolume / 1000).toFixed(0)}K</p>
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
                  { key: 'Plan', value: hospital.subscriptionPlan, highlight: true },
                  { key: 'Status', value: <StatusBadge status={hospital.subscriptionStatus} size="sm" /> },
                  { key: 'Billing Cycle', value: 'Monthly' },
                  { key: 'Next Billing', value: new Date(hospital.nextBilling).toLocaleDateString() },
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
