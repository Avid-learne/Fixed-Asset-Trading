// Patient-specific types for Fixed Asset Trading Platform
// This file contains all patient-related types, interfaces, and enums used across the frontend

// ===== Patient Profile & Personal Information =====

export interface PatientProfile {
  id: string
  registrationId: string
  fullName: string
  email: string
  phone: string
  address?: string
  location?: string
  dateOfBirth: string
  bloodGroup?: string
  avatar?: string
  walletAddress?: string
  bio?: string
  status: PatientStatus
  profileCompletion: number
  memberSince: string
  createdAt: string
  updatedAt?: string
}

export type PatientStatus = 
  | 'active' 
  | 'inactive' 
  | 'suspended' 
  | 'Verified Patient'
  | 'Pending Verification'

// ===== KYC & Document Verification =====

export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'not_submitted'

export type DocumentType = 
  | 'identity' 
  | 'address' 
  | 'financial' 
  | 'asset'
  | 'subscription'

export interface Document {
  id: string
  name: string
  type: DocumentType
  status: DocumentStatus
  uploadedAt?: string
  verifiedAt?: string
  fileUrl?: string
  rejectionReason?: string
}

export type KYCStatus = 
  | 'not_submitted' 
  | 'pending' 
  | 'verified' 
  | 'rejected'
  | 'incomplete'

export interface KYCData {
  status: KYCStatus
  identityDocs: Document[]
  addressDocs: Document[]
  completionPercentage: number
  submittedAt?: string
  verifiedAt?: string
  rejectionReason?: string
}

// ===== Asset Deposits =====

export type AssetType = 'gold' | 'silver' | ''

export type AssetRequestStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'processing'
  | 'verified'

export interface AssetRequest {
  id: string
  assetType: AssetType
  amount: number
  weight?: number
  status: AssetRequestStatus
  submittedAt: string
  processedAt?: string
  documents: Document[]
  remarks?: string
  hospitalId?: string
  hospitalName?: string
  tokenAmount?: number
}

export interface AssetDeposit {
  id: string
  patientId: string
  assetType: AssetType
  assetValue: number
  weight: number
  status: string
  submittedAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  hospitalId?: string
  documentUrls?: string[]
}

// ===== Token Balances & Transactions =====

export interface PatientTokenBalance {
  assetToken: number
  healthToken: number
  lockedAssetToken?: number
  lockedHealthToken?: number
  lastUpdated: string
}

export type TokenType = 'AT' | 'HT' | 'asset' | 'health'

export type TransactionStatus = 'success' | 'pending' | 'failed' | 'cancelled'

export type TransactionType =
  | 'Deposit'
  | 'Redeem'
  | 'Transfer'
  | 'Reward'
  | 'Purchase'
  | 'Mint'
  | 'Trade'

export interface Transaction {
  id: string
  date: string
  type: TransactionType
  amount: number
  token: TokenType
  status: TransactionStatus
  description?: string
  txHash?: string
  from?: string
  to?: string
}

export interface TokenTransaction {
  id: string
  patientId: string
  type: TransactionType
  amount: number
  tokenType: TokenType
  balance: number
  description: string
  timestamp: string
  txHash?: string
}

// ===== Health Benefits & Marketplace =====

export type BenefitCategory = 
  | 'healthcare' 
  | 'dental' 
  | 'vision' 
  | 'pharmacy' 
  | 'wellness' 
  | 'mental_health'

export interface HealthBenefit {
  id: string
  name: string
  description: string
  category: BenefitCategory
  tokenCost: number
  htCost?: number
  available: boolean
  provider?: string
  rating?: number
  reviews?: number
  imageUrl?: string
  terms?: string
  expiresAt?: string
}

export interface MarketItem {
  id: string
  name: string
  category: BenefitCategory
  price: number
  priceChange24h: number
  volume24h: number
  description: string
  provider: string
  rating: number
  reviews: number
  trending?: boolean
  new?: boolean
  popular?: boolean
}

export type RedemptionStatus = 'pending' | 'approved' | 'completed' | 'rejected'

export interface BenefitRedemption {
  id: string
  patientId: string
  benefitId: string
  benefitName: string
  tokenSpent: number
  status: RedemptionStatus
  redeemedAt: string
  completedAt?: string
  notes?: string
}

