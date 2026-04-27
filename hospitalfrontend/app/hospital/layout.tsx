// src/app/hospital/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Header } from '@/components/layout/Header'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'
import { roleToPath } from '@/lib/roleToPath'
import { authService } from '@/lib/authService'

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { setUser, user } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initializeAuth = async () => {
      try {
        const localToken = authService.getToken()
        const localUser = authService.getUser()

        console.log('[HospitalLayout] Initializing - token:', !!localToken, 'user:', !!localUser)

        if (!localToken) {
          console.log('[HospitalLayout] No token found, redirecting to auth')
          router.push('/auth')
          setMounted(true)
          return
        }

        if (localUser) {
          console.log('[HospitalLayout] User found in localStorage:', localUser.email)
          setUser(localUser as any)
        } else {
          console.warn('[HospitalLayout] Token exists but no user in localStorage')
          router.push('/auth')
          setMounted(true)
          return
        }

        setMounted(true)
      } catch (error) {
        console.error('[HospitalLayout] Error initializing auth:', error)
        router.push('/auth')
        setMounted(true)
      }
    }

    initializeAuth()
  }, [router, setUser])

  useEffect(() => {
    if (!mounted || !user) return

    const currentRole = user.role || UserRole.HOSPITAL_STAFF
    if (currentRole !== UserRole.HOSPITAL_STAFF && currentRole !== UserRole.HOSPITAL_ADMIN) {
      const correctPath = roleToPath(currentRole)
      if (!pathname.startsWith(correctPath)) {
        console.log(`[HospitalLayout] Wrong role ${currentRole}, redirecting to ${correctPath}`)
        router.push(correctPath)
      }
    }
  }, [mounted, user, pathname, router])

  if (!mounted || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar userRole={UserRole.HOSPITAL_STAFF} withProvider={false} />
      <SidebarInset className="flex-1 flex flex-col overflow-hidden bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}