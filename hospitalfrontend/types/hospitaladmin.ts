// ============================================================================
// HOSPITAL ADMIN TYPES - Fixed Asset Trading Platform
// ============================================================================
// This file contains all hospital admin-related types organized in logical tables

// ============================================================================
// TABLE 1: HOSPITAL INFORMATION
// ============================================================================

export interface HospitalInfo {
  id: string
  name: string
  code: string
  registrationNumber: string
  address: string
  city: string
  state: string
  country: string
  contactEmail: string
  contactPhone: string
  status: HospitalStatus
  verificationStatus: 'pending' | 'verified' | 'rejected'
  createdAt: string
  updatedAt?: string
}

export type HospitalStatus = 
  | 'active' 
  | 'suspended' 
  | 'pending' 
  | 'inactive'

// ============================================================================
// TABLE 2: ADMIN ACCOUNT
// ============================================================================

export interface AdminAccount {
  adminId: string
  adminName: string
  adminEmail: string
  adminRole: AdminRole
  accountStatus: 'active' | 'suspended' | 'pending' | 'inactive'
  hospitalId: string
  registrationDate: string
  lastLoginDate?: string
  permissions: AdminPermissions
}

export type AdminRole = 
  | 'HOSPITAL_ADMIN' 
  | 'HOSPITAL_STAFF'

export interface AdminPermissions {
  canApproveDeposits: boolean
  canMintTokens: boolean
  canManageStaff: boolean
  canAccessReports: boolean
  canModifySettings: boolean
  canManageBanks: boolean
  canAllocateProfits: boolean
  canViewAuditLogs: boolean
}

// ============================================================================
// TABLE 3: PATIENT MANAGEMENT
// ============================================================================

export interface PatientRecord {
  id: string
  patientId: string
  fullName: string
  email: string
  phone: string
  kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected'
  accountStatus: 'active' | 'inactive' | 'suspended'
  registrationDate: string
  totalATBalance: number
  totalHTBalance: number
  totalDeposits: number
  lastActivity?: string
}

export interface PatientStats {
  totalPatients: number
  activePatients: number
  verifiedPatients: number
  pendingVerificationPatients: number
  suspendedPatients: number
  newPatientsThisMonth: number
  patientGrowthRate: number // Percentage
}

// ============================================================================
// TABLE 4: DEPOSIT MANAGEMENT
// ============================================================================

export interface DepositRequest {
  id: string
  depositId: string
  patientId: string
  patientName: string
  patientEmail: string
  assetType: 'gold' | 'silver'
  weight: number // grams
  assetWorth: number // PKR
  expectedTokens: number // AT tokens
  status: DepositStatus
  submittedDate: string
  processedDate?: string
  approvedBy?: string
  rejectionReason?: string
  documents: string[]
  source: 'asset' | 'subscription'
}

export type DepositStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'processing'
  | 'completed'

export interface DepositStats {
  totalDeposits: number
  pendingDeposits: number
  approvedDeposits: number
  rejectedDeposits: number
  totalDepositValue: number // PKR
  totalGoldReceived: number // grams
  totalSilverReceived: number // grams
  depositsThisMonth: number
  averageDepositValue: number
}

// ============================================================================
// TABLE 5: SUBSCRIPTION MANAGEMENT
// ============================================================================

export interface SubscriptionBatch {
  id: string
  batchId: string
  collectionPeriod: string // e.g., "November 2024"
  totalPatients: number
  totalAmount: number // PKR
  expectedTokens: number // AT tokens
  status: 'collecting' | 'ready_to_mint' | 'minted' | 'processing'
  submittedDate: string
  mintedDate?: string
  mintedBy?: string
}

export interface SubscriptionStats {
  totalActiveSubscriptions: number
  totalSubscriptionRevenue: number // PKR
  monthlySubscriptionRevenue: number
  subscriptionRenewalRate: number // Percentage
  totalSubscriptionBatches: number
  readyToMintBatches: number
  collectedSubscriptionAmount: number
}

// ============================================================================
// TABLE 6: TOKEN MINTING
// ============================================================================

