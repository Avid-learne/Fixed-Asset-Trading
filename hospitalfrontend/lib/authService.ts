// lib/authService.ts
const API_URL = 'http://localhost:8080/api/auth';

export interface AuthResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
  success: boolean;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  walletAddress?: string;
}

export const authService = {
  /**
   * Signup - Create new account
   */
  async signup(request: SignupRequest): Promise<AuthResponse> {
    try {
      // Validate input
      if (!request.email || !request.password || !request.name) {
        throw new Error('Email, password, and name are required');
      }

      if (request.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email.trim().toLowerCase(),
          password: request.password.trim(),
          name: request.name.trim(),
          role: request.role || 'PATIENT',
          walletAddress: request.walletAddress?.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      if (data.success && data.token) {
        // Store token and user data
        authService.setToken(data.token);
        authService.setUser(data);
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  /**
   * Login - Sign in with credentials
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      // Validate input
      if (!request.email || !request.password) {
        throw new Error('Email and password are required');
      }

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email.trim().toLowerCase(),
          password: request.password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.token) {
        // Store token and user data
        authService.setToken(data.token);
        authService.setUser(data);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Verify token - Check if token is still valid
   */
  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  },

  /**
   * Store JWT token in localStorage
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },

  /**
   * Store user data in localStorage
   */
  setUser(user: Partial<AuthResponse>): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || 'PATIENT',
        })
      );
    }
  },

  /**
   * Get user data from localStorage
   */
  getUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing user data:', e);
          return null;
        }
      }
    }
    return null;
  },

  /**
   * Logout - Clear stored data
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  /**
   * Get Authorization header
   */
  getAuthHeader() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  /**
   * Get role redirects path
   */
  getRoleRedirectPath(role: string): string {
    const roleRedirects: { [key: string]: string } = {
      'PATIENT': '/patient',
      'HOSPITAL_STAFF': '/hospital',
      'HOSPITAL_ADMIN': '/hospitaladmin',
      'BANK_STAFF': '/bank',
      'ADMIN': '/admin',
    };
    return roleRedirects[role?.toUpperCase()] || '/patient';
  },
};
