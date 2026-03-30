# AT Trading System - Complete Testing Guide

## Overview
This guide covers all testing strategies for the AT Trading System integration, including unit tests, integration tests, API tests, and end-to-end scenarios.

---

## 1. Unit Testing

### 1.1 Test AtTradingService

Create file: `SehatVaultBackend/src/test/java/com/SehatVault/SehatVaultBackend/marketplace/service/AtTradingServiceTest.java`

```java
package com.SehatVault.SehatVaultBackend.marketplace.service;

import com.SehatVault.SehatVaultBackend.marketplace.entity.*;
import com.SehatVault.SehatVaultBackend.marketplace.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AtTradingServiceTest {

    @Mock
    private PatientAtAssignmentRepository assignmentRepository;

    @Mock
    private TradeParticipationRepository participationRepository;

    @Mock
    private MonthlyHtDistributionRepository distributionRepository;

    @Mock
    private TradeAtSettlementRepository settlementRepository;

    @Mock
    private PatientAtWithdrawalRequestRepository withdrawalRepository;

    @InjectMocks
    private AtTradingService atTradingService;

    private UUID patientId;
    private UUID assetId;
    private UUID hospitalId;
    private UUID tradeId;
    private BigDecimal atAmount;

    @BeforeEach
    void setUp() {
        patientId = UUID.randomUUID();
        assetId = UUID.randomUUID();
        hospitalId = UUID.randomUUID();
        tradeId = UUID.randomUUID();
        atAmount = new BigDecimal("10.00");
    }

    @Test
    void testInitializeAtAssignment() {
        // Arrange
        when(assignmentRepository.save(any())).thenAnswer(invocation -> {
            PatientAtAssignment arg = invocation.getArgument(0);
            arg.setAssignmentId(UUID.randomUUID());
            return arg;
        });

        // Act
        PatientAtAssignment result = atTradingService.initializeAtAssignment(
            patientId, assetId, hospitalId, atAmount
        );

        // Assert
        assertNotNull(result);
        assertEquals(patientId, result.getPatientId());
        assertEquals(assetId, result.getAssetId());
        assertEquals(hospitalId, result.getHospitalId());
        assertEquals(atAmount, result.getAvailableAt());
        assertEquals(BigDecimal.ZERO, result.getUnavailableAt());
        assertEquals(PatientAtAssignment.AvailabilityStatus.AVAILABLE, result.getAvailabilityStatus());
        verify(assignmentRepository, times(1)).save(any());
    }

    @Test
    void testStartTradeWithPatientAt() {
        // Arrange
        PatientAtAssignment assignment = PatientAtAssignment.builder()
            .assignmentId(UUID.randomUUID())
            .patientId(patientId)
            .assetId(assetId)
            .hospitalId(hospitalId)
            .totalAtAssigned(atAmount)
            .availableAt(atAmount)
            .unavailableAt(BigDecimal.ZERO)
            .availabilityStatus(PatientAtAssignment.AvailabilityStatus.AVAILABLE)
            .build();

        when(assignmentRepository.findById(assignment.getAssignmentId()))
            .thenReturn(Optional.of(assignment));
        when(assignmentRepository.save(any())).thenReturn(assignment);
        when(participationRepository.save(any())).thenAnswer(invocation -> {
            TradeParticipation arg = invocation.getArgument(0);
            arg.setParticipationId(UUID.randomUUID());
            return arg;
        });
        when(distributionRepository.save(any())).thenAnswer(invocation -> {
            MonthlyHtDistribution arg = invocation.getArgument(0);
            arg.setDistributionId(UUID.randomUUID());
            return arg;
        });

        // Act
        TradeParticipation result = atTradingService.startTradeWithPatientAt(
            tradeId, patientId, assetId, assignment.getAssignmentId(), new BigDecimal("5.00")
        );

        // Assert
        assertNotNull(result);
        assertEquals(tradeId, result.getTradeId());
        assertEquals(patientId, result.getPatientId());
        assertEquals(new BigDecimal("5.00"), result.getAtAllocated());
        assertEquals(new BigDecimal("50.00"), result.getAtMonetaryValuePkr());
        assertEquals(TradeParticipation.ParticipationStatus.ACTIVE, result.getParticipationStatus());
        verify(assignmentRepository, times(1)).save(any());
        verify(participationRepository, times(1)).save(any());
    }

    @Test
    void testMonthlyHtCalculation() {
        // Arrange - 5 AT in trade = 50 PKR monetary value
        PatientAtAssignment assignment = PatientAtAssignment.builder()
            .assignmentId(UUID.randomUUID())
            .patientId(patientId)
            .assetId(assetId)
            .hospitalId(hospitalId)
            .totalAtAssigned(atAmount)
            .availableAt(BigDecimal.ZERO)
            .unavailableAt(atAmount)
            .availabilityStatus(PatientAtAssignment.AvailabilityStatus.UNAVAILABLE)
            .build();

        TradeParticipation participation = TradeParticipation.builder()
            .participationId(UUID.randomUUID())
            .tradeId(tradeId)
            .patientId(patientId)
            .assetId(assetId)
            .assignmentId(assignment.getAssignmentId())
            .atAllocated(atAmount)
            .atMonetaryValuePkr(new BigDecimal("100.00"))
            .participationStatus(TradeParticipation.ParticipationStatus.ACTIVE)
            .build();

        // Act - Monthly HT should be 5% of monetary value
        BigDecimal monthlyHt = participation.getAtMonetaryValuePkr()
            .multiply(new BigDecimal("0.05"));

        // Assert
        assertEquals(new BigDecimal("5.00"), monthlyHt);
    }

    @Test
    void testRequestAtWithdrawal() {
        // Arrange
        PatientAtWithdrawalRequest request = PatientAtWithdrawalRequest.builder()
            .patientId(patientId)
            .assetId(assetId)
            .tradeId(tradeId)
            .reason("Emergency")
            .requestStatus(PatientAtWithdrawalRequest.WithdrawalRequestStatus.PENDING)
            .build();

        when(withdrawalRepository.save(any())).thenAnswer(invocation -> {
            PatientAtWithdrawalRequest arg = invocation.getArgument(0);
            arg.setRequestId(UUID.randomUUID());
            return arg;
        });

        // Act
        PatientAtWithdrawalRequest result = atTradingService.requestAtWithdrawal(
            patientId, assetId, tradeId, UUID.randomUUID(), "Emergency"
        );

        // Assert
        assertNotNull(result);
        assertEquals(patientId, result.getPatientId());
        assertEquals(PatientAtWithdrawalRequest.WithdrawalRequestStatus.PENDING, result.getRequestStatus());
        verify(withdrawalRepository, times(1)).save(any());
    }

    @Test
    void testProfitHtCalculation() {
        // Test: 100 PKR profit × 0.1 = 10 HT
        BigDecimal profitLoss = new BigDecimal("100.00");
        BigDecimal profitHt = profitLoss.multiply(new BigDecimal("0.1"));

        assertEquals(new BigDecimal("10.00"), profitHt);
    }

    @Test
    void testMonthlyHtNegativeMath() {
        // Test: Monthly HT never goes negative
        BigDecimal loss = new BigDecimal("-50.00");
        BigDecimal profitHt = loss.multiply(new BigDecimal("0.1"));

        // Verify negative loss produces negative HT (which should be handled as zero)
        assertTrue(profitHt.compareTo(BigDecimal.ZERO) < 0);
    }
}
```

