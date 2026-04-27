// lib/authService.ts
const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8000/api/auth';
const PROFILE_API_URL = process.env.NEXT_PUBLIC_PROFILE_API_URL || 'http://localhost:8000/api/profile';

const normalizeRoleForBackend = (role?: string): string => {
  const normalized = (role || 'PATIENT').trim().toUpperCase();
  const roleMap: Record<string, string> = {
    PATIENT: 'patient',
    HOSPITAL_STAFF: 'hospital_staff',
    HOSPITAL_ADMIN: 'hospital_admin',
    BANK_STAFF: 'bank_staff',
    ADMIN: 'admin',
  };
  return roleMap[normalized] || 'patient';
};

// Normalize backend role to frontend UserRole
const normalizeRoleFromBackend = (role?: string): string => {
  const normalized = (role || 'patient').trim().toLowerCase();
  const roleMap: Record<string, string> = {
    patient: 'Patient',
    hospital_staff: 'Hospital_Staff',
    hospital_admin: 'HospitalAdmin',
    bank_staff: 'Bank_Officer', // Map bank_staff to Bank_Officer
    admin: 'Super_Admin',
  };
  return roleMap[normalized] || 'Patient';
};

export interface AuthResponse {
  userId?: string;
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
  phoneNum?: string;
  address?: string;
  city?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  hospitalId?: string;
  hospitalName?: string;
  patientId?: string;
  success: boolean;
  message: string;
}

export interface StoredAuthUser {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  phoneNum?: string;
  address?: string;
  city?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  hospitalId?: string;
  hospitalName?: string;
  patientId?: string;
  bankId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  cnic: string;
  role: string;
  walletAddress?: string;
  hospitalName?: string;
  bankName?: string;
}

export const authService = {
  /**
   * Signup - Create new account
   */
  async signup(request: SignupRequest): Promise<AuthResponse> {
    try {
      // Validate input
      if (!request.email || !request.password || !request.name || !request.cnic) {
        throw new Error('Email, password, name, and CNIC are required');
      }

      if (request.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!request.cnic || request.cnic.trim().length === 0) {
        throw new Error('CNIC is required for registration');
      }

      // Create timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email.trim().toLowerCase(),
          password: request.password.trim(),
          name: request.name.trim(),
          cnic: request.cnic.trim(),
          role: normalizeRoleForBackend(request.role),
          hospitalName: request.hospitalName ? request.hospitalName.trim() : undefined,
          bankName: request.bankName ? request.bankName.trim() : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const text = await response.text();
      console.log('[Signup Response Text]:', text);
      if (!text) {
        throw new Error('Server returned an empty response. Check if the backend is running.');
      }
      const data = JSON.parse(text);
      console.log('[Signup Response Data]:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      if (data.success && data.token) {
        // Store token and user data
        authService.setToken(data.token);
        authService.setUser(data);
      } else if (data.success) {
        console.warn('[Signup] Success but no token in response. Data:', data);
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Signup request timed out');
        throw new Error('Signup request timed out. Please check your connection.');
      }
      console.error('Signup error:', error);
      throw error;
    }
  },

  /**
   * Fetch hospital names for signup dropdown
   */
  async getHospitals(): Promise<string[]> {
    try {
      console.log(`[authService] Fetching hospitals from ${API_URL}/hospitals`);
      const response = await fetch(`${API_URL}/hospitals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch hospitals (${response.status})`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Get hospitals error:', error);
      return [];
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

      // Create timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${API_URL}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email.trim().toLowerCase(),
          password: request.password.trim(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await response.json();
      
      console.log('[Login Response Status]:', response.status);
      console.log('[Login Response Data]:', data);

      if (!response.ok) {
        console.error('[Login Failed]:', data.message || 'Login failed');
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.token) {
        console.log('[Login Success] Storing token:', data.token);
        // Store token and user data
        authService.setToken(data.token);
        authService.setUser(data);
        console.log('[Token Stored] Read back from localStorage:', localStorage.getItem('authToken'));
      } else if (data.success) {
        console.warn('[Login] Success but no token in response:', data);
      } else {
        console.error('[Login] Failed - success=false:', data);
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Login request timed out');
        throw new Error('Login request timed out. Please check your connection.');
      }
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Verify token - Check if token is still valid
   */
  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      // Create timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Token verification timed out');
        throw new Error('Token verification timed out');
      }
      console.error('Token verification error:', error);
      throw error;
    }
  },

  async fetchCurrentUser(): Promise<AuthResponse | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await this.verifyToken(token);
      if (response.success) {
        this.setUser(response);
        return response;
      }

      return null;
    } catch (error) {
      console.error('Fetch current user error:', error);
      return null;
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
      // Normalize role from backend to frontend UserRole format
      const normalizedRole = normalizeRoleFromBackend(user.role);
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: user.userId || user.id,
          email: user.email,
          name: user.name,
          role: normalizedRole,
          phoneNum: user.phoneNum || '',
          address: user.address || '',
          city: user.city || '',
          bloodGroup: user.bloodGroup || '',
          dateOfBirth: user.dateOfBirth || '',
          hospitalId: user.hospitalId || null,
          hospitalName: user.hospitalName || null,
          patientId: user.patientId || null,
        })
      );
      console.log('[setUser] Normalized role from', user.role, 'to', normalizedRole);
    }
  },

  /**
   * Get user data from localStorage
   */
  getUser(): StoredAuthUser | null {
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
   * Logout - Call backend logout endpoint then clear stored data
   */
  async logout(token?: string): Promise<void> {
    try {
      if (token) {
        // Call backend logout endpoint to log the activity
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }).catch(err => console.log('Backend logout call failed (but continuing):', err));
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local storage regardless of backend response
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
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

  /**
   * Update user profile - calls backend to update and log activity
   */
  async updateProfile(userId: string, updates: Record<string, string>, token?: string): Promise<any> {
    try {
      const response = await fetch(`${PROFILE_API_URL}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || this.getToken() || ''}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Update failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Update local storage with new user data
      if (data && data.success) {
        const currentUser = this.getUser();
        const updatedUser = {
          ...currentUser,
          ...updates
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
};
