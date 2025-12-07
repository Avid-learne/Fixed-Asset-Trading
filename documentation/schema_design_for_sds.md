# **5.1 DATA DESIGN**

## **5.1.1 Logical Schema**

### **Core Entity Relationships**

| Entity | Relationship | Cardinality | Description |
|--------|-------------|-------------|-------------|
| **User — Patient** | One user becomes a patient profile | 1:1 | Each patient account links to exactly one user record |
| **User — Audit Logs** | One user generates many audit entries | 1:M | System tracks all user actions |
| **User — Error Logs** | One user encounters many errors | 1:M | Logs errors experienced by user |
| **User — Error Logs (Resolver)** | One admin resolves many errors | 1:M | Tracks who fixed each error |
| **User — System Settings** | One admin updates many settings | 1:M | Audit trail for configuration changes |
| **User — Notifications** | One user creates many notifications | 1:M | Tracks notification sender |
| **User — User Notifications** | One user receives many notifications | 1:M | Tracks notification recipients |

### **Hospital & Organization Relationships**

| Entity | Relationship | Cardinality | Description |
|--------|-------------|-------------|-------------|
| **Hospital — Patient** | One hospital manages many patients | 1:M | Patient registration and management |
| **Hospital — Asset** | One hospital processes many assets | 1:M | Asset approval workflow |
| **Hospital — Subscription** | One hospital has one subscription | 1:1 | Billing and plan management |
| **Subscription — Invoice** | One subscription generates many invoices | 1:M | Monthly/annual billing records |
| **Hospital — Financial Reports** | One hospital produces many reports | 1:M | Revenue, expenses, profit tracking |

### **Asset & Token Lifecycle**

| Entity | Relationship | Cardinality | Description |
|--------|-------------|-------------|-------------|
| **Patient — Asset** | One patient deposits many assets | 1:M | Asset submission by patients |
| **Asset — Bank Verification** | One asset undergoes many verifications | 1:M | Multi-stage verification process |
| **Asset — Asset Token (AT)** | One verified asset produces one AT | 1:1 | Tokenization after approval |
| **Asset — Insurance Policy** | One asset can have many policies | 1:M | Insurance coverage |
| **Asset Token — Transaction** | One AT participates in many trades | 1:M | Trading and transfer history |

### **Health Token & Benefits**

| Entity | Relationship | Cardinality | Description |
|--------|-------------|-------------|-------------|
| **Patient — Health Token (HT)** | One patient receives one HT account | 1:1 | Benefit token wallet |
| **Patient — Transaction** | One patient initiates many transactions | 1:M | All blockchain transactions |
| **Patient — Activity Log** | One patient generates many activities | 1:M | Complete activity history |
| **Transaction — Activity Log** | One transaction creates one activity entry | 1:M | Transaction tracking |

### **Banking & Compliance**

| Entity | Relationship | Cardinality | Description |
|--------|-------------|-------------|-------------|
| **Bank — Asset** | One bank processes many assets | 1:M | Asset verification workflow |
| **Bank — Insurance Policy** | One bank issues many policies | 1:M | Insurance underwriting |
| **Bank — Bank Verification** | One bank performs many verifications | 1:M | Verification records |
| **Bank — Compliance Requirements** | One bank has many compliance tasks | 1:M | Regulatory compliance tracking |
| **Bank — Financial Reports** | One bank generates many reports | 1:M | Financial reporting |

### **Notification System**

| Entity | Relationship | Cardinality | Description |
|--------|-------------|-------------|-------------|
| **Notification — User Notification** | One broadcast reaches many users | 1:M | Notification distribution |
| **Notification — Hospital** | Notifications can target one hospital | 1:M | Hospital-specific notifications |
| **Notification — Bank** | Notifications can target one bank | 1:M | Bank-specific notifications |

---

## **5.1.2 Data Dictionary**

### **5.1.2.1 Data 1: USERS**

**Name:** The system-wide account used by all participants (patient, hospital staff, bank officer, super admin)

**Alias:** Account / System User / Authentication Record

**Where-used/how-used:**
- All users authenticate using this table
- Patients deposit assets and redeem benefits
- Hospital admins/staff approve assets and mint tokens
- Bank officers verify deposits and issue policies
- Super admins manage the entire platform, resolve errors, configure settings

