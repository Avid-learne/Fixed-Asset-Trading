// src/app/patient/page.tsx
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PatientRootRedirect() {
  const router = useRouter()
  useEffect(() => {
    // Use push to ensure navigation happens even if history is needed
    router.push('/patient/dashboard')
  }, [router])
  return (
    <div className="p-6 text-sm text-muted-foreground">
      Redirecting to dashboard...
    </div>
  )
}