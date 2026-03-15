import { authService } from '@/lib/authService';

const API_URL = 'http://localhost:8000/api/profile';

export interface ProfileData {
  userId: string;
  name: string;
  email: string;
  phoneNum: string;
  address: string;
  city: string;
  bloodGroup: string;
  dateOfBirth: string;
  role: string;
  status: string;
  // Patient-specific fields
  patientId?: string;
  walletAddress?: string;
  hasAsset?: boolean;
  hasSubscription?: boolean;
  kycStatus?: string;
  registrationId?: string;
  hospitalId?: string;
  hospitalName?: string;
}

export interface ProfileUpdateRequest {
  name: string;
  phoneNum: string;
  address?: string;
  city?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
}

class ProfileService {
  /**
   * Get profile by user ID
   */
  async getProfile(userId: string): Promise<ProfileData> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: ProfileUpdateRequest): Promise<ProfileData> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Use auth endpoint which logs UPDATE activity
    const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8000/api/auth';
    const response = await fetch(`${authApiUrl}/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    const result = await response.json();
    // Auth endpoint returns user data directly in the response
    const userData = result.data || result;
    return {
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      phoneNum: userData.phoneNum || '',
      address: userData.address || '',
      city: userData.city || '',
      bloodGroup: userData.bloodGroup || '',
      dateOfBirth: userData.dateOfBirth || '',
      role: userData.role || 'PATIENT',
      status: userData.status || 'ACTIVE',
      walletAddress: userData.walletAddress || '',
    };
  }

  /**
   * Update wallet address
   */
  async updateWalletAddress(userId: string, walletAddress: string): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/${userId}/wallet`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update wallet address');
    }
  }
}

export const profileService = new ProfileService();