**Content description:**
Stores all basic login, identity, and role information for every system user across all participant types.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique system identifier | UUID | 36 | NO | None | PK |
| email | Unique login email address | VARCHAR | 255 | NO | None | UNIQUE |
| password_hash | Encrypted password (bcrypt/argon2) | VARCHAR | 255 | NO | None | |
| name | Full name of user | VARCHAR | 255 | NO | None | |
| role | User role type | ENUM | - | NO | None | |
| | | | | | SUPER_ADMIN / HOSPITAL_ADMIN / HOSPITAL_STAFF / BANK_OFFICER / PATIENT | |
| status | Account status | ENUM | - | NO | 'active' | |
| | | | | | active / inactive / suspended | |
| organization_id | Reference to hospital/bank | UUID | 36 | YES | NULL | FK |
| organization_type | Type of organization | ENUM | - | YES | NULL | |
| | | | | | hospital / bank / none | |
| phone | Contact phone number | VARCHAR | 20 | YES | NULL | |
| verified | Email verification status | BOOLEAN | 1 | NO | false | |
| last_login | Last login timestamp | TIMESTAMP | - | YES | NULL | |
| created_at | Account creation timestamp | TIMESTAMP | - | NO | NOW() | |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.2 Data 2: PATIENTS**

**Name:** The individual who deposits assets and receives health tokens

**Alias:** Patient / Client / Beneficiary

**Where-used/how-used:**
- Patients register/login through user account
- Deposit fixed assets (gold, property, land)
- Track Asset Token (AT) and Health Token (HT) balances
- Redeem HT for healthcare benefits (OPD, medicines, discounts)
- Manage subscriptions and view transaction history

**Content description:**
Contains extended identity, demographic, and KYC details specific to patient users.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique patient identifier | UUID | 36 | NO | None | PK |
| user_id | Reference to user record | UUID | 36 | NO | None | FK (UNIQUE) |
| hospital_id | Registered hospital | UUID | 36 | NO | None | FK |
| patient_number | Hospital-assigned patient ID | VARCHAR | 50 | NO | None | UNIQUE |
| date_of_birth | Date of birth | DATE | 10 | YES | NULL | |
| gender | Patient gender | ENUM | - | YES | NULL | |
| | | | | | male / female / other | |
| blood_type | Blood group | VARCHAR | 5 | YES | NULL | |
| address | Residential address | TEXT | - | YES | NULL | |
| emergency_contact_name | Emergency contact person | VARCHAR | 255 | YES | NULL | |
| emergency_contact_phone | Emergency contact number | VARCHAR | 20 | YES | NULL | |
| kyc_status | KYC verification status | ENUM | - | NO | 'not_submitted' | |
| | | | | | not_submitted / pending / verified / rejected | |
| kyc_documents | KYC document URLs (JSON) | JSONB | - | YES | NULL | |
| wallet_address | Blockchain wallet address | VARCHAR | 255 | YES | NULL | |
| created_at | Registration timestamp | TIMESTAMP | - | NO | NOW() | |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.3 Data 3: HOSPITALS**

**Name:** Healthcare institution that manages patients and participates in asset trading

**Alias:** Hospital / Healthcare Provider / Medical Facility

**Where-used/how-used:**
- Hospitals register patients
- Review and approve deposited assets
- Mint Asset Tokens (AT) after verification
- Execute trading simulations via APIs
- Allocate Health Tokens (HT) based on profits
- Subscribe to platform plans

**Content description:**
Stores registration, contact, and operational details for hospital organizations.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique hospital identifier | UUID | 36 | NO | None | PK |
| name | Hospital name | VARCHAR | 255 | NO | None | |
| registration_number | Government registration ID | VARCHAR | 100 | NO | None | UNIQUE |
| address | Physical address | TEXT | - | NO | None | |
| city | City name | VARCHAR | 100 | YES | NULL | |
| state | State/province | VARCHAR | 100 | YES | NULL | |
| zip_code | Postal code | VARCHAR | 20 | YES | NULL | |
| country | Country | VARCHAR | 100 | YES | NULL | |
| contact_email | Official email | VARCHAR | 255 | NO | None | |
| contact_phone | Official phone | VARCHAR | 20 | NO | None | |
| website | Hospital website URL | VARCHAR | 255 | YES | NULL | |
| hospital_type | Type of facility | VARCHAR | 100 | YES | NULL | |
| bed_count | Total bed capacity | INTEGER | 11 | YES | NULL | |
| status | Operational status | ENUM | - | NO | 'pending' | |
| | | | | | active / suspended / pending / inactive | |
| subscription_plan | Current plan tier | ENUM | - | YES | NULL | |
| | | | | | starter / professional / enterprise | |
| subscription_status | Subscription status | ENUM | - | YES | NULL | |
| | | | | | active / trial / expired / cancelled | |
| next_billing_date | Next payment due date | DATE | 10 | YES | NULL | |
| contract_wallet_address | Smart contract address | VARCHAR | 255 | YES | NULL | |
| total_patients | Patient count | INTEGER | 11 | NO | 0 | |
| tokens_minted | Total AT minted | BIGINT | 20 | NO | 0 | |
| created_at | Registration timestamp | TIMESTAMP | - | NO | NOW() | |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.4 Data 4: BANKS**

