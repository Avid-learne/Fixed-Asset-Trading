# SehatVault Frontend and Backend Use-Case Logic

## 1. Purpose

This document explains how the frontend and backend work together in the SehatVault platform, what each major use case does, and which logic is applied at each step.

The system is a healthcare-fintech platform with three main layers:

- Frontend: Next.js application in `hospitalfrontend`
- Backend: Spring Boot API in `SehatVaultBackend`
- Contracts: Solidity contracts in `contracts`

The business model connects patient onboarding, asset deposit, token minting, trading, profit allocation, subscriptions, health cards, and emergency redemption.

---

## 2. High-Level Architecture

### Frontend

The frontend is a role-based Next.js app. It is split into route groups and service modules.

Main responsibilities:

- Render role-specific dashboards and forms
- Call backend APIs through service modules
- Store and forward JWT tokens in requests
- Normalize API data for UI display
- Handle loading, timeout, empty-response, and error states
- Keep user flows guided with validation and step-by-step forms

Important frontend service modules:

- `services/authService.ts`
- `services/dashboardService.ts`
- `services/depositRequestService.ts`
- `services/walletService.ts`
- `services/marketplaceService.ts`
- `services/profitAllocationService.ts`
- `services/subscriptionService.ts`
- `services/healthCardService.ts`
- `services/fractionalizationService.ts`
- `services/emergencyRedemptionService.ts`
- `services/bankIntegrationService.ts`
- `services/activityService.ts`
- `services/profileService.ts`
- `services/patientService.ts`

### Backend

The backend is a Spring Boot API that provides authentication, role-based access, business rules, persistence, and workflow state transitions.

Main responsibilities:

- Validate requests and user roles
- Apply business rules for deposits, minting, trading, and allocation
- Read and write relational data in PostgreSQL
- Return consistent API responses for the frontend
- Emit activity, notification, and audit data
- Coordinate wallet, card, and profit flows

### Contracts

The Solidity contracts hold the on-chain token logic:

- `AssetToken.sol` for AT minting, burning, and deposit metadata
- `HealthToken.sol` for HT minting and burning
- `HospitalFinancials.sol` for controlled minting, trade recording, profit distribution, and HT redemption

The backend uses contract-generated artifacts to interact with the blockchain layer where needed.

---

## 3. Main User Roles

### Patient

Patients can:

- Sign up and sign in
- Complete profile and KYC data
- Submit asset deposit requests
- View wallet balances and transaction history
- View linked assets and health cards
- Subscribe to plans
- Participate in marketplace and allocation-related flows
- Submit emergency redemption requests
- Receive notifications and activity logs

### Hospital Staff / Hospital Admin

Hospital-side users can:

- Review patient deposit requests
- Confirm custody and asset details
- Approve or reject deposit flows
- Mint AT through the backend/contract flow
- Manage pools and trading allocation
- Distribute HT after profit events
- Manage subscriptions, staff, settings, reports, and notifications

### Bank Staff / Bank Officer

Bank-side users can:

- Review forwarded deposit requests
- Approve or reject deposits
- Participate in hospital-bank integration flows
- Review compliance, audits, reports, and asset movement
- Oversee financial and approval activity

### Super Admin

Super admin users can:

- Manage hospitals and banks
- Create and verify institutions
- Review system-wide dashboards and reports
- Review logs, audits, and financial summaries
- Oversee marketplace and notifications

---

## 4. Frontend Use Cases and Logic

### 4.1 Authentication and Session Handling

Frontend entry points:

- `app/auth/page.tsx`
- `app/auth/error/page.tsx`
- role-based middleware and protected layouts

Logic applied:

- The user signs up or signs in through the auth UI
- The frontend sends credentials to the backend auth endpoints
- A JWT token is stored and reused in service calls
- Protected pages check the current session/role before rendering
- If the token is missing or invalid, the UI redirects the user back to login

Frontend validation patterns:

