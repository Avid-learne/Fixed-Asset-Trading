import { authService } from '@/lib/authService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type PortalNotification = {
  id: string
  title: string
  message: string
  status: 'READ' | 'UNREAD'
  timestamp: string
}

export type SendNotificationPayload = {
  title: string
  message: string
  targetType: 'ALL_USERS' | 'ROLE' | 'HOSPITAL' | 'USER'
  targetRole?: string
  hospitalId?: string
  receiverUserId?: string
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const normalizeRoleForBackend = (role?: string): string => {
  const value = (role || '').trim().toLowerCase()
  if (!value) return 'patient'

  if (value === 'hospitaladmin' || value === 'hospital_admin') return 'hospital_admin'
  if (value === 'hospital_staff' || value === 'hospitalstaff') return 'hospital_staff'
  if (value === 'bank_officer' || value === 'bank_staff' || value === 'bankofficer') return 'bank_staff'
  if (value === 'super_admin' || value === 'admin') return 'admin'
  if (value === 'patient') return 'patient'

  return value
}

export const notificationService = {
  async getUserNotifications(userId: string): Promise<PortalNotification[]> {
    const response = await fetch(`${API_BASE}/activity/user/${userId}/notifications`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch notifications')
    }

    const result: ApiResponse<Array<{ id: string; title: string; body: string; status: 'READ' | 'UNREAD'; timestamp: string }>> = await response.json()
    return (result.data || []).map((row) => ({
      id: row.id,
      title: row.title || 'Notification',
      message: row.body || '',
      status: row.status || 'UNREAD',
      timestamp: row.timestamp,
    }))
  },

  async getUnreadCount(userId: string): Promise<number> {
    const response = await fetch(`${API_BASE}/activity/user/${userId}/notifications/unread-count`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch unread count')
    }

    const result: ApiResponse<{ unreadCount: number }> = await response.json()
    return Number(result.data?.unreadCount || 0)
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/activity/user/${userId}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to mark notification as read')
    }
  },

  async markAllAsRead(userId: string): Promise<number> {
    const response = await fetch(`${API_BASE}/activity/user/${userId}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to mark notifications as read')
    }

    const result: ApiResponse<{ updated: number }> = await response.json()
    return Number(result.data?.updated || 0)
  },

  async send(payload: SendNotificationPayload): Promise<number> {
    const normalizedPayload = {
      ...payload,
      targetRole: payload.targetRole ? normalizeRoleForBackend(payload.targetRole) : undefined,
    }

    const response = await fetch(`${API_BASE}/activity/notifications/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(normalizedPayload),
    })

    const result: ApiResponse<{ totalSent: number }> = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to send notification')
    }

    return Number(result.data?.totalSent || 0)
  },
}
