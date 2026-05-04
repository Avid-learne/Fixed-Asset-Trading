'use client'

// hospitalfrontend/app/admin/page.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminHome() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/dashboard')
  }, [router])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-sm text-muted-foreground">Opening the super admin control center...</p>
      </div>
    </div>
  )
}