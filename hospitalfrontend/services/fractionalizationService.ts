import { authService } from '@/lib/authService'

const API_URL = 'http://localhost:8000/api/fractionalization'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type BeneficiaryShare = {
  beneficiaryUserId: string
  fractionPercent: number
}

export type CreateFractionalizationRequest = {
  source: 'SUBSCRIPTION' | 'ASSET'
  fractionalizeHtAmount: number
  patientNote?: string
  beneficiaries: BeneficiaryShare[]
}

export type FractionalizationRequestView = {
  requestId: string
  primaryUserId: string
  hospitalId: string
  source: 'SUBSCRIPTION' | 'ASSET'
  fractionalizeHtAmount: number
  status: 'PENDING_ADMIN' | 'PENDING_INSURER' | 'REJECTED' | 'ACTIVE'
  patientNote?: string
  insurerName?: string
  nocNumber?: string
  nocIssuedAt?: string
  nocExpiresAt?: string
  nocDocument?: string
  rejectionReason?: string
  createdAt?: string
  beneficiaries: {
    beneficiaryUserId: string
    fractionPercent: number
    allocatedHt: number
  }[]
}

export type FractionalAllocationView = {
  allocationId: string
  requestId: string
  primaryUserId: string
  beneficiaryUserId: string
  source: 'SUBSCRIPTION' | 'ASSET'
  totalAllocatedHt: number
  remainingHt: number
  status: 'ACTIVE' | 'FROZEN' | 'REVOKED' | 'EXPIRED'
  insurerName?: string
  nocNumber?: string
  nocIssuedAt?: string
  nocExpiresAt?: string
}

export type AdminDecisionRequest = {
  rejectionReason?: string
  insurerName?: string
  nocNumber?: string
  nocIssuedAt?: string
  nocExpiresAt?: string
  nocDocument?: string
}

const getHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const mapReq = (r: FractionalizationRequestView): FractionalizationRequestView => ({
  ...r,
  fractionalizeHtAmount: Number(r.fractionalizeHtAmount || 0),
  beneficiaries: (r.beneficiaries || []).map((b) => ({
    ...b,
    fractionPercent: Number(b.fractionPercent || 0),
    allocatedHt: Number(b.allocatedHt || 0),
  })),
})

const mapAlloc = (a: FractionalAllocationView): FractionalAllocationView => ({
  ...a,
  totalAllocatedHt: Number(a.totalAllocatedHt || 0),
  remainingHt: Number(a.remainingHt || 0),
})

export const fractionalizationService = {
  async submitRequest(payload: CreateFractionalizationRequest): Promise<FractionalizationRequestView> {
    const res = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })
    const json: ApiResponse<FractionalizationRequestView> = await res.json()
    if (!res.ok || !json.success) throw new Error(json.message || 'Submit failed')
    return mapReq(json.data)
  },

  async myRequests(): Promise<FractionalizationRequestView[]> {
    const res = await fetch(`${API_URL}/requests/mine`, { headers: getHeaders() })
    const json: ApiResponse<FractionalizationRequestView[]> = await res.json()
    if (!res.ok || !json.success) throw new Error(json.message || 'Fetch failed')
    return (json.data || []).map(mapReq)
  },

  async pendingForAdmin(): Promise<FractionalizationRequestView[]> {
    const res = await fetch(`${API_URL}/admin/requests/pending`, { headers: getHeaders() })
    const json: ApiResponse<FractionalizationRequestView[]> = await res.json()
    if (!res.ok || !json.success) throw new Error(json.message || 'Fetch failed')
    return (json.data || []).map(mapReq)
  },

  async forwardToInsurer(requestId: string): Promise<FractionalizationRequestView> {
    const res = await fetch(`${API_URL}/admin/requests/${requestId}/forward`, {
      method: 'POST',
      headers: getHeaders(),
    })
    const json: ApiResponse<FractionalizationRequestView> = await res.json()
    if (!res.ok || !json.success) throw new Error(json.message || 'Forward failed')
    return mapReq(json.data)
  },

  async pendingForInsurer(): Promise<FractionalizationRequestView[]> {
    const res = await fetch(`${API_URL}/insurer/requests/pending`, { headers: getHeaders() })
    const json: ApiResponse<FractionalizationRequestView[]> = await res.json()
    if (!res.ok || !json.success) throw new Error(json.message || 'Fetch failed')
    return (json.data || []).map(mapReq)
  },

  async approve(requestId: string, payload: AdminDecisionRequest): Promise<FractionalizationRequestView> {
    const res = await fetch(`${API_URL}/insurer/requests/${requestId}/approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })
    const json: ApiResponse<FractionalizationRequestView> = await res.json()
    if (!res.ok || !json.success) throw new Error(json.message || 'Approve failed')
    return mapReq(json.data)
  },

  async reject(requestId: string, rejectionReason: string): Promise<FractionalizationRequestView> {
    const res = await fetch(`${API_URL}/admin/requests/${requestId}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rejectionReason }),
    })
    const json: ApiResponse<FractionalizationRequestView> = await res.json()
    if (!res.ok || !json.success) throw new Error(json.message || 'Reject failed')
    return mapReq(json.data)
  },

  async myBeneficiaryAllocations(): Promise<FractionalAllocationView[]> {
    const res = await fetch(`${API_URL}/allocations/beneficiary`, { headers: getHeaders() })
    const json: ApiResponse<FractionalAllocationView[]> = await res.json()
    if (!res.ok || !json.success) throw new Error(json.message || 'Fetch failed')
    return (json.data || []).map(mapAlloc)
  },

  async myPrimaryAllocations(): Promise<FractionalAllocationView[]> {
    const res = await fetch(`${API_URL}/allocations/primary`, { headers: getHeaders() })
    const json: ApiResponse<FractionalAllocationView[]> = await res.json()
    if (!res.ok || !json.success) throw new Error(json.message || 'Fetch failed')
    return (json.data || []).map(mapAlloc)
  },

  async redeemFromOwnProfile(allocationId: string, amount: number, reason?: string): Promise<FractionalAllocationView> {
    const res = await fetch(`${API_URL}/allocations/redeem`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ allocationId, amount, reason }),
    })
    const json: ApiResponse<FractionalAllocationView> = await res.json()
    if (!res.ok || !json.success) throw new Error(json.message || 'Redeem failed')
    return mapAlloc(json.data)
  },

  async redeemAtHospital(allocationId: string, amount: number, reason?: string): Promise<FractionalAllocationView> {
    const res = await fetch(`${API_URL}/hospital/redeem`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ allocationId, amount, reason }),
    })
    const json: ApiResponse<FractionalAllocationView> = await res.json()
    if (!res.ok || !json.success) throw new Error(json.message || 'Redeem failed')
    return mapAlloc(json.data)
  },

  async revoke(allocationId: string, reason?: string): Promise<FractionalAllocationView> {
    const res = await fetch(`${API_URL}/allocations/${allocationId}/revoke`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    })
    const json: ApiResponse<FractionalAllocationView> = await res.json()
    if (!res.ok || !json.success) throw new Error(json.message || 'Revoke failed')
    return mapAlloc(json.data)
  },
}