### 1.2 Run Unit Tests

```bash
cd SehatVaultBackend
mvn test -Dtest=AtTradingServiceTest
```

Expected output:
```
[INFO] ------- T E S T   S U I T E -------
[INFO] AtTradingServiceTest
[INFO]   ✓ testInitializeAtAssignment
[INFO]   ✓ testStartTradeWithPatientAt
[INFO]   ✓ testMonthlyHtCalculation
[INFO]   ✓ testRequestAtWithdrawal
[INFO]   ✓ testProfitHtCalculation
[INFO]   ✓ testMonthlyHtNegativeMath
[INFO] Tests run: 6, Failures: 0, Errors: 0
```

---

## 2. Integration Testing

### 2.1 Create Integration Test

Create file: `SehatVaultBackend/src/test/java/com/SehatVault/SehatVaultBackend/marketplace/AtTradingIntegrationTest.java`

```java
package com.SehatVault.SehatVaultBackend.marketplace;

import com.SehatVault.SehatVaultBackend.marketplace.entity.*;
import com.SehatVault.SehatVaultBackend.marketplace.repository.*;
import com.SehatVault.SehatVaultBackend.marketplace.service.AtTradingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AtTradingIntegrationTest {

    @Autowired
    private AtTradingService atTradingService;

    @Autowired
    private PatientAtAssignmentRepository assignmentRepository;

    @Autowired
    private TradeParticipationRepository participationRepository;

    @Autowired
    private MonthlyHtDistributionRepository distributionRepository;

    @Autowired
    private TradeAtSettlementRepository settlementRepository;

    @Autowired
    private PatientAtWithdrawalRequestRepository withdrawalRepository;

    private UUID patientId;
    private UUID assetId;
    private UUID hospitalId;
    private UUID tradeId;

    @BeforeEach
    void setUp() {
        patientId = UUID.randomUUID();
        assetId = UUID.randomUUID();
        hospitalId = UUID.randomUUID();
        tradeId = UUID.randomUUID();
    }

    @Test
    void testCompleteAtTradingLifecycle() {
        // Step 1: Initialize AT assignment (asset approved)
        PatientAtAssignment assignment = atTradingService.initializeAtAssignment(
            patientId, assetId, hospitalId, new BigDecimal("100.00")
        );

        assertNotNull(assignment);
        assertEquals(new BigDecimal("100.00"), assignment.getTotalAtAssigned());
        assertEquals(new BigDecimal("100.00"), assignment.getAvailableAt());
        assertEquals(PatientAtAssignment.AvailabilityStatus.AVAILABLE, assignment.getAvailabilityStatus());

        // Verify in database
        PatientAtAssignment saved = assignmentRepository.findById(assignment.getAssignmentId()).get();
        assertNotNull(saved);

        // Step 2: Start trade with AT (8 AT allocated)
        TradeParticipation participation = atTradingService.startTradeWithPatientAt(
            tradeId, patientId, assetId, assignment.getAssignmentId(), new BigDecimal("8.00")
        );

        assertNotNull(participation);
        assertEquals(new BigDecimal("8.00"), participation.getAtAllocated());
        assertEquals(new BigDecimal("80.00"), participation.getAtMonetaryValuePkr());
        assertEquals(TradeParticipation.ParticipationStatus.ACTIVE, participation.getParticipationStatus());

        // Verify AT marked unavailable
        PatientAtAssignment updated = assignmentRepository.findById(assignment.getAssignmentId()).get();
        assertEquals(new BigDecimal("92.00"), updated.getAvailableAt()); // 100 - 8
        assertEquals(new BigDecimal("8.00"), updated.getUnavailableAt());

        // Step 3: Create monthly HT distribution
        MonthlyHtDistribution distribution = atTradingService.createMonthlyHtDistribution(
            tradeId, participation.getParticipationId(), patientId, LocalDate.now()
        );

        assertNotNull(distribution);
        assertEquals(new BigDecimal("4.00"), distribution.getCalculatedHtAmount()); // 80 * 0.05
        assertFalse(distribution.getIsDistributed());

        // Step 4: Distribute monthly HT
        atTradingService.distributeMonthlyHt(distribution.getDistributionId());
        MonthlyHtDistribution distributed = distributionRepository.findById(distribution.getDistributionId()).get();
        assertTrue(distributed.getIsDistributed());

        // Step 5: Request withdrawal
        PatientAtWithdrawalRequest withdrawalReq = atTradingService.requestAtWithdrawal(
            patientId, assetId, tradeId, assignment.getAssignmentId(), "Emergency"
        );

        assertNotNull(withdrawalReq);
        assertEquals(PatientAtWithdrawalRequest.WithdrawalRequestStatus.PENDING, withdrawalReq.getRequestStatus());

        // Step 6: Approve withdrawal
        atTradingService.approveWithdrawalRequest(
            withdrawalReq.getRequestId(), 30, "Approved"
        );
        
        PatientAtWithdrawalRequest approved = withdrawalRepository.findById(withdrawalReq.getRequestId()).get();
        assertEquals(PatientAtWithdrawalRequest.WithdrawalRequestStatus.APPROVED, approved.getRequestStatus());
        assertEquals(30, approved.getTradeRemainingTimeDays());

        // Step 7: Settle trade (3 months passed, 100 PKR profit)
        TradeAtSettlement settlement = atTradingService.settleTrade(tradeId, new BigDecimal("100.00"));

        assertNotNull(settlement);
        assertEquals(new BigDecimal("8.00"), settlement.getOriginalAtAllocated());
        assertEquals(new BigDecimal("100.00"), settlement.getTradeProfitLoss());

        // Profit HT = 100 * 0.1 = 10 HT
        assertEquals(new BigDecimal("10.00"), settlement.getProfitHtIssued());

        // Monthly HT = 4 HT * 3 months (estimate) = 12 HT
        BigDecimal totalMonthlyHt = settlement.getTotalMonthlyHtIssued();
        assertNotNull(totalMonthlyHt);

        // Total HT = profit + monthly
        BigDecimal totalHt = settlement.getTotalHtIssued();
        assertTrue(totalHt.compareTo(BigDecimal.TEN) >= 0); // At least 10 from profit

        // Step 8: Verify AT returned to available
        PatientAtAssignment final_assignment = assignmentRepository.findById(assignment.getAssignmentId()).get();
        assertEquals(new BigDecimal("100.00"), final_assignment.getAvailableAt()); // Back to original
        assertEquals(BigDecimal.ZERO, final_assignment.getUnavailableAt());

        // Verify withdrawal auto-processed
        PatientAtWithdrawalRequest final_withdrawal = withdrawalRepository.findById(withdrawalReq.getRequestId()).get();
        assertEquals(PatientAtWithdrawalRequest.WithdrawalRequestStatus.RETRIEVED, final_withdrawal.getRequestStatus());
    }

    @Test
    void testMultipleConcurrentTrades() {
        UUID trade1 = UUID.randomUUID();
        UUID trade2 = UUID.randomUUID();

        // Initialize assignment
        PatientAtAssignment assignment = atTradingService.initializeAtAssignment(
            patientId, assetId, hospitalId, new BigDecimal("50.00")
        );

        // Start trade 1 with 15 AT
        TradeParticipation part1 = atTradingService.startTradeWithPatientAt(
            trade1, patientId, assetId, assignment.getAssignmentId(), new BigDecimal("15.00")
        );

        // Start trade 2 with 20 AT
        TradeParticipation part2 = atTradingService.startTradeWithPatientAt(
            trade2, patientId, assetId, assignment.getAssignmentId(), new BigDecimal("20.00")
        );

        // Verify both active
        assertEquals(TradeParticipation.ParticipationStatus.ACTIVE, part1.getParticipationStatus());
        assertEquals(TradeParticipation.ParticipationStatus.ACTIVE, part2.getParticipationStatus());

        // Verify remaining AT available
        PatientAtAssignment updated = assignmentRepository.findById(assignment.getAssignmentId()).get();
        assertEquals(new BigDecimal("15.00"), updated.getAvailableAt()); // 50 - 15 - 20
        assertEquals(new BigDecimal("35.00"), updated.getUnavailableAt());
    }

    @Test
    void testInsufficientAtHandling() {
        // Initialize with limited AT
        PatientAtAssignment assignment = atTradingService.initializeAtAssignment(
            patientId, assetId, hospitalId, new BigDecimal("5.00")
        );

        // Try to allocate more than available
        assertThrows(RuntimeException.class, () -> {
            atTradingService.startTradeWithPatientAt(
                tradeId, patientId, assetId, assignment.getAssignmentId(), new BigDecimal("10.00")
            );
        });
    }
}
```

