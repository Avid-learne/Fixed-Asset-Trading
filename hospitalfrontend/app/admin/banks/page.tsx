// app/admin/banks/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, Building2, Shield, DollarSign, CheckCircle } from 'lucide-react'
import { formatDate, formatNumber, formatCurrency } from '@/lib/utils'

interface Bank {
  id: string
  name: string
  swiftCode: string
  address: string
  contactEmail: string
  contactPhone: string
  status: 'Active' | 'Suspended' | 'Pending'
  totalAssets: number
  totalPolicies: number
  complianceScore: number
  createdAt: string
}

export default function BanksManagementPage() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    swiftCode: '',
    address: '',
    contactEmail: '',
    contactPhone: ''
  })

  useEffect(() => {
    fetchBanks()
  }, [])

  const fetchBanks = async () => {
    try {
      setLoading(false)
      // Service call will be implemented when API is connected
      // const response = await adminService.getBanks()
      // setBanks(response.data)
    } catch (error) {
      console.error('Error fetching banks:', error)
      setLoading(false)
    }
  }

  const handleCreateBank = async () => {
    try {
      // await adminService.createBank(formData)
      alert('Bank registered successfully!')
      setShowCreateModal(false)
      setFormData({ name: '', swiftCode: '', address: '', contactEmail: '', contactPhone: '' })
      fetchBanks()
    } catch (error) {
      console.error('Error creating bank:', error)
      alert('Failed to register bank. Please try again.')
    }
  }

  const filteredBanks = banks.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.swiftCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
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
          <h1 className="text-3xl font-bold text-gray-900">Bank Management</h1>
          <p className="text-gray-500 mt-1">Manage partner banks and financial institutions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Register Bank
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Banks</CardTitle>
            <Building2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(banks.length)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Partner institutions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            <CheckCircle className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatNumber(banks.filter(b => b.status === 'Active').length)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Operational banks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Assets</CardTitle>
            <DollarSign className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(banks.reduce((sum, b) => sum + b.totalAssets, 0))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Under management</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Compliance</CardTitle>
            <Shield className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {banks.length > 0
                ? (banks.reduce((sum, b) => sum + b.complianceScore, 0) / banks.length).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Compliance score</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Bank Directory</CardTitle>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search banks..."
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
          {filteredBanks.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No banks found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank Name</TableHead>
                  <TableHead>SWIFT Code</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Assets</TableHead>
                  <TableHead>Policies</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanks.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium text-gray-900">
                      <div>
                        <p>{bank.name}</p>
                        <p className="text-xs text-gray-500">{bank.address}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {bank.swiftCode}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <div>
                        <p className="text-sm">{bank.contactEmail}</p>
                        <p className="text-xs text-gray-500">{bank.contactPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {formatCurrency(bank.totalAssets)}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {formatNumber(bank.totalPolicies)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{bank.complianceScore}%</span>
                        {bank.complianceScore >= 90 && (
                          <CheckCircle className="w-4 h-4 text-success" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(bank.status)}>
                        {bank.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedBank(bank)}>
                        View Details
                      </Button>
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
            <ModalTitle>Register New Bank</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <FormField
              label="Bank Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter bank name"
            />
            <FormField
              label="SWIFT Code"
              value={formData.swiftCode}
              onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
              placeholder="Enter SWIFT code"
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
            <Button onClick={handleCreateBank}>Register Bank</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal open={!!selectedBank} onOpenChange={() => setSelectedBank(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Bank Details</ModalTitle>
          </ModalHeader>
          {selectedBank && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="font-medium text-gray-900">{selectedBank.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">SWIFT Code</p>
                  <p className="font-medium text-gray-900">{selectedBank.swiftCode}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">{selectedBank.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Email</p>
                  <p className="font-medium text-gray-900">{selectedBank.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Phone</p>
                  <p className="font-medium text-gray-900">{selectedBank.contactPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Assets</p>
                  <p className="font-medium text-gray-900">{formatCurrency(selectedBank.totalAssets)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Policies</p>
                  <p className="font-medium text-gray-900">{formatNumber(selectedBank.totalPolicies)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Compliance Score</p>
                  <p className="font-medium text-gray-900">{selectedBank.complianceScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getStatusBadge(selectedBank.status)}>
                    {selectedBank.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registered Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedBank.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedBank(null)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
