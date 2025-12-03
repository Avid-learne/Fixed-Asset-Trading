// services/tokenService.ts
import { api } from '@/lib/api'
import { TokenBalance, TokenHistory, ApiResponse, PaginatedResponse, ChartDataPoint } from '@/types'

export const tokenService = {
  async getBalance(): Promise<ApiResponse<TokenBalance>> {
    return api.get<ApiResponse<TokenBalance>>('/tokens/balance')
  },

  async getHistory(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<TokenHistory>> {
    return api.get<PaginatedResponse<TokenHistory>>(`/tokens/history?page=${page}&pageSize=${pageSize}`)
  },

  async getBalanceChart(period: string = '30d'): Promise<ApiResponse<ChartDataPoint[]>> {
    return api.get<ApiResponse<ChartDataPoint[]>>(`/tokens/balance-chart?period=${period}`)
  },

  async mintTokens(data: { assetId: string; amount: number }): Promise<ApiResponse<TokenBalance>> {
    return api.post<ApiResponse<TokenBalance>>('/tokens/mint', data)
  },

  async transferTokens(data: { recipientId: string; amount: number; note?: string }): Promise<ApiResponse<TokenHistory>> {
    return api.post<ApiResponse<TokenHistory>>('/tokens/transfer', data)
  }
}