export interface MintRecord {
  id: string
  depositId: string
  patientEmail: string
  patientName: string
  assetType: 'Gold' | 'Silver'
  weight: number // grams
  assetWorth: number // PKR
  tokensToMint: number // AT tokens
  status: 'pending' | 'minted' | 'failed'
  mintedDate?: string
  txHash?: string
  blockNumber?: number
  hospitalName: string
}

export interface TokenStats {
  totalATMinted: number
  totalATFromAssets: number
  totalATFromSubscriptions: number
  totalATInCirculation: number
  totalATInTrading: number
  totalATRedeemed: number
  totalHTIssued: number
  totalHTRedeemed: number
  mintingSuccessRate: number // Percentage
}

// ============================================================================
// TABLE 7: TRADING OPERATIONS
// ============================================================================

export interface AvailableToken {
  id: string
  depositId: string
  patientName: string
  assetType: 'Gold' | 'Silver' | 'Subscription'
  weight?: number // grams (for physical assets)
  atTokens: number
  source: 'asset' | 'subscription'
  mintedDate: string
  currentlyInTrading: boolean
}

export interface TradePosition {
  id: string
  tokenId: string
  patientName: string
  atTokens: number
  pool: 'asset-pool' | 'subscription-pool'
  investedValue: number // PKR
  currentValue: number
  profitLoss: number
  profitLossPercentage: number
  startDate: string
  expectedEndDate: string
  apy: number // Percentage
}

export interface TradingStats {
  totalATInTradingPools: number
  assetPoolATTokens: number
  subscriptionPoolATTokens: number
  assetPoolAPY: number // 12.5%
  subscriptionPoolAPY: number // 8.2%
  totalTradingProfit: number // PKR
  monthlyTradingProfit: number
  tradingSuccessRate: number // Percentage
  activeTradePositions: number
}

export interface PoolAllocation {
  poolName: string
  totalTokens: number
  apy: number
  allocation: number // Percentage
}

// ============================================================================
// TABLE 8: PROFIT ALLOCATION
// ============================================================================

export interface ProfitAllocation {
  id: string
  patientId: string
  patientName: string
  atTokens: number
  profitAmount: number // PKR
  allocationDate: string
  status: 'pending' | 'allocated' | 'distributed'
  poolSource: 'asset-pool' | 'subscription-pool'
}

export interface ProfitStats {
  totalProfitAllocated: number // PKR
  totalProfitDistributed: number
  pendingProfitAllocation: number
  profitAllocationThisMonth: number
  averageProfitPerPatient: number
}

// ============================================================================
// TABLE 9: STAFF MANAGEMENT
// ============================================================================

export interface StaffMember {
  id: string
  name: string
  email: string
  role: StaffRole
  department: string
  status: 'active' | 'inactive' | 'suspended'
  joinedDate: string
  lastActive?: string
  permissions: StaffPermissions
  performanceScore?: number
}

export type StaffRole = 
  | 'Admin' 
  | 'Medical Officer' 
  | 'Finance Manager' 
  | 'Clerk' 
  | 'Auditor'

export interface StaffPermissions {
  viewPatients: boolean
  approveDeposits: boolean
  mintTokens: boolean
  manageStaff: boolean
  viewReports: boolean
  modifySettings: boolean
}

export interface StaffStats {
  totalStaffMembers: number
  activeStaffMembers: number
  medicalOfficers: number
  financeManagers: number
  clerks: number
  auditors: number
  pendingInvitations: number
}

// ============================================================================
// TABLE 10: BANK INTEGRATION
// ============================================================================

export interface BankPartnership {
  id: string
  bankId: string
  bankName: string
  swiftCode: string
  status: 'active' | 'pending' | 'suspended'
  verificationStatus: 'verified' | 'pending' | 'rejected'
  partnershipDate: string
  totalTransactions: number
  complianceScore: number // 0-100
}

export interface BankStats {
  connectedBanks: number
  activeBankPartnerships: number
  totalBankTransactions: number
  bankComplianceScore: number // 0-100
  pendingBankApprovals: number
}

