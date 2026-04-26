"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuthUser, Permission, ROLE_PERMISSIONS, AccessControlContext } from '@/types/auth'
import { UserRole } from '@/types'
import { authService } from '@/lib/authService'

const AuthContext = createContext<AccessControlContext | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const buildAuthUser = (storedUser: ReturnType<typeof authService.getUser>, response?: { userId?: string; email?: string; name?: string } | null): AuthUser | null => {
    if (!storedUser) return null

    const normalizedRole = (storedUser.role?.toUpperCase() || 'PATIENT') as UserRole

    return {
      id: response?.userId || storedUser.id || '',
      email: response?.email || storedUser.email || '',
      name: response?.name || storedUser.name || '',
      role: normalizedRole,
      permissions: ROLE_PERMISSIONS[normalizedRole] || [],
      createdAt: new Date().toISOString(),
      mfaEnabled: false,
      isActive: true,
      hospitalId: storedUser.hospitalId,
      bankId: storedUser.bankId,
      patientId: storedUser.patientId,
    }
  }

  useEffect(() => {
    // Load user from backend on mount
    const loadUser = async () => {
      try {
        const storedUser = authService.getUser()
        const token = authService.getToken()
        
        if (!storedUser || !token) {
          console.log('No stored user or token found')
          setUser(null)
          setIsLoading(false)
          return
        }

        // Hydrate immediately from local storage so pages don't enter false unauth states.
        const fallbackUser = buildAuthUser(storedUser)
        if (fallbackUser) {
          setUser(fallbackUser)
        }

        // Create timeout for verification
        const timeoutId = setTimeout(() => {
          console.warn('User verification timed out, using stored auth state')
          setIsLoading(false)
        }, 8000); // 8 second timeout

        // Verify token with backend
        const response = await authService.fetchCurrentUser()
        clearTimeout(timeoutId)
        
        if (response && response.success) {
          const authUser = buildAuthUser(storedUser, response)
          if (authUser) {
            console.log('User loaded successfully:', authUser.email)
            setUser(authUser)
          }
        } else {
          console.warn('Token verification failed, continuing with stored auth state')
        }
      } catch (error) {
        console.error('Failed to load user:', error)
        // Keep stored auth state on transient errors; route guards handle true unauthenticated users.
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false
    return permissions.some(permission => user.permissions.includes(permission))
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false
    return permissions.every(permission => user.permissions.includes(permission))
  }

  const canAccessHospital = (hospitalId: string): boolean => {
    if (!user) return false
    
    // Super admin can access all hospitals
    if (user.role === UserRole.SUPER_ADMIN) return true
    
    // Hospital staff/admin can only access their own hospital
    if (user.role === UserRole.HOSPITAL_ADMIN || user.role === UserRole.HOSPITAL_STAFF) {
      return user.hospitalId === hospitalId
    }
    
    // Bank officers can access connected hospitals
    if (user.role === UserRole.BANK_OFFICER && user.bank) {
      return user.bank.connectedHospitalIds.includes(hospitalId)
    }
    
    return false
  }

  const canAccessBank = (bankId: string): boolean => {
    if (!user) return false
    
    // Super admin can access all banks
    if (user.role === UserRole.SUPER_ADMIN) return true
    
    // Bank officer can only access their own bank
    if (user.role === UserRole.BANK_OFFICER) {
      return user.bankId === bankId
    }
    
    // Hospital admin can access connected banks
    if (user.role === UserRole.HOSPITAL_ADMIN && user.hospital) {
      return user.hospital.connectedBankIds.includes(bankId)
    }
    
    return false
  }

  const canAccessPatient = (patientId: string): boolean => {
    if (!user) return false
    
    // Super admin can access all patients
    if (user.role === UserRole.SUPER_ADMIN) return true
    
    // Patient can only access their own data
    if (user.role === UserRole.PATIENT) {
      return user.id === patientId
    }
    
    // Hospital admin can access all patients in their hospital
    if (user.role === UserRole.HOSPITAL_ADMIN && user.hospitalId) {
      // TODO: Add hospital-patient relationship check
      return true // Placeholder - implement actual check
    }
    
    // Hospital staff can access assigned patients
    if (user.role === UserRole.HOSPITAL_STAFF && user.hospitalId) {
      // TODO: Add staff-patient assignment check
      return true // Placeholder - implement actual check
    }
    
    return false
  }

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authService.login({ email, password })
      
      if (response.success && response.userId) {
        const storedUser = authService.getUser()
        if (storedUser) {
          const authUser = buildAuthUser(storedUser, response)
          if (!authUser) throw new Error('Unable to initialize user session')
          setUser(authUser)
        }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = (): void => {
    const token = authService.getToken()
    authService.logout(token || undefined)
    setUser(null)
  }

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authService.fetchCurrentUser()
      
      if (response && response.success) {
        const storedUser = authService.getUser()
        if (storedUser) {
          const authUser = buildAuthUser(storedUser, response)
          if (!authUser) throw new Error('Unable to refresh user session')
          setUser(authUser)
        }
      } else {
        const storedUser = authService.getUser()
        const fallbackUser = buildAuthUser(storedUser)
        if (fallbackUser) {
          setUser(fallbackUser)
        } else {
          authService.logout()
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      const storedUser = authService.getUser()
      const fallbackUser = buildAuthUser(storedUser)
      if (fallbackUser) {
        setUser(fallbackUser)
      } else {
        authService.logout()
        setUser(null)
      }
    }
  }

  const value: AccessControlContext = {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessHospital,
    canAccessBank,
    canAccessPatient,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hook for permission checks
export function usePermission(permission: Permission) {
  const { hasPermission } = useAuth()
  return hasPermission(permission)
}

// Helper hook for multiple permission checks
export function usePermissions(permissions: Permission[], requireAll = false) {
  const { hasAllPermissions, hasAnyPermission } = useAuth()
  return requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)
}
