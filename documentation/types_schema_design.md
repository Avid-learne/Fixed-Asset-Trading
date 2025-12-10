# **FIXED ASSET TRADING PLATFORM - DATABASE SCHEMA DESIGN**

## **Entity Relationship Overview**

### **Core Entity Relationships**

| Entity | Relationship | Cardinality | Description |
|--------|-------------|-------------|-------------|
| **User — Patient** | One user has one patient profile | 1:1 | Each patient account links to exactly one user record |
| **User — HospitalAdmin** | One user has one hospital admin profile | 1:1 | Each hospital admin links to one user account |
| **User — BankOfficer** | One user has one bank officer profile | 1:1 | Each bank officer links to one user account |
| **User — SuperAdmin** | One user has one super admin profile | 1:1 | Each super admin links to one user account |
| **Hospital — Patient** | One hospital manages many patients | 1:M | Patient registration and management |
| **Hospital — HospitalAdmin** | One hospital has many admins/staff | 1:M | Hospital administration and staff |
| **Bank — BankOfficer** | One bank employs many officers | 1:M | Bank staff management |
| **Patient — AssetDeposit** | One patient submits many deposits | 1:M | Asset submission by patients |
| **Patient — Subscription** | One patient has one subscription | 1:1 | Monthly subscription management |
| **Patient — TokenBalance** | One patient has one token wallet | 1:1 | AT and HT token balances |
| **AssetDeposit — AssetToken** | One approved deposit generates tokens | 1:1 | Tokenization after verification |
| **Hospital — SubscriptionBatch** | One hospital processes many batches | 1:M | Subscription-based minting |
| **Hospital — TradePosition** | One hospital manages many trades | 1:M | Investment trading operations |
| **Bank — Asset** | One bank verifies many assets | 1:M | Asset verification workflow |
| **Bank — Policy** | One bank issues many policies | 1:M | Insurance policy management |
| **Hospital — BankPartnership** | Many hospitals partner with many banks | M:M | Bank-hospital relationships |

---

## **DATA DICTIONARY**

### **TABLE 1: USERS**

**Purpose:** System-wide authentication and access control for all user types

**Relationships:**
- 1:1 → Patient, HospitalAdmin, BankOfficer, SuperAdmin
- 1:M → AuditLog, Notification

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique user identifier | UUID | 36 | NO | uuid() | PK |
| email | Login email address | VARCHAR | 255 | NO | - | UNIQUE, INDEX |
| password_hash | Encrypted password | VARCHAR | 255 | NO | - | - |
| name | Full name | VARCHAR | 255 | NO | - | - |
| role | User role | ENUM | - | NO | - | PATIENT, HOSPITAL_ADMIN, HOSPITAL_STAFF, BANK_OFFICER, SUPER_ADMIN |
| status | Account status | ENUM | - | NO | 'active' | active, suspended, pending, inactive |
| phone | Contact number | VARCHAR | 20 | YES | NULL | - |
| avatar | Profile picture URL | VARCHAR | 500 | YES | NULL | - |
| email_verified | Email verification flag | BOOLEAN | 1 | NO | false | - |
| last_login | Last login timestamp | TIMESTAMP | - | YES | NULL | INDEX |
| created_at | Account creation time | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update time | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 2: PATIENTS**

**Purpose:** Patient profile and KYC information

**Relationships:**
- M:1 → User (user_id)
- M:1 → Hospital (hospital_id)
- 1:M → AssetDeposit, Transaction, Notification
- 1:1 → TokenBalance, Subscription

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique patient identifier | UUID | 36 | NO | uuid() | PK |
| user_id | Reference to user account | UUID | 36 | NO | - | FK(users.id), UNIQUE |
| hospital_id | Registered hospital | UUID | 36 | NO | - | FK(hospitals.id), INDEX |
| patient_number | Hospital-assigned ID | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| date_of_birth | Date of birth | DATE | 10 | YES | NULL | - |
| gender | Patient gender | ENUM | - | YES | NULL | male, female, other |
| blood_type | Blood group | VARCHAR | 5 | YES | NULL | - |
| address | Residential address | TEXT | - | YES | NULL | - |
| city | City name | VARCHAR | 100 | YES | NULL | - |
| state | State/province | VARCHAR | 100 | YES | NULL | - |
| country | Country | VARCHAR | 100 | YES | NULL | - |
| emergency_contact_name | Emergency contact person | VARCHAR | 255 | YES | NULL | - |
| emergency_contact_phone | Emergency contact number | VARCHAR | 20 | YES | NULL | - |
| kyc_status | KYC verification status | ENUM | - | NO | 'not_submitted' | not_submitted, pending, verified, rejected |
| kyc_documents | Document URLs (JSON) | JSONB | - | YES | NULL | - |
| kyc_verified_at | KYC approval timestamp | TIMESTAMP | - | YES | NULL | - |
| kyc_verified_by | Verifier user ID | UUID | 36 | YES | NULL | FK(users.id) |
| wallet_address | Blockchain wallet | VARCHAR | 255 | YES | NULL | UNIQUE |
| created_at | Registration timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 3: HOSPITALS**

