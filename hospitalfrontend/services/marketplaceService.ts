import { authService } from '@/lib/authService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export type TradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED'
export type TradeType = 'BUY' | 'SELL'

export interface MarketplaceTrade {
  id: string
  timestamp: Date
  type: TradeType
  title: string
  description: string
  assetName: string
  assetType: string
  buyPrice: number
  quantity: number
  tradeDate?: string
  currentValue: number
  currentValueTotal: number
  exitValue?: number
  unrealizedPnl: number
  realizedPnl: number
  amountInvested: number
  investment: string
  location: string
  open: number
  high: number
  low: number
  close: number
  profitLoss: number
  status: TradeStatus
  notes: string
}

export interface PatientMarketplaceTrade {
  tradeId: string
  tradeName: string
  assetType: string
  investmentAmount: number
  currentValue: number
  pnl: number
}

export interface HospitalAtPool {
  hospitalId: string
  patientCount: number
  openTrades: number
  totalAtPool: number
  totalAtPoolPkr: number
  allocatedAt: number
  allocatedPkr: number
  availableAt: number
  availablePkr: number
}

export interface PatientAssetToken {
  assetId: string
  assignmentId: string
  hospitalId: string
  assetType?: string
  assetValue?: number
  weight?: number
  totalAtAssigned: number
  availableAt: number
  unavailableAt: number
  availabilityStatus: 'AVAILABLE' | 'UNAVAILABLE'
  monetaryValuePkr: number
  availableMonetaryValuePkr: number
  unavailableMonetaryValuePkr: number
  depositStatus?: string
  submittedAt?: string
  approvedAt?: string
  assignedAt?: string
}

export interface OrderBookLevel {
  price: number
  volume: number
  total: number
  type: 'BID' | 'ASK'
}

export interface OrderBook {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  spread: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface BackendTrade {
  tradeId: string
  hospitalId: string
  tradeType: TradeType
  status: TradeStatus
  title: string
  description: string
  assetName?: string
  assetType?: string
  buyPrice?: number
  quantity?: number
  tradeDate?: string
  currentValue?: number
  amountAfterTrade?: number
  exitValue?: number
  unrealizedPnl?: number
  realizedPnl?: number
  investment: string
  location: string
  notes: string
  amountInvested?: number
  amountAfterTrade?: number
  amountBeforeTrade: number
  openingPrice: number
  high: number
  low: number
  closingPrice: number
  volume: number
  profitLoss: number
  startTime: string
}

interface BackendOrderBookLevel {
  price: number
  volume: number
  total: number
  type: 'BID' | 'ASK'
}

interface BackendOrderBook {
  bids: BackendOrderBookLevel[]
  asks: BackendOrderBookLevel[]
  spread: number
}

interface BackendHospitalAtPool {
  hospitalId: string
  patientCount?: number
  openTrades?: number
  totalAtPool?: number
  totalAtPoolPkr?: number
  allocatedAt?: number
  allocatedPkr?: number
  availableAt?: number
  availablePkr?: number
}

interface CreateTradePayload {
  hospitalId: string
  tradeType: TradeType
  assetName: string
  assetType: string
  buyPrice: number
  quantity: number
  tradeDate: string
  currentValue: number
  title: string
  description: string
  investment: string
  location: string
  openingPrice: number
  high: number
  low: number
  closingPrice: number
  notes: string
}

interface UpdateTradePayload {
  tradeType: TradeType
  status: TradeStatus
  assetName?: string
  assetType?: string
  buyPrice?: number
  quantity?: number
  tradeDate?: string
  currentValue?: number
  exitValue?: number
  title: string
  description: string
  investment: string
  location: string
  openingPrice: number
  high: number
  low: number
  closingPrice: number
  notes: string
}

interface CloseTradePayload {
  currentValue?: number
  exitValue?: number
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const readErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const payload = await response.json()
    if (payload?.message && typeof payload.message === 'string') {
      return payload.message
    }
  } catch {
    // Fall back to response metadata when body is not JSON.
  }

  return `${fallback} (${response.status})`
}

const mapTrade = (trade: BackendTrade): MarketplaceTrade => ({
  id: trade.tradeId,
  timestamp: new Date(trade.startTime),
  type: trade.tradeType,
  title: trade.title || trade.investment || '',
  description: trade.description || trade.notes || '',
  assetName: trade.assetName || trade.title || trade.investment || '',
  assetType: trade.assetType || trade.investment || '',
  buyPrice: Number(trade.buyPrice ?? trade.openingPrice ?? 0),
  quantity: Number(trade.quantity ?? trade.volume ?? 0),
  tradeDate: trade.tradeDate,
  currentValue: Number(trade.currentValue ?? trade.amountAfterTrade ?? 0),
  currentValueTotal: Number(trade.amountAfterTrade ?? 0),
  exitValue: trade.exitValue === undefined || trade.exitValue === null ? undefined : Number(trade.exitValue),
  unrealizedPnl: Number(trade.unrealizedPnl ?? 0),
  realizedPnl: Number(trade.realizedPnl ?? 0),
  amountInvested: Number(trade.amountInvested ?? 0),
  investment: trade.investment || '',
  location: trade.location || '',
  open: Number(trade.openingPrice || 0),
  high: Number(trade.high || 0),
  low: Number(trade.low || 0),
  close: Number(trade.closingPrice || 0),
  profitLoss: Number(trade.profitLoss || 0),
  status: trade.status || 'OPEN',
  notes: trade.notes || '',
})