**Name:** Financial institution that verifies assets and issues insurance policies

**Alias:** Bank / Financial Institution / Verifier

**Where-used/how-used:**
- Banks verify deposited assets manually
- Issue insurance policies for tokenized assets
- Maintain compliance requirements
- Generate financial and compliance reports
- Approve/reject asset verification requests

**Content description:**
Stores registration, regulatory, and compliance details for bank organizations.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique bank identifier | UUID | 36 | NO | None | PK |
| name | Bank name | VARCHAR | 255 | NO | None | |
| swift_code | International bank code | VARCHAR | 20 | NO | None | UNIQUE |
| address | Physical address | TEXT | - | NO | None | |
| city | City name | VARCHAR | 100 | YES | NULL | |
| state | State/province | VARCHAR | 100 | YES | NULL | |
| zip_code | Postal code | VARCHAR | 20 | YES | NULL | |
| country | Country | VARCHAR | 100 | YES | NULL | |
| contact_email | Official email | VARCHAR | 255 | NO | None | |
| contact_phone | Official phone | VARCHAR | 20 | NO | None | |
| website | Bank website URL | VARCHAR | 255 | YES | NULL | |
| regulatory_license | Banking license number | VARCHAR | 100 | YES | NULL | |
| compliance_officer_name | Compliance officer | VARCHAR | 255 | YES | NULL | |
| compliance_officer_email | Compliance contact email | VARCHAR | 255 | YES | NULL | |
| status | Operational status | ENUM | - | NO | 'pending' | |
| | | | | | active / suspended / pending | |
| total_assets | Total assets under management | DECIMAL | 20,2 | NO | 0.00 | |
| total_policies | Insurance policies issued | INTEGER | 11 | NO | 0 | |
| compliance_score | Compliance rating (0-100) | DECIMAL | 5,2 | YES | NULL | |
| created_at | Registration timestamp | TIMESTAMP | - | NO | NOW() | |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.5 Data 5: ASSETS**

**Name:** A fixed asset deposited by a patient for tokenization

**Alias:** Deposited Asset / Fixed Asset / Collateral

**Where-used/how-used:**
- Patients submit asset deposit requests with documentation
- Hospital staff review asset details and approve/reject
- Bank officers verify asset authenticity and value
- Upon verification, Asset Tokens (AT) are minted
- Assets tracked through entire lifecycle (submission → verification → tokenization)

**Content description:**
Stores complete metadata, valuation, verification lifecycle, and document URLs for deposited assets.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique asset identifier | UUID | 36 | NO | None | PK |
| patient_id | Asset owner (patient) | UUID | 36 | NO | None | FK |
| hospital_id | Processing hospital | UUID | 36 | NO | None | FK |
| bank_id | Verifying bank | UUID | 36 | YES | NULL | FK |
| asset_type | Type of asset | VARCHAR | 100 | NO | None | |
| | | | | | gold / property / land / vehicle / etc | |
| asset_name | Asset description | VARCHAR | 255 | NO | None | |
| description | Detailed description | TEXT | - | YES | NULL | |
| estimated_value | Patient's declared value | DECIMAL | 15,2 | NO | None | |
| verified_value | Bank-verified value | DECIMAL | 15,2 | YES | NULL | |
| status | Current workflow status | ENUM | - | NO | 'pending' | |
| | | | | | pending / under_review / verified / approved / rejected / tokenized | |
| submission_date | Submission timestamp | TIMESTAMP | - | NO | NOW() | |
| review_date | Hospital review timestamp | TIMESTAMP | - | YES | NULL | |
| approval_date | Bank approval timestamp | TIMESTAMP | - | YES | NULL | |
| tokenization_date | AT minting timestamp | TIMESTAMP | - | YES | NULL | |
| rejection_reason | Reason if rejected | TEXT | - | YES | NULL | |
| hospital_staff_id | Reviewing staff member | UUID | 36 | YES | NULL | FK |
| bank_officer_id | Verifying bank officer | UUID | 36 | YES | NULL | FK |
| document_urls | Asset document URLs (JSON) | JSONB | - | YES | NULL | |
| metadata | Additional metadata (JSON) | JSONB | - | YES | NULL | |
| created_at | Record creation timestamp | TIMESTAMP | - | NO | NOW() | |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.6 Data 6: BANK_VERIFICATIONS**

