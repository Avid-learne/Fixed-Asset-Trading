// hospital-frontend/lib/services/auth-service.ts
import { supabase } from '@/lib/supabase';
import { hashPassword, verifyPassword } from '@/lib/auth';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'PATIENT' | 'HOSPITAL' | 'BANK';
  wallet_address: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'PATIENT' | 'HOSPITAL' | 'BANK';
  wallet_address: string;
}

class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthUser> {
    try {
      // Hash password
      const password_hash = await hashPassword(data.password);

      // Insert user
      const { data: user, error } = await supabase
        .from('users')
        .insert([
          {
            email: data.email,
            name: data.name,
            password_hash,
            role: data.role,
            wallet_address: data.wallet_address,
            status: 'ACTIVE',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet_address: user.wallet_address,
        status: user.status,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      // Get user by email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.email)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      // Verify password
      const isValid = await verifyPassword(credentials.password, user.password_hash);
      if (!isValid) {
        throw new Error('Invalid password');
      }

      // Create session
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
      const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await supabase.from('sessions').insert([
        {
          user_id: user.id,
          token,
          expires_at,
          ip_address: 'client', // Would be server IP in real implementation
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        },
      ]);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet_address: user.wallet_address,
        status: user.status,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        wallet_address: data.wallet_address,
        status: data.status,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(id: string, updates: Partial<AuthUser>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          email: updates.email,
          wallet_address: updates.wallet_address,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        wallet_address: data.wallet_address,
        status: data.status,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error instanceof Error ? error.message : 'Update failed');
    }
  }

  /**
   * Logout user (revoke session)
   */
  async logout(userId: string) {
    try {
      await supabase
        .from('sessions')
        .delete()
        .eq('user_id', userId);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
