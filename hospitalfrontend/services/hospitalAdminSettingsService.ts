import { authService } from '@/lib/authService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface HospitalAdminSettings {
  hospitalId: string
  hospitalName: string
  hospitalCode: string
  registrationNum: string
  contactEmail: string
  contactPhone: string
  address: string
  city: string
  verificationStatus: string

  totalAssets: number
  totalAT: number
  totalPatients: number

  adminName: string
  adminEmail: string
  adminPhone: string

  mfaEnabled: boolean
  notificationEnabled: boolean
  emailVerified: boolean
}

export interface UpdateHospitalAdminSettingsRequest {
  hospitalName: string
  hospitalCode: string
  contactEmail: string
  contactPhone: string
  address: string
  city: string
  adminName: string
  adminPhone: string
  mfaEnabled: boolean
  notificationEnabled: boolean
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const hospitalAdminSettingsService = {
  async getSettings(): Promise<HospitalAdminSettings> {
    const response = await fetch(`${API_BASE}/hospital-admin/settings`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const result: ApiResponse<HospitalAdminSettings> = await response.json()

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Failed to load settings')
    }

    return result.data
  },

  async updateSettings(payload: UpdateHospitalAdminSettingsRequest): Promise<HospitalAdminSettings> {
    const response = await fetch(`${API_BASE}/hospital-admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    const result: ApiResponse<HospitalAdminSettings> = await response.json()

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Failed to update settings')
    }

    return result.data
  },
}
