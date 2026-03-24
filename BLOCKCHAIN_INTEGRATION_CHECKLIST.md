# Blockchain Integration - Developer Checklist

## Pre-Integration Setup

### Environment Setup (15 minutes)
- [ ] **Hardhat Node Running**
  ```bash
  cd contracts
  npx hardhat node
  # Output should show: "Network running on http://127.0.0.1:8545"
  ```

- [ ] **Contracts Deployed**
  ```bash
  # In separate terminal
  cd contracts
  npx hardhat run scripts/deploy.ts --network localhost
  # Copy contract addresses from output
  ```

- [ ] **Contract Addresses Updated in application.properties**
  ```properties
  blockchain.contract.asset-token-address=0x...
  blockchain.contract.health-token-address=0x...
  blockchain.contract.hospital-financials-address=0x...
  ```

- [ ] **Backend Dependencies Updated**
  ```bash
  cd SehatVaultBackend
  mvn clean install
  ```

---

## Database Migrations (10 minutes)

### Patient Entity Enhancement
- [ ] **Add Column: wallet_address**
  ```sql
  ALTER TABLE patients ADD COLUMN wallet_address VARCHAR(42) UNIQUE;
  ```

- [ ] **Update Patient.java**
  ```java
  @Column(name = "wallet_address", unique = true)
  private String walletAddress;
  ```

### MintRecord Blockchain Tracking
- [ ] **Add Column: blockchain_status**
  ```sql
  ALTER TABLE mint_records ADD COLUMN blockchain_status VARCHAR(20) DEFAULT 'PENDING';
  ```

- [ ] **Update MintRecord.java**
  ```java
  @Column(name = "blockchain_status")
  private String blockchainStatus;
  ```

### Transaction Blockchain Tracking
- [ ] **Add Columns: blockchain_tx_hash, blockchain_status, confirmation_count**
  ```sql
  ALTER TABLE transactions ADD COLUMN blockchain_tx_hash VARCHAR(66);
  ALTER TABLE transactions ADD COLUMN blockchain_status VARCHAR(20) DEFAULT 'PENDING';
  ALTER TABLE transactions ADD COLUMN confirmation_count INTEGER DEFAULT 0;
  ```

- [ ] **Update Transaction.java**
  ```java
  @Column(name = "blockchain_tx_hash")
  private String blockchainTxHash;
  
  @Column(name = "blockchain_status")
  private String blockchainStatus;
  
  @Column(name = "confirmation_count")
  private Integer confirmationCount;
  ```

---

## Service Integration

### 1. AssetDepositService Integration

- [ ] **Inject BlockchainService**
  ```java
  @Service
  @RequiredArgsConstructor
  public class AssetDepositService {
      private final BlockchainService blockchainService;
      // ... rest of class
  }
  ```

- [ ] **Update approveRequestByBank() method**
  - [ ] Add blockchain minting call after balance update
  - [ ] Handle BlockchainOperationException
  - [ ] Update MintRecord with transactionHash
  - [ ] Log blockchain transaction details

- [ ] **Code Reference**
  ```java
  // After updating PatientTokenBalance in approveRequestByBank()
  try {
      BlockchainMintRequest request = BlockchainMintRequest.builder()
          .patientAddress(patientUser.getWalletAddress())
          .amount(atTokens.toBigInteger())
          .tokenType("AT")
          .depositId(saved.getAssetId().getMostSignificantBits())
          .build();
      
      BlockchainMintResponse response = blockchainService.mintAssetToken(request);
      
      MintRecord record = recordMint(saved, patient.getId(), bankUser.getUserId(), atTokens);
      record.setTransactionHash(response.getTransactionHash());
      record.setBlockchainStatus("PENDING");
      mintRecordRepository.save(record);
      
  } catch (BlockchainOperationException e) {
      logger.error("Blockchain minting failed: {}", e.getMessage());
      throw e;  // Or handle gracefully based on requirements
  }
  ```

