// hospital-frontend/lib/db-operations.ts
import { supabase, supabaseAdmin } from './supabase';

// Patient operations
export const PatientDB = {
  async create(data: any) {
    const { data: result, error } = await supabase
      .from('patients')
      .insert([data])
      .select();
    if (error) throw error;
    return result?.[0];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async update(id: string, data: any) {
    const { data: result, error } = await supabase
      .from('patients')
      .update(data)
      .eq('id', id)
      .select();
    if (error) throw error;
    return result?.[0];
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
};

// Hospital operations
export const HospitalDB = {
  async create(data: any) {
    const { data: result, error } = await supabase
      .from('hospitals')
      .insert([data])
      .select();
    if (error) throw error;
    return result?.[0];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async update(id: string, data: any) {
    const { data: result, error } = await supabase
      .from('hospitals')
      .update(data)
      .eq('id', id)
      .select();
    if (error) throw error;
    return result?.[0];
  },
};

// Bank operations
export const BankDB = {
  async create(data: any) {
    const { data: result, error } = await supabase
      .from('banks')
      .insert([data])
      .select();
    if (error) throw error;
    return result?.[0];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};

// Minting requests operations
export const MintingRequestDB = {
  async create(data: any) {
    const { data: result, error } = await supabase
      .from('minting_requests')
      .insert([data])
      .select();
    if (error) throw error;
    return result?.[0];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('minting_requests')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getAll(filters?: any) {
    let query = supabase.from('minting_requests').select('*');
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async update(id: string, data: any) {
    const { data: result, error } = await supabase
      .from('minting_requests')
      .update(data)
      .eq('id', id)
      .select();
    if (error) throw error;
    return result?.[0];
  },
};

// Transactions operations
export const TransactionDB = {
  async create(data: any) {
    const { data: result, error } = await supabase
      .from('transactions')
      .insert([data])
      .select();
    if (error) throw error;
    return result?.[0];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};

// Assets operations
export const AssetDB = {
  async create(data: any) {
    const { data: result, error } = await supabase
      .from('assets')
      .insert([data])
      .select();
    if (error) throw error;
    return result?.[0];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByPatientId(patientId: string) {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async update(id: string, data: any) {
    const { data: result, error } = await supabase
      .from('assets')
      .update(data)
      .eq('id', id)
      .select();
    if (error) throw error;
    return result?.[0];
  },
};
