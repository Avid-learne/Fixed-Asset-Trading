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

export default function BankLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { setUser, user, isLoading, setLoading } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        const localToken = authService.getToken()
        const localUser = authService.getUser()

        // If no token, redirect to auth
        if (!localToken) {
          console.log('[BankLayout] No token found, redirecting to auth')
          router.push('/auth')
          return
        }

        // User from localStorage
        if (localUser) {
          setUser(localUser as any)
          console.log('[BankLayout] User hydrated from localStorage:', localUser.email)
        } else {
          console.warn('[BankLayout] Token exists but no user data in localStorage')
          router.push('/auth')
        }
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    if (!user) return

    // Only redirect if user has wrong role
    const currentRole = user.role || UserRole.BANK_OFFICER
    if (currentRole !== UserRole.BANK_OFFICER) {
      const correctPath = roleToPath(currentRole)
      if (!pathname.startsWith(correctPath)) {
        console.log(`[BankLayout] Wrong role ${currentRole}, redirecting to ${correctPath}`)
        router.push(correctPath)
      }
    }
  }, [user, pathname, router])

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar userRole={UserRole.BANK_OFFICER} withProvider={false} />
      <SidebarInset className="flex-1 flex flex-col overflow-hidden bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
