// hospital-frontend/lib/services/hospital-service.ts
import { supabase } from '@/lib/supabase';

export interface HospitalInfo {
  id: string;
  name: string;
  address: string;
  wallet_address: string;
  license_number: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface AssetRequest {
  id: string;
  hospital_id: string;
  patient_id: string;
  deposit_id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approval_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TradeRecord {
  id: string;
  hospital_id: string;
  asset_id: string;
  quantity: number;
  price_per_unit: number;
  total_value: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DISTRIBUTED' | 'FAILED';
  created_at: string;
  updated_at: string;
}

class HospitalService {
  /**
   * Get hospital info by user ID
   */
  async getHospitalInfo(userId: string): Promise<HospitalInfo | null> {
    try {
      // First get the hospital staff record
      const { data: staff } = await supabase
        .from('hospital_staff')
        .select('hospital_id')
        .eq('user_id', userId)
        .single();

      if (!staff) return null;

      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('id', staff.hospital_id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching hospital info:', error);
      return null;
    }
  }

  /**
   * Get all patients for hospital
   */
  async getPatients(hospitalId: string) {
    try {
      const { data, error } = await supabase
        .from('asset_requests')
        .select(
          `
          *,
          patient:patients(
            id,
            user_id,
            phone_number,
            address
          ),
          deposit:asset_deposits(*)
        `
        )
        .eq('hospital_id', hospitalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching hospital patients:', error);
      return [];
    }
  }

  /**
   * Get asset requests for hospital
   */
  async getAssetRequests(hospitalId: string, status?: string) {
    try {
      let query = supabase
        .from('asset_requests')
        .select(`
          *,
          deposit:asset_deposits(*),
          patient:patients(
            id,
            user_id,
            phone_number
          )
        `)
        .eq('hospital_id', hospitalId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching asset requests:', error);
      return [];
    }
  }

  /**
   * Approve asset request
   */
  async approveAssetRequest(requestId: string, notes?: string) {
    try {
      const { data, error } = await supabase
        .from('asset_requests')
        .update({
          status: 'APPROVED',
          approval_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  }

  /**
   * Reject asset request
   */
  async rejectAssetRequest(requestId: string, reason: string) {
    try {
      const { data, error } = await supabase
        .from('asset_requests')
        .update({
          status: 'REJECTED',
          approval_notes: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  }

  /**
   * Create trade record
   */
  async createTrade(hospitalId: string, tradeData: Omit<TradeRecord, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('trades')
        .insert([
          {
            hospital_id: hospitalId,
            asset_id: tradeData.asset_id,
            quantity: tradeData.quantity,
            price_per_unit: tradeData.price_per_unit,
            total_value: tradeData.total_value,
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
      console.error('Error creating trade:', error);
      throw error;
    }
  }

  /**
   * Get trades for hospital
   */
  async getTrades(hospitalId: string) {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('hospital_id', hospitalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trades:', error);
      return [];
    }
  }

  /**
   * Allocate benefits
   */
  async allocateBenefits(hospitalId: string, allocationData: any) {
    try {
      const { data, error } = await supabase
        .from('benefit_allocations')
        .insert([
          {
            hospital_id: hospitalId,
            total_amount: allocationData.total_amount,
            distribution_date: allocationData.distribution_date,
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
      console.error('Error allocating benefits:', error);
      throw error;
    }
  }

  /**
   * Get hospital dashboard stats
   */
  async getDashboardStats(hospitalId: string) {
    try {
      const [patients, trades, pendingRequests] = await Promise.all([
        supabase
          .from('asset_requests')
          .select('id')
          .eq('hospital_id', hospitalId),
        supabase
          .from('trades')
          .select('total_value')
          .eq('hospital_id', hospitalId)
          .eq('status', 'COMPLETED'),
        supabase
          .from('asset_requests')
          .select('id')
          .eq('hospital_id', hospitalId)
          .eq('status', 'PENDING'),
      ]);

      const totalTradeValue = trades.data?.reduce((sum: number, t: any) => sum + (t.total_value || 0), 0) || 0;

      return {
        activePatients: patients.data?.length || 0,
        totalTradeValue: totalTradeValue.toFixed(2),
        pendingApprovals: pendingRequests.data?.length || 0,
        requestsProcessed: (patients.data?.length || 0) - (pendingRequests.data?.length || 0),
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        activePatients: 0,
        totalTradeValue: '0',
        pendingApprovals: 0,
        requestsProcessed: 0,
      };
    }
  }
}

export const hospitalService = new HospitalService();
