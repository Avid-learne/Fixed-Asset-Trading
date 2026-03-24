# Trading Mechanics Implementation

This document explains how the backend now implements pooling, simulated trade execution, proportional AT burn, per-trade profit distribution, asset mint guardrails, and bank loan allocation.

## 1) AT Pool Aggregation

- New table mapping pooled capital by source contribution:
  - `hospital_at_pool_entries`
  - keys: `hospital_id`, `patient_id`, `asset_id`
  - tracked values: `total_at_added`, `available_at`, `total_at_burned`, `is_active`
- Aggregation step on bank asset approval:
  - After AT minting succeeds, AT is added into hospital pool via `HospitalAtPoolService.addToPool(...)`.
- Hospital pool API now reflects pooled entries rather than only summing patient balances.

## 2) Simulated Trading Flow

- New endpoint: `POST /api/marketplace/trades/execute`
- Request DTO: `ExecuteTradeRequest`
- Flow:
  1. Validate request and available AT pool
  2. Call internal `TradingSimulationService` (simulated API behavior)
  3. Persist trade in `trades` table with:
     - `amount_before_trade`
     - `amount_after_trade`
     - `profit_loss = after - before`
     - `total_at_burnt`
     - `start_time` / `end_time`
  4. Close trade event in one execution pass

## 3) Per-Trade Profit Distribution (No monthly batch)

- Triggered immediately after each profitable trade.
- Creates one `profit_distributions` row with:
  - `total_profit`
  - `patients_percentage`
  - `hospital_operations`
  - `hospital_earning`
  - `bank_loan_funds`
- Patient share is allocated proportionally from trade burn contribution and written to `profit_allocations` with:
  - `patient_id`
  - `asset_id`
  - `allocated_percentage`
  - `allocated_amount_ht`
- HT mint credit updates:
  - `patient_token_balances.total_ht`
  - `patient_cards.ht_balance`

## 4) Proportional AT Burn and Wallet Deduction

- `total_at_burnt` is distributed across pool contributors by each entry's share in available AT.
- Burn is applied against `hospital_at_pool_entries.available_at`.
- Patient wallet AT is reduced in `patient_token_balances.total_at` and `last_updated` is refreshed.
- Burn logs are inserted in `transactions` with type `AT_BURN`.

## 5) Asset Reuse and Over-Tokenization Guard

- Mint history now uses `mint_records` via `MintRecord` entity.
- Before minting, guard checks:
  - `sum(tokens_minted for asset) + newMint <= asset_value / TOKEN_RATIO`
- If exceeded, mint is blocked and approval flow fails with over-tokenization error.
- This enables repeated mint cycles only while remaining mintable capacity exists.

## 6) Bank Loan Allocation Ledger Update

- During profitable trade settlement, `bank_loan_funds` is pushed into partnership ledger:
  - finds latest approved `partnerships` row for hospital
  - reduces `loans_taken_by_hospital` (floor at zero)
  - increments `total_deposits` by allocated bank loan funds

## Key Service/Controller Touchpoints

- `AssetDepositService.approveRequestByBank(...)`
- `HospitalAtPoolService`
- `MarketplaceService.executeTrade(...)`
- `MarketplaceController` (`/trades/execute`)
- `TradingSimulationService`

## Notes

- Trading remains simulated only.
- Existing create/update/close marketplace endpoints are preserved.
- The new execute endpoint provides the full event flow in a single call.