const mapOrderBook = (book: BackendOrderBook): OrderBook => ({
  bids: (book.bids || []).map((level) => ({
    price: Number(level.price || 0),
    volume: Number(level.volume || 0),
    total: Number(level.total || 0),
    type: level.type || 'BID',
  })),
  asks: (book.asks || []).map((level) => ({
    price: Number(level.price || 0),
    volume: Number(level.volume || 0),
    total: Number(level.total || 0),
    type: level.type || 'ASK',
  })),
  spread: Number(book.spread || 0),
})

export const marketplaceService = {
  async getHospitalTrades(hospitalId: string): Promise<MarketplaceTrade[]> {
    const response = await fetch(`${API_BASE}/marketplace/trades/hospital/${hospitalId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Failed to fetch hospital trades'))
    }

    const result: ApiResponse<BackendTrade[]> = await response.json()
    return (result.data || []).map(mapTrade)
  },

  async getOrderBook(hospitalId: string, investment: string): Promise<OrderBook> {
    const params = new URLSearchParams({ hospitalId, investment })
    const response = await fetch(`${API_BASE}/marketplace/order-book?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch order book')
    }

    const result: ApiResponse<BackendOrderBook> = await response.json()
    return mapOrderBook(result.data || { bids: [], asks: [], spread: 0 })
  },

  async createTrade(payload: CreateTradePayload): Promise<MarketplaceTrade> {
    const response = await fetch(`${API_BASE}/marketplace/trades`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    const result: ApiResponse<BackendTrade> = await response.json()

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Failed to create trade')
    }

    return mapTrade(result.data)
  },

  async updateTrade(tradeId: string, payload: UpdateTradePayload): Promise<MarketplaceTrade> {
    const response = await fetch(`${API_BASE}/marketplace/trades/${tradeId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    const result: ApiResponse<BackendTrade> = await response.json()

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Failed to update trade')
    }

    return mapTrade(result.data)
  },

  async closeTrade(tradeId: string, payload?: CloseTradePayload): Promise<MarketplaceTrade> {
    const response = await fetch(`${API_BASE}/marketplace/trades/${tradeId}/close`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: payload ? JSON.stringify(payload) : undefined,
    })

    const result: ApiResponse<BackendTrade> = await response.json()

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Failed to close trade')
    }

    return mapTrade(result.data)
  },

  async getPatientViewTrades(hospitalId: string): Promise<PatientMarketplaceTrade[]> {
    const response = await fetch(`${API_BASE}/marketplace/trades/hospital/${hospitalId}/patient-view`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch patient-facing trades')
    }

    const result: ApiResponse<PatientMarketplaceTrade[]> = await response.json()
    return (result.data || []).map((trade) => ({
      tradeId: trade.tradeId,
      tradeName: trade.tradeName,
      assetType: trade.assetType,
      investmentAmount: Number(trade.investmentAmount || 0),
      currentValue: Number(trade.currentValue || 0),
      pnl: Number(trade.pnl || 0),
    }))
  },

  async getHospitalAtPool(hospitalId: string): Promise<HospitalAtPool> {
    const response = await fetch(`${API_BASE}/marketplace/pools/hospital/${hospitalId}/at`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Failed to fetch hospital AT pool'))
    }

    const result: ApiResponse<BackendHospitalAtPool> = await response.json()
    const data = result.data || ({} as BackendHospitalAtPool)

    return {
      hospitalId: data.hospitalId || hospitalId,
      patientCount: Number(data.patientCount || 0),
      openTrades: Number(data.openTrades || 0),
      totalAtPool: Number(data.totalAtPool || 0),
      totalAtPoolPkr: Number(data.totalAtPoolPkr || 0),
      allocatedAt: Number(data.allocatedAt || 0),
      allocatedPkr: Number(data.allocatedPkr || 0),
      availableAt: Number(data.availableAt || 0),
      availablePkr: Number(data.availablePkr || 0),
    }
  },

  async getPatientAssetTokens(patientId: string): Promise<PatientAssetToken[]> {
    const url = `${API_BASE}/marketplace/at-trading/patient/${patientId}/asset-tokens`
    console.log('Fetching asset tokens from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    console.log('Asset tokens response status:', response.status)
    console.log('Asset tokens response ok:', response.ok)

    if (!response.ok) {
      const text = await response.text()
      console.error('Asset tokens error response:', text)
      throw new Error('Failed to fetch patient asset tokens')
    }

    const result: ApiResponse<PatientAssetToken[]> = await response.json()
    console.log('Asset tokens API response:', result)
    
    return (result.data || []).map((token) => ({
      assetId: token.assetId,
      assignmentId: token.assignmentId,
      hospitalId: token.hospitalId,
      assetType: token.assetType,
      assetValue: Number(token.assetValue || 0),
      weight: token.weight ? Number(token.weight) : undefined,
      totalAtAssigned: Number(token.totalAtAssigned || 0),
      availableAt: Number(token.availableAt || 0),
      unavailableAt: Number(token.unavailableAt || 0),
      availabilityStatus: token.availabilityStatus as 'AVAILABLE' | 'UNAVAILABLE',
      monetaryValuePkr: Number(token.monetaryValuePkr || 0),
      availableMonetaryValuePkr: Number(token.availableMonetaryValuePkr || 0),
      unavailableMonetaryValuePkr: Number(token.unavailableMonetaryValuePkr || 0),
      depositStatus: token.depositStatus,
      submittedAt: token.submittedAt,
      approvedAt: token.approvedAt,
      assignedAt: token.assignedAt,
    }))
  },
}
