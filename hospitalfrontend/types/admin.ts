export interface Hospital {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  registrationNumber: string;
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  totalPatients: number;
  tokensMinted: number;
  createdAt: string;
}

export interface Bank {
  id: string;
  name: string;
  swiftCode: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  totalAssets: number;
  totalPolicies: number;
  complianceScore: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'HOSPITAL_ADMIN' | 'HOSPITAL_STAFF' | 'BANK_OFFICER' | 'PATIENT';
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  organizationId?: string;
  organizationName?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  category: string;
  resource: string;
  status: 'success' | 'error' | 'warning';
  ipAddress: string;
  details: string;
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  severity: 'critical' | 'error' | 'warning';
  category: string;
  message: string;
  source: string;
  affectedUsers: number;
  resolved: boolean;
  stackTrace?: string;
}

export interface BlockchainTransaction {
  id: string;
  txHash: string;
  timestamp: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  tokenType: 'AT' | 'HT';
  status: 'success' | 'pending' | 'failed';
  gasUsed: string;
  gasFee: string;
  blockNumber: number;
  hospital: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipient: string;
  recipientRole: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  updatedAt: string;
  updatedBy: string;
}
