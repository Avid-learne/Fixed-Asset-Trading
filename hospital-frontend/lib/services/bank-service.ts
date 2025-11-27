// hospital-frontend/lib/services/bank-service.ts
import { supabase } from '@/lib/supabase';

export interface BankStaff {
  id: string;
  user_id: string;
  employee_id: string;
  department: string;
  position: string;
}

export interface MintingRequest {
  id: string;
  deposit_id: string;
  patient_id: string;
  verified_value: number;
  tokens_to_mint: number;
  status: 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
  verified_at?: string;
  approved_at?: string;
  created_at: string;
}

export interface TokenLedger {
  id: string;
  token_holder: string;
  balance: number;
  token_symbol: string;
  status: string;
  blockchain_address?: string;
  last_transaction_at?: string;
}

class BankService {
  /**
   * Get bank staff info
   */
  async getBankStaffInfo(userId: string): Promise<BankStaff | null> {
    try {
      const { data, error } = await supabase
        .from('bank_staff')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching bank staff info:', error);
      return null;
    }
  }

  /**
   * Get all minting requests
   */
  async getMintingRequests(status?: string) {
    try {
      let query = supabase
        .from('asset_verifications')
        .select(`
          *,
          deposit:asset_deposits(
            id,
            deposit_id,
            patient_id,
            asset_type,
            quantity,
            estimated_value,
            status,
            created_at
          ),
          patient:patients(
            id,
            user_id
          )
        `);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching minting requests:', error);
      return [];
    }
  }

  /**
   * Verify asset and create minting request
   */
  async verifyAsset(
    depositId: string,
    verificationData: {
      verified_value: number;
      tokens_to_mint: number;
      notes?: string;
      ipfs_hash?: string;
    },
    verifiedById: string
  ) {
    try {
      const { data, error } = await supabase
        .from('asset_verifications')
        .insert([
          {
            deposit_id: depositId,
            verified_by_id: verifiedById,
            verified_value: verificationData.verified_value,
            tokens_to_mint: verificationData.tokens_to_mint,
            notes: verificationData.notes,
            ipfs_hash: verificationData.ipfs_hash,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update deposit status
      await supabase
        .from('asset_deposits')
        .update({ status: 'VERIFIED' })
        .eq('id', depositId);

      return data;
    } catch (error) {
      console.error('Error verifying asset:', error);
      throw error;
    }
  }

  /**
   * Approve minting request
   */
  async approveMinting(verificationId: string, approvedById: string) {
    try {
      const { data, error } = await supabase
        .from('asset_verifications')
        .update({
          approved_at: new Date().toISOString(),
          status: 'APPROVED',
        })
        .eq('id', verificationId)
        .select()
        .single();

      if (error) throw error;

      // Mint tokens
      const verification = data;
      
      // Get the deposit_id from verification
      const { data: verificationData, error: verError } = await supabase
        .from('asset_verifications')
        .select('deposit_id')
        .eq('id', verificationId)
        .single();

      if (!verError && verificationData) {
        // Update deposit to MINTED
        await supabase
          .from('asset_deposits')
          .update({ status: 'MINTED' })
          .eq('id', (verificationData as any).deposit_id);

        // Create asset token
        await supabase
          .from('asset_tokens')
          .insert([
            {
              deposit_id: (verificationData as any).deposit_id,
              patient_id: (data as any).patient_id,
              balance: (verification as any).tokens_to_mint,
              token_symbol: 'HBT',
              status: 'ACTIVE',
              created_at: new Date().toISOString(),
            },
          ]);
      }

      return data;
    } catch (error) {
      console.error('Error approving minting:', error);
      throw error;
    }
  }

  /**
   * Reject minting request
   */
  async rejectMinting(verificationId: string, reason: string) {
    try {
      const { data, error } = await supabase
        .from('asset_verifications')
        .update({
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
          status: 'REJECTED',
        })
        .eq('id', verificationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error rejecting minting:', error);
      throw error;
    }
  }

  /**
   * Get token ledger
   */
  async getTokenLedger() {
    try {
      const { data, error } = await supabase
        .from('asset_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching token ledger:', error);
      return [];
    }
  }

  /**
   * Get insurance policies
   */
  async getInsurancePolicies(status?: string) {
    try {
      let query = supabase
        .from('insurance_policies')
        .select(`
          *,
          hospital:hospitals(
            id,
            name,
            address,
            contact_email
          )
        `);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching insurance policies:', error);
      return [];
    }
  }

  /**
   * Get insurance claims
   */
  async getInsuranceClaims(status?: string) {
    try {
      let query = supabase
        .from('insurance_claims')
        .select(`
          *,
          policy:insurance_policies(
            id,
            policy_number,
            hospital_id
          ),
          patient:patients(
            id,
            user_id
          )
        `);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching insurance claims:', error);
      return [];
    }
  }

  /**
   * Create insurance policy
   */
  async createInsurancePolicy(policyData: any) {
    try {
      const { data, error } = await supabase
        .from('insurance_policies')
        .insert([
          {
            ...policyData,
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating insurance policy:', error);
      throw error;
    }
  }

  /**
   * Get bank dashboard stats
   */
  async getDashboardStats() {
    try {
      const [minting, tokens, insurance] = await Promise.all([
        supabase
          .from('asset_verifications')
          .select('id')
          .eq('status', 'PENDING'),
        supabase
          .from('asset_tokens')
          .select('balance')
          .eq('status', 'ACTIVE'),
        supabase
          .from('insurance_policies')
          .select('coverage_amount')
          .eq('status', 'ACTIVE'),
      ]);

      const totalTokens = tokens.data?.reduce((sum: number, t: any) => sum + (t.balance || 0), 0) || 0;
      const totalInsurance = insurance.data?.reduce((sum: number, i: any) => sum + (i.coverage_amount || 0), 0) || 0;

      return {
        totalValueUnderManagement: totalTokens.toString(),
        activeMintRequests: minting.data?.length || 0,
        tokensIssued: totalTokens,
        insuranceReserveBalance: totalInsurance.toFixed(2),
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalValueUnderManagement: '0',
        activeMintRequests: 0,
        tokensIssued: 0,
        insuranceReserveBalance: '0',
      };
    }
  }
}

export const bankService = new BankService();
