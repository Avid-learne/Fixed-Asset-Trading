// src/types/index.ts

export enum UserRole {
  PATIENT = 'Patient',
  HOSPITAL_STAFF = 'Hospital_Staff',
  HOSPITAL_ADMIN = 'Hospital_Admin',
  BANK_OFFICER = 'Bank_Officer',
  SUPER_ADMIN = 'Super_Admin',
}

export enum DepositStatus {
  SUBMITTED = 'Submitted',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  TOKENS_MINTED = 'Tokens_Minted',
}

export enum TransactionType {
  DEPOSIT = 'Deposit',
  MINT = 'Mint',
  TRADE = 'Trade',
  REDEEM = 'Redeem',
  TRANSFER = 'Transfer',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  lastLogin?: string;
  mfaEnabled: boolean;
}

export interface Asset {
  id: string;
  patientId: string;
  assetType: string;
  assetName: string;
  description: string;
  estimatedValue: number;
  status: DepositStatus;
  documentUrl?: string;
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  approvedBy?: string;
  tokensGenerated?: number;
}

export interface TokenBalance {
  userId: string;
  totalTokens: number;
  availableTokens: number;
  lockedTokens: number;
  lastUpdated: string;
}

export interface TokenHistory {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balance: number;
  description: string;
  timestamp: string;
  relatedAssetId?: string;
}

export interface Benefit {
  id: string;
  name: string;
  description: string;
  tokenCost: number;
  category: string;
  available: boolean;
  expiresAt?: string;
  terms: string;
  imageUrl?: string;
}

export interface BenefitRedemption {
  id: string;
  userId: string;
  benefitId: string;
  tokenSpent: number;
  status: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
  redeemedAt: string;
  completedAt?: string;
}

export interface TradingSession {
  id: string;
  hospitalId: string;
  assetId: string;
  initialValue: number;
  finalValue: number;
  profit: number;
  duration: number;
  status: 'Running' | 'Completed' | 'Failed';
  startedAt: string;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface DashboardStats {
  totalAssets: number;
  totalTokens: number;
  pendingDeposits: number;
  activePatients: number;
  totalTradeValue: number;
  monthlyGrowth: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PatientProfile {
  user: User;
  tokenBalance: TokenBalance;
  totalDeposits: number;
  totalBenefitsRedeemed: number;
  memberSince: string;
  recentActivity: TokenHistory[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}