**Name:** Record of bank's manual verification of a deposited asset

**Alias:** Verification Log / Asset Verification / Due Diligence Record

**Where-used/how-used:**
- After hospital approves an asset, bank officers manually verify authenticity
- Bank checks asset documentation, ownership, market value
- Verification decision (verified/rejected) recorded here
- Multiple verification attempts may occur for complex assets

**Content description:**
Captures verification decision, reviewer information, supporting documents, and audit trail.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique verification identifier | UUID | 36 | NO | None | PK |
| bank_id | Verifying bank | UUID | 36 | NO | None | FK |
| hospital_id | Associated hospital | UUID | 36 | YES | NULL | FK |
| asset_id | Asset being verified | UUID | 36 | NO | None | FK |
| verification_type | Type of verification | VARCHAR | 100 | YES | NULL | |
| | | | | | physical / document / financial / legal | |
| scope | Verification scope details | VARCHAR | 255 | YES | NULL | |
| status | Verification outcome | ENUM | - | NO | 'pending' | |
| | | | | | pending / verified / failed | |
| verified_by | Bank officer who verified | UUID | 36 | YES | NULL | FK |
| verified_at | Verification completion time | TIMESTAMP | - | YES | NULL | |
| documents | Verification document URLs (JSON) | JSONB | - | YES | NULL | |
| notes | Verification notes/comments | TEXT | - | YES | NULL | |
| created_at | Record creation timestamp | TIMESTAMP | - | NO | NOW() | |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.7 Data 7: ASSET_TOKENS (AT)**

**Name:** Tokenized representation of a verified asset on blockchain

**Alias:** AT / Asset Token / Digital Asset Certificate

**Where-used/how-used:**
- Minted after successful bank verification
- Represents fractional or full ownership of physical asset
- Used in trading simulations to generate profit
- Tracked on blockchain for transparency
- Can be traded, transferred, or burned

**Content description:**
Digital token record linked to a verified physical asset with blockchain integration.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique AT record identifier | UUID | 36 | NO | None | PK |
| asset_id | Reference to physical asset | UUID | 36 | NO | None | FK (UNIQUE) |
| patient_id | Token owner (patient) | UUID | 36 | NO | None | FK |
| hospital_id | Minting hospital | UUID | 36 | NO | None | FK |
| token_symbol | Token ticker symbol | VARCHAR | 10 | NO | 'AT' | |
| total_supply | Total tokens minted | BIGINT | 20 | NO | None | |
| circulating_supply | Tokens in circulation | BIGINT | 20 | NO | 0 | |
| contract_address | Blockchain contract address | VARCHAR | 255 | YES | NULL | UNIQUE |
| blockchain_network | Network (Ethereum/Polygon) | VARCHAR | 50 | NO | 'ethereum' | |
| mint_transaction_hash | Blockchain mint TX hash | VARCHAR | 255 | YES | NULL | |
| minted_at | Minting timestamp | TIMESTAMP | - | YES | NULL | |
| status | Token status | ENUM | - | NO | 'minted' | |
| | | | | | minted / burned / locked | |
| created_at | Record creation timestamp | TIMESTAMP | - | NO | NOW() | |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.8 Data 8: HEALTH_TOKENS (HT)**

**Name:** Healthcare benefit tokens allocated to patients based on trading profits

**Alias:** HT / Health Token / Benefit Wallet

**Where-used/how-used:**
- Patients receive one HT wallet per patient
- Monthly/annual HT allocations based on AT trading profits
- HT balance tracked (total, locked, available)
- Used for OPD, medicine purchases, discounts, subscription benefits

**Content description:**
Stores HT wallet information with balance tracking for healthcare benefit redemptions.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique HT wallet identifier | UUID | 36 | NO | None | PK |
| patient_id | Wallet owner (patient) | UUID | 36 | NO | None | FK |
| hospital_id | Associated hospital | UUID | 36 | NO | None | FK |
| token_symbol | Token ticker symbol | VARCHAR | 10 | NO | 'HT' | |
| total_balance | Total HT allocated (lifetime) | BIGINT | 20 | NO | 0 | |
| locked_balance | HT locked for subscriptions | BIGINT | 20 | NO | 0 | |
| available_balance | HT available for redemption | BIGINT | 20 | NO | 0 | |
| wallet_address | Blockchain wallet address | VARCHAR | 255 | YES | NULL | |
| created_at | Wallet creation timestamp | TIMESTAMP | - | NO | NOW() | |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.9 Data 9: TRANSACTIONS**

