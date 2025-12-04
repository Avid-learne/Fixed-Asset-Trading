'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus, Users, Coins, TrendingUp, Eye } from 'lucide-react'
import { DataTable, StatusBadge } from '../components'

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

export default function HospitalsManagementPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  
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
      setLoading(false)
      // Service call will be implemented when API is connected
      // const response = await adminService.getHospitals()
      // setHospitals(response.data)
    } catch (error) {
      console.error('Error fetching hospitals:', error)
      setLoading(false)
    }
  }

  const handleCreateHospital = async () => {
    try {
      // await adminService.createHospital(formData)
      alert('Hospital created successfully!')
      setShowCreateModal(false)
      setFormData({ name: '', address: '', contactEmail: '', contactPhone: '', registrationNumber: '' })
      fetchHospitals()
    } catch (error) {
      console.error('Error creating hospital:', error)
      alert('Failed to create hospital. Please try again.')
    }
  }

  const handleToggleStatus = async (hospital: Hospital) => {
    try {
      const newStatus = hospital.status === 'Active' ? 'Suspended' : 'Active'
      // await adminService.updateHospitalStatus(hospital.id, newStatus)
      alert(`Hospital ${newStatus === 'Active' ? 'activated' : 'suspended'} successfully!`)
      fetchHospitals()
    } catch (error) {
      console.error('Error updating hospital status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         h.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const config = {
      'Active': 'bg-green-100 text-green-800 border-green-200',
      'Suspended': 'bg-red-100 text-red-800 border-red-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return config[status as keyof typeof config] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Management</h1>
          <p className="text-gray-500 mt-1">Manage registered hospitals and their operations</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Register Hospital
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Hospitals</CardTitle>
            <Building className="w-4 h-4 text-primary" />
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
              {formatNumber(hospitals.filter(h => h.status === 'Active').length)}
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
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredHospitals.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                        {hospital.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(hospital.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedHospital(hospital)}>
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(hospital)}
                        >
                          {hospital.status === 'Active' ? 'Suspend' : 'Activate'}
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

      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Register New Hospital</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <FormField
              label="Hospital Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter hospital name"
            />
            <FormField
              label="Registration Number"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              placeholder="Enter registration number"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Enter full address"
              />
            </div>
            <FormField
              label="Contact Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="Enter contact email"
            />
            <FormField
              label="Contact Phone"
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="Enter contact phone"
            />
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateHospital}>Register Hospital</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal open={!!selectedHospital} onOpenChange={() => setSelectedHospital(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Hospital Details</ModalTitle>
          </ModalHeader>
          {selectedHospital && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Hospital Name</p>
                  <p className="font-medium text-gray-900">{selectedHospital.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registration No.</p>
                  <p className="font-medium text-gray-900">{selectedHospital.registrationNumber}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">{selectedHospital.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Email</p>
                  <p className="font-medium text-gray-900">{selectedHospital.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Phone</p>
                  <p className="font-medium text-gray-900">{selectedHospital.contactPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Patients</p>
                  <p className="font-medium text-gray-900">{formatNumber(selectedHospital.totalPatients)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assets Processed</p>
                  <p className="font-medium text-gray-900">{formatNumber(selectedHospital.totalAssets)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tokens Minted</p>
                  <p className="font-medium text-gray-900">{formatNumber(selectedHospital.tokensMinted)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getStatusBadge(selectedHospital.status)}>
                    {selectedHospital.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registered Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedHospital.createdAt)}</p>
                </div>
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
