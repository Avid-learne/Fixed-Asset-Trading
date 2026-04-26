import { authService } from '@/lib/authService';

const API_URL = 'http://localhost:8000/api/profile';

export interface ProfileData {
  userId: string;
  name: string;
  email: string;
  cnic?: string;
  gender?: string;
  nationality?: string;
  cnicIssueDate?: string;
  cnicExpiryDate?: string;
  phoneNum: string;
  address: string;
  city: string;
  country?: string;
  postalCode?: string;
  bloodGroup: string;
  occupation?: string;
  sourceOfIncome?: string;
  healthIssues?: string;
  dateOfBirth: string;
  role: string;
  status: string;
  // Patient-specific fields
  patientId?: string;
  walletAddress?: string;
  hasAsset?: boolean;
  hasSubscription?: boolean;
  kycStatus?: string;
  kycSubmittedAt?: string;
  kycReviewedAt?: string;
  kycReviewedBy?: string;
  kycRejectionReason?: string;
  kycDocumentFront?: string;
  kycDocumentBack?: string;
  kycSelfie?: string;
  registrationId?: string;
  hospitalId?: string;
  hospitalName?: string;
  totalAssets?: number;
  totalAt?: number;
  totalHt?: number;
}

export interface ProfileUpdateRequest {
  name: string;
  cnic?: string;
  gender?: string;
  nationality?: string;
  cnicIssueDate?: string;
  cnicExpiryDate?: string;
  phoneNum: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  bloodGroup?: string;
  occupation?: string;
  sourceOfIncome?: string;
  healthIssues?: string;
  dateOfBirth?: string;
  kycDocumentFront?: string;
  kycDocumentBack?: string;
  kycSelfie?: string;
}

export interface KycStatusData {
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
}

export interface KycReviewRequest {
  approved: boolean;
  reason?: string;
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

  async getKycStatus(): Promise<KycStatusData> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/kyc/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok || !result?.success) {
      throw new Error(result?.message || 'Failed to fetch KYC status');
    }

    return result.data;
  }

  async submitKyc(): Promise<KycStatusData> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/kyc/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok || !result?.success) {
      throw new Error(result?.message || 'Failed to submit KYC');
    }

    return result.data;
  }

  async getHospitalPatients(): Promise<ProfileData[]> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/hospital/patients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok || !result?.success) {
      throw new Error(result?.message || 'Failed to fetch patient records');
    }

    return result.data;
  }

  async reviewKyc(userId: string, request: KycReviewRequest): Promise<KycStatusData> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/kyc/review/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();
    if (!response.ok || !result?.success) {
      throw new Error(result?.message || 'Failed to review KYC');
    }

    return result.data;
  }
}

export const profileService = new ProfileService();
