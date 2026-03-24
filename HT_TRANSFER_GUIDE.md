# Patient-to-Patient HT Transfer Guide

## Overview

The SehatVault Health Token (HT) transfer system allows patients to transfer Health Tokens (HT) to other patients within the platform. This enables peer-to-peer support and resource sharing among patients.

## How It Works

### User Flow

1. **Patient A (Sender)** initiates transfer
2. **Patient B (Recipient)** receives HT in their wallet
3. Both patients see the transaction recorded in their activity history

### Transaction Types

All transfers are recorded with two complementary transactions:
- **DEBIT**: Sender loses HT (appears as negative in their wallet)
- **CREDIT**: Recipient gains HT (appears as positive in their wallet)

## Access Points

### 1. HT Wallet Page
**Route:** `/patient/wallet/ht`

The main interface for HT transfers with:
- **Balance Summary**: Current HT balance, transfers sent/received, redeemed amounts
- **Transfer Button**: "Transfer to Patient" button in top-right
- **Transaction Tabs**: 
  - `Transfers` - Sent & Received transfers only
  - `All Transactions` - All HT activity (includes allocations, etc.)

### 2. Main Wallet Page
**Route:** `/patient/wallet`

Quick access to HT transfer with link to detailed HT wallet page.

## Transfer Process

### Step 1: Open Transfer Dialog
Click **"Transfer to Patient"** button on HT Wallet page.

### Step 2: Enter Recipient Details
```
Field: Recipient Wallet Address
- Get from recipient's patient profile
- Must be a valid patient wallet on the platform
- Cannot be your own wallet
```

### Step 3: Specify Amount
```
Field: Amount (HT)
- Must be greater than 0
- Cannot exceed your current balance
- Display shows: "Your balance: X HT"
```

### Step 4: Add Optional Note
```
Field: Note (optional)
- Free text (max 255 chars)
- Example: "For medical support" or "Emergency healthcare"
- Appears in transaction history
```

### Step 5: Confirm Transfer
Click **"Confirm Transfer"** button.

**Required Validations:**
- ✅ Recipient wallet address is provided and exists
- ✅ Amount is positive and ≤ current balance
- ✅ Not transferring to own wallet
- ✅ Recipient patient exists and is active

## Transaction History

### Transfers Tab (Default View)

**HT Sent Section:**
- Shows all DEBIT transactions (outgoing transfers)
- Displays: Date, Recipient Wallet, Amount, Note, Tx Hash
- Color: Red (-X HT)

**HT Received Section:**
- Shows all CREDIT transactions (incoming transfers)  
- Displays: Date, Sender Wallet, Amount, Note, Tx Hash
- Color: Green (+X HT)

### All Transactions Tab

Shows complete HT activity including:
- Peer-to-peer transfers (DEBIT/CREDIT)
- Profit allocations (HT_MINT - appear as "Allocated")
- Redeemed benefits (AT_BURN)

### Transaction Details Modal

Click **"View"** on any transaction to see:
- Transaction type (Sent/Received/Allocated)
- Current status (always SUCCESS)
- Full amounts and dates
- Sender & recipient wallet addresses
- Transaction hash (blockchain reference)
- Block number (ledger reference)
- Description/Note

## Backend API

