# AT Trading API - HTTP Request Examples

Complete collection of HTTP requests for AT Trading API endpoints with real-world examples.

## Base URL
```
http://localhost:8080/api/marketplace/at-trading
```

## Headers (All Requests)
```
Content-Type: application/json
Authorization: Bearer {jwt-token}  # If authentication enabled
```

---

## 1. Get Patient AT Status

**Endpoint**: `GET /patient/{patientId}/status`

**Purpose**: Get comprehensive overview of patient's AT portfolio

### Request
```bash
curl -X GET "http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/status" \
  -H "Content-Type: application/json"
```

### Response (200 OK)
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "totalAvailableAt": 150.00,
  "totalUnavailableAt": 80.00,
  "totalAt": 230.00,
  "pendingMonthlyHtAmount": 45.50,
  "activeTradeCount": 3,
  "activeWithdrawalRequests": 1
}
```

**Response Fields**:
- `patientId`: Patient UUID
- `totalAvailableAt`: AT not currently allocated to trades
- `totalUnavailableAt`: AT currently allocated to active trades
- `totalAt`: Sum of available + unavailable
- `pendingMonthlyHtAmount`: Total pending monthly HT distributions (5% calculations not yet distributed)
- `activeTradeCount`: Number of ongoing trades using this patient's AT
- `activeWithdrawalRequests`: Number of pending withdrawal requests

**Scenarios**:
```bash
# Check AT status for a specific patient
curl http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/status

# Response shows patient has 230 total AT with 80 currently in trades
# and 45.50 HT pending from monthly distributions
```

---

## 2. Get Available AT Assignments

**Endpoint**: `GET /patient/{patientId}/available`

**Purpose**: List all AT assignments currently available for trading

### Request
```bash
curl -X GET "http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/available" \
  -H "Content-Type: application/json"
```

### Response (200 OK)
```json
[
  {
    "assignmentId": "660e8400-e29b-41d4-a716-446655440001",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "assetId": "770e8400-e29b-41d4-a716-446655440002",
    "hospitalId": "880e8400-e29b-41d4-a716-446655440003",
    "totalAt": 100.00,
    "availableAt": 100.00,
    "unavailableAt": 0.00,
    "status": "AVAILABLE",
    "totalMonetaryValuePkr": 1000.00,
    "availableMonetaryValuePkr": 1000.00,
    "unavailableMonetaryValuePkr": 0.00,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "assignmentId": "660e8400-e29b-41d4-a716-446655440004",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "assetId": "770e8400-e29b-41d4-a716-446655440005",
    "hospitalId": "880e8400-e29b-41d4-a716-446655440003",
    "totalAt": 50.00,
    "availableAt": 50.00,
    "unavailableAt": 0.00,
    "status": "AVAILABLE",
    "totalMonetaryValuePkr": 500.00,
    "availableMonetaryValuePkr": 500.00,
    "unavailableMonetaryValuePkr": 0.00,
    "createdAt": "2024-01-20T14:15:00Z"
  }
]
```

**Usage**: Listed before starting a trade to show which assets patient can allocate AT from.

---

## 3. Start Trade with Patient AT

**Endpoint**: `POST /trades/start-with-at`

**Purpose**: Allocate patient's AT to a new trade

### Request
```bash
curl -X POST "http://localhost:8080/api/marketplace/at-trading/trades/start-with-at" \
  -H "Content-Type: application/json" \
  -d '{
    "tradeId": "990e8400-e29b-41d4-a716-446655440006",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "assetId": "770e8400-e29b-41d4-a716-446655440002",
    "assignmentId": "660e8400-e29b-41d4-a716-446655440001",
    "atAmount": 50.00
  }'
```

### Response (201 Created)
```json
{
  "participationId": "aa0e8400-e29b-41d4-a716-446655440007",
  "tradeId": "990e8400-e29b-41d4-a716-446655440006",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "assetId": "770e8400-e29b-41d4-a716-446655440002",
  "assignmentId": "660e8400-e29b-41d4-a716-446655440001",
  "atAllocated": 50.00,
  "atMonetaryValuePkr": 500.00,
  "participationStatus": "ACTIVE",
  "monthlyHtAmount": 25.00,
  "createdAt": "2024-02-01T09:00:00Z"
}
```

**Key Calculations**:
- `atMonetaryValuePkr`: atAllocated × 10 (50 AT × 10 = 500 PKR)
- `monthlyHtAmount`: atMonetaryValuePkr × 0.05 (500 × 0.05 = 25.00 HT)

**Workflow**:
1. Patient deposits asset worth 500 PKR → 50 AT created
2. Hospital creates trade
3. Hospital calls this endpoint
4. 50 AT moves from available → unavailable
5. Monthly HT distribution (25 HT) scheduled for this participation

**Error Cases**:
```bash
# Insufficient available AT
Response: 400 Bad Request
{
  "error": "Patient does not have sufficient available AT for the requested amount"
}

