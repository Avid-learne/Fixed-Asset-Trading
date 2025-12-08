'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Camera,
  CreditCard,
  Home,
  Briefcase,
  FileImage,
  Download,
  Eye,
  Trash2
} from 'lucide-react'

type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'not_submitted'

type Document = {
  id: string
  name: string
  type: string
  status: DocumentStatus
  uploadedAt?: string
  verifiedAt?: string
  rejectionReason?: string
  fileUrl?: string
}

type AssetRequest = {
  id: string
  assetType: 'gold' | 'silver'
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'verification_needed'
  submittedAt: string
  documents: Document[]
  remarks?: string
}

type SubscriptionRequest = {
  id: string
  plan: 'Basic' | 'Premium' | 'Enterprise'
  status: 'active' | 'pending' | 'expired'
  startDate: string
  endDate?: string
  documents: Document[]
}

export default function ProfileKYCPage() {
  const [activeTab, setActiveTab] = useState('identity')
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})

  // Mock data - replace with actual API calls
  const [identityDocs, setIdentityDocs] = useState<Document[]>([
    {
      id: '1',
      name: 'National ID Card',
      type: 'identity',
      status: 'verified',
      uploadedAt: '2025-12-01',
      verifiedAt: '2025-12-02',
      fileUrl: '/uploads/id-card.pdf'
    },
    {
      id: '2',
      name: 'Selfie with ID',
      type: 'identity',
      status: 'verified',
      uploadedAt: '2025-12-01',
      verifiedAt: '2025-12-02',
      fileUrl: '/uploads/selfie.jpg'
    }
  ])

  const [addressDocs, setAddressDocs] = useState<Document[]>([
    {
      id: '3',
      name: 'Utility Bill',
      type: 'address',
      status: 'pending',
      uploadedAt: '2025-12-05',
      fileUrl: '/uploads/utility-bill.pdf'
    }
  ])

  const [financialDocs, setFinancialDocs] = useState<Document[]>([
    {
      id: '4',
      name: 'Bank Statement',
      type: 'financial',
      status: 'not_submitted'
    },
    {
      id: '5',
      name: 'Income Source Declaration',
      type: 'financial',
      status: 'not_submitted'
    }
  ])

  const [assetRequests, setAssetRequests] = useState<AssetRequest[]>([
    {
      id: 'AR001',
      assetType: 'gold',
      amount: 50000,
      status: 'verification_needed',
      submittedAt: '2025-12-07',
      documents: [
        {
          id: 'a1',
          name: 'Gold Certificate',
          type: 'asset',
          status: 'pending',
          uploadedAt: '2025-12-07',
          fileUrl: '/uploads/gold-cert.pdf'
        },
        {
          id: 'a2',
          name: 'Asset Photo',
          type: 'asset',
          status: 'not_submitted'
        }
      ],
      remarks: 'Additional verification required for gold certificate authenticity'
    },
    {
      id: 'AR002',
      assetType: 'silver',
      amount: 25000,
      status: 'approved',
      submittedAt: '2025-11-20',
      documents: [
        {
          id: 'a3',
          name: 'Silver Certificate',
          type: 'asset',
          status: 'verified',
          uploadedAt: '2025-11-20',
          verifiedAt: '2025-11-22',
          fileUrl: '/uploads/silver-cert.pdf'
        }
      ]
    }
  ])

  const [subscriptions, setSubscriptions] = useState<SubscriptionRequest[]>([
    {
      id: 'SUB001',
      plan: 'Premium',
      status: 'active',
      startDate: '2025-01-01',
      endDate: '2026-01-01',
      documents: [
        {
          id: 's1',
          name: 'Insurance Document',
          type: 'subscription',
          status: 'verified',
          uploadedAt: '2024-12-28',
          verifiedAt: '2024-12-30',
          fileUrl: '/uploads/insurance.pdf'
        },
        {
          id: 's2',
          name: 'Medical Records',
          type: 'subscription',
          status: 'verified',
          uploadedAt: '2024-12-28',
          verifiedAt: '2024-12-30',
          fileUrl: '/uploads/medical.pdf'
        }
      ]
    }
  ])

  const handleFileUpload = async (docType: string, docId: string, file: File) => {
    setUploadingFiles({ ...uploadingFiles, [docId]: true })
    
    // Simulate upload
    setTimeout(() => {
      setUploadingFiles({ ...uploadingFiles, [docId]: false })
      alert(`${file.name} uploaded successfully!`)
      // Update document status here
    }, 2000)
  }

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'not_submitted':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Not Submitted</Badge>
      default:
        return null
    }
  }

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Review</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case 'verification_needed':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Verification Needed</Badge>
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Expired</Badge>
      default:
        return null
    }
  }

  const calculateKYCCompletion = () => {
    const allDocs = [...identityDocs, ...addressDocs, ...financialDocs]
    const verified = allDocs.filter(d => d.status === 'verified').length
    return Math.round((verified / allDocs.length) * 100)
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold">KYC Verification</h1>
        <p className="text-muted-foreground mt-1">
          Complete your verification to unlock full platform access and manage your assets.
        </p>
      </div>

      {/* KYC Status Overview */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>Track your document verification progress</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{calculateKYCCompletion()}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary rounded-full h-3 transition-all duration-300"
              style={{ width: `${calculateKYCCompletion()}%` }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {[...identityDocs, ...addressDocs, ...financialDocs].filter(d => d.status === 'verified').length}
              </div>
              <div className="text-xs text-gray-600">Verified</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {[...identityDocs, ...addressDocs, ...financialDocs].filter(d => d.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {[...identityDocs, ...addressDocs, ...financialDocs].filter(d => d.status === 'rejected').length}
              </div>
              <div className="text-xs text-gray-600">Rejected</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <AlertCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-600">
                {[...identityDocs, ...addressDocs, ...financialDocs].filter(d => d.status === 'not_submitted').length}
              </div>
              <div className="text-xs text-gray-600">Not Submitted</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="assets">Asset Requests</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        {/* Identity Documents Tab */}
        <TabsContent value="identity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Identity Verification
              </CardTitle>
              <CardDescription>Upload your government-issued ID and selfie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {identityDocs.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {doc.name.includes('Selfie') ? <Camera className="w-5 h-5 text-gray-400" /> : <FileText className="w-5 h-5 text-gray-400" />}
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        {doc.uploadedAt && (
                          <p className="text-xs text-gray-500">Uploaded on {doc.uploadedAt}</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                  
                  {doc.status === 'not_submitted' && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload('identity', doc.id, file)
                        }}
                        disabled={uploadingFiles[doc.id]}
                      />
                      <Button size="sm" disabled={uploadingFiles[doc.id]}>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingFiles[doc.id] ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                  )}

                  {doc.fileUrl && doc.status !== 'not_submitted' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}

                  {doc.status === 'verified' && doc.verifiedAt && (
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Verified on {doc.verifiedAt}
                    </div>
                  )}

                  {doc.rejectionReason && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      <strong>Rejection Reason:</strong> {doc.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Proof Tab */}
        <TabsContent value="address" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Proof of Address
              </CardTitle>
              <CardDescription>Upload utility bill or bank statement (not older than 3 months)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressDocs.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        {doc.uploadedAt && (
                          <p className="text-xs text-gray-500">Uploaded on {doc.uploadedAt}</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                  
                  {doc.status === 'not_submitted' && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload('address', doc.id, file)
                        }}
                      />
                      <Button size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  )}

                  {doc.fileUrl && doc.status !== 'not_submitted' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Add Additional Address Proof
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Documents Tab */}
        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Financial Source Declaration
              </CardTitle>
              <CardDescription>Verify your income source and financial capability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {financialDocs.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        {doc.uploadedAt && (
                          <p className="text-xs text-gray-500">Uploaded on {doc.uploadedAt}</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                  
                  {doc.status === 'not_submitted' && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload('financial', doc.id, file)
                        }}
                      />
                      <Button size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  )}

                  {doc.fileUrl && doc.status !== 'not_submitted' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asset Requests Tab */}
        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                Asset Deposit Requests
              </CardTitle>
              <CardDescription>Track your gold and silver asset verification requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {assetRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileImage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No asset requests yet</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/patient/deposit'}>
                    Make a Deposit Request
                  </Button>
                </div>
              ) : (
                assetRequests.map((request) => (
                  <Card key={request.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Request #{request.id}
                          </CardTitle>
                          <CardDescription>
                            {request.assetType.toUpperCase()} Asset - ${request.amount.toLocaleString()}
                          </CardDescription>
                        </div>
                        {getRequestStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Submitted:</span>
                        <span className="font-medium">{request.submittedAt}</span>
                      </div>

                      {request.remarks && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm">
                          <strong className="text-amber-800">Remarks:</strong>
                          <p className="text-amber-700 mt-1">{request.remarks}</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Required Documents:</h4>
                        {request.documents.map((doc) => (
                          <div key={doc.id} className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{doc.name}</span>
                              </div>
                              {getStatusBadge(doc.status)}
                            </div>
                            
                            {doc.status === 'not_submitted' && (
                              <div className="flex items-center gap-2 mt-2">
                                <Input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleFileUpload('asset', doc.id, file)
                                  }}
                                  className="text-sm"
                                />
                                <Button size="sm">
                                  <Upload className="w-3 h-3 mr-1" />
                                  Upload
                                </Button>
                              </div>
                            )}

                            {doc.fileUrl && doc.status !== 'not_submitted' && (
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription Plans
              </CardTitle>
              <CardDescription>Manage your subscription documents and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {subscriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No active subscriptions</p>
                  <Button className="mt-4">
                    Subscribe to a Plan
                  </Button>
                </div>
              ) : (
                subscriptions.map((sub) => (
                  <Card key={sub.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {sub.plan} Plan
                          </CardTitle>
                          <CardDescription>
                            Subscription ID: {sub.id}
                          </CardDescription>
                        </div>
                        {getRequestStatusBadge(sub.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Start Date:</span>
                          <p className="font-medium">{sub.startDate}</p>
                        </div>
                        {sub.endDate && (
                          <div>
                            <span className="text-gray-600">End Date:</span>
                            <p className="font-medium">{sub.endDate}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Subscription Documents:</h4>
                        {sub.documents.map((doc) => (
                          <div key={doc.id} className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{doc.name}</span>
                              </div>
                              {getStatusBadge(doc.status)}
                            </div>
                            
                            {doc.fileUrl && doc.status !== 'not_submitted' && (
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Renew Subscription
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900">Need Help?</h4>
              <p className="text-sm text-blue-800">
                All documents must be clear, legible, and not expired. For asset deposits, ensure you provide high-quality photos and authentic certificates. Processing typically takes 2-5 business days.
              </p>
              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
