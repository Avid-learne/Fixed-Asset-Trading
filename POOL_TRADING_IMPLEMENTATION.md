# Pool Separation & Trading System Implementation

## Overview

The AT pool system has been separated into two distinct pools with different trading triggers:
1. **Subscription Pool (SUBSCRIPTION)** - Auto-trades when all subscriptions for the current month are paid
2. **Asset Pool (ASSET)** - Manual trading triggered by hospital admin

## Architecture Changes

### 1. HospitalAtPoolEntry Entity Enhanced

**New Field:**
```java
@Enumerated(EnumType.STRING)
@Column(name = "pool_type", nullable = false)
private PoolType poolType = PoolType.ASSET;

public enum PoolType {
    SUBSCRIPTION,  // Traded when all subscriptions for current month are paid
    ASSET          // Traded when admin manually triggers trade
}
```

**Database Migration Required:**
```sql
ALTER TABLE hospital_at_pool_entries 
ADD COLUMN pool_type VARCHAR(50) DEFAULT 'ASSET' NOT NULL;

CREATE INDEX idx_hospital_pool_type ON hospital_at_pool_entries(hospital_id, pool_type);
```

### 2. HospitalAtPoolService Enhanced

**New Methods:**

```java
// Add AT to specific pool type
void addToPool(UUID hospitalId, UUID patientId, UUID assetId, 
               BigDecimal mintedAt, HospitalAtPoolEntry.PoolType poolType)

// Get total AT available by pool type
BigDecimal getTotalAvailableAtByType(UUID hospitalId, 
                                      HospitalAtPoolEntry.PoolType poolType)

// Get active pool entries filtered by type
List<HospitalAtPoolEntry> getActivePoolEntriesByType(UUID hospitalId, 
                                                       HospitalAtPoolEntry.PoolType poolType)
```

### 3. Separate Trading Flows

#### Subscription Pool Trading (Automatic)

**Trigger:** When all patient subscriptions for current month are PAID

**Process:**
1. Hospital admin initiates month-end finalization
2. System checks: Are all patient subscriptions marked as PAID for this month?
3. If YES:
   - Query SUBSCRIPTION pool entries for hospital
   - Execute trading on subscription pool AT
   - Mark subscriptions as closed/settled for month
   - Transfer resulting PKR to hospital account
4. If NO:
   - Throw error showing unpaid subscriptions
   - Admin must collect remaining payments first

**Status Check Query:**
```java
// In SubscriptionService or similar
public boolean allSubscriptionsForMonthPaid(UUID hospitalId, YearMonth month) {
    return patientSubscriptionRepository
        .findByHospitalIdAndMonth(hospitalId, month)
        .stream()
        .allMatch(sub -> sub.getStatus() == PaymentStatus.PAID);
}
```

**Database Check:**
```sql
SELECT COUNT(*) as unpaid_count 
FROM patient_subscriptions ps
JOIN patients p ON p.id = ps.patient_id
WHERE p.hospital_id = ?
  AND EXTRACT(YEAR_MONTH FROM ps.start_date) = YEAR_MONTH(NOW())
  AND ps.payment_status != 'PAID';
```

#### Asset Pool Trading (Manual)

**Trigger:** Hospital admin manually initiates trade

**Process:**
1. Admin navigates to Asset Pool Trading page
2. Selects amount of AT to trade from asset pool
3. System shows preview:
   - Asset pool AT available
   - Simulated closing price
   - Expected PKR return
4. Admin confirms
5. Trade executes on asset pool AT only
6. Resulting PKR transferred to hospital account

**Example Controller Endpoint:**
```java
@PostMapping("/api/marketplace/trade/asset-pool")
public ResponseEntity<ApiResponse<TradeExecutionResult>> tradeAssetPool(
    @RequestParam UUID hospitalId,
    @RequestBody TradeAssetPoolRequest request
) {
    // Only asset pool AT involved
    BigDecimal availableAt = hospitalAtPoolService
        .getTotalAvailableAtByType(hospitalId, PoolType.ASSET);
    
    if (request.getAmount().compareTo(availableAt) > 0) {
        throw new IllegalArgumentException("Insufficient asset pool AT");
    }
    
    // Execute trade with ASSET pool only
    return marketplaceService.executeAssetPoolTrade(hospitalId, request);
}
```

## Implementation Status

### ✅ Completed

1. **HospitalAtPoolEntry Entity**
   - Added `poolType` field with SUBSCRIPTION/ASSET enum
   - Defaults to ASSET for backward compatibility
   - Updated PrePersist method

