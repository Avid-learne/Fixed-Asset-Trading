-- ==========================================
-- ENUMS
-- ==========================================
CREATE TYPE user_role AS ENUM ('PATIENT', 'BANK', 'HOSPITAL');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE asset_type AS ENUM (
  'GOLD_JEWELRY',
  'SILVER_COINS', 
  'PRECIOUS_METALS',
  'MEDICAL_EQUIPMENT',
  'PROPERTY',
  'CRYPTOCURRENCY',
  'VEHICLE',
  'ARTWORK',
  'OTHER'
);
CREATE TYPE deposit_status AS ENUM ('PENDING', 'VERIFIED', 'APPROVED', 'REJECTED', 'MINTED');
CREATE TYPE trade_status AS ENUM ('ACTIVE', 'COMPLETED', 'DISTRIBUTED', 'FAILED');
CREATE TYPE benefit_category AS ENUM ('HEALTHCARE', 'DENTAL', 'VISION', 'PHARMACY', 'WELLNESS', 'MENTAL_HEALTH');
CREATE TYPE redemption_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
CREATE TYPE policy_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'EXPIRED');
CREATE TYPE claim_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');
CREATE TYPE transaction_type AS ENUM ('ISSUED', 'REDEEMED', 'ALLOCATED', 'TRADING_PROFIT');

-- ==========================================
-- USERS TABLE
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  email VARCHAR UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR,
  role user_role NOT NULL,
  status user_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SESSIONS TABLE
-- ==========================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address VARCHAR,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PATIENTS TABLE
-- ==========================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  phone_number VARCHAR,
  address TEXT,
  emergency_contact JSONB,
  medical_history JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- HOSPITALS TABLE
-- ==========================================
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  address TEXT NOT NULL,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  license_number VARCHAR UNIQUE NOT NULL,
  contact_email VARCHAR NOT NULL,
  contact_phone VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- BANK STAFF TABLE
-- ==========================================
CREATE TABLE bank_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR UNIQUE NOT NULL,
  department VARCHAR,
  position VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- HOSPITAL STAFF TABLE
-- ==========================================
CREATE TABLE hospital_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES hospitals(id),
  employee_id VARCHAR UNIQUE NOT NULL,
  department VARCHAR,
  position VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ASSET DEPOSITS TABLE
-- ==========================================
CREATE TABLE asset_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id SERIAL UNIQUE,
  patient_id UUID NOT NULL REFERENCES patients(id),
  asset_type asset_type NOT NULL,
  quantity DECIMAL(18,4) NOT NULL,
  unit VARCHAR NOT NULL,
  estimated_value DECIMAL(18,2) NOT NULL,
  description TEXT NOT NULL,
  photos TEXT[],
  status deposit_status DEFAULT 'PENDING',
  tx_hash VARCHAR(66),
  block_number BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ASSET VERIFICATIONS TABLE
-- ==========================================
CREATE TABLE asset_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id UUID UNIQUE NOT NULL REFERENCES asset_deposits(id),
  verified_by_id UUID NOT NULL REFERENCES bank_staff(id),
  verified_value DECIMAL(18,2) NOT NULL,
  tokens_to_mint DECIMAL(18,2) NOT NULL,
  notes TEXT,
  ipfs_hash VARCHAR,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ASSET TOKENS TABLE
-- ==========================================
CREATE TABLE asset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id UUID NOT NULL REFERENCES asset_deposits(id),
  patient_id UUID NOT NULL REFERENCES users(id),
  patient_address VARCHAR(42) NOT NULL,
  token_amount DECIMAL(18,2) NOT NULL,
  contract_address VARCHAR(42) NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  block_number BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TRADES TABLE
-- ==========================================
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id SERIAL UNIQUE,
  hospital_id UUID NOT NULL REFERENCES hospitals(id),
  created_by_id UUID NOT NULL REFERENCES hospital_staff(id),
  invested_at DECIMAL(18,2) NOT NULL,
  profit_earned DECIMAL(18,2) NOT NULL,
  status trade_status DEFAULT 'ACTIVE',
  notes TEXT,
  tx_hash VARCHAR(66),
  block_number BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PROFIT DISTRIBUTIONS TABLE
-- ==========================================
CREATE TABLE profit_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id),
  patient_id UUID NOT NULL REFERENCES users(id),
  patient_address VARCHAR(42) NOT NULL,
  amount_ht DECIMAL(18,2) NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  block_number BIGINT NOT NULL,
  distributed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- HEALTH TOKEN BALANCES TABLE
-- ==========================================
CREATE TABLE health_token_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID UNIQUE NOT NULL REFERENCES patients(id),
  balance DECIMAL(18,2) DEFAULT 0,
  total_issued DECIMAL(18,2) DEFAULT 0,
  total_redeemed DECIMAL(18,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- HEALTH TOKEN TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE health_token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id),
  patient_address VARCHAR(42) NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  source VARCHAR NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  block_number BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- BENEFITS TABLE
