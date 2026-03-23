/**
 * Audit Log Types
 * Represents audit trail data for patient and hospital operations
 */

export type AuditAction = 
  | 'Deposited Asset'
  | 'Traded Tokens'
  | 'Viewed Portfolio'
  | 'Login'
  | 'Updated Profile'
  | 'Downloaded Statement'
  | 'Failed Login'
  | 'Redeemed Benefit'
  | 'Transferred Tokens'
  | 'Requested Withdrawal'
  | 'Approved Deposit'
  | 'Updated Settings'
  | 'Minted Tokens'
  | 'Generated Report'
  | 'User Suspended'
  | 'Database Backup'
  | 'Security Alert'
  | 'Bulk Asset Update'
  | 'System Maintenance'
  | 'Compliance Check'
  | 'Staff Permission Change'
  | 'Smart Contract Deployed'

export type AuditCategory = 
  | 'deposit'
  | 'trading'
  | 'view'
  | 'auth'
  | 'profile'
  | 'download'
  | 'benefit'
  | 'transfer'
  | 'withdrawal'
  | 'approval'
  | 'system'
  | 'minting'
  | 'security'
  | 'reporting'
  | 'admin'
  | 'backup'
  | 'warning'
  | 'compliance'

export type AuditStatus = 'success' | 'failure' | 'error' | 'warning' | 'pending'

export type AuditType = 'patient' | 'hospital'

export interface AuditLog {
  id: string
  action: AuditAction
  user: string
  userId?: string
  userRole?: 'patient' | 'hospital_staff' | 'admin' | 'auditor'
  details: string
  ipAddress: string
  timestamp: string
  category: AuditCategory
  status: AuditStatus
  type?: AuditType // patient or hospital
  entity?: string
  entityId?: string
  metadata?: Record<string, unknown>
}

export interface AuditLogResponse {
  id: string
  actId?: string
  action: string
  activityName?: string
  user: string
  userId?: string
  details: string
  description?: string
  ipAddress: string
  ip_address?: string
  timestamp: string
  createdAt?: string
  created_at?: string
  category: string
  status: string
  type?: string
  userRole?: string
  entity?: string
  entityId?: string
  entity_id?: string
  metadata?: Record<string, unknown>
}

export interface PaginatedAuditLogs {
  logs: AuditLog[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}
