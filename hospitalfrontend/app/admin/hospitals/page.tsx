'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/form-field'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Plus, Users, Coins, TrendingUp, Eye, CheckCircle, Search, List, UserPlus, Loader } from 'lucide-react'
import { DataTable, StatusBadge } from '../components'
import { formatNumber, formatDate } from '@/lib/utils'
import { authService } from '@/lib/authService'
import { superAdminService, type SuperAdminHospitalDetails } from '@/services/superAdminService'
import type { SuperAdminDashboardSummary } from '@/services/dashboardService'

interface Hospital {
  id: string
  name: string
  address: string
  contactEmail: string
  contactPhone: string
  registrationNumber: string
  status: 'active' | 'suspended' | 'pending' | 'inactive'
  totalPatients: number
  tokensMinted: number
  createdAt: string
  subscriptionPlan: string
}

type HospitalSummaryRow = NonNullable<SuperAdminDashboardSummary['hospitals']>[number]

const toSafeString = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  return String(value)
}

const toSafeNumber = (value: unknown): number => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

const normalizeStatus = (value: unknown): Hospital['status'] => {
  const normalized = toSafeString(value).toLowerCase()
  if (normalized === 'active' || normalized === 'suspended' || normalized === 'pending' || normalized === 'inactive') {
    return normalized
  }
  return 'inactive'
}

