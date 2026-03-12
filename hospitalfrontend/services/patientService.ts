import { authService } from '@/lib/authService'
import type { PatientProfile, PatientTokenBalance } from '@/types/patient'

const API_URL = 'http://localhost:8000/api/profile'

export interface PatientWithBalance extends PatientProfile {
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
  return {
    id: profile.patientId || profile.userId,
    registrationId: profile.registrationId || `LNH-${profile.userId?.substring(0, 8).toUpperCase()}`,
    fullName: profile.name || '',
    email: profile.email || '',
    phone: profile.phoneNum || '',
    dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString() : '',
    bloodGroup: profile.bloodGroup || '',
    address: profile.address || '',
    location: profile.city || '',
    status: profile.status?.toLowerCase() === 'active' ? 'active' : 'inactive',
    profileCompletion: calculateProfileCompletion(profile),
    memberSince: new Date().toISOString(),
    walletAddress: profile.walletAddress || '',
    createdAt: new Date().toISOString(),
    kycStatus: profile.kycStatus?.toLowerCase() || 'unverified',
    totalDepositsValue: 0,
    totalTransactions: 0,
    lastActivity: new Date().toISOString().split('T')[0],
    tokenBalance: {
      assetToken: 0,
      healthToken: 0,
      totalTokens: 0,
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
