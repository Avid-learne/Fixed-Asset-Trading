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
  tradeId?: string
  tradeName?: string
  hospitalAtCredited?: number
  bankAtCredited?: number
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

export interface AllocationKpis {
  availableProfitPkr: number
  availableProfitAt: number
  hospitalProfitAt: number
  hospitalProfitPkr: number
  bankProfitAt: number
  bankProfitPkr: number
  totalHtMintedToPatients: number
  distributionsCount: number
  profitableTradesCount: number
  undistributedTradesCount: number
}

export interface ProfitableTrade {
  tradeId: string
  tradeName: string
  assetType: string
  tradeDate?: string
  closedAt?: string
  profitPkr: number
  profitAt: number
  distributed: boolean
  distributedAt?: string
  distributionId?: string
}

export type TradeDistributionRowKind = 'PATIENT' | 'HOSPITAL' | 'BANK'

export interface TradeDistributionRow {
  kind: TradeDistributionRowKind
  patientId?: string
  assetId?: string
  name?: string
  sharePercent: number
  atAmount: number
  pkrAmount: number
  /** Patient rows only — HT minted in exchange for the burned AT. */
  htAmount?: number
}

export interface TradeDistributionPreview {
  tradeId: string
  tradeName: string
  assetType: string
  totalProfitPkr: number
  totalProfitAt: number
  patientSharePercent: number
  hospitalSharePercent: number
  bankSharePercent: number
  patientPoolAt: number
  hospitalPoolAt: number
  bankPoolAt: number
  htConversionRate: number
  atPrice: number
  alreadyDistributed: boolean
  rows: TradeDistributionRow[]
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

  async getKpis(): Promise<AllocationKpis> {
    const response = await fetch(`${API_BASE}/profit-allocation/kpis`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    const result: ApiResponse<AllocationKpis> = await response.json()
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Failed to load KPIs')
    }
    return result.data
  },

  async getProfitableTrades(): Promise<ProfitableTrade[]> {
    const response = await fetch(`${API_BASE}/profit-allocation/profitable-trades`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    const result: ApiResponse<ProfitableTrade[]> = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to load profitable trades')
    }
    return result.data || []
  },

  async getTradePreview(tradeId: string): Promise<TradeDistributionPreview> {
    const response = await fetch(`${API_BASE}/profit-allocation/trade/${tradeId}/preview`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    const result: ApiResponse<TradeDistributionPreview> = await response.json()
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Failed to load trade distribution preview')
    }
    return result.data
  },

  async distributeTrade(tradeId: string): Promise<ExecuteProfitAllocationResponse> {
    const response = await fetch(`${API_BASE}/profit-allocation/trade/${tradeId}/distribute`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    const result: ApiResponse<ExecuteProfitAllocationResponse> = await response.json()
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Failed to distribute trade profit')
    }
    return result.data
  },
}