// ============================================================================
// TABLE 11: FINANCIAL SUMMARY
// ============================================================================

export interface FinancialSummary {
  totalRevenue: number // PKR
  monthlyRevenue: number
  yearlyRevenue: number
  totalAssetValue: number // Value of all gold/silver in vault
  totalLiabilities: number
  netAssetValue: number
  liquidityRatio: number
  monthlyGrowthRate: number // Percentage
  yearlyGrowthRate: number // Percentage
  profitMargin: number // Percentage
}

export interface RevenueBreakdown {
  tokenizationFees: number
  subscriptionRevenue: number
  tradingProfits: number
  otherRevenue: number
}

// ============================================================================
// TABLE 12: BLOCKCHAIN OPERATIONS
// ============================================================================

export interface BlockchainTransaction {
  id: string
  txHash: string
  type: 'mint' | 'transfer' | 'redeem' | 'approve'
  from: string
  to: string
  amount: number
  tokenType: 'AT' | 'HT'
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: string
  blockNumber?: number
  gasUsed?: string
  gasFee?: string
}

export interface BlockchainStats {
  totalBlockchainTransactions: number
  pendingBlockchainTxs: number
  failedBlockchainTxs: number
  totalGasFeePaid: number // in ETH/MATIC
  averageGasPrice: number
  blockchainNetwork: 'Ethereum' | 'Polygon' | 'Base' | 'Arbitrum'
  smartContractAddress: string
}

export interface BlockchainSettings {
  network: 'Ethereum' | 'Polygon' | 'Base' | 'Arbitrum'
  rpcUrl: string
  contractAddress: string
  gasLimit: number
  confirmationsRequired: number
}

// ============================================================================
// TABLE 13: COMPLIANCE & AUDIT
// ============================================================================

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  userRole: string
  action: string
  details: string
  status: 'success' | 'warning' | 'error'
  ipAddress?: string
  affectedResource?: string
}

export interface ComplianceRecord {
  id: string
  checkType: string
  status: 'passed' | 'failed' | 'pending'
  performedDate: string
  performedBy: string
  findings?: string
  remediation?: string
}

export interface ComplianceStats {
  complianceScore: number // 0-100
  totalAuditLogs: number
  criticalIssues: number
  resolvedIssues: number
  pendingReviews: number
  lastAuditDate?: string
  nextAuditDue?: string
  kycCompletionRate: number // Percentage
}

// ============================================================================
// TABLE 14: REPORTS & ANALYTICS
// ============================================================================

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'Financial' | 'Operational' | 'Compliance' | 'Custom'
  schedule?: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  format: 'PDF' | 'Excel' | 'CSV'
  parameters?: Record<string, any>
}

export interface GeneratedReport {
  id: string
  templateId: string
  templateName: string
  generatedDate: string
  generatedBy: string
  status: 'completed' | 'failed' | 'processing'
  fileUrl?: string
  fileSize?: string
}

export interface ScheduledReport {
  id: string
  templateId: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  nextRunDate: string
  lastRunDate?: string
  recipients: string[]
  enabled: boolean
}

export interface ReportStats {
  totalReportsGenerated: number
  scheduledReports: number
  lastReportGeneratedAt?: string
  totalDataExports: number
  analyticsEnabled: boolean
}

// ============================================================================
// TABLE 15: NOTIFICATIONS & ALERTS
// ============================================================================

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  priority: 'low' | 'medium' | 'high' | 'critical'
  recipient: string
  recipientRole: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  depositApproval: boolean
  mintingComplete: boolean
  profitAllocation: boolean
  lowBalance: boolean
  criticalAlerts: boolean
}

export interface AlertStats {
  unreadNotifications: number
  criticalAlerts: number
  systemWarnings: number
  pendingApprovals: number
}

// ============================================================================
// TABLE 16: SETTINGS & CONFIGURATION
// ============================================================================

export interface HospitalSettings {
  hospitalName: string
  hospitalCode: string
  contactEmail: string
  contactPhone: string
  maxDepositValue: number
  minDepositValue: number
  tokenizationFeePercent: number
}