**Name:** All blockchain transactions involving AT and HT tokens

**Alias:** Transaction Log / Blockchain Events / Trade Record

**Where-used/how-used:**
- Records all token movements (mint, transfer, burn, trade, redeem)
- AT trading generates profit/loss
- HT allocation and redemption tracked
- Provides complete audit trail of all token activities
- Links to blockchain for transparency

**Content description:**
Comprehensive history of all token transactions with blockchain integration.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique transaction identifier | UUID | 36 | NO | None | PK |
| transaction_hash | Blockchain TX hash | VARCHAR | 255 | YES | NULL | UNIQUE |
| from_address | Sender wallet address | VARCHAR | 255 | YES | NULL | |
| to_address | Receiver wallet address | VARCHAR | 255 | YES | NULL | |
| token_type | Type of token | ENUM | - | NO | None | |
| | | | | | AT / HT | |
| token_id | Related token record | UUID | 36 | YES | NULL | |
| transaction_type | Type of transaction | ENUM | - | NO | None | |
| | | | | | mint / transfer / burn / trade / redeem / allocate | |
| amount | Token amount | BIGINT | 20 | NO | None | |
| status | Transaction status | ENUM | - | NO | 'pending' | |
| | | | | | pending / confirmed / failed | |
| block_number | Blockchain block number | BIGINT | 20 | YES | NULL | |
| gas_used | Gas consumed | BIGINT | 20 | YES | NULL | |
| gas_fee | Transaction fee | DECIMAL | 20,8 | YES | NULL | |
| patient_id | Associated patient | UUID | 36 | YES | NULL | FK |
| hospital_id | Associated hospital | UUID | 36 | YES | NULL | FK |
| initiated_by | User who initiated | UUID | 36 | YES | NULL | FK |
| description | Transaction description | TEXT | - | YES | NULL | |
| metadata | Additional data (JSON) | JSONB | - | YES | NULL | |
| created_at | Transaction timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.10 Data 10: INSURANCE_POLICIES**

**Name:** Insurance coverage for tokenized assets issued by banks

**Alias:** Policy / Asset Insurance / Coverage Record

**Where-used/how-used:**
- Banks issue insurance policies for approved assets
- Covers asset value, theft, damage, depreciation
- Policies have start/end dates and premium amounts
- Multiple policies can cover same asset over time

**Content description:**
Insurance policy details linking banks, hospitals, and assets with coverage terms.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique policy identifier | UUID | 36 | NO | None | PK |
| bank_id | Issuing bank | UUID | 36 | NO | None | FK |
| hospital_id | Associated hospital | UUID | 36 | YES | NULL | FK |
| asset_id | Insured asset | UUID | 36 | NO | None | FK |
| policy_number | Unique policy number | VARCHAR | 100 | NO | None | UNIQUE |
| policy_type | Type of coverage | VARCHAR | 100 | YES | NULL | |
| | | | | | comprehensive / theft / damage / liability | |
| coverage_amount | Coverage limit | DECIMAL | 15,2 | NO | None | |
| premium_amount | Premium cost | DECIMAL | 10,2 | YES | NULL | |
| start_date | Policy start date | DATE | 10 | NO | None | |
| end_date | Policy end date | DATE | 10 | NO | None | |
| status | Policy status | ENUM | - | NO | 'pending' | |
| | | | | | active / expired / cancelled / pending | |
| terms_conditions | Policy T&C | TEXT | - | YES | NULL | |
| document_url | Policy document URL | VARCHAR | 500 | YES | NULL | |
| created_at | Policy creation timestamp | TIMESTAMP | - | NO | NOW() | |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.11 Data 11: SUBSCRIPTIONS**

**Name:** Hospital's subscription plan for platform usage

**Alias:** Plan / Hospital Subscription / Service Tier

**Where-used/how-used:**
- Each hospital subscribes to one plan tier
- Determines feature access, patient limits, token quotas
- Auto-renewal on billing cycle
- Generates invoices automatically

