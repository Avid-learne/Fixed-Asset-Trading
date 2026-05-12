'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { profileService } from '@/services/profileService'
import { ProfileContactForm } from './ProfileContactForm'

export default function ProfileInfoPage() {
  const router = useRouter()
  const [kycStatus, setKycStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'>('PENDING')

  useEffect(() => {
    profileService.getKycStatus()
      .then(result => setKycStatus(result.status))
      .catch(() => setKycStatus('PENDING'))
  }, [])

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Manage Profile Information</h1>
        <p className="text-muted-foreground">
          Update your contact details so hospitals and account notifications reach you on time.
        </p>
      </div>

      <Card className={kycStatus === 'APPROVED' ? 'border-emerald-200 bg-emerald-50/40' : 'border-amber-200 bg-amber-50/40'}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>KYC information</span>
            <Badge variant={kycStatus === 'APPROVED' ? 'default' : 'secondary'}>{kycStatus}</Badge>
          </CardTitle>
          <CardDescription>
            Make sure CNIC, phone, city, address, and date of birth are complete, then submit KYC for approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/patient/profile/kyc" className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
            Open KYC Page
          </Link>
          <Link href="/patient/dashboard" className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
            Go to Dashboard
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact details</CardTitle>
          <CardDescription>These details appear on hospital requests and billing records.</CardDescription>
        </CardHeader>
        <ProfileContactForm
          onCancel={() => router.back()}
          submitLabel="Save changes"
          cancelLabel="Cancel"
          pendingLabel="Saving…"
        />
      </Card>

    </div>
  )
}