const mapVerificationToStatus = (value: unknown): Hospital['status'] => {
  const normalized = toSafeString(value).toLowerCase()
  if (normalized === 'verified') return 'active'
  if (normalized === 'pending') return 'pending'
  if (normalized === 'rejected') return 'inactive'
  return normalizeStatus(value)
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function HospitalsManagementPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [selectedHospitalDetails, setSelectedHospitalDetails] = useState<SuperAdminHospitalDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    registrationNumber: ''
  })

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      setLoading(true)
      setError(null)
      const summary = await superAdminService.getSummary()
      const hospitalsList = summary.hospitals || []
      const normalizedHospitals: Hospital[] = Array.isArray(hospitalsList)
        ? hospitalsList.map((row: HospitalSummaryRow) => ({
            id: toSafeString(row?.hospitalId),
            name: toSafeString(row?.hospitalName),
            address: toSafeString(row?.address),
            contactEmail: toSafeString(row?.email),
            contactPhone: toSafeString(row?.contactNum),
            registrationNumber: toSafeString(row?.registrationNumber),
            status: mapVerificationToStatus(row?.verificationStatus),
            totalPatients: toSafeNumber(row?.patientCount),
            tokensMinted: toSafeNumber(row?.totalAT),
            createdAt: toSafeString(row?.createdAt),
            subscriptionPlan: 'Standard',
          }))
        : []
      setHospitals(normalizedHospitals)
    } catch (err) {
      console.error('Error fetching hospitals:', err)
      setError(err instanceof Error ? err.message : 'Failed to load hospitals')
      setHospitals([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewHospital = async (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setSelectedHospitalDetails(null)
    if (!hospital.id) return
    try {
      setDetailsLoading(true)
      const details = await superAdminService.getHospitalDetails(hospital.id)
      setSelectedHospitalDetails(details)
    } catch (err) {
      console.error('Error loading hospital details:', err)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleCreateHospital = async () => {
    try {
      const response = await fetch(`${API_BASE}/hospitals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create hospital (${response.status})`)
      }
      
      alert('Hospital created successfully!')
      setShowCreateModal(false)
      setFormData({ name: '', address: '', contactEmail: '', contactPhone: '', registrationNumber: '' })
      fetchHospitals()
    } catch (error) {
      console.error('Error creating hospital:', error)
      alert(error instanceof Error ? error.message : 'Failed to create hospital. Please try again.')
    }
  }

  const handleToggleStatus = async (hospital: Hospital) => {
    try {
      const newStatus = hospital.status === 'active' ? 'suspended' : 'active'
      const response = await fetch(`${API_BASE}/hospitals/${hospital.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update status (${response.status})`)
      }
      
      alert(`Hospital ${newStatus === 'active' ? 'activated' : 'suspended'} successfully!`)
      fetchHospitals()
    } catch (error) {
      console.error('Error updating hospital status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  const filteredHospitals = hospitals.filter(h => {
    const search = searchTerm.toLowerCase()
    const matchesSearch = toSafeString(h.name).toLowerCase().includes(search) ||
                         toSafeString(h.contactEmail).toLowerCase().includes(search)
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    const config = {
      active: 'bg-green-100 text-green-800 border-green-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return config[normalizedStatus as keyof typeof config] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hospital Management</h1>
        <p className="text-gray-500 mt-1">Manage registered hospitals, register new ones, and disable access when required</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Hospital List
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Register Hospital
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6 mt-6">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Hospitals</CardTitle>
                <Building2 className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(hospitals.length)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Registered facilities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
                <CheckCircle className="w-4 h-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {formatNumber(hospitals.filter(h => h.status === 'active').length)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Operational hospitals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
                <Users className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(hospitals.reduce((sum, h) => sum + h.totalPatients, 0))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Across all hospitals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Tokens Minted</CardTitle>
                <Coins className="w-4 h-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(hospitals.reduce((sum, h) => sum + h.tokensMinted, 0))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Platform-wide total</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Hospital Directory</CardTitle>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search hospitals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hospitals found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital Name</TableHead>
                  <TableHead>Registration No.</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead>Tokens Minted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell className="font-medium text-gray-900">
                      <div>
                        <p>{hospital.name}</p>
                        <p className="text-xs text-gray-500">{hospital.address}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {hospital.registrationNumber}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <div>
                        <p className="text-sm">{hospital.contactEmail}</p>
                        <p className="text-xs text-gray-500">{hospital.contactPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {formatNumber(hospital.totalPatients)}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {formatNumber(hospital.tokensMinted)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(hospital.status)}>
                        {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(hospital.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewHospital(hospital)}>
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(hospital)}
                        >
                          {hospital.status === 'active' ? 'Disable' : 'Restore'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="register" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Register New Hospital</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <FormField
                  label="Hospital Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter hospital name"
                  required
                />
                <FormField
                  label="Registration Number"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="Enter registration number"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    placeholder="Enter full address"
                    required
                  />
                </div>
                <FormField
                  label="Contact Email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="Enter contact email"
                  required
                />
                <FormField
                  label="Contact Phone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="Enter contact phone"
                  required
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setFormData({ name: '', address: '', contactEmail: '', contactPhone: '', registrationNumber: '' })}
                  >
                    Clear Form
                  </Button>
                  <Button onClick={handleCreateHospital}>
                    <Plus className="w-4 h-4 mr-2" />
                    Register Hospital
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Modal open={!!selectedHospital} onOpenChange={() => { setSelectedHospital(null); setSelectedHospitalDetails(null) }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Hospital Details</ModalTitle>
          </ModalHeader>
          {selectedHospital && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Hospital Name</p>
                  <p className="font-medium text-gray-900">{selectedHospitalDetails?.hospitalName || selectedHospital.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registration No.</p>
                  <p className="font-medium text-gray-900">{selectedHospitalDetails?.registrationNumber || selectedHospital.registrationNumber || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">{selectedHospitalDetails?.address || selectedHospital.address || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Email</p>
                  <p className="font-medium text-gray-900">{selectedHospitalDetails?.email || selectedHospital.contactEmail || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Phone</p>
                  <p className="font-medium text-gray-900">{selectedHospitalDetails?.contactNum || selectedHospital.contactPhone || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Patients</p>
                  <p className="font-medium text-gray-900">{formatNumber(selectedHospitalDetails?.patientCount ?? selectedHospital.totalPatients)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total AT Minted</p>
                  <p className="font-medium text-gray-900">{formatNumber(Number(selectedHospitalDetails?.totalAT ?? selectedHospital.tokensMinted))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Assets (PKR)</p>
                  <p className="font-medium text-gray-900">{formatNumber(Number(selectedHospitalDetails?.totalAssets ?? 0))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Confirmed Deposits</p>
                  <p className="font-medium text-gray-900">{formatNumber(selectedHospitalDetails?.totalDeposits ?? 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getStatusBadge(selectedHospital.status)}>
                    {selectedHospital.status.charAt(0).toUpperCase() + selectedHospital.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registered Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedHospitalDetails?.createdAt || selectedHospital.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Integrated Banks</p>
                {detailsLoading ? (
                  <p className="text-sm text-gray-500">Loading linked banks...</p>
                ) : (selectedHospitalDetails?.linkedBanks?.length || 0) === 0 ? (
                  <p className="text-sm text-gray-500">No linked banks found.</p>
                ) : (
                  <div className="max-h-48 overflow-auto rounded border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bank</TableHead>
                          <TableHead>Integration</TableHead>
                          <TableHead>Deposits</TableHead>
                          <TableHead>Asset Value (PKR)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(selectedHospitalDetails?.linkedBanks || []).map((link) => (
                          <TableRow key={link.partnershipId}>
                            <TableCell className="font-medium">{link.bankName}</TableCell>
                            <TableCell>{link.integrationStatus}</TableCell>
                            <TableCell>{formatNumber(link.totalDeposits)}</TableCell>
                            <TableCell>{formatNumber(Number(link.totalAssetValuePkr || 0))}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedHospital(null)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