**Content description:**
Subscription details for hospital service plans and billing cycles.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique subscription identifier | UUID | 36 | NO | None | PK |
| hospital_id | Subscribed hospital | UUID | 36 | NO | None | FK (UNIQUE) |
| plan | Plan tier | ENUM | - | NO | None | |
| | | | | | starter / professional / enterprise | |
| status | Subscription status | ENUM | - | NO | 'trial' | |
| | | | | | active / trial / suspended / cancelled | |
| billing_cycle | Billing frequency | ENUM | - | NO | 'monthly' | |
| | | | | | monthly / annually | |
| price | Plan price | DECIMAL | 10,2 | NO | None | |
| start_date | Subscription start date | DATE | 10 | NO | None | |
| end_date | Subscription end date | DATE | 10 | YES | NULL | |
| next_billing_date | Next payment due | DATE | 10 | YES | NULL | |
| auto_renew | Auto-renewal enabled | BOOLEAN | 1 | NO | true | |
| trial_end_date | Trial period end | DATE | 10 | YES | NULL | |
| created_at | Subscription creation timestamp | TIMESTAMP | - | NO | NOW() | |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.12 Data 12: INVOICES**

**Name:** Payment invoices for hospital subscriptions

**Alias:** Bill / Payment Record / Billing Statement

**Where-used/how-used:**
- Auto-generated on billing cycle
- Tracks payment status (paid/pending/overdue)
- Includes line items, taxes, totals
- Downloadable PDF for records

**Content description:**
Detailed billing records for subscription payments.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique invoice identifier | UUID | 36 | NO | None | PK |
| invoice_number | Unique invoice number | VARCHAR | 50 | NO | None | UNIQUE |
| hospital_id | Billed hospital | UUID | 36 | NO | None | FK |
| subscription_id | Related subscription | UUID | 36 | NO | None | FK |
| amount | Subtotal amount | DECIMAL | 10,2 | NO | None | |
| tax | Tax amount | DECIMAL | 10,2 | NO | 0.00 | |
| total | Total payable | DECIMAL | 10,2 | NO | None | |
| status | Payment status | ENUM | - | NO | 'pending' | |
| | | | | | paid / pending / overdue / cancelled | |
| issue_date | Invoice issue date | DATE | 10 | NO | None | |
| due_date | Payment due date | DATE | 10 | NO | None | |
| paid_date | Payment completion date | DATE | 10 | YES | NULL | |
| payment_method | Payment method used | VARCHAR | 100 | YES | NULL | |
| | | | | | card / bank_transfer / wallet / etc | |
| billing_period | Billing period description | VARCHAR | 50 | YES | NULL | |
| line_items | Invoice line items (JSON) | JSONB | - | YES | NULL | |
| created_at | Invoice creation timestamp | TIMESTAMP | - | NO | NOW() | |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.13 Data 13: AUDIT_LOGS**

**Name:** System-wide audit trail of all user actions

**Alias:** Activity Log / Audit Trail / Action History

**Where-used/how-used:**
- Records every user action (create, update, delete, login, etc.)
- Tracks IP address, user agent for security
- Provides complete forensic trail for compliance
- Searchable by user, action type, resource, date range

**Content description:**
Comprehensive audit logging for security, compliance, and troubleshooting.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique log identifier | UUID | 36 | NO | None | PK |
| user_id | User who performed action | UUID | 36 | YES | NULL | FK |
| user_role | User's role at time of action | VARCHAR | 50 | YES | NULL | |
| action | Action performed | VARCHAR | 100 | NO | None | |
| | | | | | login / create / update / delete / approve / reject / etc | |
| category | Action category | VARCHAR | 100 | YES | NULL | |
| | | | | | auth / asset / token / subscription / etc | |
| resource_type | Type of resource affected | VARCHAR | 100 | YES | NULL | |
| | | | | | user / asset / patient / hospital / etc | |
| resource_id | ID of affected resource | UUID | 36 | YES | NULL | |
| status | Action outcome | ENUM | - | NO | 'success' | |
| | | | | | success / error / warning | |
| ip_address | User's IP address | VARCHAR | 45 | YES | NULL | |
| user_agent | Browser/device info | TEXT | - | YES | NULL | |
| details | Detailed description | TEXT | - | YES | NULL | |
| metadata | Additional context (JSON) | JSONB | - | YES | NULL | |
| created_at | Log timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.14 Data 14: ERROR_LOGS**

**Name:** System error tracking and resolution log

**Alias:** Error Record / Exception Log / Bug Tracker

**Where-used/how-used:**
- Automatically logs application errors and exceptions
- Super admins view and resolve errors
- Tracks affected users, severity, resolution status
- Provides stack traces for debugging