- Required fields are checked before submission
- Failed responses are shown as readable errors
- Unauthorized requests are handled with explicit fallback messages

### 4.2 Patient Dashboard and Profile

Relevant pages:

- `app/patient/dashboard/page.tsx`
- `app/patient/profile/page.tsx`
- `app/patient/profile/info/page.tsx`
- `app/patient/profile/kyc/page.tsx`
- `app/patient/settings/page.tsx`

Relevant services:

- `services/profileService.ts`
- `services/patientService.ts`
- `services/dashboardService.ts`

Logic applied:

- The dashboard loads patient summary data from `/api/dashboard/patient`
- KYC-complete state is checked before allowing some actions
- Missing profile data is surfaced as a warning in the UI
- Profile forms keep identity fields editable so the user can finish KYC

### 4.3 Asset Deposit and Fractionalization

Relevant pages:

- `app/patient/deposit/page.tsx`
- `app/patient/fractionalization/page.tsx`
- `app/hospitaladmin/deposits/page.tsx`
- `app/bank/deposits/page.tsx`
- `app/hospitaladmin/fractionalization/page.tsx`
- `app/patient/linked-assets/page.tsx`

Relevant services:

- `services/depositRequestService.ts`
- `services/fractionalizationService.ts`
- `services/assetService.ts`

Logic applied in the UI:

- The patient submits an asset request with asset type, weight, value, and documents
- The frontend sends the request to the backend as JSON
- Hospitals see pending requests in their queue
- Banks see forwarded requests after hospital approval
- Request status is shown as a workflow state, not a raw database record
- Fractionalization requests can include beneficiaries and percentage splits

The frontend does not decide business approval by itself. It only presents the workflow and sends the action request. The backend decides whether the request can move forward.

### 4.4 Wallet, Token Balances, and Transactions

Relevant pages:

- `app/patient/wallet/page.tsx`
- `app/patient/wallet/at/page.tsx`
- `app/patient/wallet/ht/page.tsx`
- `app/patient/tokens/page.tsx`
- `app/patient/history/page.tsx`

Relevant service:

- `services/walletService.ts`

Logic applied:

- The UI requests balance summary and transaction history for the logged-in user
- AT and HT histories are separated so the user can inspect each token stream independently
- Response values are converted to numbers before display
- Patient-to-patient HT transfer is exposed as a separate action
- Transaction rows show symbol, type, amount, description, hashes, block number, and timestamp when available

### 4.5 Health Cards

Relevant pages:

- `app/patient/health-card/page.tsx`

Relevant service:

- `services/healthCardService.ts`

Logic applied:

- The UI fetches health cards by patient ID
- Cards can be filtered by type: `SUBSCRIPTION` or `ASSET`
- Active cards can be fetched separately
- The frontend uses a timeout so a slow backend does not leave the page hanging indefinitely

### 4.6 Marketplace and Trading Views

Relevant pages:

- `app/patient/marketplace/page.tsx`
- `app/hospitaladmin/marketplace/page.tsx`
- `app/hospital/marketplace/page.tsx`
- `app/admin/marketplace/page.tsx`

Relevant service:

- `services/marketplaceService.ts`

Logic applied:

- The frontend maps backend trade data into UI-friendly trade cards and tables
- Hospital pool information is converted into available, allocated, and total AT figures
- Order book data is displayed as bid/ask levels with spread information
- Trade participant selection is represented separately so the UI can attach patients and assets to a trade
- Market data is normalized so the same component can show patient, hospital, and admin views

### 4.7 Profit Allocation

Relevant pages:

- `app/hospitaladmin/allocation/page.tsx`
- `app/hospital/profit/page.tsx`
- `app/admin/financial/page.tsx`

Relevant service:

- `services/profitAllocationService.ts`

Logic applied:

- The frontend first requests a preview of the profit split
- The preview shows patient, hospital, and bank shares before execution
- When the user confirms, the frontend posts the final total profit to the backend
- Allocation history is then loaded for auditability
- This keeps the UI safe by showing a preview before any irreversible action

