'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Banknote, Shield, Phone, Mail, MapPin, Calendar, FileText,
  Users, Building2, TrendingUp, Activity
} from 'lucide-react'
import { StatusBadge, SwitchToggle, ActionConfirmModal, KeyValueCard } from '../../components'

// Mock data
const bankInfo = {
  id: 'BANK-001',
  name: 'National Bank of Pakistan',
  swiftCode: 'NBPAPKKAXXX',
  status: 'active' as const,
  address: 'I.I. Chundrigar Road, Karachi, Pakistan',
  phone: '+92-21-111-627-627',
  email: 'info@nbp.com',
  website: 'https://nbp.com.pk',
  regulatoryLicense: 'LIC-NBP-001',
  complianceOfficerName: 'Muhammad Asif',
  complianceOfficerEmail: 'compliance@nbp.com',
  createdAt: '2024-05-20',
  verificationLoad: 156,
  linkedHospitals: 1,
  documentsProcessed: 1450,
  complianceScore: 98
}

const linkedHospitals = [
  { id: 'HOS-001', name: 'Liaquat National Hospital', status: 'active', documents: 450 },
]

const staffMembers = [
  { id: 'ST-001', name: 'Robert Johnson', email: 'robert.j@ctbank.com', role: 'Bank Officer', status: 'active' },
  { id: 'ST-002', name: 'Emily Davis', email: 'emily.d@ctbank.com', role: 'Compliance Officer', status: 'active' }
]

export default function BankDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [bank, setBank] = useState(bankInfo)
  const [showDisableModal, setShowDisableModal] = useState(false)

  const handleToggleStatus = () => {
    setBank(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'inactive' : 'active'
    }))
    setShowDisableModal(false)
    alert(`Bank ${bank.status === 'active' ? 'disabled' : 'enabled'} successfully!`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
            <Banknote className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{bank.name}</h1>
            <p className="text-gray-600 mt-1">{bank.swiftCode} • {bank.regulatoryLicense}</p>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={bank.status} />
              <Badge variant="outline">Compliance: {bank.complianceScore}%</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDisableModal(true)}>
            {bank.status === 'active' ? 'Disable' : 'Enable'}
          </Button>
          <Button onClick={() => router.push(`/admin/banks/${params.id}/edit`)}>
            Edit Bank
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Linked Hospitals</p>
                <p className="text-2xl font-bold text-gray-900">{bank.linkedHospitals}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verification Load</p>
                <p className="text-2xl font-bold text-gray-900">{bank.verificationLoad}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">{bank.documentsProcessed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-gray-900">{bank.complianceScore}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hospitals">Linked Hospitals</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bank Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">{bank.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{bank.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{bank.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Registered</p>
                    <p className="text-sm text-gray-600">{new Date(bank.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Compliance Information</CardTitle>
              </CardHeader>
              <CardContent>
                <KeyValueCard
                  data={[
                    { key: 'Regulatory License', value: bank.regulatoryLicense },
                    { key: 'Officer Name', value: bank.complianceOfficerName },
                    { key: 'Officer Email', value: bank.complianceOfficerEmail },
                    { key: 'Compliance Score', value: `${bank.complianceScore}%`, highlight: true },
                    { key: 'Last Audit', value: 'Oct 15, 2024' },
                    { key: 'Next Audit', value: 'Jan 15, 2025' }
                  ]}
                  columns={2}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Linked Hospitals Tab */}
        <TabsContent value="hospitals">
          <Card>
            <CardHeader>
              <CardTitle>Linked Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital ID</TableHead>
                    <TableHead>Hospital Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documents Verified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedHospitals.map((hospital) => (
                    <TableRow key={hospital.id}>
                      <TableCell className="font-medium">{hospital.id}</TableCell>
                      <TableCell>{hospital.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={hospital.status as any} size="sm" />
                      </TableCell>
                      <TableCell>{hospital.documents}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bank Staff</CardTitle>
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

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Processing Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Total Processed</p>
                  <p className="text-2xl font-bold text-gray-900">1,450</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-orange-600">23</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">1,389</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">38</p>
                </div>
              </div>
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
                  <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Document verified</p>
                    <p className="text-xs text-gray-600">Asset verification for HOS-001 approved</p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New hospital linked</p>
                    <p className="text-xs text-gray-600">City Medical Center added to portfolio</p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
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
        title={bank.status === 'active' ? 'Disable Bank?' : 'Enable Bank?'}
        message={bank.status === 'active' 
          ? 'This will prevent all verification and custodian operations for this bank.'
          : 'This will restore all bank operations and access.'
        }
        confirmText={bank.status === 'active' ? 'Disable' : 'Enable'}
        variant={bank.status === 'active' ? 'danger' : 'success'}
      />
    </div>
  )
}