**Content description:**
Error tracking system with resolution workflow for system stability monitoring.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique error identifier | UUID | 36 | NO | None | PK |
| severity | Error severity level | ENUM | - | NO | None | |
| | | | | | critical / error / warning / info | |
| category | Error category | VARCHAR | 100 | YES | NULL | |
| | | | | | database / api / blockchain / payment / etc | |
| message | Error message | TEXT | - | NO | None | |
| source | Error source location | VARCHAR | 255 | YES | NULL | |
| stack_trace | Full stack trace | TEXT | - | YES | NULL | |
| user_id | User who encountered error | UUID | 36 | YES | NULL | FK |
| affected_users_count | Number of users affected | INTEGER | 11 | NO | 0 | |
| resolved | Resolution status | BOOLEAN | 1 | NO | false | |
| resolved_at | Resolution timestamp | TIMESTAMP | - | YES | NULL | |
| resolved_by | Admin who resolved | UUID | 36 | YES | NULL | FK |
| metadata | Additional error data (JSON) | JSONB | - | YES | NULL | |
| created_at | Error occurrence timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.15 Data 15: NOTIFICATIONS**

**Name:** System notifications and announcements

**Alias:** Notification / Announcement / Alert / Message

**Where-used/how-used:**
- Super admins create system-wide or targeted notifications
- Sent to specific roles, hospitals, banks, or individual users
- Supports scheduling for future delivery
- Tracks read counts and delivery status

**Content description:**
Notification management system for platform-wide and targeted messaging.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique notification identifier | UUID | 36 | NO | None | PK |
| type | Notification type | ENUM | - | NO | None | |
| | | | | | announcement / alert / system / personal | |
| title | Notification title | VARCHAR | 255 | NO | None | |
| message | Notification content | TEXT | - | NO | None | |
| priority | Priority level | ENUM | - | NO | 'medium' | |
| | | | | | high / medium / low | |
| recipient_type | Target audience type | ENUM | - | NO | None | |
| | | | | | all / role / hospital / bank / user | |
| recipient_role | Target role (if role-based) | VARCHAR | 50 | YES | NULL | |
| recipient_hospital_id | Target hospital (if hospital-based) | UUID | 36 | YES | NULL | FK |
| recipient_bank_id | Target bank (if bank-based) | UUID | 36 | YES | NULL | FK |
| recipient_user_id | Target user (if personal) | UUID | 36 | YES | NULL | FK |
| status | Notification status | ENUM | - | NO | 'draft' | |
| | | | | | sent / scheduled / draft | |
| scheduled_date | Scheduled send time | TIMESTAMP | - | YES | NULL | |
| sent_date | Actual send time | TIMESTAMP | - | YES | NULL | |
| read_count | Number of users who read | INTEGER | 11 | NO | 0 | |
| total_recipients | Total recipients | INTEGER | 11 | YES | NULL | |
| created_by | Creator (admin) | UUID | 36 | NO | None | FK |
| created_at | Creation timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.16 Data 16: USER_NOTIFICATIONS**

**Name:** Individual user's notification inbox

**Alias:** Notification Inbox / User Alerts / Message Box

**Where-used/how-used:**
- Links broadcast notifications to individual users
- Tracks read/unread status per user
- Provides personalized notification feed
- Enables notification dismissal

**Content description:**
Junction table connecting notifications to users with read status tracking.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique record identifier | UUID | 36 | NO | None | PK |
| notification_id | Related notification | UUID | 36 | NO | None | FK |
| user_id | Recipient user | UUID | 36 | NO | None | FK |
| read | Read status | BOOLEAN | 1 | NO | false | |
| read_at | Read timestamp | TIMESTAMP | - | YES | NULL | |
| created_at | Delivery timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.17 Data 17: COMPLIANCE_REQUIREMENTS**

**Name:** Regulatory compliance tasks for banks

**Alias:** Compliance Task / Regulatory Requirement / Due Diligence

**Where-used/how-used:**
- Banks track regulatory compliance requirements
- Each requirement has due dates and completion status
- Provides audit trail for regulatory inspections
- Alerts for overdue compliance tasks

