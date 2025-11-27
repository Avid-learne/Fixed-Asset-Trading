// hospital-frontend/types/index.ts

export interface User {
  id: string;
  address: string;
  role: 'patient' | 'bank' | 'hospital';
  name?: string;
  createdAt: number;
}

export interface Session {
  userId: string;
  address: string;
  role: 'patient' | 'bank' | 'hospital';
  name?: string;
  timestamp: number;
}

export interface DepositRequest {
  id: number;
  patientAddress: string;
  assetDescription: string;
  estimatedValue: string;
  status: 'pending' | 'approved' | 'rejected';
  depositId?: number;
  metadata?: string;
  createdAt: number;
}

export interface TradeRecord {
  id: string;
  tradeId: number;
  investedAT: string;
  profitEarned: string;
  date: string;
  status: string;
}

export interface BenefitRedemption {
  id: string;
  patientAddress: string;
  amountHT: string;
  serviceType: string;
  timestamp: number;
}

export * from './contracts';