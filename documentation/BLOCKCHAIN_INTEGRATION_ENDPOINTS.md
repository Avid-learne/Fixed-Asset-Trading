# Blockchain Integration (Endpoints + On-Chain Actions)

This project uses a **hybrid on-chain enforcement** model:

- **Backend-admin signed transactions (web3j):** used for system-level mints/burns/redemptions where the server is allowed to act as the issuer/operator.
- **Patient-signed transactions (MetaMask / ethers.js):** used for **patient-to-patient HT transfers**, because the backend does not (and should not) hold patient private keys.

## Contracts and Chain

- Chain: Hardhat local network (default) — `chainId=31337`, RPC `http://127.0.0.1:8545`
- Solidity contracts (Hardhat): `AssetToken`, `HealthToken`, `HospitalFinancials`

## Backend configuration

Backend reads settings from:

- `SehatVaultBackend/src/main/resources/application.properties`

Key properties (names may be environment-specific):

- `blockchain.enabled`
- `blockchain.rpc-url`
- `blockchain.chain-id`
- `blockchain.wallet.private-key`
- `blockchain.contracts.hospital-financials`
- `blockchain.contracts.asset-token`
- `blockchain.contracts.health-token`

## Endpoint → blockchain mapping

### Asset deposits (AT mint + baseline HT)

- `POST /api/asset-deposits/{assetId}/custody-confirm`
  - Purpose: bank confirms custody; **AT is minted** and **baseline HT** begins.
  - On-chain:
    - `HospitalFinancials.mintAssetToken(...)` (AT mint)
    - `HealthToken.mint(...)` (baseline HT mint)
  - Stored off-chain:
    - Transaction hash + block number persisted in `transactions` rows for the mint/credit actions.

### Profit allocation (HT mint)

- `POST /api/profit-allocation/distribute`
  - Purpose: distribute profit as HT to eligible recipients.
  - On-chain:
    - `HealthToken.mint(...)` per recipient
  - Stored off-chain:
    - Transaction hash + block number persisted in `transactions` for each recipient credit.

### Wallet (HT transfer + hospital redemption)

- `POST /api/wallet/patient/transfer/ht`
  - Purpose: patient-to-patient HT transfer.
  - On-chain:
    - **Frontend MetaMask-signed**: `HealthToken.transfer(to, amount)`
  - Backend behavior:
    - Accepts optional `transactionHash` (submitted by frontend after `tx.wait()`)
    - Persists the hash and (best-effort) block number lookup for audit/traceability.

- `POST /api/wallet/hospital/redeem/ht`
  - Purpose: hospital redeems (burns) HT for patient services.
  - On-chain:
    - `HospitalFinancials.redeemHealthToken(...)` (burn/redeem)
  - Stored off-chain:
    - Transaction hash + block number persisted in `transactions`.

### Emergency redemption (AT burn + HT mint)

- `POST /api/emergency-redemptions/{requestId}/approve`
  - Purpose: approved emergency conversion from AT → HT.
  - On-chain:
    - `AssetToken.burn(...)`
    - `HealthToken.mint(...)`
  - Stored off-chain:
    - Both burn/mint transaction hashes and block numbers recorded.

### Subscriptions (HT mint)

- `POST /api/subscriptions/subscribe`
- `POST /api/subscriptions/change`
  - Note: subscription plan lifecycle is mostly off-chain. **Whenever HT credits are actually issued**, the backend now mints HT on-chain.

HT issuance points inside subscription workflows:

- Manual subscription HT credits (service-level):
  - On-chain: `HealthToken.mint(...)`
  - Stored off-chain: transaction hash + block number in `transactions`

- Monthly subscription HT allocations (service-level):
  - On-chain: `HealthToken.mint(...)`
  - Stored off-chain: transaction hash + block number in `transactions`

### Fractionalization (HT reserve/issue/redeem)

- `POST /api/fractionalization/requests`
- `POST /api/fractionalization/admin/requests/{requestId}/approve`
- `POST /api/fractionalization/allocations/redeem`
- `POST /api/fractionalization/hospital/redeem`

HT movements in fractionalization are enforced on-chain using backend-admin calls:

- Reserve HT (primary patient allocation pool): `HealthToken.burn(...)`
- Return unused HT (back to primary): `HealthToken.mint(...)`
- Credit beneficiary HT under NOC: `HealthToken.mint(...)`
- Beneficiary redemption: `HealthToken.burn(...)`

All corresponding `transactions` rows now store real `transaction_hash` and `block_number` from receipts.

### Marketplace AT trading monthly HT distributions

- Internal scheduler: `MonthlyHtDistributionScheduler` → `AtTradingService.distributeMonthlyHt(...)`
  - Purpose: monthly HT distributions (5% of AT monetary value)
  - On-chain:
    - `HealthToken.mint(...)` to the patient wallet
  - Stored off-chain:
    - Updates wallet balance and credits the "Asset Health Card" bucket
    - Inserts a `transactions` row with tx hash + block number

## Frontend integration note (patient-signed HT transfers)

Frontend now performs HT transfers on-chain first, then calls backend to persist the tx hash:

- File: `hospitalfrontend/services/walletService.ts`
  - On-chain: `healthTokenService.transfer(...)`
  - Backend call: `POST /api/wallet/patient/transfer/ht` with `transactionHash`

## Important operational notes

- Backend-admin signed flows require a configured signer:
  - `blockchain.wallet.private-key` must be set
  - contract addresses must match the deployed Hardhat contracts
- If `blockchain.enabled=false`, on-chain operations will fail or be skipped depending on implementation. For enforcement, keep it enabled in environments where you require on-chain truth.
