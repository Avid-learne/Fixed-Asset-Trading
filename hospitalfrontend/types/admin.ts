// ===== Super Admin Metadata =====

export interface SuperAdminMetadata {
  // Admin Account Information
  adminId: string;
  adminName: string;
  adminEmail: string;
  role: 'SUPER_ADMIN';
  accountStatus: 'active' | 'suspended' | 'pending' | 'inactive';
  lastLoginDate?: string;
  lastActivityDate?: string;
  
  // System Overview
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number; // Percentage
  
  // Hospital Management
  totalHospitals: number;
  activeHospitals: number;
  pendingHospitals: number;
  suspendedHospitals: number;
  verifiedHospitals: number;
  hospitalsThisMonth: number;
  hospitalGrowthRate: number;
  
  // Bank Management
  totalBanks: number;
  activeBanks: number;
  pendingBanks: number;
  suspendedBanks: number;
  verifiedBanks: number;
  banksThisMonth: number;
  averageBankComplianceScore: number;
  
  // User Role Distribution
  totalPatients: number;
  totalHospitalAdmins: number;
  totalHospitalStaff: number;
  totalBankOfficers: number;
  totalSuperAdmins: number;
  
  // Token Overview
  totalATMinted: number;
  totalHTIssued: number;
  totalATInCirculation: number;
  totalHTInCirculation: number;
  totalATRedeemed: number;
  totalHTRedeemed: number;
  totalTokenValue: number; // in PKR
  
  // Financial Overview
  totalRevenue: number; // in PKR
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalTransactionVolume: number;
  averageTransactionValue: number;
  revenueGrowthRate: number; // Percentage
  
  // Deposit & Asset Management
  totalDeposits: number;
  totalDepositValue: number; // in PKR
  totalGoldDeposited: number; // in grams
  totalSilverDeposited: number; // in grams
  depositsThisMonth: number;
  averageDepositValue: number;
  
  // Blockchain Operations
  totalBlockchainTransactions: number;
  successfulBlockchainTxs: number;
  failedBlockchainTxs: number;
  pendingBlockchainTxs: number;
  totalGasFeePaid: number; // in ETH/MATIC
  averageGasPrice: number;
  totalSmartContracts: number;
  blockchainNetworks: ('Ethereum' | 'Polygon' | 'Base' | 'Arbitrum')[];
  
  // System Logs & Audit
  totalAuditLogs: number;
  criticalAuditLogs: number;
  auditLogsThisWeek: number;
  totalErrorLogs: number;
  criticalErrors: number;
  resolvedErrors: number;
  unresolvedErrors: number;
  systemUptime: number; // Percentage
  
  // Transaction Logs
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  transactionsThisMonth: number;
  averageTransactionTime: number; // in seconds
  
  // Compliance & Security
  overallComplianceScore: number; // 0-100
  hospitalsInCompliance: number;
  banksInCompliance: number;
  securityIncidents: number;
  resolvedIncidents: number;
  pendingSecurityReviews: number;
  lastSecurityAudit?: string;
  nextSecurityAudit?: string;
  
  // Notifications
  totalNotificationsSent: number;
  notificationsThisWeek: number;
  scheduledNotifications: number;
  failedNotifications: number;
  emailNotificationsSent: number;
  smsNotificationsSent: number;
  pushNotificationsSent: number;
  
  // Reports & Analytics
  totalReportsGenerated: number;
  scheduledReports: number;
  reportsThisMonth: number;
  totalDataExports: number;
  analyticsQueriesRun: number;
  dashboardViews: number;
  
  // Marketplace Activity
  totalMarketplaceListings: number;
  activeListings: number;
  soldListings: number;
  totalMarketplaceRevenue: number;
  averageListingPrice: number;
  topSellingCategory?: string;
  
  // User Activity Metrics
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number; // in minutes
  totalSessions: number;
  bounceRate: number; // Percentage
  
  // System Performance
  apiResponseTime: number; // in milliseconds
  databaseQueryTime: number; // in milliseconds
  pageLoadTime: number; // in seconds
  errorRate: number; // Percentage
  serverCpuUsage: number; // Percentage
  serverMemoryUsage: number; // Percentage
  databaseSize: number; // in GB
  storageUsed: number; // in GB
  storageCapacity: number; // in GB
  
  // Hospital Performance Summary
  topPerformingHospital?: string;
  topPerformingHospitalId?: string;
  hospitalWithMostPatients?: string;
  hospitalWithMostDeposits?: string;
  hospitalWithMostTokensMinted?: string;
  averageHospitalRating: number;
  
  // Bank Performance Summary
  topPerformingBank?: string;
  topPerformingBankId?: string;
  bankWithMostAssets?: string;
  bankWithHighestCompliance?: string;
  averageBankRating: number;
  
