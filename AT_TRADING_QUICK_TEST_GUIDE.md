# Quick Start: Testing AT Trading System

## 5-Minute Quick Start

### 1. Run All Tests
```bash
cd SehatVaultBackend
mvn clean test
```

### 2. Run Specific Test Groups
```bash
# Run only AT Trading tests
mvn test -Dtest=AtTradingServiceTest

# Run only integration tests
mvn test -Dtest=AtTradingIntegrationTest
```

### 3. Test One Feature
```bash
# Test AT initialization
mvn test -Dtest=AtTradingServiceTest#testInitializeAtAssignment

# Test trade start
mvn test -Dtest=AtTradingIntegrationTest#testCompleteAtTradingLifecycle
```

---

## Start Server & Test API

### Step 1: Start Spring Boot Server
```bash
cd SehatVaultBackend
mvn spring-boot:run
# Server runs on http://localhost:8080
```

### Step 2: Create Test Data

First, you need a patient with an asset. Use existing endpoints or create test data:

```bash
# Check if patient exists and has AT assignment
curl http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/status
```

### Step 3: Test AT Trading API

```bash
# 1. Get patient status
curl http://localhost:8080/api/marketplace/at-trading/patient/550e8400-e29b-41d4-a716-446655440000/status

# Response should show:
# {
#   "totalAt": 100.00,
#   "availableAt": 100.00,
#   "unavailableAt": 0.00,
#   ...
# }
```

---

## Testing Checklist (Order of Testing)

### Phase 1: Unit Tests (5 min)
```bash
mvn test -Dtest=AtTradingServiceTest
# Tests: initialization, calculations, entity logic
```

### Phase 2: Integration Tests (10 min)
```bash
mvn test -Dtest=AtTradingIntegrationTest
# Tests: complete workflows with real database
```

### Phase 3: API Tests (5 min)
**Start server first, then in another terminal:**
```bash
# Test 1: Get status
curl http://localhost:8080/api/marketplace/at-trading/patient/{patientId}/status

# Should return: totalAt, availableAt, unavailableAt, pendingHT, etc.
```

### Phase 4: Database Verification (5 min)
```sql
-- Check AT assignment
SELECT * FROM patient_at_assignments LIMIT 5;

-- Check trade participation
SELECT * FROM trade_participations LIMIT 5;

-- Check monthly distributions
SELECT * FROM monthly_ht_distributions LIMIT 5;
```

---

## Test Results Expected

### Unit Tests
```
Results: 6 passed
- testInitializeAtAssignment ✓
- testStartTradeWithPatientAt ✓
- testMonthlyHtCalculation ✓
- testRequestAtWithdrawal ✓
- testProfitHtCalculation ✓
- testMonthlyHtNegativeMath ✓
```

### Integration Tests
```
Results: 3 passed
- testCompleteAtTradingLifecycle ✓
- testMultipleConcurrentTrades ✓
- testInsufficientAtHandling ✓
```

### API Tests (Manual)
```
GET /patient/{id}/status
Status: 200 OK
{
  "patientId": "...",
  "totalAt": 100.00,
  "availableAt": 100.00,
  "availabilityStatus": "AVAILABLE"
}

POST /trades/start-with-at
Status: 201 Created
{
  "participationId": "...",
  "atAllocated": 8.00,
  "participationStatus": "ACTIVE"
}
```

---

## Common Issues & Fixes

### Issue: Tests not finding classes
```
Fix: Run: mvn clean compile test
```

### Issue: Database connection error
```
Fix: Ensure database is running and configured in application.properties
```

### Issue: Port 8080 already in use
```
Fix: Change port in application.properties:
server.port=8081
```

### Issue: Scheduler not running in tests
```
Fix: Add @EnableScheduling to test class:
@SpringBootTest
@EnableScheduling
class MyTest { ... }
```

---

## View Test Coverage Report

```bash
mvn clean test jacoco:report
# Open: target/site/jacoco/index.html in browser
```

Expected coverage: **80%+**

---

## What Each Test Validates

| Test | Validates |
|------|-----------|
| initializeAtAssignment | AT created as AVAILABLE when asset approved |
| startTradeWithPatientAt | AT marked UNAVAILABLE, participation created |
| monthlyHtCalculation | 5% formula works (50 PKR → 2.5 HT) |
| requestAtWithdrawal | Withdrawal request created in PENDING state |
| profitHtCalculation | 0.1 HT per PKR profit (100 PKR → 10 HT) |
| testCompleteLifecycle | End-to-end: init→trade→settle→withdraw |
| testConcurrentTrades | Multiple trades tracked separately |
| API endpoints | REST interface returns correct data |

---

## Next Steps After Testing

1. ✅ All unit tests pass
2. ✅ All integration tests pass
3. ✅ API tests successful
4. ✅ Database verified
5. → Ready for deployment!

---

See [AT_TRADING_TESTING_GUIDE.md](AT_TRADING_TESTING_GUIDE.md) for detailed testing procedures.

