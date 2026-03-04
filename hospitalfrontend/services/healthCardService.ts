const API_URL = 'http://localhost:8080/api/health-cards';

export interface HealthCard {
  id: string;
  patientId: string;
  subscriptionId?: string;
  cardNumber: string;
  cardType: 'SUBSCRIPTION' | 'ASSET';
  holderName: string;
  planName: string;
  assetValue: string;
  htBalance: string;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
  cvv: string;
  securityKey: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Health Card Service
 * Handles all health card related API calls
 */
export const healthCardService = {
  /**
   * Get all health cards for a patient
   */
  async getPatientHealthCards(userId: string): Promise<HealthCard[]> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/patient/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error('Failed to fetch health cards');
      }

      const result: ApiResponse<HealthCard[]> = await response.json();
      return result.data || [];
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Fetch health cards timed out');
        throw new Error('Request timed out');
      }
      console.error('Error fetching health cards:', error);
      throw error;
    }
  },

  /**
   * Get health cards by type (SUBSCRIPTION or ASSET)
   */
  async getHealthCardsByType(userId: string, cardType: 'SUBSCRIPTION' | 'ASSET'): Promise<HealthCard[]> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/patient/${userId}/type/${cardType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${cardType} health cards`);
      }

      const result: ApiResponse<HealthCard[]> = await response.json();
      return result.data || [];
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`Fetch ${cardType} health cards timed out`);
        throw new Error('Request timed out');
      }
      console.error(`Error fetching ${cardType} health cards:`, error);
      throw error;
    }
  },

  /**
   * Get only active health cards for a patient
   */
  async getActiveHealthCards(userId: string): Promise<HealthCard[]> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/patient/${userId}/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error('Failed to fetch active health cards');
      }

      const result: ApiResponse<HealthCard[]> = await response.json();
      return result.data || [];
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Fetch active health cards timed out');
        throw new Error('Request timed out');
      }
      console.error('Error fetching active health cards:', error);
      throw error;
    }
  },

  /**
   * Get subscription card for a patient
   */
  async getSubscriptionCard(userId: string): Promise<HealthCard | null> {
    try {
      const cards = await this.getHealthCardsByType(userId, 'SUBSCRIPTION');
      return cards.length > 0 ? cards[0] : null;
    } catch (error) {
      console.error('Error fetching subscription card:', error);
      return null;
    }
  },

  /**
   * Get asset card for a patient
   */
  async getAssetCard(userId: string): Promise<HealthCard | null> {
    try {
      const cards = await this.getHealthCardsByType(userId, 'ASSET');
      return cards.length > 0 ? cards[0] : null;
    } catch (error) {
      console.error('Error fetching asset card:', error);
      return null;
    }
  },
};