2. **HospitalAtPoolService**
   - Added overloaded `addToPool()` methods with pool type parameter
   - Added `getTotalAvailableAtByType()` method
   - Added `getActivePoolEntriesByType()` method
   - Original methods still work for backward compatibility

3. **HT Transfer Notification** ✅
   - Recipients now receive notification when HT is transferred to them
   - Notification format: "HT Transfer Received::You received {amount} HT from patient {senderId}"
   - Stored in notifications table with UNREAD status

### ⏳ TODO (Administrator Tasks)

1. **Create Market Endpoints**
   - Endpoint for trading subscription pool (auto-trigger when all subscriptions paid)
   - Endpoint for manual asset pool trading
   - Endpoint to check subscription payment status for hospital

2. **Add Payment Status Tracking**
   - Update PaymentHistory or PatientSubscription to track PAID/UNPAID status
   - Create status update logic when full subscription payment received

3. **Implement Month-End Finalization**
   - Create scheduled job or manual endpoint for month-end
   - Check all subscriptions are PAID
   - Execute subscription pool trade
   - Reset month tracking

4. **Update Admin Dashboard**
   - Show separate subscription pool balance
   - Show separate asset pool balance
   - Show subscription payment status by patient
   - Provide buttons: "Auto-Trade Subscriptions" (disabled until all paid), "Manual Trade Assets"

5. **Add Audit Logging**
   - Log which pool was used for each trade
   - Log reason for trade (auto-subscription or manual-asset)
   - Track pool rebalancing

## Usage Examples

### Example 1: Adding AT to Subscription Pool

```java
// When subscription payment received
hospitalAtPoolService.addToPool(
    hospitalId,
    patientId,
    assetId,
    new BigDecimal("50"),        // AT amount
    HospitalAtPoolEntry.PoolType.SUBSCRIPTION
);
```

### Example 2: Checking Subscription Pool Balance

```java
// For hospital admin dashboard
BigDecimal subscriptionPoolAT = hospitalAtPoolService
    .getTotalAvailableAtByType(hospitalId, 
                                HospitalAtPoolEntry.PoolType.SUBSCRIPTION);

BigDecimal assetPoolAT = hospitalAtPoolService
    .getTotalAvailableAtByType(hospitalId, 
                                HospitalAtPoolEntry.PoolType.ASSET);

// Display on dashboard
// Subscription Pool: {subscriptionPoolAT} AT
// Asset Pool: {assetPoolAT} AT
```

### Example 3: Trading Asset Pool (Manual)

```java
// Admin manually triggers asset pool trade
List<HospitalAtPoolEntry> assetPoolEntries = hospitalAtPoolService
    .getActivePoolEntriesByType(hospitalId, 
                                 HospitalAtPoolEntry.PoolType.ASSET);

// Calculate total
BigDecimal totalAssetPoolAT = assetPoolEntries.stream()
    .map(HospitalAtPoolEntry::getAvailableAt)
    .reduce(BigDecimal.ZERO, BigDecimal::add);

// Execute trade (simplified)
MarketplaceTrade.TradeType tradeType = MarketplaceTrade.TradeType.SELL;
// ... execute trade using assetPoolEntries
```

### Example 4: Auto-Trading Subscription Pool

```java
// Month-end finalization
public void finalizeMonthlySubscriptions(UUID hospitalId) {
    // Step 1: Check all subscriptions paid
    boolean allPaid = subscriptionService.allSubscriptionsForMonthPaid(hospitalId);
    
    if (!allPaid) {
        throw new BusinessException("Cannot trade: Not all subscriptions paid");
    }
    
    // Step 2: Get subscription pool AT
    BigDecimal subscriptionPoolAT = hospitalAtPoolService
        .getTotalAvailableAtByType(hospitalId, 
                                    HospitalAtPoolEntry.PoolType.SUBSCRIPTION);
    
    if (subscriptionPoolAT.compareTo(BigDecimal.ZERO) <= 0) {
        log.info("No AT in subscription pool to trade");
        return;
    }
    
    // Step 3: Execute trade
    // List<HospitalAtPoolEntry> subscriptionEntries = 
    //     hospitalAtPoolService.getActivePoolEntriesByType(hospitalId, 
    //                                                        PoolType.SUBSCRIPTION);
    // marketplaceService.executeSubscriptionPoolTrade(hospitalId, subscriptionEntries);
    
    // Step 4: Mark subscriptions as closed
    subscriptionService.markMonthlySubscriptionsAsClosed(hospitalId);
}
```