**Purpose:** Healthcare institution information and operational data

**Relationships:**
- 1:M → Patient, HospitalAdmin, HospitalStaff
- 1:M → AssetDeposit, SubscriptionBatch, TradePosition
- M:M → Bank (through BankPartnership)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique hospital identifier | UUID | 36 | NO | uuid() | PK |
| name | Hospital name | VARCHAR | 255 | NO | - | INDEX |
| code | Short hospital code | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| registration_number | Government registration | VARCHAR | 100 | NO | - | UNIQUE |
| address | Physical address | TEXT | - | NO | - | - |
| city | City name | VARCHAR | 100 | YES | NULL | INDEX |
| state | State/province | VARCHAR | 100 | YES | NULL | - |
| country | VARCHAR | 100 | YES | NULL | - |
| contact_email | Official email | VARCHAR | 255 | NO | - | - |
| contact_phone | Official phone | VARCHAR | 20 | NO | - | - |
| website | Hospital website | VARCHAR | 255 | YES | NULL | - |
| status | Operational status | ENUM | - | NO | 'pending' | active, suspended, pending, inactive |
| verification_status | Verification status | ENUM | - | NO | 'pending' | pending, verified, rejected |
| contract_address | Smart contract address | VARCHAR | 255 | YES | NULL | UNIQUE |
| total_patients | Patient count | INTEGER | 11 | NO | 0 | - |
| total_at_minted | Total AT tokens minted | DECIMAL | 18,2 | NO | 0 | - |
| total_ht_issued | Total HT tokens issued | DECIMAL | 18,2 | NO | 0 | - |
| vault_gold_capacity | Gold vault capacity (grams) | DECIMAL | 18,2 | NO | 0 | - |
| vault_silver_capacity | Silver vault capacity (grams) | DECIMAL | 18,2 | NO | 0 | - |
| created_at | Registration timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 4: BANKS**

**Purpose:** Financial institution information for asset verification and insurance

**Relationships:**
- 1:M → BankOfficer, Asset, Policy, BankTransaction
- M:M → Hospital (through BankPartnership)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique bank identifier | UUID | 36 | NO | uuid() | PK |
| name | Bank name | VARCHAR | 255 | NO | - | INDEX |
| swift_code | SWIFT/BIC code | VARCHAR | 20 | NO | - | UNIQUE, INDEX |
| bank_code | Internal bank code | VARCHAR | 50 | NO | - | UNIQUE |
| registration_number | Registration number | VARCHAR | 100 | NO | - | UNIQUE |
| address | Physical address | TEXT | - | NO | - | - |
| city | City name | VARCHAR | 100 | YES | NULL | INDEX |
| state | State/province | VARCHAR | 100 | YES | NULL | - |
| country | Country | VARCHAR | 100 | YES | NULL | - |
| contact_email | Official email | VARCHAR | 255 | NO | - | - |
| contact_phone | Official phone | VARCHAR | 20 | NO | - | - |
| website | Bank website | VARCHAR | 255 | YES | NULL | - |
| status | Operational status | ENUM | - | NO | 'pending' | active, suspended, pending, inactive |
| verification_status | Verification status | ENUM | - | NO | 'pending' | pending, verified, rejected |
| total_assets_value | Total assets under management | DECIMAL | 18,2 | NO | 0 | - |
| compliance_score | Compliance score (0-100) | INTEGER | 3 | NO | 0 | CHECK (0-100) |
| created_at | Registration timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 5: HOSPITAL_ADMINS**

**Purpose:** Hospital administrator and staff profiles

