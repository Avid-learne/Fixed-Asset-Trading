// src/app/patient/layout.tsx
'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Header } from '@/components/layout/Header'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'
import { roleToPath } from '@/lib/roleToPath'

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { setUser, user } = useAuthStore()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
      return
    }
    
    if (session?.user) {
      // Only set user if not already set or if user has changed
      if (!user || user.id !== session.user.id) {
        setUser(session.user as any)
      }
      
      // Only redirect if user has wrong role AND not already on correct path
      if (session.user.role !== UserRole.PATIENT) {
        const correctPath = roleToPath(session.user.role)
        if (!pathname.startsWith(correctPath)) {
          router.push(correctPath)
        }
      }
    }
  }, [session?.user?.id, status, pathname])

  if (status === 'loading' || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar userRole={UserRole.PATIENT} withProvider={false} />
      <SidebarInset className="flex-1 flex flex-col overflow-hidden bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}