## Database Schema Update

```sql
-- Add pool_type column (if using existing table)
ALTER TABLE hospital_at_pool_entries 
ADD COLUMN pool_type VARCHAR(50) DEFAULT 'ASSET' NOT NULL;

-- Update existing market trades to set pool type if needed
UPDATE hospital_at_pool_entries 
SET pool_type = 'ASSET' 
WHERE pool_type IS NULL;

-- Add indexes for performance
CREATE INDEX idx_hospital_pooltype_active 
ON hospital_at_pool_entries(hospital_id, pool_type, is_active);
```

## Notification System

### HT Transfer Notifications

When a patient transfers HT to another patient, the recipient automatically receives a notification:

**Notification Entity:**
- Sender: Transferred-from patient
- Receiver: Recipient patient
- Text: "HT Transfer Received::You received {amount} HT from patient {senderId}"
- Status: UNREAD
- Timestamp: Current time

**Frontend Display:**
```typescript
// Recipient sees in notification center
"You received 50 HT from patient abc123def..."

// Notification object
{
  notiId: "uuid",
  title: "HT Transfer Received",
  body: "You received 50 HT from patient abc123def...",
  timestamp: "2026-03-24T16:53:45",
  status: "UNREAD"
}
```

**API Endpoints (Activity Service):**
- `GET /api/activity/notifications` - List all notifications
- `PUT /api/activity/notifications/{notificationId}/read` - Mark as read
- `PUT /api/activity/notifications/read-all` - Mark all as read

## Migration Path

### For Existing Pools

```sql
-- All existing AT pool entries are ASSET by default
-- When you implement subscription pool feature:
-- 1. First, set pool_type = 'SUBSCRIPTION' for subscriptionrelated entries
-- 2. Then implement month-end trading logic

UPDATE hospital_at_pool_entries 
SET pool_type = 'SUBSCRIPTION'
WHERE asset_id IN (
    SELECT subscription_id FROM patient_subscriptions 
    WHERE payment_status = 'PAID'
);

-- Remaining entries stay as ASSET
UPDATE hospital_at_pool_entries 
SET pool_type = 'ASSET'
WHERE pool_type IS NULL;
```

## Testing Checklist

- [ ] HT transfer sends notification to recipient
- [ ] Subscription pool AT can be tracked separately from asset pool
- [ ] getTotalAvailableAtByType returns correct amounts for each pool type
- [ ] getActivePoolEntriesByType filters correctly
- [ ] Backward compatibility: existing addToPool() calls default to ASSET type
- [ ] Database migration executes without errors
- [ ] Admin dashboard can display subscription vs asset pool separately
- [ ] Month-end finalization checks all subscriptions before trading
- [ ] Asset pool manual trade works independently

## Files Modified

1. ✅ `SehatVaultBackend/src/main/java/.../wallet/service/WalletService.java`
   - Added NotificationRepository import and injection
   - Added notification sending on HT transfer

2. ✅ `SehatVaultBackend/src/main/java/.../marketplace/entity/HospitalAtPoolEntry.java`
   - Added PoolType enum
   - Added poolType field with SUBSCRIPTION/ASSET values
   - Updated PrePersist to initialize poolType

3. ✅ `SehatVaultBackend/src/main/java/.../marketplace/service/HospitalAtPoolService.java`
   - Added overloaded addToPool() with PoolType parameter
   - Added getTotalAvailableAtByType() method
   - Added getActivePoolEntriesByType() method

## Next Steps

1. **Run Database Migration:**
   ```bash
   # Add pool_type column to hospital_at_pool_entries table
   # Default to ASSET for existing records
   ```

2. **Create Subscription Trading Endpoint:**
   - Check PaymentHistory for month
   - Verify all subscriptions PAID
   - Execute subscription pool trade
   - Update subscription status

3. **Create Asset Trading Endpoint:**
   - Manual trigger by admin
   - Only affects ASSET pool entries
   - No subscription status checks

4. **Update Admin Dashboard:**
   - Display separate pool balances
   - Show subscription payment status
   - Provide trading buttons

5. **Add Tests:**
   - Unit tests for pool type filtering
   - Integration tests for separate trading flows
   - Notification reception tests

---

**Implementation Date:** March 24, 2026  
**Status:** Pool Separation Complete, Notifications Active  
**Next Phase:** Month-End Finalization & Dashboard Integration  
