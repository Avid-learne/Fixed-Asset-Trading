# HT Transfer Feature - Testing Guide

## System Setup Prerequisites

Before testing, ensure:

1. **Backend Running:**
   ```bash
   cd SehatVaultBackend
   mvn spring-boot:run
   # Server should be running on http://localhost:8000
   ```

2. **Frontend Running:**
   ```bash
   cd hospitalfrontend
   npm run dev
   # Frontend should be running on http://localhost:3000
   ```

3. **Database Ready:**
   - PostgreSQL running with seeded patient data
   - At least 2 patient accounts created
   - Both patients have registered wallets (assigned during patient profile creation)

## Test Data Preparation

### Create Test Patients

Before running tests, ensure you have at least 2 test patients created:

**Patient 1 (Sender):**
- Email: `patient1@test.com`
- Password: `Test@123456`
- Wallet Address: `0x1234567890abcdef...` (auto-generated or custom)
- Initial HT Balance: 100 HT (seed via profit allocation or direct DB update)

**Patient 2 (Recipient):**
- Email: `patient2@test.com`
- Password: `Test@123456`
- Wallet Address: `0x9876543210fedcba...` (auto-generated or custom)
- Initial HT Balance: 0-50 HT (optional)

### Alternative: Direct Database Seeding

```sql
-- Get patient IDs
SELECT id, user_id, wallet_address FROM patients LIMIT 5;

-- Ensure both patients have wallet addresses
UPDATE patients SET wallet_address = '0x1234567890abcdef' WHERE id = 'patient-id-1';
UPDATE patients SET wallet_address = '0x9876543210fedcba' WHERE id = 'patient-id-2';

-- Set initial HT balances
INSERT INTO patient_token_balances (patient_id, total_at, total_ht, last_updated)
VALUES ('patient-id-1', 0, 100, NOW())
ON CONFLICT(patient_id) DO UPDATE SET total_ht = 100;

INSERT INTO patient_token_balances (patient_id, total_at, total_ht, last_updated)
VALUES ('patient-id-2', 0, 50, NOW())
ON CONFLICT(patient_id) DO UPDATE SET total_ht = 50;
```

## Manual Testing Procedures

### Test Case 1: Successful HT Transfer (Happy Path)

**Setup:**
- Patient A: 100 HT, wallet `0x1111...`
- Patient B: 50 HT, wallet `0x2222...`
- Both logged in (in different browser tabs/windows)

**Steps:**

1. **Login as Patient A**
   ```
   Navigate to: http://localhost:3000/patient/wallet
   Email: patient1@test.com
   Password: Test@123456
   ```

2. **Verify Initial Balance**
   ```
   Expected: "My Wallet" page shows
   - Current Balance: 100 HT
   - Transferred Out: 0
   - Transferred In: 0
   ```

3. **Open Transfer Dialog**
   ```
   Click: "Transfer to Patient" button (top-right)
   Expected: Modal opens with form
   ```

4. **Fill Transfer Form**
   ```
   Field: Recipient Wallet Address
   Value: 0x2222...
   
   Field: Amount (HT)
   Value: 25
   
   Field: Note
   Value: "Medical emergency support"
   ```

5. **Submit Transfer**
   ```
   Click: "Confirm Transfer" button
   Expected: 
   - Modal closes
   - Success message appears (if toast implemented)
   - Page refreshes wallet data
   ```

6. **Verify Sender Balance Updated**
   ```
   Expected on Patient A's wallet:
   - Current Balance: 75 HT (was 100)
   - Transferred Out: 25 HT  (1 transfer)
   - Transaction appears in "HT Sent" table
   ```

7. **Verify Recipient Received**
   ```
   Login as Patient B (refresh if already on page)
   Navigate to: http://localhost:3000/patient/wallet/ht
   
   Expected:
   - Current Balance: 75 HT (was 50, +25 received)
   - Transferred In: 25 HT (1 transfer)
   - Transaction appears in "HT Received" table
   ```

