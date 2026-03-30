# Implementation Checklist & Next Steps

## ✅ Completed Implementation

### Entities Created
- [x] `PatientAtAssignment` - Tracks AT availability (AVAILABLE/UNAVAILABLE)
- [x] `TradeParticipation` - Records patient AT participation in trades
- [x] `MonthlyHtDistribution` - Tracks monthly 5% HT distributions
- [x] `TradeAtSettlement` - Records trade settlement and final HT distribution
- [x] `PatientAtWithdrawalRequest` - Tracks withdrawal requests with remaining time

### Repositories Created
- [x] `PatientAtAssignmentRepository` - 7 custom queries
- [x] `TradeParticipationRepository` - 7 custom queries
- [x] `MonthlyHtDistributionRepository` - 7 custom queries
- [x] `TradeAtSettlementRepository` - 6 custom queries with aggregations
- [x] `PatientAtWithdrawalRequestRepository` - 6 custom queries

### Service Layer
- [x] `AtTradingService` - Comprehensive business logic with 12+ methods
  - AT initialization and status tracking
  - Trade participation management
  - Monthly HT calculation (5% formula)
  - Withdrawal request handling
  - Trade settlement with profit allocation
  - HT issuance calculations

### DTOs Created
- [x] `PatientAtAssignmentDto`
- [x] `TradeParticipationDto`
- [x] `MonthlyHtDistributionDto`
- [x] `TradeAtSettlementDto`
- [x] `PatientAtWithdrawalRequestDto`
- [x] `AtStatusSummaryDto`
- [x] `AtTradingRequestDto` (4 request classes)

### API Controller
- [x] `AtTradingController` - 6 REST endpoints
  - Get AT status
  - Get available AT
  - Start trade with AT
  - Request withdrawal
  - Check withdrawal status
  - Get pending HT distributions

### Documentation
- [x] `AT_TRADING_IMPLEMENTATION.md` - Comprehensive guide
- [x] `AT_TRADING_QUICK_REFERENCE.md` - Quick start guide

---

## 🔄 Integration Steps

### Step 1: Update Existing Services (REQUIRED)

**File**: `marketplace/service/MarketplaceService.java` or `assetdeposit/service/AssetDepositService.java`

Add AT initialization when assets are approved:

```java
@Autowired
private AtTradingService atTradingService;

@Transactional
public void approveAssetDeposit(UUID assetId) {
    AssetDeposit deposit = assetDepositRepository.findById(assetId)
        .orElseThrow(() -> new RuntimeException("Asset not found"));
    
    // Existing approval logic
    deposit.setStatus(DepositStatus.APPROVED);
    deposit.setApprovedAt(LocalDateTime.now());
    assetDepositRepository.save(deposit);
    
    // NEW: Initialize AT assignment
    BigDecimal atAmount = deposit.getAssetValue()
        .divide(new BigDecimal("10"), 2, RoundingMode.HALF_UP);
    
    atTradingService.initializeAtAssignment(
        deposit.getPatientId(),
        assetId,
        deposit.getBankId(),
        atAmount
    );
    
    log.info("AT assignment initialized for asset {}: {} AT", assetId, atAmount);
}
```

### Step 2: Integrate with Trade Execution (REQUIRED)

**File**: `marketplace/service/MarketplaceService.java`

Modify trade execution to use AT from patients:

```java
@Transactional
public void executeTradeWithPatientAt(ExecuteTradeRequest request) {
    MarketplaceTrade trade = marketplaceTradeRepository.findById(request.getTradeId())
        .orElseThrow(() -> new RuntimeException("Trade not found"));
    
    // For each patient allocating AT to this trade
    for (TradeParticipantRequest participant : request.getParticipants()) {
        UUID patientId = participant.getPatientId();
        BigDecimal atAmount = participant.getAtAmount();
        
        // Validate availability
        BigDecimal available = atTradingService.getTotalAvailableAtForPatient(patientId);
        if (available.compareTo(atAmount) < 0) {
            throw new RuntimeException("Patient does not have sufficient available AT");
        }
        
        // Start trade with AT
        TradeParticipation participation = atTradingService.startTradeWithPatientAt(
            trade.getTradeId(),
            patientId,
            participant.getAssetId(),
            participant.getAssignmentId(),
            atAmount
        );
        
        log.info("Trade participation created: {} with {} AT", 
            participation.getParticipationId(), atAmount);
    }
    
    // Execute actual trade
    executionService.executeMarketTrade(trade);
}
```

### Step 3: Add Monthly HT Distribution Task (RECOMMENDED)

Create new file: `marketplace/scheduler/MonthlyHtDistributionScheduler.java`

