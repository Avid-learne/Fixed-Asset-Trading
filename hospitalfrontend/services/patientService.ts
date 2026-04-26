import { authService } from '@/lib/authService'
import type { PatientProfile, PatientTokenBalance } from '@/types/patient'

const API_URL = 'http://localhost:8000/api/profile'

export interface PatientWithBalance extends PatientProfile {
  userId?: string
  hospitalId?: string
  hospitalName?: string
  hasAsset?: boolean
  hasSubscription?: boolean
  kycStatus?: string
  tokenBalance?: PatientTokenBalance
  recentDeposits?: any[]
  recentTransactions?: any[]
  totalDepositsValue?: number
  totalTransactions?: number
  lastActivity?: string
}

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

class PatientService {
  /**
   * Get all patients for hospital portal
   */
  async getAllPatients(): Promise<PatientWithBalance[]> {
    try {
      const response = await fetch(`${API_URL}/hospital/patients`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch patients')
      }

      const result = await response.json()
      const patients = result.data || []

      // Transform backend profiles to match frontend PatientProfile interface
      return patients.map((profile: any) => transformProfileToPatient(profile))
    } catch (error) {
      console.error('Error fetching patients:', error)
      throw error
    }
  }

  async getPatientsByHospital(hospitalId: string): Promise<PatientWithBalance[]> {
    try {
      const response = await fetch(`${API_URL}/hospital/${hospitalId}/patients`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch hospital patients')
      }

      const result = await response.json()
      const patients = result.data || []
      return patients.map((profile: any) => transformProfileToPatient(profile))
    } catch (error) {
      console.error('Error fetching hospital patients:', error)
      throw error
    }
  }

  async redeemPatientHt(patientUserId: string, amount: number, reason: string): Promise<void> {
    const token = authService.getToken()

    const response = await fetch('http://localhost:8000/api/wallet/hospital/redeem/ht', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        patientUserId,
        amount,
        reason,
      }),
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok || result?.success === false) {
      throw new Error(result?.message || 'Failed to redeem HT')
    }
  }

  /**
   * Get patient by ID
   */
  async getPatientById(userId: string): Promise<PatientWithBalance> {
    try {
      const response = await fetch(`${API_URL}/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch patient')
      }

      const result = await response.json()
      const profile = result.data
      return transformProfileToPatient(profile)
    } catch (error) {
      console.error('Error fetching patient:', error)
      throw error
    }
  }
}

/**
 * Transform backend ProfileResponse to frontend PatientProfile
 */
function transformProfileToPatient(profile: any): PatientWithBalance {
  const totalAt = Number(profile.totalAt || 0)
  const totalHt = Number(profile.totalHt || 0)

  return {
    id: profile.patientId || profile.userId,
    userId: profile.userId,
    hospitalId: profile.hospitalId,
    hospitalName: profile.hospitalName,
    registrationId: profile.registrationId || `LNH-${profile.userId?.substring(0, 8).toUpperCase()}`,
    fullName: profile.name || '',
    email: profile.email || '',
    cnic: profile.cnic || '',
    phone: profile.phoneNum || '',
    dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString() : '',
    bloodGroup: profile.bloodGroup || '',
    address: profile.address || '',
    location: profile.city || '',
    status: profile.status?.toLowerCase() === 'active' ? 'active' : 'inactive',
    profileCompletion: calculateProfileCompletion(profile),
    memberSince: new Date().toISOString(),
    walletAddress: profile.walletAddress || '',
    hasAsset: !!profile.hasAsset,
    hasSubscription: !!profile.hasSubscription,
    createdAt: new Date().toISOString(),
    kycStatus: profile.kycStatus?.toLowerCase() || 'pending',
    totalDepositsValue: 0,
    totalTransactions: 0,
    lastActivity: new Date().toISOString().split('T')[0],
    tokenBalance: {
      assetToken: totalAt,
      healthToken: totalHt,
      lastUpdated: new Date().toISOString(),
    },
    recentDeposits: [],
    recentTransactions: [],
  }
}

/**
 * Calculate profile completion percentage
 */
function calculateProfileCompletion(profile: any): number {
  let completedFields = 0
  const totalFields = 8

  if (profile.name) completedFields++
  if (profile.email) completedFields++
  if (profile.phoneNum) completedFields++
  if (profile.address) completedFields++
  if (profile.city) completedFields++
  if (profile.bloodGroup) completedFields++
  if (profile.dateOfBirth) completedFields++
  if (profile.walletAddress) completedFields++

  return Math.round((completedFields / totalFields) * 100)
}

export const patientService = new PatientService()
