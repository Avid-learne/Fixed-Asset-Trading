import { authService } from '@/lib/authService'

const API_URL = 'http://localhost:8000/api/wallet'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type WalletSummary = {
  userId: string
  patientId: string
  walletAddress?: string
  totalAt: number
  totalHt: number
}

export type WalletTransaction = {
  transactionId: string
  tokenSymbol: 'AT' | 'HT'
  transactionType: 'DEBIT' | 'CREDIT'
  amount: number
  description?: string
  senderWalletAddress?: string
  receiverWalletAddress?: string
  blockNumber?: number
  transactionHash?: string
  status?: string
  timestamp: string
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const mapTransaction = (row: WalletTransaction): WalletTransaction => ({
  ...row,
  amount: Number(row.amount || 0),
})

export const walletService = {
  async getSummary(userId: string): Promise<WalletSummary> {
    const res = await fetch(`${API_URL}/patient/${userId}/summary`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch wallet summary (${res.status})`)
    }

    const payload: ApiResponse<WalletSummary> = await res.json()
    return {
      ...payload.data,
      totalAt: Number(payload.data?.totalAt || 0),
      totalHt: Number(payload.data?.totalHt || 0),
    }
  },

  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    const res = await fetch(`${API_URL}/patient/${userId}/transactions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch wallet transactions (${res.status})`)
    }

    const payload: ApiResponse<WalletTransaction[]> = await res.json()
    return (payload.data || []).map(mapTransaction)
  },

  async getTokenTransactions(userId: string, tokenSymbol: 'AT' | 'HT'): Promise<WalletTransaction[]> {
    const res = await fetch(`${API_URL}/patient/${userId}/transactions/${tokenSymbol}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch ${tokenSymbol} transactions (${res.status})`)
    }

    const payload: ApiResponse<WalletTransaction[]> = await res.json()
    return (payload.data || []).map(mapTransaction)
  },

  async transferHT(recipientWalletAddress: string, amount: number, note?: string): Promise<void> {
    const res = await fetch(`${API_URL}/patient/transfer/ht`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ recipientWalletAddress, amount, note }),
    })

    const payload = await res.json().catch(() => ({} as ApiResponse<unknown>))
    if (!res.ok) {
      throw new Error((payload as ApiResponse<unknown>)?.message || `HT transfer failed (${res.status})`)
    }
  },
}