**Relationships:**
- M:1 → User (user_id)
- M:1 → Hospital (hospital_id)
- 1:M → AssetDeposit (approver), MintRecord (minted_by)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique admin identifier | UUID | 36 | NO | uuid() | PK |
| user_id | Reference to user account | UUID | 36 | NO | - | FK(users.id), UNIQUE |
| hospital_id | Associated hospital | UUID | 36 | NO | - | FK(hospitals.id), INDEX |
| admin_role | Role type | ENUM | - | NO | - | HOSPITAL_ADMIN, HOSPITAL_STAFF |
| department | Department name | VARCHAR | 100 | YES | NULL | - |
| permissions | Permission flags (JSON) | JSONB | - | YES | NULL | - |
| can_approve_deposits | Deposit approval permission | BOOLEAN | 1 | NO | false | - |
| can_mint_tokens | Token minting permission | BOOLEAN | 1 | NO | false | - |
| can_manage_staff | Staff management permission | BOOLEAN | 1 | NO | false | - |
| can_access_reports | Report access permission | BOOLEAN | 1 | NO | false | - |
| created_at | Registration timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 6: BANK_OFFICERS**

**Purpose:** Bank officer profiles for asset verification

**Relationships:**
- M:1 → User (user_id)
- M:1 → Bank (bank_id)
- 1:M → Asset (verified_by), Policy (issued_by)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique officer identifier | UUID | 36 | NO | uuid() | PK |
| user_id | Reference to user account | UUID | 36 | NO | - | FK(users.id), UNIQUE |
| bank_id | Associated bank | UUID | 36 | NO | - | FK(banks.id), INDEX |
| department | Department name | VARCHAR | 100 | YES | NULL | - |
| position | Job position | VARCHAR | 100 | YES | NULL | - |
| permissions | Permission flags (JSON) | JSONB | - | YES | NULL | - |
| can_verify_assets | Asset verification permission | BOOLEAN | 1 | NO | false | - |
| can_issue_policies | Policy issuance permission | BOOLEAN | 1 | NO | false | - |
| can_access_reports | Report access permission | BOOLEAN | 1 | NO | false | - |
| hire_date | Employment start date | DATE | 10 | YES | NULL | - |
| created_at | Registration timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 7: ASSET_DEPOSITS**

**Purpose:** Track patient asset deposit requests and approvals

**Relationships:**
- M:1 → Patient (patient_id)
- M:1 → Hospital (hospital_id)
- M:1 → HospitalAdmin (approved_by)
- 1:1 → AssetToken

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique deposit identifier | UUID | 36 | NO | uuid() | PK |
| deposit_id | Human-readable deposit ID | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| patient_id | Depositor patient | UUID | 36 | NO | - | FK(patients.id), INDEX |
| hospital_id | Processing hospital | UUID | 36 | NO | - | FK(hospitals.id), INDEX |
| asset_type | Type of asset | ENUM | - | NO | - | gold, silver |
| weight | Asset weight in grams | DECIMAL | 18,2 | NO | - | CHECK (> 0) |
| purity | Asset purity percentage | DECIMAL | 5,2 | YES | NULL | CHECK (0-100) |
| asset_worth | Value in PKR | DECIMAL | 18,2 | NO | - | CHECK (> 0) |
| expected_tokens | Expected AT tokens | DECIMAL | 18,2 | NO | - | CHECK (>= 0) |
| source | Deposit source | ENUM | - | NO | 'asset' | asset, subscription |
| status | Deposit status | ENUM | - | NO | 'pending' | pending, approved, rejected, processing, completed |
| submitted_date | Submission timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| processed_date | Processing timestamp | TIMESTAMP | - | YES | NULL | - |
| approved_by | Approver admin ID | UUID | 36 | YES | NULL | FK(hospital_admins.id) |
| rejection_reason | Rejection explanation | TEXT | - | YES | NULL | - |
| documents | Document URLs (JSON) | JSONB | - | YES | NULL | - |
| certificate_number | Asset certificate number | VARCHAR | 100 | YES | NULL | - |
| vault_location | Storage vault location | VARCHAR | 255 | YES | NULL | - |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 8: SUBSCRIPTIONS**

**Purpose:** Patient monthly subscription plans

