# AT Trading - Quick Reference & Integration Guide

## Quick API Usage Examples

### 1. Get Patient AT Status
```bash
curl -X GET http://localhost:8080/api/marketplace/at-trading/patient/{patientId}/status
```

**Use Case**: Dashboard to show patient their AT holdings, whether they're in trades, pending HT

### 2. Start a Trade with Patient's AT
```bash
curl -X POST http://localhost:8080/api/marketplace/at-trading/trades/start-with-at \
  -H "Content-Type: application/json" \
  -d '{
    "tradeId": "550e8400-e29b-41d4-a716-446655440000",
    "patientId": "patient-uuid",
    "assetId": "asset-uuid",
    "assignmentId": "assignment-uuid",
    "atAmount": 50
  }'
```

**Use Case**: Hospital initiates trade with patient's AT. Called when hospital staff creates a trade order.

### 3. Request AT Withdrawal (Mid-Trade)
```bash
curl -X POST http://localhost:8080/api/marketplace/at-trading/withdrawals/request \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-uuid",
    "assetId": "asset-uuid",
    "tradeId": "trade-uuid",
    "assignmentId": "assignment-uuid",
    "reason": "Emergency financial need"
  }'
```

**Use Case**: Patient portal - allow patient to request their AT back if in emergency

**Response**:
```json
{
  "requestId": "request-uuid",
  "requestStatus": "PENDING",
  "reason": "Emergency financial need",
  "requestedAt": "2024-01-15T10:30:00Z"
}
```

### 4. Get Withdrawal Request Status
```bash
curl -X GET http://localhost:8080/api/marketplace/at-trading/withdrawals/{requestId}/status
```

**Use Case**: Patient portal - check status of their withdrawal request, see if approved and remaining time

**Response**:
```json
{
  "requestId": "request-uuid",
  "requestStatus": "APPROVED",
  "tradeRemainingTimeDays": 15,
  "hospitalNotes": "Request approved. Trade ends in 15 days. AT will be returned then.",
  "notifiedAt": "2024-01-15T11:00:00Z"
}
```

### 5. Get Pending HT Distributions
```bash
curl -X GET http://localhost:8080/api/marketplace/at-trading/patient/{patientId}/pending-ht-distributions
```

**Use Case**: Dashboard - show patient how much HT is pending distribution

**Response**:
```json
[
  {
    "distributionId": "dist-1",
    "distributionMonth": "2024-01",
    "calculatedHtAmount": 40,
    "isDistributed": false,
    "participation": {...}
  },
  {
    "distributionId": "dist-2",
    "distributionMonth": "2024-02",
    "calculatedHtAmount": 40,
    "isDistributed": false
  }
]
```

### 6. Get Active Trades
```bash
curl -X GET http://localhost:8080/api/marketplace/at-trading/patient/{patientId}/active-trades
```

**Use Case**: Dashboard - show patient's AT currently in active trades with details

---

## Integration with Existing Modules

### Integration with Asset Deposit Module

When asset is approved and AT is minted:

```java
// In AssetDepositService (existing)
public void approveAssetDeposit(UUID assetId) {
    AssetDeposit deposit = getAssetDeposit(assetId);
    
    // Existing approval logic
    ...
    
    // NEW: Initialize AT assignment
    atTradingService.initializeAtAssignment(
        deposit.getPatientId(),
        assetId,
        deposit.getBankId(),  // or hospital ID
        calculateAtAmount(deposit.getAssetValue())
    );
}

// Helper method
private BigDecimal calculateAtAmount(BigDecimal assetValue) {
    // 1 AT = 10 PKR, so 100 PKR = 10 AT
    return assetValue.divide(new BigDecimal("10"), 2, RoundingMode.HALF_UP);
}
```

### Integration with Marketplace/Trade Module

When hospital creates and executes a trade:

