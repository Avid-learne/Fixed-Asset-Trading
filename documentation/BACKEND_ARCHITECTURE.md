# SehatVault Backend Architecture

## Overview

Spring Boot 3.5 backend with PostgreSQL (Supabase). Handles authentication, asset deposits, token management, trading, profit distribution, subscriptions, and bank integrations.

**Tech Stack:** Java 17, Spring Boot, Spring Security + JWT, Hibernate/JPA, PostgreSQL

---

## Package Structure

```
com.SehatVault.SehatVaultBackend/
├── auth/              # Authentication, JWT, user management
├── assetdeposit/      # Patient asset deposit & minting flow
├── marketplace/       # Trading, AT pool, order book
├── profitallocation/  # Profit distribution to patients
├── wallet/            # Token balances, transfers, token prices
├── subscription/      # Subscription plans & monthly HT allocation
├── hospital/          # Hospital settings, staff management
├── bank/              # Bank entity
├── bankintegration/   # Bank-Hospital partnership
├── patient/           # Patient entity, wallet allocator
├── dashboard/         # Dashboard summaries (patient/hospital/bank)
├── notification/      # In-app notifications
├── activity/          # Activity logs & transaction history
├── healthcard/        # Health cards (Asset/Subscription)
├── report/            # Financial reports
├── profile/           # User profile management
└── audittrail/        # Audit trail logs
```

---

## AUTH Package

Handles user registration, login, JWT token generation.

### Endpoints (AuthController)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register new user (patient, hospital_admin, hospital_staff, bank_staff) |
| POST | `/api/auth/signin` | Login and get JWT token |
| GET | `/api/auth/hospitals` | List hospital names for signup dropdown |
| POST | `/api/auth/verify` | Verify JWT token |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/logout` | Logout user |
| PUT | `/api/auth/profile/{userId}` | Update user profile |

### Key Service Methods (AuthService)
- `signup(SignupRequest)` - Creates user, assigns role, creates hospital (for admin), creates patient record (for patient)
- `signin(SigninRequest)` - Validates credentials, generates JWT
- `getHospitalNames()` - Returns list of hospital names

### Entities
- **User** (table: `users`) - userId, email, passwordHash, cnic, name, role, hospitalId, status
- **Role** (table: `roles`) - roleId, roleName (patient/hospital_admin/hospital_staff/bank_staff/admin)
- **Settings** (table: `settings`) - user preferences

### Other Files
- `JwtAuthenticationFilter` - Intercepts requests, validates JWT from Authorization header
- `JwtUtil` - Generate/validate JWT tokens
- `SecurityConfig` - Spring Security configuration, public vs protected endpoints
- `RoleDataSeeder` - Seeds default roles on startup

---

## ASSETDEPOSIT Package

3-tier approval flow: Patient submits -> Hospital approves -> Bank approves & mints AT tokens.

### Endpoints (AssetDepositController)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/asset-deposits/requests` | Patient submits deposit request |
| GET | `/api/asset-deposits/hospital/requests` | Hospital admin views requests |
| GET | `/api/asset-deposits/bank/requests` | Bank views forwarded requests |
| GET | `/api/asset-deposits/mine` | Patient views own requests |
| GET | `/api/asset-deposits/integrated-banks` | Get banks integrated with hospital |
| POST | `/api/asset-deposits/{id}/approve?bankId=` | Hospital approves & forwards to bank |
| POST | `/api/asset-deposits/{id}/reject` | Hospital rejects |
| POST | `/api/asset-deposits/{id}/bank-approve` | Bank approves (mints AT tokens) |
| POST | `/api/asset-deposits/{id}/bank-reject` | Bank rejects |

### Key Service Methods (AssetDepositService)
- `submitRequest()` - Patient submits asset (gold/silver), bankId is null until hospital forwards
- `approveRequest()` - Hospital approves, assigns bankId, sets bankApprovalStatus=pending
- `approveRequestByBank()` - Bank approves, mints AT tokens (assetValue / AT_PRICE_PKR)
- `getBankRequests()` - Returns deposits filtered by bankId and bankApprovalStatus

### Entities
- **AssetDeposit** (table: `asset_deposits`) - assetId, patientId, bankId, assetType, assetValue, weight, status, bankApprovalStatus
- **MintRecord** (table: `mint_records`) - tracks AT minting events