// ===== Subscriptions & Plans =====

export type SubscriptionStatus = 
  | 'active' 
  | 'pending' 
  | 'expired' 
  | 'cancelled'
  | 'trial'

export type SubscriptionPlanType = 
  | 'Basic' 
  | 'Premium' 
  | 'Enterprise'
  | 'Starter'
  | 'Professional'

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  billingCycle: 'monthly' | 'quarterly' | 'annually'
  features: string[]
  popular?: boolean
  recommended?: boolean
}

export interface SubscriptionRequest {
  id: string
  plan: SubscriptionPlanType
  status: SubscriptionStatus
  startDate: string
  endDate?: string
  documents: Document[]
  autoRenew?: boolean
  nextBillingDate?: string
}

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded'

export interface PaymentHistory {
  id: string
  date: string
  amount: number
  status: PaymentStatus
  plan: string
  paymentMethod?: string
  invoiceUrl?: string
}

// ===== Notifications & Activity =====

export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error'

export interface Notification {
  id: string
  message: string
  type: NotificationType
  time: string
  read?: boolean
  link?: string
  title?: string
}

export interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  status?: string
  metadata?: Record<string, any>
}

// ===== Login & Security =====

export type LoginStatus = 'success' | 'failed' | 'challenge'

export interface LoginLog {
  id: string
  timestamp: string
  ip: string
  device: string
  location: string
  status: LoginStatus
  userAgent?: string
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  loginNotifications: boolean
  transactionAlerts: boolean
  emailVerified: boolean
  phoneVerified: boolean
}

// ===== Dashboard Data =====

export interface DashboardData {
  assetTokenBalance: number
  healthTokenBalance: number
  totalDeposits: number
  pendingRedemptions: number
  kycStatus: KYCStatus
  recentTransactions: Transaction[]
  notifications: Notification[]
  profileCompletion: number
}

export interface DashboardStats {
  totalAssetValue: number
  totalHealthBenefits: number
  monthlyActivity: number
  accountAge: number
  totalRedemptions: number
  pendingVerifications: number
}

// ===== API Request/Response Types =====

export interface DepositRequest {
  patientId: string
  assetType: AssetType
  assetValue: number
  weight: number
  hospitalId: string
  documentUrls?: string[]
}

export interface DepositResponse {
  success: boolean
  depositId: string
  status: string
  message: string
  estimatedTokens?: number
}

export interface RedemptionRequest {
  patientId: string
  benefitId: string
  serviceType: string
  htAmount: number
}

export interface RedemptionResponse {
  success: boolean
  redemptionId: string
  status: string
  message: string
  remainingBalance?: number
}

export interface TokenBalanceDTO {
  patientId: string
  assetTokenBalance: number
  healthTokenBalance: number
  totalValue: number
  lastUpdated: string
}

// ===== Chart & Analytics =====

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
  category?: string
}

export interface TokenChartData {
  assetToken: ChartDataPoint[]
  healthToken: ChartDataPoint[]
}

// ===== Form States =====

export interface ProfileFormState {
  fullName: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  bloodGroup: string
}

export interface DepositFormState {
  assetType: AssetType
  weight: string
  selectedHospital: string
  selectedDocuments: File[]
}

// ===== Filters & Pagination =====

export interface PatientFilterOptions {
  search?: string
  status?: KYCStatus | PatientStatus
  dateFrom?: string
  dateTo?: string
  transactionType?: TransactionType
  tokenType?: TokenType
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface PaginatedPatientData<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ===== Wallet & Blockchain =====

export interface WalletInfo {
  address: string
  balance: number
  network: string
  connected: boolean
  provider?: string
}

export interface BlockchainTransaction {
  txHash: string
  from: string
  to: string
  value: number
  tokenType: TokenType
  timestamp: string
  blockNumber: number
  confirmations: number
  status: 'pending' | 'confirmed' | 'failed'
}

// ===== Hospital Selection =====

export interface Hospital {
  id: string
  name: string
  address: string
  contactNumber?: string
  rating?: number
  verified: boolean
}

// ===== Error & Validation =====

export interface ValidationError {
  field: string
  message: string
}

export interface PatientApiError {
  code: string
  message: string
  details?: ValidationError[]
  timestamp: string
}
