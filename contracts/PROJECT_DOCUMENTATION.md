# 🏥 HOSPITAL BLOCKCHAIN PROJECT - COMPLETE DOCUMENTATION

---

## 📁 PROJECT STRUCTURE

```
d:\contracts\
├── contracts/               # Smart contract source code (Solidity)
│   ├── AssetToken.sol      # Token for real assets
│   ├── HealthToken.sol     # Token for healthcare benefits
│   ├── HospitalFinancials.sol  # Main hospital logic
│   └── Counter.sol         # Test contract
│
├── test/                   # Test files
│   └── Counter.ts          # TypeScript test for Counter
│
├── scripts/               # Deployment scripts
│   ├── deploy-simple.ts   # Main deployment script
│   └── deploy.ts          # Alternative deployment script
│
├── artifacts/             # Compiled contracts (auto-generated)
├── cache/                 # Build cache (auto-generated)
├── typechain-types/       # TypeScript types for contracts (auto-generated)
├── node_modules/          # Dependencies
│
├── hardhat.config.ts      # Hardhat configuration
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
└── .gitignore            # Git ignore rules
```

---

## 📜 SMART CONTRACTS EXPLAINED

### 1️⃣ **AssetToken.sol** (AT Token)

**Purpose:** Represents real-world assets deposited by patients (property, gold, etc.)

**Token Details:**
- Name: "Asset Token"
- Symbol: "AT"
- Type: ERC20 (fungible token)

**Functions:**

#### `constructor(address admin)`
- **What it does:** Creates the token contract and sets up the admin
- **Parameters:** 
  - `admin`: Address that gets admin permissions
- **Called when:** Contract is deployed
- **Example:** When you deploy, it sets you as admin

#### `mint(address to, uint256 amount)`
- **What it does:** Creates new AT tokens
- **Who can call:** Only addresses with MINTER_ROLE
- **Parameters:**
  - `to`: Address receiving the tokens
  - `amount`: Number of tokens to create
- **Use case:** Patient deposits $10,000 asset → Hospital mints 10,000 AT tokens to patient

#### `burn(address from, uint256 amount)`
- **What it does:** Destroys AT tokens
- **Who can call:** Only MINTER_ROLE
- **Parameters:**
  - `from`: Address to burn tokens from
  - `amount`: Number of tokens to destroy
- **Use case:** Patient withdraws asset → Hospital burns their AT tokens

#### `setDepositMetadata(uint256 depositId, string metadata)`
- **What it does:** Stores reference info about a deposit (like IPFS hash with property details)
- **Who can call:** Only admin
- **Parameters:**
  - `depositId`: Unique ID for the deposit
  - `metadata`: Information reference (URL, IPFS hash, etc.)
- **Use case:** Store link to property documents

**State Variables:**
- `MINTER_ROLE`: Permission identifier for minting/burning
- `depositMetadata`: Maps deposit IDs to their metadata

---

### 2️⃣ **HealthToken.sol** (HT Token)

**Purpose:** Healthcare benefit tokens given to patients from hospital profits

**Token Details:**
- Name: "Health Token"
- Symbol: "HT"
- Type: ERC20 (fungible token)

**Functions:**

#### `constructor(address admin)`
- **What it does:** Creates the HT token contract
- **Parameters:** 
  - `admin`: Address that gets admin permissions
- **Called when:** Contract is deployed

#### `mint(address to, uint256 amount)`
- **What it does:** Creates new HT tokens
- **Who can call:** Only MINTER_ROLE
- **Parameters:**
  - `to`: Address receiving tokens
  - `amount`: Number of tokens to create
- **Use case:** Hospital made profit → Distribute HT to patients

#### `burn(address from, uint256 amount)`
- **What it does:** Destroys HT tokens
- **Who can call:** Only MINTER_ROLE
- **Parameters:**
  - `from`: Address to burn from
  - `amount`: Number of tokens to destroy
- **Use case:** Patient uses 1000 HT for medical checkup → Hospital burns 1000 HT

**Simpler than AssetToken:** Just handles minting and burning of benefit tokens.

---

### 3️⃣ **HospitalFinancials.sol** (Main Logic)

**Purpose:** Central controller managing the entire system - asset deposits, trading, profit distribution, and benefit redemption

**Roles:**
- `DEFAULT_ADMIN_ROLE`: Full control
- `BANK_ROLE`: Can process asset deposits
- `FINANCE_ROLE`: Can record trades and distribute profits

**Functions:**

#### `constructor(address _assetToken, address _healthToken, address admin, address _hospitalWallet)`
- **What it does:** Sets up the hospital financial system
- **Parameters:**
  - `_assetToken`: Address of deployed AssetToken contract
  - `_healthToken`: Address of deployed HealthToken contract
  - `admin`: Admin address
  - `_hospitalWallet`: Hospital's payment wallet
- **Called when:** Contract is deployed

