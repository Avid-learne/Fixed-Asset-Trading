import { authService } from '@/lib/authService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export type TradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED'
export type TradeType = 'BUY' | 'SELL'

export interface MarketplaceTrade {
  id: string
  timestamp: Date
  type: TradeType
  investment: string
  location: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  liquidity: number
  profitLoss: number
  status: TradeStatus
  notes: string
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
  investment: string
  location: string
  notes: string
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

interface CreateTradePayload {
  hospitalId: string
  tradeType: TradeType
  investment: string
  location: string
  openingPrice: number
  high: number
  low: number
  closingPrice: number
  volume: number
  liquidity: number
  notes: string
}

interface UpdateTradePayload {
  tradeType: TradeType
  status: TradeStatus
  investment: string
  location: string
  openingPrice: number
  high: number
  low: number
  closingPrice: number
  volume: number
  liquidity: number
  notes: string
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const mapTrade = (trade: BackendTrade): MarketplaceTrade => ({
  id: trade.tradeId,
  timestamp: new Date(trade.startTime),
  type: trade.tradeType,
  investment: trade.investment || '',
  location: trade.location || '',
  open: Number(trade.openingPrice || 0),
  high: Number(trade.high || 0),
  low: Number(trade.low || 0),
  close: Number(trade.closingPrice || 0),
  volume: Number(trade.volume || 0),
  liquidity: Number(trade.amountBeforeTrade || 0),
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
      throw new Error('Failed to fetch hospital trades')
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

  async closeTrade(tradeId: string): Promise<MarketplaceTrade> {
    const response = await fetch(`${API_BASE}/marketplace/trades/${tradeId}/close`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    })

    const result: ApiResponse<BackendTrade> = await response.json()

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Failed to close trade')
    }

    return mapTrade(result.data)
  },
}