### 2. ProfitAllocationService Integration

- [ ] **Inject BlockchainService**
  ```java
  @Service
  @RequiredArgsConstructor
  public class ProfitAllocationService {
      private final BlockchainService blockchainService;
      // ... rest of class
  }
  ```

- [ ] **Update distribute() method**
  - [ ] Add blockchain HT minting in the patient loop
  - [ ] Use real transaction hashes instead of random UUIDs
  - [ ] Handle BlockchainOperationException per patient (don't fail entire distribution)
  - [ ] Update Transaction status to PENDING (instead of SUCCESS)

- [ ] **Code Reference**
  ```java
  // Replace the existing transaction creation loop
  for (PatientAllocationPreviewDto item : preview.getAllocations()) {
      // Update balance
      PatientTokenBalance balance = patientTokenBalanceRepository
          .findByPatientId(item.getPatientId()).get();
      balance.setTotalHt(nz(balance.getTotalHt()).add(nz(item.getHtAmount())));
      patientTokenBalanceRepository.save(balance);
      
      // Create transaction with REAL blockchain data
      try {
          BlockchainMintResponse blockchainResponse = blockchainService.mintHealthToken(
              item.getWalletAddress(),
              item.getHtAmount().toBigInteger(),
              distribution.getProfitDistributionId().toString()
          );
          
          Transaction tx = new Transaction();
          tx.setUserId(item.getUserId());
          tx.setTokenId(htTokenId);
          tx.setType(Transaction.TransactionType.HT_MINT);
          tx.setAmount(nz(item.getHtAmount()));
          tx.setReceiverWalletAddress(blockchainResponse.getPatientAddress());
          tx.setTransactionHash(blockchainResponse.getTransactionHash()); // REAL
          tx.setBlockchainStatus("PENDING");
          tx.setStatus("PENDING");  // Change from SUCCESS to PENDING
          tx.setTimestamp(LocalDateTime.now());
          walletTransactionRepository.save(tx);
          
      } catch (BlockchainOperationException e) {
          logger.error("HT mint failed for patient {}: {}", item.getPatientId(), e.getMessage());
          // Continue with next patient instead of failing entire distribution
      }
  }
  ```

### 3. MarketplaceService Integration (Optional)

- [ ] **Inject BlockchainService**
  ```java
  private final BlockchainService blockchainService;
  ```

- [ ] **Update executeTrade() method**
  - [ ] After trade simulation, call blockchainService.recordTrade()
  - [ ] Update MarketplaceTrade with blockchain hash
  - [ ] Handle errors gracefully

- [ ] **Code Reference**
  ```java
  // After trade completes in executeTrade()
  try {
      BlockchainTradeRequest tradeRequest = BlockchainTradeRequest.builder()
          .investedAT(trade.getInvestedAT().toBigInteger())
          .profitEarned(trade.getProfitEarned().toBigInteger())
          .tradeReference(trade.getTradeId().toString())
          .hospitalId(hospitalId.toString())
          .build();
      
      BlockchainTradeResponse tradeResponse = blockchainService.recordTrade(tradeRequest);
      
      trade.setBlockchainTxHash(tradeResponse.getTransactionHash());
      marketplaceTradeRepository.save(trade);
      
  } catch (BlockchainOperationException e) {
      logger.error("Trade recording on blockchain failed: {}", e.getMessage());
      // Trade is still valid locally, log blockchain failure for monitoring
  }
  ```

---

## Compilation & Testing

### Build
- [ ] **Clean Build**
  ```bash
  cd SehatVaultBackend
  mvn clean install
  ```
  Expected: ✅ BUILD SUCCESS
  (Should see no errors related to blockchain imports)

### Run
- [ ] **Start Spring Boot**
  ```bash
  mvn spring-boot:run
  ```

- [ ] **Check Logs for**
  ```
  ✓ Web3j initialized
  ✓ BlockchainService created
  ✓ TransactionManager configured
  ✓ Application started on port 8000
  ```

### Unit Tests
- [ ] **Run Blockchain Service Tests**
  ```bash
  mvn test -Dtest=BlockchainServiceTest
  ```

### Integration Tests
- [ ] **Test Asset Deposit Flow**
  ```bash
  # 1. Create patient account
  # 2. Submit asset deposit
  # 3. Approve by hospital admin
  # 4. Approve by bank staff (TRIGGERS BLOCKCHAIN)
  # 5. Check transaction status in database
  #    SELECT * FROM mint_records WHERE status like '%blockchain%';
  # 6. Verify patient wallet received AT tokens
  ```

---

## Verification Steps

### 1. Verify BlockchainService Instantiation
```bash
# In logs, should see:
# org.springframework.context.annotation.ConfigurationClassPostProcessor : Registering bean definition for class com.SehatVault.SehatVaultBackend.blockchain.service.BlockchainService
```

### 2. Verify Web3j Connection
```bash
# Execute test endpoint (add temporary for testing):
curl -X GET http://localhost:8000/api/blockchain/status

# Should return:
# {
#   "connected": true,
#   "networkUrl": "http://127.0.0.1:8545",
#   "currentBlock": 15246,
#   "chainId": 31337
# }
```

### 3. Verify Contract Addresses Loaded
```bash
# Check application logs for:
# BlockchainService: AssetToken contract address validated
# BlockchainService: HealthToken contract address validated
# BlockchainService: HospitalFinancials contract address validated
```

### 4. Test AT Minting Flow
```bash
# 1. POST /api/assetdeposit/submit
# 2. POST /api/assetdeposit/approve (as admin)
# 3. POST /api/assetdeposit/approve-bank (as bank staff)
# 4. Check response includes "blockchainStatus": "PENDING"
# 5. Query database after ~10 seconds
#    SELECT transactionHash, blockchainStatus FROM mint_records LIMIT 1;
# 6. Expected: Real blockchain hash, status = CONFIRMED
```

### 5. Test HT Distribution Flow
```bash
# 1. Ensure trade(s) exist with profit
# 2. POST /api/profitallocation/distribute with requested profit
# 3. Check response for distribution ID
# 4. Wait ~10 seconds for blockchain confirmation
# 5. Query database
#    SELECT transactionHash, blockchainStatus FROM transactions 
#    WHERE type = 'HT_MINT' LIMIT 1;
# 6. Expected: Real blockchain hash, status = CONFIRMED
```

### 6. Verify Transaction Signatures
```bash
# Check if transaction hashes are valid Ethereum format:
# - Starts with "0x"
# - 66 characters total (0x + 64 hex chars)
# Example: 0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6
```

---

## Troubleshooting

### Build Errors

**Error: "Cannot find class Web3j"**
- [ ] Run `mvn clean install` again
- [ ] Check pom.xml has Web3j dependencies
- [ ] Verify Maven cached repository: `mvn clean install -U`

**Error: "BlockchainServiceTest not found"**
- [ ] Run `mvn test` (no specific test needed for first run)
- [ ] Check all source files compiled properly

### Runtime Errors

**Error: "BlockchainOperationException: AssetToken address not configured"**
- [ ] Verify contract addresses in application.properties
- [ ] Contract addresses must start with "0x"
- [ ] Check for typos in hex addresses

**Error: "Web3j connection refused: http://127.0.0.1:8545"**
- [ ] Ensure Hardhat network is running: `npx hardhat node`
- [ ] Verify port 8545 is not already in use
- [ ] Check blockchain.network.url in application.properties

**Error: "Transaction failed: insufficient gas"**
- [ ] Increase blockchain.transaction.gas-limit in application.properties
- [ ] Try: `blockchain.transaction.gas-limit=500000`

**Error: "Database wallet_address column doesn't exist"**
- [ ] Run SQL migration manually
- [ ] Verify Patient entity has @Column annotation
- [ ] Restart Spring Boot to reload entity mapping

### Logic Errors

**Issue: Patient not receiving blockchain transaction**
- [ ] Check patientUser.getWalletAddress() returns valid Ethereum address
- [ ] Verify wallet address starts with "0x" and is 42 characters
- [ ] Check patient record was saved before calling blockchain service

**Issue: Status stays "PENDING" forever**
- [ ] Check blockchain network is still running
- [ ] Verify transaction was mined (use Hardhat console)
- [ ] Increase confirmation polling attempts in BlockchainService

**Issue: Random transaction hashes instead of real ones**
- [ ] Verify blockchainService.mintAssetToken() is being called
- [ ] Check @Transactional boundaries are correct
- [ ] Verify BlockchainService bean is injected (not null)

---

## Performance Monitoring

### Database Queries to Monitor

```sql
-- Check pending blockchain transactions
SELECT 
  COUNT(*) as pending_count,
  AVG(EXTRACT(EPOCH FROM (NOW() - timestamp))) as avg_wait_seconds
FROM mint_records 
WHERE blockchain_status = 'PENDING';

-- Check failed blockchain transactions
SELECT mint_id, asset_id, transaction_hash, timestamp
FROM mint_records 
WHERE blockchain_status = 'FAILED'
ORDER BY timestamp DESC LIMIT 10;

-- Check confirmation progress
SELECT 
  blockchain_status,
  COUNT(*) as count,
  AVG(confirmation_count) as avg_confirmations
FROM [transactions]
WHERE type IN ('AT_MINT', 'HT_MINT')
GROUP BY blockchain_status;
```

### Application Metrics

Add logging to track:
- [ ] Average blockchain transaction time
- [ ] Success rate of minting operations
- [ ] Average blocks to confirmation
- [ ] Gas usage per transaction

---

## Rollback Plan (If Issues Found)

### Quick Rollback (Keep Database, Disable Blockchain)
```java
// In BlockchainService, temporarily disable calls:
public BlockchainMintResponse mintAssetToken(BlockchainMintRequest request) {
    // TEMPORARY: Return dummy response without hitting blockchain
    return BlockchainMintResponse.builder()
        .status("DISABLED")
        .transactionHash("0x0000000000000000000000000000000000000000000000000000000000000000")
        .build();
}

// Or comment out blockchain calls in services:
// blockchainService.mintAssetToken(request);  // Commented out
```

### Database Cleanup (If Bad Data Inserted)
```sql
-- Remove failed blockchain records
DELETE FROM mint_records WHERE blockchain_status = 'FAILED';

-- Remove pending transactions
DELETE FROM transactions WHERE blockchain_status = 'PENDING' 
AND type IN ('AT_MINT', 'HT_MINT')
AND timestamp < NOW() - INTERVAL '1 hour';

-- Reset patient balances (if needed)
-- Be careful with this operation
UPDATE patient_token_balances 
SET total_ht = total_ht - <amount>
WHERE patient_id = '<patient_id>';
```

---

## Completion Checklist

- [ ] All code changes implemented
- [ ] Database migrations executed
- [ ] Maven build successful (0 errors)
- [ ] Spring Boot starts without errors
- [ ] Blockchain network running
- [ ] Smart contracts deployed
- [ ] AT minting tested end-to-end
- [ ] HT distribution tested end-to-end
- [ ] Real transaction hashes showing in database
- [ ] Confirmations polling working
- [ ] Error handling verified
- [ ] Logs show proper blockchain operations
- [ ] Team reviewed integration code
- [ ] Documentation updated

---

**Estimated Total Time: 2-3 hours for complete integration**

For questions or issues, refer to:
- BLOCKCHAIN_INTEGRATION_GUIDE.md (Detailed technical guide)
- BLOCKCHAIN_INTEGRATION_SUMMARY.md (Architecture & design decisions)

---

**Last Updated:** March 24, 2026  
**Status:** Implementation Ready