### 4.8 Subscriptions

Relevant pages:

- `app/patient/subscription/page.tsx`
- `app/hospitaladmin/subscriptions/page.tsx`

Relevant service:

- `services/subscriptionService.ts`

Logic applied:

- The patient sees only active subscription plans
- Plan selection is tied to payment data and card data in the form
- The frontend checks whether the patient already has an active subscription
- Plan changes and cancellations are separate actions, which makes the workflow explicit
- Payment history is fetched for transparency and support handling

### 4.9 Emergency Redemption

Relevant pages:

- `app/patient/emergency-redemption/page.tsx`
- `app/hospitaladmin/emergency-redemptions/page.tsx`

Relevant service:

- `services/emergencyRedemptionService.ts`

Logic applied:

- Patients submit an emergency request with requested AT amount and reason
- Staff review the pending list and decide to approve or reject
- Approval includes urgency level, conversion rate, and approved AT amount
- The UI preserves a clear distinction between request creation and staff decision
- The trade-off acknowledgment is captured before submission

### 4.10 Bank Integration

Relevant pages:

- `app/bank/integrations/page.tsx`
- `app/hospitaladmin/banks/page.tsx`
- `app/admin/banks/page.tsx`

Relevant service:

- `services/bankIntegrationService.ts`

Logic applied:

- Hospitals request a bank integration
- Banks can approve, reject, or remove an integration
- The UI uses separate views for hospital-side and bank-side integration management
- Integration status is shown as pending, approved, or rejected so users can follow the partnership lifecycle

### 4.11 Notifications, Activity, and Audit

Relevant pages:

- `app/patient/notifications/page.tsx`
- `app/hospitaladmin/notifications/page.tsx`
- `app/bank/notifications/page.tsx`
- `app/admin/notifications/page.tsx`
- `app/patient/activity/page.tsx`
- `app/admin/logs/page.tsx`
- `app/admin/logs/audits/page.tsx`
- `app/admin/logs/errors/page.tsx`
- `app/admin/logs/transactions/page.tsx`

Relevant services:

- `services/activityService.ts`
- `services/notificationService.ts`
- `services/auditLogService.ts`

Logic applied:

- The frontend separates notification feeds by role
- Activity and audit screens are used to present historical actions in an ordered way
- Transaction-like events are surfaced as logs for traceability
- This supports support staff, admin review, and user-facing history pages

### 4.12 Admin and Operations Console

Relevant pages:

- `app/admin/dashboard/page.tsx`
- `app/admin/users/page.tsx`
- `app/admin/settings/page.tsx`
- `app/admin/hospitals/page.tsx`
- `app/admin/hospitals/create/page.tsx`
- `app/admin/hospitals/[id]/page.tsx`
- `app/admin/banks/page.tsx`
- `app/admin/banks/create/page.tsx`
- `app/admin/banks/[id]/page.tsx`
- `app/admin/reports/page.tsx`
- `app/admin/analytics/page.tsx`
- `app/admin/audit/page.tsx`
- `app/admin/financial/page.tsx`

Logic applied:

- Admin pages are broad system summaries, not patient-specific views
- Institution management pages are used to create, verify, disable, and inspect hospitals and banks
- Report pages read aggregated backend summaries
- Audit pages are used to review sensitive actions and operational events

---

## 5. Backend Use Cases and Logic

### 5.1 Authentication and User Management

Controller:

- `auth/controller/AuthController.java`

Service:

- `auth/service/AuthService.java`

Main endpoint prefix:

- `/api/auth`

Use cases:

- Signup
- Signin
- Token verification
- Current-user lookup
- Logout
- Profile update
- Hospital name listing

Logic applied:

- Passwords are validated on sign-in
- JWT tokens are issued for authenticated sessions
- User roles control access to downstream endpoints
- Signup can create role-specific data, such as a patient record or hospital record
- DTO fields must match service expectations exactly