export interface KYCSettings {
  provider: 'Manual' | 'Onfido' | 'Jumio' | 'Sumsub'
  apiKey: string
  autoApprove: boolean
  requiredDocuments: string[]
  verificationLevel: 'Basic' | 'Standard' | 'Enhanced'
}

export interface SystemConfiguration {
  tokenizationFeePercentage: number // 2.5%
  minDepositValue: number // PKR
  maxDepositValue: number // PKR
  autoApprovalEnabled: boolean
  kycProvider: 'Manual' | 'Onfido' | 'Jumio' | 'Sumsub'
  kycVerificationLevel: 'Basic' | 'Standard' | 'Enhanced'
  maintenanceMode: boolean
  twoFactorRequired: boolean
}

// ============================================================================
// TABLE 17: RISK MANAGEMENT
// ============================================================================

export interface RiskAssessment {
  riskScore: number // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  highRiskTransactions: number
  fraudulentActivitiesDetected: number
  blacklistedPatients: number
  securityIncidents: number
  lastSecurityAudit?: string
  mitigationActions?: string[]
}

export interface SecurityIncident {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detectedDate: string
  resolvedDate?: string
  status: 'detected' | 'investigating' | 'resolved' | 'mitigated'
  affectedUsers?: number
}

// ============================================================================
// TABLE 18: VAULT & STORAGE
// ============================================================================

export interface VaultInventory {
  goldVaultCapacity: number // grams
  goldCurrentlyStored: number // grams
  silverVaultCapacity: number // grams
  silverCurrentlyStored: number // grams
  vaultUtilization: number // Percentage
  insuranceCoverage: number // PKR
  lastVaultAudit?: string
  nextAuditDue?: string
}

export interface AssetValuation {
  goldPrice: number // PKR per gram
  silverPrice: number // PKR per gram
  totalGoldValue: number // PKR
  totalSilverValue: number // PKR
  totalVaultValue: number // PKR
  lastUpdated: string
}

// ============================================================================
// TABLE 19: DASHBOARD DATA
// ============================================================================

export interface DashboardOverview {
  totalPatients: number
  totalATMinted: number
  totalHTIssued: number
  totalDeposits: number
  pendingApprovals: number
  monthlyRevenue: number
  monthlyGrowth: number // Percentage
  activeTradePositions: number
}

export interface DashboardChartData {
  date: string
  patients: number
  revenue: number
  deposits: number
  tokensMinted: number
}

// ============================================================================
// TABLE 20: COMPREHENSIVE METADATA
// ============================================================================

export interface HospitalAdminMetadata {
  // ===== HOSPITAL INFORMATION =====
  hospitalId: string
  hospitalName: string
  hospitalCode: string
  registrationNumber: string
  hospitalAddress: string
  city: string
  state: string
  country: string
  contactEmail: string
  contactPhone: string
  
  // ===== ADMIN ACCOUNT =====
  adminId: string
  adminName: string
  adminEmail: string
  adminRole: 'HOSPITAL_ADMIN' | 'HOSPITAL_STAFF'
  accountStatus: 'active' | 'suspended' | 'pending' | 'inactive'
  registrationDate: string
  lastLoginDate?: string
  
  // ===== PATIENT MANAGEMENT =====
  totalPatients: number
  activePatients: number
  verifiedPatients: number
  pendingVerificationPatients: number
  suspendedPatients: number
  newPatientsThisMonth: number
  patientGrowthRate: number
  
  // ===== DEPOSIT MANAGEMENT =====
  totalDeposits: number
  pendingDeposits: number
  approvedDeposits: number
  rejectedDeposits: number
  totalDepositValue: number
  totalGoldReceived: number
  totalSilverReceived: number
  depositsThisMonth: number
  averageDepositValue: number
  
  // ===== TOKEN MINTING =====
  totalATMinted: number
  totalATFromAssets: number
  totalATFromSubscriptions: number
  totalATInCirculation: number
  totalATInTrading: number
  totalATRedeemed: number
  totalHTIssued: number
  totalHTRedeemed: number
  mintingSuccessRate: number
  
