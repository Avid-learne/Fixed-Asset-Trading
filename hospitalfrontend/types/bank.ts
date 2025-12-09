// ============================================================================
// BANK TYPES - Fixed Asset Trading Platform
// ============================================================================
// This file contains all bank-related types organized in logical tables

// ============================================================================
// TABLE 1: BANK INFORMATION
// ============================================================================

export interface BankInfo {
  id: string
  bankId: string
  bankName: string
  swiftCode: string
  bankCode: string
  registrationNumber: string
  address: string
  city: string
  state: string
  country: string
  contactEmail: string
  contactPhone: string
  website?: string
  status: BankStatus
  verificationStatus: 'pending' | 'verified' | 'rejected'
  createdAt: string
  updatedAt?: string
}

export type BankStatus = 
  | 'active' 
  | 'suspended' 
  | 'pending' 
  | 'inactive'

// ============================================================================
// TABLE 2: OFFICER ACCOUNT
// ============================================================================

export interface BankOfficer {
  officerId: string
  officerName: string
  officerEmail: string
  role: 'BANK_OFFICER'
  department: string
  position: string
  accountStatus: 'active' | 'suspended' | 'pending' | 'inactive'
  bankId: string
  hireDate: string
  lastLoginDate?: string
  permissions: OfficerPermissions
}

export interface OfficerPermissions {
  canVerifyDeposits: boolean
  canApproveAssets: boolean
  canManagePolicies: boolean
  canAccessReports: boolean
  canViewCompliance: boolean
  canModifySettings: boolean
  canApprovePartnerships: boolean
  canViewAuditLogs: boolean
}

// ============================================================================
// TABLE 3: ASSET MANAGEMENT
// ============================================================================

export interface Asset {
  id: string
  assetId: string
  assetType: 'gold' | 'silver'
  weight: number // grams
  purity: number // percentage (e.g., 99.9 for 24k gold)
  currentValue: number // PKR
  purchaseValue: number // PKR
  location: string
  vaultNumber: string
  certificateNumber?: string
  status: AssetStatus
  hospitalId: string
  hospitalName: string
  depositId?: string
  acquiredDate: string
  lastValuationDate?: string
}

export type AssetStatus = 
  | 'secured' 
  | 'pending' 
  | 'released'
  | 'in-transit'
  | 'verified'

export interface AssetStats {
  totalAssetsUnderManagement: number // PKR
  totalGoldAssets: number // grams
  totalSilverAssets: number // grams
  goldValue: number // PKR
  silverValue: number // PKR
  assetGrowthRate: number // Percentage
  averageAssetValue: number
  totalAssetCount: number
  securedAssets: number
  pendingAssets: number
}

export interface AssetValuation {
  goldPricePerGram: number // PKR
  silverPricePerGram: number // PKR
  totalGoldValue: number // PKR
  totalSilverValue: number // PKR
  totalAssetValue: number // PKR
  lastUpdated: string
  marketTrend: 'rising' | 'falling' | 'stable'
}

// ============================================================================
// TABLE 4: POLICY MANAGEMENT
// ============================================================================

export interface Policy {
  id: string
  policyId: string
  policyName: string
  policyType: 'Asset Insurance' | 'Vault Security' | 'Compliance' | 'Risk Management'
  description: string
  coverage: number // PKR
  premium: number // PKR
  startDate: string
  endDate: string
  renewalDate?: string
  status: PolicyStatus
  hospitalId?: string
  hospitalName?: string
  issuedBy: string
  lastReviewDate?: string
}

export type PolicyStatus = 
  | 'active' 
  | 'pending' 
  | 'expired'
  | 'cancelled'
  | 'under-review'

export interface PolicyStats {
  totalPolicies: number
  activePolicies: number
  expiredPolicies: number
  pendingPolicies: number
  policiesIssuedThisMonth: number
  totalPolicyCoverage: number // PKR
  totalPremiumCollected: number // PKR
  expiringPoliciesSoon: number
}

// ============================================================================
// TABLE 5: VERIFICATION & APPROVAL
// ============================================================================

