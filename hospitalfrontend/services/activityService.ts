import { authService } from '@/lib/authService'
import type { ActivityLogItem, NotificationItem, Tx } from '@/types/activity'

const API_URL = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) 
  ? `${process.env.NEXT_PUBLIC_API_URL}/activity`.replace('/api/api', '/api')
  : 'http://localhost:8080/api/activity'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

type ActivityTransactionResponse = {
  id: string
  tokenType: 'AT' | 'HT'
  createdAt: string
  status: string
  amount: number
  transactionHash?: string
  fromAddress?: string
  toAddress?: string
  toName?: string
  source?: string
  transactionType?: 'DEBIT' | 'CREDIT' | 'AT_BURN' | 'HT_MINT'
  blockNumber?: number
}

type ActivityNotificationResponse = {
  id: string
  title: string
  body: string
  status: 'READ' | 'UNREAD'
  timestamp: string
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const toRelativeTime = (isoDate: string) => {
  const now = new Date().getTime()
  const ts = new Date(isoDate).getTime()
  const diffMs = Math.max(0, now - ts)
  const mins = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 60) return `${Math.max(mins, 1)} min ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  return `${days} day${days === 1 ? '' : 's'} ago`
}

const mapTransactionViewType = (transactionType?: string): 'ISSUED' | 'REDEEMED' => {
  if (!transactionType) return 'REDEEMED'

  const type = transactionType.toUpperCase()
  if (type === 'CREDIT' || type === 'HT_MINT') {
    return 'ISSUED'
  }

  return 'REDEEMED'
}

export const activityService = {
  async getTransactions(userId: string): Promise<Tx[]> {
    const res = await fetch(`${API_URL}/patient/${userId}/transactions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch transactions (${res.status})`)
    }

    const payload: ApiResponse<ActivityTransactionResponse[]> = await res.json()
    const rows = payload.data || []

    return rows.map((row) => ({
      id: row.id,
      token_type: row.tokenType,
      created_at: row.createdAt,
      status: (row.status?.toLowerCase() as 'success' | 'pending' | 'failed') || 'pending',
      amount: Number(row.amount || 0),
      transaction_hash: row.transactionHash,
      from_address: row.fromAddress,
      to_address: row.toAddress,
      to_name: row.toName,
      source: row.source,
      type: mapTransactionViewType(row.transactionType),
      block_number: row.blockNumber,
    }))
  },

  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const baseUrl = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
      : 'http://localhost:8080'

    const res = await fetch(`${baseUrl}/api/notifications/user/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch notifications (${res.status})`)
    }

    const payload: ApiResponse<ActivityNotificationResponse[]> = await res.json()
    const rows = payload.data || []

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      date: row.timestamp,
      type: row.status === 'UNREAD' ? 'info' : 'success',
      relativeTime: toRelativeTime(row.timestamp),
    }))
  },

  async getActivityLogs(userId: string): Promise<ActivityLogItem[]> {
    const res = await fetch(`${API_URL}/patient/${userId}/logs`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch activity logs (${res.status})`)
    }

    const payload: ApiResponse<ActivityLogItem[]> = await res.json()
    return payload.data || []
  },
}