```java
package com.SehatVault.SehatVaultBackend.marketplace.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class MonthlyHtDistributionScheduler {
    
    @Autowired
    private AtTradingService atTradingService;
    
    @Autowired
    private TradeParticipationRepository participationRepository;
    
    @Autowired
    private MonthlyHtDistributionRepository distributionRepository;
    
    /**
     * Create monthly HT distributions for all active trades
     * Runs on 1st day of each month at midnight
     */
    @Scheduled(cron = "0 0 0 1 * *")
    public void createMonthlyDistributions() {
        log.info("Starting monthly HT distribution creation task");
        
        try {
            LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
            
            // Get all active trade participations
            List<TradeParticipation> activeParticipations = participationRepository.findAll()
                .stream()
                .filter(p -> p.getParticipationStatus() == TradeParticipation.ParticipationStatus.ACTIVE)
                .toList();
            
            for (TradeParticipation participation : activeParticipations) {
                // Check if distribution already exists for this month
                List<MonthlyHtDistribution> existing = distributionRepository
                    .findDistributionsByPatientAndMonth(participation.getPatientId(), currentMonth);
                
                if (existing.isEmpty()) {
                    // Create new distribution
                    atTradingService.createMonthlyHtDistribution(
                        participation.getTradeId(),
                        participation.getParticipationId(),
                        participation.getPatientId(),
                        currentMonth
                    );
                    
                    log.debug("Monthly distribution created for participation {}", 
                        participation.getParticipationId());
                }
            }
            
            log.info("Monthly HT distribution creation task completed");
        } catch (Exception e) {
            log.error("Error in monthly HT distribution creation task", e);
        }
    }
}
```

### Step 4: Add Trade Settlement Logic (REQUIRED)

**File**: `marketplace/service/MarketplaceService.java`

Add settlement when trade closes:

```java
@Transactional
public void closeTradeAndSettle(UUID tradeId, BigDecimal profitLoss) {
    MarketplaceTrade trade = marketplaceTradeRepository.findById(tradeId)
        .orElseThrow(() -> new RuntimeException("Trade not found"));
    
    // Update trade status
    trade.setStatus(MarketplaceTrade.TradeStatus.CLOSED);
    trade.setEndTime(LocalDateTime.now());
    trade.setProfitLoss(profitLoss);
    marketplaceTradeRepository.save(trade);
    
    // NEW: Settle trade and get HT for distribution
    TradeAtSettlement settlement = atTradingService.settleTrade(tradeId, profitLoss);
    
    // Update patient token balances with HT
    updatePatientHtBalances(settlement, profitLoss);
    
    log.info("Trade {} settled with profit/loss: {}", tradeId, profitLoss);
}

private void updatePatientHtBalances(TradeAtSettlement settlement, BigDecimal profitLoss) {
    List<TradeParticipation> participations = tradeParticipationRepository
        .findByTradeId(settlement.getTradeId());
    
    for (TradeParticipation participation : participations) {
        PatientTokenBalance balance = patientTokenBalanceRepository
            .findByPatientId(participation.getPatientId())
            .orElseGet(() -> createNewBalance(participation.getPatientId()));
        
        // Add profit HT and monthly HT
        BigDecimal totalHtToAdd = settlement.getTotalHtIssued();
        balance.setTotalHt(balance.getTotalHt().add(totalHtToAdd));
        patientTokenBalanceRepository.save(balance);
        
        log.info("Patient {} balance updated with {} HT", 
            participation.getPatientId(), totalHtToAdd);
    }
}
```

### Step 5: Enable Scheduling (REQUIRED)

**File**: `SehatVaultBackendApplication.java`

Add annotation to enable scheduled tasks:

```java
@SpringBootApplication
@EnableScheduling  // ADD THIS LINE
public class SehatVaultBackendApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(SehatVaultBackendApplication.class, args);
    }
}
```

### Step 6: Update Project Dependencies (CHECK)

Ensure `pom.xml` has required dependencies:

```xml
<!-- Already in project, but verify -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- For scheduling -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>

<!-- Lombok (should already be there) -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

---

## 🧪 Testing Steps

### Unit Tests
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=AtTradingServiceTest
```

### Integration Tests

Create test file: `src/test/java/com/SehatVault/.../marketplace/AtTradingIntegrationTest.java`

