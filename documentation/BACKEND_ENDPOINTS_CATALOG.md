# SehatVault Backend Endpoints Catalog

## Base URL

All backend routes are exposed under the Spring Boot server base URL:

- `http://localhost:8000`
- API prefix: `/api`

This document lists the backend endpoints grouped by controller, with their full URL patterns and the purpose of each route.

---

## 1. Authentication

Base path: `/api/auth`

| Method | URL | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user account |
| POST | `/api/auth/signin` | Log in and receive a JWT token |
| GET | `/api/auth/hospitals` | Fetch hospital names for signup dropdowns |
| POST | `/api/auth/verify` | Verify a JWT token |
| GET | `/api/auth/me` | Return the current authenticated user |
| POST | `/api/auth/logout` | Log out the current user |
| PUT | `/api/auth/profile/{userId}` | Update auth-related profile details |

Logic summary:

- Signup creates the user and role-based records.
- Signin validates credentials and issues a JWT.
- Verify and me are used by the frontend to restore sessions and protect routes.

---

## 2. Asset Deposits

Base path: `/api/asset-deposits`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/asset-deposits/hospitals` | List available hospitals for deposit requests |
| POST | `/api/asset-deposits/requests` | Submit a new asset deposit request |
| GET | `/api/asset-deposits/hospital/requests` | View deposit requests for hospital review |
| GET | `/api/asset-deposits/bank/requests` | View deposit requests forwarded to a bank |
| GET | `/api/asset-deposits/mine` | View the current patient's own deposit requests |
| GET | `/api/asset-deposits/integrated-banks` | Fetch banks integrated with the hospital |
| POST | `/api/asset-deposits/{assetId}/approve` | Hospital approves and forwards a deposit |
| POST | `/api/asset-deposits/{assetId}/reject` | Hospital rejects a deposit |
| POST | `/api/asset-deposits/{assetId}/bank-approve` | Bank approves a deposit and enables minting flow |
| POST | `/api/asset-deposits/{assetId}/custody-confirm` | Confirm custody details for the asset |
| POST | `/api/asset-deposits/{assetId}/move-to-trading-pool` | Move asset tokens into the trading pool |
| GET | `/api/asset-deposits/hospital/pool2` | View hospital Pool 2 assets |
| GET | `/api/asset-deposits/hospital/pool1` | View hospital Pool 1 assets |
| POST | `/api/asset-deposits/{assetId}/bank-reject` | Bank rejects a forwarded deposit |

Logic summary:

- Patients submit the request once with supporting documents.
- Hospitals review and decide whether to forward to a bank.
- Banks perform the final approval step before tokenization.
- Custody and pool endpoints keep the physical asset lifecycle separated from the financial lifecycle.

---

## 3. Hospital and Staff Settings

Base paths: `/api/hospital`, `/api/hospital-admin/settings`, `/api/hospital-staff/settings`, `/api/staff`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/hospital/profit-settings` | Read hospital profit split settings |
| PUT | `/api/hospital/profit-settings` | Update hospital profit split settings |
| GET | `/api/hospital-admin/settings` | Get hospital admin settings |
| PUT | `/api/hospital-admin/settings` | Update hospital admin settings |
| GET | `/api/hospital-staff/settings` | Get hospital staff settings |
| PUT | `/api/hospital-staff/settings` | Update hospital staff settings |
| GET | `/api/staff` | List staff visible to the current hospital |
| GET | `/api/staff/all` | List all staff records |
| GET | `/api/staff/{staffId}` | Get one staff member by ID |
| POST | `/api/staff/invite` | Invite a new hospital staff member |
| PUT | `/api/staff/{staffId}/deactivate` | Deactivate a staff member |

Logic summary:

- Hospital settings control profit distribution and operational configuration.
- Staff endpoints support invitation, review, and activation control.

---

## 4. Profile and KYC