  // KYC & Verification
  totalKYCSubmissions: number;
  pendingKYCReviews: number;
  approvedKYCSubmissions: number;
  rejectedKYCSubmissions: number;
  kycApprovalRate: number; // Percentage
  averageKYCProcessingTime: number; // in hours
  
  // Trading & Profit
  totalTradingVolume: number; // in PKR
  totalProfitGenerated: number;
  totalProfitDistributed: number;
  averageROI: number; // Percentage
  assetPoolTotalValue: number;
  subscriptionPoolTotalValue: number;
  
  // Subscriptions
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalSubscriptionRevenue: number;
  subscriptionRenewalRate: number; // Percentage
  
  // Alerts & Warnings
  criticalAlerts: number;
  warnings: number;
  systemAnomalies: number;
  pendingApprovals: number;
  overdueActions: number;
  
  // Settings & Configuration
  maintenanceMode: boolean;
  debugMode: boolean;
  apiVersion: string;
  systemVersion: string;
  lastSystemUpdate?: string;
  nextScheduledMaintenance?: string;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackupDate?: string;
  
  // Risk Management
  systemRiskScore: number; // 0-100
  highRiskTransactions: number;
  flaggedUsers: number;
  blacklistedUsers: number;
  fraudulentActivitiesDetected: number;
  totalDisputes: number;
  resolvedDisputes: number;
  
  // Support & Help
  totalSupportTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number; // in hours
  customerSatisfactionScore: number; // 0-100
  
  // Billing & Invoices (if applicable)
  totalInvoicesGenerated: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  totalBilledAmount: number; // in PKR
  totalCollectedAmount: number;
  outstandingAmount: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
}

// ===== Hospital Admin Metadata =====

export interface HospitalAdminMetadata {
  // Hospital Information
  hospitalId: string;
  hospitalName: string;
  hospitalCode: string;
  registrationNumber: string;
  hospitalAddress: string;
  city: string;
  state: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  
  // Admin Account Information
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminRole: 'HOSPITAL_ADMIN' | 'HOSPITAL_STAFF';
  accountStatus: 'active' | 'suspended' | 'pending' | 'inactive';
  registrationDate: string;
  lastLoginDate?: string;
  
  // Patient Management
  totalPatients: number;
  activePatients: number;
  verifiedPatients: number;
  pendingVerificationPatients: number;
  suspendedPatients: number;
  newPatientsThisMonth: number;
  patientGrowthRate: number; // Percentage
  
  // Deposit Management
  totalDeposits: number;
  pendingDeposits: number;
  approvedDeposits: number;
  rejectedDeposits: number;
  totalDepositValue: number; // in PKR
  totalGoldReceived: number; // in grams
  totalSilverReceived: number; // in grams
  depositsThisMonth: number;
  averageDepositValue: number;
  
  // Token Minting & Management
  totalATMinted: number;
  totalATFromAssets: number;
  totalATFromSubscriptions: number;
  totalATInCirculation: number;
  totalATInTrading: number;
  totalATRedeemed: number;
  totalHTIssued: number;
  totalHTRedeemed: number;
  mintingSuccessRate: number; // Percentage
  
  // Trading Operations
  totalATInTradingPools: number;
  assetPoolATTokens: number;
  subscriptionPoolATTokens: number;
  assetPoolAPY: number; // 12.5%
  subscriptionPoolAPY: number; // 8.2%
  totalTradingProfit: number; // in PKR
  monthlyTradingProfit: number;
  tradingSuccessRate: number; // Percentage
  activeTradePositions: number;
  
  // Subscription Management
  totalActiveSubscriptions: number;
  totalSubscriptionRevenue: number; // in PKR
  monthlySubscriptionRevenue: number;
  subscriptionRenewalRate: number; // Percentage
  totalSubscriptionBatches: number;
  readyToMintBatches: number;
  collectedSubscriptionAmount: number;
  
  // Profit Allocation
  totalProfitAllocated: number; // in PKR
  totalProfitDistributed: number;
  pendingProfitAllocation: number;
  profitAllocationThisMonth: number;
  averageProfitPerPatient: number;
  
  // Staff Management
  totalStaffMembers: number;
  activeStaffMembers: number;
  medicalOfficers: number;
  financeManagers: number;
  clerks: number;
  auditors: number;
  pendingInvitations: number;
  
  // Bank Integration
  connectedBanks: number;
  activeBankPartnerships: number;
  totalBankTransactions: number;
  bankComplianceScore: number; // 0-100
  pendingBankApprovals: number;
  
  // Financial Summary
  totalRevenue: number; // in PKR
  monthlyRevenue: number;
  totalAssetValue: number; // Value of all gold/silver in vault
  totalLiabilities: number;
  netAssetValue: number;
  liquidityRatio: number;
  monthlyGrowthRate: number; // Percentage
  yearlyGrowthRate: number; // Percentage
  
