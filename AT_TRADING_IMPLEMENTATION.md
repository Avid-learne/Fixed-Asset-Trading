# AT Trading Logic Implementation Guide

## Overview

This document describes the comprehensive implementation of the AT (Asset Token) trading lifecycle as specified in your requirements. The system manages patient AT availability, automated monthly HT distributions, and withdrawal request handling.

---

## System Architecture

### Core Concepts

1. **Available AT**: Asset tokens that are not actively used in any trade and are ready to be allocated
2. **Unavailable AT**: Asset tokens that are currently allocated to an active trade
3. **Monthly HT Distribution**: 5% of the AT monetary value distributed monthly to the patient
4. **Trade Settlement**: Process of closing a trade, calculating profits, and returning AT to available status

### Data Flow Diagram

```
Patient Deposits Asset
        ↓
AT Assignment Created (Status: AVAILABLE)
        ↓
Hospital Initiates Trade
        ↓
AT Marked UNAVAILABLE → Trade Participation Created
        ↓
Monthly: 5% HT Distribution ← Monthly HT Distribution Records
        ↓
Patient Requests Withdrawal (Optional)
        ↓
Withdrawal Request Approved → Informed to Wait
        ↓
Trade Closes
        ↓
Trade Settlement Process:
  - Calculate Profit/Loss
  - Issue Profit-Based HT
  - Return AT to AVAILABLE
  - Process Pending Withdrawals
        ↓
AT Available Again & Cycle Repeats
```

---

## Database Entities

### 1. PatientAtAssignment
**Table**: `patient_at_assignments`

Tracks AT allocated to each patient and its availability status.