-- ==========================================
CREATE TABLE benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category benefit_category NOT NULL,
  cost_ht DECIMAL(18,2) NOT NULL,
  available INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- BENEFIT REDEMPTIONS TABLE
-- ==========================================
CREATE TABLE benefit_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  benefit_id UUID NOT NULL REFERENCES benefits(id),
  quantity INTEGER DEFAULT 1,
  total_cost_ht DECIMAL(18,2) NOT NULL,
  status redemption_status DEFAULT 'PENDING',
  tx_hash VARCHAR(66),
  block_number BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT Now()
);

-- ==========================================
-- INSURANCE POLICIES TABLE
-- ==========================================
CREATE TABLE insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id VARCHAR UNIQUE NOT NULL,
  hospital_id UUID NOT NULL REFERENCES hospitals(id),
  coverage DECIMAL(18,2) NOT NULL,
  premium_monthly DECIMAL(18,2) NOT NULL,
  deductible DECIMAL(18,2) NOT NULL,
  coverage_types TEXT[] NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status policy_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INSURANCE CLAIMS TABLE
-- ==========================================
CREATE TABLE insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES insurance_policies(id),
  amount DECIMAL(18,2) NOT NULL,
  reason TEXT NOT NULL,
  status claim_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ==========================================
-- AUDIT LOGS TABLE
-- ==========================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR NOT NULL,
  entity VARCHAR NOT NULL,
  entity_id VARCHAR NOT NULL,
  details JSONB NOT NULL,
  ip_address VARCHAR,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- BLOCKCHAIN SYNC TABLE
-- ==========================================
CREATE TABLE blockchain_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_name VARCHAR NOT NULL,
  contract_address VARCHAR(42) NOT NULL,
  last_block_synced BIGINT NOT NULL,
  last_sync_at TIMESTAMPTZ NOT NULL,
  UNIQUE(contract_name, contract_address)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

CREATE INDEX idx_patients_user_id ON patients(user_id);

CREATE INDEX idx_bank_staff_user_id ON bank_staff(user_id);
CREATE INDEX idx_bank_staff_employee_id ON bank_staff(employee_id);

CREATE INDEX idx_hospital_staff_user_id ON hospital_staff(user_id);
CREATE INDEX idx_hospital_staff_hospital_id ON hospital_staff(hospital_id);
CREATE INDEX idx_hospital_staff_employee_id ON hospital_staff(employee_id);

CREATE INDEX idx_asset_deposits_patient_id ON asset_deposits(patient_id);
CREATE INDEX idx_asset_deposits_status ON asset_deposits(status);
CREATE INDEX idx_asset_deposits_deposit_id ON asset_deposits(deposit_id);
CREATE INDEX idx_asset_deposits_created_at ON asset_deposits(created_at);
CREATE INDEX idx_asset_deposits_asset_type_status ON asset_deposits(asset_type, status);

CREATE INDEX idx_asset_verifications_deposit_id ON asset_verifications(deposit_id);
CREATE INDEX idx_asset_verifications_verified_by_id ON asset_verifications(verified_by_id);

CREATE INDEX idx_asset_tokens_patient_id ON asset_tokens(patient_id);
CREATE INDEX idx_asset_tokens_patient_address ON asset_tokens(patient_address);
CREATE INDEX idx_asset_tokens_deposit_id ON asset_tokens(deposit_id);

CREATE INDEX idx_trades_trade_id ON trades(trade_id);
CREATE INDEX idx_trades_hospital_id ON trades(hospital_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_created_at ON trades(created_at);

CREATE INDEX idx_profit_distributions_trade_id ON profit_distributions(trade_id);
CREATE INDEX idx_profit_distributions_patient_id ON profit_distributions(patient_id);
CREATE INDEX idx_profit_distributions_patient_address ON profit_distributions(patient_address);

CREATE INDEX idx_health_token_balances_patient_id ON health_token_balances(patient_id);

CREATE INDEX idx_health_token_transactions_patient_id ON health_token_transactions(patient_id);
CREATE INDEX idx_health_token_transactions_patient_address ON health_token_transactions(patient_address);
CREATE INDEX idx_health_token_transactions_type ON health_token_transactions(type);
CREATE INDEX idx_health_token_transactions_created_at ON health_token_transactions(created_at);

CREATE INDEX idx_benefit_redemptions_patient_id ON benefit_redemptions(patient_id);
CREATE INDEX idx_benefit_redemptions_benefit_id ON benefit_redemptions(benefit_id);
CREATE INDEX idx_benefit_redemptions_status ON benefit_redemptions(status);

CREATE INDEX idx_insurance_policies_policy_id ON insurance_policies(policy_id);
CREATE INDEX idx_insurance_policies_hospital_id ON insurance_policies(hospital_id);
CREATE INDEX idx_insurance_policies_status ON insurance_policies(status);

CREATE INDEX idx_insurance_claims_policy_id ON insurance_claims(policy_id);
CREATE INDEX idx_insurance_claims_status ON insurance_claims(status);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_entity_id ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) - Enable later
-- ==========================================
-- Note: Enable RLS after initial setup
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- ... etc for other tables