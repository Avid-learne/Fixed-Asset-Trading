"use client"

import { useAuth } from '@/contexts/AuthContext'
import { Permission } from '@/types/auth'
import { UserRole } from '@/types'

interface ProtectedProps {
  children: React.ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  role?: UserRole
  roles?: UserRole[]
  fallback?: React.ReactNode
  hospitalId?: string
  bankId?: string
  patientId?: string
}

/**
 * Component wrapper that shows/hides content based on permissions
 * Usage:
 * <Protected permission={Permission.VIEW_ALL_USERS}>
 *   <UserManagementPage />
 * </Protected>
 */
export function Protected({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  fallback = null,
  hospitalId,
  bankId,
  patientId,
}: ProtectedProps) {
  const { user, hasPermission, hasAllPermissions, hasAnyPermission, canAccessHospital, canAccessBank, canAccessPatient } = useAuth()

  if (!user) return <>{fallback}</>

  // Role-based check
  if (role && user.role !== role) return <>{fallback}</>
  if (roles && !roles.includes(user.role)) return <>{fallback}</>

  // Permission-based check
  if (permission && !hasPermission(permission)) return <>{fallback}</>
  if (permissions) {
    const hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)
    if (!hasAccess) return <>{fallback}</>
  }

  // Resource-based check
  if (hospitalId && !canAccessHospital(hospitalId)) return <>{fallback}</>
  if (bankId && !canAccessBank(bankId)) return <>{fallback}</>
  if (patientId && !canAccessPatient(patientId)) return <>{fallback}</>

  return <>{children}</>
}

/**
 * HOC for protecting entire pages
 * Usage:
 * export default withProtection(UserManagementPage, { permission: Permission.VIEW_ALL_USERS })
 */
export function withProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <Protected {...options}>
        <Component {...props} />
      </Protected>
    )
  }
}