```java
// In MarketplaceService (existing)
public void executeTradeWithPatientAt(UUID tradeId, List<UUID> patientIds, List<BigDecimal> atAmounts) {
    MarketplaceTrade trade = getTradeById(tradeId);
    
    // For Each participating patient
    for (int i = 0; i < patientIds.size(); i++) {
        UUID patientId = patientIds.get(i);
        BigDecimal atAmount = atAmounts.get(i);
        
        // Get patient's available AT
        PatientAtAssignment assignment = atTradingService
            .getAvailableAtForPatient(patientId)
            .get(0); // or select specific asset
        
        // NEW: Start trade with AT
        TradeParticipation participation = atTradingService.startTradeWithPatientAt(
            tradeId,
            patientId,
            assignment.getAssetId(),
            assignment.getAssignmentId(),
            atAmount
        );
        
        // Existing trade execution logic
        executeTrade(trade);
    }
}
```

### Integration with Wallet/Token Module

When distributing HT:

```java
// In WalletService or PatientTokenBalanceService (existing)
@Scheduled(cron = "0 0 0 1 * *")  // Monthly
public void processMonthlyHtDistribution() {
    // Get pending distributions from AT Trading Service
    List<UUID> allPatients = getAllPatients();
    
    for (UUID patientId : allPatients) {
        List<MonthlyHtDistribution> pending = atTradingService
            .getPendingMonthlyHtDistributions(patientId);
        
        for (MonthlyHtDistribution dist : pending) {
            // Mint HT tokens to patient
            PatientTokenBalance balance = patientTokenBalanceRepository
                .findByPatientId(patientId)
                .orElseGet(() -> createNewBalance(patientId));
            
            balance.setTotalHt(balance.getTotalHt().add(dist.getCalculatedHtAmount()));
            patientTokenBalanceRepository.save(balance);
            
            // Mark as distributed in AT Trading
            atTradingService.distributeMonthlyHt(dist.getDistributionId());
            
            // Record blockchain transaction if applicable
            blockchainService.recordHtMint(patientId, dist.getCalculatedHtAmount());
        }
    }
}
```

### Integration with Trade Settlement

When trade ends:

```java
// In MarketplaceService or TradeClosureService
public void closeTrade(UUID tradeId, BigDecimal profitLoss) {
    MarketplaceTrade trade = getTradeById(tradeId);
    
    // Existing trade closure logic
    trade.setStatus(TradeStatus.CLOSED);
    trade.setEndTime(LocalDateTime.now());
    trade.setProfitLoss(profitLoss);
    save(trade);
    
    // NEW: Settle trade and distribute HT
    TradeAtSettlement settlement = atTradingService.settleTrade(tradeId, profitLoss);
    
    // Update wallet balances for settled profit HT
    List<TradeParticipation> participations = getTradeParticipations(tradeId);
    for (TradeParticipation participation : participations) {
        PatientTokenBalance balance = patientTokenBalanceRepository
            .findByPatientId(participation.getPatientId())
            .orElseGet(() -> createNewBalance(participation.getPatientId()));
        
        // Add profit HT
        balance.setTotalHt(balance.getTotalHt().add(settlement.getProfitHtIssued()));
        patientTokenBalanceRepository.save(balance);
        
        // Record blockchain transaction
        blockchainService.recordHtMint(
            participation.getPatientId(), 
            settlement.getProfitHtIssued()
        );
    }
}
```

---

## Database Initialization

Add these to your database migration scripts:

```sql
-- Create repositories for new entities if using JPA/Hibernate
-- Entities are auto-created with @Entity annotation

-- Sample data: Create assignment when asset is approved
INSERT INTO patient_at_assignments (
    assignment_id, patient_id, asset_id, hospital_id,
    total_at_assigned, available_at, unavailable_at,
    availability_status, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'patient-id', 'asset-id', 'hospital-id',
    100, 100, 0, 'AVAILABLE', NOW(), NOW()
);
```

---

## Frontend Integration (Next.js)

### Patient Dashboard Component