8. **Verify Transaction Details**
   ```
   Patient A - Click "View" on sent transaction:
   Expected fields:
   - Type: "Sent" (red badge)
   - Amount: -25 HT
   - From Wallet: 0x1111...
   - To Wallet: 0x2222...
   - Description: "Medical emergency support"
   - Status: SUCCESS
   
   Patient B - Click "View" on received transaction:
   Expected fields:
   - Type: "Received" (green badge)
   - Amount: +25 HT
   - From Wallet: 0x1111...
   - To Wallet: 0x2222...
   - Description: "Medical emergency support"
   - Status: SUCCESS
   ```

9. **Verify Transaction Hash**
   ```
   Expected: Both transactions show same hash
   This proves they're paired transfers
   ```

**Expected Outcome:** ✅ All validations pass, balances correct, transactions recorded

---

### Test Case 2: Insufficient Balance Validation

**Setup:**
- Patient A: 10 HT
- Patient B: wallet `0x2222...`

**Steps:**

1. Open transfer dialog
2. Enter:
   ```
   Recipient: 0x2222...
   Amount: 25
   Note: Test
   ```
3. Click "Confirm Transfer"

**Expected:**
```
Error message: "Insufficient HT balance"
Modal remains open
No transaction created
Patient A balance: still 10 HT
```

**Verify in Browser Console:**
```javascript
// Check network tab for failed POST request
// Status: 400 Bad Request
// Response: {"success": false, "message": "Insufficient HT balance"}
```

**Database Check:**
```sql
-- Verify no new transactions created
SELECT COUNT(*) FROM transactions WHERE user_id = 'patient-a-id' 
AND type = 'DEBIT' AND created_at > NOW() - interval '1 minute';
-- Expected: 0 if transfer submitted now
```

---

### Test Case 3: Invalid Recipient Wallet

**Setup:**
- Patient A: 100 HT

**Steps:**

1. Open transfer dialog
2. Enter:
   ```
   Recipient: 0xNONEXISTENT...
   Amount: 10
   Note: Test
   ```
3. Click "Confirm Transfer"

**Expected:**
```
Error message: "Recipient wallet was not found"
Modal remains open
Patient A balance unchanged
```

---

### Test Case 4: Self-Transfer Prevention

**Setup:**
- Patient A: 100 HT, wallet `0x1111...`

**Steps:**

1. Open transfer dialog
2. Enter:
   ```
   Recipient: 0x1111... (Patient A's own wallet)
   Amount: 10
   Note: Test self-transfer
   ```
3. Click "Confirm Transfer"

**Expected:**
```
Error message: "Cannot transfer HT to your own wallet"
Modal remains open
No transaction created
```

---

### Test Case 5: Zero/Negative Amount Validation

**Setup:**
- Patient A: 100 HT

**Steps (Scenario A - Zero Amount):**

1. Open transfer dialog
2. Enter:
   ```
   Recipient: 0x2222...
   Amount: 0
   ```
3. Observe "Confirm Transfer" button state

**Expected:**
```
Button appears DISABLED (grayed out)
Cannot click to submit
Error message (optional): "Amount must be greater than zero"
```

**Steps (Scenario B - Negative Amount):**

1. Try to input negative value
2. Most browsers/UI frameworks prevent this with `type="number"`

**Expected:**
```
Input field ignores negative input
Or allows but submit is disabled
```

---

### Test Case 6: Optional Note Field

**Setup:**
- Patient A: 100 HT
- Patient B: wallet `0x2222...`

**Steps:**

1. Fill transfer form but leave "Note" field empty
2. Submit transfer successfully
3. Check transaction history

**Expected:**
```
Transfer succeeds with amount: 25
Transaction description: "HT transfer" (default)
No error about missing note
```

---

### Test Case 7: Transaction Tab Switching

**Setup:**
- Patient A has sent 3 transfers
- Patient A has received 2 transfers
- Patient A has 1 HT_MINT allocation (from profit distribution)
- Patient A has redeemed benefits (AT_BURN) before

