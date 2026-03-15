import { authService } from '@/lib/authService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface HospitalStaffActivityItem {
  activityId: string | null
  activityName: string | null
  description: string | null
  type: string | null
  status: string | null
  ipAddress: string | null
  timestamp: string | null
}

export interface HospitalStaffSettings {
  userId: string
  staffName: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  bloodGroup: string | null
  dateOfBirth: string | null
  role: string | null
  userStatus: string | null
  hospitalId: string | null
  hospitalName: string | null
  mfaEnabled: boolean
  notificationEnabled: boolean
  emailVerified: boolean
  recentActivity: HospitalStaffActivityItem[]
}

export interface UpdateHospitalStaffSettingsRequest {
  staffName: string
  phone: string
  address: string
  city: string
  bloodGroup: string
  dateOfBirth: string
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

export const hospitalStaffSettingsService = {
  async getSettings(): Promise<HospitalStaffSettings> {
    const response = await fetch(`${API_BASE}/hospital-staff/settings`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const result: ApiResponse<HospitalStaffSettings> = await response.json()

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Failed to load settings')
    }

    return result.data
  },

  async updateSettings(payload: UpdateHospitalStaffSettingsRequest): Promise<HospitalStaffSettings> {
    const response = await fetch(`${API_BASE}/hospital-staff/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    const result: ApiResponse<HospitalStaffSettings> = await response.json()

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Failed to update settings')
    }

    return result.data
  },
}