### 5.2 Asset Deposit Workflow

Controller:

- `assetdeposit/controller/AssetDepositController.java`

Service:

- `assetdeposit/service/AssetDepositService.java`

Main endpoint prefix:

- `/api/asset-deposits`

Use cases:

- Patient submits deposit request
- Hospital reviews deposit request
- Bank reviews forwarded request
- Hospital approves or rejects
- Bank approves or rejects
- Custody confirmation
- Move to trading pool
- Pool views for hospital-side tracking

Logic applied:

- Requests move through a state machine instead of being overwritten
- Hospital approval can assign a bank and forward the deposit
- Bank approval is the point where AT minting is triggered
- Custody confirmation keeps physical asset handling separate from financial approval
- Pool states are split so assets can be tracked as operationally locked or trade-ready

### 5.3 Bank Integration Workflow

Controller:

- `bankintegration/controller/BankIntegrationController.java`

Service:

- `bankintegration/service/BankIntegrationService.java`

Main endpoint prefix:

- `/api/bank-integrations`

Use cases:

- Hospital requests a bank partnership
- Bank approves or rejects the request
- Bank can later remove an integration

Logic applied:

- Only approved partnerships can support downstream deposit forwarding
- Integration status controls whether a bank appears in the eligible lists
- The partnership table acts as the source of truth for hospital-bank connectivity

### 5.4 Dashboard and Summary Reporting

Controller:

- `dashboard/controller/DashboardController.java`

Service:

- `dashboard/service/DashboardService.java`

Main endpoint prefix:

- `/api/dashboard`

Use cases:

- Patient summary
- Hospital summary
- Bank summary
- Super admin summary
- Asset price lookup

Logic applied:

- The backend aggregates multiple tables into one response object
- Summary endpoints expose counts, totals, and trends rather than raw rows
- Asset prices are read from the backend service layer, not hardcoded in the frontend

### 5.5 Wallet and Token Ledger

Controller:

- `wallet/controller/WalletController.java`

Service:

- `wallet/service/WalletService.java`
- `wallet/service/TokenPriceService.java`

Main endpoint prefix:

- `/api/wallet`

Use cases:

- Patient wallet summary
- Wallet transaction list
- Token-specific transaction filtering
- HT transfer
- Hospital HT redemption

Logic applied:

- Wallet balances are derived from ledger tables
- Transaction histories are token-aware
- Transfer and redemption actions are written to the transaction history so they remain auditable
- Token pricing is pulled from data tables instead of being hardcoded

### 5.6 Marketplace and Trading

Controllers:

- `marketplace/controller/MarketplaceController.java`
- `marketplace/controller/AtTradingController.java`

Services:

- `marketplace/service/MarketplaceService.java`
- `marketplace/service/TradingSimulationService.java`
- `marketplace/service/HospitalAtPoolService.java`
- `marketplace/service/AtTradingService.java`

Main endpoint prefixes:

- `/api/marketplace`
- `/api/marketplace/at-trading`

Use cases:

- Create trades
- Update trades
- Close trades
- Execute simulated trades
- Read hospital AT pool information
- Assign patients and assets to trades
- Track order book levels

Logic applied:

- Trades are simulated, not live-market connected
- AT pool entries are used to decide how much AT is available for a trade
- Proportional burn logic prevents one asset from being treated as the entire pool
- Trade closure records profit or loss at the event level
- Participant data is preserved so allocation can be traced back to patient assets

### 5.7 Profit Allocation

Controller:

- `profitallocation/controller/ProfitAllocationController.java`

Service:

- `profitallocation/service/ProfitAllocationService.java`

Main endpoint prefix:

- `/api/profit-allocation`

Use cases:

- Preview distribution
- Execute distribution
- Read allocation history

Logic applied:

- The system calculates shares using configured hospital profit split settings
- Patient allocation is proportional to asset contribution
- The backend persists the distribution before/after minting HT so the operation is auditable
- Preview and execution are separate to reduce accidental irreversible actions