**Content description:**
Compliance management system for bank regulatory requirements.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique requirement identifier | UUID | 36 | NO | None | PK |
| bank_id | Responsible bank | UUID | 36 | NO | None | FK |
| requirement_name | Requirement name | VARCHAR | 255 | NO | None | |
| description | Detailed description | TEXT | - | YES | NULL | |
| status | Completion status | ENUM | - | NO | 'pending' | |
| | | | | | complete / pending / expired | |
| due_date | Compliance deadline | DATE | 10 | YES | NULL | |
| completed_date | Completion date | DATE | 10 | YES | NULL | |
| document_url | Supporting document URL | VARCHAR | 500 | YES | NULL | |
| created_at | Requirement creation timestamp | TIMESTAMP | - | NO | NOW() | |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.18 Data 18: FINANCIAL_REPORTS**

**Name:** Financial performance reports for hospitals and banks

**Alias:** Financial Statement / Performance Report / Revenue Report

**Where-used/how-used:**
- Hospitals and banks generate periodic financial reports
- Tracks revenue, expenses, profit over time periods
- Supports monthly, quarterly, annual reporting
- Stores detailed breakdown in JSON format

**Content description:**
Financial reporting system with structured and unstructured data storage.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique report identifier | UUID | 36 | NO | None | PK |
| hospital_id | Related hospital | UUID | 36 | YES | NULL | FK |
| bank_id | Related bank | UUID | 36 | YES | NULL | FK |
| report_type | Type of report | ENUM | - | NO | None | |
| | | | | | financial / compliance / asset_valuation / monthly / quarterly / annual | |
| period_start | Reporting period start | DATE | 10 | NO | None | |
| period_end | Reporting period end | DATE | 10 | NO | None | |
| revenue | Total revenue | DECIMAL | 15,2 | YES | NULL | |
| expenses | Total expenses | DECIMAL | 15,2 | YES | NULL | |
| profit | Net profit/loss | DECIMAL | 15,2 | YES | NULL | |
| data | Detailed report data (JSON) | JSONB | - | YES | NULL | |
| generated_by | Report generator (user) | UUID | 36 | YES | NULL | FK |
| created_at | Report generation timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.19 Data 19: ACTIVITY_LOG**

**Name:** Patient activity timeline for all actions and transactions

**Alias:** Patient Timeline / Activity History / Patient Events

**Where-used/how-used:**
- Tracks every patient action (login, deposit, trade, redeem)
- Shows transaction history and token balance changes
- Provides complete activity feed for patient dashboard
- Links to transactions for blockchain verification

**Content description:**
Patient-specific activity log with balance tracking and transaction linking.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique activity identifier | UUID | 36 | NO | None | PK |
| patient_id | Related patient | UUID | 36 | NO | None | FK |
| transaction_id | Related blockchain transaction | UUID | 36 | YES | NULL | FK |
| activity_type | Type of activity | ENUM | - | NO | None | |
| | | | | | deposit / mint / trade / redeem / transfer / login / kyc_update | |
| description | Activity description | TEXT | - | NO | None | |
| amount | Token amount involved | BIGINT | 20 | YES | NULL | |
| balance_after | Balance after activity | BIGINT | 20 | YES | NULL | |
| metadata | Additional context (JSON) | JSONB | - | YES | NULL | |
| created_at | Activity timestamp | TIMESTAMP | - | NO | NOW() | |

---

### **5.1.2.20 Data 20: SYSTEM_SETTINGS**

**Name:** Platform-wide configuration settings

**Alias:** System Config / Platform Settings / Application Configuration

**Where-used/how-used:**
- Super admins configure system-wide parameters
- Controls platform behavior (limits, timeouts, features)
- Tracks who changed what configuration and when
- Organized by category for easy management

**Content description:**
Centralized configuration management with audit trail for system parameters.

| Column Name | Description | Type | Length | Nullable | Default Value | Key Type |
|-------------|-------------|------|--------|----------|---------------|----------|
| id | Unique setting identifier | UUID | 36 | NO | None | PK |
| key | Setting key name | VARCHAR | 100 | NO | None | UNIQUE |
| | | | | | max_upload_size / session_timeout / email_notifications / etc | |
| value | Setting value | TEXT | - | NO | None | |
| category | Setting category | VARCHAR | 100 | YES | NULL | |
| | | | | | general / security / notifications / limits / etc | |
| description | Setting description | TEXT | - | YES | NULL | |
| data_type | Value data type | ENUM | - | YES | NULL | |
| | | | | | string / number / boolean / json | |
| updated_by | Last admin who updated | UUID | 36 | YES | NULL | FK |
| created_at | Setting creation timestamp | TIMESTAMP | - | NO | NOW() | |
| updated_at | Last update timestamp | TIMESTAMP | - | NO | NOW() | |

---

## **End of Data Design Documentation**