Base path: `/api/profile`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/profile` | Get the authenticated user's profile |
| GET | `/api/profile/{userId}` | Get a profile by user ID |
| GET | `/api/profile/hospital/patients` | List patients for the current hospital |
| GET | `/api/profile/hospital/{hospitalId}/patients` | List patients for a specific hospital |
| PUT | `/api/profile/{userId}` | Update a user profile |
| PUT | `/api/profile/{userId}/wallet` | Update wallet-related profile details |
| GET | `/api/profile/kyc/status` | Read KYC status |
| POST | `/api/profile/kyc/submit` | Submit KYC data |
| POST | `/api/profile/kyc/review/{userId}` | Review a patient's KYC submission |

Logic summary:

- The frontend uses these routes to complete profile editing and KYC submission.
- KYC status determines whether the patient can progress to certain financial workflows.

---

## 5. Wallet

Base path: `/api/wallet`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/wallet/patient/{userId}/summary` | Get AT and HT balance summary |
| GET | `/api/wallet/patient/{userId}/transactions` | Get all wallet transactions |
| GET | `/api/wallet/patient/{userId}/transactions/{tokenSymbol}` | Get transactions filtered by token symbol |
| POST | `/api/wallet/patient/transfer/ht` | Transfer HT between patients |
| POST | `/api/wallet/hospital/redeem/ht` | Hospital redeems patient HT |

Logic summary:

- Wallet summary aggregates token balances.
- Transaction history is the audit source for token movement.
- Token-specific filtering keeps AT and HT histories separate.

---

## 6. Dashboard

Base path: `/api/dashboard`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/dashboard/patient` | Patient dashboard summary |
| GET | `/api/dashboard/bank` | Bank dashboard summary |
| GET | `/api/dashboard/hospital` | Hospital dashboard summary |
| GET | `/api/dashboard/super-admin` | Super admin dashboard summary |
| GET | `/api/dashboard/asset-prices` | Fetch asset prices |
| GET | `/api/dashboard/hospital/asset-prices` | Hospital-specific asset price fallback |
| PUT | `/api/dashboard/hospital/asset-prices` | Update hospital asset prices |

Logic summary:

- Dashboard endpoints aggregate counts, balances, totals, and trends.
- Asset price endpoints support both the generic and hospital-scoped frontend flows.

---

## 7. Marketplace

Base path: `/api/marketplace`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/marketplace/trades/hospital/{hospitalId}` | Get hospital trades |
| GET | `/api/marketplace/trades/hospital/{hospitalId}/patient-view` | Get hospital trades in patient-friendly format |
| GET | `/api/marketplace/trades/{tradeId}/participants` | Get trade participants |
| GET | `/api/marketplace/pools/hospital/{hospitalId}/at` | Read hospital AT pool summary |
| GET | `/api/marketplace/order-book` | Read the order book |
| POST | `/api/marketplace/trades` | Create a new trade |
| PUT | `/api/marketplace/trades/{tradeId}` | Update a trade |
| PATCH | `/api/marketplace/trades/{tradeId}/close` | Close a trade |

Logic summary:

- Trades are persisted as backend records and then shown in different UI views.
- Pool and participant endpoints support proportional AT allocation and trade visibility.

---

## 8. AT Trading

Base path: `/api/marketplace/at-trading`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/marketplace/at-trading/patient/{patientId}/status` | Get trading status for a patient |
| GET | `/api/marketplace/at-trading/patient/{patientId}/available` | Get available AT for a patient |
| GET | `/api/marketplace/at-trading/me/asset-tokens` | Get current user's asset tokens |
| GET | `/api/marketplace/at-trading/patient/{patientId}/asset-tokens` | Get asset tokens for a patient |
| POST | `/api/marketplace/at-trading/trades/start-with-at` | Start a trade using AT |
| GET | `/api/marketplace/at-trading/patient/{patientId}/active-trades` | List active trades for a patient |
| POST | `/api/marketplace/at-trading/withdrawals/request` | Request AT withdrawal |
| GET | `/api/marketplace/at-trading/withdrawals/{requestId}/status` | Read withdrawal status |
| GET | `/api/marketplace/at-trading/patient/{patientId}/pending-ht-distributions` | View pending HT distributions |

Logic summary:

- This module handles the patient-facing AT lifecycle inside trading.
- It keeps trade entry, withdrawal request, and HT distribution states separate.

---

## 9. Profit Allocation

Base path: `/api/profit-allocation`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/profit-allocation/preview` | Preview profit allocation before execution |
| POST | `/api/profit-allocation/distribute` | Execute profit allocation |
| GET | `/api/profit-allocation/history` | View allocation history |

Logic summary:

- Preview shows how total profit will be split.
- Distribution executes the irreversible part of minting and persistence.
- History provides traceability.

---

## 10. Subscriptions