# Invalid assignment
Response: 404 Not Found
{
  "error": "AT assignment not found"
}

# Duplicate participation
Response: 400 Bad Request
{
  "error": "Patient already participating in this trade"
}
```

---

## 4. Request AT Withdrawal

**Endpoint**: `POST /withdrawals/request`

**Purpose**: Patient requests AT back mid-trade (with hospital approval)

### Request - Scenario: Emergency Need
```bash
curl -X POST "http://localhost:8080/api/marketplace/at-trading/withdrawals/request" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "assetId": "770e8400-e29b-41d4-a716-446655440002",
    "tradeId": "990e8400-e29b-41d4-a716-446655440006",
    "assignmentId": "660e8400-e29b-41d4-a716-446655440001",
    "reason": "Emergency medical expense"
  }'
```

### Response (201 Created)
```json
{
  "requestId": "bb0e8400-e29b-41d4-a716-446655440008",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "assetId": "770e8400-e29b-41d4-a716-446655440002",
  "tradeId": "990e8400-e29b-41d4-a716-446655440006",
  "reason": "Emergency medical expense",
  "requestStatus": "PENDING",
  "hospitalNotes": null,
  "tradeRemainingTimeDays": null,
  "notifiedAt": null,
  "requestedAt": "2024-02-05T14:30:00Z"
}
```

**Status Flow**:
1. **PENDING**: Patient requests withdrawal
2. **APPROVED**: Hospital approves (calls approval endpoint)
3. **RETRIEVED**: Patient gets AT back, trade ends prematurely
4. **CANCELLED**: Hospital denies request

---

## 5. Approve Withdrawal Request (Hospital)

**Endpoint**: `POST /withdrawals/{requestId}/approve`

**Purpose**: Hospital approves patient's withdrawal request

### Request - Scenario: Hospital Approves
```bash
curl -X POST "http://localhost:8080/api/marketplace/at-trading/withdrawals/bb0e8400-e29b-41d4-a716-446655440008/approve" \
  -H "Content-Type: application/json" \
  -d '{
    "hospitalApprovedAt": "2024-02-05T15:00:00Z",
    "hospitalNotes": "Approved - patient showed medical emergency document"
  }'
```

### Response (200 OK)
```json
{
  "requestId": "bb0e8400-e29b-41d4-a716-446655440008",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "assetId": "770e8400-e29b-41d4-a716-446655440002",
  "tradeId": "990e8400-e29b-41d4-a716-446655440006",
  "reason": "Emergency medical expense",
  "requestStatus": "APPROVED",
  "hospitalNotes": "Approved - patient showed medical emergency document",
  "tradeRemainingTimeDays": 45,
  "notifiedAt": "2024-02-05T15:01:00Z",
  "approvedAt": "2024-02-05T15:00:00Z"
}
```

**Important**:
- `tradeRemainingTimeDays`: Days remaining in trade (informs patient when AT will be returned)
- Patient notified that they must wait tradeRemainingTimeDays for AT to be returned
- AT remains unavailable and in trade until trade settles

### Request - Scenario: Hospital Denies
```bash
curl -X POST "http://localhost:8080/api/marketplace/at-trading/withdrawals/bb0e8400-e29b-41d4-a716-446655440008/cancel" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Request does not meet emergency criteria"
  }'
```

---

## 6. Check Withdrawal Request Status

**Endpoint**: `GET /withdrawals/{requestId}/status`

**Purpose**: Check current status of withdrawal request

### Request
```bash
curl -X GET "http://localhost:8080/api/marketplace/at-trading/withdrawals/bb0e8400-e29b-41d4-a716-446655440008/status" \
  -H "Content-Type: application/json"
```

### Response - PENDING
```json
{
  "requestId": "bb0e8400-e29b-41d4-a716-446655440008",
  "requestStatus": "PENDING",
  "message": "Your withdrawal request is awaiting hospital approval",
  "hospitalNotes": null,
  "tradeRemainingTimeDays": null,
  "requestedAt": "2024-02-05T14:30:00Z"
}
```

### Response - APPROVED
```json
{
  "requestId": "bb0e8400-e29b-41d4-a716-446655440008",
  "requestStatus": "APPROVED",
  "message": "Your withdrawal has been approved. You will receive your AT back in 45 days when the trade settles.",
  "hospitalNotes": "Approved - patient showed medical emergency document",
  "tradeRemainingTimeDays": 45,
  "approvedAt": "2024-02-05T15:00:00Z",
  "notifiedAt": "2024-02-05T15:01:00Z"
}
```

### Response - RETRIEVED
```json
{
  "requestId": "bb0e8400-e29b-41d4-a716-446655440008",
  "requestStatus": "RETRIEVED",
  "message": "Your AT has been returned to your account",
  "retrievedAt": "2024-03-22T10:00:00Z"
}
```

---

## 7. Get Pending HT Distributions

**Endpoint**: `GET /patient/{patientId}/pending-ht-distributions`

**Purpose**: View all pending monthly HT distributions awaiting distribution

### Request
```bash
curl -X GET "http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/pending-ht-distributions" \
  -H "Content-Type: application/json"