**Relationships:**
- 1:1 → Patient (patient_id)
- M:1 → Hospital (hospital_id)
- 1:M → SubscriptionPayment

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique subscription identifier | UUID | 36 | NO | uuid() | PK |
| subscription_id | Human-readable ID | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| patient_id | Subscriber patient | UUID | 36 | NO | - | FK(patients.id), UNIQUE, INDEX |
| hospital_id | Hospital providing service | UUID | 36 | NO | - | FK(hospitals.id), INDEX |
| monthly_amount | Monthly payment (PKR) | DECIMAL | 18,2 | NO | 10000 | CHECK (> 0) |
| status | Subscription status | ENUM | - | NO | 'active' | active, inactive, suspended, cancelled |
| start_date | Subscription start date | DATE | 10 | NO | - | - |
| end_date | Subscription end date | DATE | 10 | YES | NULL | - |
| next_payment_date | Next payment due date | DATE | 10 | YES | NULL | - |
| auto_renew | Auto-renewal flag | BOOLEAN | 1 | NO | true | - |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 9: SUBSCRIPTION_PAYMENTS**

**Purpose:** Track monthly subscription payment records

**Relationships:**
- M:1 → Subscription (subscription_id)
- M:1 → Patient (patient_id)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique payment identifier | UUID | 36 | NO | uuid() | PK |
| payment_id | Human-readable payment ID | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| subscription_id | Associated subscription | UUID | 36 | NO | - | FK(subscriptions.id), INDEX |
| patient_id | Paying patient | UUID | 36 | NO | - | FK(patients.id), INDEX |
| amount | Payment amount (PKR) | DECIMAL | 18,2 | NO | - | CHECK (> 0) |
| payment_date | Payment date | DATE | 10 | NO | - | INDEX |
| payment_method | Payment method | VARCHAR | 50 | YES | NULL | - |
| status | Payment status | ENUM | - | NO | 'completed' | pending, completed, failed, refunded |
| transaction_reference | External payment reference | VARCHAR | 255 | YES | NULL | - |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 10: SUBSCRIPTION_BATCHES**

**Purpose:** Group subscription payments for batch minting of AT tokens

**Relationships:**
- M:1 → Hospital (hospital_id)
- M:1 → HospitalAdmin (minted_by)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique batch identifier | UUID | 36 | NO | uuid() | PK |
| batch_id | Human-readable batch ID | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| hospital_id | Processing hospital | UUID | 36 | NO | - | FK(hospitals.id), INDEX |
| collection_period | Period (e.g. "Nov 2024") | VARCHAR | 50 | NO | - | - |
| total_patients | Number of patients | INTEGER | 11 | NO | 0 | CHECK (>= 0) |
| total_amount | Total collected (PKR) | DECIMAL | 18,2 | NO | 0 | CHECK (>= 0) |
| expected_tokens | Expected AT tokens | DECIMAL | 18,2 | NO | 0 | CHECK (>= 0) |
| status | Batch status | ENUM | - | NO | 'collecting' | collecting, ready_to_mint, minted, processing |
| submitted_date | Submission timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| minted_date | Minting timestamp | TIMESTAMP | - | YES | NULL | - |
| minted_by | Minter admin ID | UUID | 36 | YES | NULL | FK(hospital_admins.id) |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 11: ASSET_TOKENS (AT)**

**Purpose:** Track minted Asset Tokens from deposits and subscriptions

**Relationships:**
- M:1 → AssetDeposit (deposit_id) [Optional for subscription tokens]
- M:1 → Patient (patient_id)
- M:1 → Hospital (hospital_id)
- 1:M → TradePosition

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique token identifier | UUID | 36 | NO | uuid() | PK |
| token_id | Human-readable token ID | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| deposit_id | Associated deposit | UUID | 36 | YES | NULL | FK(asset_deposits.id), INDEX |
| patient_id | Token owner | UUID | 36 | NO | - | FK(patients.id), INDEX |
| hospital_id | Issuing hospital | UUID | 36 | NO | - | FK(hospitals.id), INDEX |
| amount | Token amount | DECIMAL | 18,2 | NO | - | CHECK (> 0) |
| source | Token source | ENUM | - | NO | - | asset, subscription |
| status | Token status | ENUM | - | NO | 'active' | active, locked, redeemed, traded |
| minted_date | Minting timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| tx_hash | Blockchain transaction hash | VARCHAR | 255 | YES | NULL | INDEX |
| block_number | Blockchain block number | BIGINT | 20 | YES | NULL | - |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 12: HEALTH_TOKENS (HT)**

**Purpose:** Track allocated Health Tokens for patient benefits

