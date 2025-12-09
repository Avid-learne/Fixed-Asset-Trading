// ===== Hospital Staff Metadata (similar but with limited access) =====

export interface HospitalStaffMetadata {
  // Staff Information
  staffId: string;
  staffName: string;
  staffEmail: string;
  staffRole: 'Medical Officer' | 'Finance Manager' | 'Clerk' | 'Auditor';
  department: string;
  
  // Account Information
  accountStatus: 'active' | 'suspended' | 'pending' | 'inactive';
  hireDate: string;
  lastLoginDate?: string;
  
  // Assigned Hospital
  hospitalId: string;
  hospitalName: string;
  
  // Permissions
  canApproveDeposits: boolean;
  canMintTokens: boolean;
  canViewPatients: boolean;
  canManageStaff: boolean;
  canAccessReports: boolean;
  canModifySettings: boolean;
  
  // Activity Summary
  totalPatientsHandled: number;
  totalDepositsProcessed: number;
  totalTokensMinted: number;
  averageProcessingTime: number; // in minutes
  
  // Performance
  approvalAccuracy: number; // Percentage
  tasksCompleted: number;
  tasksPending: number;
  performanceScore: number; // 0-100
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