```

### Response (200 OK)
```json
[
  {
    "distributionId": "cc0e8400-e29b-41d4-a716-446655440009",
    "tradeId": "990e8400-e29b-41d4-a716-446655440006",
    "participationId": "aa0e8400-e29b-41d4-a716-446655440007",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "distributionMonth": "2024-02-01",
    "atPercentageRate": 5,
    "atAmountBase": 500.00,
    "calculatedHtAmount": 25.00,
    "isDistributed": false,
    "createdAt": "2024-02-01T00:00:00Z"
  },
  {
    "distributionId": "cc0e8400-e29b-41d4-a716-446655440010",
    "tradeId": "990e8400-e29b-41d4-a716-446655440006",
    "participationId": "aa0e8400-e29b-41d4-a716-446655440007",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "distributionMonth": "2024-03-01",
    "atPercentageRate": 5,
    "atAmountBase": 500.00,
    "calculatedHtAmount": 25.00,
    "isDistributed": false,
    "createdAt": "2024-03-01T00:00:00Z"
  }
]
```

**Interpretation**:
- Shows pending HT not yet credited to patient's token balance
- Wallet service should call this periodically and update patient balances
- Once distributed, `isDistributed` changes to `true`

---

## 8. Get Active Trades

**Endpoint**: `GET /patient/{patientId}/active-trades`

**Purpose**: List all ongoing trades where patient has AT allocated

### Request
```bash
curl -X GET "http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/active-trades" \
  -H "Content-Type: application/json"
```

### Response (200 OK)
```json
[
  {
    "participationId": "aa0e8400-e29b-41d4-a716-446655440007",
    "tradeId": "990e8400-e29b-41d4-a716-446655440006",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "assetId": "770e8400-e29b-41d4-a716-446655440002",
    "assignmentId": "660e8400-e29b-41d4-a716-446655440001",
    "atAllocated": 50.00,
    "atMonetaryValuePkr": 500.00,
    "participationStatus": "ACTIVE",
    "monthlyHtAmount": 25.00,
    "createdAt": "2024-02-01T09:00:00Z"
  },
  {
    "participationId": "aa0e8400-e29b-41d4-a716-446655440011",
    "tradeId": "dd0e8400-e29b-41d4-a716-446655440012",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "assetId": "770e8400-e29b-41d4-a716-446655440005",
    "assignmentId": "660e8400-e29b-41d4-a716-446655440004",
    "atAllocated": 30.00,
    "atMonetaryValuePkr": 300.00,
    "participationStatus": "ACTIVE",
    "monthlyHtAmount": 15.00,
    "createdAt": "2024-02-10T10:30:00Z"
  }
]
```

---

## Complete AT Trading Lifecycle Example

### 1. Asset Deposit Phase
```bash
# 1.1 Patient deposits asset worth 100 PKR
# Asset Deposit Service: Creates deposit, approval pending
# Status: PENDING → APPROVED

# 1.2 When approved, AT Trading Service initializes
curl -X POST "http://localhost:8080/api/marketplace/at-trading/init" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "assetId": "770e8400-e29b-41d4-a716-446655440002",
    "hospitalId": "880e8400-e29b-41d4-a716-446655440003",
    "totalAtAmount": 10.00
  }'

# 1.3 Check initial status
curl http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/status
# Response: totalAt=10, all AVAILABLE
```

### 2. Trade Allocation Phase
```bash
# 2.1 Hospital creates a trade
# Marketplace creates trade in database

# 2.2 Get available AT
curl http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/available

# 2.3 Allocate 8 AT to trade (80 PKR value)
curl -X POST "http://localhost:8080/api/marketplace/at-trading/trades/start-with-at" \
  -H "Content-Type: application/json" \
  -d '{
    "tradeId": "990e8400-e29b-41d4-a716-446655440006",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "assetId": "770e8400-e29b-41d4-a716-446655440002",
    "assignmentId": "660e8400-e29b-41d4-a716-446655440001",
    "atAmount": 8.00
  }'
# Response: monthlyHtAmount = 40 (8×10×0.05)