#### `mintAssetToken(address patient, uint256 depositId, uint256 amountAT, string metadata)`
- **What it does:** Process patient's asset deposit and mint AT tokens
- **Who can call:** Only BANK_ROLE
- **Parameters:**
  - `patient`: Patient's wallet address
  - `depositId`: Unique deposit identifier
  - `amountAT`: Amount of AT tokens to mint
  - `metadata`: Reference to deposit details
- **Flow:**
  1. Checks deposit not already processed
  2. Records deposit details
  3. Mints AT tokens to patient
  4. Stores metadata
  5. Emits event
- **Example:** 
  ```
  Patient deposits property worth $50,000
  → Call mintAssetToken(patientAddress, 12345, 50000, "ipfs://...")
  → Patient receives 50,000 AT tokens
  ```

#### `recordTrade(uint256 investedAT, uint256 profit)`
- **What it does:** Records a trading activity and its profit
- **Who can call:** Only FINANCE_ROLE
- **Parameters:**
  - `investedAT`: Amount of AT tokens used for investment
  - `profit`: Profit earned from the trade
- **Returns:** Trade ID
- **Flow:**
  1. Creates new trade record
  2. Assigns unique trade ID
  3. Stores investment and profit amounts
  4. Records timestamp
  5. Emits event
- **Example:**
  ```
  Hospital invested 10,000 AT equivalent → Made $2,000 profit
  → Call recordTrade(10000, 2000)
  → Returns tradeId = 1
  ```

#### `distributeProfit(uint256 tradeId, address[] recipients, uint256[] amountsHT)`
- **What it does:** Distributes profit as HT tokens to patients
- **Who can call:** Only FINANCE_ROLE
- **Parameters:**
  - `tradeId`: ID of the trade generating profits
  - `recipients`: Array of patient addresses
  - `amountsHT`: Array of HT amounts for each patient
- **Flow:**
  1. Verifies trade exists
  2. Checks arrays match in length
  3. Mints HT tokens to each recipient
  4. Tracks total distributed
  5. Emits event
- **Example:**
  ```
  Trade #1 made $2,000 profit
  → Distribute to 3 patients
  → Call distributeProfit(1, [alice, bob, charlie], [500, 800, 700])
  → Alice gets 500 HT, Bob gets 800 HT, Charlie gets 700 HT
  ```

#### `redeemHealthToken(address patient, uint256 amountHT, string serviceType)`
- **What it does:** Patient uses HT tokens for healthcare services
- **Who can call:** Only FINANCE_ROLE
- **Parameters:**
  - `patient`: Patient's address
  - `amountHT`: Amount of HT to redeem
  - `serviceType`: Description of service (e.g., "Dental Checkup")
- **Flow:**
  1. Validates amount
  2. Burns patient's HT tokens
  3. Records service type
  4. Emits event
- **Example:**
  ```
  Patient wants medical checkup worth 1,000 HT
  → Call redeemHealthToken(patientAddress, 1000, "Medical Checkup")
  → Burns 1,000 HT from patient
  → Patient receives checkup
  ```

**State Variables:**
- `assetToken`: Reference to AssetToken contract
- `healthToken`: Reference to HealthToken contract
- `hospitalWallet`: Hospital's payment address
- `depositProcessed`: Tracks processed deposits (prevents double-processing)
- `depositOwner`: Maps deposit IDs to patient addresses
- `depositAmountAT`: Maps deposit IDs to AT amounts
- `trades`: Stores all trade records
- `nextTradeId`: Counter for trade IDs

**Events (for tracking):**
- `AssetTokenMinted`: Fired when AT tokens are created
- `TradeRecorded`: Fired when trade is recorded
- `ProfitDistributed`: Fired when profits are distributed
- `HealthTokenRedeemed`: Fired when HT is used

---

### 4️⃣ **Counter.sol** (Test Contract)

**Purpose:** Simple test contract to verify deployment and testing works

**Functions:**

#### `inc()`
- **What it does:** Increases counter by 1
- **Emits:** `Increment(1)` event

#### `incBy(uint by)`
- **What it does:** Increases counter by specified amount
- **Parameters:** `by`: Amount to increment
- **Requirement:** `by` must be > 0
- **Emits:** `Increment(by)` event

**State Variables:**
- `x`: The counter value (public, anyone can read)

---

## 🔄 COMPLETE SYSTEM FLOW

### **Step 1: Patient Deposits Asset**
```
Patient owns property worth $100,000
↓
Hospital bank verifies asset
↓
Call: mintAssetToken(patientAddr, 1001, 100000, "ipfs://property-docs")
↓
Result: Patient receives 100,000 AT tokens
```

### **Step 2: Hospital Invests**
```
Hospital uses deposited assets for investments/trading
↓
Investment succeeds, makes $5,000 profit
↓
Call: recordTrade(100000, 5000)
↓
Result: Trade #1 recorded with $5,000 profit
```