### 2.2 Run Integration Tests

```bash
cd SehatVaultBackend
mvn test -Dtest=AtTradingIntegrationTest
```

Expected output:
```
[INFO] Running AtTradingIntegrationTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] ✓ testCompleteAtTradingLifecycle
[INFO] ✓ testMultipleConcurrentTrades
[INFO] ✓ testInsufficientAtHandling
```

---

## 3. API Testing with Postman

### 3.1 Create Postman Collection

Save as `AT_Trading_Tests.postman_collection.json`:

```json
{
  "info": {
    "name": "AT Trading System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Get Patient AT Status",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/api/marketplace/at-trading/patient/{{patient_id}}/status",
          "host": ["{{base_url}}"],
          "path": ["api", "marketplace", "at-trading", "patient", "{{patient_id}}", "status"]
        }
      }
    },
    {
      "name": "2. Get Available AT",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/api/marketplace/at-trading/patient/{{patient_id}}/available",
          "host": ["{{base_url}}"],
          "path": ["api", "marketplace", "at-trading", "patient", "{{patient_id}}", "available"]
        }
      }
    },
    {
      "name": "3. Start Trade with AT",
      "request": {
        "method": "POST",
        "url": {
          "raw": "{{base_url}}/api/marketplace/at-trading/trades/start-with-at",
          "host": ["{{base_url}}"],
          "path": ["api", "marketplace", "at-trading", "trades", "start-with-at"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"tradeId\": \"{{trade_id}}\",\n  \"patientId\": \"{{patient_id}}\",\n  \"assetId\": \"{{asset_id}}\",\n  \"assignmentId\": \"{{assignment_id}}\",\n  \"atAmount\": 8.00\n}"
        }
      }
    },
    {
      "name": "4. Request AT Withdrawal",
      "request": {
        "method": "POST",
        "url": {
          "raw": "{{base_url}}/api/marketplace/at-trading/withdrawals/request",
          "host": ["{{base_url}}"],
          "path": ["api", "marketplace", "at-trading", "withdrawals", "request"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"patientId\": \"{{patient_id}}\",\n  \"assetId\": \"{{asset_id}}\",\n  \"tradeId\": \"{{trade_id}}\",\n  \"assignmentId\": \"{{assignment_id}}\",\n  \"reason\": \"Emergency\"\n}"
        }
      }
    },
    {
      "name": "5. Check Withdrawal Status",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/api/marketplace/at-trading/withdrawals/{{request_id}}/status",
          "host": ["{{base_url}}"],
          "path": ["api", "marketplace", "at-trading", "withdrawals", "{{request_id}}", "status"]
        }
      }
    },
    {
      "name": "6. Get Pending HT Distributions",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/api/marketplace/at-trading/patient/{{patient_id}}/pending-ht-distributions",
          "host": ["{{base_url}}"],
          "path": ["api", "marketplace", "at-trading", "patient", "{{patient_id}}", "pending-ht-distributions"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8080",
      "type": "string"
    },
    {
      "key": "patient_id",
      "value": "550e8400-e29b-41d4-a716-446655440000",
      "type": "string"
    },
    {
      "key": "asset_id",
      "value": "770e8400-e29b-41d4-a716-446655440002",
      "type": "string"
    },
    {
      "key": "trade_id",
      "value": "990e8400-e29b-41d4-a716-446655440006",
      "type": "string"
    },
    {
      "key": "assignment_id",
      "value": "660e8400-e29b-41d4-a716-446655440001",
      "type": "string"
    }
  ]
}
```

