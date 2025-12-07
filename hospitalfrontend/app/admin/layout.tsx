// hospitalfrontend/app/admin/layout.tsx
'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Header } from '@/components/layout/Header'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'
import { roleToPath } from '@/lib/roleToPath'

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
      router.push('/auth')
    } else if (status === 'authenticated' && session?.user) {
      setUser(session.user as any)
      
      // Only redirect if user doesn't have SUPER_ADMIN role
      const userRole = session.user.role
      if (userRole !== UserRole.SUPER_ADMIN && userRole !== 'SUPER_ADMIN') {
        router.push(roleToPath(userRole))
      }
    }
  }, [status, session?.user?.role, router, setUser])

  if (status === 'loading' || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar userRole={UserRole.SUPER_ADMIN} withProvider={false} />
      <SidebarInset className="flex-1 flex flex-col overflow-hidden bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}