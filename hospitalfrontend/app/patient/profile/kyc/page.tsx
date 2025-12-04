'use client'

import React from 'react'
import { KYCProgressBar } from '@/components/patient/KYCProgressBar'

export default function ProfileKYCPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">KYC Verification</h1>
      <KYCProgressBar status="Not Submitted" />
      <p className="text-muted-foreground">Upload ID and a selfie to start verification.</p>
    </div>
  )
}
