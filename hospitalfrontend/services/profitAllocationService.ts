import { authService } from '@/lib/authService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PatientAllocationPreview {
  patientId: string
  userId: string
  patientName: string
  walletAddress: string
  assetContributionPkr: number
  sharePercent: number
  htAmount: number
  pkrValue: number
}

export interface ProfitAllocationPreview {
  availableProfit: number
  totalProfit: number
  patientSharePercent: number
  hospitalSharePercent: number
  bankSharePercent: number
  patientAmountPkr: number
  hospitalAmountPkr: number
  bankAmountPkr: number
  tokenMintPoolPkr: number
  htConversionRate: number
  totalHtToDistribute: number
  totalAssetContributionPkr: number
  totalRecipients: number
  allocations: PatientAllocationPreview[]
}

export interface ProfitAllocationHistoryItem {
  distributionId: string
  timestamp: string
  totalProfit: number
  patientSharePercent: number
  hospitalSharePercent: number
  bankSharePercent: number
  patientAmountPkr: number
  hospitalAmountPkr: number
  bankAmountPkr: number
  totalHtDistributed: number
  recipients: number
}

export interface ExecuteProfitAllocationResponse {
  distributionId: string
  recipients: number
  totalHtDistributed: number
  patientAmountPkr: number
  hospitalAmountPkr: number
  bankAmountPkr: number
  tokenMintPoolPkr: number
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const profitAllocationService = {
  async getPreview(totalProfit: number | null): Promise<ProfitAllocationPreview> {
    const params = new URLSearchParams()
    if (totalProfit !== null && totalProfit > 0) {
      params.set('totalProfit', String(totalProfit))
    }

    const response = await fetch(`${API_BASE}/profit-allocation/preview?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const result: ApiResponse<ProfitAllocationPreview> = await response.json()
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Failed to load allocation preview')
    }
    return result.data
  },

  async distribute(totalProfit: number): Promise<ExecuteProfitAllocationResponse> {
    const response = await fetch(`${API_BASE}/profit-allocation/distribute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ totalProfit }),
    })

    const result: ApiResponse<ExecuteProfitAllocationResponse> = await response.json()
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Failed to distribute profit')
    }
    return result.data
  },

  async getHistory(): Promise<ProfitAllocationHistoryItem[]> {
    const response = await fetch(`${API_BASE}/profit-allocation/history`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const result: ApiResponse<ProfitAllocationHistoryItem[]> = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to load allocation history')
    }

    return result.data || []
  },
}
