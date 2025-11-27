// hospital-frontend/lib/utils/constants.ts

// Contract addresses (update these after deployment)
export const CONTRACT_ADDRESSES = {
  ASSET_TOKEN: process.env.NEXT_PUBLIC_ASSET_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
  HEALTH_TOKEN: process.env.NEXT_PUBLIC_HEALTH_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
  HOSPITAL_FINANCIALS: process.env.NEXT_PUBLIC_HOSPITAL_FINANCIALS_ADDRESS || "0x0000000000000000000000000000000000000000",
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 31337, // Hardhat local network
  chainName: "Hardhat Local",
  rpcUrl: "http://127.0.0.1:8545",
};

// Token decimals
export const TOKEN_DECIMALS = {
  AT: 18,
  HT: 18,
};

// Role constants
export const ROLES = {
  PATIENT: "patient",
  BANK: "bank",
  HOSPITAL: "hospital",
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Status constants
export const STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  REJECTED: "rejected",
} as const;

export type TransactionStatus = typeof STATUS[keyof typeof STATUS];