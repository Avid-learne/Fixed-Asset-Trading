// services/benefitService.ts
import { api } from '@/lib/api'
import { Benefit, BenefitRedemption, ApiResponse, PaginatedResponse } from '@/types'

export const benefitService = {
  async getBenefits(category?: string): Promise<ApiResponse<Benefit[]>> {
    const url = category ? `/benefits?category=${category}` : '/benefits'
    return api.get<ApiResponse<Benefit[]>>(url)
  },

  async getBenefitById(id: string): Promise<ApiResponse<Benefit>> {
    return api.get<ApiResponse<Benefit>>(`/benefits/${id}`)
  },

  async redeemBenefit(benefitId: string): Promise<ApiResponse<BenefitRedemption>> {
    return api.post<ApiResponse<BenefitRedemption>>('/benefits/redeem', { benefitId })
  },

  async getRedemptions(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<BenefitRedemption>> {
    return api.get<PaginatedResponse<BenefitRedemption>>(`/benefits/redemptions?page=${page}&pageSize=${pageSize}`)
  },

  async getRedemptionById(id: string): Promise<ApiResponse<BenefitRedemption>> {
    return api.get<ApiResponse<BenefitRedemption>>(`/benefits/redemptions/${id}`)
  }
}