export interface VerificationRequest {
  id: string
  verificationId: string
  requestType: 'hospital' | 'patient' | 'deposit' | 'asset' | 'compliance'
  hospital: string
  hospitalId: string
  scope: string
  description: string
  status: VerificationStatus
  priority: 'low' | 'medium' | 'high' | 'critical'
  requestedDate: string
  verifiedDate?: string
  verifiedBy?: string
  rejectionReason?: string
  documents: string[]
  notes?: string
}

export type VerificationStatus = 
  | 'pending' 
  | 'verified' 
  | 'failed'
  | 'in-review'
  | 'rejected'

export interface PatientVerification {
  id: string
  patientId: string
  patientName: string
  patientEmail: string
  hospitalId: string
  hospitalName: string
  kycStatus: 'pending' | 'verified' | 'rejected'
  documentsSubmitted: string[]
  verificationDate?: string
  verifiedBy?: string
  notes?: string
}

export interface ApprovalItem {
  id: string
  type: 'Hospital Partnership' | 'Asset Transfer' | 'Policy Issue' | 'Compliance Report'
  requestor: string
  requestDate: string
  details: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'Approved' | 'Rejected'
  approvedBy?: string
  approvalDate?: string
}

export interface VerificationStats {
  totalVerificationRequests: number
  pendingVerifications: number
  approvedVerifications: number
  rejectedVerifications: number
  averageVerificationTime: number // hours
  verificationAccuracy: number // Percentage
  verificationsThisWeek: number
}

// ============================================================================
// TABLE 6: HOSPITAL PARTNERSHIPS
// ============================================================================

export interface HospitalPartnership {
  id: string
  partnershipId: string
  hospitalId: string
  hospitalName: string
  hospitalCode: string
  status: 'active' | 'pending' | 'suspended' | 'terminated'
  partnershipDate: string
  terminationDate?: string
  totalDeposits: number
  totalAssetValue: number // PKR
  monthlyTransactions: number
  complianceScore: number // 0-100
  riskLevel: 'low' | 'medium' | 'high'
  contactPerson: string
  contactEmail: string
}

export interface PartnershipStats {
  connectedHospitals: number
  activePartnerships: number
  pendingPartnershipRequests: number
  suspendedPartnerships: number
  partnershipTransactions: number
  averagePartnershipValue: number // PKR
  topPerformingPartner?: string
}

// ============================================================================
// TABLE 7: TRANSACTIONS
// ============================================================================

export interface BankTransaction {
  id: string
  transactionId: string
  type: 'Deposit' | 'Withdrawal' | 'Transfer' | 'Verification Fee' | 'Policy Premium'
  from: string
  to: string
  amount: number // PKR
  status: TransactionStatus
  timestamp: string
  description?: string
  hospitalId?: string
  hospitalName?: string
  reference?: string
  processedBy?: string
}

export type TransactionStatus = 
  | 'pending' 
  | 'completed' 
  | 'failed'
  | 'processing'
  | 'cancelled'

export interface TransactionStats {
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  pendingTransactions: number
  transactionVolume: number // PKR
  averageTransactionValue: number
  transactionsThisMonth: number
  transactionsThisWeek: number
  largestTransaction: number
}

// ============================================================================
// TABLE 8: COMPLIANCE & AUDIT
// ============================================================================