```java
@SpringBootTest
class AtTradingIntegrationTest {
    
    @Autowired
    private AtTradingService atTradingService;
    
    @Autowired
    private PatientAtAssignmentRepository assignmentRepository;
    
    @Test
    void testCompleteAtTradingLifecycle() {
        // 1. Initialize AT assignment
        PatientAtAssignment assignment = atTradingService.initializeAtAssignment(
            UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), 
            new BigDecimal("100")
        );
        assertNotNull(assignment.getAssignmentId());
        assertEquals(new BigDecimal("100"), assignment.getAvailableAt());
        
        // 2. Start trade
        TradeParticipation participation = atTradingService.startTradeWithPatientAt(
            UUID.randomUUID(), assignment.getPatientId(), assignment.getAssetId(),
            assignment.getAssignmentId(), new BigDecimal("50")
        );
        assertNotNull(participation.getParticipationId());
        
        // 3. Verify AT marked unavailable
        PatientAtAssignment updated = assignmentRepository.findById(assignment.getAssignmentId()).get();
        assertEquals(new BigDecimal("50"), updated.getAvailableAt());
        assertEquals(new BigDecimal("50"), updated.getUnavailableAt());
        
        // 4. Create monthly distribution
        MonthlyHtDistribution distribution = atTradingService.createMonthlyHtDistribution(
            participation.getTradeId(), participation.getParticipationId(),
            participation.getPatientId(), LocalDate.now()
        );
        assertEquals(new BigDecimal("25.00"), distribution.getCalculatedHtAmount());
        
        // 5. Settle trade
        TradeAtSettlement settlement = atTradingService.settleTrade(
            participation.getTradeId(), new BigDecimal("500")
        );
        assertNotNull(settlement.getSettlementId());
        
        // 6. Verify AT returned to available
        PatientAtAssignment final = assignmentRepository.findById(assignment.getAssignmentId()).get();
        assertEquals(new BigDecimal("100"), final.getAvailableAt());
    }
}
```

### API Testing

Use Postman or curl:

```bash
# 1. Get patient AT status
curl http://localhost:8080/api/marketplace/at-trading/patient/patient-uuid/status

# 2. Start trade
curl -X POST http://localhost:8080/api/marketplace/at-trading/trades/start-with-at \
  -H "Content-Type: application/json" \
  -d '{"tradeId":"...","patientId":"...","assetId":"...","assignmentId":"...","atAmount":50}'

# 3. Request withdrawal
curl -X POST http://localhost:8080/api/marketplace/at-trading/withdrawals/request \
  -H "Content-Type: application/json" \
  -d '{"patientId":"...","assetId":"...","tradeId":"...","assignmentId":"...","reason":"Emergency"}'

# 4. Check status
curl http://localhost:8080/api/marketplace/at-trading/patient/patient-uuid/status
```

---

## 📋 Verification Checklist

- [ ] All entities compile without errors
- [ ] All repositories created successfully
- [ ] AtTradingService compiles and has all methods
- [ ] AtTradingController created and all endpoints accessible
- [ ] Database tables exist (`patient_at_assignments`, `trade_participations`, etc.)
- [ ] Scheduling annotation added to main Application class
- [ ] Existing services (MarketplaceService, AssetDepositService) updated with AT initialization
- [ ] Trade execution modified to use AT from patients
- [ ] Trade settlement logic integrated
- [ ] Unit tests created and passing
- [ ] Integration tests created and passing
- [ ] API endpoints tested with Postman/curl
- [ ] Monthly HT calculation verified (5% formula)
- [ ] Withdrawal request flow tested end-to-end
- [ ] AT availability status transitions verified

---

## 🚀 Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing (unit + integration)
- [ ] Database migrations prepared
- [ ] Documentation reviewed
- [ ] API documentation updated
- [ ] Team trained on new endpoints
- [ ] Monitoring/logging configured for AT Trading Service
- [ ] Performance tested with realistic data volume
- [ ] Backup/recovery plan documented
- [ ] Rollback plan documented

---

## 📞 Support & Troubleshooting

### Common Issues

**1. Entities not recognized by Spring**
- Ensure `@Entity` annotation is present
- Check package is in `@SpringBootApplication` component scan path
- Run `mvn clean install`

**2. Repositories not found at runtime**
- Verify repositories extend `JpaRepository`
- Check `@Repository` annotation
- Ensure no circular dependencies

**3. Scheduled tasks not running**
- Add `@EnableScheduling` to main application class
- Check cron expression is valid
- Verify method is `public void` with no parameters
- Check application logs for scheduler initialization

**4. AT values incorrect**
- Verify conversion: 1 AT = 10 PKR
- Check HT calculation: 5% of monetary value
- Ensure BigDecimal operations use correct rounding

---

## 📚 Additional Resources

- See `AT_TRADING_IMPLEMENTATION.md` for detailed entity descriptions
- See `AT_TRADING_QUICK_REFERENCE.md` for API usage examples
- Check database schema files for table structures
- Review existing MarketplaceService for context

