// hospital-frontend/lib/services/patient-service.ts
import { supabase } from '@/lib/supabase';

export interface PatientProfile {
  id: string;
  user_id: string;
  date_of_birth?: string;
  phone_number?: string;
  address?: string;
  emergency_contact?: Record<string, any>;
  medical_history?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AssetDeposit {
  id: string;
  deposit_id: number;
  patient_id: string;
  asset_type: string;
  quantity: number;
  unit: string;
  estimated_value: number;
  description: string;
  status: 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'MINTED';
  tx_hash?: string;
  created_at: string;
  updated_at: string;
}

class PatientService {
  /**
   * Get or create patient profile
   */
  async getOrCreateProfile(userId: string): Promise<PatientProfile> {
    try {
      // Try to get existing profile
      const { data: existing } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) return existing;

      // Create new profile
      const { data: newProfile, error } = await supabase
        .from('patients')
        .insert([
          {
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return newProfile;
    } catch (error) {
      console.error('Error getting/creating patient profile:', error);
      throw error;
    }
  }

  /**
   * Update patient profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<PatientProfile>
  ): Promise<PatientProfile> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update({
          date_of_birth: updates.date_of_birth,
          phone_number: updates.phone_number,
          address: updates.address,
          emergency_contact: updates.emergency_contact,
          medical_history: updates.medical_history,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating patient profile:', error);
      throw error;
    }
  }

  /**
   * Get all assets for patient
   */
  async getAssets(patientId: string): Promise<AssetDeposit[]> {
    try {
      const { data, error } = await supabase
        .from('asset_deposits')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching patient assets:', error);
      return [];
    }
  }

  /**
   * Deposit new asset
   */
  async depositAsset(
    patientId: string,
    data: Omit<AssetDeposit, 'id' | 'deposit_id' | 'patient_id' | 'tx_hash' | 'created_at' | 'updated_at'>
  ): Promise<AssetDeposit> {
    try {
      const { data: deposit, error } = await supabase
        .from('asset_deposits')
        .insert([
          {
            patient_id: patientId,
            asset_type: data.asset_type,
            quantity: data.quantity,
            unit: data.unit,
            estimated_value: data.estimated_value,
            description: data.description,
            status: 'PENDING',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return deposit;
    } catch (error) {
      console.error('Error depositing asset:', error);
      throw error;
    }
  }

  /**
   * Get asset tokens for patient
   */
  async getTokens(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('asset_tokens')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching patient tokens:', error);
      return [];
    }
  }

  /**
   * Get benefit redemptions for patient
   */
  async getRedemptions(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('benefit_redemptions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching redemptions:', error);
      return [];
    }
  }

  /**
   * Redeem benefits
   */
  async redeemBenefit(
    patientId: string,
    benefit_type: string,
    amount: number,
    notes?: string
  ) {
    try {
      const { data, error } = await supabase
        .from('benefit_redemptions')
        .insert([
          {
            patient_id: patientId,
            benefit_type,
            amount,
            notes,
            status: 'PENDING',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error redeeming benefit:', error);
      throw error;
    }
  }

  /**
   * Get patient dashboard statistics
   */
  async getDashboardStats(patientId: string) {
    try {
      const [deposits, tokens, redemptions] = await Promise.all([
        supabase
          .from('asset_deposits')
          .select('estimated_value')
          .eq('patient_id', patientId),
        supabase
          .from('asset_tokens')
          .select('balance')
          .eq('patient_id', patientId),
        supabase
          .from('benefit_redemptions')
          .select('amount')
          .eq('patient_id', patientId)
          .eq('status', 'COMPLETED'),
      ]);

      const totalAssets = deposits.data?.reduce((sum, d: any) => sum + (d.estimated_value || 0), 0) || 0;
      const totalTokens = tokens.data?.reduce((sum, t: any) => sum + (t.balance || 0), 0) || 0;
      const totalRedeemed = redemptions.data?.reduce((sum, r: any) => sum + (r.amount || 0), 0) || 0;

      return {
        totalAssets: totalAssets.toFixed(2),
        activeTokens: totalTokens,
        benefitsRedeemed: totalRedeemed.toFixed(2),
        pendingApprovals: deposits.data?.filter((d: any) => d.status === 'PENDING').length || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalAssets: '0',
        activeTokens: 0,
        benefitsRedeemed: '0',
        pendingApprovals: 0,
      };
    }
  }
}

export const patientService = new PatientService();
