// Extended types for authentication and authorization

import { UserRole } from './index'

export interface Hospital {
  id: string
  name: string
  registrationNumber: string
  address: string
  city: string
  state: string
  contactEmail: string
  contactPhone: string
  status: 'active' | 'inactive' | 'suspended'
  verificationStatus: 'pending' | 'verified' | 'rejected'
  connectedBankIds: string[]
  createdAt: string
}

export interface Bank {
  id: string
  name: string
  registrationNumber: string
  address: string
  city: string
  state: string
  contactEmail: string
  contactPhone: string
  status: 'active' | 'inactive' | 'suspended'
  verificationStatus: 'pending' | 'verified' | 'rejected'
  connectedHospitalIds: string[]
  createdAt: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  address?: string
  
  // Hospital affiliation (for hospital_staff and hospital_admin)
  hospitalId?: string
  hospital?: Hospital
  
  // Bank affiliation (for bank_officer)
  bankId?: string
  bank?: Bank
  
  // Permissions
  permissions: Permission[]
  
  // Metadata
  createdAt: string
  lastLogin?: string
  mfaEnabled: boolean
  isActive: boolean
}

export enum Permission {
  // User Management
  VIEW_ALL_USERS = 'view_all_users',
  CREATE_USER = 'create_user',
  EDIT_USER = 'edit_user',
  DELETE_USER = 'delete_user',
  ASSIGN_ROLES = 'assign_roles',
  
  // Hospital Management
  VIEW_ALL_HOSPITALS = 'view_all_hospitals',
  VIEW_OWN_HOSPITAL = 'view_own_hospital',
  CREATE_HOSPITAL = 'create_hospital',
  EDIT_HOSPITAL = 'edit_hospital',
  VERIFY_HOSPITAL = 'verify_hospital',
  
  // Bank Management
  VIEW_ALL_BANKS = 'view_all_banks',
  VIEW_OWN_BANK = 'view_own_bank',
  CREATE_BANK = 'create_bank',
  EDIT_BANK = 'edit_bank',
  VERIFY_BANK = 'verify_bank',
  
  // Patient Management
  VIEW_ALL_PATIENTS = 'view_all_patients',
  VIEW_HOSPITAL_PATIENTS = 'view_hospital_patients',
  VIEW_ASSIGNED_PATIENTS = 'view_assigned_patients',
  VIEW_OWN_PROFILE = 'view_own_profile',
  EDIT_PATIENT = 'edit_patient',
  
  // Asset & Token Operations
  VIEW_ALL_ASSETS = 'view_all_assets',
  VIEW_HOSPITAL_ASSETS = 'view_hospital_assets',
  VIEW_OWN_ASSETS = 'view_own_assets',
  APPROVE_ASSETS = 'approve_assets',
  MINT_TOKENS = 'mint_tokens',
  ALLOCATE_TOKENS = 'allocate_tokens',
  TRADE_TOKENS = 'trade_tokens',
  
  // Financial Operations
  VIEW_ALL_TRANSACTIONS = 'view_all_transactions',
  VIEW_HOSPITAL_TRANSACTIONS = 'view_hospital_transactions',
  VIEW_BANK_TRANSACTIONS = 'view_bank_transactions',
  VIEW_OWN_TRANSACTIONS = 'view_own_transactions',
  APPROVE_TRANSACTIONS = 'approve_transactions',
  
  // Reports & Analytics
  VIEW_SYSTEM_ANALYTICS = 'view_system_analytics',
  VIEW_HOSPITAL_ANALYTICS = 'view_hospital_analytics',
  VIEW_BANK_ANALYTICS = 'view_bank_analytics',
  VIEW_OWN_ANALYTICS = 'view_own_analytics',
  
  // Audit & Logs
  VIEW_ALL_AUDIT_LOGS = 'view_all_audit_logs',
  VIEW_HOSPITAL_AUDIT_LOGS = 'view_hospital_audit_logs',
  VIEW_ERROR_LOGS = 'view_error_logs',
  VIEW_TRANSACTION_LOGS = 'view_transaction_logs',
  
  // Billing & Subscriptions
  VIEW_ALL_BILLING = 'view_all_billing',
  MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',
  GENERATE_INVOICES = 'generate_invoices',
  
  // System Configuration
  MANAGE_SETTINGS = 'manage_settings',
  SEND_NOTIFICATIONS = 'send_notifications',
  MANAGE_STAFF = 'manage_staff',
}

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Full system access
    Permission.VIEW_ALL_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
    Permission.ASSIGN_ROLES,
    Permission.VIEW_ALL_HOSPITALS,
    Permission.CREATE_HOSPITAL,
    Permission.EDIT_HOSPITAL,
    Permission.VERIFY_HOSPITAL,
    Permission.VIEW_ALL_BANKS,
    Permission.CREATE_BANK,
    Permission.EDIT_BANK,
    Permission.VERIFY_BANK,
    Permission.VIEW_ALL_PATIENTS,
    Permission.VIEW_ALL_ASSETS,
    Permission.VIEW_ALL_TRANSACTIONS,
    Permission.VIEW_SYSTEM_ANALYTICS,
    Permission.VIEW_ALL_AUDIT_LOGS,
    Permission.VIEW_ERROR_LOGS,
    Permission.VIEW_TRANSACTION_LOGS,
    Permission.VIEW_ALL_BILLING,
    Permission.MANAGE_SUBSCRIPTIONS,
    Permission.GENERATE_INVOICES,
    Permission.MANAGE_SETTINGS,
    Permission.SEND_NOTIFICATIONS,
  ],
  
  [UserRole.HOSPITAL_ADMIN]: [
    // Hospital-scoped full access
    Permission.VIEW_OWN_HOSPITAL,
    Permission.VIEW_HOSPITAL_PATIENTS,
    Permission.EDIT_PATIENT,
    Permission.VIEW_HOSPITAL_ASSETS,
    Permission.APPROVE_ASSETS,
    Permission.MINT_TOKENS,
    Permission.ALLOCATE_TOKENS,
    Permission.TRADE_TOKENS,
    Permission.VIEW_HOSPITAL_TRANSACTIONS,
    Permission.VIEW_HOSPITAL_ANALYTICS,
    Permission.VIEW_HOSPITAL_AUDIT_LOGS,
    Permission.MANAGE_STAFF,
    Permission.SEND_NOTIFICATIONS,
  ],
  
  [UserRole.HOSPITAL_STAFF]: [
    // Limited hospital access
    Permission.VIEW_OWN_HOSPITAL,
    Permission.VIEW_ASSIGNED_PATIENTS,
    Permission.EDIT_PATIENT,
    Permission.VIEW_HOSPITAL_ASSETS,
  ],
  
  [UserRole.BANK_OFFICER]: [
    // Bank-scoped access (no personal patient data)
    Permission.VIEW_OWN_BANK,
    Permission.VIEW_BANK_TRANSACTIONS,
    Permission.APPROVE_TRANSACTIONS,
    Permission.APPROVE_ASSETS,
    Permission.VIEW_BANK_ANALYTICS,
  ],
  
  [UserRole.PATIENT]: [
    // Self-access only
    Permission.VIEW_OWN_PROFILE,
    Permission.VIEW_OWN_ASSETS,
    Permission.VIEW_OWN_TRANSACTIONS,
    Permission.TRADE_TOKENS,
    Permission.VIEW_OWN_ANALYTICS,
  ],
}

export interface AccessControlContext {
  user: AuthUser | null
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  canAccessHospital: (hospitalId: string) => boolean
  canAccessBank: (bankId: string) => boolean
  canAccessPatient: (patientId: string) => boolean
  isLoading: boolean
}
