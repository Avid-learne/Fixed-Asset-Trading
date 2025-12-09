// ============================================================================
// PATIENT TYPES - Fixed Asset Trading Platform
// ============================================================================
// This file contains all patient-related types organized in logical tables

// ============================================================================
// TABLE 1: CORE PATIENT INFORMATION
// ============================================================================

export interface PatientProfile {
  // Identity
  id: string
  registrationId: string
  fullName: string
  email: string
  phone: string
  
  // Personal Details
  dateOfBirth: string
  bloodGroup?: string
  address?: string
  location?: string
  avatar?: string
  bio?: string
  
  // Account Status
  status: PatientStatus
  profileCompletion: number
  memberSince: string
  
  // Blockchain
  walletAddress?: string
  
  // Timestamps
  createdAt: string
  updatedAt?: string
}

export type PatientStatus = 
  | 'active' 
  | 'inactive' 
  | 'suspended' 
  | 'Verified Patient'
  | 'Pending Verification'

// ============================================================================
// TABLE 2: KYC & DOCUMENT VERIFICATION
// ============================================================================

export interface Document {
  id: string
  name: string
  type: DocumentType
  status: DocumentStatus
  fileUrl?: string
  uploadedAt?: string
  verifiedAt?: string
  rejectionReason?: string
}

export type DocumentType = 
  | 'identity' 
  | 'address' 
  | 'financial' 
  | 'asset'
  | 'subscription'

export type DocumentStatus = 
  | 'pending' 
  | 'verified' 
  | 'rejected' 
  | 'not_submitted'

export interface KYCData {
  status: KYCStatus
  identityDocs: Document[]
  addressDocs: Document[]
  completionPercentage: number
  submittedAt?: string
  verifiedAt?: string
  rejectionReason?: string
}

export type KYCStatus = 
  | 'not_submitted' 
  | 'pending' 
  | 'verified' 
  | 'rejected'
  | 'incomplete'

// ============================================================================
// TABLE 3: ASSET DEPOSITS & REQUESTS
// ============================================================================

export interface AssetDeposit {
  // Identification
  id: string
  patientId: string
  
  // Asset Details
  assetType: AssetType
  assetValue: number
  weight: number
  
  // Status & Processing
  status: AssetRequestStatus
  submittedAt: string
  approvedAt?: string
  rejectedAt?: string
  processedAt?: string
  rejectionReason?: string
  
  // Associated Data
  hospitalId?: string
  hospitalName?: string
  tokenAmount?: number
  documentUrls?: string[]
  documents?: Document[]
  remarks?: string
}

export type AssetType = 'gold' | 'silver' | ''

export type AssetRequestStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'processing'
  | 'verified'

// ============================================================================
// TABLE 4: TOKENS & BALANCES
// ============================================================================

export interface PatientTokenBalance {
  // Token Balances
  assetToken: number
  healthToken: number
  
  // Locked Tokens
  lockedAssetToken?: number
  lockedHealthToken?: number
  
  // Metadata
  lastUpdated: string
}

export type TokenType = 'AT' | 'HT' | 'asset' | 'health'

// ============================================================================
// TABLE 5: TRANSACTIONS
// ============================================================================

export interface Transaction {
  // Identification
  id: string
  date: string
  
  // Transaction Details
  type: TransactionType
  amount: number
  token: TokenType
  status: TransactionStatus
  description?: string
  
  // Blockchain
  txHash?: string
  from?: string
  to?: string
}

export type TransactionType =
  | 'Deposit'
  | 'Redeem'
  | 'Transfer'
  | 'Reward'
  | 'Purchase'
  | 'Mint'
  | 'Trade'

export type TransactionStatus = 
  | 'success' 
  | 'pending' 
  | 'failed' 
  | 'cancelled'

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

// ============================================================================
// TABLE 6: HEALTH BENEFITS & MARKETPLACE
// ============================================================================

export interface HealthBenefit {
  // Identification
  id: string
  name: string
  description: string
  
  // Classification
  category: BenefitCategory
  
  // Pricing
  tokenCost: number
  htCost?: number
  
  // Availability
  available: boolean
  provider?: string
  
  // Ratings & Reviews
  rating?: number
  reviews?: number
  
  // Additional Info
  imageUrl?: string
  terms?: string
  expiresAt?: string
}

export type BenefitCategory = 
  | 'healthcare' 
  | 'dental' 
  | 'vision' 
  | 'pharmacy' 
  | 'wellness' 
  | 'mental_health'

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

export type RedemptionStatus = 
  | 'pending' 
  | 'approved' 
  | 'completed' 
  | 'rejected'

// ============================================================================
// TABLE 7: SUBSCRIPTIONS & PAYMENTS
// ============================================================================

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

export type SubscriptionPlanType = 
  | 'Basic' 
  | 'Premium' 
  | 'Enterprise'
  | 'Starter'
  | 'Professional'

export type SubscriptionStatus = 
  | 'active' 
  | 'pending' 
  | 'expired' 
  | 'cancelled'
  | 'trial'

export interface PaymentHistory {
  id: string
  date: string
  amount: number
  status: PaymentStatus
  plan: string
  paymentMethod?: string
  invoiceUrl?: string
}

export type PaymentStatus = 
  | 'paid' 
  | 'pending' 
  | 'failed' 
  | 'refunded'

