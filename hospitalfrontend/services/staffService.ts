// services/staffService.ts
import { api } from '@/lib/api'

export interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  joinDate?: string
  lastLogin?: string
  createdAt?: string
  updatedAt?: string
  position?: string
  department?: string
  permissions?: {
    viewPatients: boolean
    approveDeposits: boolean
    mintTokens: boolean
    manageStaff: boolean
    viewReports: boolean
    allocateProfits: boolean
    manageSettings: boolean
  }
  activityLog?: {
    action: string
    timestamp: string
    details: string
  }[]
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface InviteStaffRequest {
  email: string
  role: string
}

export const staffService = {
  /**
   * Fetch all staff members for the hospital
   */
  async getStaffMembers(status?: string): Promise<StaffMember[]> {
    try {
      const params = new URLSearchParams()
      if (status) {
        params.append('status', status)
      }
      
      const queryString = params.toString()
      const url = queryString ? `/staff?${queryString}` : '/staff'
      
      const response = await api.get<ApiResponse<StaffMember[]>>(url)
      if (response.success && response.data) {
        return response.data
      }
      return []
    } catch (error) {
      console.error('Error fetching staff members:', error)
      return []
    }
  },

  /**
   * Fetch a specific staff member by ID
   */
  async getStaffMemberById(staffId: string): Promise<StaffMember | null> {
    try {
      const response = await api.get<ApiResponse<StaffMember>>(`/staff/${staffId}`)
      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Error fetching staff member:', error)
      return null
    }
  },

  /**
   * Invite a new staff member
   */
  async inviteStaff(email: string, role: string): Promise<boolean> {
    try {
      const payload: InviteStaffRequest = {
        email,
        role
      }

      const response = await api.post<ApiResponse<{ success: boolean }>>(
        '/staff/invite',
        payload
      )

      if (response.success) {
        return true
      } else {
        const errorMsg = response.message || 'Failed to send invitation'
        throw new Error(errorMsg)
      }
    } catch (error) {
      console.error('Error inviting staff:', error)
      throw error
    }
  },

  /**
   * Update staff member status
   */
  async updateStaffStatus(staffId: string, status: string): Promise<StaffMember | null> {
    try {
      const response = await api.put<ApiResponse<StaffMember>>(
        `/staff/${staffId}/status`,
        { status }
      )

      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Error updating staff status:', error)
      throw error
    }
  },

  /**
   * Update staff member permissions
   */
  async updateStaffPermissions(
    staffId: string,
    permissions: Record<string, boolean>
  ): Promise<StaffMember | null> {
    try {
      const response = await api.put<ApiResponse<StaffMember>>(
        `/staff/${staffId}/permissions`,
        { permissions }
      )

      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Error updating staff permissions:', error)
      throw error
    }
  },

  /**
   * Update staff member profile
   */
  async updateStaffProfile(
    staffId: string,
    profile: Partial<StaffMember>
  ): Promise<StaffMember | null> {
    try {
      const response = await api.put<ApiResponse<StaffMember>>(
        `/staff/${staffId}`,
        profile
      )

      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Error updating staff profile:', error)
      throw error
    }
  },

  /**
   * Deactivate a staff member
   */
  async deactivateStaff(staffId: string): Promise<boolean> {
    try {
      const response = await api.put<ApiResponse<{ success: boolean }>>(
        `/staff/${staffId}/deactivate`,
        {}
      )

      if (response.success) {
        return true
      }
      return false
    } catch (error) {
      console.error('Error deactivating staff:', error)
      throw error
    }
  },

  /**
   * Get staff statistics
   */
  async getStaffStats(): Promise<{
    totalStaff: number
    activeStaff: number
    inactiveStaff: number
    pendingStaff: number
  } | null> {
    try {
      const response = await api.get<ApiResponse<{
        totalStaff: number
        activeStaff: number
        inactiveStaff: number
        pendingStaff: number
      }>>('/staff/stats')

      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Error fetching staff stats:', error)
      return null
    }
  }
}