```sql
CREATE TABLE patient_at_assignments (
    assignment_id UUID PRIMARY KEY,
    patient_id UUID NOT NULL,
    asset_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    total_at_assigned DECIMAL NOT NULL,
    available_at DECIMAL NOT NULL,
    unavailable_at DECIMAL NOT NULL,
    availability_status ENUM('AVAILABLE', 'UNAVAILABLE'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Key Fields**:
- `total_at_assigned`: Total AT from this specific asset deposit
- `available_at`: AT currently available for trading
- `unavailable_at`: AT currently in an active trade
- `availability_status`: Overall status (AVAILABLE if all AT are available, UNAVAILABLE if any are in trade)

---

### 2. TradeParticipation
**Table**: `trade_participations`

Records patient participation in individual trades.

```sql
CREATE TABLE trade_participations (
    participation_id UUID PRIMARY KEY,
    trade_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    asset_id UUID NOT NULL,
    assignment_id UUID NOT NULL,
    at_allocated DECIMAL NOT NULL,
    at_monetary_value_pkr DECIMAL NOT NULL,
    participation_status ENUM('ACTIVE', 'SETTLED', 'WITHDRAWN'),
    trade_start_time TIMESTAMP NOT NULL,
    trade_end_time TIMESTAMP,
    marked_unavailable_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Key Fields**:
- `at_allocated`: Amount of AT allocated to this trade
- `at_monetary_value_pkr`: Monetary value in PKR (1 AT = 10 PKR)
- `participation_status`: Current state of participation
- `marked_unavailable_at`: When AT became unavailable for this trade

---

### 3. MonthlyHtDistribution
**Table**: `monthly_ht_distributions`

Tracks monthly 5% HT distributions.

```sql
CREATE TABLE monthly_ht_distributions (
    distribution_id UUID PRIMARY KEY,
    trade_id UUID NOT NULL,
    participation_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    distribution_month DATE NOT NULL,
    at_percentage_rate DECIMAL DEFAULT 5,
    at_amount_base DECIMAL NOT NULL,
    calculated_ht_amount DECIMAL NOT NULL,
    is_distributed BOOLEAN DEFAULT false,
    distributed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Calculation Logic**:
```
calculated_ht_amount = at_monetary_value_pkr × 0.05
```

For example:
- AT allocated: 100
- Monetary value: 100 × 10 = 1000 PKR
- Monthly HT: 1000 × 0.05 = 50 HT

---

### 4. PatientAtWithdrawalRequest
**Table**: `patient_at_withdrawal_requests`

Tracks withdrawal requests from patients.

```sql
CREATE TABLE patient_at_withdrawal_requests (
    request_id UUID PRIMARY KEY,
    patient_id UUID NOT NULL,
    asset_id UUID NOT NULL,
    trade_id UUID NOT NULL,
    assignment_id UUID NOT NULL,
    requested_at TIMESTAMP NOT NULL,
    reason TEXT,
    request_status ENUM('PENDING', 'APPROVED', 'RETRIEVED', 'CANCELLED'),
    trade_remaining_time_days INTEGER,
    notified_at TIMESTAMP,
    approved_at TIMESTAMP,
    retrieved_at TIMESTAMP,
    hospital_notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Request Flow**:
1. Patient requests withdrawal (Status: PENDING)
2. Hospital approves (Status: APPROVED) + informs patient of remaining days
3. Patient is notified to wait
4. Trade ends
5. AT returned to patient (Status: RETRIEVED)

---

### 5. TradeAtSettlement
**Table**: `trade_at_settlements`

Records final settlement of trades.

```sql
CREATE TABLE trade_at_settlements (
    settlement_id UUID PRIMARY KEY,
    trade_id UUID UNIQUE NOT NULL,
    participation_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    original_at_allocated DECIMAL NOT NULL,
    trade_profit_loss DECIMAL NOT NULL,
    at_returned_available DECIMAL NOT NULL,
    profit_percentage DECIMAL NOT NULL,
    profit_ht_issued DECIMAL NOT NULL,
    total_monthly_ht_issued DECIMAL NOT NULL DEFAULT 0,
    trade_end_time TIMESTAMP NOT NULL,
    settled_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP
);
```

**Settlement Calculation**:
1. Calculate total profit/loss
2. Allocate profit based on AT contribution
3. Convert profit to HT (1 PKR profit = 0.1 HT)
4. Issue HT to patient (both monthly + profit-based)
5. Return AT to AVAILABLE status

---

## Service Implementation

### AtTradingService

Main service orchestrating the AT trading lifecycle.

#### Key Methods

**1. Initialize AT Assignment**
```java
PatientAtAssignment initializeAtAssignment(
    UUID patientId, 
    UUID assetId, 
    UUID hospitalId, 
    BigDecimal atAmount
)
```

Called when patient deposits assets. Creates initial assignment with AT in AVAILABLE status.

**2. Start Trade with AT**
```java
TradeParticipation startTradeWithPatientAt(
    UUID tradeId,
    UUID patientId,
    UUID assetId,
    UUID assignmentId,
    BigDecimal atToAllocate
)
```

- Validates available AT
- Creates trade participation
- Marks AT as UNAVAILABLE
- Schedules monthly HT distributions

**3. Monthly HT Distribution**
```java
MonthlyHtDistribution createMonthlyHtDistribution(
    UUID tradeId,
    UUID participationId,
    UUID patientId,
    LocalDate distributionMonth
)
```

Calculates 5% HT and creates distribution record. Call this monthly for active trades.

**4. Withdrawal Request**
```java
PatientAtWithdrawalRequest requestAtWithdrawal(
    UUID patientId,
    UUID assetId,
    UUID tradeId,
    UUID assignmentId,
    String reason
)
```

Patient requests their AT back. System will return the AT after trade ends.

**5. Approve Withdrawal**
```java
PatientAtWithdrawalRequest approveWithdrawalRequest(
    UUID requestId,
    Integer tradeRemainingDays,
    String hospitalNotes
)
```

Hospital approves request and informs patient of remaining trade duration.

**6. Settle Trade**
```java
TradeAtSettlement settleTrade(
    UUID tradeId,
    BigDecimal profitLoss
)
```

Called when trade ends:
- Calculates profit-based HT distribution
- Sums all monthly HT distributions
- Returns AT to AVAILABLE status
- Processes pending withdrawal requests

---

## API Endpoints

Base URL: `/api/marketplace/at-trading`

### Get Patient AT Status
```
GET /patient/{patientId}/status
```

Returns comprehensive AT status including:
- Available AT amount
- Unavailable AT in active trades
- Pending monthly HT distributions
- Active withdrawal requests
- Number of active trades

**Response**:
```json
{
  "patientId": "uuid",
  "totalAvailableAt": 150.00,
  "totalUnavailableAt": 100.00,
  "totalAt": 250.00,
  "pendingMonthlyHtAmount": 150.00,
  "activeTradeCount": 2,
  "activeWithdrawalRequests": [...]
}
```

### Get Available AT
```
GET /patient/{patientId}/available
```

Lists all AT assignments currently available for trading.

### Start Trade with AT
```
POST /trades/start-with-at
```

**Request**:
```json
{
  "tradeId": "uuid",
  "patientId": "uuid",
  "assetId": "uuid",
  "assignmentId": "uuid",
  "atAmount": 50.00
}
```

**Response**: Trade participation details

### Get Active Trades
```
GET /patient/{patientId}/active-trades
```

Lists all active trades for the patient with AT currently at risk.

### Request AT Withdrawal
```
POST /withdrawals/request
```

**Request**:
```json
{
  "patientId": "uuid",
  "assetId": "uuid",
  "tradeId": "uuid",
  "assignmentId": "uuid",
  "reason": "Financial emergency"
}
```

**Response**: Withdrawal request with status

### Get Withdrawal Status
```
GET /withdrawals/{requestId}/status
```

Check current status of withdrawal request and remaining days.

### Get Pending HT Distributions
```
GET /patient/{patientId}/pending-ht-distributions
```

Lists all pending monthly HT distributions awaiting distribution.

---

## Implementation Workflow

### Step 1: Patient Deposits Assets

```java
// When patient deposits asset
PatientAtAssignment assignment = atTradingService.initializeAtAssignment(
    patientId,
    assetId,
    hospitalId,
    new BigDecimal("100")  // 100 AT
);

// Assignment created with:
// - totalAtAssigned: 100
// - availableAt: 100
// - unavailableAt: 0
// - status: AVAILABLE
```

### Step 2: Hospital Initiates Trade

```java
// Hospital starts trade with patient's available AT
TradeParticipation participation = atTradingService.startTradeWithPatientAt(
    tradeId,
    patientId,
    assetId,
    assignmentId,
    new BigDecimal("80")  // Allocate 80 of 100 AT
);

// After this:
// - AT marked UNAVAILABLE: 80
// - AT still available: 20
// - Trade participation created
```

### Step 3: Monthly HT Distribution (Automated)

```java
// Run monthly for each active trade
for (TradeParticipation trade : activeParticipations) {
    MonthlyHtDistribution distribution = atTradingService.createMonthlyHtDistribution(
        trade.getTradeId(),
        trade.getParticipationId(),
        trade.getPatientId(),
        LocalDate.now()
    );
    // Creates distribution for: 80 AT × 10 PKR × 0.05 = 40 HT
}

// Later, distribute the HT when ready
atTradingService.distributeMonthlyHt(distributionId);
```

### Step 4: Patient Requests Withdrawal (Optional)

```java
// Patient requests AT back (mid-trade)
PatientAtWithdrawalRequest request = atTradingService.requestAtWithdrawal(
    patientId,
    assetId,
    tradeId,
    assignmentId,
    "Emergency need for funds"
);

// Hospital reviews and approves
atTradingService.approveWithdrawalRequest(
    requestId,
    15,  // 15 days until trade ends
    "Request approved. Trade ends in 15 days. AT will be returned then."
);

// Patient is informed about remaining time
```

### Step 5: Trade Settles

```java
// When trade ends, settle it
atTradingService.settleTrade(
    tradeId,
    new BigDecimal("5000")  // Profit of 5000 PKR
);

// Settlement process:
// 1. Calculate profit allocation based on AT contribution
// 2. Convert profit to HT: 5000 × 0.1 = 500 HT
// 3. Sum monthly distributions: 40 HT × 3 months = 120 HT
// 4. Total HT issued: 500 + 120 = 620 HT
// 5. Return 80 AT to AVAILABLE (20 + 80 = 100 available again)
// 6. Process pending withdrawals - return AT to patient
```

---

## Scheduled Tasks (Recommended Implementations)

Add these to your application for automation:

### Monthly HT Distribution Task

```java
@Component
@Scheduled(cron = "0 0 0 1 * *")  // First day of each month
public class MonthlyHtDistributionTask {
    
    @Autowired
    private AtTradingService atTradingService;
    
    public void distributeMonthlyHt() {
        // Get all pending distributions for last month
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        List<MonthlyHtDistribution> pending = ...;
        
        for (MonthlyHtDistribution distribution : pending) {
            atTradingService.distributeMonthlyHt(distribution.getDistributionId());
        }
    }
}
```

### Trade Settlement Notification Task

```java
@Component
@Scheduled(fixedRate = 3600000)  // Every hour
public class TradeSettlementNotificationTask {
    
    public void notifyUpcomingSettlements() {
        // Find trades ending in next 24 hours
        // Send notifications to patients
        // Prepare for settlement
    }
}
```

---

## Conversion Rates

- **AT to PKR**: 1 AT = 10 PKR
- **Monthly HT Rate**: 5% of AT monetary value
- **Profit to HT**: 1 PKR profit = 0.1 HT

## Example Calculation

Patient deposits 100 PKR worth of gold (= 10 AT):
- Initial AT value: 10 AT
- Monetary value: 10 × 10 = 100 PKR
- Hospital uses 8 AT for trade (80 PKR value)
- Monthly HT: 80 × 0.05 = 4 HT
- If trade profits 400 PKR:
  - Patient's share by AT proportion: 400 × (80/100) = 320 PKR
  - HT issued: 320 × 0.1 = 32 HT
  - Monthly HT (3 months): 4 × 3 = 12 HT
  - Total HT: 32 + 12 = 44 HT

---

## Error Scenarios

### Insufficient Available AT
```
Error: "Insufficient available AT"
Action: Check patient's available AT. Wait for other trades to settle.
```

### Duplicate Withdrawal Request
```
Error: "Patient already has a pending withdrawal request for this asset and trade"
Action: Cancel existing request first.
```

### Not Yet Tradeable
```
Error: "Trade not yet ended, cannot process withdrawal"
Action: Wait for trade to end, then withdrawal will auto-process.
```

---

## Integration Points

### With Wallet/Token Service
- Distribute HT to patient wallet after settlement
- Update PatientTokenBalance with new HT amounts

### With Blockchain Service
- Record mint transactions when HT are issued
- Store transaction hashes

### With Notification Service
- Inform patient when withdrawal approved
- Alert patient on pending HT distributions
- Notify when trade settles

---

## Testing Checklist

- [ ] AT assignment created correctly when asset deposited
- [ ] AT marked unavailable when trade starts
- [ ] Monthly HT distributions calculated correctly (5%)
- [ ] Withdrawal request blocks patient temporarily
- [ ] Hospital can approve withdrawal with remaining days
- [ ] Patient is informed of waiting period
- [ ] Trade settlement returns AT to available
- [ ] Profit HT calculated and issued correctly
- [ ] Pending withdrawal processed when trade ends
- [ ] Multiple trades for same patient work correctly