Base path: `/api/subscriptions`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/subscriptions/plans` | List active subscription plans |
| GET | `/api/subscriptions/patient/{userId}` | Get the patient subscription state |
| POST | `/api/subscriptions/subscribe` | Subscribe to a plan |
| POST | `/api/subscriptions/change` | Change to a new plan |
| GET | `/api/subscriptions/payment-history/{userId}` | Get payment history |
| DELETE | `/api/subscriptions/cancel/{userId}` | Cancel a subscription |
| GET | `/api/subscriptions/admin/plans` | Admin view of plans |
| POST | `/api/subscriptions/admin/plans` | Create a new plan |
| PUT | `/api/subscriptions/admin/plans/{subsId}` | Update a plan |
| DELETE | `/api/subscriptions/admin/plans/{subsId}` | Delete a plan |

Logic summary:

- Plans are the hospital-defined subscription products.
- The patient subscription state determines monthly HT benefit eligibility.
- Admin plan routes manage the plan catalog itself.

---

## 11. Health Cards

Base path: `/api/health-cards`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/health-cards/patient/{userId}` | Get all cards for a patient |
| GET | `/api/health-cards/patient/{userId}/type/{cardType}` | Get cards by type |
| GET | `/api/health-cards/patient/{userId}/active` | Get only active cards |

Logic summary:

- Cards are filtered by issue type such as subscription or asset-based.
- Card balance data mirrors wallet-side HT usage.

---

## 12. Emergency Redemptions

Base path: `/api/emergency-redemptions`

| Method | URL | Purpose |
|---|---|---|
| POST | `/api/emergency-redemptions` | Create an emergency redemption request |
| GET | `/api/emergency-redemptions/patient/{patientUserId}` | List patient emergency requests |
| GET | `/api/emergency-redemptions/hospital/pending` | List pending hospital requests |
| POST | `/api/emergency-redemptions/{requestId}/approve` | Approve an emergency redemption |
| POST | `/api/emergency-redemptions/{requestId}/reject` | Reject an emergency redemption |

Logic summary:

- Patients request urgent AT conversion with acknowledgment of trade-off.
- Hospital staff review and decide based on urgency and conversion values.

---

## 13. Bank Integrations

Base path: `/api/bank-integrations`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/bank-integrations/hospital` | List hospital-side bank integrations |
| GET | `/api/bank-integrations/hospital/available-banks` | List banks available for linking |
| POST | `/api/bank-integrations/hospital` | Request a bank integration |
| DELETE | `/api/bank-integrations/hospital/{partnershipId}` | Remove a hospital integration |
| GET | `/api/bank-integrations/bank` | List bank-side hospital integrations |
| POST | `/api/bank-integrations/bank/{partnershipId}/approve` | Approve a hospital integration |
| POST | `/api/bank-integrations/bank/{partnershipId}/reject` | Reject a hospital integration |
| DELETE | `/api/bank-integrations/bank/{partnershipId}` | Remove a bank-side integration |
| GET | `/api/bank-integrations/bank/hospital/{hospitalId}/staff` | List hospital staff visible to the bank |

Logic summary:

- The partnership status controls whether a bank can support hospital deposit flows.
- Hospital and bank users see different views of the same integration record.

---

## 14. Fractionalization

Base path: `/api/fractionalization`

| Method | URL | Purpose |
|---|---|---|
| POST | `/api/fractionalization/requests` | Create a fractionalization request |
| GET | `/api/fractionalization/requests/mine` | List my fractionalization requests |
| GET | `/api/fractionalization/admin/requests/pending` | List admin-pending requests |
| POST | `/api/fractionalization/admin/requests/{requestId}/forward` | Forward a request to insurer review |
| POST | `/api/fractionalization/admin/requests/{requestId}/approve` | Approve and issue NOC automatically |
| GET | `/api/fractionalization/insurer/requests/pending` | List insurer-pending requests |
| POST | `/api/fractionalization/insurer/requests/{requestId}/approve` | Insurer approves the request |
| POST | `/api/fractionalization/admin/requests/{requestId}/reject` | Admin rejects the request |
| GET | `/api/fractionalization/allocations/beneficiary` | List beneficiary allocations |
| POST | `/api/fractionalization/allocations/redeem` | Redeem from the user's own profile |
| GET | `/api/fractionalization/allocations/primary` | List primary allocations |
| POST | `/api/fractionalization/hospital/redeem` | Redeem allocation at hospital |
| POST | `/api/fractionalization/allocations/{allocationId}/revoke` | Revoke an allocation |

Logic summary:

- Requests move through admin and insurer approval stages.
- NOC data is attached when the request becomes active.
- Allocations can be redeemed, revoked, or inspected separately.

---

## 15. Insurance

Base path: `/api/insurance`

| Method | URL | Purpose |
|---|---|---|
| POST | `/api/insurance/noc/issue` | Issue a NOC certificate |
| GET | `/api/insurance/noc/{fractionalizationRequestId}` | Get a NOC certificate by request ID |
| GET | `/api/insurance/patient/{patientId}/noc-certificates` | List NOC certificates for a patient |
| POST | `/api/insurance/noc/{nocId}/revoke` | Revoke a NOC certificate |

Logic summary:

- NOC issuance is conditional on document and approval readiness.
- Revocation preserves the certificate history for audit purposes.

---

## 16. Reports

Base path: `/api/reports`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/reports/history` | List generated reports |
| POST | `/api/reports/generate` | Generate a new report |
| DELETE | `/api/reports/{reportId}` | Delete a report |

