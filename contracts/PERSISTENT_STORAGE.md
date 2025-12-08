# 💾 Persistent Blockchain Storage Setup

## ✅ Configuration Complete!

Your Hardhat setup now saves deployment data to disk!

---

## 📁 What Gets Saved

When you deploy contracts, the following will be saved:

```
contracts/
└── deployments/
    └── localhost/
        ├── deployment.json          ← Contract addresses & metadata
        ├── AssetToken.json          ← AssetToken deployment info
        ├── HealthToken.json         ← HealthToken deployment info
        └── HospitalFinancials.json  ← HospitalFinancials deployment info
```

**This persists between:**
- ✅ Terminal restarts
- ✅ Code changes
- ✅ Computer restarts

---

## 🚀 How to Deploy with Persistence

### **Option 1: Using deploy script (Recommended)**

```powershell
cd d:\Projects\FYP\Fixed-Asset-Trading\contracts

# Start Hardhat node (Terminal 1)
npx hardhat node

# Deploy with persistence (Terminal 2)
npx hardhat deploy --network localhost
```

### **Option 2: Using custom deploy script**

```powershell
# Deploy and save addresses to file
npx hardhat run scripts/deploy-persistent.ts --network localhost
```

---

## 📖 Reading Saved Deployments

The deployment data is saved in JSON format at:
```
contracts/deployments/localhost/deployment.json
```

**Example content:**
```json
{
  "network": "localhost",
  "chainId": 31337,
  "timestamp": "2024-12-08T10:30:00.000Z",
  "deployer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "contracts": {
    "AssetToken": "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    "HealthToken": "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
    "HospitalFinancials": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    "Counter": "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
  }
}
```

---

## 🔄 Reusing Deployed Contracts

After deploying, you can access the addresses:

**In your scripts:**
```typescript
import deployments from './deployments/localhost/deployment.json';

const assetTokenAddress = deployments.contracts.AssetToken;
const healthTokenAddress = deployments.contracts.HealthToken;
```

**Automatically update frontend:**
```powershell
# Read deployment file and update .env.local
node update-env.js
```

---

## ⚠️ Important Notes

### **Blockchain State Still Temporary!**
While **deployment addresses are saved**, the **blockchain state** (balances, transactions) is still temporary when using `npx hardhat node`.

**What IS saved:**
- ✅ Contract addresses
- ✅ Deployment metadata
- ✅ Deployment timestamp

**What is NOT saved:**
- ❌ Token balances
- ❌ Transactions
- ❌ Minted tokens
- ❌ Contract state changes

### **To Save EVERYTHING (Including State):**

You need to use a real blockchain:
- **Testnet** (Sepolia, Mumbai) - Free, permanent
- **Mainnet** (Ethereum, Polygon) - Real money, permanent

---

## 🎯 Benefits of This Setup

1. **No need to manually update addresses** - Saved automatically
2. **Track deployment history** - See when contracts were deployed
3. **Multiple environments** - Separate deployments for localhost/testnet/mainnet
4. **Easy rollback** - Can see previous deployment addresses

---

## 📝 Workflow Example

### **Development Cycle:**

```powershell
# Terminal 1 - Start blockchain
npx hardhat node

# Terminal 2 - Deploy (ONCE)
npx hardhat deploy --network localhost

# Addresses saved to deployments/localhost/

# Frontend automatically reads from there
npm run dev
```

### **After Changes:**

```powershell
# Redeploy (updates deployment files)
npx hardhat deploy --network localhost --reset

# Deployment file automatically updated
```

---

## 🔧 Helpful Commands

```powershell
# Deploy to localhost
npx hardhat deploy --network localhost

# Force redeploy (overwrite existing)
npx hardhat deploy --network localhost --reset

# List all deployments
npx hardhat deployments

# Export all deployment addresses
npx hardhat export --export deployments.json
```

---

## ✨ Next Steps

1. ✅ Configuration is complete
2. ✅ Deploy using: `npx hardhat deploy --network localhost`
3. ✅ Deployment data saved automatically
4. ✅ Use saved addresses in your frontend

**Your contracts now have persistent deployment tracking!** 🎉

---

## 🌍 For Production Deployment

When ready to deploy to a real network:

```powershell
# Deploy to Mumbai testnet (Polygon)
npx hardhat deploy --network mumbai

# Deploy to Sepolia testnet (Ethereum)
npx hardhat deploy --network sepolia
```

Deployment data will be saved in:
- `deployments/mumbai/`
- `deployments/sepolia/`

Each network has its own deployment folder!