---

## MARKETPLACE Package

Hospital admin creates trades, manages AT pool.

### Endpoints (MarketplaceController)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/marketplace/trades/hospital/{id}` | Get all trades for hospital |
| GET | `/api/marketplace/trades/hospital/{id}/patient-view` | Patient view of trades |
| GET | `/api/marketplace/pools/hospital/{id}/at` | Hospital AT pool summary |
| GET | `/api/marketplace/order-book` | Order book |
| POST | `/api/marketplace/trades` | Create new trade |
| PUT | `/api/marketplace/trades/{id}` | Update trade |
| PATCH | `/api/marketplace/trades/{id}/close` | Close trade (just updates status + P&L) |

### Key Service Methods (MarketplaceService)
- `createTrade()` - Creates trade with buy price, quantity, asset info
- `closeTrade()` - Sets status=CLOSED, calculates P&L (no profit distribution here)
- `getHospitalAtPool()` - Returns total AT, allocated AT, available AT

### AT Trading (AtTradingService)
- `initializeAtAssignment()` - Called when bank approves deposit, creates AT assignment for patient
- `getPatientAssetTokens()` - Returns patient's AT holdings with monetary values

### Other Services
- `HospitalAtPoolService` - Manages hospital AT pool entries
- `TradingSimulationService` - Simulates trade outcomes

### Key Entities
- **MarketplaceTrade** (table: `trades`) - tradeId, hospitalId, tradeType, status, openingPrice, closingPrice, profitLoss, volume
- **PatientAtAssignment** (table: `patient_at_assignments`) - tracks AT allocated to each patient
- **HospitalAtPoolEntry** (table: `hospital_at_pool_entries`) - hospital's pooled AT from patients

---

## PROFITALLOCATION Package

Hospital admin distributes trade profits to patients as HT tokens. Split percentages come from hospital settings.

### Endpoints (ProfitAllocationController)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/profit-allocation/preview` | Preview distribution (who gets what) |
| POST | `/api/profit-allocation/distribute` | Execute distribution (mints HT) |
| GET | `/api/profit-allocation/history` | Distribution history |

### Key Service Methods (ProfitAllocationService)
- `getPreview()` - Reads hospital's profit split settings (patient/hospital/bank %), calculates each patient's HT share based on their asset contribution
- `distribute()` - Executes: saves distribution record, mints HT to each patient, updates balances

### Profit Split (from `hospitals` table)
- `patient_profit_percent` (default 40%) - converted to HT for patients
- `hospital_profit_percent` (default 50%) - kept by hospital
- `bank_profit_percent` (default 10%) - goes to bank loan repayment

### Entities
- **ProfitDistribution** (table: `profit_distributions`) - total profit, percentages, hospital earnings
- **ProfitAllocation** (table: `profit_allocations`) - per-patient allocation records

---

## WALLET Package

Token balances and transfers.

### Endpoints (WalletController)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/wallet/patient/{userId}/summary` | AT + HT balances |
| GET | `/api/wallet/patient/{userId}/transactions` | Transaction history |
| POST | `/api/wallet/patient/transfer/ht` | Patient-to-patient HT transfer |
| POST | `/api/wallet/hospital/redeem/ht` | Hospital staff redeems patient HT |

### TokenPriceService
Reads token prices from `tokens` table in database. No hardcoded values.
- `getAtPricePkr()` - Price of 1 AT in PKR (from DB)
- `getHtPricePkr()` - Price of 1 HT in PKR (from DB)

### Entities
- **PatientTokenBalance** (table: `patient_token_balances`) - patientId, totalAt, totalHt

---

## SUBSCRIPTION Package

Monthly subscription plans with HT allocation.

### Endpoints (SubscriptionController)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/subscriptions/plans` | List active plans |
| POST | `/api/subscriptions/subscribe` | Subscribe to plan |
| DELETE | `/api/subscriptions/cancel/{userId}` | Cancel subscription |
| GET | `/api/subscriptions/hospital/plans` | Hospital manage plans |
| POST | `/api/subscriptions/hospital/plans` | Create plan |

### Key Flow
1. Patient subscribes to a plan
2. Monthly scheduler allocates HT to subscribed patients
3. HT credited to Subscription Health Card

---

## BANKINTEGRATION Package

Hospital-Bank partnership management.