# 2.4 Check status after allocation
curl http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/status
# Response: 
#   totalAvailableAt = 2 (10-8)
#   totalUnavailableAt = 8
#   pendingMonthlyHtAmount = 40 (will be distributed monthly)
```

### 3. Active Trade Phase (3 months)
```bash
# 3.1 Month 1: Monthly HT distribution scheduled
# Scheduler runs on 1st of month
# MonthlyHtDistribution created: calculatedHtAmount = 40

# 3.2 Check pending HT
curl http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/pending-ht-distributions
# Response: 1 distribution of 40 HT

# 3.3 Wallet service distributes the HT
# Calls: UPDATE patient_token_balance SET total_ht = total_ht + 40
# Then marks as distributed

# 3.4 Month 2 & 3: Same process repeats
# Total pending HT after 3 months = 40 × 3 = 120 HT

# 3.5 If patient needs emergency withdrawal (Month 2)
curl -X POST "http://localhost:8080/api/marketplace/at-trading/withdrawals/request" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "assetId": "770e8400-e29b-41d4-a716-446655440002",
    "tradeId": "990e8400-e29b-41d4-a716-446655440006",
    "assignmentId": "660e8400-e29b-41d4-a716-446655440001",
    "reason": "Medical emergency"
  }'

# 3.6 Hospital approves withdrawal
curl -X POST "http://localhost:8080/api/marketplace/at-trading/withdrawals/{requestId}/approve" \
  -H "Content-Type: application/json" \
  -d '{
    "hospitalApprovedAt": "2024-03-15T10:00:00Z",
    "hospitalNotes": "Approved - urgent case"
  }'
# Patient informed: Wait 15 more days for AT return
```

### 4. Trade Settlement Phase
```bash
# 4.1 Trade closes with profit of 200 PKR
# Marketplace calculates: profit_per_at = (200 / 8) = 25 PKR per AT

# 4.2 AT Trading Service settles:
# - Profit HT issued = 8 AT at 25 PKR profit = 200 PKR × 0.1 = 20 HT
# - Monthly HT issued = 120 HT (saved from 3 months)
# - Total HT = 20 + 120 = 140 HT

# 4.3 TradeAtSettlement record created
# - profitHtIssued = 20
# - totalMonthlyHtIssued = 120
# - totalHtIssued = 140

# 4.4 AT returned to available
# PatientAtAssignment update:
# - availableAt = 10 (was 2 + 8 returned)
# - unavailableAt = 0

# 4.5 Withdrawal request auto-processed
# PatientAtWithdrawalRequest status → RETRIEVED
# Patient notified: AT available for withdrawal

# 4.6 Patient's AT status now shows
curl http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/status
# Response:
#   totalAvailableAt = 10 (back to original)
#   totalUnavailableAt = 0
#   pendingMonthlyHtAmount = 0 (all distributed)
#   activeTradeCount = 0

# 4.7 Patient's token balance updated with 140 HT total
# Separate wallet service updates: total_ht = 140
```

---

## Error Code Reference

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Insufficient available AT | Allocate less AT or wait for other trades to settle |
| 400 | Invalid amount | Use positive number, max 2 decimals |
| 404 | AT assignment not found | Check assignment ID matches patient's assets |
| 404 | Trade not found | Verify trade ID exists |
| 404 | Patient not found | Check patient ID format |
| 409 | Duplicate participation | Patient already allocated AT to this trade |
| 409 | Duplicate withdrawal request | Patient already has pending withdrawal for this trade |
| 500 | Database error | Contact system administrator |

---

## Testing Scenarios

### Scenario 1: Simple Trade (No Withdrawal)
1. Patient deposits 100 PKR asset → 10 AT created
2. Hospital uses 5 AT in trade
3. 3 months pass → 150 HT accumulated (5 × 10 × 0.05 × 3 months)
4. Trade profits 100 PKR → 50 HT issued (100 × 0.1 ÷ 2 AT per PKR... actually 100 × 0.1 = 10 HT)
5. Total: 150 + 10 = 160 HT to patient

### Scenario 2: Trade With Withdrawal Approval
1. Patient deposits 100 PKR asset → 10 AT
2. Hospital uses 8 AT in trade
3. Month 1: 40 HT pending
4. Month 2: Patient needs emergency, requests withdrawal
5. Hospital approves, patient must wait 40 days
6. Trade settles with loss of -50 PKR
7. Profit HT = -5 HT (loss is negative)
8. AT returned, withdrawal processed
9. Total: 80 HT (120 from 3 months, -40 from loss)

### Scenario 3: Multiple Active Trades
1. Patient has 50 AT available
2. Trade A uses 20 AT (100 HT monthly)
3. Trade B uses 15 AT (75 HT monthly)
4. Remaining: 15 available AT
5. Each month: 175 HT total pending
6. When trades settle separately: Settlement calcs per trade

