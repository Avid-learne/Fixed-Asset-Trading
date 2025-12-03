// hospitalfrontend/app/admin/layout.tsx
'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setUser, user, hasRole } = useAuthStore()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user) {
      setUser(session.user as any)
      
      if (!hasRole([UserRole.SUPER_ADMIN])) {
        router.push(`/${session.user.role.toLowerCase().replace('_', '')}`)
      }
    }
  }, [session, status, router, setUser, hasRole])

  if (status === 'loading' || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={UserRole.SUPER_ADMIN} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}