**Relationships:**
- M:1 → Patient (patient_id)
- M:1 → Hospital (hospital_id)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique token identifier | UUID | 36 | NO | uuid() | PK |
| token_id | Human-readable token ID | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| patient_id | Token owner | UUID | 36 | NO | - | FK(patients.id), INDEX |
| hospital_id | Issuing hospital | UUID | 36 | NO | - | FK(hospitals.id), INDEX |
| amount | Token amount | DECIMAL | 18,2 | NO | - | CHECK (> 0) |
| source | Allocation source | VARCHAR | 100 | YES | NULL | - |
| status | Token status | ENUM | - | NO | 'active' | active, redeemed, expired |
| issued_date | Issuance timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| tx_hash | Blockchain transaction hash | VARCHAR | 255 | YES | NULL | INDEX |
| block_number | Blockchain block number | BIGINT | 20 | YES | NULL | - |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 13: TOKEN_BALANCES**

**Purpose:** Current AT and HT token balances for each patient

**Relationships:**
- 1:1 → Patient (patient_id)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique balance identifier | UUID | 36 | NO | uuid() | PK |
| patient_id | Patient owner | UUID | 36 | NO | - | FK(patients.id), UNIQUE, INDEX |
| at_balance | Asset Token balance | DECIMAL | 18,2 | NO | 0 | CHECK (>= 0) |
| at_locked | Locked AT in trading | DECIMAL | 18,2 | NO | 0 | CHECK (>= 0) |
| ht_balance | Health Token balance | DECIMAL | 18,2 | NO | 0 | CHECK (>= 0) |
| ht_redeemed | Total HT redeemed | DECIMAL | 18,2 | NO | 0 | CHECK (>= 0) |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | - |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 14: TRADE_POSITIONS**

**Purpose:** Track AT token investment positions in trading pools

**Relationships:**
- M:1 → Patient (patient_id)
- M:1 → Hospital (hospital_id)
- M:1 → AssetToken (token_id)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique position identifier | UUID | 36 | NO | uuid() | PK |
| position_id | Human-readable position ID | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| patient_id | Position owner | UUID | 36 | NO | - | FK(patients.id), INDEX |
| hospital_id | Managing hospital | UUID | 36 | NO | - | FK(hospitals.id), INDEX |
| token_id | Associated AT token | UUID | 36 | YES | NULL | FK(asset_tokens.id) |
| pool | Investment pool | ENUM | - | NO | - | asset-pool, subscription-pool |
| investment_type | Type of investment | ENUM | - | NO | - | government-bond, etf, healthcare-fund |
| at_tokens | AT tokens invested | DECIMAL | 18,2 | NO | - | CHECK (> 0) |
| invested_value | Investment value (PKR) | DECIMAL | 18,2 | NO | - | CHECK (> 0) |
| current_value | Current value (PKR) | DECIMAL | 18,2 | NO | - | CHECK (>= 0) |
| profit_loss | Profit/loss amount (PKR) | DECIMAL | 18,2 | NO | 0 | - |
| apy | Annual percentage yield | DECIMAL | 5,2 | NO | - | CHECK (>= 0) |
| risk_level | Risk category | ENUM | - | NO | 'low' | low, medium, high |
| status | Position status | ENUM | - | NO | 'running' | running, matured, planned, closed |
| start_date | Position start date | DATE | 10 | NO | - | INDEX |
| expected_end_date | Expected maturity date | DATE | 10 | YES | NULL | - |
| actual_end_date | Actual closure date | DATE | 10 | YES | NULL | - |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 15: TRANSACTIONS**

**Purpose:** Blockchain transaction records for all token operations

**Relationships:**
- M:1 → Patient (patient_id)
- M:1 → Hospital (hospital_id)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique transaction identifier | UUID | 36 | NO | uuid() | PK |
| transaction_id | Human-readable transaction ID | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| patient_id | Transaction initiator | UUID | 36 | YES | NULL | FK(patients.id), INDEX |
| hospital_id | Associated hospital | UUID | 36 | YES | NULL | FK(hospitals.id), INDEX |
| type | Transaction type | ENUM | - | NO | - | deposit, mint, trade, redeem, transfer, allocate |
| token_type | Token type | ENUM | - | NO | - | AT, HT |
| amount | Token amount | DECIMAL | 18,2 | NO | - | CHECK (> 0) |
| from_address | Sender wallet address | VARCHAR | 255 | YES | NULL | INDEX |
| to_address | Recipient wallet address | VARCHAR | 255 | YES | NULL | INDEX |
| status | Transaction status | ENUM | - | NO | 'pending' | pending, completed, failed, confirmed |
| tx_hash | Blockchain transaction hash | VARCHAR | 255 | YES | NULL | UNIQUE, INDEX |
| block_number | Blockchain block number | BIGINT | 20 | YES | NULL | INDEX |
| gas_used | Gas consumed | VARCHAR | 50 | YES | NULL | - |
| gas_fee | Gas fee paid | VARCHAR | 50 | YES | NULL | - |
| description | Transaction description | TEXT | - | YES | NULL | - |
| metadata | Additional data (JSON) | JSONB | - | YES | NULL | - |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 16: ASSETS**

