import { UserRole } from '@/types'

export function roleToPath(role: UserRole | string): string {
  const normalized = String(role)
  // Map supports both enum values (e.g., 'Hospital_Staff') and auth values (e.g., 'HOSPITAL_STAFF')
  const roleMap: Record<string, string> = {
    // Enum string values from UserRole
    [UserRole.SUPER_ADMIN]: '/admin',
    [UserRole.HOSPITAL_ADMIN]: '/hospitaladmin',
    [UserRole.HOSPITAL_STAFF]: '/hospital',
    [UserRole.PATIENT]: '/patient',
    [UserRole.BANK_OFFICER]: '/bank',
    // Uppercase underscore variants coming from NextAuth demo users
    SUPER_ADMIN: '/admin',
    HOSPITAL_ADMIN: '/hospitaladmin',
    HOSPITAL_STAFF: '/hospital',
    PATIENT: '/patient',
    BANK_OFFICER: '/bank',
  }

  return roleMap[normalized] || '/patient'
}