### **Step 3: Profit Distribution**
```
Hospital decides to distribute profit to patients
↓
Call: distributeProfit(1, [patient1, patient2], [2500, 2500])
↓
Result: Each patient receives 2,500 HT tokens
```

### **Step 4: Patient Uses Benefits**
```
Patient needs dental checkup (costs 1,000 HT)
↓
Call: redeemHealthToken(patientAddr, 1000, "Dental Checkup")
↓
Result: 1,000 HT burned, patient gets checkup for free
```

---

## 🚀 HOW TO RUN EVERYTHING

### **Initial Setup (One Time)**

```powershell
# 1. Navigate to project
cd d:\contracts

# 2. Install dependencies
npm install

# 3. Compile contracts
npx hardhat compile
```

---

### **Option 1: Quick Deploy (Non-Persistent)**

**Use for:** Quick tests, running tests

```powershell
# Deploy contracts (temporary network)
npx hardhat run scripts/deploy-simple.ts

# Run tests
npx hardhat test
```

**What happens:**
- Network starts automatically
- Contracts deploy
- Script finishes
- Network destroyed
- Everything resets

---

### **Option 2: Persistent Local Blockchain**

**Use for:** Development, frontend testing, interactive use

**Terminal 1 - Start Blockchain:**
```powershell
cd d:\contracts
npx hardhat node
```
**Keep this running!** It's your local Ethereum blockchain.

**Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts (20 test accounts, each with 10,000 ETH)
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

**Terminal 2 - Deploy Contracts:**
```powershell
cd d:\contracts
npx hardhat run scripts/deploy-simple.ts --network localhost
```

**Output:**
```
📝 Deploying AssetToken...
✅ AssetToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

📝 Deploying HealthToken...
✅ HealthToken deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

📝 Deploying HospitalFinancials...
✅ HospitalFinancials deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

🔐 Granting MINTER_ROLE permissions...
✅ Granted MINTER_ROLE on AssetToken to HospitalFinancials
✅ Granted MINTER_ROLE on HealthToken to HospitalFinancials

📝 Deploying Counter...
✅ Counter deployed to: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707

🎉 All contracts deployed successfully!
```

**What Terminal 1 shows (Blockchain logs):**
```
eth_sendTransaction
  Contract deployment: AssetToken
  Contract address:    0x5fbdb2315678afecb367f032d93f642f64180aa3
  Transaction:         0xa1c8d1f89a234b111e15c9659c9c2c9858720a50f62cd5625b7cadb0d2f40a3e
  From:                0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  Value:               0 ETH
  Gas used:            961446 of 30000000
  Block #1:            0x45c0f85871b990c15ea41c6ff725f5c6151c81f1e448569c5d9e99871ea26653
```

This shows **every transaction** happening on your blockchain in real-time.

---

## 📊 UNDERSTANDING THE OUTPUT

### **Contract Addresses**
```
AssetToken: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```
- **What it is:** The "location" of your contract on the blockchain
- **Use it to:** Interact with the contract from frontend/scripts
- **Changes:** Every time you redeploy (gets a new address)

