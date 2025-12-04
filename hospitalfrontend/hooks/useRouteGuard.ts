"use client"

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Permission } from '@/types/auth'
import { UserRole } from '@/types'

interface RouteGuardOptions {
  requiredPermission?: Permission
  requiredPermissions?: Permission[]
  requireAll?: boolean
  requiredRole?: UserRole
  requiredRoles?: UserRole[]
  redirectTo?: string
  hospitalId?: string
  bankId?: string
  patientId?: string
}

/**
 * Hook to protect routes based on permissions and roles
 * Redirects unauthorized users
 */
export function useRouteGuard(options: RouteGuardOptions = {}) {
  const router = useRouter()
  const { 
    user, 
    isLoading, 
    hasPermission, 
    hasAllPermissions, 
    hasAnyPermission,
    canAccessHospital,
    canAccessBank,
    canAccessPatient
  } = useAuth()

  useEffect(() => {
    if (isLoading) return

    // No user - redirect to login
    if (!user) {
      router.push(options.redirectTo || '/login')
      return
    }

    // Check role requirements
    if (options.requiredRole && user.role !== options.requiredRole) {
      router.push(options.redirectTo || '/')
      return
    }

    if (options.requiredRoles && !options.requiredRoles.includes(user.role)) {
      router.push(options.redirectTo || '/')
      return
    }

    // Check permission requirements
    if (options.requiredPermission && !hasPermission(options.requiredPermission)) {
      router.push(options.redirectTo || '/')
      return
    }

    if (options.requiredPermissions) {
      const hasAccess = options.requireAll 
        ? hasAllPermissions(options.requiredPermissions)
        : hasAnyPermission(options.requiredPermissions)
      
      if (!hasAccess) {
        router.push(options.redirectTo || '/')
        return
      }
    }

    // Check resource access
    if (options.hospitalId && !canAccessHospital(options.hospitalId)) {
      router.push(options.redirectTo || '/')
      return
    }

    if (options.bankId && !canAccessBank(options.bankId)) {
      router.push(options.redirectTo || '/')
      return
    }

    if (options.patientId && !canAccessPatient(options.patientId)) {
      router.push(options.redirectTo || '/')
      return
    }
  }, [
    user,
    isLoading,
    router,
    options,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canAccessHospital,
    canAccessBank,
    canAccessPatient
  ])

  return { user, isLoading, isAuthorized: !!user }
}

/**
 * Route configuration mapping
 */
export const ROUTE_PERMISSIONS: Record<string, RouteGuardOptions> = {
  // Super Admin routes
  '/admin': { requiredRole: UserRole.SUPER_ADMIN },
  '/admin/users': { requiredPermission: Permission.VIEW_ALL_USERS },
  '/admin/hospitals': { requiredPermission: Permission.VIEW_ALL_HOSPITALS },
  '/admin/hospitals/list': { requiredPermission: Permission.VIEW_ALL_HOSPITALS },
  '/admin/hospitals/create': { requiredPermission: Permission.CREATE_HOSPITAL },
  '/admin/banks': { requiredPermission: Permission.VIEW_ALL_BANKS },
  '/admin/banks/list': { requiredPermission: Permission.VIEW_ALL_BANKS },
  '/admin/banks/create': { requiredPermission: Permission.CREATE_BANK },
  '/admin/logs/audits': { requiredPermission: Permission.VIEW_ALL_AUDIT_LOGS },
  '/admin/logs/errors': { requiredPermission: Permission.VIEW_ERROR_LOGS },
  '/admin/logs/transactions': { requiredPermission: Permission.VIEW_TRANSACTION_LOGS },
  '/admin/billing/plans': { requiredPermission: Permission.MANAGE_SUBSCRIPTIONS },
  '/admin/billing/invoices': { requiredPermission: Permission.VIEW_ALL_BILLING },
  '/admin/analytics': { requiredPermission: Permission.VIEW_SYSTEM_ANALYTICS },
  '/admin/notifications': { requiredPermission: Permission.SEND_NOTIFICATIONS },

  // Hospital Admin routes
  '/hospitaladmin': { requiredRoles: [UserRole.HOSPITAL_ADMIN, UserRole.HOSPITAL_STAFF] },
  '/hospitaladmin/patients': { requiredPermissions: [Permission.VIEW_HOSPITAL_PATIENTS, Permission.VIEW_ASSIGNED_PATIENTS] },
  '/hospitaladmin/deposits': { requiredPermissions: [Permission.VIEW_HOSPITAL_ASSETS, Permission.APPROVE_ASSETS] },
  '/hospitaladmin/minting': { requiredPermission: Permission.MINT_TOKENS },
  '/hospitaladmin/allocation': { requiredPermission: Permission.ALLOCATE_TOKENS },
  '/hospitaladmin/trading': { requiredPermission: Permission.TRADE_TOKENS },
  '/hospitaladmin/staff': { requiredPermission: Permission.MANAGE_STAFF },
  '/hospitaladmin/banks': { requiredPermission: Permission.VIEW_OWN_HOSPITAL },
  '/hospitaladmin/reports': { requiredPermission: Permission.VIEW_HOSPITAL_ANALYTICS },
  '/hospitaladmin/audit': { requiredPermission: Permission.VIEW_HOSPITAL_AUDIT_LOGS },

  // Bank Officer routes
  '/bank': { requiredRole: UserRole.BANK_OFFICER },
  '/bank/assets': { requiredPermission: Permission.APPROVE_ASSETS },
  '/bank/transactions': { requiredPermission: Permission.VIEW_BANK_TRANSACTIONS },
  '/bank/hospitals': { requiredPermission: Permission.VIEW_OWN_BANK },
  '/bank/policies': { requiredPermission: Permission.VIEW_OWN_BANK },
  '/bank/compliance': { requiredPermission: Permission.APPROVE_TRANSACTIONS },
  '/bank/reports': { requiredPermission: Permission.VIEW_BANK_ANALYTICS },

  // Patient routes
  '/patient': { requiredRole: UserRole.PATIENT },
  '/patient/profile': { requiredPermission: Permission.VIEW_OWN_PROFILE },
  '/patient/deposit': { requiredPermission: Permission.VIEW_OWN_ASSETS },
  '/patient/tokens': { requiredPermission: Permission.VIEW_OWN_ASSETS },
  '/patient/at-tokens': { requiredPermission: Permission.VIEW_OWN_ASSETS },
  '/patient/ht-tokens': { requiredPermission: Permission.VIEW_OWN_ASSETS },
  '/patient/history': { requiredPermission: Permission.VIEW_OWN_TRANSACTIONS },
}