**Purpose:** Physical asset records managed by banks

**Relationships:**
- M:1 → Hospital (hospital_id)
- M:1 → AssetDeposit (deposit_id)
- M:1 → Bank (bank_id)
- 1:M → Policy

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique asset identifier | UUID | 36 | NO | uuid() | PK |
| asset_id | Human-readable asset ID | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| deposit_id | Associated deposit | UUID | 36 | YES | NULL | FK(asset_deposits.id), INDEX |
| hospital_id | Owning hospital | UUID | 36 | NO | - | FK(hospitals.id), INDEX |
| bank_id | Verifying bank | UUID | 36 | YES | NULL | FK(banks.id), INDEX |
| asset_type | Type of asset | ENUM | - | NO | - | gold, silver |
| weight | Asset weight (grams) | DECIMAL | 18,2 | NO | - | CHECK (> 0) |
| purity | Asset purity percentage | DECIMAL | 5,2 | YES | NULL | CHECK (0-100) |
| current_value | Current value (PKR) | DECIMAL | 18,2 | NO | - | CHECK (> 0) |
| purchase_value | Purchase value (PKR) | DECIMAL | 18,2 | YES | NULL | CHECK (>= 0) |
| location | Storage location | VARCHAR | 255 | YES | NULL | - |
| vault_number | Vault number | VARCHAR | 50 | YES | NULL | - |
| certificate_number | Asset certificate | VARCHAR | 100 | YES | NULL | UNIQUE |
| status | Asset status | ENUM | - | NO | 'pending' | secured, pending, released, in-transit, verified |
| acquired_date | Acquisition date | DATE | 10 | YES | NULL | - |
| last_valuation_date | Last valuation date | DATE | 10 | YES | NULL | - |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 17: POLICIES**

**Purpose:** Insurance policy records for assets

**Relationships:**
- M:1 → Asset (asset_id)
- M:1 → Bank (bank_id)
- M:1 → Hospital (hospital_id)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique policy identifier | UUID | 36 | NO | uuid() | PK |
| policy_id | Human-readable policy ID | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| policy_number | Insurance policy number | VARCHAR | 100 | NO | - | UNIQUE |
| asset_id | Insured asset | UUID | 36 | YES | NULL | FK(assets.id), INDEX |
| hospital_id | Policy beneficiary | UUID | 36 | YES | NULL | FK(hospitals.id), INDEX |
| bank_id | Issuing bank | UUID | 36 | NO | - | FK(banks.id), INDEX |
| policy_type | Type of policy | ENUM | - | NO | - | asset-insurance, vault-security, compliance, risk-management |
| policy_name | Policy name | VARCHAR | 255 | NO | - | - |
| description | Policy description | TEXT | - | YES | NULL | - |
| coverage | Coverage amount (PKR) | DECIMAL | 18,2 | NO | - | CHECK (> 0) |
| premium | Premium amount (PKR) | DECIMAL | 18,2 | NO | - | CHECK (> 0) |
| start_date | Policy start date | DATE | 10 | NO | - | INDEX |
| end_date | Policy end date | DATE | 10 | NO | - | INDEX |
| renewal_date | Renewal date | DATE | 10 | YES | NULL | - |
| status | Policy status | ENUM | - | NO | 'active' | active, pending, expired, cancelled, under-review |
| issued_by | Issuer officer ID | UUID | 36 | YES | NULL | FK(bank_officers.id) |
| last_review_date | Last review date | DATE | 10 | YES | NULL | - |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

### **TABLE 18: BANK_PARTNERSHIPS**

**Purpose:** Track bank-hospital partnerships (M:M relationship)

