# 🔗 CONNECTING FRONTEND TO BLOCKCHAIN

## ✅ SETUP COMPLETE!

Your Next.js frontend is now configured to connect to your local Hardhat blockchain.

---

## 📋 WHAT WAS CONFIGURED

### 1. **Environment Variables** (`.env.local`)
✅ Contract addresses from your deployment
✅ RPC URL pointing to local Hardhat node
✅ Blockchain network configuration

### 2. **Web3 Library** (`lib/web3.ts`)
✅ Provider and signer utilities
✅ Wallet connection functions
✅ MetaMask integration
✅ Helper functions for formatting addresses and amounts

### 3. **Blockchain Services** (`services/blockchainService.ts`)
✅ AssetTokenService - Interact with AT tokens
✅ HealthTokenService - Interact with HT tokens
✅ HospitalFinancialsService - Main hospital operations
✅ Event listeners for real-time updates

### 4. **Contract ABIs** (`services/abis/`)
✅ AssetToken.json
✅ HealthToken.json
✅ HospitalFinancials.json

### 5. **Dependencies**
✅ ethers.js v6 added to package.json

---

## 🚀 NEXT STEPS

### **Step 1: Install Dependencies**

```powershell
cd d:\Projects\FYP\Fixed-Asset-Trading\hospitalfrontend
npm install
```

### **Step 2: Install MetaMask**

1. Install MetaMask browser extension: https://metamask.io/download/
2. Create a new wallet (or use existing)
3. You'll use this to interact with your local blockchain

### **Step 3: Add Hardhat Network to MetaMask**

**Option A: Automatic (when you use the app)**
- The `connectWallet()` function will automatically add the network

**Option B: Manual Setup**
1. Open MetaMask
2. Click network dropdown → "Add Network" → "Add a network manually"
3. Enter these details:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
4. Click "Save"

### **Step 4: Import Test Account**

Import one of the Hardhat test accounts to MetaMask:

1. Open MetaMask
2. Click account icon → "Import Account"
3. Select "Private Key"
4. Paste this private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
5. Click "Import"

**This is Account #0 from Hardhat with 10,000 ETH** ✅

⚠️ **NEVER use this account on real networks!** These keys are public.

### **Step 5: Verify Setup**

1. Make sure Hardhat node is running in Terminal 1:
   ```powershell
   cd d:\contracts
   npx hardhat node
   ```

2. In MetaMask:
   - Switch to "Hardhat Local" network
   - You should see 10,000 ETH balance

---

## 💻 USAGE EXAMPLES

### **Example 1: Check Token Balances**

```typescript
import { assetTokenService, healthTokenService } from '@/services/blockchainService'
import { formatTokenAmount } from '@/lib/web3'

async function checkBalances(patientAddress: string) {
  try {
    // Get AT balance
    const atBalance = await assetTokenService.balanceOf(patientAddress)
    console.log('Asset Tokens:', formatTokenAmount(atBalance))

    // Get HT balance
    const htBalance = await healthTokenService.balanceOf(patientAddress)
    console.log('Health Tokens:', formatTokenAmount(htBalance))
  } catch (error) {
    console.error('Error checking balances:', error)
  }
}
```

### **Example 2: Connect Wallet**

```typescript
'use client'

import { useState } from 'react'
import { connectWallet, formatAddress } from '@/lib/web3'
import { Button } from '@/components/ui/button'

export function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null)

  const handleConnect = async () => {
    const wallet = await connectWallet()
    if (wallet) {
      setAddress(wallet.address)
      alert(`Connected: ${wallet.address}`)
    }
  }

  return (
    <div>
      {address ? (
        <p>Connected: {formatAddress(address)}</p>
      ) : (
        <Button onClick={handleConnect}>Connect Wallet</Button>
      )}
    </div>
  )
}
```

### **Example 3: Mint Asset Tokens (Bank Officer)**

```typescript
import { hospitalFinancialsService } from '@/services/blockchainService'
import { parseTokenAmount } from '@/lib/web3'

async function mintAssetTokens() {
  try {
    const patientAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    const depositId = 1001
    const amount = parseTokenAmount('100000') // 100,000 AT tokens
    const metadata = 'ipfs://QmPropertyDocumentHash'

    const tx = await hospitalFinancialsService.mintAssetToken(
      patientAddress,
      depositId,
      amount,
      metadata
    )

    console.log('Transaction sent:', tx.hash)
    await tx.wait() // Wait for confirmation
    console.log('Asset tokens minted successfully!')
  } catch (error) {
    console.error('Error minting tokens:', error)
  }
}
```

### **Example 4: Listen to Events**

```typescript
'use client'

import { useEffect } from 'react'
import { hospitalFinancialsService } from '@/services/blockchainService'
import { formatTokenAmount } from '@/lib/web3'

export function EventListener() {
  useEffect(() => {
    // Listen for asset token minting
    hospitalFinancialsService.onAssetTokenMinted(
      (patient, depositId, amount, metadata) => {
        console.log('Asset Token Minted!')
        console.log('Patient:', patient)
        console.log('Deposit ID:', depositId.toString())
        console.log('Amount:', formatTokenAmount(amount))
        console.log('Metadata:', metadata)
      }
    )

    // Listen for profit distribution
    hospitalFinancialsService.onProfitDistributed((tradeId, totalDistributed) => {
      console.log('Profit Distributed!')
      console.log('Trade ID:', tradeId.toString())
      console.log('Total:', formatTokenAmount(totalDistributed))
    })

    // Cleanup
    return () => {
      hospitalFinancialsService.removeAllListeners()
    }
  }, [])

  return <div>Listening for blockchain events...</div>
}
```

