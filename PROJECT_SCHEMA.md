# Fixed Asset Trading Platform - Complete Schema

## Database Schema (Backend)

### 1. Users Table
```sql
users {
  id: UUID PRIMARY KEY
  email: VARCHAR(255) UNIQUE NOT NULL
  password_hash: VARCHAR(255) NOT NULL
  name: VARCHAR(255) NOT NULL
  role: ENUM('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF', 'BANK_OFFICER', 'PATIENT') NOT NULL
  status: ENUM('active', 'inactive', 'suspended') DEFAULT 'active'
  organization_id: UUID (FK -> hospitals.id OR banks.id)
  organization_type: ENUM('hospital', 'bank', 'none')
  phone: VARCHAR(20)
  verified: BOOLEAN DEFAULT false
  last_login: TIMESTAMP
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### 2. Hospitals Table
```sql
hospitals {
  id: UUID PRIMARY KEY
  name: VARCHAR(255) NOT NULL
  registration_number: VARCHAR(100) UNIQUE NOT NULL
  address: TEXT NOT NULL
  city: VARCHAR(100)
  state: VARCHAR(100)
  zip_code: VARCHAR(20)
  country: VARCHAR(100)
  contact_email: VARCHAR(255) NOT NULL
  contact_phone: VARCHAR(20) NOT NULL
  website: VARCHAR(255)
  hospital_type: VARCHAR(100)
  bed_count: INTEGER
  status: ENUM('active', 'suspended', 'pending', 'inactive') DEFAULT 'pending'
  subscription_plan: ENUM('starter', 'professional', 'enterprise')
  subscription_status: ENUM('active', 'trial', 'expired', 'cancelled')
  next_billing_date: DATE
  contract_wallet_address: VARCHAR(255)
  total_patients: INTEGER DEFAULT 0
  tokens_minted: BIGINT DEFAULT 0
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### 3. Banks Table
```sql
banks {
  id: UUID PRIMARY KEY
  name: VARCHAR(255) NOT NULL
  swift_code: VARCHAR(20) UNIQUE NOT NULL
  address: TEXT NOT NULL
  city: VARCHAR(100)
  state: VARCHAR(100)
  zip_code: VARCHAR(20)
  country: VARCHAR(100)
  contact_email: VARCHAR(255) NOT NULL
  contact_phone: VARCHAR(20) NOT NULL
  website: VARCHAR(255)
  regulatory_license: VARCHAR(100)
  compliance_officer_name: VARCHAR(255)
  compliance_officer_email: VARCHAR(255)
  status: ENUM('active', 'suspended', 'pending') DEFAULT 'pending'
  total_assets: DECIMAL(20, 2) DEFAULT 0
  total_policies: INTEGER DEFAULT 0
  compliance_score: DECIMAL(5, 2)
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### 4. Patients Table
```sql
patients {
  id: UUID PRIMARY KEY
  user_id: UUID UNIQUE (FK -> users.id)
  hospital_id: UUID (FK -> hospitals.id)
  patient_number: VARCHAR(50) UNIQUE NOT NULL
  date_of_birth: DATE
  gender: ENUM('male', 'female', 'other')
  blood_type: VARCHAR(5)
  address: TEXT
  emergency_contact_name: VARCHAR(255)
  emergency_contact_phone: VARCHAR(20)
  kyc_status: ENUM('not_submitted', 'pending', 'verified', 'rejected') DEFAULT 'not_submitted'
  kyc_documents: JSONB
  wallet_address: VARCHAR(255)
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### 5. Assets Table
```sql
assets {
  id: UUID PRIMARY KEY
  patient_id: UUID (FK -> patients.id)
  hospital_id: UUID (FK -> hospitals.id)
  bank_id: UUID (FK -> banks.id)
  asset_type: VARCHAR(100) NOT NULL
  asset_name: VARCHAR(255) NOT NULL
  description: TEXT
  estimated_value: DECIMAL(15, 2) NOT NULL
  verified_value: DECIMAL(15, 2)
  status: ENUM('pending', 'under_review', 'verified', 'approved', 'rejected', 'tokenized') DEFAULT 'pending'
  submission_date: TIMESTAMP DEFAULT NOW()
  review_date: TIMESTAMP
  approval_date: TIMESTAMP
  tokenization_date: TIMESTAMP
  rejection_reason: TEXT
  hospital_staff_id: UUID (FK -> users.id)
  bank_officer_id: UUID (FK -> users.id)
  document_urls: JSONB
  metadata: JSONB
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### 6. Tokens Table (Asset Tokens - AT)
```sql
asset_tokens {
  id: UUID PRIMARY KEY
  asset_id: UUID (FK -> assets.id)
  patient_id: UUID (FK -> patients.id)
  hospital_id: UUID (FK -> hospitals.id)
  token_symbol: VARCHAR(10) DEFAULT 'AT'
  total_supply: BIGINT NOT NULL
  circulating_supply: BIGINT DEFAULT 0
  contract_address: VARCHAR(255) UNIQUE
  blockchain_network: VARCHAR(50) DEFAULT 'ethereum'
  mint_transaction_hash: VARCHAR(255)
  minted_at: TIMESTAMP
  status: ENUM('minted', 'burned', 'locked') DEFAULT 'minted'
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### 7. Health Tokens Table (HT)
```sql
health_tokens {
  id: UUID PRIMARY KEY
  patient_id: UUID (FK -> patients.id)
  hospital_id: UUID (FK -> hospitals.id)
  token_symbol: VARCHAR(10) DEFAULT 'HT'
  total_balance: BIGINT DEFAULT 0
  locked_balance: BIGINT DEFAULT 0
  available_balance: BIGINT DEFAULT 0
  wallet_address: VARCHAR(255)
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### 8. Transactions Table
```sql
transactions {
  id: UUID PRIMARY KEY
  transaction_hash: VARCHAR(255) UNIQUE
  from_address: VARCHAR(255)
  to_address: VARCHAR(255)
  token_type: ENUM('AT', 'HT')
  token_id: UUID
  transaction_type: ENUM('mint', 'transfer', 'burn', 'trade', 'redeem', 'allocate')
  amount: BIGINT NOT NULL
  status: ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending'
  block_number: BIGINT
  gas_used: BIGINT
  gas_fee: DECIMAL(20, 8)
  patient_id: UUID (FK -> patients.id)
  hospital_id: UUID (FK -> hospitals.id)
  initiated_by: UUID (FK -> users.id)
  description: TEXT
  metadata: JSONB
  created_at: TIMESTAMP DEFAULT NOW()
}
```

### 9. Insurance Policies Table
```sql
insurance_policies {
  id: UUID PRIMARY KEY
  bank_id: UUID (FK -> banks.id)
  hospital_id: UUID (FK -> hospitals.id)
  asset_id: UUID (FK -> assets.id)
  policy_number: VARCHAR(100) UNIQUE NOT NULL
  policy_type: VARCHAR(100)
  coverage_amount: DECIMAL(15, 2) NOT NULL
  premium_amount: DECIMAL(10, 2)
  start_date: DATE NOT NULL
  end_date: DATE NOT NULL
  status: ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'pending'
  terms_conditions: TEXT
  document_url: VARCHAR(500)
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### 10. Audit Logs Table
```sql
audit_logs {
  id: UUID PRIMARY KEY
  user_id: UUID (FK -> users.id)
  user_role: VARCHAR(50)
  action: VARCHAR(100) NOT NULL
  category: VARCHAR(100)
  resource_type: VARCHAR(100)
  resource_id: UUID
  status: ENUM('success', 'error', 'warning') DEFAULT 'success'
  ip_address: VARCHAR(45)
  user_agent: TEXT
  details: TEXT
  metadata: JSONB
  created_at: TIMESTAMP DEFAULT NOW()
}
```

### 11. Error Logs Table
```sql
error_logs {
  id: UUID PRIMARY KEY
  severity: ENUM('critical', 'error', 'warning', 'info') NOT NULL
  category: VARCHAR(100)
  message: TEXT NOT NULL
  source: VARCHAR(255)
  stack_trace: TEXT
  user_id: UUID (FK -> users.id)
  affected_users_count: INTEGER DEFAULT 0
  resolved: BOOLEAN DEFAULT false
  resolved_at: TIMESTAMP
  resolved_by: UUID (FK -> users.id)
  metadata: JSONB
  created_at: TIMESTAMP DEFAULT NOW()
}
```

### 12. Subscriptions Table
```sql
subscriptions {
  id: UUID PRIMARY KEY
  hospital_id: UUID UNIQUE (FK -> hospitals.id)
  plan: ENUM('starter', 'professional', 'enterprise') NOT NULL
  status: ENUM('active', 'trial', 'suspended', 'cancelled') DEFAULT 'trial'
  billing_cycle: ENUM('monthly', 'annually') DEFAULT 'monthly'
  price: DECIMAL(10, 2) NOT NULL
  start_date: DATE NOT NULL
  end_date: DATE
  next_billing_date: DATE
  auto_renew: BOOLEAN DEFAULT true
  trial_end_date: DATE
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### 13. Invoices Table
```sql
invoices {
  id: UUID PRIMARY KEY
  invoice_number: VARCHAR(50) UNIQUE NOT NULL
  hospital_id: UUID (FK -> hospitals.id)
  subscription_id: UUID (FK -> subscriptions.id)
  amount: DECIMAL(10, 2) NOT NULL
  tax: DECIMAL(10, 2) DEFAULT 0
  total: DECIMAL(10, 2) NOT NULL
  status: ENUM('paid', 'pending', 'overdue', 'cancelled') DEFAULT 'pending'
  issue_date: DATE NOT NULL
  due_date: DATE NOT NULL
  paid_date: DATE
  payment_method: VARCHAR(100)
  billing_period: VARCHAR(50)
  line_items: JSONB
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### 14. Notifications Table
```sql
notifications {
  id: UUID PRIMARY KEY
  type: ENUM('announcement', 'alert', 'system', 'personal') NOT NULL
  title: VARCHAR(255) NOT NULL
  message: TEXT NOT NULL
  priority: ENUM('high', 'medium', 'low') DEFAULT 'medium'
  recipient_type: ENUM('all', 'role', 'hospital', 'bank', 'user') NOT NULL
  recipient_role: VARCHAR(50)
  recipient_hospital_id: UUID (FK -> hospitals.id)
  recipient_bank_id: UUID (FK -> banks.id)
  recipient_user_id: UUID (FK -> users.id)
  status: ENUM('sent', 'scheduled', 'draft') DEFAULT 'draft'
  scheduled_date: TIMESTAMP
  sent_date: TIMESTAMP
  read_count: INTEGER DEFAULT 0
  total_recipients: INTEGER
  created_by: UUID (FK -> users.id)
  created_at: TIMESTAMP DEFAULT NOW()
}
```

### 15. User Notifications Table
```sql
user_notifications {
  id: UUID PRIMARY KEY
  notification_id: UUID (FK -> notifications.id)
  user_id: UUID (FK -> users.id)
  read: BOOLEAN DEFAULT false
  read_at: TIMESTAMP
  created_at: TIMESTAMP DEFAULT NOW()
}
```

### 16. System Settings Table
```sql
system_settings {
  id: UUID PRIMARY KEY
  key: VARCHAR(100) UNIQUE NOT NULL
  value: TEXT NOT NULL
  category: VARCHAR(100)
  description: TEXT
  data_type: ENUM('string', 'number', 'boolean', 'json')
  updated_by: UUID (FK -> users.id)
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### 17. Bank Verifications Table
```sql
bank_verifications {
  id: UUID PRIMARY KEY
  bank_id: UUID (FK -> banks.id)
  hospital_id: UUID (FK -> hospitals.id)
  asset_id: UUID (FK -> assets.id)
  verification_type: VARCHAR(100)
  scope: VARCHAR(255)
  status: ENUM('pending', 'verified', 'failed') DEFAULT 'pending'
  verified_by: UUID (FK -> users.id)
  verified_at: TIMESTAMP
  documents: JSONB
  notes: TEXT
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### 18. Compliance Requirements Table
```sql
compliance_requirements {
  id: UUID PRIMARY KEY
  bank_id: UUID (FK -> banks.id)
  requirement_name: VARCHAR(255) NOT NULL
  description: TEXT
  status: ENUM('complete', 'pending', 'expired') DEFAULT 'pending'
  due_date: DATE
  completed_date: DATE
  document_url: VARCHAR(500)
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### 19. Financial Reports Table
```sql
financial_reports {
  id: UUID PRIMARY KEY
  hospital_id: UUID (FK -> hospitals.id)
  bank_id: UUID (FK -> banks.id)
  report_type: ENUM('financial', 'compliance', 'asset_valuation', 'monthly', 'quarterly', 'annual')
  period_start: DATE NOT NULL
  period_end: DATE NOT NULL
  revenue: DECIMAL(15, 2)
  expenses: DECIMAL(15, 2)
  profit: DECIMAL(15, 2)
  data: JSONB
  generated_by: UUID (FK -> users.id)
  created_at: TIMESTAMP DEFAULT NOW()
}
```

### 20. Activity Log Table
```sql
activity_log {
  id: UUID PRIMARY KEY
  patient_id: UUID (FK -> patients.id)
  transaction_id: UUID (FK -> transactions.id)
  activity_type: ENUM('deposit', 'mint', 'trade', 'redeem', 'transfer', 'login', 'kyc_update')
  description: TEXT NOT NULL
  amount: BIGINT
  balance_after: BIGINT
  metadata: JSONB
  created_at: TIMESTAMP DEFAULT NOW()
}
```

---

## Blockchain Schema

### Smart Contracts

#### 1. AssetToken Contract (ERC-20)
```solidity
contract AssetToken {
  string public name = "Asset Token"
  string public symbol = "AT"
  uint8 public decimals = 18
  uint256 public totalSupply
  
  mapping(address => uint256) public balanceOf
  mapping(address => mapping(address => uint256)) public allowance
  mapping(uint256 => Asset) public assets
  
  struct Asset {
    uint256 assetId
    address owner
    uint256 value
    bool tokenized
  }
  
  event Transfer(address indexed from, address indexed to, uint256 value)
  event Mint(address indexed to, uint256 value, uint256 assetId)
  event Burn(address indexed from, uint256 value)
}
```

#### 2. HealthToken Contract (ERC-20)
```solidity
contract HealthToken {
  string public name = "Health Token"
  string public symbol = "HT"
  uint8 public decimals = 18
  uint256 public totalSupply
  
  mapping(address => uint256) public balanceOf
  mapping(address => uint256) public lockedBalance
  mapping(address => mapping(address => uint256)) public allowance
  
  event Transfer(address indexed from, address indexed to, uint256 value)
  event Allocate(address indexed to, uint256 value)
  event Redeem(address indexed from, uint256 value, string service)
  event Lock(address indexed user, uint256 amount)
  event Unlock(address indexed user, uint256 amount)
}
```

#### 3. HospitalFinancials Contract
```solidity
contract HospitalFinancials {
  mapping(address => Hospital) public hospitals
  mapping(address => uint256) public profitPool
  mapping(address => mapping(address => uint256)) public patientAllocations
  
  struct Hospital {
    address hospitalAddress
    uint256 totalRevenue
    uint256 totalPatients
    bool active
  }
  
  event ProfitAllocated(address indexed hospital, uint256 amount)
  event TokensDistributed(address indexed patient, uint256 amount)
}
```

---

## API Schema (Backend REST/GraphQL Endpoints)

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Users
```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
PATCH  /api/users/:id/status
POST   /api/users/:id/reset-password
```

### Hospitals
```
GET    /api/hospitals
GET    /api/hospitals/:id
POST   /api/hospitals
PUT    /api/hospitals/:id
PATCH  /api/hospitals/:id/status
GET    /api/hospitals/:id/patients
GET    /api/hospitals/:id/staff
GET    /api/hospitals/:id/analytics
```

### Banks
```
GET    /api/banks
GET    /api/banks/:id
POST   /api/banks
PUT    /api/banks/:id
PATCH  /api/banks/:id/status
GET    /api/banks/:id/hospitals
GET    /api/banks/:id/policies
```

### Patients
```
GET    /api/patients
GET    /api/patients/:id
POST   /api/patients
PUT    /api/patients/:id
GET    /api/patients/:id/assets
GET    /api/patients/:id/tokens
GET    /api/patients/:id/transactions
PATCH  /api/patients/:id/kyc
```

### Assets
```
GET    /api/assets
GET    /api/assets/:id
POST   /api/assets
PUT    /api/assets/:id
PATCH  /api/assets/:id/status
POST   /api/assets/:id/approve
POST   /api/assets/:id/reject
POST   /api/assets/:id/tokenize
```

### Tokens
```
GET    /api/tokens/at/:id
GET    /api/tokens/ht/:id
POST   /api/tokens/mint
POST   /api/tokens/transfer
POST   /api/tokens/burn
POST   /api/tokens/allocate-ht
POST   /api/tokens/redeem-ht
GET    /api/tokens/balance/:address
```

### Transactions
```
GET    /api/transactions
GET    /api/transactions/:id
POST   /api/transactions
GET    /api/transactions/history
GET    /api/transactions/blockchain/:hash
```

### Subscriptions
```
GET    /api/subscriptions
GET    /api/subscriptions/:id
POST   /api/subscriptions
PUT    /api/subscriptions/:id
PATCH  /api/subscriptions/:id/cancel
```

### Invoices
```
GET    /api/invoices
GET    /api/invoices/:id
POST   /api/invoices
PATCH  /api/invoices/:id/pay
GET    /api/invoices/:id/download
```

### Logs
```
GET    /api/logs/audit
GET    /api/logs/errors
GET    /api/logs/transactions
POST   /api/logs/export
```

### Reports
```
GET    /api/reports/financial
GET    /api/reports/analytics
POST   /api/reports/generate
GET    /api/reports/:id/download
```

### Notifications
```
GET    /api/notifications
POST   /api/notifications
PATCH  /api/notifications/:id/read
DELETE /api/notifications/:id
POST   /api/notifications/broadcast
```

### System
```
GET    /api/system/health
GET    /api/system/settings
PUT    /api/system/settings
GET    /api/system/monitoring
```

---

## Frontend State Schema (TypeScript Interfaces)

### Store Schemas
```typescript
// Auth Store
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

// User Interface
interface User {
  id: string
  email: string
  name: string
  role: UserRole
  status: 'active' | 'inactive' | 'suspended'
  organization?: string
  organizationType?: 'hospital' | 'bank'
  verified: boolean
  lastLogin: string
  createdAt: string
}

// Hospital Interface
interface Hospital {
  id: string
  name: string
  registrationNumber: string
  address: string
  contactEmail: string
  contactPhone: string
  status: 'active' | 'suspended' | 'pending' | 'inactive'
  subscriptionPlan: 'starter' | 'professional' | 'enterprise'
  totalPatients: number
  tokensMinted: number
  createdAt: string
}

// Asset Interface
interface Asset {
  id: string
  patientId: string
  hospitalId: string
  bankId?: string
  assetType: string
  assetName: string
  description: string
  estimatedValue: number
  verifiedValue?: number
  status: 'pending' | 'under_review' | 'verified' | 'approved' | 'rejected' | 'tokenized'
  submissionDate: string
  documentUrls: string[]
}

// Transaction Interface
interface Transaction {
  id: string
  transactionHash: string
  fromAddress: string
  toAddress: string
  tokenType: 'AT' | 'HT'
  transactionType: 'mint' | 'transfer' | 'burn' | 'trade' | 'redeem'
  amount: number
  status: 'pending' | 'confirmed' | 'failed'
  createdAt: string
}
```

---

## File Upload Schema

### Document Storage Structure
```
/uploads
  /hospitals
    /{hospital-id}
      /documents
        registration-{timestamp}.pdf
        license-{timestamp}.pdf
  /patients
    /{patient-id}
      /kyc
        id-proof-{timestamp}.pdf
        address-proof-{timestamp}.pdf
      /assets
        /{asset-id}
          document-{timestamp}.pdf
          valuation-{timestamp}.pdf
  /banks
    /{bank-id}
      /compliance
        license-{timestamp}.pdf
        audit-{timestamp}.pdf
  /invoices
    invoice-{invoice-number}.pdf
  /reports
    report-{report-id}.pdf
```

---

## Permission Schema

### Role-Based Permissions
```typescript
enum Permission {
  // User Management
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  
  // Hospital Management
  VIEW_HOSPITALS = 'view_hospitals',
  CREATE_HOSPITALS = 'create_hospitals',
  EDIT_HOSPITALS = 'edit_hospitals',
  SUSPEND_HOSPITALS = 'suspend_hospitals',
  
  // Bank Management
  VIEW_BANKS = 'view_banks',
  CREATE_BANKS = 'create_banks',
  EDIT_BANKS = 'edit_banks',
  
  // Asset Management
  VIEW_ASSETS = 'view_assets',
  SUBMIT_ASSETS = 'submit_assets',
  APPROVE_ASSETS = 'approve_assets',
  VERIFY_ASSETS = 'verify_assets',
  TOKENIZE_ASSETS = 'tokenize_assets',
  
  // Token Management
  MINT_TOKENS = 'mint_tokens',
  TRANSFER_TOKENS = 'transfer_tokens',
  BURN_TOKENS = 'burn_tokens',
  ALLOCATE_HT = 'allocate_ht',
  REDEEM_HT = 'redeem_ht',
  
  // Financial
  VIEW_FINANCIAL_REPORTS = 'view_financial_reports',
  MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',
  MANAGE_INVOICES = 'manage_invoices',
  
  // System
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  SEND_NOTIFICATIONS = 'send_notifications',
  
  // Personal
  VIEW_OWN_PROFILE = 'view_own_profile',
  VIEW_OWN_ASSETS = 'view_own_assets',
  VIEW_OWN_TRANSACTIONS = 'view_own_transactions'
}

const rolePermissions: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [/* all permissions */],
  HOSPITAL_ADMIN: [/* hospital + staff permissions */],
  HOSPITAL_STAFF: [/* limited hospital permissions */],
  BANK_OFFICER: [/* bank-specific permissions */],
  PATIENT: [/* patient-specific permissions */]
}
```

---

## Environment Variables Schema

### Backend (.env)
```
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/fixed_asset_trading
DATABASE_POOL_SIZE=20

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d

# Blockchain
BLOCKCHAIN_NETWORK=ethereum
BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID
PRIVATE_KEY=your-private-key
CONTRACT_ADDRESS_AT=0x...
CONTRACT_ADDRESS_HT=0x...

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=fixed-asset-uploads
AWS_REGION=us-east-1

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password

# Payment Gateway
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis
REDIS_URL=redis://localhost:6379
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_BLOCKCHAIN_EXPLORER=https://etherscan.io
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```
