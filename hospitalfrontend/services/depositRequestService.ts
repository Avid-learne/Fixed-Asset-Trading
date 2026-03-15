import { authService } from '@/lib/authService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type HospitalOption = {
  hospitalId: string
  hospitalName: string
  city?: string
}

export type AssetDepositRequest = {
  assetType: string
  weight: number
  assetValue: number
}

export type AssetDepositItem = {
  assetId: string
  patientId: string
  patientName: string
  patientEmail: string
  hospitalId: string
  hospitalName: string
  assetType: string
  weight: number
  assetValue: number
  expectedTokens: number
  status: string
  bankApprovalStatus?: string
  submittedAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  bankApprovedAt?: string
  bankRejectedAt?: string
  bankRejectionReason?: string
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  const result: ApiResponse<T> = await response.json()
  if (!response.ok || !result.success) {
    throw new Error(result.message || fallback)
  }
  return result.data
}

export const depositRequestService = {
  async submitRequest(payload: AssetDepositRequest): Promise<AssetDepositItem> {
    const response = await fetch(`${API_BASE}/asset-deposits/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })
    return parseResponse<AssetDepositItem>(response, 'Failed to submit deposit request')
  },

  async getHospitalRequests(status: string = 'all'): Promise<AssetDepositItem[]> {
    const params = new URLSearchParams({ status })
    const response = await fetch(`${API_BASE}/asset-deposits/hospital/requests?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return parseResponse<AssetDepositItem[]>(response, 'Failed to load hospital requests')
  },

  async getBankRequests(bankStatus: string = 'pending'): Promise<AssetDepositItem[]> {
    const params = new URLSearchParams({ bankStatus })
    const response = await fetch(`${API_BASE}/asset-deposits/bank/requests?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return parseResponse<AssetDepositItem[]>(response, 'Failed to load bank requests')
  },

  async getMyRequests(status: string = 'all'): Promise<AssetDepositItem[]> {
    const params = new URLSearchParams({ status })
    const response = await fetch(`${API_BASE}/asset-deposits/mine?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return parseResponse<AssetDepositItem[]>(response, 'Failed to load your deposit requests')
  },

  async approve(assetId: string): Promise<AssetDepositItem> {
    const response = await fetch(`${API_BASE}/asset-deposits/${assetId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    return parseResponse<AssetDepositItem>(response, 'Failed to approve deposit request')
  },

  async reject(assetId: string, reason: string): Promise<AssetDepositItem> {
    const response = await fetch(`${API_BASE}/asset-deposits/${assetId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    })
    return parseResponse<AssetDepositItem>(response, 'Failed to reject deposit request')
  },

  async approveByBank(assetId: string): Promise<AssetDepositItem> {
    const response = await fetch(`${API_BASE}/asset-deposits/${assetId}/bank-approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    return parseResponse<AssetDepositItem>(response, 'Failed to approve request by bank')
  },

  async rejectByBank(assetId: string, reason: string): Promise<AssetDepositItem> {
    const response = await fetch(`${API_BASE}/asset-deposits/${assetId}/bank-reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    })
    return parseResponse<AssetDepositItem>(response, 'Failed to reject request by bank')
  },
}