### **Example 5: Record Trade and Distribute Profit**

```typescript
import { hospitalFinancialsService } from '@/services/blockchainService'
import { parseTokenAmount } from '@/lib/web3'

async function recordAndDistribute() {
  try {
    // 1. Record trade
    const investedAT = parseTokenAmount('100000')
    const profit = parseTokenAmount('5000')
    
    const tradeTx = await hospitalFinancialsService.recordTrade(investedAT, profit)
    await tradeTx.wait()
    
    const tradeId = await hospitalFinancialsService.getNextTradeId() - 1n
    console.log('Trade recorded with ID:', tradeId.toString())

    // 2. Distribute profit
    const recipients = [
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    ]
    const amounts = [
      parseTokenAmount('2500'), // 2500 HT to patient 1
      parseTokenAmount('2500'), // 2500 HT to patient 2
    ]

    const distributeTx = await hospitalFinancialsService.distributeProfit(
      Number(tradeId),
      recipients,
      amounts
    )
    await distributeTx.wait()
    
    console.log('Profit distributed successfully!')
  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

## 🎨 SAMPLE REACT COMPONENT

Create this file to test the integration:

**File**: `hospitalfrontend/app/blockchain-test/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { connectWallet, formatAddress, formatTokenAmount } from '@/lib/web3'
import { assetTokenService, healthTokenService } from '@/services/blockchainService'

export default function BlockchainTestPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [atBalance, setAtBalance] = useState<string>('0')
  const [htBalance, setHtBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    try {
      const wallet = await connectWallet()
      if (wallet) {
        setWalletAddress(wallet.address)
        await loadBalances(wallet.address)
      }
    } catch (error) {
      console.error('Connection error:', error)
      alert('Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  const loadBalances = async (address: string) => {
    try {
      const at = await assetTokenService.balanceOf(address)
      const ht = await healthTokenService.balanceOf(address)
      
      setAtBalance(formatTokenAmount(at))
      setHtBalance(formatTokenAmount(ht))
    } catch (error) {
      console.error('Error loading balances:', error)
    }
  }

  const refreshBalances = async () => {
    if (walletAddress) {
      setLoading(true)
      await loadBalances(walletAddress)
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Blockchain Integration Test</h1>

      {!walletAddress ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConnect} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Connected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono">{walletAddress}</p>
              <p className="text-sm text-gray-500 mt-2">
                {formatAddress(walletAddress)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Token Balances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Asset Tokens (AT)</p>
                <p className="text-2xl font-bold">{atBalance} AT</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Health Tokens (HT)</p>
                <p className="text-2xl font-bold">{htBalance} HT</p>
              </div>
              <Button onClick={refreshBalances} disabled={loading} variant="outline">
                {loading ? 'Refreshing...' : 'Refresh Balances'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
```

Access it at: `http://localhost:3000/blockchain-test`

---

## 🔧 TROUBLESHOOTING

### **"MetaMask not detected"**
→ Install MetaMask browser extension

### **"Cannot connect to network"**
→ Make sure Hardhat node is running (`npx hardhat node`)

### **"Wrong network"**
→ Switch MetaMask to "Hardhat Local" network (Chain ID: 31337)

### **"Insufficient funds"**
→ Import a test account with the private key provided above

### **"Contract not deployed"**
→ Redeploy contracts: `npx hardhat run scripts/deploy-simple.ts --network localhost`

### **Addresses changed after restarting**
→ Update `.env.local` with new addresses from deployment output

---

## 📝 IMPORTANT NOTES

### **When you restart Hardhat node:**
1. All data is lost (blockchain resets)
2. Contract addresses change
3. You need to:
   - Redeploy contracts
   - Update `.env.local` with new addresses
   - Restart Next.js dev server

### **Current Deployed Addresses:**
```
AssetToken:           0x5fbdb2315678afecb367f032d93f642f64180aa3
HealthToken:          0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
HospitalFinancials:   0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0
```

### **Test Accounts:**
All 20 accounts from `npx hardhat node` are available
- Each has 10,000 ETH
- Private keys are shown in Terminal 1
- Use Account #0 as admin/deployer

---

## 🎯 INTEGRATION CHECKLIST

- [x] Environment variables configured
- [x] Web3 utilities created
- [x] Blockchain services created
- [x] Contract ABIs copied
- [x] ethers.js dependency added
- [ ] Run `npm install` in hospitalfrontend folder
- [ ] Install MetaMask extension
- [ ] Add Hardhat network to MetaMask
- [ ] Import test account to MetaMask
- [ ] Start Next.js dev server (`npm run dev`)
- [ ] Test blockchain connection

---

## 🚀 START DEVELOPMENT

```powershell
# Terminal 1 - Hardhat Node (already running)
cd d:\contracts
npx hardhat node

# Terminal 2 - Frontend
cd d:\Projects\FYP\Fixed-Asset-Trading\hospitalfrontend
npm install
npm run dev
```

Then open: `http://localhost:3000/blockchain-test`

---

**You're all set! Your frontend can now communicate with your smart contracts! 🎉**
