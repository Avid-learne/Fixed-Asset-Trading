// services/assetService.ts
import { api } from '@/lib/api'
import { Asset, ApiResponse, PaginatedResponse, FilterOptions } from '@/types'

export interface AssetDeposit {
  assetId: string
  patientId: string
  patientName: string
  patientEmail: string
  hospitalId: string
  hospitalName: string
  assetType: 'GOLD' | 'SILVER' | 'CASH' | 'PROPERTY'
  weight?: number
  assetValue: number
  expectedTokens: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MINTED'
  bankApprovalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  bankApprovedAt?: string
  bankRejectedAt?: string
  bankRejectionReason?: string
}

export const assetService = {
  async getAssets(filters?: FilterOptions): Promise<PaginatedResponse<Asset>> {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters?.dateTo) params.append('dateTo', filters.dateTo)
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
    params.append('page', (filters?.page || 1).toString())
    params.append('pageSize', (filters?.pageSize || 20).toString())

    return api.get<PaginatedResponse<Asset>>(`/assets?${params.toString()}`)
  },

  async getAssetById(id: string): Promise<ApiResponse<Asset>> {
    return api.get<ApiResponse<Asset>>(`/assets/${id}`)
  },

  async createAsset(data: FormData): Promise<ApiResponse<Asset>> {
    return api.post<ApiResponse<Asset>>('/assets', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  async approveAsset(id: string, data: { tokensGenerated: number }): Promise<ApiResponse<Asset>> {
    return api.post<ApiResponse<Asset>>(`/assets/${id}/approve`, data)
  },

  async rejectAsset(id: string, data: { reason: string }): Promise<ApiResponse<Asset>> {
    return api.post<ApiResponse<Asset>>(`/assets/${id}/reject`, data)
  },

  async deleteAsset(id: string): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`/assets/${id}`)
  },

  // Patient-specific endpoints for viewing linked deposits
  async getPatientDeposits(status?: string): Promise<ApiResponse<AssetDeposit[]>> {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    return api.get<ApiResponse<AssetDeposit[]>>(`/asset-deposits/mine${params ? `?${params.toString()}` : ''}`)
  },

  async getPatientDepositById(assetId: string): Promise<ApiResponse<AssetDeposit>> {
    return api.get<ApiResponse<AssetDeposit>>(`/asset-deposits/${assetId}`)
  }
}