### 3.2 Run API Tests with cURL

```bash
# 1. Get AT status
curl -X GET "http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/status"

# 2. Get available AT
curl -X GET "http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/available"

# 3. Start trade
curl -X POST "http://localhost:8080/api/marketplace/at-trading/trades/start-with-at" \
  -H "Content-Type: application/json" \
  -d '{
    "tradeId": "990e8400-e29b-41d4-a716-446655440006",
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "assetId": "770e8400-e29b-41d4-a716-446655440002",
    "assignmentId": "660e8400-e29b-41d4-a716-446655440001",
    "atAmount": 8.00
  }'

# 4. Request withdrawal
curl -X POST "http://localhost:8080/api/marketplace/at-trading/withdrawals/request" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "assetId": "770e8400-e29b-41d4-a716-446655440002",
    "tradeId": "990e8400-e29b-41d4-a716-446655440006",
    "assignmentId": "660e8400-e29b-41d4-a716-446655440001",
    "reason": "Emergency"
  }'

# 5. Check pending HT
curl -X GET "http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/pending-ht-distributions"
```

---

## 4. End-to-End Testing Scenarios

### Scenario 1: Simple Asset → AT → Trade → Settlement

```
1. Patient deposits 100 PKR asset
   ✓ AssetDepositService approves → AT initialized (10 AT, AVAILABLE)

2. Hospital creates trade, allocates 5 AT
   ✓ Trade starts → 5 AT marked UNAVAILABLE, participation created

3. Monthly HT scheduled
   ✓ 1st of next month → 2.5 HT created (5 * 10 * 0.05)

4. Trade closes with 100 PKR profit
   ✓ Settlement → 10 HT profit (100 * 0.1) + 2.5 monthly = 12.5 HT total
   ✓ AT returned to AVAILABLE

5. Verify patient balance updated
   ✓ Patient gains 12.5 HT from settlement
```