### Endpoints (BankIntegrationController)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bank-integration/hospital/integrations` | Hospital views integrations |
| GET | `/api/bank-integration/hospital/available-banks` | Get unlinked banks |
| POST | `/api/bank-integration/hospital/integrations` | Hospital requests integration |
| POST | `/api/bank-integration/bank/integrations/{id}/approve` | Bank approves |
| POST | `/api/bank-integration/bank/integrations/{id}/reject` | Bank rejects |

### Flow
1. Hospital admin sends integration request to bank
2. Bank staff approves/rejects
3. Approved partnership enables deposit forwarding to that bank

### Entity
- **Partnership** (table: `partnerships`) - hospitalId, bankId, integrationStatus (PENDING/APPROVED/REJECTED)

---

## HOSPITAL Package

Hospital settings and staff management.

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/hospital/staff` | List hospital staff |
| GET | `/api/hospital/admin-settings` | Get hospital settings |
| PUT | `/api/hospital/admin-settings` | Update settings (name, prices, profit split) |

### Entity
- **Hospital** (table: `hospitals`) - hospitalName, address, patientProfitPercent, hospitalProfitPercent, bankProfitPercent, goldPricePerGram, silverPricePerGram

---

## DASHBOARD Package

### Endpoints (DashboardController)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/patient` | Patient summary (balances, deposits, cards) |
| GET | `/api/dashboard/hospital` | Hospital summary (AT minted, trades, patients) |
| GET | `/api/dashboard/bank` | Bank summary (deposits, partnerships) |
| GET | `/api/dashboard/asset-prices` | Current gold/silver prices |

---

## NOTIFICATION Package

### Endpoints (NotificationController)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications/received` | Get notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| POST | `/api/notifications/send` | Send notification |

---

## Core Business Flow

```
1. SIGNUP
   Patient/Hospital/Bank staff registers -> JWT token issued

2. BANK INTEGRATION
   Hospital admin -> Requests integration with bank
   Bank staff -> Approves integration (partnership APPROVED)

3. ASSET DEPOSIT
   Patient -> Submits gold/silver deposit (bankId = null)
   Hospital admin -> Approves, selects bank to forward to
   Bank staff -> Approves -> AT tokens minted (assetValue / AT_PRICE_PKR)

4. TRADING
   Hospital admin -> Creates trade with AT from pool
   Hospital admin -> Closes trade -> P&L calculated

5. PROFIT DISTRIBUTION (separate from trading)
   Hospital admin -> Previews distribution
   Hospital admin -> Distributes -> HT minted to patients based on:
     - Patient's asset contribution proportion
     - Hospital's patient_profit_percent setting (default 40%)

6. HT USAGE
   Patient -> Uses HT via Health Cards
   Patient -> Transfers HT to other patients
   Hospital staff -> Redeems patient HT for services
```

---

## Token Economics

| Token | Stored In | Price Source |
|-------|-----------|-------------|
| AT (Asset Token) | `patient_token_balances.total_at` | `tokens` table (`token_price` where symbol='AT') |
| HT (Health Token) | `patient_token_balances.total_ht` | `tokens` table (`token_price` where symbol='HT') |

- **AT minting formula:** `assetValue / AT_PRICE_PKR`
- **HT minting formula:** `patientSharePKR / HT_PRICE_PKR`
- Prices are NOT hardcoded - read from `tokens` table via `TokenPriceService`

---

## Database Tables (Key)

| Table | Purpose |
|-------|---------|
| `users` | All users (patients, admins, staff) |
| `roles` | Role definitions |
| `hospitals` | Hospital details + profit split settings |
| `banks` | Bank details |
| `partnerships` | Hospital-Bank integrations |
| `patients` | Patient profiles |
| `asset_deposits` | Deposit requests (3-tier approval) |
| `mint_records` | AT minting history |
| `trades` | Hospital trades |
| `patient_token_balances` | AT + HT balances per patient |
| `tokens` | Token definitions + prices (AT, HT) |
| `transactions` | All token transactions |
| `profit_distributions` | Profit distribution records |
| `profit_allocations` | Per-patient allocation details |
| `patient_cards` | Health cards (Asset/Subscription) |
| `subscription_plans` | Available plans |
| `patient_subscriptions` | Active subscriptions |
| `notifications` | In-app notifications |
| `activity_logs` | User activity logs |
