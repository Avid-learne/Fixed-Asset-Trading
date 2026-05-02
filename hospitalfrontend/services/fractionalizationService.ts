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

/**
 * Read a fetch Response and return the parsed ApiResponse data.
 *
 * Defensive against a backend that sometimes returns a non-JSON body on errors
 * (Spring's default 401/500 page, an empty 204, an HTML error page from a
 * misconfigured proxy, etc.). Without this, every callsite would die with the
 * cryptic "Unexpected end of JSON input" instead of showing what's wrong.
 */
async function parseApi<T>(res: Response, fallbackMsg: string): Promise<T> {
  const text = await res.text()
  let parsed: ApiResponse<T> | null = null
  if (text) {
    try {
      parsed = JSON.parse(text) as ApiResponse<T>
    } catch {
      // Body wasn't JSON — ignore, we'll synthesise an error from status.
    }
  }
  if (!res.ok) {
    const msg = parsed?.message
      || (text && text.length < 300 ? text : '')
      || `${fallbackMsg} (HTTP ${res.status} ${res.statusText || ''})`.trim()
    throw new Error(msg)
  }
  if (!parsed) {
    throw new Error(`${fallbackMsg} — server returned an empty or invalid response`)
  }
  if (!parsed.success) {
    throw new Error(parsed.message || fallbackMsg)
  }
  return parsed.data
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
    return mapReq(await parseApi<FractionalizationRequestView>(res, 'Submit failed'))
  },

  async myRequests(): Promise<FractionalizationRequestView[]> {
    const res = await fetch(`${API_URL}/requests/mine`, { headers: getHeaders() })
    return (await parseApi<FractionalizationRequestView[]>(res, 'Fetch failed') || []).map(mapReq)
  },

  async pendingForAdmin(): Promise<FractionalizationRequestView[]> {
    const res = await fetch(`${API_URL}/admin/requests/pending`, { headers: getHeaders() })
    return (await parseApi<FractionalizationRequestView[]>(res, 'Fetch failed') || []).map(mapReq)
  },

  async forwardToInsurer(requestId: string): Promise<FractionalizationRequestView> {
    const res = await fetch(`${API_URL}/admin/requests/${requestId}/forward`, {
      method: 'POST',
      headers: getHeaders(),
    })
    return mapReq(await parseApi<FractionalizationRequestView>(res, 'Forward failed'))
  },

  async pendingForInsurer(): Promise<FractionalizationRequestView[]> {
    const res = await fetch(`${API_URL}/insurer/requests/pending`, { headers: getHeaders() })
    return (await parseApi<FractionalizationRequestView[]>(res, 'Fetch failed') || []).map(mapReq)
  },

  async approve(requestId: string, payload: AdminDecisionRequest): Promise<FractionalizationRequestView> {
    const res = await fetch(`${API_URL}/insurer/requests/${requestId}/approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })
    return mapReq(await parseApi<FractionalizationRequestView>(res, 'Approve failed'))
  },

  async reject(requestId: string, rejectionReason: string): Promise<FractionalizationRequestView> {
    const res = await fetch(`${API_URL}/admin/requests/${requestId}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rejectionReason }),
    })
    return mapReq(await parseApi<FractionalizationRequestView>(res, 'Reject failed'))
  },

  async myBeneficiaryAllocations(): Promise<FractionalAllocationView[]> {
    const res = await fetch(`${API_URL}/allocations/beneficiary`, { headers: getHeaders() })
    return (await parseApi<FractionalAllocationView[]>(res, 'Fetch failed') || []).map(mapAlloc)
  },

  async myPrimaryAllocations(): Promise<FractionalAllocationView[]> {
    const res = await fetch(`${API_URL}/allocations/primary`, { headers: getHeaders() })
    return (await parseApi<FractionalAllocationView[]>(res, 'Fetch failed') || []).map(mapAlloc)
  },

  async redeemFromOwnProfile(allocationId: string, amount: number, reason?: string): Promise<FractionalAllocationView> {
    const res = await fetch(`${API_URL}/allocations/redeem`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ allocationId, amount, reason }),
    })
    return mapAlloc(await parseApi<FractionalAllocationView>(res, 'Redeem failed'))
  },

  async redeemAtHospital(allocationId: string, amount: number, reason?: string): Promise<FractionalAllocationView> {
    const res = await fetch(`${API_URL}/hospital/redeem`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ allocationId, amount, reason }),
    })
    return mapAlloc(await parseApi<FractionalAllocationView>(res, 'Redeem failed'))
  },

  async revoke(allocationId: string, reason?: string): Promise<FractionalAllocationView> {
    const res = await fetch(`${API_URL}/allocations/${allocationId}/revoke`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    })
    return mapAlloc(await parseApi<FractionalAllocationView>(res, 'Revoke failed'))
  },
}