### **Account Address**
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```
- **What it is:** Your "wallet" on the blockchain
- **Public:** Anyone can see it
- **Use it to:** Receive funds, deploy contracts, make transactions

### **Private Key**
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
- **What it is:** Your "password" to control the account
- **SECRET:** Never share (on real networks)
- **Use it to:** Sign transactions, prove ownership
- **Note:** These test keys are public - only for local development!

### **Transaction Hash**
```
Transaction: 0xa1c8d1f89a234b111e15c9659c9c2c9858720a50f62cd5625b7cadb0d2f40a3e
```
- **What it is:** Unique ID for a transaction
- **Use it to:** Track transaction status, view details

### **Block Number**
```
Block #1
```
- **What it is:** Sequential number of blocks on the blockchain
- **Use it to:** Track when transactions happened

### **Gas Used**
```
Gas used: 961446 of 30000000
```
- **What it is:** "Fee" paid for computation (in gas units)
- **Costs ETH:** More complex operations = more gas
- **Your balance:** Decreases as you deploy/transact

---

## 🔑 KEY CONCEPTS

### **Blockchain (Terminal 1)**
- Like a database that never stops running
- Records all transactions permanently
- Each transaction creates a new block
- Blocks are numbered sequentially (1, 2, 3...)

### **Deployment (Terminal 2)**
- Uploads your contract code to the blockchain
- Assigns it a unique address
- Costs gas (ETH)
- Creates new instance each time you deploy

### **Persistent vs Non-Persistent**

**Non-Persistent (Option 1):**
```
Start Network → Deploy → Script Ends → Network Dies → All Data Lost
```

**Persistent (Option 2):**
```
Start Network (Terminal 1 - keeps running)
↓
Deploy (Terminal 2)
↓
Contracts stay alive
↓
Can interact anytime
↓
Stop network (Ctrl+C) → Data lost
```

---

## 🔄 HOW CONTRACTS WORK - REAL-WORLD EXAMPLE

Let me explain how all contracts work together with a simple story:

### **📖 The Complete Patient Journey**

---

### **🏁 STAGE 1: SYSTEM SETUP (Deployment)**

**What Happens:**
Hospital administrator sets up the blockchain system for the first time.

**Functions Called:**
1. Deploy `AssetToken` contract → Creates the AT token system
2. Deploy `HealthToken` contract → Creates the HT token system  
3. Deploy `HospitalFinancials` contract → Creates the main control system
4. Grant permissions → HospitalFinancials gets MINTER_ROLE on both tokens

**Real-World Equivalent:**
Setting up a new banking system with account types and giving the bank manager access.

**Who Does This:** System Administrator (one time only)

---

### **🏦 STAGE 2: PATIENT DEPOSITS ASSET**

**Real-World Scenario:**
John owns a house worth $100,000. He wants to deposit it with the hospital to get healthcare benefits.

**What Happens:**
1. John brings property documents to hospital
2. Bank verifies the property value
3. Bank officer logs into system
4. Bank calls the smart contract

**Function Called:**
```solidity
HospitalFinancials.mintAssetToken(
  patient: John's wallet address (0x123...),
  depositId: 1001,
  amountAT: 100000,
  metadata: "ipfs://property-deed-hash"
)
```

**Behind The Scenes:**
1. `HospitalFinancials` checks if deposit 1001 was already processed → ❌ Not processed
2. Records John as owner of deposit 1001
3. Stores amount: 100,000 AT
4. Calls `AssetToken.mint(John, 100000)` → Creates 100,000 AT tokens
5. Calls `AssetToken.setDepositMetadata(1001, "ipfs://...")` → Stores property info
6. Emits `AssetTokenMinted` event → Blockchain logs this action

**Result:**
- ✅ John receives 100,000 AT tokens in his wallet
- ✅ Hospital has record of John's $100,000 property deposit
- ✅ Property documents stored on IPFS (permanent storage)

**Who Can Call This:** Only users with BANK_ROLE

---

### **💼 STAGE 3: HOSPITAL INVESTS ASSETS**

**Real-World Scenario:**
Hospital uses the deposited properties as collateral to invest in stocks/trading and makes profit.

**What Happens:**
1. Hospital invests equivalent of 100,000 AT tokens
2. Investment succeeds → Made $5,000 profit
3. Finance officer records this in blockchain

**Function Called:**
```solidity
HospitalFinancials.recordTrade(
  investedAT: 100000,
  profit: 5000
)
```

**Behind The Scenes:**
1. Creates new trade record with ID = 1
2. Stores investment amount: 100,000 AT
3. Stores profit: $5,000
4. Records timestamp (when trade happened)
5. Increments trade counter
6. Emits `TradeRecorded` event

**Result:**
- ✅ Trade #1 recorded on blockchain
- ✅ Profit of $5,000 tracked
- ✅ Ready to distribute benefits to patients

**Who Can Call This:** Only users with FINANCE_ROLE

---

### **🎁 STAGE 4: PROFIT DISTRIBUTION**

**Real-World Scenario:**
Hospital made $5,000 profit and wants to distribute it to patients as healthcare benefit tokens.

**What Happens:**
1. Finance team calculates each patient's share
2. John gets 2,500 HT, Sarah gets 1,500 HT, Mike gets 1,000 HT
3. Finance officer distributes benefits

**Function Called:**
```solidity
HospitalFinancials.distributeProfit(
  tradeId: 1,
  recipients: [John's address, Sarah's address, Mike's address],
  amountsHT: [2500, 1500, 1000]
)
```

**Behind The Scenes:**
1. Checks if Trade #1 exists → ✅ Yes
2. Validates arrays match (3 recipients, 3 amounts) → ✅ Match
3. Loop through each recipient:
   - Calls `HealthToken.mint(John, 2500)` → Creates 2,500 HT for John
   - Calls `HealthToken.mint(Sarah, 1500)` → Creates 1,500 HT for Sarah
   - Calls `HealthToken.mint(Mike, 1000)` → Creates 1,000 HT for Mike
4. Tracks total distributed: 5,000 HT
5. Emits `ProfitDistributed` event

**Result:**
- ✅ John has 2,500 HT tokens (worth $2,500 in healthcare benefits)
- ✅ Sarah has 1,500 HT tokens (worth $1,500 in healthcare benefits)
- ✅ Mike has 1,000 HT tokens (worth $1,000 in healthcare benefits)
- ✅ All patients can now use these for healthcare services

**Who Can Call This:** Only users with FINANCE_ROLE

---

### **🏥 STAGE 5: PATIENT USES BENEFITS**

**Real-World Scenario:**
John needs a dental checkup. It costs $500, but he can use his HT tokens instead of paying cash.

**What Happens:**
1. John goes to hospital for dental checkup
2. Hospital reception checks John's HT balance → He has 2,500 HT
3. Dental checkup costs 500 HT
4. Reception processes the redemption

**Function Called:**
```solidity
HospitalFinancials.redeemHealthToken(
  patient: John's address,
  amountHT: 500,
  serviceType: "Dental Checkup"
)
```

**Behind The Scenes:**
1. Checks amount is valid (500 > 0) → ✅ Valid
2. Checks John has 500 HT in wallet → ✅ He has 2,500 HT
3. Calls `HealthToken.burn(John, 500)` → Destroys 500 HT from John's wallet
4. Records service type: "Dental Checkup"
5. Emits `HealthTokenRedeemed` event

**Result:**
- ✅ John receives dental checkup (worth $500)
- ✅ John's HT balance reduces: 2,500 → 2,000 HT
- ✅ Hospital tracks benefit usage
- ❌ John didn't pay any cash!

**Who Can Call This:** Only users with FINANCE_ROLE (hospital reception)

---

### **🔄 COMPLETE CYCLE VISUALIZATION**

```
1. DEPOSIT
   Patient deposits $100,000 property
   → mintAssetToken() called
   → Patient receives 100,000 AT tokens
   
2. INVEST
   Hospital invests using properties
   → Makes $5,000 profit
   → recordTrade() called
   
3. DISTRIBUTE
   Hospital shares profit with patients
   → distributeProfit() called
   → Patients receive HT tokens (benefit credits)
   
4. REDEEM
   Patient uses HT for healthcare
   → redeemHealthToken() called
   → HT tokens burned, service provided
   
5. REPEAT
   Hospital continues investing
   → More profits → More benefits for patients
```

---

### **🎯 WHICH FUNCTION TO CALL WHEN?**

| **Situation** | **Function to Call** | **Who Can Call** |
|---------------|---------------------|------------------|
| Patient brings property to deposit | `mintAssetToken()` | Bank officer (BANK_ROLE) |
| Hospital completes a trade | `recordTrade()` | Finance team (FINANCE_ROLE) |
| Hospital wants to share profits | `distributeProfit()` | Finance team (FINANCE_ROLE) |
| Patient wants to use benefits | `redeemHealthToken()` | Reception (FINANCE_ROLE) |
| Admin needs to store asset info | `setDepositMetadata()` | Admin (DEFAULT_ADMIN_ROLE) |

---

### **💡 KEY POINTS IN SIMPLE LANGUAGE**

1. **AT Tokens = Your Deposited Asset Value**
   - You deposit $100K property → Get 100K AT tokens
   - AT proves "I deposited this much value"

2. **HT Tokens = Free Healthcare Benefits**
   - Hospital makes profit → Gives you HT tokens
   - HT is like "healthcare credit" you can spend

3. **You Keep Both Tokens**
   - AT stays with you (represents your deposit)
   - HT you spend for services (burns when used)

4. **Roles Control Who Does What**
   - Bank role → Can process deposits
   - Finance role → Can record trades and give benefits
   - Admin → Can do everything

5. **Everything is Recorded Forever**
   - Every deposit, trade, benefit → Saved on blockchain
   - No one can delete or fake records
   - Fully transparent and auditable

---

## 📊 VISUAL FLOWCHART - COMPLETE SYSTEM WORKFLOW

### **🎬 Real Patient Story: Sarah's Healthcare Journey**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    👤 SARAH (Patient)                                │
│              Owns: House worth $150,000                              │
│              Wallet: 0xSarah123...                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Sarah visits hospital
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    🏦 STAGE 1: ASSET DEPOSIT                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
   Sarah brings          Bank verifies            Bank prepares
   property deed         house value              deposit info
   to hospital           = $150,000               Deposit ID: 2001
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                                  ▼
          ┌────────────────────────────────────────────┐
          │  Bank Officer calls Smart Contract:        │
          │                                            │
          │  HospitalFinancials.mintAssetToken(        │
          │    patient: 0xSarah123...,                 │
          │    depositId: 2001,                        │
          │    amountAT: 150000,                       │
          │    metadata: "ipfs://sarah-house-deed"     │
          │  )                                         │
          └────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │   Smart Contract Logic    │
                    ├───────────────────────────┤
                    │ ✓ Check deposit 2001      │
                    │   not processed           │
                    │ ✓ Record Sarah as owner   │
                    │ ✓ Store amount: 150,000   │
                    │ ✓ Mint 150,000 AT tokens  │
                    │ ✓ Store property metadata │
                    │ ✓ Emit event              │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
          ┌────────────────────────────────────────────┐
          │         ✅ RESULT                          │
          │                                            │
          │  Sarah's Wallet:                           │
          │  • AT Balance: 150,000 tokens              │
          │  • Property deed stored on blockchain      │
          │                                            │
          │  Sarah's house is safe with hospital       │
          └────────────────────────────────────────────┘
                                  │
                   [2 months pass...]
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              💼 STAGE 2: HOSPITAL MAKES INVESTMENT                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
   Hospital uses          Investment            Makes
   deposited assets       in stocks             $10,000
   as collateral         and bonds              profit!
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                                  ▼
          ┌────────────────────────────────────────────┐
          │  Finance Team calls Smart Contract:        │
          │                                            │
          │  HospitalFinancials.recordTrade(           │
          │    investedAT: 150000,                     │
          │    profit: 10000                           │
          │  )                                         │
          └────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │   Smart Contract Logic    │
                    ├───────────────────────────┤
                    │ • Create Trade ID: 5      │
                    │ • Store invested: 150,000 │
                    │ • Store profit: $10,000   │
                    │ • Record timestamp        │
                    │ • Emit TradeRecorded      │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
          ┌────────────────────────────────────────────┐
          │         ✅ RESULT                          │
          │                                            │
          │  Trade #5 recorded on blockchain           │
          │  Profit: $10,000 ready to distribute       │
          └────────────────────────────────────────────┘
                                  │
                   [Next day...]
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│            🎁 STAGE 3: PROFIT DISTRIBUTION TO PATIENTS               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │  Finance Team Decision:   │
                    │                           │
                    │  Distribute $10,000 profit│
                    │  among 3 patients:        │
                    │  • Sarah: $4,000          │
                    │  • John: $3,500           │
                    │  • Mike: $2,500           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
          ┌────────────────────────────────────────────┐
          │  Finance Officer calls Smart Contract:     │
          │                                            │
          │  HospitalFinancials.distributeProfit(      │
          │    tradeId: 5,                             │
          │    recipients: [                           │
          │      0xSarah123...,                        │
          │      0xJohn456...,                         │
          │      0xMike789...                          │
          │    ],                                      │
          │    amountsHT: [4000, 3500, 2500]           │
          │  )                                         │
          └────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │   Smart Contract Logic    │
                    ├───────────────────────────┤
                    │ ✓ Verify Trade #5 exists  │
                    │ ✓ Validate arrays match   │
                    │ ✓ Mint HT to Sarah: 4,000 │
                    │ ✓ Mint HT to John: 3,500  │
                    │ ✓ Mint HT to Mike: 2,500  │
                    │ ✓ Total distributed: 10K  │
                    │ ✓ Emit event              │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
          ┌────────────────────────────────────────────┐
          │         ✅ RESULT                          │
          │                                            │
          │  Sarah's Wallet Now:                       │
          │  • AT Balance: 150,000 tokens (unchanged)  │
          │  • HT Balance: 4,000 tokens (NEW!)         │
          │                                            │
          │  Sarah can use 4,000 HT for healthcare!    │
          └────────────────────────────────────────────┘
                                  │
                   [1 week later...]
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│           🏥 STAGE 4: SARAH USES HEALTHCARE BENEFITS                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
   Sarah needs          Goes to             Checkup costs
   medical checkup      hospital            800 HT
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                                  ▼
          ┌────────────────────────────────────────────┐
          │  Reception calls Smart Contract:           │
          │                                            │
          │  HospitalFinancials.redeemHealthToken(     │
          │    patient: 0xSarah123...,                 │
          │    amountHT: 800,                          │
          │    serviceType: "Medical Checkup"          │
          │  )                                         │
          └────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │   Smart Contract Logic    │
                    ├───────────────────────────┤
                    │ ✓ Validate amount > 0     │
                    │ ✓ Check Sarah has 800 HT  │
                    │ ✓ Burn 800 HT from Sarah  │
                    │ ✓ Record service type     │
                    │ ✓ Emit redemption event   │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
          ┌────────────────────────────────────────────┐
          │         ✅ RESULT                          │
          │                                            │
          │  Sarah's Wallet After Service:             │
          │  • AT Balance: 150,000 (still has)         │
          │  • HT Balance: 3,200 (4,000 - 800)         │
          │                                            │
          │  Sarah got FREE medical checkup!           │
          │  (Worth $800, paid with HT tokens)         │
          └────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 🔄 CYCLE CONTINUES...                                │
│                                                                      │
│  • Hospital keeps investing → Making more profits                   │
│  • More profits → More HT distributed to Sarah                      │
│  • Sarah keeps getting healthcare benefits                          │
│  • Sarah's house (AT tokens) stays secure                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📈 MULTI-PATIENT PARALLEL FLOW

```
        TIME →
         │
    DAY 1│    👤 SARAH              👤 JOHN               👤 MIKE
         │    Deposits $150K        Deposits $80K         Deposits $120K
         │         ↓                     ↓                      ↓
         │    mintAssetToken()     mintAssetToken()      mintAssetToken()
         │         ↓                     ↓                      ↓
         │    Gets 150K AT          Gets 80K AT           Gets 120K AT
         │
         │
    DAY 15│              Hospital Invests All Deposits
         │              (150K + 80K + 120K = 350K total)
         │                            ↓
         │                    recordTrade(350000, 15000)
         │                            ↓
         │                   Profit: $15,000
         │
         │
    DAY 16│              Distribute Profit to All
         │                            ↓
         │              distributeProfit(tradeId: 1,
         │                [Sarah, John, Mike],
         │                [6500, 3500, 5000])
         │         ↓                     ↓                      ↓
         │    Sarah: +6,500 HT      John: +3,500 HT       Mike: +5,000 HT
         │
         │
    DAY 20│    Sarah uses            John uses             Mike doesn't
         │    800 HT for            1,000 HT for          use yet
         │    Medical Checkup       Dental Work
         │         ↓                     ↓                      ↓
         │    redeemHealthToken()   redeemHealthToken()        │
         │         ↓                     ↓                      │
         │    HT: 5,700             HT: 2,500              HT: 5,000
         │    (6,500 - 800)         (3,500 - 1,000)        (unchanged)
         │
         │
    DAY 30│              Hospital Invests Again
         │                            ↓
         │                    recordTrade(350000, 8000)
         │                            ↓
         │                   Profit: $8,000
         │
         │              Distribute Again...
         │              (Cycle repeats forever)
         │
         ▼
```

---

## 🎯 TOKEN BALANCE TRACKING - SARAH'S ACCOUNT

```
┌──────────────────────────────────────────────────────────────────┐
│                SARAH'S WALLET OVER TIME                           │
├──────────┬────────────────────┬─────────────────┬────────────────┤
│  EVENT   │   AT BALANCE       │   HT BALANCE    │   NOTES        │
├──────────┼────────────────────┼─────────────────┼────────────────┤
│  Start   │        0           │       0         │ No tokens yet  │
├──────────┼────────────────────┼─────────────────┼────────────────┤
│ Deposit  │   150,000 AT       │       0         │ House deposited│
│          │     ↑              │                 │                │
│          │   (minted)         │                 │                │
├──────────┼────────────────────┼─────────────────┼────────────────┤
│ Profit   │   150,000 AT       │   6,500 HT      │ Got benefits   │
│ Distrib. │  (unchanged)       │     ↑           │ from profit    │
│          │                    │  (minted)       │                │
├──────────┼────────────────────┼─────────────────┼────────────────┤
│ Medical  │   150,000 AT       │   5,700 HT      │ Used 800 HT    │
│ Checkup  │  (unchanged)       │     ↓           │ for checkup    │
│          │                    │  (burned)       │                │
├──────────┼────────────────────┼─────────────────┼────────────────┤
│ Next     │   150,000 AT       │   9,900 HT      │ Got more HT    │
│ Profit   │  (unchanged)       │     ↑           │ from new trade │
│          │                    │  (+4,200)       │                │
├──────────┼────────────────────┼─────────────────┼────────────────┤
│ Dental   │   150,000 AT       │   8,700 HT      │ Used 1,200 HT  │
│ Work     │  (unchanged)       │     ↓           │ for dental     │
│          │                    │  (burned)       │                │
└──────────┴────────────────────┴─────────────────┴────────────────┘

KEY INSIGHTS:
✓ AT tokens NEVER decrease (your deposit is safe)
✓ HT tokens increase with profit sharing
✓ HT tokens decrease when you use healthcare services
✓ You can keep earning HT as long as hospital makes profit
```

---

## 🔐 ROLE-BASED ACCESS VISUALIZATION

```
┌─────────────────────────────────────────────────────────────────┐
│                        HOSPITAL STAFF                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │    ADMIN     │ │  BANK OFFICER│ │FINANCE OFFICER│
        │              │ │              │ │              │
        │ Can do ALL   │ │ BANK_ROLE    │ │ FINANCE_ROLE │
        └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
               │                │                │
               │                │                │
     ┌─────────┴─────────┐     │      ┌─────────┴──────────┐
     │                   │     │      │                    │
     ▼                   ▼     ▼      ▼                    ▼
┌─────────┐        ┌─────────────┐ ┌──────────┐    ┌─────────────┐
│ Grant   │        │mintAssetToken│ │recordTrade│   │distributeProfit│
│ Roles   │        │             │ │          │    │             │
└─────────┘        └─────────────┘ └──────────┘    └─────────────┘
     │                   │                │                │
     ▼                   ▼                ▼                ▼
┌─────────┐        ┌─────────────┐       │         ┌─────────────┐
│setDeposit│       │ Process     │       │         │redeemHealthToken│
│Metadata │        │ Deposits    │       │         │             │
└─────────┘        └─────────────┘       │         └─────────────┘
                                          │
                            ┌─────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Record Trading│
                    │   Activities  │
                    └───────────────┘

❌ PATIENTS CANNOT:
   • Mint tokens themselves
   • Record trades
   • Distribute profits
   
✅ PATIENTS CAN:
   • View their balances
   • Transfer tokens to others
   • Track their transaction history
```

---

## 📊 SYSTEM STATE DIAGRAM

```
                    ┌─────────────────────┐
                    │  INITIAL STATE      │
                    │  • No deposits      │
                    │  • No tokens        │
                    │  • No trades        │
                    └──────────┬──────────┘
                               │
                               │ Patient deposits asset
                               ▼
                    ┌─────────────────────┐
                    │  DEPOSIT RECORDED   │
                    │  • Deposit exists   │
                    │  • AT tokens minted │
                    │  • Metadata stored  │
                    └──────────┬──────────┘
                               │
                               │ Hospital invests
                               ▼
                    ┌─────────────────────┐
                    │  TRADE COMPLETED    │
                    │  • Trade recorded   │
                    │  • Profit tracked   │
                    │  • Ready to share   │
                    └──────────┬──────────┘
                               │
                               │ Profit distributed
                               ▼
                    ┌─────────────────────┐
                    │  BENEFITS ISSUED    │
                    │  • HT tokens minted │
                    │  • Patients credited│
                    │  • Can use benefits │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴───────────┐
                    │                      │
       Patient uses benefits       OR     More investments
                    │                      │
                    ▼                      ▼
        ┌─────────────────────┐  ┌─────────────────────┐
        │ BENEFITS REDEEMED   │  │  NEW TRADE CYCLE    │
        │ • HT burned         │  │  • More profits     │
        │ • Service provided  │  │  • More HT          │
        │ • Can earn more HT  │  │  • Cycle continues  │
        └─────────┬───────────┘  └──────────┬──────────┘
                  │                         │
                  └─────────┬───────────────┘
                            │
                            ▼
                    ┌─────────────────────┐
                    │  ACTIVE ECOSYSTEM   │
                    │  • Continuous growth│
                    │  • Ongoing benefits │
                    │  • Sustainable loop │
                    └─────────────────────┘
```

---



## 📁 FOLDER DETAILS

### **contracts/** - Source Code
Your Solidity smart contracts (the actual code)

### **test/** - Tests
Tests to verify contracts work correctly

### **scripts/** - Automation
Scripts to deploy and interact with contracts

### **artifacts/** - Compiled Code
Generated when you run `npx hardhat compile`
- Contains bytecode (what blockchain executes)
- Contains ABI (interface for calling functions)

### **typechain-types/** - TypeScript Types
Auto-generated TypeScript definitions for your contracts
- Helps with autocomplete in VS Code
- Type safety when writing scripts

### **cache/** - Build Cache
Speeds up compilation (can delete if issues)

### **node_modules/** - Dependencies
All the libraries your project needs (npm packages)

---

## 🎯 COMMON COMMANDS

```powershell
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Quick deploy (temporary)
npx hardhat run scripts/deploy-simple.ts

# Start persistent blockchain
npx hardhat node

# Deploy to persistent blockchain (in another terminal)
npx hardhat run scripts/deploy-simple.ts --network localhost

# Clean build artifacts
npx hardhat clean
```

---

## 🔄 WORKFLOW SUMMARY

1. **Write contracts** in `contracts/` folder
2. **Compile** with `npx hardhat compile`
3. **Write tests** in `test/` folder
4. **Run tests** with `npx hardhat test`
5. **Start blockchain** with `npx hardhat node` (Terminal 1)
6. **Deploy** with `npx hardhat run scripts/deploy-simple.ts --network localhost` (Terminal 2)
7. **Save addresses** from deployment output
8. **Interact** with contracts using saved addresses
9. **Stop blockchain** when done (Ctrl+C in Terminal 1)

---

## 🎓 QUICK REFERENCE

| Term | Meaning |
|------|---------|
| **Contract** | Code deployed to blockchain |
| **Address** | Location/ID of account or contract |
| **Private Key** | Secret key to control an address |
| **Transaction** | Action on blockchain (deploy, call function) |
| **Block** | Batch of transactions |
| **Gas** | Fee for computation |
| **Mint** | Create new tokens |
| **Burn** | Destroy tokens |
| **Role** | Permission to do specific actions |
| **Event** | Log message from contract |
| **ABI** | Interface showing contract functions |
| **Bytecode** | Compiled contract code |

---

## ✅ CHECKLIST FOR NEW DEPLOYMENT

- [ ] Start blockchain: `npx hardhat node` (Terminal 1)
- [ ] Deploy contracts: `npx hardhat run scripts/deploy-simple.ts --network localhost` (Terminal 2)
- [ ] Save all contract addresses from output
- [ ] Verify no errors in Terminal 1 logs
- [ ] Keep Terminal 1 running while working
- [ ] Stop blockchain (Ctrl+C) when done

---

## 📞 TROUBLESHOOTING

**"Cannot connect to network"**
→ Make sure Terminal 1 (`npx hardhat node`) is running

**"Contract not found"**
→ Run `npx hardhat compile` first

**"Module not found"**
→ Run `npm install`

**"Network reset/addresses changed"**
→ You restarted the node - redeploy and get new addresses

**"Out of gas"**
→ Increase gas limit in hardhat.config.ts

---

**🎉 You're all set! This is your complete guide to the Hospital Blockchain Project.**
