import { authService } from '@/lib/authService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export interface ProfitSettings {
  patientProfitPercent: number
  hospitalProfitPercent: number
  bankProfitPercent: number
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  const result = await response.json()
  if (!response.ok || !result.success) {
    throw new Error(result.message || fallback)
  }
  return result.data
}

export const hospitalSettingsService = {
  async getProfitSettings(): Promise<ProfitSettings> {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/hospital/profit-settings`, {
      method: 'GET',
      headers,
    })
    return parseResponse<ProfitSettings>(response, 'Failed to fetch profit settings')
  },

  async updateProfitSettings(settings: ProfitSettings): Promise<ProfitSettings> {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/hospital/profit-settings`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(settings),
    })
    return parseResponse<ProfitSettings>(response, 'Failed to update profit settings')
  },
}
