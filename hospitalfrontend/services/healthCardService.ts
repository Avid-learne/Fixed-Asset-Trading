const API_URL = 'http://localhost:8000/api/health-cards';

export interface HealthCard {
  patientCardId: string;
  patientId: string;
  cardId: string;
  cardName: string;
  cardNum: string;
  htBalance: string | number;
  expiryDate: string;
  cvv: string;
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
  getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  /**
   * Get all health cards for a patient
   */
  async getPatientHealthCards(userId: string): Promise<HealthCard[]> {
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
        headers: this.getAuthHeaders(),
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
        headers: this.getAuthHeaders(),
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
