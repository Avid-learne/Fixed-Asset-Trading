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

    const response = await fetch(`${API_URL}/${userId}`, {
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
    return result.data;
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