### 5.8 Subscription Management

Controller:

- `subscription/controller/SubscriptionController.java`

Service:

- `subscription/service/SubscriptionService.java`

Main endpoint prefix:

- `/api/subscriptions`

Use cases:

- List plans
- Subscribe
- Change plan
- Cancel subscription
- Read payment history

Logic applied:

- Plans are hospital-specific
- HT allocation is tied to active plans
- Payment records are tracked separately from the subscription state
- Monthly allocation can be scheduled server-side and consumed by the health card layer

### 5.9 Health Cards

Controller:

- `healthcard/controller/HealthCardController.java`

Service:

- `healthcard/service/HealthCardService.java`

Main endpoint prefix:

- `/api/health-cards`

Use cases:

- View patient cards
- Filter by card type
- View active cards only

Logic applied:

- Cards are split by type, mainly `SUBSCRIPTION` and `ASSET`
- Each card is tied to the patient wallet context
- HT balance on the card is kept as a visible payment source for healthcare usage

### 5.10 Fractionalization and Insurance NOC

Controllers:

- `fractionalization/controller/FractionalizationController.java`
- `insurance/controller/InsuranceController.java`

Services:

- `fractionalization/service/FractionalizationService.java`
- `insurance/service/InsuranceService.java`

Main endpoint prefixes:

- `/api/fractionalization`
- `/api/insurance`

Use cases:

- Patient submits fractionalization request
- Admin forwards request to insurer
- Insurer approves or rejects
- NOC is issued when requirements are met
- Beneficiaries receive allocations based on configured fraction percentages

Logic applied:

- Requests are blocked until mandatory supporting documents and approval conditions are satisfied
- NOC details are stored with validity and issuer metadata
- Beneficiary splits are explicit so the same request can support multiple recipients

### 5.11 Emergency Redemption

Controller:

- `emergencyredemption/controller/EmergencyRedemptionController.java`

Service:

- `emergencyredemption/service/EmergencyRedemptionService.java`

Main endpoint prefix:

- `/api/emergency-redemptions`

Use cases:

- Patient submits a request to convert AT for urgent medical needs
- Hospital staff reviews the request
- Staff approve or reject the redemption

Logic applied:

- The user must acknowledge the trade-off before submission
- Approval requires urgency classification and conversion details
- The output is tied back to wallet and transaction records

### 5.12 Activity, Notifications, and Audit Trail

Controllers:

- `activity/controller/ActivityController.java`
- `notification/controller/NotificationController.java`
- `audittrail/controller/AuditTrailController.java`

Services:

- `activity/service/ActivityService.java`
- `notification/service/NotificationService.java`
- `audittrail/service/AuditTrailService.java`

Main endpoint prefixes:

- `/api/activity`
- `/api/notifications`
- `/api/activity/audit`

Use cases:

- Fetch user activity
- Fetch transaction events
- Fetch notifications
- Mark notifications as read
- Review audit history

Logic applied:

- Notifications are role-aware and action-driven
- Activity logs are used as a human-readable history layer
- Audit logs provide a stricter, admin-oriented trace for sensitive operations

### 5.13 Hospital, Staff, Profile, and Report Administration

Controllers:

- `hospital/controller/HospitalController.java`
- `hospital/controller/HospitalAdminSettingsController.java`
- `hospital/controller/HospitalStaffController.java`
- `hospital/controller/HospitalStaffSettingsController.java`
- `profile/controller/ProfileController.java`
- `report/controller/ReportController.java`
- `bank/controller` and `admin`-facing controllers across the system

Use cases:

- Manage hospital settings
- Manage staff
- Update profile data
- Read reports
- Review compliance and operational summaries

Logic applied:

- Settings are separated by role so staff cannot overwrite admin-only controls
- Report endpoints aggregate data for dashboard and export views
- Profile data is reused by KYC, wallet, and authorization flows

---

## 6. Cross-Layer Logic Applied by the System

