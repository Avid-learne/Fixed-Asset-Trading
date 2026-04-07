import { authService } from '@/lib/authService'

const API_URL = 'http://localhost:8000/api/dashboard'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type PatientDashboardSummary = {
  htBalance: number
  pendingDeposits: number
  approvedDeposits: number
  healthCardCount: number
  hasSubscription: boolean
  recentHtTransactions: Array<{
    transactionId: string
    tokenSymbol: 'HT'
    transactionType: 'DEBIT' | 'CREDIT'
    amount: number
    description?: string
    timestamp: string
  }>
}

export type BankDashboardSummary = {
  bankName: string
  totalDeposits: number
  pendingReviews: number
  approvedReviews: number
  rejectedReviews: number
  totalAssetValue: number
  activePartnerships: number
}

export type HospitalDashboardSummary = {
  hospitalName: string
  totalPatients: number
  pendingDeposits: number
  approvedDeposits: number
  activeSubscriptions: number
  totalProfitDistributed: number
  totalAtMinted: number
  totalHtAllocated: number
  totalAssetValue: number
  tradingVolume: number
  totalTrades: number
  activeTrades: number
  goldPricePerGram: number
  silverPricePerGram: number
  assetDistribution: Array<{ assetType: string; count: number; totalValue: number }>
  mintingHistory: Array<{ month: string; minted: number }>
  allocationHistory: Array<{ month: string; allocated: number }>
}

export type SuperAdminDashboardSummary = {
  totalHospitals: number
  activeHospitals: number
  pendingHospitals: number
  totalBanks: number
  activeBanks: number
  totalPatients: number
  activePatients: number
  totalATMinted: number
  totalHTIssued: number
  totalRevenue: number
  totalTransactionVolume: number
  systemUptime: number
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: getAuthHeaders() })
  const payload: ApiResponse<T> = await res.json()
  if (!res.ok) throw new Error(payload?.message || `Request failed (${res.status})`)
  return payload.data
}

export const dashboardService = {
  getPatientSummary: () => getJson<PatientDashboardSummary>('/patient'),
  getBankSummary: () => getJson<BankDashboardSummary>('/bank'),
  getHospitalSummary: () => getJson<HospitalDashboardSummary>('/hospital'),
  getSuperAdminSummary: () => getJson<SuperAdminDashboardSummary>('/super-admin'),
}