**Steps:**

1. Go to HT Wallet page
2. Click "Transfers" tab

**Expected:**
```
Two sections visible:
- HT Sent: 3 transactions
- HT Received: 2 transactions
Total: 5 transfers
Allocations (HT_MINT) NOT shown
```

3. Click "All Transactions" tab

**Expected:**
```
All 6 transactions visible:
- 3 DEBIT (Sent)
- 2 CREDIT (Received)
- 1 HT_MINT (Allocated)
Correct color badges for each type
```

---

### Test Case 8: Transaction History Sorting

**Setup:**
- Patient has multiple transfers over different dates

**Steps:**

1. View "Transfers" tab
2. Observe transaction order
3. Click column headers if implemented

**Expected:**
```
Transactions sorted by date (most recent first)
All fields visible: Date, Recipient/Sender, Amount, Note
Wallet addresses truncated but readable
```

---

## Automated Test Scenarios (via API)

### API Test: Successful Transfer

```bash
# 1. Get patient tokens for auth
TOKEN_A=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient1@test.com","password":"Test@123456"}' \
  | jq -r '.data.token')

# 2. Get patient B's wallet address
WALLET_B=$(curl -s -X GET http://localhost:8000/api/patient/profile \
  -H "Authorization: Bearer $TOKEN_A" \
  | jq -r '.data.walletAddress')

# 3. Execute transfer
curl -X POST http://localhost:8000/api/wallet/patient/transfer/ht \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{
    \"recipientWalletAddress\": \"$WALLET_B\",
    \"amount\": 25,
    \"note\": \"API test transfer\"
  }"

# Expected response:
# {"success":true,"message":"HT transferred successfully","data":"OK"}
```

### API Test: Error Handling

```bash
# Test insufficient balance
curl -X POST http://localhost:8000/api/wallet/patient/transfer/ht \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{
    \"recipientWalletAddress\": \"$WALLET_B\",
    \"amount\": 999999
  }"

# Expected response (400):
# {"success":false,"message":"Insufficient HT balance"}
```

## Performance Testing

### Load Test: Multiple Concurrent Transfers

```bash
# Using Apache Bench
ab -n 100 -c 10 -p transfer_payload.json \
   -H "Authorization: Bearer $TOKEN_A" \
   -H "Content-Type: application/json" \
   http://localhost:8000/api/wallet/patient/transfer/ht
```

**Expected:**
- Response time: < 500ms per transfer
- Success rate: > 99%
- No database deadlocks
- All balances accurate after completion

---

## Database Verification

### Check Transactions Created

```sql
-- View all HT transfers for a patient
SELECT 
  t.transaction_id,
  t.user_id,
  t.type,
  t.amount,
  t.description,
  t.sender_wallet_address,
  t.receiver_wallet_address,
  t.transaction_hash,
  t.timestamp
FROM transactions t
WHERE t.token_id = (SELECT id FROM tokens WHERE symbol = 'HT')
  AND t.type IN ('DEBIT', 'CREDIT')
  AND t.timestamp > NOW() - interval '1 hour'
ORDER BY t.timestamp DESC;
```

### Verify Balance Updates

```sql
-- Check patient token balances
SELECT 
  ptb.patient_id,
  p.wallet_address,
  ptb.total_at,
  ptb.total_ht,
  ptb.last_updated
FROM patient_token_balances ptb
JOIN patients p ON p.id = ptb.patient_id
WHERE p.wallet_address IN ('0x1111...', '0x2222...')
ORDER BY ptb.last_updated DESC;
```

### Audit Transaction Integrity

