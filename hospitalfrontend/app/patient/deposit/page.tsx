// src/app/patient/deposit/page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose } from '@/components/ui/Modal'
import { Coins, Building2, ArrowRight, CheckCircle, Calculator, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/authService'
import { depositRequestService, type AssetDepositItem } from '@/services/depositRequestService'
import { profileService } from '@/services/profileService'
import { dashboardService, type AssetPrices } from '@/services/dashboardService'

type AssetType = 'gold' | 'silver' | ''

type DepositDocumentState = {
  receipt: string
  purityCertificate: string
  supportingDocuments: string
}

export default function DepositAssetPage() {
  const router = useRouter()
  const [assetType, setAssetType] = useState<AssetType>('')
  const [weight, setWeight] = useState('')
  const [assignedHospitalName, setAssignedHospitalName] = useState('')
  const [error, setError] = useState('')
  const [submittedRequest, setSubmittedRequest] = useState<AssetDepositItem | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<AssetDepositItem[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [assetPrices, setAssetPrices] = useState<AssetPrices | null>(null)
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [kycStatus, setKycStatus] = useState<string>('PENDING')
  const [documents, setDocuments] = useState<DepositDocumentState>({
    receipt: '',
    purityCertificate: '',
    supportingDocuments: '',
  })
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingDepositData, setPendingDepositData] = useState<{
    assetType: string
    weight: number
    assetValue: number
  } | null>(null)

  const loadMyRequests = async () => {
    try {
      setLoadingRequests(true)
      const data = await depositRequestService.getMyRequests('all')
      setRequests(data)
    } catch (error) {
      console.warn('Your history could not be loaded right now.', error)
    } finally {
      setLoadingRequests(false)
    }
  }

  const loadAssetPrices = async () => {
    try {
      setLoadingPrices(true)
      const data = await dashboardService.getAssetPrices()
      setAssetPrices(data)
    } catch (priceError) {
      setAssetPrices(null)
      console.warn('Asset prices could not be loaded right now; continuing without price preview.', priceError)
    } finally {
      setLoadingPrices(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const user = authService.getUser()
      setAssignedHospitalName(user?.hospitalName || user?.hospitalId || '')

      if (user?.id) {
        try {
          const profile = await profileService.getProfile(user.id)
          setKycStatus((profile.kycStatus || 'PENDING').toUpperCase())
        } catch {
          setKycStatus('PENDING')
        }
      }

      loadMyRequests()
      loadAssetPrices()
    }

    init()
  }, [])

  const calculateWorth = () => {
    const weightNum = parseFloat(weight)
    if (!weightNum || !assetType || !assetPrices) return 0
    const ratePerGram = assetType === 'gold' ? assetPrices.goldPricePerGram : assetPrices.silverPricePerGram
    return weightNum * ratePerGram
  }

  const calculateTokens = () => {
    if (!assetPrices?.tokenPricePerPkr) return 0
    return Math.floor(calculateWorth() / assetPrices.tokenPricePerPkr)
  }

  const selectedHospitalDisplay = useMemo(
    () => submittedRequest?.hospitalName || assignedHospitalName || 'Not Assigned',
    [submittedRequest?.hospitalName, assignedHospitalName]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError('')

      const assetValue = calculateWorth()
      if (!documents.receipt || !documents.purityCertificate || !documents.supportingDocuments) {
        throw new Error('Please attach the asset receipt, purity certificate, and supporting document before submitting')
      }

      // Show confirmation dialog instead of submitting immediately
      setPendingDepositData({
        assetType: assetType.toUpperCase(),
        weight: Number(weight),
        assetValue,
      })
      setShowConfirm(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prepare deposit')
    }
  }

  const handleConfirmDeposit = async () => {
    if (!pendingDepositData) return

    try {
      setLoading(true)
      setError('')
      setShowConfirm(false)

      const response = await depositRequestService.submitRequest({
        assetType: pendingDepositData.assetType,
        weight: pendingDepositData.weight,
        assetValue: pendingDepositData.assetValue,
        assetReceipt: documents.receipt,
        purityCertificate: documents.purityCertificate,
        supportingDocuments: documents.supportingDocuments,
      })

      setSubmittedRequest(response)
      setRequests(prev => [response, ...prev.filter(item => item.assetId !== response.assetId)])
      setLoading(false)
      setSubmitted(true)
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to submit request')
    }
  }

  const resetForm = () => {
    setAssetType('')
    setWeight('')
    setSubmittedRequest(null)
    setSubmitted(false)
    setDocuments({
      receipt: '',
      purityCertificate: '',
      supportingDocuments: '',
    })
  }

  const approvedByBank = useMemo(
    () => requests.filter(item => (item.bankApprovalStatus || '').toLowerCase() === 'approved'),
    [requests]
  )

  const isKycApproved = kycStatus === 'APPROVED'
  const isPricingReady = Boolean(assetPrices?.goldPricePerGram && assetPrices?.silverPricePerGram && assetPrices?.tokenPricePerPkr)

  const areAllDocumentsSubmitted = () => {
    return documents.receipt && documents.purityCertificate && documents.supportingDocuments
  }

  const getMissingDocuments = () => {
    const missing: string[] = []
    if (!documents.receipt) missing.push('Asset Receipt')
    if (!documents.purityCertificate) missing.push('Purity Certificate')
    if (!documents.supportingDocuments) missing.push('Supporting Document')
    return missing
  }

  const requestStatusBadge = (status: string) => {
    const normalized = (status || '').toLowerCase()
    if (normalized === 'approved') {
      return <Badge className="bg-emerald-600 hover:bg-emerald-600">Hospital Approved</Badge>
    }
    if (normalized === 'rejected') {
      return <Badge className="bg-rose-600 hover:bg-rose-600">Rejected</Badge>
    }
    return <Badge variant="outline">Pending Hospital Review</Badge>
  }

  const bankStatusBadge = (status?: string) => {
    const normalized = (status || '').toLowerCase()
    if (normalized === 'approved') {
      return <Badge className="bg-emerald-600 hover:bg-emerald-600">Approved by Bank</Badge>
    }
    if (normalized === 'rejected') {
      return <Badge className="bg-rose-600 hover:bg-rose-600">Rejected by Bank</Badge>
    }
    if (normalized === 'pending') {
      return <Badge variant="outline">In Bank Review</Badge>
    }
    return <Badge variant="secondary">Awaiting Forwarding</Badge>
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center">
              <CardContent className="pt-12 pb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Request Submitted Successfully!</h2>
            <p className="text-muted-foreground mb-2">
              Your investment request has been sent to the hospital for verification, including the attached asset documents.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              You will receive a notification once approvals complete and HT is credited.
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4">Request Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset Type:</span>
                  <span className="font-medium capitalize">{assetType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="font-medium">{weight} grams</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset Worth:</span>
                    <span className="font-medium">PKR {Number(submittedRequest?.assetValue ?? pendingDepositData?.assetValue ?? calculateWorth()).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected HT:</span>
                    <span className="font-semibold text-lg text-primary">
                      {Number(submittedRequest?.expectedTokens ?? (pendingDepositData?.assetValue && assetPrices?.tokenPricePerPkr ? Math.floor(pendingDepositData.assetValue / assetPrices.tokenPricePerPkr) : calculateTokens())).toLocaleString()} HT
                    </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hospital:</span>
                  <span className="font-medium">{selectedHospitalDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request Status:</span>
                  <span className="font-medium capitalize">{submittedRequest?.status || 'pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt:</span>
                  <span className="font-medium">{submittedRequest?.assetReceipt || documents.receipt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purity certificate:</span>
                  <span className="font-medium">{submittedRequest?.purityCertificate || documents.purityCertificate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supporting docs:</span>
                  <span className="font-medium">{submittedRequest?.supportingDocuments || documents.supportingDocuments}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push('/patient/dashboard')}>
                Go to Dashboard
              </Button>
              <Button onClick={resetForm}>
                Submit Another Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deposit Asset</h1>
        <p className="text-muted-foreground mt-1">
          Deposit gold or silver to receive Health Tokens (HT) after approvals
        </p>
      </div>

      {loadingPrices && (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Loading live gold, silver, and HT pricing...
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!assignedHospitalName && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Hospital is not assigned on your profile yet. Contact hospital admin to assign a hospital before submitting deposits.
        </div>
      )}

      {!isKycApproved && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          KYC must be approved before submitting a deposit request. Current KYC status: {kycStatus}.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Select Asset Type
                </CardTitle>
                <CardDescription>Choose the precious metal you want to invest.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAssetType('gold')}
                    className={`p-6 border-2 rounded-lg text-center transition-all hover:shadow-md ${
                      assetType === 'gold'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-border hover:border-yellow-300'
                    }`}
                  >
                    <div className="text-4xl mb-2" aria-hidden="true">🥇</div>
                    <div className="font-semibold text-lg">Gold</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {assetPrices ? `PKR ${assetPrices.goldPricePerGram.toLocaleString()}/gram` : 'Live rate unavailable'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssetType('silver')}
                    className={`p-6 border-2 rounded-lg text-center transition-all hover:shadow-md ${
                      assetType === 'silver'
                        ? 'border-slate-500 bg-slate-50'
                        : 'border-border hover:border-slate-300'
                    }`}
                  >
                    <div className="text-4xl mb-2" aria-hidden="true">🥈</div>
                    <div className="font-semibold text-lg">Silver</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {assetPrices ? `PKR ${assetPrices.silverPricePerGram.toLocaleString()}/gram` : 'Live rate unavailable'}
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Details</CardTitle>
                <CardDescription>Provide how much metal you want to deposit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Weight in grams</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={weight}
                    onChange={event => setWeight(event.target.value)}
                    placeholder="e.g. 25"
                    required
                  />
                </div>

                <div className="rounded-lg border p-4 bg-muted/40 text-sm text-muted-foreground">
                  Asset worth updates automatically using live gold, silver, and HT token pricing from the backend.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verification Documents</CardTitle>
                <CardDescription>Upload the receipt and proof used to verify the asset.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Document Requirement Status */}
                <div className={`rounded-lg border p-3 ${areAllDocumentsSubmitted() ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="space-y-2">
                    {[
                      { label: 'Asset Receipt', key: 'receipt' },
                      { label: 'Purity / Carat Certificate', key: 'purityCertificate' },
                      { label: 'Supporting Document', key: 'supportingDocuments' }
                    ].map(doc => {
                      const isSubmitted = documents[doc.key as keyof DepositDocumentState]
                      return (
                        <div key={doc.key} className="flex items-center gap-2 text-sm">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSubmitted 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {isSubmitted ? '✓' : '○'}
                          </div>
                          <span className={isSubmitted ? 'text-green-700 font-medium' : 'text-amber-700'}>
                            {doc.label} {isSubmitted ? '(Submitted)' : '(Required)'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <p className={`text-xs mt-3 ${
                    areAllDocumentsSubmitted() 
                      ? 'text-green-700' 
                      : 'text-amber-700'
                  }`}>
                    {areAllDocumentsSubmitted() 
                      ? '✓ All required documents submitted' 
                      : `⚠ ${getMissingDocuments().length} document(s) still needed before submission`}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Asset receipt</label>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(event) => setDocuments((prev) => ({ ...prev, receipt: event.target.files?.[0]?.name || '' }))}
                  />
                  <p className="text-xs text-muted-foreground">{documents.receipt || 'No file selected'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Purity / carat certificate</label>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(event) => setDocuments((prev) => ({ ...prev, purityCertificate: event.target.files?.[0]?.name || '' }))}
                  />
                  <p className="text-xs text-muted-foreground">{documents.purityCertificate || 'No file selected'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Supporting document</label>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(event) => setDocuments((prev) => ({ ...prev, supportingDocuments: event.target.files?.[0]?.name || '' }))}
                  />
                  <p className="text-xs text-muted-foreground">{documents.supportingDocuments || 'No file selected'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Assigned Hospital
                </CardTitle>
                <CardDescription>Deposit requests are automatically routed to your assigned hospital profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
                  <p className="font-medium text-slate-900">{selectedHospitalDisplay}</p>
                  <p className="text-xs text-slate-600 mt-1">Hospital selection is managed in signup/profile assignment.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Your selected hospital verifies the asset details you submit.</p>
                <p>Your assigned hospital receives this request automatically.</p>
                <p>Once approved by hospital and bank, an Asset Health Card is auto-created for you.</p>
                <p>Approved HT is automatically credited to your wallet and your Asset Health Card.</p>
                <p>You can use or transfer HT once verification is complete.</p>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Investment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Asset Type</span>
                    <span className="font-medium capitalize">{assetType || '—'}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Weight</span>
                    <span className="font-medium">{weight ? `${weight} g` : '—'}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Hospital</span>
                    <span className="font-medium">{selectedHospitalDisplay}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Asset Worth</span>
                    <span className="font-semibold">
                      PKR {calculateWorth().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Estimated HT</span>
                    <span className="font-semibold text-primary">{calculateTokens().toLocaleString()} HT</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={loading || loadingPrices || !isPricingReady || !assetType || !weight || selectedHospitalDisplay === 'Not Assigned' || !isKycApproved || !areAllDocumentsSubmitted()}
                  title={!areAllDocumentsSubmitted() ? `Missing: ${getMissingDocuments().join(', ')}` : ''}
                >
                  {loading ? 'Submitting…' : 'Submit Investment Request'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-sm text-muted-foreground">
                Need help? Contact your hospital representative for guidance on acceptable asset documentation.
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Deposits Approved by Bank</CardTitle>
          <CardDescription>These deposits have completed both hospital and bank approval.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingRequests ? (
            <p className="text-sm text-muted-foreground">Loading approved deposits...</p>
          ) : approvedByBank.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bank-approved deposits yet.</p>
          ) : (
            approvedByBank.map(item => (
              <div key={item.assetId} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{item.assetType} • {item.weight} g</p>
                  {bankStatusBadge(item.bankApprovalStatus)}
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <p>Worth: PKR {Number(item.assetValue).toLocaleString()}</p>
                  <p>Tokens: {Number(item.expectedTokens).toLocaleString()} HT</p>
                  <p>Date: {new Date(item.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Deposit Requests</CardTitle>
          <CardDescription>Track hospital and bank review status for every request.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingRequests ? (
            <p className="text-sm text-muted-foreground">Loading your requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deposit requests submitted yet.</p>
          ) : (
            requests.map(item => (
              <div key={item.assetId} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{item.assetType} • {item.weight} g</p>
                  <div className="flex items-center gap-2">
                    {requestStatusBadge(item.status)}
                    {bankStatusBadge(item.bankApprovalStatus)}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <p>Worth: PKR {Number(item.assetValue).toLocaleString()}</p>
                  <p>Tokens: {Number(item.expectedTokens).toLocaleString()} HT</p>
                  <p>Submitted: {new Date(item.submittedAt).toLocaleDateString()}</p>
                </div>
                {item.rejectionReason && (
                  <p className="mt-2 text-sm text-rose-700">Reason: {item.rejectionReason}</p>
                )}
                {item.bankRejectionReason && (
                  <p className="mt-1 text-sm text-rose-700">Bank reason: {item.bankRejectionReason}</p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Deposit Confirmation Modal */}
      {showConfirm && pendingDepositData && (
        <Modal open={showConfirm} onOpenChange={setShowConfirm}>
          <ModalContent className="max-w-md">
            <ModalHeader>
              <ModalTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Confirm Asset Deposit
              </ModalTitle>
            </ModalHeader>
            <div className="space-y-4 px-6 py-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Please review the details before submitting:</p>
                <div className="rounded-lg bg-slate-50 p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Asset Type:</span>
                    <span className="text-sm">{pendingDepositData.assetType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Weight:</span>
                    <span className="text-sm">{pendingDepositData.weight}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Asset Value:</span>
                    <span className="text-sm">Rs. {pendingDepositData.assetValue.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span className="text-sm">Estimated HT Tokens:</span>
                    <span className="text-sm">{assetPrices?.tokenPricePerPkr ? Math.floor(pendingDepositData.assetValue / assetPrices.tokenPricePerPkr).toLocaleString() : '—'} HT</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This request will be sent to your hospital for approval before processing.
              </p>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmDeposit} 
                disabled={loading}
                className="bg-primary"
              >
                {loading ? 'Submitting...' : 'Confirm Deposit'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  )
}
