'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, Loader2, Send, UploadCloud, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { authService } from '@/lib/authService'
import { profileService, ProfileData } from '@/services/profileService'

type KycState = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'

type KycFormState = {
  fullName: string
  dateOfBirth: string
  gender: string
  nationality: string
  cnic: string
  cnicIssueDate: string
  cnicExpiryDate: string
  phoneNum: string
  email: string
  address: string
  city: string
  country: string
  postalCode: string
  occupation: string
  sourceOfIncome: string
  healthIssues: string
}

type DocumentSelectionState = {
  front: string
  back: string
  selfie: string
}

const STATUS_META: Record<KycState, { label: string; className: string; description: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Your KYC has not been submitted for review yet.',
  },
  IN_PROGRESS: {
    label: 'In Review',
    className: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Hospital admin is reviewing your submitted details and attached documents.',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'KYC is verified. Full patient features are available.',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Your previous KYC was rejected. Update profile details and resubmit.',
  },
}

export default function ProfileKYCPage() {
  const [kycStatus, setKycStatus] = useState<KycState>('PENDING')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [form, setForm] = useState<KycFormState>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    cnic: '',
    cnicIssueDate: '',
    cnicExpiryDate: '',
    phoneNum: '',
    email: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    occupation: '',
    sourceOfIncome: '',
    healthIssues: '',
  })
  const [documents, setDocuments] = useState<DocumentSelectionState>({
    front: '',
    back: '',
    selfie: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const loadKycData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const user = authService.getUser()
        if (!user?.id) {
          throw new Error('User is not authenticated')
        }

        const [profileData, kycData] = await Promise.all([
          profileService.getProfile(user.id),
          profileService.getKycStatus(),
        ])

        setProfile(profileData)
        setKycStatus(kycData.status)
        setForm({
          fullName: profileData.name || '',
          dateOfBirth: profileData.dateOfBirth || '',
          gender: profileData.gender || '',
          nationality: profileData.nationality || '',
          cnic: profileData.cnic || '',
          cnicIssueDate: profileData.cnicIssueDate || '',
          cnicExpiryDate: profileData.cnicExpiryDate || '',
          phoneNum: profileData.phoneNum || '',
          email: profileData.email || '',
          address: profileData.address || '',
          city: profileData.city || '',
          country: profileData.country || '',
          postalCode: profileData.postalCode || '',
          occupation: profileData.occupation || '',
          sourceOfIncome: profileData.sourceOfIncome || '',
          healthIssues: profileData.healthIssues || '',
        })
        setDocuments({
          front: profileData.kycDocumentFront || '',
          back: profileData.kycDocumentBack || '',
          selfie: profileData.kycSelfie || '',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load KYC information')
      } finally {
        setIsLoading(false)
      }
    }

    loadKycData()
  }, [])

  const requiredFields = useMemo(
    () => [
      { label: 'Full name', value: form.fullName },
      { label: 'Date of birth', value: form.dateOfBirth },
      { label: 'Gender', value: form.gender },
      { label: 'Nationality', value: form.nationality },
      { label: 'CNIC', value: form.cnic },
      { label: 'CNIC issue date', value: form.cnicIssueDate },
      { label: 'CNIC expiry date', value: form.cnicExpiryDate },
      { label: 'Phone number', value: form.phoneNum },
      { label: 'Email', value: form.email },
      { label: 'Current address', value: form.address },
      { label: 'City', value: form.city },
      { label: 'Country', value: form.country },
      { label: 'Postal code', value: form.postalCode },
      { label: 'Occupation', value: form.occupation },
      { label: 'Source of income', value: form.sourceOfIncome },
    ],
    [form],
  )

  const missingKycFields = requiredFields
    .filter(field => !field.value.trim())
    .map(field => field.label)

  const completionPercent = Math.round(((requiredFields.length - missingKycFields.length) / requiredFields.length) * 100)

  const canSubmit = (kycStatus === 'PENDING' || kycStatus === 'REJECTED') && missingKycFields.length === 0
  const statusMeta = STATUS_META[kycStatus]

  const setField = (key: keyof KycFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value
    setForm(prev => ({ ...prev, [key]: value }))
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const selectFile = (key: keyof DocumentSelectionState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setDocuments(prev => ({ ...prev, [key]: file ? file.name : '' }))
  }

  const buildPayload = () => ({
    name: form.fullName,
    cnic: form.cnic,
    gender: form.gender,
    nationality: form.nationality,
    cnicIssueDate: form.cnicIssueDate,
    cnicExpiryDate: form.cnicExpiryDate,
    phoneNum: form.phoneNum,
    address: form.address,
    city: form.city,
    country: form.country,
    postalCode: form.postalCode,
    occupation: form.occupation,
    sourceOfIncome: form.sourceOfIncome,
    healthIssues: form.healthIssues,
    dateOfBirth: form.dateOfBirth,
    kycDocumentFront: documents.front,
    kycDocumentBack: documents.back,
    kycSelfie: documents.selfie,
  })

  const persistDraft = async () => {
    const user = authService.getUser()
    if (!user?.id) {
      throw new Error('User is not authenticated')
    }

    const updatedProfile = await profileService.updateProfile(user.id, buildPayload())
    setProfile(updatedProfile)
    return updatedProfile
  }

  const handleSubmitKyc = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(null)

      if (missingKycFields.length > 0) {
        throw new Error(`Please complete the required fields before submitting: ${missingKycFields.join(', ')}`)
      }

      if (!documents.front || !documents.back || !documents.selfie) {
        throw new Error('Please attach front ID, back ID, and selfie/live photo before submitting KYC')
      }

      await persistDraft()

      const response = await profileService.submitKyc()
      setKycStatus(response.status)
      setSuccess('KYC submitted successfully. Hospital admin review is now pending.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit KYC')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading KYC data...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="rounded-2xl border bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-sm">
        <h1 className="text-3xl font-bold">KYC Verification</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">
          Fill in your details step by step, and submit only when every section is complete.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge className="bg-white/10 text-white hover:bg-white/15">Simple review flow</Badge>
          <Badge className="bg-white/10 text-white hover:bg-white/15">Patient self-service</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Current KYC Status
            </span>
            <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
          </CardTitle>
          <CardDescription>{statusMeta.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={completionPercent} />
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{completionPercent}% ready</span>
            <span>Required fields missing: {missingKycFields.length}</span>
            {kycStatus === 'IN_PROGRESS' && <span className="inline-flex items-center gap-1 text-sky-600"><Clock className="h-4 w-4" />Under review</span>}
            {kycStatus === 'REJECTED' && <span className="inline-flex items-center gap-1 text-rose-600"><XCircle className="h-4 w-4" />Needs attention</span>}
          </div>

          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
          )}

          {success && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>1. Basic information</CardTitle>
            <CardDescription>Start with the details that identify you as the patient.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={form.fullName} onChange={setField('fullName')} placeholder="Enter your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={setField('dateOfBirth')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={form.gender} onValueChange={value => setForm(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" value={form.nationality} onChange={setField('nationality')} placeholder="e.g. Pakistani" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick guide</CardTitle>
            <CardDescription>Work through the form in order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Basic identity</p>
            <p>2. CNIC details</p>
            <p>3. Contact and address</p>
            <p>4. Occupation and health notes</p>
            <p>5. Document uploads</p>
            <p>6. Submit for review</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>2. Identity details</CardTitle>
            <CardDescription>Use the same details on your government ID.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cnic">CNIC</Label>
              <Input id="cnic" value={form.cnic} onChange={setField('cnic')} placeholder="35202-1234567-8" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnicIssueDate">Issue date</Label>
              <Input id="cnicIssueDate" type="date" value={form.cnicIssueDate} onChange={setField('cnicIssueDate')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnicExpiryDate">Expiry date</Label>
              <Input id="cnicExpiryDate" type="date" value={form.cnicExpiryDate} onChange={setField('cnicExpiryDate')} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>3. Contact and address</CardTitle>
            <CardDescription>Make sure hospitals can reach you easily.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phoneNum">Phone number</Label>
              <Input id="phoneNum" value={form.phoneNum} onChange={setField('phoneNum')} placeholder="+92 300 1234567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} readOnly disabled />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Current address</Label>
              <Textarea id="address" value={form.address} onChange={setField('address')} placeholder="House, street, area" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={setField('city')} placeholder="Karachi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={form.country} onChange={setField('country')} placeholder="Pakistan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input id="postalCode" value={form.postalCode} onChange={setField('postalCode')} placeholder="75500" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>4. Occupation and health</CardTitle>
            <CardDescription>These help compliance understand the application context.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input id="occupation" value={form.occupation} onChange={setField('occupation')} placeholder="e.g. Teacher" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceOfIncome">Source of income</Label>
              <Input id="sourceOfIncome" value={form.sourceOfIncome} onChange={setField('sourceOfIncome')} placeholder="Salary, business, pension, etc." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="healthIssues">Health issues or diseases</Label>
              <Textarea id="healthIssues" value={form.healthIssues} onChange={setField('healthIssues')} placeholder="Optional: mention relevant conditions, allergies, or none" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>5. Verification documents</CardTitle>
            <CardDescription>Attach the documents compliance should review.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 rounded-lg border border-dashed p-4">
              <Label htmlFor="idFront">ID front</Label>
              <Input id="idFront" type="file" accept="image/*,.pdf" onChange={selectFile('front')} />
              <p className="text-xs text-muted-foreground">{documents.front || 'No file selected'}</p>
            </div>
            <div className="space-y-2 rounded-lg border border-dashed p-4">
              <Label htmlFor="idBack">ID back</Label>
              <Input id="idBack" type="file" accept="image/*,.pdf" onChange={selectFile('back')} />
              <p className="text-xs text-muted-foreground">{documents.back || 'No file selected'}</p>
            </div>
            <div className="space-y-2 rounded-lg border border-dashed p-4">
              <Label htmlFor="selfie">Selfie / live photo</Label>
              <Input id="selfie" type="file" accept="image/*" capture="user" onChange={selectFile('selfie')} />
              <p className="text-xs text-muted-foreground">{documents.selfie || 'No file selected'}</p>
            </div>
            <div className="md:col-span-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <UploadCloud className="mt-0.5 h-4 w-4 text-slate-500" />
                <p>
                  Keep the document images clear and uncut. Attach all three files before submitting.
                </p>
              </div>
            </div>
            <div className="md:col-span-3 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Submitted document preview</p>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                <div className="rounded-md border bg-slate-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">ID front</p>
                  <p className="mt-1 break-words text-sm">{documents.front || 'Not attached yet'}</p>
                </div>
                <div className="rounded-md border bg-slate-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">ID back</p>
                  <p className="mt-1 break-words text-sm">{documents.back || 'Not attached yet'}</p>
                </div>
                <div className="rounded-md border bg-slate-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Selfie / live photo</p>
                  <p className="mt-1 break-words text-sm">{documents.selfie || 'Not attached yet'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-emerald-200 bg-emerald-50/40">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleSubmitKyc} disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit KYC for review
              </Button>
            </div>

            <div className="rounded-md border border-emerald-200 bg-white p-3 text-sm text-emerald-900">
              <p className="font-medium">Before you submit</p>
              <p className="mt-1">Make sure all required fields are filled and your ID front, back, and selfie are attached.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle>Need a quick cleanup?</CardTitle>
          <CardDescription>If you need to change basic contact details, update them in the Basic Profile tab first.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-sm text-blue-900">
            <AlertCircle className="mt-0.5 h-5 w-5 text-blue-700" />
            <p>
              KYC review is handled by the hospital admin. If rejected, come back here, correct the details, and resubmit.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
