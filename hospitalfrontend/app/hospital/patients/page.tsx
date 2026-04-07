'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Search, UserX, Wallet, Activity, FileText, CheckCircle2, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { patientService, type PatientWithBalance } from '@/services/patientService'

type PatientRecord = PatientWithBalance

export default function HospitalPatientsPage() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null)
  const [detailTab, setDetailTab] = useState<'record' | 'redeem'>('record')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const detailPanelRef = useRef<HTMLDivElement | null>(null)

  const [redeemAmount, setRedeemAmount] = useState('')
  const [redeemReason, setRedeemReason] = useState('Hospital service redemption')
  const [redeeming, setRedeeming] = useState(false)
  const [redeemMessage, setRedeemMessage] = useState('')
  const [redeemError, setRedeemError] = useState('')

  const loadPatients = async () => {
    try {
      setLoading(true)
      setError('')

      const hospitalId = user?.hospitalId || ''
      const data = hospitalId
        ? await patientService.getPatientsByHospital(hospitalId)
        : await patientService.getAllPatients()

      setPatients(data)
      if (selectedPatient) {
        const updated = data.find((p) => p.userId === selectedPatient.userId)
        setSelectedPatient(updated || null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.hospitalId])

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return patients
    const normalizedQuery = q.replace(/\D/g, '')

    return patients.filter((patient) => {
      const normalizedCnic = (patient.cnic || '').toLowerCase().replace(/\D/g, '')
      return (
        (patient.fullName || '').toLowerCase().includes(q) ||
        (patient.email || '').toLowerCase().includes(q) ||
        (patient.registrationId || '').toLowerCase().includes(q) ||
        (patient.cnic || '').toLowerCase().includes(q) ||
        (normalizedQuery.length > 0 && normalizedCnic.includes(normalizedQuery)) ||
        (patient.phone || '').toLowerCase().includes(q) ||
        (patient.walletAddress || '').toLowerCase().includes(q)
      )
    })
  }, [patients, searchQuery])

  const totalPatients = patients.length
  const verifiedPatients = patients.filter((p) => (p.kycStatus || '').toLowerCase() === 'approved').length
  const pendingKyc = patients.filter((p) => (p.kycStatus || '').toLowerCase() !== 'approved').length
  const totalHt = patients.reduce((sum, p) => sum + Number(p.tokenBalance?.healthToken || 0), 0)

  const getKycBadge = (status?: string) => {
    const normalized = (status || '').toLowerCase()
    if (normalized === 'approved') return <Badge className="bg-emerald-100 text-emerald-800">Approved</Badge>
    if (normalized === 'pending' || normalized === 'in_progress') {
      return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
    }
    if (normalized === 'rejected') return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
    return <Badge variant="outline">{status || 'Unknown'}</Badge>
  }

  const handleRedeem = async () => {
    if (!selectedPatient?.userId) {
      setRedeemError('Patient user ID is missing')
      return
    }

    const amount = Number(redeemAmount)
    const currentHt = Number(selectedPatient.tokenBalance?.healthToken || 0)

    if (!amount || amount <= 0) {
      setRedeemError('Enter a valid HT amount')
      return
    }

    if (amount > currentHt) {
      setRedeemError('Patient does not have enough HT balance')
      return
    }

    try {
      setRedeeming(true)
      setRedeemError('')
      setRedeemMessage('')

      await patientService.redeemPatientHt(selectedPatient.userId, amount, redeemReason)
      setRedeemMessage('HT redeemed successfully and logged in transaction history')
      setRedeemAmount('')

      await loadPatients()
    } catch (err) {
      setRedeemError(err instanceof Error ? err.message : 'Failed to redeem HT')
    } finally {
      setRedeeming(false)
    }
  }

  const openPatientPanel = async (patient: PatientRecord, tab: 'record' | 'redeem') => {
    try {
      setRedeemError('')
      setRedeemMessage('')
      setDetailTab(tab)

      if (patient.userId) {
        const freshPatient = await patientService.getPatientById(patient.userId)
        setSelectedPatient(freshPatient)
      } else {
        setSelectedPatient(patient)
      }

      requestAnimationFrame(() => {
        detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient details')
    }
  }

  const selectPatientAtIndex = (index: number) => {
    if (index >= 0 && index < filteredPatients.length) {
      const patient = filteredPatients[index]
      void openPatientPanel(patient, 'redeem')
      setSearchQuery('')
      setHighlightedIndex(-1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchQuery || filteredPatients.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % filteredPatients.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev - 1 + filteredPatients.length) % filteredPatients.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0) {
        selectPatientAtIndex(highlightedIndex)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading patient records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hospital Patient Records</h1>
          <p className="text-sm text-muted-foreground">Live data from backend. No mock records.</p>
        </div>
        <Button variant="outline" onClick={loadPatients}>Refresh</Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Patients</p>
            <p className="mt-1 text-2xl font-bold">{totalPatients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">KYC Approved</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{verifiedPatients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">KYC Pending/Other</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{pendingKyc}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total HT in Patients</p>
            <p className="mt-1 text-2xl font-bold">{totalHt.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card ref={detailPanelRef} className="border-blue-200">
        <CardHeader>
          <CardTitle>HT Redemption Form</CardTitle>
          <CardDescription>Search and select a patient, then process HT redemption</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Search Patient</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setHighlightedIndex(-1)
                }}
                onKeyDown={handleKeyDown}
                className="pl-10"
                placeholder="Search patient name, email, CNIC, ID..."
              />
            </div>
            {searchQuery && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded border bg-white">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient, index) => (
                    <button
                      key={patient.id}
                      onClick={() => selectPatientAtIndex(index)}
                      className={`w-full border-b px-3 py-1.5 text-left text-sm transition-colors last:border-b-0 ${
                        index === highlightedIndex
                          ? 'bg-blue-500 text-white'
                          : selectedPatient?.id === patient.id
                            ? 'bg-blue-100'
                            : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{patient.fullName}</p>
                          <p className="text-xs opacity-70 truncate">{patient.email}</p>
                        </div>
                        <div className="text-xs font-semibold flex-shrink-0">HT: {Number(patient.tokenBalance?.healthToken || 0).toLocaleString()}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-center text-xs text-muted-foreground">
                    No patients found
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedPatient && (
            <>
              <Tabs value={detailTab} onValueChange={(v) => setDetailTab(v as 'record' | 'redeem')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="record">Patient Record</TabsTrigger>
                  <TabsTrigger value="redeem">Redeem HT</TabsTrigger>
                </TabsList>

                <TabsContent value="record" className="mt-4">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Info label="Name" value={selectedPatient.fullName} />
                    <Info label="Email" value={selectedPatient.email} />
                    <Info label="Phone" value={selectedPatient.phone || 'N/A'} />
                    <Info label="Registration ID" value={selectedPatient.registrationId || 'N/A'} />
                    <Info label="CNIC" value={selectedPatient.cnic || 'N/A'} />
                    <Info label="Blood Group" value={selectedPatient.bloodGroup || 'N/A'} />
                    <Info label="Date of Birth" value={selectedPatient.dateOfBirth || 'N/A'} />
                    <Info label="City" value={selectedPatient.location || 'N/A'} />
                    <Info label="Address" value={selectedPatient.address || 'N/A'} />
                    <Info label="Wallet Address" value={selectedPatient.walletAddress || 'Not linked'} mono />
                    <Info label="KYC Status" value={selectedPatient.kycStatus || 'N/A'} />
                    <Info label="Has Subscription" value={selectedPatient.hasSubscription ? 'Yes' : 'No'} />
                    <Info label="Has Asset" value={selectedPatient.hasAsset ? 'Yes' : 'No'} />
                    <Info label="AT Balance" value={String(Number(selectedPatient.tokenBalance?.assetToken || 0).toLocaleString())} />
                    <Info label="HT Balance" value={String(Number(selectedPatient.tokenBalance?.healthToken || 0).toLocaleString())} />
                  </div>
                </TabsContent>

                <TabsContent value="redeem" className="mt-4 space-y-4">
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1"><Activity className="h-4 w-4" /> Available HT</span>
                      <span className="text-lg font-bold">{Number(selectedPatient.tokenBalance?.healthToken || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Redeem Amount (HT)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(e.target.value)}
                        placeholder="e.g. 50"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Reason / Service</label>
                      <Input
                        value={redeemReason}
                        onChange={(e) => setRedeemReason(e.target.value)}
                        placeholder="Service reason"
                      />
                    </div>
                  </div>

                  {redeemError && <p className="text-sm text-red-600">{redeemError}</p>}
                  {redeemMessage && <p className="text-sm text-emerald-600">{redeemMessage}</p>}

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleRedeem} disabled={redeeming}>
                      {redeeming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Deduct HT For Redemption
                    </Button>
                    <Button variant="outline" onClick={() => { setSelectedPatient(null); setSearchQuery('') }}>Clear Selection</Button>
                  </div>

                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Deduction is blocked if patient balance is insufficient. Each deduction is logged in transactions.
                  </p>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patients ({filteredPatients.length})</CardTitle>
          <CardDescription>Hospital staff can view all patient records and process HT redemption.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="rounded-lg border p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold">{patient.fullName}</p>
                    {getKycBadge(patient.kycStatus)}
                    {patient.status && <Badge variant="outline">{patient.status}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{patient.email} • {patient.phone || 'No phone'}</p>
                  <p className="text-sm text-muted-foreground">Reg ID: {patient.registrationId || 'N/A'} • CNIC: {patient.cnic || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground break-all">Wallet: {patient.walletAddress || 'Not linked'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[280px]">
                  <div className="rounded border p-2">
                    <p className="text-muted-foreground">AT</p>
                    <p className="font-semibold">{Number(patient.tokenBalance?.assetToken || 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded border p-2">
                    <p className="text-muted-foreground">HT</p>
                    <p className="font-semibold">{Number(patient.tokenBalance?.healthToken || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => openPatientPanel(patient, 'record')}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Full Record
                </Button>
                <Button size="sm" onClick={() => openPatientPanel(patient, 'redeem')}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Redeem HT
                </Button>
              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">
              <UserX className="mx-auto mb-3 h-10 w-10" />
              No patient records found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded border p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={mono ? 'mt-1 break-all font-mono text-sm' : 'mt-1 text-sm'}>{value}</p>
    </div>
  )
}