// ============================================================================
// TABLE 8: NOTIFICATIONS & ACTIVITY
// ============================================================================

export interface Notification {
  id: string
  message: string
  type: NotificationType
  time: string
  read?: boolean
  link?: string
  title?: string
}

export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error'

export interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  status?: string
  metadata?: Record<string, any>
}

// ============================================================================
// TABLE 9: SECURITY & LOGIN
// ============================================================================

export interface LoginLog {
  id: string
  timestamp: string
  ip: string
  device: string
  location: string
  status: LoginStatus
  userAgent?: string
}

export type LoginStatus = 
  | 'success' 
  | 'failed' 
  | 'challenge'

export interface SecuritySettings {
  twoFactorEnabled: boolean
  loginNotifications: boolean
  transactionAlerts: boolean
  emailVerified: boolean
  phoneVerified: boolean
}

// ============================================================================
// TABLE 10: DASHBOARD & ANALYTICS
// ============================================================================

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

// ============================================================================
// TABLE 11: WALLET & BLOCKCHAIN
// ============================================================================

export interface WalletInfo {
  address: string
  balance: number
  network: string
  connected: boolean
  provider?: string
}

// ============================================================================
// TABLE 12: HOSPITAL SELECTION
// ============================================================================

export interface Hospital {
  id: string
  name: string
  address: string
  contactNumber?: string
  rating?: number
  verified: boolean
}

// ============================================================================
// TABLE 13: API REQUEST/RESPONSE TYPES
// ============================================================================

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

// ============================================================================
// TABLE 14: FORM STATES
// ============================================================================

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

// ============================================================================
// TABLE 15: FILTERS & PAGINATION
// ============================================================================

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

// ============================================================================
// TABLE 16: ERROR HANDLING
// ============================================================================

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

// ============================================================================
// TABLE 17: COMPREHENSIVE PATIENT METADATA
// ============================================================================

export interface PatientMetadata {
  // ===== PERSONAL INFORMATION =====
  patientId: string
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  bloodGroup?: string
  address?: string
  city?: string
  country?: string
  
  // ===== ACCOUNT INFORMATION =====
  registrationDate: string
  membershipTier: 'basic' | 'silver' | 'gold' | 'platinum'
  accountStatus: PatientStatus
  kycStatus: KYCStatus
  kycVerifiedAt?: string
  profileCompletionPercentage: number
  
  // ===== WALLET & BLOCKCHAIN =====
  walletAddress?: string
  walletConnected: boolean
  blockchainNetwork?: string
  
  // ===== ASSET TOKENS (AT) =====
  totalATBalance: number
  totalATMinted: number
  totalATRedeemed: number
  totalATInTrading: number
  totalATAvailable: number
  
  // ===== HEALTH TOKENS (HT) =====
  totalHTBalance: number
  totalHTEarned: number
  totalHTSpent: number
  totalHTExpired: number
  
  // ===== ASSET DEPOSITS =====
  totalGoldDeposited: number // grams
  totalSilverDeposited: number // grams
  totalDepositValue: number // PKR
  totalDeposits: number
  pendingDeposits: number
  approvedDeposits: number
  rejectedDeposits: number
  
  // ===== SUBSCRIPTION =====
  hasActiveSubscription: boolean
  subscriptionPlan?: 'monthly' | 'quarterly' | 'annual'
  subscriptionStartDate?: string
  subscriptionEndDate?: string
  subscriptionAmount?: number
  totalSubscriptionPaid: number
  
  // ===== TRADING & PROFITS =====
  totalProfitEarned: number // PKR
  totalProfitWithdrawn: number
  availableProfit: number
  averageMonthlyProfit: number
  totalTradingDays: number
  
  // ===== TRANSACTIONS =====
  totalTransactions: number
  lastTransactionDate?: string
  totalDepositsCount: number
  totalWithdrawalsCount: number
  totalTrades: number
  
  // ===== HEALTHCARE USAGE =====
  totalHospitalVisits: number
  lastVisitDate?: string
  preferredHospital?: string
  preferredHospitalId?: string
  totalHTSpentOnServices: number
  
  // ===== DOCUMENTS & VERIFICATION =====
  totalDocumentsUploaded: number
  verifiedDocuments: number
  pendingDocuments: number
  rejectedDocuments: number
  
  // ===== ACTIVITY & NOTIFICATIONS =====
  unreadNotifications: number
  lastLoginDate?: string
  lastActivityDate?: string
  
  // ===== FINANCIAL SUMMARY =====
  totalAssetWorth: number // PKR - Current value of all assets
  netWorth: number // PKR - Total assets + tokens + profits
  monthlyAverageDeposit: number
  yearlyGrowthRate: number // Percentage
  
  // ===== RISK & COMPLIANCE =====
  riskScore?: number // 0-100
  complianceStatus: 'compliant' | 'flagged' | 'under_review'
  flaggedTransactions: number
  lastAuditDate?: string
  
  // ===== PREFERENCES =====
  languagePreference?: string
  currencyPreference?: string
  notificationPreferences?: {
    email: boolean
    sms: boolean
    push: boolean
  }
  
  // ===== TIMESTAMPS =====
  createdAt: string
  updatedAt: string
  lastModifiedBy?: string
}
