import { authService } from '@/lib/authService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export type DistributionStatus = 'distributed' | 'pending'

export interface PatientShareDistributionRow {
  distributionId: string
  tradeId: string
  participationId: string

  patientId: string
  patientRegistrationId: string | null
  patientName: string
  patientCnic: string | null

  atAllocated: number | null
  atAllocatedAt: string | null

  htAmount: number
  distributionMonth: string

  isDistributed: boolean
  htDistributedAt: string | null

  createdAt: string | null
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const profitDistributionService = {
  async getHospitalPatientShareDistributions(): Promise<PatientShareDistributionRow[]> {
    const response = await fetch(
      `${API_BASE}/marketplace/at-trading/hospital/patient-share-distributions`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    )

    const result: ApiResponse<PatientShareDistributionRow[]> = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to load profit distributions')
    }

    return result.data || []
  },
}
