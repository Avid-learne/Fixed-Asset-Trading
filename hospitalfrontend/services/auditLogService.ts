import { authService } from '@/lib/authService'
import type { AuditLog, AuditLogResponse, AuditAction, AuditCategory } from '@/types/auditLog'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const API_URL = `${API_BASE_URL}/activity`

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const mapActivityLogToAuditLog = (activity: AuditLogResponse, type: 'patient' | 'hospital' = 'patient'): AuditLog => {
  const actionStr = activity.activityName || activity.action || 'Viewed Portfolio'
  const categoryStr = activity.type?.toLowerCase() || 'view'
  const userRoleStr = (activity.userRole && ['patient', 'hospital_staff', 'admin', 'auditor'].includes(activity.userRole) ? activity.userRole : (type === 'hospital' ? 'hospital_staff' : 'patient')) as 'patient' | 'hospital_staff' | 'admin' | 'auditor'

  return {
    id: activity.id || activity.actId || '',
    action: actionStr as AuditAction,
    user: activity.user || activity.userId || 'Unknown User',
    userId: activity.userId,
    details: activity.description || activity.details || '',
    ipAddress: activity.ipAddress || activity.ip_address || 'N/A',
    timestamp: activity.timestamp || activity.createdAt || activity.created_at || new Date().toISOString(),
    category: categoryStr as AuditCategory,
    status: (activity.status?.toLowerCase() as 'success' | 'failure' | 'error' | 'warning' | 'pending') || 'pending',
    type,
    userRole: userRoleStr,
    entity: activity.entity,
    entityId: activity.entityId,
    metadata: activity.metadata,
  }
}

const formatTimestamp = (isoDate: string): string => {
  try {
    const date = new Date(isoDate)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  } catch {
    return '...'
  }
}

export const auditLogService = {
  /**
   * Fetch patient audit logs (activities)
   */
  async getPatientAuditLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    try {
      const response = await fetch(`${API_URL}/patient/${userId}/logs?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        console.warn(`Failed to fetch patient audit logs: ${response.status}`)
        return []
      }

      const payload: ApiResponse<AuditLogResponse[]> = await response.json()
      const logs = payload.data || []

      return logs.map((log) => {
        const auditLog = mapActivityLogToAuditLog(log, 'patient')
        auditLog.timestamp = formatTimestamp(log.timestamp || log.createdAt || log.created_at || '')
        return auditLog
      })
    } catch (error) {
      console.error('Error fetching patient audit logs:', error)
      return []
    }
  },

  /**
   * Fetch all patient audit logs for hospital view (multiple users)
   */
  async getAllPatientAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    try {
      const response = await fetch(`${API_URL}/audit/patient-logs?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        console.warn(`Failed to fetch all patient audit logs: ${response.status}`)
        return []
      }

      const payload: ApiResponse<AuditLogResponse[]> = await response.json()
      const logs = payload.data || []

      return logs
        .sort((a, b) => {
          const dateA = new Date(a.timestamp || a.createdAt || a.created_at || 0)
          const dateB = new Date(b.timestamp || b.createdAt || b.created_at || 0)
          return dateB.getTime() - dateA.getTime()
        })
        .map((log) => {
          const auditLog = mapActivityLogToAuditLog(log, 'patient')
          auditLog.timestamp = formatTimestamp(log.timestamp || log.createdAt || log.created_at || '')
          auditLog.id = log.id || `PAT-${logs.indexOf(log) + 1}`
          return auditLog
        })
    } catch (error) {
      console.error('Error fetching all patient audit logs:', error)
      return []
    }
  },

  /**
   * Fetch hospital/admin audit logs
   */
  async getHospitalAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    try {
      const response = await fetch(`${API_URL}/audit/hospital-logs?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        console.warn(`Failed to fetch hospital audit logs: ${response.status}`)
        return []
      }

      const payload: ApiResponse<AuditLogResponse[]> = await response.json()
      const logs = payload.data || []

      return logs
        .sort((a, b) => {
          const dateA = new Date(a.timestamp || a.createdAt || a.created_at || 0)
          const dateB = new Date(b.timestamp || b.createdAt || b.created_at || 0)
          return dateB.getTime() - dateA.getTime()
        })
        .map((log, index) => {
          const auditLog = mapActivityLogToAuditLog(log, 'hospital')
          auditLog.timestamp = formatTimestamp(log.timestamp || log.createdAt || log.created_at || '')
          auditLog.id = log.id || `HSP-${index + 1}`
          return auditLog
        })
    } catch (error) {
      console.error('Error fetching hospital audit logs:', error)
      return []
    }
  },

  /**
   * Search audit logs
   */
  async searchAuditLogs(
    type: 'patient' | 'hospital',
    searchTerm: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    try {
      const logs = type === 'patient' 
        ? await this.getAllPatientAuditLogs(limit)
        : await this.getHospitalAuditLogs(limit)

      const term = searchTerm.toLowerCase()
      return logs.filter(
        (log) =>
          log.id.toLowerCase().includes(term) ||
          log.action.toLowerCase().includes(term) ||
          log.user.toLowerCase().includes(term) ||
          log.details.toLowerCase().includes(term)
      )
    } catch (error) {
      console.error('Error searching audit logs:', error)
      return []
    }
  },

  /**
   * Filter audit logs by status
   */
  filterByStatus(logs: AuditLog[], status: 'success' | 'failure' | 'error' | 'warning' | 'pending' | 'all' = 'all'): AuditLog[] {
    if (status === 'all') return logs
    return logs.filter((log) => log.status === status)
  },

  /**
   * Filter audit logs by category
   */
  filterByCategory(logs: AuditLog[], category: string): AuditLog[] {
    return logs.filter((log) => log.category === category)
  },

  /**
   * Get statistics for audit logs
   */
  getStatistics(logs: AuditLog[]) {
    return {
      total: logs.length,
      successful: logs.filter((log) => log.status === 'success').length,
      failed: logs.filter((log) => log.status === 'failure' || log.status === 'error').length,
      pending: logs.filter((log) => log.status === 'pending').length,
      warnings: logs.filter((log) => log.status === 'warning').length,
      successRate: logs.length > 0 
        ? Math.round((logs.filter((log) => log.status === 'success').length / logs.length) * 100)
        : 0,
    }
  },
}