**Relationships:**
- M:1 → Bank (bank_id)
- M:1 → Hospital (hospital_id)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique partnership identifier | UUID | 36 | NO | uuid() | PK |
| partnership_id | Human-readable ID | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| bank_id | Partner bank | UUID | 36 | NO | - | FK(banks.id), INDEX |
| hospital_id | Partner hospital | UUID | 36 | NO | - | FK(hospitals.id), INDEX |
| status | Partnership status | ENUM | - | NO | 'active' | active, pending, suspended, terminated |
| partnership_date | Partnership start date | DATE | 10 | NO | - | - |
| termination_date | Partnership end date | DATE | 10 | YES | NULL | - |
| total_deposits | Total deposits processed | INTEGER | 11 | NO | 0 | CHECK (>= 0) |
| total_asset_value | Total asset value (PKR) | DECIMAL | 18,2 | NO | 0 | CHECK (>= 0) |
| monthly_transactions | Monthly transaction count | INTEGER | 11 | NO | 0 | CHECK (>= 0) |
| compliance_score | Compliance score (0-100) | INTEGER | 3 | NO | 0 | CHECK (0-100) |
| risk_level | Risk assessment | ENUM | - | NO | 'low' | low, medium, high |
| contact_person | Bank contact person | VARCHAR | 255 | YES | NULL | - |
| contact_email | Contact email | VARCHAR | 255 | YES | NULL | - |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

**Composite Unique Constraint:** UNIQUE(bank_id, hospital_id)

---

### **TABLE 19: NOTIFICATIONS**

**Purpose:** System notifications and alerts

**Relationships:**
- M:1 → User (created_by)
- 1:M → UserNotification

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique notification identifier | UUID | 36 | NO | uuid() | PK |
| title | Notification title | VARCHAR | 255 | NO | - | - |
| message | Notification message | TEXT | - | NO | - | - |
| type | Notification type | ENUM | - | NO | 'info' | info, success, warning, error |
| priority | Priority level | ENUM | - | NO | 'medium' | low, medium, high, critical |
| recipient_role | Target role | VARCHAR | 50 | YES | NULL | - |
| hospital_id | Target hospital | UUID | 36 | YES | NULL | FK(hospitals.id), INDEX |
| bank_id | Target bank | UUID | 36 | YES | NULL | FK(banks.id), INDEX |
| action_url | Action link | VARCHAR | 500 | YES | NULL | - |
| created_by | Creator user ID | UUID | 36 | YES | NULL | FK(users.id) |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| expires_at | Expiration timestamp | TIMESTAMP | - | YES | NULL | INDEX |

---

### **TABLE 20: USER_NOTIFICATIONS**

**Purpose:** Track notification delivery to individual users

**Relationships:**
- M:1 → Notification (notification_id)
- M:1 → User (user_id)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique record identifier | UUID | 36 | NO | uuid() | PK |
| notification_id | Associated notification | UUID | 36 | NO | - | FK(notifications.id), INDEX |
| user_id | Recipient user | UUID | 36 | NO | - | FK(users.id), INDEX |
| is_read | Read status | BOOLEAN | 1 | NO | false | INDEX |
| read_at | Read timestamp | TIMESTAMP | - | YES | NULL | - |
| created_at | Delivery timestamp | TIMESTAMP | - | NO | NOW() | INDEX |

**Composite Unique Constraint:** UNIQUE(notification_id, user_id)

---

### **TABLE 21: AUDIT_LOGS**

**Purpose:** Track all system actions for compliance and security

**Relationships:**
- M:1 → User (user_id)

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique log identifier | UUID | 36 | NO | uuid() | PK |
| user_id | User performing action | UUID | 36 | YES | NULL | FK(users.id), INDEX |
| user_role | User role at time of action | VARCHAR | 50 | YES | NULL | - |
| action | Action performed | VARCHAR | 255 | NO | - | INDEX |
| resource | Resource affected | VARCHAR | 255 | YES | NULL | INDEX |
| resource_id | Resource identifier | VARCHAR | 255 | YES | NULL | - |
| details | Action details | TEXT | - | YES | NULL | - |
| status | Action status | ENUM | - | NO | 'success' | success, warning, error |
| ip_address | User IP address | VARCHAR | 50 | YES | NULL | - |
| user_agent | User agent string | TEXT | - | YES | NULL | - |
| created_at | Action timestamp | TIMESTAMP | - | NO | NOW() | INDEX |

---

### **TABLE 22: REPORTS**

**Purpose:** Generated reports for analytics and compliance

**Relationships:**
- M:1 → User (generated_by)
- M:1 → Hospital (hospital_id) [Optional]
- M:1 → Bank (bank_id) [Optional]