```sql
-- Verify paired DEBIT/CREDIT transactions
SELECT 
  COUNT(DISTINCT transaction_hash) as transfer_pairs,
  SUM(CASE WHEN type = 'DEBIT' THEN 1 ELSE 0 END) as debits,
  SUM(CASE WHEN type = 'CREDIT' THEN 1 ELSE 0 END) as credits,
  SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END) as total_sent,
  SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) as total_received
FROM transactions
WHERE token_id = (SELECT id FROM tokens WHERE symbol = 'HT')
  AND type IN ('DEBIT', 'CREDIT')
  AND timestamp > NOW() - interval '24 hours';
```

---

## Browser Developer Tools Checks

### Network Tab Verification

1. Open DevTools (F12)
2. Go to Network tab
3. Perform a transfer
4. Check POST request to `/api/wallet/patient/transfer/ht`

**Expected:**
```
Method: POST
Status: 200 OK
Response Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token>
Response Body:
  {
    "success": true,
    "message": "HT transferred successfully",
    "data": "OK"
  }
```

### Local Storage Verification

```javascript
// Check in browser console
localStorage.getItem('authToken') // Should exist
localStorage.getItem('userEmail')  // Should show patient email
```

### Console Errors Check

```javascript
// Should see no errors like:
// - "Transfer service is not configured"
// - "Failed to transfer HT"
// - Network 500 errors
```

---

## Troubleshooting Common Issues

| Issue | Root Cause | Resolution |
|-------|-----------|-----------|
| Transfer button not visible | User has 0 HT balance | Add HT to patient via profit distribution |
| "Recipient wallet not found" | Wallet address doesn't exist in DB | Verify recipient has completed profile |
| Balance not updating | Frontend cache not refreshed | Manually refresh page or clear cache |
| "Insufficient HT balance" | Rounding or decimal precision | Check database for actual balance value |
| Transaction appears in sent but not received | Race condition or DB replication lag | Wait 5-10 seconds and refresh |
| Modal stays open after submit | JavaScript error preventing callback | Check browser console for errors |

---

## Post-Test Cleanup

After testing, reset your test patients:

```sql
-- Reset Patient A
UPDATE patient_token_balances 
SET total_ht = 100, last_updated = NOW()
WHERE patient_id = (SELECT id FROM patients WHERE wallet_address = '0x1111...');

-- Reset Patient B
UPDATE patient_token_balances 
SET total_ht = 50, last_updated = NOW()
WHERE patient_id = (SELECT id FROM patients WHERE wallet_address = '0x2222...');

-- Delete test transactions
DELETE FROM transactions
WHERE token_id = (SELECT id FROM tokens WHERE symbol = 'HT')
  AND description LIKE '%test%' OR description LIKE '%API%'
  AND timestamp > NOW() - interval '1 hour';
```

---

## Test Coverage Summary

| Feature | Test Case | Status |
|---------|-----------|--------|
| **Core Transfer** | Successful transfer with balance updates | ✓ Test Case 1 |
| **Validations** | Insufficient balance | ✓ Test Case 2 |
| | Invalid recipient wallet | ✓ Test Case 3 |
| | Self-transfer prevention | ✓ Test Case 4 |
| | Zero/negative amounts | ✓ Test Case 5 |
| **UI Features** | Optional note field | ✓ Test Case 6 |
| | Transaction tab switching | ✓ Test Case 7 |
| | Transaction history display | ✓ Test Case 8 |
| **API** | Successful transfer endpoint | ✓ API Test 1 |
| | Error handling | ✓ API Test 2 |
| **Database** | Transaction records | ✓ DB Check 1 |
| | Balance updates | ✓ DB Check 2 |
| | Integrity (paired transfers) | ✓ DB Check 3 |

---

## Sign-Off

Once all test cases pass:

- [ ] All manual tests completed
- [ ] No errors in browser console
- [ ] Database integrity verified
- [ ] Balances accurate for all patients
- [ ] Transactions properly recorded with pairs
- [ ] UI responsive and user-friendly
- [ ] Error messages clear and helpful

**Tested By:** _______________  
**Date:** _______________  
**Version:** 1.0  
**Environment:** Development / Staging / Production  

---

**Last Updated:** 2026-03-24
**Status:** Ready for Testing