  // Operations & Performance
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageTransactionTime: number; // in seconds
  systemUptime: number; // Percentage
  totalNotificationsSent: number;
  
  // Blockchain Operations
  totalBlockchainTransactions: number;
  pendingBlockchainTxs: number;
  failedBlockchainTxs: number;
  totalGasFeePaid: number; // in ETH/MATIC
  averageGasPrice: number;
  blockchainNetwork: 'Ethereum' | 'Polygon' | 'Base' | 'Arbitrum';
  smartContractAddress: string;
  
  // Compliance & Audit
  complianceScore: number; // 0-100
  totalAuditLogs: number;
  criticalIssues: number;
  resolvedIssues: number;
  pendingReviews: number;
  lastAuditDate?: string;
  nextAuditDue?: string;
  kycCompletionRate: number; // Percentage
  
  // Reports & Analytics
  totalReportsGenerated: number;
  scheduledReports: number;
  lastReportGeneratedAt?: string;
  totalDataExports: number;
  analyticsEnabled: boolean;
  
  // Notifications & Alerts
  unreadNotifications: number;
  criticalAlerts: number;
  systemWarnings: number;
  pendingApprovals: number;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  
  // Settings & Configuration
  tokenizationFeePercentage: number; // 2.5%
  minDepositValue: number; // in PKR
  maxDepositValue: number; // in PKR
  autoApprovalEnabled: boolean;
  kycProvider: 'Manual' | 'Onfido' | 'Jumio' | 'Sumsub';
  kycVerificationLevel: 'Basic' | 'Standard' | 'Enhanced';
  
  // Risk Management
  riskScore: number; // 0-100
  highRiskTransactions: number;
  fraudulentActivitiesDetected: number;
  blacklistedPatients: number;
  securityIncidents: number;
  lastSecurityAudit?: string;
  
  // Vault & Storage
  goldVaultCapacity: number; // in grams
  goldCurrentlyStored: number; // in grams
  silverVaultCapacity: number; // in grams
  silverCurrentlyStored: number; // in grams
  vaultUtilization: number; // Percentage
  insuranceCoverage: number; // in PKR
  lastVaultAudit?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
}

// ===== Bank Officer Metadata =====

export interface BankOfficerMetadata {
  // Bank Information
  bankId: string;
  bankName: string;
  swiftCode: string;
  bankAddress: string;
  city: string;
  state: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  
  // Officer Account Information
  officerId: string;
  officerName: string;
  officerEmail: string;
  role: 'BANK_OFFICER';
  department: string;
  accountStatus: 'active' | 'suspended' | 'pending' | 'inactive';
  hireDate: string;
  lastLoginDate?: string;
  
  // Asset Management
  totalAssetsUnderManagement: number; // in PKR
  totalGoldAssets: number; // in grams
  totalSilverAssets: number; // in grams
  assetGrowthRate: number; // Percentage
  averageAssetValue: number;
  
  // Policy Management
  totalPolicies: number;
  activePolicies: number;
  expiredPolicies: number;
  pendingPolicies: number;
  policiesIssuedThisMonth: number;
  totalPolicyCoverage: number; // in PKR
  
  // Verification & Approval
  totalVerificationRequests: number;
  pendingVerifications: number;
  approvedVerifications: number;
  rejectedVerifications: number;
  averageVerificationTime: number; // in hours
  verificationAccuracy: number; // Percentage
  
  // Compliance
  complianceScore: number; // 0-100
  complianceChecksCompleted: number;
  complianceIssues: number;
  resolvedComplianceIssues: number;
  pendingComplianceReviews: number;
  lastComplianceAudit?: string;
  
  // Hospital Partnerships
  connectedHospitals: number;
  activePartnerships: number;
  pendingPartnershipRequests: number;
  partnershipTransactions: number;
  averagePartnershipValue: number;
  
  // Transactions
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  transactionVolume: number; // in PKR
  averageTransactionValue: number;
  
  // Audit & Logs
  totalAudits: number;
  auditsThisQuarter: number;
  auditFindings: number;
  resolvedFindings: number;
  lastAuditDate?: string;
  nextAuditDue?: string;
  
  // Reports
  totalReportsGenerated: number;
  scheduledReports: number;
  reportsThisMonth: number;
  customReportsCreated: number;
  
  // Notifications
  unreadNotifications: number;
  criticalAlerts: number;
  pendingApprovals: number;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  
  // Performance Metrics
  approvalAccuracy: number; // Percentage
  tasksCompleted: number;
  tasksPending: number;
  performanceScore: number; // 0-100
  averageResponseTime: number; // in hours
  
  // Risk Management
  riskScore: number; // 0-100
  highRiskAssets: number;
  flaggedTransactions: number;
  fraudDetectionRate: number; // Percentage
  securityIncidents: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
}
