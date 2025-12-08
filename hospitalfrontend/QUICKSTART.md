# 🚀 Quick Start Guide - Blockchain Integration

## ✅ You're Ready to Connect!

Your local blockchain is running and contracts are deployed. Here's how to connect your frontend:

---

## 📝 Step-by-Step Setup

### **1. Install Dependencies** (5 minutes)

```powershell
cd d:\Projects\FYP\Fixed-Asset-Trading\hospitalfrontend
npm install
```

This will install `ethers.js` and all other dependencies.

---

### **2. Install & Setup MetaMask** (10 minutes)

#### Install Extension
- Go to: https://metamask.io/download/
- Click "Install MetaMask for Chrome" (or your browser)
- Follow installation steps
- Create a password (remember it!)

#### Add Hardhat Network to MetaMask
1. Open MetaMask
2. Click network dropdown (top left)
3. Click "Add Network" → "Add a network manually"
4. Fill in:
   ```
   Network Name: Hardhat Local
   RPC URL: http://127.0.0.1:8545
   Chain ID: 31337
   Currency Symbol: ETH
   ```
5. Click "Save"

#### Import Test Account
1. In MetaMask, click your account icon
2. Select "Import Account"
3. Choose "Private Key"
4. Paste this private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
5. Click "Import"

✅ You should now see **10,000 ETH** in your account!

---

### **3. Start Frontend** (2 minutes)

```powershell
cd d:\Projects\FYP\Fixed-Asset-Trading\hospitalfrontend
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

---

### **4. Test Connection** (3 minutes)

1. Open browser: `http://localhost:3000/blockchain-test`
2. Click "Connect MetaMask"
3. MetaMask popup will appear → Click "Next" → "Connect"
4. You should see:
   - ✅ Your wallet address
   - ✅ Token balances (AT and HT)
   - ✅ Contract addresses

---

## 🎯 Quick Test Commands

Open browser console (F12) on the test page and try:

```javascript
// Get services
import { assetTokenService, healthTokenService } from '@/services/blockchainService'

// Check AT token name
await assetTokenService.name() // Returns: "Asset Token"

// Check your AT balance
const balance = await assetTokenService.balanceOf('YOUR_ADDRESS_HERE')
console.log(balance.toString())
```

---

## 📍 Current Deployment Info

**Contract Addresses:**
```
AssetToken:         0x5fbdb2315678afecb367f032d93f642f64180aa3
HealthToken:        0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
HospitalFinancials: 0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0
```

**Test Account:**
```
Address:     0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Balance:     10,000 ETH
```

---

## 🛠️ Troubleshooting

### "Cannot connect to blockchain"
→ Make sure Terminal 1 is running: `npx hardhat node`

### "Wrong network" in MetaMask
→ Switch to "Hardhat Local" network in MetaMask

### "Nonce too high" error
→ Reset MetaMask: Settings → Advanced → Clear activity and nonce data

### Contract addresses changed
→ You restarted Hardhat node. Redeploy contracts and update `.env.local`

---

## 📁 Key Files Created

| File | Purpose |
|------|---------|
| `lib/web3.ts` | Web3 utilities (connect wallet, formatters) |
| `services/blockchainService.ts` | Smart contract interaction services |
| `services/abis/*.json` | Contract ABIs (interface definitions) |
| `.env.local` | Environment variables (contract addresses) |
| `app/blockchain-test/page.tsx` | Test page to verify setup |

---

## 🔗 Integration Examples

### In any React component:

```typescript
import { connectWallet, formatTokenAmount } from '@/lib/web3'
import { assetTokenService } from '@/services/blockchainService'

// Connect wallet
const wallet = await connectWallet()
console.log('Connected:', wallet.address)

// Check balance
const balance = await assetTokenService.balanceOf(wallet.address)
console.log('AT Balance:', formatTokenAmount(balance))
```

---

## ✨ Next Steps

1. ✅ Complete setup above
2. ✅ Test at `/blockchain-test`
3. 📝 Integrate blockchain calls into your existing pages:
   - Patient dashboard → Show AT/HT balances
   - Bank officer page → Mint AT tokens
   - Finance page → Record trades, distribute profits
   - Hospital page → Redeem HT tokens

See `BLOCKCHAIN_SETUP.md` for detailed integration examples!

---

**Total Setup Time: ~20 minutes** ⏱️

**You're ready to build! 🎉**