```typescript
// pages/dashboard/at-status.tsx
import useSWR from 'swr';

export default function AtStatusPage() {
  const { data: status, error } = useSWR(
    `/api/marketplace/at-trading/patient/${userId}/status`
  );

  if (!status) return <Loading />;

  return (
    <div>
      <div className="card">
        <h2>Your Asset Tokens (AT)</h2>
        <p>Available: {status.totalAvailableAt} AT</p>
        <p>In Active Trades: {status.totalUnavailableAt} AT</p>
        <p>Total: {status.totalAt} AT</p>
      </div>

      <div className="card">
        <h2>Pending HT Distributions</h2>
        <p>{status.pendingMonthlyHtAmount} HT pending</p>
        <p>Active Trades: {status.activeTradeCount}</p>
      </div>

      {status.activeWithdrawalRequests.length > 0 && (
        <div className="card warning">
          <h3>Withdrawal Requests</h3>
          {status.activeWithdrawalRequests.map((req) => (
            <div key={req.requestId}>
              <p>{req.requestStatus}</p>
              {req.tradeRemainingTimeDays && (
                <p>Trade ends in {req.tradeRemainingTimeDays} days</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Request Withdrawal Component

```typescript
// components/WithdrawalRequestForm.tsx
export default function WithdrawalRequestForm({ patientId }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/marketplace/at-trading/withdrawals/request', {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          assetId,
          tradeId,
          assignmentId,
          reason
        })
      });
      
      const data = await response.json();
      showNotification(`Request submitted. Request ID: ${data.requestId}`);
      // Redirect to status page
    } catch (error) {
      showError('Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRequest}>
      <textarea 
        placeholder="Reason for withdrawal"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Request Withdrawal'}
      </button>
    </form>
  );
}
```

---

## Testing

### Unit Tests Example

```java
@SpringBootTest
class AtTradingServiceTest {
    
    @Autowired
    private AtTradingService atTradingService;
    
    @Test
    void testInitializeAtAssignment() {
        // Arrange
        UUID patientId = UUID.randomUUID();
        UUID assetId = UUID.randomUUID();
        BigDecimal atAmount = new BigDecimal("100");
        
        // Act
        PatientAtAssignment result = atTradingService.initializeAtAssignment(
            patientId, assetId, hospitalId, atAmount
        );
        
        // Assert
        assertEquals(atAmount, result.getAvailableAt());
        assertEquals(BigDecimal.ZERO, result.getUnavailableAt());
        assertEquals(AvailabilityStatus.AVAILABLE, result.getAvailabilityStatus());
    }
    
    @Test
    void testStartTradeWithAt() {
        // Arrange: Setup assignment
        PatientAtAssignment assignment = createTestAssignment(100);
        
        // Act: Start trade
        TradeParticipation participation = atTradingService.startTradeWithPatientAt(
            tradeId, patientId, assetId, assignmentId, new BigDecimal("50")
        );
        
        // Assert: Check AT is now unavailable
        PatientAtAssignment updated = repository.findById(assignmentId).get();
        assertEquals(new BigDecimal("50"), updated.getAvailableAt());
        assertEquals(new BigDecimal("50"), updated.getUnavailableAt());
    }
    
    @Test
    void testMonthlyHtCalculation() {
        // Arrange: Setup participation
        TradeParticipation participation = createTestParticipation(
            new BigDecimal("100"),  // 100 AT
            new BigDecimal("1000")  // 1000 PKR value
        );
        
        // Act: Create monthly distribution
        MonthlyHtDistribution dist = atTradingService.createMonthlyHtDistribution(
            tradeId, participationId, patientId, LocalDate.now()
        );
        
        // Assert: Check 5% calculation
        // 1000 * 0.05 = 50 HT
        assertEquals(new BigDecimal("50.00"), dist.getCalculatedHtAmount());
    }
}
```

---

## Troubleshooting

### Issue: "Insufficient available AT"
**Cause**: Patient's available AT is less than requested amount  
**Solution**: Check `GET /patient/{patientId}/available` to see available AT

### Issue: "Patient already has a pending withdrawal request"
**Cause**: Patient has multiple withdrawal requests for same asset/trade  
**Solution**: Check and cancel existing request first

### Issue: HT not distributed
**Cause**: Scheduled task not running or `isDistributed` not marked  
**Solution**: Ensure `@Scheduled` annotation is on task and `@EnableScheduling` on app

---

## Performance Considerations

- **Indexes**: Add indexes on:
  - `patient_at_assignments.patient_id`
  - `patient_at_assignments.availability_status`
  - `trade_participations.patient_id`
  - `trade_participations.trade_id`
  - `monthly_ht_distributions.patient_id`

- **Caching**: Consider caching patient AT status (expires every 5 minutes)

- **Pagination**: For list endpoints with many records, add pagination

