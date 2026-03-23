// services/mintingService.ts
import { api } from '@/lib/api'

export interface MintRecord {
  id: string
  depositId: string
  patientId: string
  patientName: string
  patientEmail: string
  assetType: 'gold' | 'silver'
  weight: number
  assetValue: number
  tokensMinted: number
  status: 'pending' | 'minted' | 'processing' | 'failed'
  mintedDate: string
  txHash?: string
  hospitalName: string
}

export interface PendingMintRequest {
  assetId: string
  patientId: string
  patientName: string
  patientEmail: string
  assetType: string
  weight: number
  assetValue: number
  hospitalId: string
  hospitalName: string
}

export interface BatchMintRequest {
  assetIds: string[]
}

export interface MintTransaction {
  transactionHash: string
  blockNumber: number
  mintedRecords: MintRecord[]
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export const mintingService = {
  /**
   * Fetch all pending mint requests from approved deposits
   */
  async getPendingMintRequests(): Promise<MintRecord[]> {
    try {
      const response = await api.get<ApiResponse<MintRecord[]>>('/minting/pending')
      if (response.success && response.data) {
        return response.data
      }
      return []
    } catch (error) {
      console.error('Error fetching pending mint requests:', error)
      return []
    }
  },

  /**
   * Fetch all mint records (with filtering options)
   */
  async getMintRecords(status?: string, limit?: number): Promise<MintRecord[]> {
    try {
      const params = new URLSearchParams()
      
      if (status) {
        params.append('status', status)
      }
      if (limit) {
        params.append('limit', limit.toString())
      }
      
      const queryString = params.toString()
      const fullUrl = queryString ? `/minting/records?${queryString}` : '/minting/records'
      
      const response = await api.get<ApiResponse<MintRecord[]>>(fullUrl)
      if (response.success && response.data) {
        return response.data
      }
      return []
    } catch (error) {
      console.error('Error fetching mint records:', error)
      return []
    }
  },

  /**
   * Submit batch minting request for multiple assets
   */
  async submitBatchMint(assetIds: string[]): Promise<MintTransaction | null> {
    try {
      if (!assetIds || assetIds.length === 0) {
        throw new Error('No assets selected for minting')
      }

      const payload: BatchMintRequest = {
        assetIds
      }

      const response = await api.post<ApiResponse<MintTransaction>>(
        '/minting/batch-mint',
        payload
      )

      if (response.success && response.data) {
        // If minting was successful, the transaction hash and records are returned
        return response.data
      } else {
        const errorMsg = response.message || 'Failed to submit batch mint request'
        throw new Error(errorMsg)
      }
    } catch (error) {
      console.error('Error submitting batch mint:', error)
      throw error
    }
  },

  /**
   * Mint a single asset
   */
  async mintSingleAsset(assetId: string): Promise<MintRecord | null> {
    try {
      const response = await api.post<ApiResponse<MintRecord>>(
        '/minting/mint-single',
        { assetId }
      )

      if (response.success && response.data) {
        return response.data
      } else {
        const errorMsg = response.message || 'Failed to mint asset'
        throw new Error(errorMsg)
      }
    } catch (error) {
      console.error('Error minting single asset:', error)
      throw error
    }
  },

  /**
   * Fetch mint record by ID
   */
  async getMintRecordById(mintId: string): Promise<MintRecord | null> {
    try {
      const response = await api.get<ApiResponse<MintRecord>>(`/minting/records/${mintId}`)
      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Error fetching mint record:', error)
      return null
    }
  },

  /**
   * Get minting statistics for dashboard
   */
  async getMintingStats(): Promise<{
    totalMinted: number
    totalValue: number
    pendingCount: number
    processingCount: number
  } | null> {
    try {
      const response = await api.get<ApiResponse<{
        totalMinted: number
        totalValue: number
        pendingCount: number
        processingCount: number
      }>>('/minting/stats')
      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Error fetching minting stats:', error)
      return null
    }
  },

  /**
   * Get minting history for a patient
   */
  async getPatientMintHistory(patientId: string): Promise<MintRecord[]> {
    try {
      const response = await api.get<ApiResponse<MintRecord[]>>(
        `/minting/patient/${patientId}/history`
      )
      if (response.success && response.data) {
        return response.data
      }
      return []
    } catch (error) {
      console.error('Error fetching patient mint history:', error)
      return []
    }
  }
}
