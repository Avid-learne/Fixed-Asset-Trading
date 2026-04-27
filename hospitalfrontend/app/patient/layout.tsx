// src/app/patient/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Header } from '@/components/layout/Header'
import { useAuthStore } from '@/store/authStore'
import { usePatientProfileStore } from '@/store/patientProfileStore'
import { UserRole } from '@/types'
import { roleToPath } from '@/lib/roleToPath'
import { authService } from '@/lib/authService'

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { setUser, user } = useAuthStore()
  const hydrateFromAuthUser = usePatientProfileStore(state => state.hydrateFromAuthUser)
  const [mounted, setMounted] = useState(false)

  // First effect: Initialize auth on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initializeAuth = async () => {
      try {
        const localToken = authService.getToken()
        const localUser = authService.getUser()

        console.log('[PatientLayout] Initializing - token:', !!localToken, 'user:', !!localUser)

        // If no token, redirect to auth
        if (!localToken) {
          console.log('[PatientLayout] No token found, redirecting to auth')
          router.push('/auth')
          setMounted(true)
          return
        }

        // User from localStorage
        if (localUser) {
          console.log('[PatientLayout] User found in localStorage:', localUser.email)
          setUser(localUser as any)
          hydrateFromAuthUser(localUser)
        } else {
          console.warn('[PatientLayout] Token exists but no user in localStorage')
          router.push('/auth')
          setMounted(true)
          return
        }

        setMounted(true)
      } catch (error) {
        console.error('[PatientLayout] Error initializing auth:', error)
        router.push('/auth')
        setMounted(true)
      }
    }

    initializeAuth()
  }, [router, setUser, hydrateFromAuthUser])

  // Second effect: Handle role-based redirects
  useEffect(() => {
    if (!mounted || !user) return

    const currentRole = user.role || UserRole.PATIENT
    if (currentRole !== UserRole.PATIENT) {
      const correctPath = roleToPath(currentRole)
      if (!pathname.startsWith(correctPath)) {
        console.log(`[PatientLayout] Wrong role ${currentRole}, redirecting to ${correctPath}`)
        router.push(correctPath)
      }
    }
  }, [mounted, user, pathname, router])

  // Show loader while mounting or before user is loaded
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