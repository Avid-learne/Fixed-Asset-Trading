'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileContactForm } from './ProfileContactForm'

export default function ProfileInfoPage() {
  const router = useRouter()

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Manage Profile Information</h1>
        <p className="text-muted-foreground">
          Update your contact details so hospitals and account notifications reach you on time.
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Why keep this up to date?</CardTitle>
          <CardDescription>Hospitals rely on accurate contact data to verify assets and token requests.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <div>• Verification teams contact you using these details when reviewing deposits.</div>
          <div>• Accurate phone numbers ensure you receive OTP codes for high‑value transactions.</div>
          <div>• Your location helps route requests to nearby hospitals for faster processing.</div>
          <div>• Keeping information current lowers the risk of delays or rejected submissions.</div>
        </CardContent>
      </Card>
    </div>
  )
}
