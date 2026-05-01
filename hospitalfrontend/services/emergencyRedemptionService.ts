import { authService } from '@/lib/authService'

const API_URL = 'http://localhost:8000/api/emergency-redemptions'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type EmergencyRedemptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type EmergencyUrgencyLevel = 'ROUTINE' | 'MODERATE' | 'CRITICAL'

export type EmergencyRedemptionDto = {
  requestId: string
  patientId: string
  patientUserId: string
  hospitalId: string
  status: EmergencyRedemptionStatus

  requestedAtAmount: number
  patientReason?: string
  supportingDocuments?: string
  tradeoffAcknowledged: boolean

  reviewedBy?: string
  reviewedAt?: string
  urgencyLevel?: EmergencyUrgencyLevel

  approvedAtAmount?: number
  conversionRate?: number
  htIssued?: number
  staffJustification?: string
  rejectionReason?: string

  createdAt?: string
  updatedAt?: string
}

export type CreateEmergencyRedemptionRequest = {
  requestedAtAmount: number
  patientReason?: string
  supportingDocuments?: string
  tradeoffAcknowledged: boolean
}

export type ApproveEmergencyRedemptionRequest = {
  urgencyLevel: EmergencyUrgencyLevel
  atToConvert: number
  conversionRate: number
  staffJustification?: string
}

export type RejectEmergencyRedemptionRequest = {
  rejectionReason: string
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  const hasToken = !!token
  console.log('[emergencyRedemptionService] Auth headers - token present:', hasToken)
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const safeParseJson = async (res: Response): Promise<any> => {
  if (!res.ok && res.status === 204) {
    return null
  }
  
  const text = await res.text()
  if (!text) {
    // Better error message for empty responses
    if (res.status === 403) {
      const token = authService.getToken()
      throw new Error(
        `Authentication failed (403 Forbidden). ${
          !token 
            ? 'No JWT token found - please log in first.' 
            : 'Token may be invalid or expired - please log in again.'
        }`
      )
    }
    if (res.status === 401) {
      throw new Error('Unauthorized (401) - Invalid or missing authentication token. Please log in.')
    }
    throw new Error(`Empty response from server (${res.status})`)
  }
  
  try {
    return JSON.parse(text)
  } catch (e) {
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`)
  }
}

const mapDto = (d: EmergencyRedemptionDto): EmergencyRedemptionDto => ({
  ...d,
  requestedAtAmount: Number(d.requestedAtAmount || 0),
  approvedAtAmount: d.approvedAtAmount != null ? Number(d.approvedAtAmount) : undefined,
  conversionRate: d.conversionRate != null ? Number(d.conversionRate) : undefined,
  htIssued: d.htIssued != null ? Number(d.htIssued) : undefined,
})

export const emergencyRedemptionService = {
  async submit(payload: CreateEmergencyRedemptionRequest): Promise<EmergencyRedemptionDto> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    const json: ApiResponse<EmergencyRedemptionDto> = await safeParseJson(res)
    if (!res.ok || !json.success) {
      throw new Error(json.message || `Submit failed (${res.status})`)
    }
    return mapDto(json.data)
  },

  async listForPatient(patientUserId: string): Promise<EmergencyRedemptionDto[]> {
    const res = await fetch(`${API_URL}/patient/${patientUserId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const json: ApiResponse<EmergencyRedemptionDto[]> = await safeParseJson(res)
    if (!res.ok || !json.success) {
      throw new Error(json.message || `Fetch failed (${res.status})`)
    }
    return (json.data || []).map(mapDto)
  },

  async listPendingForHospital(): Promise<EmergencyRedemptionDto[]> {
    const res = await fetch(`${API_URL}/hospital/pending`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const json: ApiResponse<EmergencyRedemptionDto[]> = await safeParseJson(res)
    if (!res.ok || !json.success) {
      throw new Error(json.message || `Fetch failed (${res.status})`)
    }
    return (json.data || []).map(mapDto)
  },

  async approve(requestId: string, payload: ApproveEmergencyRedemptionRequest): Promise<EmergencyRedemptionDto> {
    const res = await fetch(`${API_URL}/${requestId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    const json: ApiResponse<EmergencyRedemptionDto> = await safeParseJson(res)
    if (!res.ok || !json.success) {
      throw new Error(json.message || `Approve failed (${res.status})`)
    }
    return mapDto(json.data)
  },

  async reject(requestId: string, payload: RejectEmergencyRedemptionRequest): Promise<EmergencyRedemptionDto> {
    const res = await fetch(`${API_URL}/${requestId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    const json: ApiResponse<EmergencyRedemptionDto> = await safeParseJson(res)
    if (!res.ok || !json.success) {
      throw new Error(json.message || `Reject failed (${res.status})`)
    }
    return mapDto(json.data)
  },
}