export interface ComplianceRequirement {
  id: string
  requirementId: string
  title: string
  category: 'Regulatory' | 'Internal' | 'Security' | 'Financial'
  description: string
  status: 'Compliant' | 'Non-Compliant' | 'In Progress' | 'Under Review'
  dueDate: string
  lastCheckedDate?: string
  assignedTo?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface AuditLog {
  id: string
  timestamp: string
  action: string
  user: string
  userRole: string
  resource: string
  details: string
  severity: 'info' | 'warning' | 'error'
  ipAddress?: string
  affectedResource?: string
  status: 'success' | 'failed'
}

export interface ComplianceStats {
  complianceScore: number // 0-100
  complianceChecksCompleted: number
  complianceIssues: number
  resolvedComplianceIssues: number
  pendingComplianceReviews: number
  lastComplianceAudit?: string
  nextComplianceAudit?: string
  totalRequirements: number
  compliantRequirements: number
}

export interface AuditStats {
  totalAudits: number
  auditsThisQuarter: number
  auditFindings: number
  resolvedFindings: number
  criticalFindings: number
  lastAuditDate?: string
  nextAuditDue?: string
  totalAuditLogs: number
}

// ============================================================================
// TABLE 9: REPORTS & ANALYTICS
// ============================================================================

export interface BankReport {
  id: string
  reportId: string
  name: string
  type: ReportType
  category: 'Financial' | 'Compliance' | 'Asset' | 'Audit' | 'Operational'
  description: string
  generatedDate: string
  generatedBy: string
  status: ReportStatus
  period: string // e.g., "Q4 2024", "November 2024"
  fileUrl?: string
  fileSize?: string
  format: 'PDF' | 'Excel' | 'CSV'
}

export type ReportStatus = 
  | 'ready' 
  | 'processing' 
  | 'scheduled'
  | 'failed'

export type ReportType = 
  | 'financial' 
  | 'compliance' 
  | 'asset' 
  | 'audit'
  | 'partnership'
  | 'risk-assessment'

export interface ReportStats {
  totalReportsGenerated: number
  scheduledReports: number
  reportsThisMonth: number
  customReportsCreated: number
  lastReportGeneratedAt?: string
}

// ============================================================================
// TABLE 10: DEPOSITS & WITHDRAWALS
// ============================================================================

export interface BankDeposit {
  id: string
  depositId: string
  hospitalId: string
  hospitalName: string
  patientId?: string
  patientName?: string
  assetType: 'gold' | 'silver'
  weight: number // grams
  assetWorth: number // PKR
  status: DepositStatus
  submittedDate: string
  verifiedDate?: string
  verifiedBy?: string
  vaultLocation?: string
  certificateNumber?: string
}

export type DepositStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'processing'
  | 'secured'

export interface DepositStats {
  totalDeposits: number
  pendingDeposits: number
  approvedDeposits: number
  rejectedDeposits: number
  totalDepositValue: number // PKR
  depositsThisMonth: number
  averageDepositValue: number
}

// ============================================================================
// TABLE 11: DASHBOARD DATA
// ============================================================================

export interface BankDashboardStats {
  totalHospitals: number
  activeHospitals: number
  totalAssets: number // PKR
  pendingVerifications: number
  totalDeposits: number
  monthlyRevenue: number // PKR
  complianceScore: number
  criticalAlerts: number
}

export interface Hospital {
  id: string
  name: string
  code: string
  status: 'Active' | 'Inactive' | 'Suspended'
  deposits: number
  totalValue: number // PKR
  compliance: number // Percentage
  lastActivity: string
}

export interface RevenueData {
  month: string
  revenue: number
  deposits: number
  policies: number
}

// ============================================================================
// TABLE 12: NOTIFICATIONS & ALERTS
// ============================================================================

export interface BankNotification {
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
  relatedEntity?: string
}

export interface AlertStats {
  unreadNotifications: number
  criticalAlerts: number
  systemWarnings: number
  pendingApprovals: number
  overdueActions: number
}

// ============================================================================
// TABLE 13: RISK MANAGEMENT
// ============================================================================

export interface RiskAssessment {
  riskScore: number // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  highRiskAssets: number
  highRiskTransactions: number
  flaggedTransactions: number
  fraudDetectionRate: number // Percentage
  fraudulentActivitiesDetected: number
  securityIncidents: number
  mitigatedRisks: number
  lastRiskAudit?: string
}

export interface SecurityIncident {
  id: string
  incidentId: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detectedDate: string
  resolvedDate?: string
  status: 'detected' | 'investigating' | 'resolved' | 'mitigated'
  affectedSystems?: string[]
  reportedBy?: string
}

// ============================================================================
// TABLE 14: SETTINGS & CONFIGURATION
// ============================================================================

export interface BankSettings {
  bankName: string
  swiftCode: string
  contactEmail: string
  contactPhone: string
  verificationFeePercent: number
  minAssetValue: number // PKR
  maxAssetValue: number // PKR
  vaultCapacity: number // grams
  insuranceCoverage: number // PKR
}

export interface SystemConfiguration {
  autoVerificationEnabled: boolean
  complianceChecksEnabled: boolean
  riskMonitoringEnabled: boolean
  twoFactorRequired: boolean
  sessionTimeout: number // minutes
  maxLoginAttempts: number
  maintenanceMode: boolean
}

// ============================================================================
// TABLE 15: PERFORMANCE METRICS
// ============================================================================

export interface PerformanceMetrics {
  approvalAccuracy: number // Percentage
  tasksCompleted: number
  tasksPending: number
  performanceScore: number // 0-100
  averageResponseTime: number // hours
  customerSatisfactionScore: number // 0-100
  efficiencyRating: number // Percentage
  targetAchievementRate: number // Percentage
}

// ============================================================================
// TABLE 16: COMPREHENSIVE METADATA
// ============================================================================

export interface BankOfficerMetadata {
  // ===== BANK INFORMATION =====
  bankId: string
  bankName: string
  swiftCode: string
  bankAddress: string
  city: string
  state: string
  country: string
  contactEmail: string
  contactPhone: string
  
