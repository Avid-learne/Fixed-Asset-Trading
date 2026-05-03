# Blockchain Integration Architecture

## 1. Objective

This document explains how blockchain is integrated into the SehatVault project, where it should be used, which backend endpoints should trigger blockchain behavior, and how the frontend, backend, and smart contracts work together.

The blockchain layer is used to provide:

- Token issuance for patient assets and healthcare benefits
- Wallet-level transfers and burns
- Traceability of minting, profit distribution, and redemption events
- Tamper-resistant proof of financial activity
- A local development and testing workflow through Hardhat

---

## 2. Blockchain Stack in This Project

### 2.1 Smart Contracts

The Solidity contracts are the core blockchain layer:

- [contracts/src/AssetToken.sol](../contracts/src/AssetToken.sol) - AT token contract
- [contracts/src/HealthToken.sol](../contracts/src/HealthToken.sol) - HT token contract
- [contracts/src/HospitalFinancials.sol](../contracts/src/HospitalFinancials.sol) - business contract for minting, trade recording, profit distribution, and redemption

### 2.2 Frontend Web3 Layer

The frontend contains the actual blockchain integration code:

- [hospitalfrontend/lib/web3.ts](../hospitalfrontend/lib/web3.ts) - provider, signer, wallet connection, network switching, and contract addresses
- [hospitalfrontend/services/blockchainService.ts](../hospitalfrontend/services/blockchainService.ts) - ethers contract wrappers for AssetToken, HealthToken, and HospitalFinancials
- [hospitalfrontend/app/blockchain-test/page.tsx](../hospitalfrontend/app/blockchain-test/page.tsx) - local blockchain test page

### 2.3 Network and Runtime

The project is set up for a local Hardhat chain:

- Chain ID: `31337`
- RPC: `http://127.0.0.1:8545`
- Wallet connection: MetaMask
- Contract addresses are injected through environment variables

Required frontend env vars:

- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_ASSET_TOKEN_ADDRESS`
- `NEXT_PUBLIC_HEALTH_TOKEN_ADDRESS`
- `NEXT_PUBLIC_HOSPITAL_FINANCIALS_ADDRESS`

---

## 3. Blockchain Design Principle

The project should use a hybrid model:

- Backend remains the source of truth for user accounts, workflow state, KYC, approvals, reports, and audit trails
- Blockchain is used for token state, immutable transaction proof, and contract events
- Frontend signs blockchain transactions through MetaMask when user action requires on-chain execution
- Backend stores the resulting transaction hash and status so the off-chain records stay synchronized

This is important because not every workflow should be on-chain. Only the parts that need token immutability, wallet movement, or cryptographic proof should touch the chain.

---

## 4. Smart Contract Responsibilities

### 4.1 AssetToken

Purpose:

- Represents Asset Tokens (AT)
- Stores per-deposit metadata
- Allows mint and burn by admin role only

Main blockchain actions:

- `mint(address to, uint256 amount)`
- `burn(address from, uint256 amount)`
- `setDepositMetadata(uint256 depositId, string metadata)`

Use case:

- AT is minted after approved asset custody and verification
- Deposit metadata can store an IPFS hash, document reference, or off-chain proof link

### 4.2 HealthToken

Purpose:

- Represents Health Tokens (HT)
- Supports controlled minting and burning

Main blockchain actions:

- `mint(address to, uint256 amount)`
- `burn(address from, uint256 amount)`

Use case:

- HT is distributed as patient benefit, subscription benefit, or profit share
- HT is burned when redeemed for hospital services or reversed by an admin-controlled workflow

### 4.3 HospitalFinancials

Purpose:

- Coordinates the financial token lifecycle
- Knows both token contracts
- Records trade and profit events

Main blockchain actions:

- `mintAssetToken(patient, depositId, amountAT, metadata)`
- `recordTrade(investedAT, profit)`
- `distributeProfit(tradeId, recipients, amountsHT)`
- `redeemHealthToken(patient, amountHT, serviceType)`

Use case:

- This is the main business-facing blockchain contract
- It is the contract that should be used when the app needs a single orchestrating contract for minting or settlement flows

---

## 5. How the Frontend Connects to Blockchain

### 5.1 Wallet Connection

The frontend uses MetaMask via `window.ethereum` and `ethers`:

- `connectWallet()` switches to the Hardhat local network
- `getProvider()` connects read-only to the chain
- `getSigner()` creates a signer for contract write actions
- `formatTokenAmount()` and `parseTokenAmount()` convert token values using 18-decimal Ether units

Relevant file:

- [hospitalfrontend/lib/web3.ts](../hospitalfrontend/lib/web3.ts)

### 5.2 Contract Access

The frontend contract wrappers load ABI and contract addresses:

- `AssetTokenABI.json`
- `HealthTokenABI.json`
- `HospitalFinancialsABI.json`

The singleton services are:

- `assetTokenService`
- `healthTokenService`
- `hospitalFinancialsService`

These are used for:

- balance checks
- name and symbol lookup
- minting and burning
- metadata reads
- trade and profit event handling

### 5.3 Blockchain Test Page

The test page verifies that the local blockchain wiring works:

- Connect wallet
- Read AT and HT balances
- Read contract names and symbols
- Display deployed contract addresses

This page is the correct place to validate whether contract deployment and MetaMask are wired correctly before integrating blockchain behavior into production pages.

---

## 6. How Blockchain Should Be Integrated by Use Case

## 6.1 Authentication and Wallet Registration

Relevant backend endpoint:

- `PUT /api/auth/profile/{userId}`

Use case:

- Save or update a user wallet address in the profile

Blockchain role:

- This endpoint does not call the chain directly
- It is essential because blockchain actions require a valid wallet address for the user

Why it matters:

- Transfers, redemptions, and ownership assignment need a wallet address tied to the profile
- The wallet address becomes the destination or source for token operations

Suggested blockchain usage:

- Store the wallet address in the profile before any blockchain-enabled action
- Use it in mint, transfer, and redemption flows

---

## 6.2 Asset Deposit to AT Minting

Relevant backend endpoints:

- `POST /api/asset-deposits/requests`
- `GET /api/asset-deposits/hospital/requests`
- `GET /api/asset-deposits/bank/requests`
- `POST /api/asset-deposits/{assetId}/approve`
- `POST /api/asset-deposits/{assetId}/bank-approve`
- `POST /api/asset-deposits/{assetId}/custody-confirm`
- `POST /api/asset-deposits/{assetId}/move-to-trading-pool`
- `GET /api/asset-deposits/hospital/pool1`
- `GET /api/asset-deposits/hospital/pool2`

Use case:

- A patient deposits a physical asset
- Hospital reviews the request
- Bank finalizes approval
- Custody is confirmed
- AT is minted and tracked

Blockchain integration point:

- The on-chain mint should happen after bank approval or custody confirmation, depending on the final workflow rule you enforce
- The minting call should go to `HospitalFinancials.mintAssetToken(...)` or, if separated, to `AssetToken.mint(...)` plus `AssetToken.setDepositMetadata(...)`

Recommended flow:

1. Patient submits deposit request off-chain
2. Hospital approves request off-chain
3. Bank approves request off-chain
4. Custody confirmation occurs off-chain as the final physical proof step
5. Frontend or backend triggers the blockchain mint transaction
6. Save the returned transaction hash in the deposit record or mint record
7. Reflect AT in wallet, dashboard, activity, and pool summaries

Why blockchain is used here:

- The asset-backed token must be immutable once minted
- Deposit metadata gives verifiable proof of what was minted and why
- On-chain mint events provide auditability for the asset lifecycle

Important detail from code:

- The backend already stores mint-related transaction hashes in several services
- Some of these are currently placeholder hashes, so this flow should be upgraded to persist the real chain receipt hash after the contract call completes

---

## 6.3 Marketplace and AT Trading

Relevant backend endpoints:

- `GET /api/marketplace/trades/hospital/{hospitalId}`
- `GET /api/marketplace/trades/hospital/{hospitalId}/patient-view`
- `GET /api/marketplace/trades/{tradeId}/participants`
- `GET /api/marketplace/pools/hospital/{hospitalId}/at`
- `GET /api/marketplace/order-book`
- `POST /api/marketplace/trades`
- `PUT /api/marketplace/trades/{tradeId}`
- `PATCH /api/marketplace/trades/{tradeId}/close`

AT-specific backend endpoints:

- `GET /api/marketplace/at-trading/patient/{patientId}/status`
- `GET /api/marketplace/at-trading/patient/{patientId}/available`
- `GET /api/marketplace/at-trading/me/asset-tokens`
- `GET /api/marketplace/at-trading/patient/{patientId}/asset-tokens`
- `POST /api/marketplace/at-trading/trades/start-with-at`
- `GET /api/marketplace/at-trading/patient/{patientId}/active-trades`
- `POST /api/marketplace/at-trading/withdrawals/request`
- `GET /api/marketplace/at-trading/withdrawals/{requestId}/status`
- `GET /api/marketplace/at-trading/patient/{patientId}/pending-ht-distributions`

Use case:

- AT is moved into a tradeable pool
- Patients participate in trades using their assigned AT
- Trade outcomes create profit or loss records
- Patients may receive monthly or settlement-based HT distributions

Blockchain integration point:

- The trade creation itself is mostly backend workflow
- The blockchain should be used when the system wants immutable proof of:
  - AT assignment to trade
  - trade start
  - trade settlement
  - HT payout resulting from profit

Recommended flow:

1. Backend creates trade and participant records
2. AT pool and assignment state are updated off-chain
3. When a trade starts or settles, persist the final business result
4. Record the trade on-chain using `HospitalFinancials.recordTrade(...)`
5. Distribute HT on-chain using `HospitalFinancials.distributeProfit(...)`
6. Sync the returned transaction hashes back to the backend transaction log

Why blockchain is used here:

- Trade profits and token distribution are financial events that should be verifiable
- Contract events provide immutable proof of settlement logic
- The chain becomes the final audit trail for value movement

---

## 6.4 Profit Allocation

Relevant backend endpoints:

- `GET /api/profit-allocation/preview`
- `POST /api/profit-allocation/distribute`
- `GET /api/profit-allocation/history`

Frontend service:

- [hospitalfrontend/services/profitAllocationService.ts](../hospitalfrontend/services/profitAllocationService.ts)

Use case:

- The hospital previews how profit will be split
- The hospital confirms distribution
- Patients receive HT based on share percentage

Blockchain integration point:

- The preview remains off-chain because it is just a calculation
- The distribution action should trigger the on-chain mint/burn or profit settlement event

Recommended flow:

1. Backend calculates the preview and share breakdown
2. Frontend displays the preview to the user
3. When confirmed, backend computes the final distribution set
4. Blockchain transaction calls `HospitalFinancials.distributeProfit(...)`
5. `HealthToken.mint(...)` occurs for each recipient under the contract rules
6. Save the transaction hash and event details in the profit distribution history

Why blockchain is used here:

- Profit distribution is a critical financial action
- On-chain HT minting guarantees traceability and prevents silent balance manipulation

---

## 6.5 Wallet Transfers and Redeems

Relevant backend endpoints:

- `GET /api/wallet/patient/{userId}/summary`
- `GET /api/wallet/patient/{userId}/transactions`
- `GET /api/wallet/patient/{userId}/transactions/{tokenSymbol}`
- `POST /api/wallet/patient/transfer/ht`
- `POST /api/wallet/hospital/redeem/ht`

Frontend service:

- [hospitalfrontend/services/walletService.ts](../hospitalfrontend/services/walletService.ts)

Use case:

- A patient transfers HT to another patient
- A hospital redeems HT for a service or bill settlement

Blockchain integration point:

- HT transfer should call `HealthToken.transfer(...)`
- HT redemption should call `HealthToken.burn(...)` or `HospitalFinancials.redeemHealthToken(...)`

Recommended flow:

1. Backend validates the request and user permissions
2. Frontend signs the on-chain transfer or burn transaction with MetaMask
3. The wallet contract call updates the token balances on-chain
4. Backend records the transaction hash and keeps the ledger in sync
5. Wallet summary and activity endpoints reflect the updated state

Why blockchain is used here:

- Token transfers are the most direct chain operation in the application
- Wallet balances must stay auditable and non-repudiable

---

## 6.6 Health Cards and Subscription Benefits

Relevant backend endpoints:

- `GET /api/subscriptions/plans`
- `GET /api/subscriptions/patient/{userId}`
- `POST /api/subscriptions/subscribe`
- `POST /api/subscriptions/change`
- `DELETE /api/subscriptions/cancel/{userId}`
- `GET /api/subscriptions/payment-history/{userId}`
- `GET /api/health-cards/patient/{userId}`
- `GET /api/health-cards/patient/{userId}/type/{cardType}`
- `GET /api/health-cards/patient/{userId}/active`

Frontend services:

- [hospitalfrontend/services/subscriptionService.ts](../hospitalfrontend/services/subscriptionService.ts)
- [hospitalfrontend/services/healthCardService.ts](../hospitalfrontend/services/healthCardService.ts)

Use case:

- Patients buy plans and receive HT-based benefits
- Card balances reflect the patient’s usable healthcare value

Blockchain integration point:

- Subscription purchase itself may remain off-chain if payment processing is centralized
- HT allocation tied to subscription benefits can be recorded on-chain as mint or transfer events
- Health card balances should mirror the on-chain HT state where possible

Recommended flow:

1. Patient subscribes off-chain through the subscription API
2. Backend calculates the benefit amount
3. If HT is issued, call `HealthToken.mint(...)`
4. Reflect that HT in the health card record and wallet summary
5. Card views read the resulting balance from backend cached state or synced ledger

Why blockchain is used here:

- The health benefit value should be auditable
- The token ledger prevents disputes about how much benefit was issued

---

## 6.7 Emergency Redemption

Relevant backend endpoints:

- `POST /api/emergency-redemptions`
- `GET /api/emergency-redemptions/patient/{patientUserId}`
- `GET /api/emergency-redemptions/hospital/pending`
- `POST /api/emergency-redemptions/{requestId}/approve`
- `POST /api/emergency-redemptions/{requestId}/reject`

Frontend service:

- [hospitalfrontend/services/emergencyRedemptionService.ts](../hospitalfrontend/services/emergencyRedemptionService.ts)

Use case:

- A patient requests urgent conversion or redemption for care needs
- A hospital staff member approves or rejects the case

Blockchain integration point:

- Approval should update the token ledger on-chain if AT is burned or HT is issued in response
- The resulting ledger entries should be tied to the approval record and request ID

Recommended flow:

1. Patient submits emergency request off-chain
2. Staff reviews and approves or rejects off-chain
3. If approval changes token balances, execute the on-chain burn or mint call
4. Persist the actual transaction hash in the redemption record
5. Show the result in wallet, activity, and notification screens

Why blockchain is used here:

- Emergency conversions are financial actions that should not be editable after approval
- On-chain proof protects both hospital and patient records

---

## 6.8 Fractionalization and NOC Issuance

Relevant backend endpoints:

- `POST /api/fractionalization/requests`
- `GET /api/fractionalization/requests/mine`
- `GET /api/fractionalization/admin/requests/pending`
- `POST /api/fractionalization/admin/requests/{requestId}/forward`
- `POST /api/fractionalization/admin/requests/{requestId}/approve`
- `GET /api/fractionalization/insurer/requests/pending`
- `POST /api/fractionalization/insurer/requests/{requestId}/approve`
- `POST /api/fractionalization/admin/requests/{requestId}/reject`
- `GET /api/fractionalization/allocations/beneficiary`
- `POST /api/fractionalization/allocations/redeem`
- `GET /api/fractionalization/allocations/primary`
- `POST /api/fractionalization/hospital/redeem`
- `POST /api/fractionalization/allocations/{allocationId}/revoke`
- `POST /api/insurance/noc/issue`
- `GET /api/insurance/noc/{fractionalizationRequestId}`
- `GET /api/insurance/patient/{patientId}/noc-certificates`
- `POST /api/insurance/noc/{nocId}/revoke`

Frontend service:

- [hospitalfrontend/services/fractionalizationService.ts](../hospitalfrontend/services/fractionalizationService.ts)

Use case:

- Patient requests fractionalization of benefits or assets
- Admin and insurer process the request
- NOC is issued when document and approval conditions are met
- Allocation and redemption are tracked later

Blockchain integration point:

- This flow is currently primarily off-chain
- Blockchain can be used to store a proof hash of the NOC, approval, or allocation state if you want immutable certification later

Recommended blockchain usage:

- Keep approval decisions and NOC issuance in the backend
- Optionally anchor a hash of the NOC document or allocation proof on-chain for integrity verification
- If later expanded, issue a tokenized proof or certificate reference on the blockchain

Why blockchain is optional here:

- The current workflow is document- and approval-heavy rather than token-heavy
- The chain is useful for proof, but not strictly required for every step

---

## 6.9 Auth, Profile, Dashboard, Reports, Notifications, Activity

Relevant backend endpoints:

- `/api/auth/*`
- `/api/profile/*`
- `/api/dashboard/*`
- `/api/reports/*`
- `/api/notifications/*`
- `/api/activity/*`
- `/api/activity/audit/*`

Use case:

- These are supporting or read-model endpoints

Blockchain integration point:

- These endpoints generally do not execute blockchain transactions directly
- They should read and display blockchain-derived outcomes such as balances, transaction hashes, status changes, and event history

Recommended usage:

- Dashboard aggregates chain-backed metrics from the backend cache
- Activity and audit pages display hashes and event references
- Notifications can be emitted when a blockchain transaction succeeds or fails

---

## 7. Endpoints That Should Touch Blockchain Directly or Indirectly

This is the practical integration map.

| Endpoint | Use Case | Blockchain Role |
|---|---|---|
| `PUT /api/profile/{userId}` | Save wallet address | Required to map a user to a wallet for chain actions |
| `POST /api/asset-deposits/{assetId}/bank-approve` | Final deposit approval | Prepares AT minting on-chain |
| `POST /api/asset-deposits/{assetId}/custody-confirm` | Physical custody confirmation | Triggers or finalizes AT minting |
| `POST /api/asset-deposits/{assetId}/move-to-trading-pool` | Move AT to trade pool | Updates trade eligibility and may correspond to on-chain state sync |
| `POST /api/marketplace/at-trading/trades/start-with-at` | Start trade using AT | Locks or allocates AT on-chain/off-chain |
| `POST /api/marketplace/at-trading/withdrawals/request` | Withdraw AT | May require on-chain release or state sync |
| `POST /api/profit-allocation/distribute` | Distribute profits | Mints HT on-chain and records proof |
| `POST /api/wallet/patient/transfer/ht` | Patient HT transfer | Calls `HealthToken.transfer(...)` |
| `POST /api/wallet/hospital/redeem/ht` | Redeem HT for hospital service | Calls `HealthToken.burn(...)` or redemption contract logic |
| `POST /api/emergency-redemptions/{requestId}/approve` | Emergency approval | May burn AT or mint HT depending on the case |
| `POST /api/subscriptions/subscribe` | Subscription activation | May mint or allocate HT benefit on-chain |
| `POST /api/fractionalization/admin/requests/{requestId}/approve` | Approval with NOC | Can anchor a proof hash on-chain if desired |
| `POST /api/insurance/noc/issue` | Issue NOC | Optional proof anchoring or certificate hash storage |

---

## 8. Current Blockchain Signals Already Present in the Codebase

The repository already contains several blockchain-oriented indicators:

- Hardhat project under [contracts](../contracts)
- Local RPC and MetaMask connection in [hospitalfrontend/lib/web3.ts](../hospitalfrontend/lib/web3.ts)
- Contract wrappers in [hospitalfrontend/services/blockchainService.ts](../hospitalfrontend/services/blockchainService.ts)
- Contract deployment address placeholders in frontend env vars
- A blockchain test page for manual validation
- Backend wallet and activity records that include `transactionHash` fields
- Some services currently generate placeholder hashes, which should be replaced with real chain receipts when the integration is finalized

This means the app is already partially structured for blockchain, but the main operational rule is still to keep off-chain workflow state and on-chain token state synchronized.

---

## 9. Recommended Implementation Order

If you are wiring blockchain into the project properly, the safest order is:

1. Deploy contracts to Hardhat and record addresses in the frontend environment
2. Verify wallet connection in the blockchain test page
3. Wire profile wallet address storage
4. Wire AT minting after bank approval or custody confirmation
5. Wire HT minting and burning for profit allocation and redemption
6. Wire wallet transfer and transaction hash persistence
7. Sync blockchain events into activity and dashboard views
8. Add optional proof anchoring for NOC or fractionalization if needed

---

## 10. Event-Driven Sync Strategy

The frontend blockchain service already exposes listeners for the major events:

- `AssetTokenMinted`
- `TradeRecorded`
- `ProfitDistributed`
- `HealthTokenRedeemed`

Recommended usage:

- Listen to these events after a successful wallet connection
- Store the resulting transaction hash and event payload in backend records
- Use them to refresh UI state immediately after on-chain execution

This gives you a clean event-driven integration model instead of relying only on polling.

---

## 11. What Should Stay Off-Chain

These flows should stay primarily in the backend:

- Authentication and JWT session handling
- User profile storage
- KYC review
- Hospital and bank management
- Notifications and audit logs as the system-of-record layer
- Reports and dashboards as aggregated read models
- Approval workflows and document review

Blockchain should not replace the backend. It should complement it by proving token movement and immutable financial events.

---

## 12. Final Integration Rule

Use the blockchain for anything that changes value or ownership:

- mint
- burn
- transfer
- trade settlement
- profit allocation
- redemption proof

Keep the backend for everything that manages identity, documents, approvals, workflow state, and reporting.

That split matches the current structure of the project and is the cleanest way to integrate blockchain without duplicating business logic.
