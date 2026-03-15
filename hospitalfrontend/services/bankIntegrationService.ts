import { authService } from '@/lib/authService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type HospitalBankIntegration = {
  partnershipId: string
  bankId: string
  bankName: string
  bankEmail: string
  bankCity?: string
  bankContact?: string
  bankVerificationStatus: string
  integrationStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
  partnershipStarted: string
  linkedAt: string
  totalDeposits: number
  approvedDeposits: number
  pendingDeposits: number
  totalAssetValuePkr: number
}

export type BankHospitalIntegration = {
  partnershipId: string
  hospitalId: string
  hospitalName: string
  hospitalEmail: string
  hospitalCity?: string
  hospitalContact?: string
  hospitalVerificationStatus: string
  integrationStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
  partnershipStarted: string
  linkedAt: string
  totalDeposits: number
  approvedDeposits: number
  pendingDeposits: number
  totalAssetValuePkr: number
}

export type BankOption = {
  bankId: string
  bankName: string
  city?: string
  email: string
  verificationStatus: string
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

export const bankIntegrationService = {
  async getHospitalIntegrations(): Promise<HospitalBankIntegration[]> {
    const response = await fetch(`${API_BASE}/bank-integrations/hospital`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return parseResponse<HospitalBankIntegration[]>(response, 'Failed to load hospital bank integrations')
  },

  async getAvailableBanks(): Promise<BankOption[]> {
    const response = await fetch(`${API_BASE}/bank-integrations/hospital/available-banks`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return parseResponse<BankOption[]>(response, 'Failed to load available banks')
  },

  async linkBank(bankId: string): Promise<HospitalBankIntegration> {
    const response = await fetch(`${API_BASE}/bank-integrations/hospital`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bankId }),
    })
    return parseResponse<HospitalBankIntegration>(response, 'Failed to link bank')
  },

  async getBankIntegrations(): Promise<BankHospitalIntegration[]> {
    const response = await fetch(`${API_BASE}/bank-integrations/bank`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return parseResponse<BankHospitalIntegration[]>(response, 'Failed to load bank hospital integrations')
  },

  async unlinkBankIntegration(partnershipId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/bank-integrations/bank/${partnershipId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    await parseResponse<unknown>(response, 'Failed to remove hospital integration')
  },

  async approveIntegration(partnershipId: string): Promise<BankHospitalIntegration> {
    const response = await fetch(`${API_BASE}/bank-integrations/bank/${partnershipId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    return parseResponse<BankHospitalIntegration>(response, 'Failed to approve integration request')
  },

  async rejectIntegration(partnershipId: string, reason: string): Promise<BankHospitalIntegration> {
    const response = await fetch(`${API_BASE}/bank-integrations/bank/${partnershipId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    })
    return parseResponse<BankHospitalIntegration>(response, 'Failed to reject integration request')
  },
}