  // ===== OFFICER ACCOUNT =====
  officerId: string
  officerName: string
  officerEmail: string
  role: 'BANK_OFFICER'
  department: string
  accountStatus: 'active' | 'suspended' | 'pending' | 'inactive'
  hireDate: string
  lastLoginDate?: string
  
  // ===== ASSET MANAGEMENT =====
  totalAssetsUnderManagement: number // PKR
  totalGoldAssets: number // grams
  totalSilverAssets: number // grams
  assetGrowthRate: number // Percentage
  averageAssetValue: number
  
  // ===== POLICY MANAGEMENT =====
  totalPolicies: number
  activePolicies: number
  expiredPolicies: number
  pendingPolicies: number
  policiesIssuedThisMonth: number
  totalPolicyCoverage: number // PKR
  
  // ===== VERIFICATION & APPROVAL =====
  totalVerificationRequests: number
  pendingVerifications: number
  approvedVerifications: number
  rejectedVerifications: number
  averageVerificationTime: number // hours
  verificationAccuracy: number // Percentage
  
  // ===== COMPLIANCE =====
  complianceScore: number // 0-100
  complianceChecksCompleted: number
  complianceIssues: number
  resolvedComplianceIssues: number
  pendingComplianceReviews: number
  lastComplianceAudit?: string
  
  // ===== HOSPITAL PARTNERSHIPS =====
  connectedHospitals: number
  activePartnerships: number
  pendingPartnershipRequests: number
  partnershipTransactions: number
  averagePartnershipValue: number
  
  // ===== TRANSACTIONS =====
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  pendingTransactions: number
  transactionVolume: number // PKR
  averageTransactionValue: number
  
  // ===== AUDIT & LOGS =====
  totalAudits: number
  auditsThisQuarter: number
  auditFindings: number
  resolvedFindings: number
  lastAuditDate?: string
  nextAuditDue?: string
  
  // ===== REPORTS =====
  totalReportsGenerated: number
  scheduledReports: number
  reportsThisMonth: number
  customReportsCreated: number
  
  // ===== NOTIFICATIONS =====
  unreadNotifications: number
  criticalAlerts: number
  pendingApprovals: number
  emailNotificationsEnabled: boolean
  smsNotificationsEnabled: boolean
  
  // ===== PERFORMANCE METRICS =====
  approvalAccuracy: number // Percentage
  tasksCompleted: number
  tasksPending: number
  performanceScore: number // 0-100
  averageResponseTime: number // hours
  
  // ===== RISK MANAGEMENT =====
  riskScore: number // 0-100
  highRiskAssets: number
  flaggedTransactions: number
  fraudDetectionRate: number // Percentage
  securityIncidents: number
  
  // ===== TIMESTAMPS =====
  createdAt: string
  updatedAt: string
  lastModifiedBy?: string
}