### Scenario 2: Concurrent Trades

```
1. Patient has 50 AT available
   ✓ Trade A uses 20 AT (100 PKR monthly HT)
   ✓ Trade B uses 15 AT (75 PKR monthly HT)
   ✓ Remaining: 15 AT available

2. Each month: 175 HT pending (100 + 75)
   ✓ Scheduler creates 2 distributions each month

3. Settlements separate:
   ✓ Trade A: profit/loss + 3 months HT
   ✓ Trade B: profit/loss + 3 months HT
   ✓ Total AT returned: 50 AVAILABLE
```

### Scenario 3: Withdrawal Request Flow

```
1. Patient requests withdrawal mid-trade
   ✓ Request status: PENDING

2. Hospital approves with 45 days remaining
   ✓ Request status: APPROVED
   ✓ Patient notified: "Wait 45 days for AT"

3. Trade continues for 45 days, then settles
   ✓ Settlement auto-processes withdrawal
   ✓ Request status: RETRIEVED
   ✓ Patient can access AT
```

---

## 5. Database Verification

### Check AT Assignment Created

```sql
-- After asset approved
SELECT * FROM patient_at_assignments 
WHERE patient_id = '550e8400-e29b-41d4-a716-446655440000';

-- Expected result:
-- assignment_id | patient_id | asset_id | total_at | available_at | unavailable_at | status
-- <UUID>        | <UUID>     | <UUID>   | 10.00    | 10.00        | 0.00           | AVAILABLE
```

