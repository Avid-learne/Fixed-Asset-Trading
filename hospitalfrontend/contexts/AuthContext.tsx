"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuthUser, Permission, ROLE_PERMISSIONS, AccessControlContext } from '@/types/auth'
import { UserRole } from '@/types'

const AuthContext = createContext<AccessControlContext | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual authentication logic
    // For now, simulate loading user from localStorage or API
    const loadUser = async () => {
      try {
        // Simulated user - replace with actual auth
        const mockUser: AuthUser = {
          id: '1',
          email: 'admin@assetbridge.com',
          name: 'System Administrator',
          role: UserRole.SUPER_ADMIN,
          permissions: ROLE_PERMISSIONS[UserRole.SUPER_ADMIN],
          createdAt: new Date().toISOString(),
          mfaEnabled: true,
          isActive: true,
        }
        
        setUser(mockUser)
      } catch (error) {
        console.error('Failed to load user:', error)
        setUser(null)
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

  const value: AccessControlContext = {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessHospital,
    canAccessBank,
    canAccessPatient,
    isLoading,
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