Logic summary:

- Reports are generated and tracked as backend-managed artifacts.
- History and deletion endpoints support admin operations.

---

## 17. Notifications

Base path: `/api/notifications`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/notifications/user/{userId}` | Get received notifications |
| GET | `/api/notifications/user/{userId}/sent` | Get sent notifications |
| GET | `/api/notifications/user/{userId}/unread-count` | Get unread notification count |
| PATCH | `/api/notifications/user/{userId}/{notificationId}/read` | Mark one notification as read |
| PATCH | `/api/notifications/user/{userId}/read-all` | Mark all notifications as read |
| DELETE | `/api/notifications/user/{userId}/{notificationId}/received` | Delete a received notification |
| DELETE | `/api/notifications/user/{userId}/{notificationId}/sent` | Delete a sent notification |
| POST | `/api/notifications/user/{userId}/delete-selected/received` | Bulk delete selected received notifications |
| POST | `/api/notifications/user/{userId}/delete-selected/sent` | Bulk delete selected sent notifications |
| DELETE | `/api/notifications/user/{userId}/received` | Delete all received notifications |
| DELETE | `/api/notifications/user/{userId}/sent` | Delete all sent notifications |
| POST | `/api/notifications/send` | Send a notification |

Logic summary:

- Notifications are split into received and sent streams.
- Read and delete actions are state transitions, not hard deletes in the UI.

---

## 18. Activity and Audit Trail

Base paths: `/api/activity`, `/api/activity/audit`

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/activity/patient/{userId}/transactions` | Get patient transaction activity |
| GET | `/api/activity/patient/{userId}/logs` | Get patient activity logs |
| GET | `/api/activity/audit/patient-logs` | Get patient audit logs |
| GET | `/api/activity/audit/hospital-logs` | Get hospital audit logs |

Logic summary:

- Activity endpoints are user-facing and transaction-friendly.
- Audit endpoints are stricter and are intended for review and compliance.

---

## 19. What the Frontend Uses Most Often

The frontend service modules are built around these backend groups:

- Authentication: `/api/auth`
- Dashboard summaries: `/api/dashboard`
- Deposits: `/api/asset-deposits`
- Wallet: `/api/wallet`
- Marketplace: `/api/marketplace` and `/api/marketplace/at-trading`
- Profit allocation: `/api/profit-allocation`
- Subscriptions: `/api/subscriptions`
- Health cards: `/api/health-cards`
- Emergency redemptions: `/api/emergency-redemptions`
- Bank integrations: `/api/bank-integrations`
- Fractionalization: `/api/fractionalization`
- Insurance NOC: `/api/insurance`
- Notifications: `/api/notifications`
- Activity and audit: `/api/activity` and `/api/activity/audit`
- Profile and KYC: `/api/profile`
- Reports: `/api/reports`

---

## 20. Notes on Route Behavior

- Some frontend services include fallback URLs or timeout guards.
- Several backend endpoints are role-protected and will only respond for the correct user category.
- The frontend often normalizes numbers and timestamps because backend responses may include serialized string values.
- The same business record can appear in multiple UI areas, such as wallet, dashboard, activity, notifications, and audit views.

---

## 21. Summary

This catalog lists the backend route surface for the SehatVault system. It can be used as a reference for frontend integration, API testing, and documentation work. The routes are organized by controller and represent the current backend behavior exposed to the UI and other services.