| Column Name | Description | Type | Length | Nullable | Default | Constraints |
|-------------|-------------|------|--------|----------|---------|-------------|
| id | Unique report identifier | UUID | 36 | NO | uuid() | PK |
| report_id | Human-readable report ID | VARCHAR | 50 | NO | - | UNIQUE, INDEX |
| name | Report name | VARCHAR | 255 | NO | - | - |
| type | Report type | ENUM | - | NO | - | financial, compliance, asset, audit, operational, partnership, risk-assessment |
| category | Report category | VARCHAR | 100 | YES | NULL | INDEX |
| description | Report description | TEXT | - | YES | NULL | - |
| hospital_id | Associated hospital | UUID | 36 | YES | NULL | FK(hospitals.id), INDEX |
| bank_id | Associated bank | UUID | 36 | YES | NULL | FK(banks.id), INDEX |
| generated_by | Generator user ID | UUID | 36 | NO | - | FK(users.id) |
| generated_date | Generation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| period | Reporting period | VARCHAR | 100 | YES | NULL | - |
| status | Report status | ENUM | - | NO | 'completed' | ready, processing, scheduled, failed, completed |
| file_url | Report file URL | VARCHAR | 500 | YES | NULL | - |
| file_size | File size | VARCHAR | 50 | YES | NULL | - |
| format | File format | ENUM | - | NO | 'PDF' | PDF, Excel, CSV |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | INDEX |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | - |

---

## **INDEXES**

### **Performance Optimization Indexes**

```sql
-- User Authentication
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_last_login ON users(last_login);

-- Patient Lookups
CREATE INDEX idx_patients_hospital ON patients(hospital_id);
CREATE INDEX idx_patients_kyc_status ON patients(kyc_status);
CREATE INDEX idx_patients_user_id ON patients(user_id);

-- Asset Deposits
CREATE INDEX idx_deposits_patient ON asset_deposits(patient_id);
CREATE INDEX idx_deposits_hospital ON asset_deposits(hospital_id);
CREATE INDEX idx_deposits_status ON asset_deposits(status);
CREATE INDEX idx_deposits_date ON asset_deposits(submitted_date);

-- Token Operations
CREATE INDEX idx_at_patient ON asset_tokens(patient_id);
CREATE INDEX idx_at_hospital ON asset_tokens(hospital_id);
CREATE INDEX idx_at_status ON asset_tokens(status);
CREATE INDEX idx_ht_patient ON health_tokens(patient_id);

-- Trading Positions
CREATE INDEX idx_trades_patient ON trade_positions(patient_id);
CREATE INDEX idx_trades_status ON trade_positions(status);
CREATE INDEX idx_trades_dates ON trade_positions(start_date, expected_end_date);

-- Transactions
CREATE INDEX idx_txn_patient ON transactions(patient_id);
CREATE INDEX idx_txn_hash ON transactions(tx_hash);
CREATE INDEX idx_txn_type_status ON transactions(type, status);
CREATE INDEX idx_txn_date ON transactions(created_at);

-- Notifications
CREATE INDEX idx_notif_user ON user_notifications(user_id, is_read);
CREATE INDEX idx_notif_created ON user_notifications(created_at);

-- Audit Logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
```

---

## **CONSTRAINTS AND BUSINESS RULES**

### **Referential Integrity**

1. **Cascade Deletes:**
   - User deletion → Cascade to Patient/HospitalAdmin/BankOfficer
   - Hospital deletion → Restrict if has active patients
   - Patient deletion → Cascade to TokenBalance, soft-delete deposits

2. **Check Constraints:**
   - All monetary values > 0
   - Token amounts >= 0
   - Dates: end_date >= start_date
   - Percentages: 0-100 range
   - Compliance scores: 0-100 range

3. **Unique Constraints:**
   - User email unique across system
   - Patient number unique per hospital
   - Asset certificate numbers unique
   - Policy numbers unique
   - Transaction hashes unique

### **Data Validation Rules**

1. **Token Conversion:**
   - 1 AT = 100 PKR (fixed rate)
   - Gold: 15,000 PKR/gram
   - Silver: 250 PKR/gram

2. **Subscription:**
   - Monthly amount: 10,000 PKR
   - Batch minting threshold: 100,000 PKR

3. **Trading Pools:**
   - Asset Pool APY: 12.5%
   - Subscription Pool APY: 8.2%

---

## **SUMMARY STATISTICS**

- **Total Tables:** 22
- **Total Relationships:** 45+
- **Primary Keys:** 22 (all UUID)
- **Foreign Keys:** 60+
- **Unique Constraints:** 35+
- **Check Constraints:** 40+
- **Indexes:** 50+ (performance optimization)

This schema supports a fully functional fixed asset trading platform with complete traceability, compliance tracking, and multi-entity relationships.