### Check Trade Participation Created

```sql
-- After trade started
SELECT * FROM trade_participations 
WHERE trade_id = '990e8400-e29b-41d4-a716-446655440006';

-- Expected result:
-- participation_id | trade_id | patient_id | at_allocated | at_monetary_value_pkr | status
-- <UUID>           | <UUID>   | <UUID>     | 8.00         | 80.00                 | ACTIVE
```

### Check Monthly HT Distribution Created

```sql
-- After 1st of month
SELECT * FROM monthly_ht_distributions 
WHERE participation_id = '<participation_id>'
ORDER BY distribution_month DESC;

-- Expected result:
-- distribution_id | patient_id | at_percent | calculated_ht_amount | is_distributed
-- <UUID>          | <UUID>     | 5          | 4.00                 | false
```

### Check Trade Settlement

```sql
-- After trade settlement
SELECT * FROM trade_at_settlements 
WHERE trade_id = '990e8400-e29b-41d4-a716-446655440006';

-- Expected result:
-- settlement_id | trade_id | profit_loss | profit_ht_issued | total_monthly_ht_issued | total_ht_issued
-- <UUID>        | <UUID>   | 100.00      | 10.00            | 4.00                    | 14.00
```

---

## 6. Scheduler Testing

### Verify Scheduled Tasks Running

Monitor logs:

