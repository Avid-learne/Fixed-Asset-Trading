// app/bank/verification/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal'
import { Search, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface PatientVerification {
  id: string
  patientId: string
  patientName: string
  email: string
  phone: string
  submittedAt: string
  status: 'Pending' | 'Verified' | 'Rejected'
  documents: string[]
}

export default function PatientVerificationPage() {
  const [verifications, setVerifications] = useState<PatientVerification[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientVerification | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchVerifications()
  }, [])

  const fetchVerifications = async () => {
    try {
      setLoading(true)
      // Service call will be implemented when API is connected
      // const response = await bankService.getVerifications()
      // setVerifications(response.data)
      setVerifications([])
    } catch (error) {
      console.error('Error fetching verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!selectedPatient) return

    try {
      setProcessing(true)
      // await bankService.verifyPatient(selectedPatient.id)
      alert('Patient verified successfully!')
      setSelectedPatient(null)
      fetchVerifications()
    } catch (error) {
      console.error('Error verifying patient:', error)
      alert('Failed to verify patient. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedPatient) return

    try {
      setProcessing(true)
      // await bankService.rejectPatient(selectedPatient.id)
      alert('Patient verification rejected')
      setSelectedPatient(null)
      fetchVerifications()
    } catch (error) {
      console.error('Error rejecting patient:', error)
      alert('Failed to reject verification. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const filteredVerifications = verifications.filter(v => {
    const matchesSearch = v.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const config = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Verified': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200'
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Verification</h1>
        <p className="text-gray-500 mt-1">Verify patient identity and KYC documentation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Verification</CardTitle>
            <AlertCircle className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {verifications.filter(v => v.status === 'Pending').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Verified</CardTitle>
            <CheckCircle className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {verifications.filter(v => v.status === 'Verified').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Approved patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
            <XCircle className="w-4 h-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {verifications.filter(v => v.status === 'Rejected').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Verification declined</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>All Verifications</CardTitle>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search patients..."
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
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVerifications.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No patient verifications found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Submitted Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVerifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell className="font-medium text-gray-900">
                      {verification.patientId}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {verification.patientName}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {verification.email}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {verification.phone}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(verification.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(verification.status)}>
                        {verification.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPatient(verification)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Patient Verification Review</ModalTitle>
          </ModalHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient ID</p>
                  <p className="font-medium text-gray-900">{selectedPatient.patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{selectedPatient.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{selectedPatient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedPatient.submittedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getStatusBadge(selectedPatient.status)}>
                    {selectedPatient.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Submitted Documents</p>
                <div className="space-y-2">
                  {selectedPatient.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-900">{doc}</span>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPatient.status === 'Pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Review all documents carefully before making a decision
                  </p>
                </div>
              )}
            </div>
          )}
          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedPatient(null)}>
              Close
            </Button>
            {selectedPatient?.status === 'Pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={processing}
                >
                  {processing ? 'Processing…' : 'Reject'}
                </Button>
                <Button
                  onClick={handleVerify}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={processing}
                >
                  {processing ? 'Processing…' : 'Verify Patient'}
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
