# Smart Contract Integration Guide

**Date:** March 24, 2026  
**Status:** Implementation Ready  
**Framework:** Spring Boot 6.2.16 + Web3j 4.10.0

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Smart Contracts Overview](#smart-contracts-overview)
3. [Integration Points](#integration-points)
4. [Setup & Deployment](#setup--deployment)
5. [Usage Examples](#usage-examples)
6. [Transaction Flow](#transaction-flow)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────┐
│         Spring Boot Backend (Port 8000)              │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │   Service Layer (AssetDepositService, etc.)  │  │
│  │   ↓                                           │  │
│  │   BlockchainService ← Web3j Client           │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                               │
│              Web3j HttpService                      │
└─────────────────────────────────────────────────────┘
                      ↓
         ┌────────────────────────────────┐
         │  Ethereum Network (Local/Live) │
         │                                │
         │  ├─ AssetToken.sol (AT)        │
         │  ├─ HealthToken.sol (HT)       │
         │  └─ HospitalFinancials.sol     │
         └────────────────────────────────┘
```

### Data Flow for AT Minting

```
Patient Submits Asset Deposit
    ↓
Hospital Admin Approves Request
    ↓
Bank Staff Approves Request
    ↓
AssetDepositService.approveRequestByBank()
    ├─ Update PatientTokenBalance (DB)
    ├─ Record MintRecord (DB)
    ├─ Call BlockchainService.mintAssetToken()
    │   └─ Calls AssetToken.mint() on blockchain
    │   └─ Returns transaction hash
    ├─ Update MintRecord with blockchain hash & blockNumber
    └─ Update Transaction record with blockchain details
```

### Data Flow for HT Distribution

```
Trade Completes with Profit
    ↓
ProfitAllocationService.distribute()
    ├─ Calculate profit allocations per patient
    ├─ Create ProfitDistribution record (DB)
    └─ For each patient:
        ├─ Create.ProfitAllocation (DB)
        ├─ Update PatientTokenBalance (DB)
        ├─ Call BlockchainService.mintHealthToken()
        │   └─ Calls HealthToken.mint() on blockchain
        │   └─ Returns transaction hash
        └─ Create Transaction record with blockchain hash

```

---

## Smart Contracts Overview

### 1. AssetToken (AT) - ERC20
**Purpose:** Tokenizes real-world asset deposits  
**Location:** `contracts/contracts/AssetToken.sol`

**Key Functions:**
```solidity
// Admin mints AT tokens to patient wallet
function mint(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE)

// Admin burns AT tokens (during trades)
function burn(address from, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE)

// Store metadata (IPFS hash) for deposit
function setDepositMetadata(uint256 depositId, string calldata metadata)
```

**Usage Example:**
```java
// Mint 100 AT to patient wallet (0.5 ETH asset value = 100/100 tokens)
BlockchainMintRequest request = BlockchainMintRequest.builder()
    .patientAddress("0x1234...") // Patient's wallet address
    .amount(BigInteger.valueOf(100))
    .tokenType("AT")
    .depositId(12345L)
    .build();

BlockchainMintResponse response = blockchainService.mintAssetToken(request);
// response.transactionHash = "0xa1b2c3d4..."
// response.status = "PENDING"
```

### 2. HealthToken (HT) - ERC20
**Purpose:** Distributes profit-sharing rewards to patients  
**Location:** `contracts/contracts/HealthToken.sol`

**Key Functions:**
```solidity
// Admin mints HT tokens to patient wallet
function mint(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE)

// Admin burns HT tokens (for redemptions)
function burn(address from, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE)
```

**Usage Example:**
```java
// Mint 500 HT for profit allocation
BigInteger htAmount = BigInteger.valueOf(500); // 5000 PKR / 10 PKR per HT
String response = blockchainService.mintHealthToken(
    "0x5678...", // Patient wallet
    htAmount,
    "TRADE-2026-03-24-001" // Trade reference
);
// Returns transaction hash
```

### 3. HospitalFinancials - Orchestrator
**Purpose:** Manages AT minting, trade recording, and profit distribution  
**Location:** `contracts/contracts/HospitalFinancials.sol`

**Key Functions:**
```solidity
// Record that AT was minted for asset deposit
function mintAssetToken(
    address patient,
    uint256 depositId,
    uint256 amountAT,
    string calldata metadata
) external onlyRole(DEFAULT_ADMIN_ROLE)

// Record a marketplace trade
function recordTrade(
    uint256 investedAT,
    uint256 profit
) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 tradeId)

// Distribute HT to patients from trade profit
function distributeProfit(
    uint256 tradeId,
    address[] calldata recipients,
    uint256[] calldata amountsHT
) external onlyRole(DEFAULT_ADMIN_ROLE)

// Redeem HT for healthcare services
function redeemHealthToken(
    address patient,
    uint256 amountHT,
    string calldata serviceType
) external onlyRole(DEFAULT_ADMIN_ROLE)
```

---

## Integration Points

### 1. Asset Deposit Approval → AT Minting

**File:** `AssetDepositService.java`
**Method:** `approveRequestByBank(String email, UUID assetId)`

**Current Flow:**
```java
// Calculate AT tokens from asset value
BigDecimal atTokens = assetValue.divide(TOKEN_RATIO, 2, RoundingMode.DOWN);

// Update database
balance.setTotalAt(balance.getTotalAt().add(atTokens));
patientTokenBalanceRepository.save(balance);

// Record minting
recordMint(saved, patient.getId(), bankUser.getUserId(), atTokens);
```

**After Integration:**
```java
// 1. Same database updates as before
balance.setTotalAt(balance.getTotalAt().add(atTokens));
patientTokenBalanceRepository.save(balance);

// 2. NEW: Call blockchain to mint real AT tokens
BlockchainMintRequest blockchainRequest = BlockchainMintRequest.builder()
    .patientAddress(patientUser.getWalletAddress()) // Must be patient's wallet
    .amount(atTokens.toBigInteger())
    .tokenType("AT")
    .depositId(saved.getAssetId().getMostSignificantBits()) // Get deposit ID
    .metadata(saved.getDocumentHash()) // Optional IPFS hash
    .build();

BlockchainMintResponse blockchainResponse = blockchainService.mintAssetToken(blockchainRequest);

// 3. UPDATE MintRecord with blockchain hash
MintRecord mintRecord = recordMint(...);
mintRecord.setTransactionHash(blockchainResponse.getTransactionHash());
mintRecord.setStatus("PENDING"); // Will be updated to CONFIRMED after polling
mintRecordRepository.save(mintRecord);

// 4. Continue with existing flow
hospitalAtPoolService.addToPool(...);
```

**Required Patient Field:**
- `Patient.walletAddress` - Ethereum address of patient (must be added to Patient entity)

### 2. Profit Distribution → HT Minting

**File:** `ProfitAllocationService.java`
**Method:** `distribute(String email, ExecuteProfitAllocationRequest request)`

**Current Flow:**
```java
for (PatientAllocationPreviewDto item : preview.getAllocations()) {
    // Creates transaction with random block number and false hash
    Transaction tx = new Transaction();
    tx.setBlockNumber(Math.abs(new Random().nextLong(9_000_000L)));
    tx.setTransactionHash("ALLOC-" + UUID.randomUUID()); 
    tx.setStatus("SUCCESS");
    walletTransactionRepository.save(tx);
}
```

**After Integration:**
```java
for (PatientAllocationPreviewDto item : preview.getAllocations()) {
    // 1. Calculate HT amount from profit share
    BigDecimal htAmount = item.getHtAmount();
    
    // 2. Call blockchain to mint real HT tokens
    BlockchainMintResponse blockchainResponse = blockchainService.mintHealthToken(
        item.getWalletAddress(), // Patient's wallet
        htAmount.toBigInteger(),
        distribution.getProfitDistributionId().toString() // Distribution reference
    );
    
    // 3. Update patientTokenBalance
    PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(item.getPatientId()).get();
    balance.setTotalHt(balance.getTotalHt().add(htAmount));
    patientTokenBalanceRepository.save(balance);
    
    // 4. Create transaction with REAL blockchain data
    Transaction tx = new Transaction();
    tx.setUserId(item.getUserId());
    tx.setType(Transaction.TransactionType.HT_MINT);
    tx.setAmount(htAmount);
    tx.setReceiverWalletAddress(blockchainResponse.getPatientAddress());
    tx.setTransactionHash(blockchainResponse.getTransactionHash()); // REAL hash
    tx.setStatus("PENDING"); // Will poll for confirmation
    walletTransactionRepository.save(tx);
}
```

### 3. Trade Recording → Blockchain Event

**File:** `MarketplaceService.java`
**Method:** `executeTrade(MarketplaceTradeRequest request)`

**Integration:**
```java
// After trade simulation completes
MarketplaceTrade trade = simulateTrade(hospitalId, poolId, amount);
marketplaceTradeRepository.save(trade);

// NEW: Record trade on blockchain
BlockchainTradeRequest blockchainTradeRequest = BlockchainTradeRequest.builder()
    .investedAT(trade.getInvestedAT().toBigInteger())
    .profitEarned(trade.getProfitEarned().toBigInteger())
    .tradeReference(trade.getTradeId().toString())
    .hospitalId(hospitalId.toString())
    .build();

BlockchainTradeResponse blockchainTradeResponse = blockchainService.recordTrade(blockchainTradeRequest);

// Update trade record with blockchain hash
trade.setBlockchainTxHash(blockchainTradeResponse.getTransactionHash());
trade.setBlockNumber(Long.parseLong(blockchainTradeResponse.getBlockNumber()));
marketplaceTradeRepository.save(trade);
```

---

## Setup & Deployment

### Step 1: Update Patient Entity

Add wallet address field to `Patient.java`:

```java
@Entity
@Table(name = "patients")
public class Patient {
    // ... existing fields ...
    
    @Column(name = "wallet_address", unique = true)
    private String walletAddress;  // Ethereum address
    
    // getters and setters
    public String getWalletAddress() {
        return walletAddress;
    }
    
    public void setWalletAddress(String walletAddress) {
        this.walletAddress = walletAddress;
    }
}
```

**Database Migration:**
```sql
ALTER TABLE patients ADD COLUMN wallet_address VARCHAR(42) UNIQUE;
```

### Step 2: Add Blockchain Reference Fields to Entities

**To MintRecord:**
```java
@Column(name = "transaction_hash")
private String transactionHash;

@Column(name = "block_number")
private Long blockNumber;

@Column(name = "blockchain_status")
private String blockchainStatus; // PENDING, CONFIRMED, FAILED
```

**To Transaction:**
```java
@Column(name = "blockchain_tx_hash")
private String blockchainTxHash;

@Column(name = "blockchain_status")
private String blockchainStatus; // PENDING, CONFIRMED, FAILED

@Column(name = "confirmation_count")
private Integer confirmationCount; // Number of blocks after minting
```

**Database Migrations:**
```sql
ALTER TABLE mint_records ADD COLUMN blockchain_status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE transactions ADD COLUMN blockchain_tx_hash VARCHAR(66);
ALTER TABLE transactions ADD COLUMN blockchain_status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE transactions ADD COLUMN confirmation_count INTEGER DEFAULT 0;
```

### Step 3: Deploy Smart Contracts

**Using Hardhat (from contracts/ directory):**

```bash
# 1. Start local Hardhat network (if using local development)
npx hardhat node

# 2. In another terminal, deploy contracts
npx hardhat run scripts/deploy.ts --network localhost

# 3. Copy deployed contract addresses to application.properties
# Output will show:
# AssetToken deployed to: 0x5FbDB2315678...
# HealthToken deployed to: 0xe7f1725E7734...
# HospitalFinancials deployed to: 0x9fE46736679d...
```

**Update application.properties with deployed addresses:**
```properties
blockchain.contract.asset-token-address=0x5FbDB2315678afccb333f8a9c37f6efc
blockchain.contract.health-token-address=0xe7f1725E7734CE288F8367e1Bb143E90
blockchain.contract.hospital-financials-address=0x9fE46736679d2D9a65F0992F2272dE9f
```

### Step 4: Start Backend

```bash
cd SehatVaultBackend
mvn clean install
mvn spring-boot:run

# Should see initialization logs:
# Web3j connected to: http://127.0.0.1:8545
# BlockchainService initialized
```

---

## Usage Examples

### Example 1: Mint AT When Asset is Approved

```java
@Service
public class AssetDepositService {
    
    private final BlockchainService blockchainService;
    
    @Transactional
    public void approveRequestByBank(String email, UUID assetId) {
        // ... existing validation code ...
        
        // Calculate tokens
        BigDecimal atTokens = assetValue.divide(TOKEN_RATIO);
        
        // Update database
        balance.setTotalAt(balance.getTotalAt().add(atTokens));
        patientTokenBalanceRepository.save(balance);
        
        // NEW: Mint on blockchain
        try {
            BlockchainMintRequest request = BlockchainMintRequest.builder()
                .patientAddress(patientUser.getWalletAddress())
                .amount(new BigDecimal(atTokens).toBigInteger())
                .tokenType("AT")
                .depositId(deposit.getAssetId().getMostSignificantBits())
                .metadata("IPFS-HASH-HERE") // Optional
                .build();
            
            BlockchainMintResponse response = blockchainService.mintAssetToken(request);
            
            // Record the blockchain transaction
            MintRecord record = recordMint(...);
            record.setTransactionHash(response.getTransactionHash());
            record.setStatus("PENDING");
            mintRecordRepository.save(record);
            
            // Log for monitoring
            logger.info("AT mint initiated: txHash={}, deposit={}", 
                response.getTransactionHash(), assetId);
                
        } catch (BlockchainOperationException e) {
            logger.error("Failed to mint AT on blockchain: {}", e.getMessage());
            // Optionally rollback or handle gracefully
            throw e;
        }
        
        // Continue with existing flow
        hospitalAtPoolService.addToPool(...);
    }
}
```

### Example 2: Mint HT During Profit Distribution

```java
@Service
public class ProfitAllocationService {
    
    private final BlockchainService blockchainService;
    
    @Transactional
    public void distribute(String email, ExecuteProfitAllocationRequest request) {
        // ... existing preview calculation ...
        
        for (PatientAllocationPreviewDto allocation : allocations) {
            // 1. Create database records
            PatientTokenBalance balance = getOrCreateTokenBalance(allocation.getPatientId());
            balance.setTotalHt(balance.getTotalHt().add(allocation.getHtAmount()));
            patientTokenBalanceRepository.save(balance);
            
            // 2. Mint on blockchain
            try {
                BlockchainMintResponse response = blockchainService.mintHealthToken(
                    allocation.getWalletAddress(),
                    allocation.getHtAmount().toBigInteger(),
                    distribution.getProfitDistributionId().toString()
                );
                
                // 3. Update transaction with real blockchain data
                Transaction tx = new Transaction();
                tx.setUserId(allocation.getUserId());
                tx.setType(Transaction.TransactionType.HT_MINT);
                tx.setAmount(allocation.getHtAmount());
                tx.setTransactionHash(response.getTransactionHash()); // REAL
                tx.setBlockNumber(response.getBlockNumber());
                tx.setStatus("PENDING");
                walletTransactionRepository.save(tx);
                
            } catch (BlockchainOperationException e) {
                logger.error("Failed to mint HT for patient {}: {}", 
                    allocation.getPatientId(), e.getMessage());
                // Log but continue (can retry later via admin UI)
            }
        }
    }
}
```

---

## Transaction Flow

### Complete AT Minting Flow

```
1. Patient submits asset deposit
   endpoint: POST /api/assetdeposit/submit
   
2. Hospital admin approves
   endpoint: POST /api/assetdeposit/approve
   
3. Bank staff approves
   endpoint: POST /api/assetdeposit/approve-bank  ← TRIGGERS BLOCKCHAIN
   
   a. AssetDepositService.approveRequestByBank()
      - Validates request
      - Calculates AT tokens
      
   b. Database Transaction:
      - INSERT into patient_token_balances (updated AT amount)
      - INSERT into mint_records (PENDING status)
      - UPDATE assetdeposit (status = approved_by_bank)
      
   c. Blockchain Transaction (async):
      - BlockchainService.mintAssetToken()
      - Send transaction to AssetToken.mint()
      - Get transaction hash
      - Poll for confirmation
      
   d. Update Database:
      - UPDATE mint_records (txHash, blockNumber, status = CONFIRMED)
      - INSERT into transactions (blockchain hash)
      
4. Patient can see AT balance in wallet
   endpoint: GET /api/wallet/patient/{userId}/summary
   → Returns: totalAT (from database)
   
5. AT is added to hospital pool for trading
   endpoint: GET /api/marketplace/pools/hospital/{id}/at
```

### Complete HT Distribution Flow

```
1. Trade executes and generates profit
   MarketplaceService.executeTrade()
   
2. Admin initiates profit distribution
   endpoint: POST /api/profitallocation/distribute
   
3. ProfitAllocationService.distribute()
   
   For each eligible patient:
   
   a. Database Transaction:
      - INSERT into profit_allocations (patient, amount, distribution)
      - UPDATE patient_token_balances (add HT amount)
      
   b. Blockchain Transaction (async):
      - BlockchainService.mintHealthToken()
      - Send transaction to HealthToken.mint()
      - Get transaction hash
      - Poll for confirmation
      
   c. Update Database:
      - INSERT into transactions (HT_MINT, real blockchain hash)
      - UPDATE transactions (status = CONFIRMED when confirmed)
      
4. Patient receives notification
   Notification.status = UNREAD
   Text: "HT Minted: You received {amount} HT from profit allocation"
   
5. Patient can see HT balance
   endpoint: GET /api/wallet/patient/{userId}/summary
   → Returns: totalHT (from database)
```

---

## Testing Guide

### Unit Tests

```java
@SpringBootTest
public class BlockchainServiceTest {
    
    @MockBean
    private Web3j web3j;
    
    @MockBean
    private TransactionManager transactionManager;
    
    @Autowired
    private BlockchainService blockchainService;
    
    @Test
    public void testMintAssetToken() {
        // Arrange
        BlockchainMintRequest request = BlockchainMintRequest.builder()
            .patientAddress("0x1234567890123456789012345678901234567890")
            .amount(BigInteger.valueOf(100))
            .tokenType("AT")
            .depositId(1L)
            .build();
        
        // Mock Web3j responses
        when(web3j.ethSendTransaction(any())).thenReturn(mockResponse);
        
        // Act
        BlockchainMintResponse response = blockchainService.mintAssetToken(request);
        
        // Assert
        assertNotNull(response.getTransactionHash());
        assertEquals("PENDING", response.getStatus());
        assertEquals("AT", response.getTokenType());
    }
}
```

### Integration Tests

```bash
# 1. Start Hardhat local network
cd contracts
npx hardhat node

# 2. Note the public key and private key output
# (Default: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)

# 3. Deploy contracts
npx hardhat run scripts/deploy.ts --network localhost

# 4. Update application.properties with contract addresses

# 5. Run Spring Boot tests
cd ../SehatVaultBackend
mvn test -Dtest=BlockchainIntegrationTest

# 6. Monitor blockchain transactions
# Visit: http://localhost:8545 (if using explorer)
# Check: curl http://127.0.0.1:8545 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"web3_clientVersion"}'
```

### Manual Testing via API

```bash
# 1. Submit asset deposit
curl -X POST http://localhost:8000/api/assetdeposit/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "assetType": "Real Estate",
    "assetValue": 5000,
    "assetDescription": "Property in Islamabad",
    "hospitalId": "uuid-123"
  }'

# 2. Approve by hospital admin
curl -X POST http://localhost:8000/api/assetdeposit/approve \
  -H "Authorization: Bearer {ADMIN_JWT}" \
  -d '{"assetId": "uuid-of-asset"}'

# 3. Approve by bank staff (TRIGGERS BLOCKCHAIN)
curl -X POST http://localhost:8000/api/assetdeposit/approve-bank \
  -H "Authorization: Bearer {BANK_JWT}" \
  -d '{"assetId": "uuid-of-asset"}'

# 4. Check blockchain transaction status
# View in Hardhat console or check database:
SELECT * FROM mint_records WHERE asset_id = 'uuid-of-asset';
SELECT * FROM transactions WHERE type = 'AT_MINT';

# 5. Verify patient AT balance
curl http://localhost:8000/api/wallet/patient/{userId}/summary \
  -H "Authorization: Bearer {JWT}"
```

---

## Troubleshooting

### Issue: "BlockchainOperationException: AssetToken address not configured"

**Cause:** Missing contract addresses in application.properties

**Solution:**
1. Deploy contracts: `npx hardhat run scripts/deploy.ts --network localhost`
2. Copy contract addresses to application.properties:
   ```properties
   blockchain.contract.asset-token-address=0x...
   blockchain.contract.health-token-address=0x...
   blockchain.contract.hospital-financials-address=0x...
   ```
3. Restart Spring Boot

### Issue: "Web3j connection refused: http://127.0.0.1:8545"

**Cause:** Blockchain network not running

**Solution:**
```bash
# Start Hardhat local network
cd contracts
npx hardhat node

# Should output:
# Network running on http://127.0.0.1:8545
```

### Issue: "Transaction failed: insufficient gas"

**Cause:** Gas limit too low for contract call

**Solution:**
```properties
# Increase gas limit in application.properties
blockchain.transaction.gas-limit=500000  # Increase from 300000
```

### Issue: "Transaction pending for more than 10 minutes"

**Cause:** 
1. Network is congested
2. Nonce mismatch
3. Low gas price

**Solution:**
```java
// Manually poll for transaction status
long confirmations = blockchainService.getTransactionConfirmations(txHash);
if (confirmations > 0) {
    // Transaction confirmed
    updateDatabaseRecords();
}

// Or manually retry
blockchainService.waitForTransactionConfirmation(txHash, 30)
    .thenAccept(receipt -> handleConfirmedTransaction());
```

### Issue: "Database wallet_address column doesn't exist"

**Cause:** Migration not applied

**Solution:**
```sql
-- Run migration manually
ALTER TABLE patients ADD COLUMN wallet_address VARCHAR(42) UNIQUE;

-- Set wallet addresses for existing patients (from frontend or manual input)
UPDATE patients SET wallet_address = '0x...' WHERE patient_id = '...';
```

---

## Next Steps

### Phase 2: Frontend Integration
- [ ] Add wallet connection (MetaMask, WalletConnect)
- [ ] Display blockchain transaction hashes in UI
- [ ] Show real-time transaction status (PENDING → CONFIRMED)
- [ ] Add blockchain explorer links

### Phase 3: Advanced Features
- [ ] Implement transaction retry logic
- [ ] Add blockchain event listeners
- [ ] Create transaction history dashboard
- [ ] Implement token transfer between patients on-chain
- [ ] Add dividend payments smart contract

### Phase 4: Production Deployment
- [ ] Deploy to Ethereum testnet (Sepolia)
- [ ] Set up Infura/Alchemy RPC endpoint
- [ ] Implement security: environment variables for private keys
- [ ] Enable transaction signing off-chain
- [ ] Set up blockchain monitoring & alerting

---

## References

- **Web3j Documentation:** https://web3j.readthedocs.io/
- **Solidity Docs:** https://docs.soliditylang.org/
- **OpenZeppelin ERC20:** https://docs.openzeppelin.com/contracts/4.x/erc20
- **Hardhat Documentation:** https://hardhat.org/docs
- **Ethereum JSON-RPC:** https://ethereum.org/en/developers/docs/apis/json-rpc/

---

**Last Updated:** March 24, 2026  
**Maintainer:** FYP Development Team
