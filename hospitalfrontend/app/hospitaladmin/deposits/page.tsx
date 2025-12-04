'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Search, Eye, FileText, AlertTriangle, Clock, Filter, Download, Users } from 'lucide-react'

interface Deposit {
  id: string
  patientId: string
  patientName: string
  patientEmail: string
  assetType: string
  assetDescription: string
  value: number
  status: 'pending_review' | 'pending_bank' | 'approved' | 'rejected'
  submittedDate: string
  documentStatus: 'incomplete' | 'complete'
  documents: {
    title: string
    type: string
    status: 'verified' | 'pending' | 'rejected'
  }[]
  bankVerification?: {
    status: 'pending' | 'verified' | 'failed'
    verifiedBy?: string
    verifiedDate?: string
  }
}

const mockDeposits: Deposit[] = [
  {
    id: 'DEP-1001',
    patientId: 'PAT-001',
    patientName: 'John Smith',
    patientEmail: 'john@example.com',
    assetType: 'Real Estate',
    assetDescription: 'Residential Property - 123 Main St',
    value: 250000,
    status: 'pending_review',
    submittedDate: '2024-11-20',
    documentStatus: 'complete',
    documents: [
      { title: 'Property Deed', type: 'pdf', status: 'verified' },
      { title: 'Valuation Report', type: 'pdf', status: 'verified' },
      { title: 'Tax Statement', type: 'pdf', status: 'pending' },
    ],
    bankVerification: { status: 'pending' }
  },
  {
    id: 'DEP-1002',
    patientId: 'PAT-002',
    patientName: 'Sarah Johnson',
    patientEmail: 'sarah@example.com',
    assetType: 'Medical Equipment',
    assetDescription: 'MRI Scanner - Siemens Model X200',
    value: 80000,
    status: 'pending_bank',
    submittedDate: '2024-11-18',
    documentStatus: 'complete',
    documents: [
      { title: 'Equipment Invoice', type: 'pdf', status: 'verified' },
      { title: 'Ownership Certificate', type: 'pdf', status: 'verified' },
    ],
    bankVerification: { status: 'verified', verifiedBy: 'Global Trust Bank', verifiedDate: '2024-11-21' }
  },
  {
    id: 'DEP-1003',
    patientId: 'PAT-003',
    patientName: 'Michael Brown',
    patientEmail: 'michael@example.com',
    assetType: 'Vehicle',
    assetDescription: 'Tesla Model S - 2023',
    value: 45000,
    status: 'pending_review',
    submittedDate: '2024-11-22',
    documentStatus: 'incomplete',
    documents: [
      { title: 'Vehicle Title', type: 'pdf', status: 'verified' },
      { title: 'Insurance Document', type: 'pdf', status: 'rejected' },
    ],
    bankVerification: { status: 'pending' }
  },
]

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>(mockDeposits)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDeposits, setSelectedDeposits] = useState<string[]>([])
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showBulkApprove, setShowBulkApprove] = useState(false)
  const [processing, setProcessing] = useState(false)

  const filteredDeposits = deposits.filter((deposit) => {
    const matchesSearch = deposit.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDeposits(filteredDeposits.filter(d => d.status !== 'approved' && d.status !== 'rejected').map(d => d.id))
    } else {
      setSelectedDeposits([])
    }
  }

  const handleSelectDeposit = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedDeposits([...selectedDeposits, id])
    } else {
      setSelectedDeposits(selectedDeposits.filter(d => d !== id))
    }
  }

  const handleApprove = (id: string) => {
    setDeposits(deposits.map(d => d.id === id ? { ...d, status: 'approved' as const } : d))
  }

  const handleReject = () => {
    if (!selectedDeposit || !rejectReason.trim()) return
    
    setProcessing(true)
    setTimeout(() => {
      setDeposits(deposits.map(d => 
        d.id === selectedDeposit.id ? { ...d, status: 'rejected' as const } : d
      ))
      setShowRejectDialog(false)
      setRejectReason('')
      setSelectedDeposit(null)
      setProcessing(false)
    }, 1000)
  }

  const handleBulkApprove = () => {
    setProcessing(true)
    setTimeout(() => {
      setDeposits(deposits.map(d => 
        selectedDeposits.includes(d.id) ? { ...d, status: 'approved' as const } : d
      ))
      setSelectedDeposits([])
      setShowBulkApprove(false)
      setProcessing(false)
    }, 1500)
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      pending_review: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending Review', icon: Clock },
      pending_bank: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Pending Bank', icon: Clock },
      approved: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected', icon: XCircle },
    }
    const config = configs[status as keyof typeof configs]
    const Icon = config.icon
    return (
      <Badge variant="outline" className={`gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const pendingCount = deposits.filter(d => d.status === 'pending_review').length
  const bankPendingCount = deposits.filter(d => d.status === 'pending_bank').length
  const approvedCount = deposits.filter(d => d.status === 'approved').length
  const totalValue = deposits.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deposit Approvals</h1>
          <p className="text-muted-foreground mt-1">Review and approve patient asset deposits for tokenization.</p>
        </div>
        {selectedDeposits.length > 0 && (
          <Button className="gap-2" onClick={() => setShowBulkApprove(true)}>
            <CheckCircle className="w-4 h-4" />
            Approve Selected ({selectedDeposits.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Pending Review
              <Clock className="w-4 h-4 text-yellow-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Bank Verification
              <Users className="w-4 h-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{bankPendingCount}</p>
            <p className="text-sm text-muted-foreground mt-1">With banks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Approved
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{approvedCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Ready to mint</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Total Value
              <Download className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">${(totalValue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground mt-1">Approved assets</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Deposit Queue</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search deposits..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="pending_bank">Pending Bank</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedDeposits.length === filteredDeposits.filter(d => d.status !== 'approved' && d.status !== 'rejected').length && filteredDeposits.filter(d => d.status !== 'approved' && d.status !== 'rejected').length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Deposit ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Asset Type</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeposits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No deposits found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedDeposits.includes(deposit.id)}
                        onCheckedChange={(checked) => handleSelectDeposit(deposit.id, checked as boolean)}
                        disabled={deposit.status === 'approved' || deposit.status === 'rejected'}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{deposit.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{deposit.patientName}</p>
                        <p className="text-xs text-muted-foreground">{deposit.patientId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{deposit.assetType}</TableCell>
                    <TableCell className="text-right font-medium">${deposit.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        deposit.documentStatus === 'complete' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }>
                        {deposit.documents.length} docs - {deposit.documentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedDeposit(deposit)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {deposit.status === 'pending_review' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleApprove(deposit.id)}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                setSelectedDeposit(deposit)
                                setShowRejectDialog(true)
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Deposit Details Dialog */}
      <Dialog open={!!selectedDeposit && !showRejectDialog} onOpenChange={(open) => !open && setSelectedDeposit(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deposit Details - {selectedDeposit?.id}</DialogTitle>
            <DialogDescription>
              Review all information before approving or rejecting this deposit.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeposit && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Patient Name</label>
                    <p className="text-sm">{selectedDeposit.patientName}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Patient ID</label>
                    <p className="text-sm font-mono">{selectedDeposit.patientId}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Asset Type</label>
                    <p className="text-sm">{selectedDeposit.assetType}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Asset Value</label>
                    <p className="text-sm font-bold">${selectedDeposit.value.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Asset Description</label>
                    <p className="text-sm text-muted-foreground">{selectedDeposit.assetDescription}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Submitted Date</label>
                    <p className="text-sm">{selectedDeposit.submittedDate}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Status</label>
                    {getStatusBadge(selectedDeposit.status)}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="space-y-3">
                  {selectedDeposit.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.type.toUpperCase()}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={
                        doc.status === 'verified' 
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : doc.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }>
                        {doc.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="verification" className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Bank Verification Status</h4>
                    {selectedDeposit.bankVerification?.status === 'verified' ? (
                      <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-green-900">Verified by {selectedDeposit.bankVerification.verifiedBy}</p>
                          <p className="text-xs text-green-700 mt-1">Verified on {selectedDeposit.bankVerification.verifiedDate}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-yellow-900">Pending Bank Verification</p>
                          <p className="text-xs text-yellow-700 mt-1">Awaiting response from custody bank</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Document Verification</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Verified Documents</span>
                        <span className="font-medium">{selectedDeposit.documents.filter(d => d.status === 'verified').length} / {selectedDeposit.documents.length}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(selectedDeposit.documents.filter(d => d.status === 'verified').length / selectedDeposit.documents.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDeposit(null)}>
              Close
            </Button>
            {selectedDeposit?.status === 'pending_review' && (
              <>
                <Button 
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => {
                    handleApprove(selectedDeposit.id)
                    setSelectedDeposit(null)
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Deposit</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this deposit.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">
                The patient will be notified via email about the rejection and the reason provided.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false)
              setRejectReason('')
            }} disabled={processing}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || processing}
            >
              {processing ? 'Processing...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Approve Dialog */}
      <Dialog open={showBulkApprove} onOpenChange={setShowBulkApprove}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Approve Deposits</DialogTitle>
            <DialogDescription>
              You are about to approve {selectedDeposits.length} deposits.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Deposits</p>
              <p className="text-2xl font-bold">{selectedDeposits.length}</p>
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.filter(d => selectedDeposits.includes(d.id)).map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.patientName}</TableCell>
                      <TableCell>{d.assetType}</TableCell>
                      <TableCell className="text-right">${d.value.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Approved deposits will be moved to the minting queue and patients will be notified.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkApprove(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleBulkApprove} disabled={processing}>
              {processing ? 'Processing...' : 'Approve All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