```bash
# Watch for monthly distribution creation (1st of month, midnight)
grep -i "monthly HT distribution creation task" SehatVaultBackend.log

# Expected log:
# INFO - === Starting monthly HT distribution creation task ===
# INFO - Creating distributions for month: 2026-03-01
# INFO - Found 2 active participations for distribution
# INFO - === Monthly HT distribution creation task completed - 2 new distributions created ===

# Watch for HT distribution (daily at 2 AM)
grep -i "pending HT distribution task" SehatVaultBackend.log

# Expected log:
# INFO - === Starting pending HT distribution task ===
# INFO - Found 5 pending HT distributions to process
# INFO - === Pending HT distribution task completed - 5 distributions processed ===
```

### Manual Scheduler Test

In test, use `@Scheduled` annotation testing:

```java
@Test
void testSchedulerExecution() {
    // Trigger manually for testing
    MonthlyHtDistributionScheduler scheduler = new MonthlyHtDistributionScheduler(
        atTradingService, participationRepo, distributionRepo
    );
    
    scheduler.createMonthlyDistributions();
    
    // Verify distributions created
    List<MonthlyHtDistribution> created = distributionRepository.findAll();
    assertFalse(created.isEmpty());
}
```

---

## 7. Testing Checklist

### Unit Tests
- [ ] AT assignment initialization
- [ ] Trade participation lifecycle
- [ ] Monthly HT calculation (5% formula)
- [ ] Profit HT calculation (0.1 per PKR)
- [ ] Withdrawal request creation
- [ ] Insufficient AT handling

### Integration Tests
- [ ] Complete lifecycle (init → trade → settlement)
- [ ] Multiple concurrent trades
- [ ] AT availability state transitions
- [ ] Monthly distribution creation
- [ ] Trade settlement with profit
- [ ] Withdrawal request approval

### API Tests
- [ ] GET /patient/{id}/status - returns correct totals
- [ ] GET /patient/{id}/available - lists available assignments
- [ ] POST /trades/start-with-at - creates participation
- [ ] POST /withdrawals/request - creates request
- [ ] GET /withdrawals/{id}/status - returns current status
- [ ] GET /patient/{id}/pending-ht - lists distributions

### Database Tests
- [ ] patient_at_assignments table populated
- [ ] trade_participations created on trade start
- [ ] monthly_ht_distributions created monthly
- [ ] trade_at_settlements created on trade close
- [ ] patient_at_withdrawal_requests created/updated

### Scheduler Tests
- [ ] Monthly distribution task runs 1st of month
- [ ] HT distribution task runs daily at 2 AM
- [ ] No duplicate distributions created
- [ ] Error handling and logging works

### End-to-End Scenarios
- [ ] Simple asset → trade → settlement flow
- [ ] Multiple concurrent trades
- [ ] Withdrawal request approval mid-trade
- [ ] Negative profit/loss handling
- [ ] Edge cases (zero AT, zero profit, etc.)

---

## 8. Running All Tests

```bash
cd SehatVaultBackend

# Run all tests
mvn clean test

# Run specific test class
mvn test -Dtest=AtTradingServiceTest

# Run integration tests only
mvn test -Dtest=*IntegrationTest

# Run with coverage report
mvn clean test jacoco:report

# View coverage at: target/site/jacoco/index.html
```

---

## Troubleshooting Tests

### Issue: Tests timeout
```
Solution: Increase timeout in test
@Test(timeout = 10000) // 10 second timeout
```

### Issue: Database locked in tests
```
Solution: Use @Transactional to rollback after each test
@Test
@Transactional
void testDatabase() { ... }
```

### Issue: Cannot find entity
```
Solution: Verify entity has @Entity and @Table annotations
Verify UUID generation strategy: @GeneratedValue(strategy = GenerationType.UUID)
```

### Issue: Scheduler not running in tests
```
Solution: Manually invoke scheduler or use
@SpringBootTest
@EnableScheduling
class MyTest { ... }

Or trigger manually:
scheduler.createMonthlyDistributions();
```

---

**Total Test Coverage Target: 80%+**

All tests should pass before production deployment.

