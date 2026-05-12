// app/bank/verification/page.tsx
'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal'
import { Search, Eye, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { profileService, type ProfileData } from '@/services/profileService'

/** Human-readable filename for an uploaded doc value (data URL or raw filename). */
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

/** True when the value (data URL or filename) refers to a PDF. */
const isPdfDocument = (value: string): boolean => {
  if (value.startsWith('data:application/pdf')) return true
  return /\.pdf(\?|#|$)/i.test(value)
}

/** True when the value (data URL or filename) refers to an image. */
const isImageDocument = (value: string): boolean => {
  if (value.startsWith('data:image/')) return true
  return /\.(jpg|jpeg|png|gif|webp)(\?|#|$)/i.test(value)
}

interface PatientVerification {
  id: string
  userId: string
  patientId: string
  patientName: string
  email: string
  phone: string
  submittedAt: string
  status: 'Pending' | 'Verified' | 'Rejected'
  documents: { label: string; value: string }[]
  kycRejectionReason?: string
}

export default function PatientVerificationPage() {
  const [verifications, setVerifications] = useState<PatientVerification[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientVerification | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<{ label: string; value: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchVerifications()
  }, [])

  const fetchVerifications = async () => {
    try {
      setLoading(true)
      const patients = await profileService.getHospitalPatients()
      setVerifications(
        patients
          .map(mapPatientToVerification)
          .sort((left, right) => left.submittedAt.localeCompare(right.submittedAt))
      )
    } catch (error) {
      console.error('Error fetching verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const mapPatientToVerification = (patient: ProfileData): PatientVerification => {
    const normalizedStatus = (patient.kycStatus || 'PENDING').toUpperCase()
    const documents = [
      { label: 'ID front', value: patient.kycDocumentFront || '' },
      { label: 'ID back', value: patient.kycDocumentBack || '' },
      { label: 'Selfie / live photo', value: patient.kycSelfie || '' },
    ].filter(document => document.value)

    return {
      id: patient.patientId || patient.userId,
      userId: patient.userId,
      patientId: patient.registrationId || patient.patientId || patient.userId,
      patientName: patient.name,
      email: patient.email,
      phone: patient.phoneNum,
      submittedAt: patient.kycSubmittedAt || patient.dateOfBirth || new Date().toISOString(),
      status: normalizedStatus === 'APPROVED' ? 'Verified' : normalizedStatus === 'REJECTED' ? 'Rejected' : 'Pending',
      documents,
      kycRejectionReason: patient.kycRejectionReason,
    }
  }

  const handleVerify = async () => {
    if (!selectedPatient) return

    try {
      setProcessing(true)
      await profileService.reviewKyc(selectedPatient.userId, { approved: true })
      setSelectedPatient(null)
      setRejectReason('')
      fetchVerifications()
    } catch (error) {
      console.error('Error verifying patient:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedPatient) return
    if (!rejectReason.trim()) {
      return
    }

    try {
      setProcessing(true)
      await profileService.reviewKyc(selectedPatient.userId, { approved: false, reason: rejectReason.trim() })
      setSelectedPatient(null)
      setRejectReason('')
      fetchVerifications()
    } catch (error) {
      console.error('Error rejecting patient:', error)
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

  const pendingCount = useMemo(() => verifications.filter(v => v.status === 'Pending').length, [verifications])
  const verifiedCount = useMemo(() => verifications.filter(v => v.status === 'Verified').length, [verifications])
  const rejectedCount = useMemo(() => verifications.filter(v => v.status === 'Rejected').length, [verifications])

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
        <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-gray-500 mt-1">Review patient identity documents before deposit access is enabled</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Verification</CardTitle>
            <AlertCircle className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {pendingCount}
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
              {verifiedCount}
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
              {rejectedCount}
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
                  <TableHead>Documents</TableHead>
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
                    <TableCell className="text-gray-600">
                      {verification.documents.length} file(s)
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
                {selectedPatient.kycRejectionReason && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Rejection Reason</p>
                    <p className="text-sm text-gray-900">{selectedPatient.kycRejectionReason}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Submitted Documents</p>
                <div className="space-y-2">
                  {selectedPatient.documents.length === 0 ? (
                    <p className="text-sm text-gray-500">No documents attached</p>
                  ) : selectedPatient.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900">{doc.label}</span>
                        <p className="text-xs text-gray-500 mt-1 truncate">{friendlyDocumentName(doc.value)}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedDocument(doc)}
                        className="ml-2"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPatient.status === 'Pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Review all documents carefully before making a decision. Only approved KYC submissions unlock deposit requests.
                  </p>
                </div>
              )}

              {selectedPatient.status === 'Verified' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    This KYC submission has been verified and approved.
                  </p>
                </div>
              )}

              {selectedPatient.status === 'Rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <XCircle className="w-4 h-4 inline mr-2" />
                    This KYC submission has been rejected.
                  </p>
                </div>
              )}

              {selectedPatient.status === 'Pending' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Rejection reason, if needed</p>
                  <Textarea
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    placeholder="Add a note for the patient if the KYC is rejected"
                  />
                </div>
              )}
            </div>
          )}
          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedPatient(null)}>
              Close
            </Button>
            {selectedPatient?.status === 'Pending' ? (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={processing || !rejectReason.trim()}
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
            ) : (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                disabled={selectedPatient?.documents.length === 0}
              >
                <Eye className="w-4 h-4" />
                View Submission
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <Modal open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <ModalContent className="max-w-2xl">
            <ModalHeader>
              <div className="flex items-center justify-between w-full">
                <ModalTitle>View Document: {selectedDocument.label}</ModalTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedDocument(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </ModalHeader>
            <div className="px-6 py-4 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {isImageDocument(selectedDocument.value) ? (
                  <div className="space-y-2 max-h-[70vh] overflow-auto">
                    <img
                      src={selectedDocument.value}
                      alt={selectedDocument.label}
                      className="w-full rounded border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial,%20sans-serif%22 font-size=%2218%22 fill=%22%23999%22%3EDocument image could not load%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                ) : isPdfDocument(selectedDocument.value) ? (
                  // Inline PDF — same window, no new tab.
                  <iframe
                    src={selectedDocument.value}
                    className="w-full h-[70vh] border border-gray-300 rounded bg-white"
                    title={selectedDocument.label}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 text-sm mb-4">File: {friendlyDocumentName(selectedDocument.value)}</p>
                    <p className="text-sm text-gray-500">Preview unavailable for this file type.</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Document: {selectedDocument.label}
              </p>
            </div>
          </ModalContent>
        </Modal>
      )}
    </div>
  )
}
