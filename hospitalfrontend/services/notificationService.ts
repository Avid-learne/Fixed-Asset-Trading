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
  direction?: 'sent' | 'received'
  senderName?: string
}

export type SendNotificationPayload = {
  title: string
  message: string
  targetType: 'ALL_USERS' | 'ROLE' | 'HOSPITAL' | 'BANK_HOSPITALS' | 'USER'
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

const mapRow = (row: any): PortalNotification => ({
  id: row.id,
  title: row.title || 'Notification',
  message: row.body || '',
  status: row.status || 'UNREAD',
  timestamp: row.timestamp,
  direction: (row.direction as 'sent' | 'received') || 'received',
  senderName: row.senderName || 'System',
})

export const notificationService = {
  // ─── READ ─────────────────────────────────────────

  async getUserNotifications(userId: string): Promise<PortalNotification[]> {
    const res = await fetch(`${API_BASE}/notifications/user/${userId}`, { headers: getAuthHeaders() })
    if (!res.ok) throw new Error('Failed to fetch notifications')
    const result: ApiResponse<any[]> = await res.json()
    return (result.data || []).map(mapRow)
  },

  async getSentNotifications(userId: string): Promise<PortalNotification[]> {
    const res = await fetch(`${API_BASE}/notifications/user/${userId}/sent`, { headers: getAuthHeaders() })
    if (!res.ok) throw new Error('Failed to fetch sent notifications')
    const result: ApiResponse<any[]> = await res.json()
    return (result.data || []).map((row) => ({ ...mapRow(row), direction: 'sent' as const }))
  },

  async getUnreadCount(userId: string): Promise<number> {
    const res = await fetch(`${API_BASE}/notifications/user/${userId}/unread-count`, { headers: getAuthHeaders() })
    if (!res.ok) throw new Error('Failed to fetch unread count')
    const result: ApiResponse<{ unreadCount: number }> = await res.json()
    return Number(result.data?.unreadCount || 0)
  },

  // ─── MARK READ ────────────────────────────────────

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/notifications/user/${userId}/${notificationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to mark notification as read')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications:changed'))
    }
  },

  async markAllAsRead(userId: string): Promise<number> {
    const res = await fetch(`${API_BASE}/notifications/user/${userId}/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to mark notifications as read')
    const result: ApiResponse<{ updated: number }> = await res.json()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications:changed'))
    }
    return Number(result.data?.updated || 0)
  },

  // ─── DELETE ───────────────────────────────────────

  async deleteReceived(userId: string, notificationId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/notifications/user/${userId}/${notificationId}/received`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to delete notification')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications:changed'))
    }
  },

  async deleteSent(userId: string, notificationId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/notifications/user/${userId}/${notificationId}/sent`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to delete notification')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications:changed'))
    }
  },

  async deleteSelectedReceived(userId: string, notificationIds: string[]): Promise<number> {
    const res = await fetch(`${API_BASE}/notifications/user/${userId}/delete-selected/received`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notificationIds }),
    })
    if (!res.ok) throw new Error('Failed to delete selected notifications')
    const result: ApiResponse<{ deleted: number }> = await res.json()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications:changed'))
    }
    return Number(result.data?.deleted || 0)
  },

  async deleteSelectedSent(userId: string, notificationIds: string[]): Promise<number> {
    const res = await fetch(`${API_BASE}/notifications/user/${userId}/delete-selected/sent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notificationIds }),
    })
    if (!res.ok) throw new Error('Failed to delete selected notifications')
    const result: ApiResponse<{ deleted: number }> = await res.json()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications:changed'))
    }
    return Number(result.data?.deleted || 0)
  },

  async deleteAllReceived(userId: string): Promise<number> {
    const res = await fetch(`${API_BASE}/notifications/user/${userId}/received`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to delete notifications')
    const result: ApiResponse<{ deleted: number }> = await res.json()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications:changed'))
    }
    return Number(result.data?.deleted || 0)
  },

  async deleteAllSent(userId: string): Promise<number> {
    const res = await fetch(`${API_BASE}/notifications/user/${userId}/sent`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to delete notifications')
    const result: ApiResponse<{ deleted: number }> = await res.json()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications:changed'))
    }
    return Number(result.data?.deleted || 0)
  },

  // ─── SEND ────────────────────────────────────────

  async send(payload: SendNotificationPayload): Promise<number> {
    const normalizedPayload = {
      ...payload,
      targetRole: payload.targetRole ? normalizeRoleForBackend(payload.targetRole) : undefined,
    }

    const res = await fetch(`${API_BASE}/notifications/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(normalizedPayload),
    })

    const result: ApiResponse<{ totalSent: number }> = await res.json()
    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Failed to send notification')
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications:changed'))
    }

    return Number(result.data?.totalSent || 0)
  },
}