### Endpoint
```
POST /api/wallet/patient/transfer/ht
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

### Request Body
```json
{
  "recipientWalletAddress": "0x...",
  "amount": 50,
  "note": "For medical support"
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "HT transferred successfully",
  "data": "OK"
}
```

### Error Responses

| Error | Status | Cause |
|-------|--------|-------|
| Recipient wallet not found | 400 | Invalid or non-existent wallet address |
| Insufficient HT balance | 400 | Amount exceeds available balance |
| Cannot transfer to own wallet | 400 | Sender and recipient are same |
| Sender patient profile not found | 400 | User lacks patient profile |
| Amount must be > 0 | 400 | Zero or negative amount |

## Database Impact

### Tables Modified

**1. patient_token_balances**
- Sender's `total_ht` decreased
- Recipient's `total_ht` increased
- `last_updated` timestamp set to current time

**2. transactions**
Two records created per transfer:
- One DEBIT record for sender (user_id = sender)
- One CREDIT record for recipient (user_id = recipient)

**Fields populated:**
- `user_id` - sender or recipient UUID
- `token_id` - HT token UUID
- `type` - DEBIT or CREDIT
- `amount` - transfer amount (BigDecimal)
- `description` - note or "HT transfer"
- `sender_wallet_address` - from patient profile
- `receiver_wallet_address` - from recipient patient profile
- `transaction_hash` - UUID-based (deterministic per transfer)
- `status` - "SUCCESS"
- `timestamp` - LocalDateTime.now()

## Implementation Details

### Frontend Files Modified

**Component:** [components/patient/HTWalletCard.tsx](hospitalfrontend/components/patient/HTWalletCard.tsx)
- Transfer form with validation
- Sent/Received transfer history tabs
- All transactions view with type-based coloring
- Transaction detail modal

**Service:** [services/walletService.ts](hospitalfrontend/services/walletService.ts)
- `transferHT()` method calls backend API
- `WalletTransaction` type includes `HT_MINT` & `AT_BURN`
- Error handling with user-friendly messages

**Pages:**
- [app/patient/wallet/ht/page.tsx](hospitalfrontend/app/patient/wallet/ht/page.tsx)
- [app/patient/wallet/page.tsx](hospitalfrontend/app/patient/wallet/page.tsx)

### Backend Files Modified

**Controller:** [wallet/controller/WalletController.java](SehatVaultBackend/src/main/java/com/SehatVault/SehatVaultBackend/wallet/controller/WalletController.java)
- Endpoint: `POST /api/wallet/patient/transfer/ht`
- Extracts authenticated user email from JWT
- Delegates to WalletService

**Service:** [wallet/service/WalletService.java](SehatVaultBackend/src/main/java/com/SehatVault/SehatVaultBackend/wallet/service/WalletService.java)
- Method: `transferHealthTokens(String senderEmail, TransferHtRequest request)`
- Validates sender & recipient
- Updates both patient token balances
- Creates DEBIT and CREDIT transactions
- All operations wrapped in `@Transactional`

**DTO:** [wallet/dto/TransferHtRequest.java](SehatVaultBackend/src/main/java/com/SehatVault/SehatVaultBackend/wallet/dto/TransferHtRequest.java)
- `recipientWalletAddress` (String, required)
- `amount` (BigDecimal, required, must be > 0)
- `note` (String, optional)

**Entity:** [activity/entity/Transaction.java](SehatVaultBackend/src/main/java/com/SehatVault/SehatVaultBackend/activity/entity/Transaction.java)
- Existing entity, no changes needed
- `TransactionType` enum includes DEBIT, CREDIT
- Supports future types: HT_MINT, AT_BURN

## Testing Scenarios

### Test Case 1: Successful Transfer
1. Patient A has 100 HT
2. Patient A transfers 25 HT to Patient B
3. Patient A balance: 75 HT
4. Patient B balance: increases by 25 HT
5. Both see transaction in history

**Expected:**
- ✅ Backend returns 200 OK
- ✅ Front-end shows success toast
- ✅ Wallet balances refresh automatically
- ✅ Transaction appears in both patient histories

### Test Case 2: Insufficient Balance
1. Patient A has 10 HT
2. Patient A attempts transfer of 15 HT
3. Submit form

**Expected:**
- ✅ Error: "Insufficient HT balance"
- ✅ Form remains open for correction
- ✅ No transaction created

### Test Case 3: Invalid Recipient
1. Patient A enters non-existent wallet address
2. Submit form

**Expected:**
- ✅ Error: "Recipient wallet was not found"
- ✅ Form remains open
- ✅ No balance changes

### Test Case 4: Self-Transfer Prevention
1. Patient A enters their own wallet address
2. Submit form

**Expected:**
- ✅ Error: "Cannot transfer HT to your own wallet"
- ✅ Form remains open
- ✅ No transaction created

## Security Considerations

1. **JWT Authentication Required**
   - All transfer requests require valid JWT token
   - Sender determined from authenticated user, not request body

2. **Recipient Wallet Validation**
   - Must exist in patient database
   - Case-insensitive comparison
   - Prevents transfers to system/admin wallets

3. **Balance Protection**
   - Checked before any state changes
   - BigDecimal used for precise calculations
   - No floating-point errors

4. **Transaction Atomicity**
   - All updates in single `@Transactional` block
   - If any step fails, entire transfer rolled back
   - No partial transfers possible

5. **Audit Trail**
   - Every transfer creates two immutable records
   - Transaction hash provides integrity check
   - Timestamp cannot be spoofed

## Exchange Rates Reference

```
1 HT = 10 PKR
1 AT = 10 PKR
1 USD = 280 PKR
```

(Fixed in system, used for value conversions)

## Future Enhancements

1. **Transfer Approval System** - Pending transfers that need approval
2. **Recurring Transfers** - Automated periodic transfers
3. **Transfer Limits** - Per-transaction or daily limits
4. **Blacklist/Whitelist** - Restrict who can receive transfers
5. **Transfer Notifications** - Real-time push notifications
6. **Batch Transfers** - Send to multiple recipients at once
7. **Transfer Analytics** - Dashboard showing transfer patterns

## Support & Troubleshooting

### Issue: Transfer button not appearing
- **Check:** Patient profile is complete (has wallet address)
- **Check:** User has HT balance > 0

### Issue: "Recipient wallet not found"
- **Verify:** Recipient wallet address is correct (case-sensitive on some systems)
- **Check:** Recipient is an active patient in the system
- **Action:** Get correct wallet from recipient's profile page

### Issue: Transfer appears in send history but not recipient's wallet
- **Contact:** System admin
- **Check:** Backend wallet update service status
- **Verify:** Recipient patient profile exists

### Issue: Transaction hash shows as "N/A" or missing
- **Status:** Non-critical display issue
- **Check:** Browser console for API errors
- **Action:** Refresh page to reload from backend

---

**Last Updated:** 2026-03-24
**Version:** 1.0
**Status:** Production Ready
