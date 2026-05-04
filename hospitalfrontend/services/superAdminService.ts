import { authService } from '@/lib/authService'
import { auditLogService } from '@/services/auditLogService'
import { dashboardService, type SuperAdminDashboardSummary } from '@/services/dashboardService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type SuperAdminReportLog = {
  id: string
  reportType: string
  fromPeriod: string
  toPeriod: string
  status: string
  generatedAt: string
  generatedByName: string
}

export type SuperAdminAuditLog = {
  id: string
  timestamp: string
  user: string
  userRole?: string
  action: string
  category: string
  status: string
  details?: string
}

export type SuperAdminDerivedUser = {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  lastSeen: string
}

export type SuperAdminHospitalDetails = {
  hospitalId: string
  hospitalName: string
  registrationNumber: string
  address: string
  email: string
  contactNum: string
  city?: string
  verificationStatus: string
  createdAt?: string
  patientCount: number
  totalDeposits: number
  totalAssets: number
  totalAT: number
  linkedBanks: Array<{
    partnershipId: string
    bankId: string
    bankName: string
    bankVerificationStatus: string
    integrationStatus: string
    linkedAt?: string
    totalDeposits: number
    approvedDeposits: number
    pendingDeposits: number
    totalAssetValuePkr: number
  }>
}

export type SuperAdminBankDetails = {
  bankId: string
  bankName: string
  registration: string
  swiftCode?: string
  bankCode?: string
  address: string
  email: string
  contactNum: string
  city?: string
  verificationStatus: string
  createdAt?: string
  activePartnerships: number
  totalDeposits: number
  totalAssetValuePkr: number
  linkedHospitals: Array<{
    partnershipId: string
    hospitalId: string
    hospitalName: string
    hospitalVerificationStatus: string
    integrationStatus: string
    linkedAt?: string
    totalDeposits: number
    approvedDeposits: number
    pendingDeposits: number
    totalAssetValuePkr: number
  }>
}

export type CreateBankPayload = {
  name: string
  swiftCode?: string
  address: string
  city?: string
  phone: string
  email: string
  registration?: string
  bankCode?: string
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const normalizeStatus = (value?: string): 'active' | 'inactive' => {
  const v = (value || '').toLowerCase()
  if (v === 'success' || v === 'active' || v === 'verified' || v === 'approved') return 'active'
  return 'inactive'
}

const roleLabel = (raw?: string) => {
  const value = (raw || 'unknown').toLowerCase()
  if (value.includes('admin')) return 'SUPER_ADMIN'
  if (value.includes('hospital')) return 'HOSPITAL_ADMIN'
  if (value.includes('bank')) return 'BANK_OFFICER'
  if (value.includes('patient')) return 'PATIENT'
  return value.toUpperCase()
}

const extractEmail = (value: string): string => {
  const trimmed = (value || '').trim()
  if (trimmed.includes('@')) return trimmed.toLowerCase()
  return `${trimmed.toLowerCase().replace(/\s+/g, '.')}@unknown.local`
}

export const superAdminService = {
  async getSummary(): Promise<SuperAdminDashboardSummary> {
    return dashboardService.getSuperAdminSummary()
  },

  async getReportsHistory(): Promise<SuperAdminReportLog[]> {
    const res = await fetch(`${API_BASE}/reports/history`, { headers: getAuthHeaders() })
    if (!res.ok) throw new Error(`Failed to fetch report history (${res.status})`)
    const payload: ApiResponse<SuperAdminReportLog[]> = await res.json()
    return payload.data || []
  },

  async getAuditLogs(): Promise<SuperAdminAuditLog[]> {
    const [patientLogs, hospitalLogs] = await Promise.all([
      auditLogService.getAllPatientAuditLogs(200),
      auditLogService.getHospitalAuditLogs(200),
    ])

    return [...patientLogs, ...hospitalLogs]
      .map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        user: log.user,
        userRole: log.userRole,
        action: log.action,
        category: log.category,
        status: log.status,
        details: log.details,
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },

  async getDerivedUsers(): Promise<SuperAdminDerivedUser[]> {
    const logs = await this.getAuditLogs()
    const byEmail = new Map<string, SuperAdminDerivedUser>()

    logs.forEach((log) => {
      const email = extractEmail(log.user)
      if (!byEmail.has(email)) {
        byEmail.set(email, {
          id: log.id,
          name: log.user,
          email,
          role: roleLabel(log.userRole),
          status: normalizeStatus(log.status),
          lastSeen: log.timestamp,
        })
      }
    })

    return Array.from(byEmail.values())
  },

  async getHospitalDetails(hospitalId: string): Promise<SuperAdminHospitalDetails> {
    const res = await fetch(`${API_BASE}/dashboard/super-admin/hospitals/${hospitalId}`, { headers: getAuthHeaders() })
    if (!res.ok) throw new Error(`Failed to fetch hospital details (${res.status})`)
    const payload: ApiResponse<SuperAdminHospitalDetails> = await res.json()
    return payload.data
  },

  async getBankDetails(bankId: string): Promise<SuperAdminBankDetails> {
    const res = await fetch(`${API_BASE}/dashboard/super-admin/banks/${bankId}`, { headers: getAuthHeaders() })
    if (!res.ok) throw new Error(`Failed to fetch bank details (${res.status})`)
    const payload: ApiResponse<SuperAdminBankDetails> = await res.json()
    return payload.data
  },

  async createBank(payload: CreateBankPayload) {
    const res = await fetch(`${API_BASE}/banks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })
    const bodyText = await res.text()
    const data = bodyText ? JSON.parse(bodyText) : null
    if (!res.ok) {
      throw new Error(data?.message || `Failed to create bank (${res.status})`)
    }
    return data?.data
  },

  async updateBankStatus(bankId: string, status: string) {
    const res = await fetch(`${API_BASE}/banks/${bankId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    })
    const bodyText = await res.text()
    const data = bodyText ? JSON.parse(bodyText) : null
    if (!res.ok) {
      throw new Error(data?.message || `Failed to update bank status (${res.status})`)
    }
    return data?.data
  },

  async updateHospitalStatus(hospitalId: string, status: string) {
    const res = await fetch(`${API_BASE}/hospitals/${hospitalId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    })
    const bodyText = await res.text()
    const data = bodyText ? JSON.parse(bodyText) : null
    if (!res.ok) {
      throw new Error(data?.message || `Failed to update hospital status (${res.status})`)
    }
    return data?.data
  },
}
