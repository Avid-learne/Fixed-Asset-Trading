import { authService } from '@/lib/authService';

const API_URL = 'http://localhost:8000/api/subscriptions';

export interface SubscriptionPlan {
  subsId: string;
  hospitalId: string;
  hospitalName: string;
  subscriptionName: string;
  amountPerMonth: number;
  features: string[];
  htTokens: number;
  isActive: boolean;
}

export interface PatientSubscription {
  subsReqId: string;
  subscriptionId: string;
  subscriptionName: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  htTokens: number;
}

export interface PaymentHistory {
  paymentId: string;
  patientId: string;
  subsId: string;
  subscriptionName: string;
  amount: number;
  paymentMethod: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  invoiceUrl?: string;
  timestamp: string;
}

export interface SubscribeRequest {
  userId: string;
  subscriptionId: string;
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Subscription Service
 * Handles all subscription-related API calls
 */
export const subscriptionService = {
  getAuthHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  /**
   * Get all active subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/plans`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }

      const result: ApiResponse<SubscriptionPlan[]> = await response.json();
      return result.data || [];
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Fetch subscription plans timed out');
        throw new Error('Request timed out');
      }
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  },

  /**
   * Get patient's active subscription
   */
  async getPatientSubscription(userId: string): Promise<PatientSubscription | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/patient/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error('Failed to fetch patient subscription');
      }

      const result: ApiResponse<PatientSubscription> = await response.json();
      return result.data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Fetch patient subscription timed out');
        return null;
      }
      console.error('Error fetching patient subscription:', error);
      return null;
    }
  },

  /**
   * Subscribe to a plan
   */
  async subscribe(request: SubscribeRequest): Promise<ApiResponse<PatientSubscription>> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${API_URL}/subscribe`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const result: ApiResponse<PatientSubscription> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Subscription failed');
      }

      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Subscribe request timed out');
        throw new Error('Request timed out');
      }
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  },

  /**
   * Get payment history
   */
  async getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/payment-history/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }

      const result: ApiResponse<PaymentHistory[]> = await response.json();
      return result.data || [];
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Fetch payment history timed out');
        return [];
      }
      console.error('Error fetching payment history:', error);
      return [];
    }
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<ApiResponse<string>> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/cancel/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const result: ApiResponse<string> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to cancel subscription');
      }

      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Cancel subscription request timed out');
        throw new Error('Request timed out');
      }
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },
};