  // ===== TRADING OPERATIONS =====
  totalATInTradingPools: number
  assetPoolATTokens: number
  subscriptionPoolATTokens: number
  assetPoolAPY: number
  subscriptionPoolAPY: number
  totalTradingProfit: number
  monthlyTradingProfit: number
  tradingSuccessRate: number
  activeTradePositions: number
  
  // ===== SUBSCRIPTION MANAGEMENT =====
  totalActiveSubscriptions: number
  totalSubscriptionRevenue: number
  monthlySubscriptionRevenue: number
  subscriptionRenewalRate: number
  totalSubscriptionBatches: number
  readyToMintBatches: number
  collectedSubscriptionAmount: number
  
  // ===== PROFIT ALLOCATION =====
  totalProfitAllocated: number
  totalProfitDistributed: number
  pendingProfitAllocation: number
  profitAllocationThisMonth: number
  averageProfitPerPatient: number
  
  // ===== STAFF MANAGEMENT =====
  totalStaffMembers: number
  activeStaffMembers: number
  medicalOfficers: number
  financeManagers: number
  clerks: number
  auditors: number
  pendingInvitations: number
  
  // ===== BANK INTEGRATION =====
  connectedBanks: number
  activeBankPartnerships: number
  totalBankTransactions: number
  bankComplianceScore: number
  pendingBankApprovals: number
  
  // ===== FINANCIAL SUMMARY =====
  totalRevenue: number
  monthlyRevenue: number
  totalAssetValue: number
  totalLiabilities: number
  netAssetValue: number
  liquidityRatio: number
  monthlyGrowthRate: number
  yearlyGrowthRate: number
  
  // ===== OPERATIONS & PERFORMANCE =====
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  averageTransactionTime: number
  systemUptime: number
  totalNotificationsSent: number
  
  // ===== BLOCKCHAIN OPERATIONS =====
  totalBlockchainTransactions: number
  pendingBlockchainTxs: number
  failedBlockchainTxs: number
  totalGasFeePaid: number
  averageGasPrice: number
  blockchainNetwork: 'Ethereum' | 'Polygon' | 'Base' | 'Arbitrum'
  smartContractAddress: string
  
  // ===== COMPLIANCE & AUDIT =====
  complianceScore: number
  totalAuditLogs: number
  criticalIssues: number
  resolvedIssues: number
  pendingReviews: number
  lastAuditDate?: string
  nextAuditDue?: string
  kycCompletionRate: number
  
  // ===== REPORTS & ANALYTICS =====
  totalReportsGenerated: number
  scheduledReports: number
  lastReportGeneratedAt?: string
  totalDataExports: number
  analyticsEnabled: boolean
  
  // ===== NOTIFICATIONS & ALERTS =====
  unreadNotifications: number
  criticalAlerts: number
  systemWarnings: number
  pendingApprovals: number
  emailNotificationsEnabled: boolean
  smsNotificationsEnabled: boolean
  pushNotificationsEnabled: boolean
  
  // ===== SETTINGS & CONFIGURATION =====
  tokenizationFeePercentage: number
  minDepositValue: number
  maxDepositValue: number
  autoApprovalEnabled: boolean
  kycProvider: 'Manual' | 'Onfido' | 'Jumio' | 'Sumsub'
  kycVerificationLevel: 'Basic' | 'Standard' | 'Enhanced'
  
  // ===== RISK MANAGEMENT =====
  riskScore: number
  highRiskTransactions: number
  fraudulentActivitiesDetected: number
  blacklistedPatients: number
  securityIncidents: number
  lastSecurityAudit?: string
  
  // ===== VAULT & STORAGE =====
  goldVaultCapacity: number
  goldCurrentlyStored: number
  silverVaultCapacity: number
  silverCurrentlyStored: number
  vaultUtilization: number
  insuranceCoverage: number
  lastVaultAudit?: string
  
  // ===== TIMESTAMPS =====
  createdAt: string
  updatedAt: string
  lastModifiedBy?: string
}