### 6.1 JWT and Authorization

- The frontend sends `Authorization: Bearer <token>` on protected calls
- The backend validates the token before processing role-specific actions
- Role checks prevent users from reaching endpoints that do not belong to them

### 6.2 Response Shape

Most frontend services expect a common response envelope:

- `success`
- `message`
- `data`

This lets the UI surface backend failures cleanly without guessing the payload shape.

### 6.3 Data Normalization

The frontend converts many values into numbers before rendering:

- balances
- token amounts
- profit shares
- trade figures
- allocation values

This is necessary because APIs may return numeric values as strings depending on the serializer or database layer.

### 6.4 Timeout and Fallback Handling

Some services use explicit timeout guards or fallback routes.

Examples:

- Health card fetches use a 10-second timeout
- Dashboard asset price fetch has a hospital-route fallback
- Some services return empty arrays instead of crashing when optional data is missing

### 6.5 State Transitions

The backend uses status fields to keep workflows controlled.

Typical transitions:

- `PENDING` -> `APPROVED` -> `ACTIVE`
- `PENDING` -> `REJECTED`
- `OPEN` -> `CLOSED`
- `PENDING` -> `ISSUED` -> `REVOKED`
- `WITH_PATIENT` -> `AVAILABLE` -> `UNAVAILABLE`

This prevents the frontend from directly mutating final state without authorization.

### 6.6 Auditability

Important actions are recorded as:

- wallet transactions
- activity records
- notifications
- audit logs
- blockchain token events

This gives the system traceability across UI, backend, and contracts.

---

## 7. End-to-End Scenario Flows

### 7.1 Patient Onboarding Flow

1. Patient opens signup page.
2. Frontend posts credentials and identity details.
3. Backend creates the user and role mapping.
4. Patient logs in and receives a JWT.
5. Profile/KYC pages show missing fields if completion is still required.

### 7.2 Asset Deposit to AT Minting Flow

1. Patient submits an asset deposit request.
2. Hospital reviews and approves it.
3. Bank reviews the forwarded request.
4. After final approval, the backend records the asset and minting result.
5. AT is reflected in wallet, dashboard, and activity history.
6. Contract events and backend transaction records preserve the audit trail.

### 7.3 Trading and Profit Distribution Flow

1. Hospital selects AT pool resources for a trade.
2. Trade is created or simulated.
3. Trade result is recorded.
4. Profit preview is calculated.
5. Profit is distributed as HT to eligible recipients.
6. Wallets, cards, and histories are updated.

### 7.4 Subscription and Health Benefit Flow

1. Patient selects a plan.
2. Payment is submitted and stored.
3. Active plan is reflected in dashboard and card state.
4. Monthly HT allocations can be shown on the subscription card.
5. Payment history and card history remain queryable.

### 7.5 Emergency Redemption Flow

1. Patient submits an emergency redemption request.
2. Hospital staff reviews the case.
3. Staff approves or rejects it using urgency and conversion inputs.
4. AT/HT ledger updates and activity records are created.

### 7.6 Bank Integration Flow

1. Hospital requests a bank partnership.
2. Bank reviews and approves or rejects it.
3. Only approved partnerships are used for downstream deposit routing.
4. Integration status is shown in hospital and bank views.

---

## 8. Practical Notes for Development

- Keep frontend service modules in sync with backend route prefixes.
- Keep DTO fields aligned with service method usage.
- Treat transaction hashes, token events, and workflow statuses as primary audit data.
- Do not hardcode values that should be read from the backend or database, such as prices, profit splits, or integration status.
- Use the backend as the source of truth for workflow decisions.

---

## 9. Summary

The frontend is responsible for presentation, request orchestration, and user experience. The backend is responsible for validation, role control, persistence, and business rules. The contract layer enforces token minting and burning logic for AT and HT. Together, they implement a complete healthcare-fintech workflow covering onboarding, deposits, minting, trading, allocation, subscriptions, cards, redemption, and administration.
