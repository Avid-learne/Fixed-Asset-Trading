// hospitalfrontend/lib/constants.ts
export const APP_NAME = 'SehatVault'
export const APP_DESCRIPTION = 'Healthcare financing through asset tokenization'

export const ROLES = {
  PATIENT: 'Patient',
  HOSPITAL_STAFF: 'Hospital_Staff',
  HOSPITAL_ADMIN: 'Hospital_Admin',
  BANK_OFFICER: 'Bank_Officer',
  SUPER_ADMIN: 'Super_Admin',
} as const

export const ASSET_TYPES = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'collectibles', label: 'Collectibles' },
  { value: 'other', label: 'Other' },
]

export const DEPOSIT_STATUS = {
  SUBMITTED: 'Submitted',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  TOKENS_MINTED: 'Tokens_Minted',
} as const

export const TRANSACTION_TYPES = {
  DEPOSIT: 'Deposit',
  MINT: 'Mint',
  TRADE: 'Trade',
  REDEEM: 'Redeem',
  TRANSFER: 'Transfer',
} as const

export const BENEFIT_CATEGORIES = [
  'healthcare',
  'dental',
  'vision',
  'pharmacy',
  'wellness',
  'mental_health',
]

export const DATE_FORMAT = 'MMM dd, yyyy'
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm'  
// Blockchain constants  
export const BLOCKCHAIN = {  
  NETWORK_NAME: 'Hardhat Local',  
  CHAIN_ID: 31337,  
} as const 
