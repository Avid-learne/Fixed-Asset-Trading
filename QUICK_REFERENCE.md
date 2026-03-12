# 🚀 Quick Reference Card

## WHAT CAN YOU DO RIGHT NOW? ✅

```
npx hardhat compile      → Compile smart contracts
npx hardhat test         → Run tests  
npx hardhat node         → Start Ethereum node (localhost:8545)
```

## WHAT YOU NEED TO DO FIRST ⚠️

Free up 5-10 GB disk space on C: drive
→ See DISK_SPACE_NOTICE.md for solutions

## WHAT TO READ FIRST 📖

1. **INDEX.md** - Navigation to everything
2. **START_HERE.md** - 5-minute overview
3. **VERIFICATION.md** - Current status
4. **RUN_GUIDE.md** - Full instructions

## REPOSITORY ARCHITECTURE 🏗️

```
┌─────────────────┐
│  Frontend       │ Next.js (Port 3000)
│  http://localhost:3000
└────────┬────────┘
         │
┌────────▼──────────┐
│ Smart Contracts   │ Hardhat (Port 8545)
│ Ethereum          │
└────────┬──────────┘
         │
    ┌────┴───────────────┬──────────────┐
    │                    │              │
┌───▼──────┐  ┌─────────▼──┐  ┌──────▼──────┐
│ Bank     │  │ Hospital   │  │ Patient    │
│ Service  │  │ Service    │  │ Service    │
│ (8080)   │  │ (8081)     │  │ (8082)     │
└──────────┘  └────────────┘  └────────────┘
    │              │              │
    └──────┬───────┴──────┬──────┘
           │              │
       ┌───▼──┐  ┌───────▼──┐
       │  DB  │  │  Queue   │
       │ PgSQL│  │  Kafka   │
       └──────┘  └──────────┘
```

## FILES YOU CREATED 📋

| File | What It Does | When to Read |
|------|-------------|--------------|
| INDEX.md | Master navigation | First |
| START_HERE.md | Quick overview | Second |
| VERIFICATION.md | Current status | Anytime |
| SETUP_COMPLETE.md | Full reference | When you need details |
| RUN_GUIDE.md | How to run everything | For operations |
| DISK_SPACE_NOTICE.md | Fix space issue | When stuck |
| quick-start.ps1 | Easy launcher | .\quick-start.ps1 -? |
| setup.ps1 | Auto installer | After freeing space |
| startup-guide.ps1 | Terminal help | For multi-app setup |

## IMMEDIATE NEXT STEPS 🎯

### Option A: Test Smart Contracts (2 minutes)
```powershell
cd C:\Users\850\ G5\fyp-blockchain-hospital
npx hardhat compile
echo "✅ Smart contracts compiled successfully!"
```

### Option B: Start Ethereum Node (Best for testing)
```powershell
cd C:\Users\850\ G5\fyp-blockchain-hospital
npx hardhat node
# Window stays open, showing blockchain running
```

### Option C: Free Disk Space (Required for next phase)
```powershell
# See DISK_SPACE_NOTICE.md for detailed steps
# Need to free 5-10 GB
```

## PROJECT COMPONENTS 🧩

### ✅ Already Installed (337 MB)
- Hardhat (Ethereum dev environment)
- Ethers.js (Blockchain library)
- OpenZeppelin (Smart contract library)
- TypeScript tooling

### Smart Contracts Ready to Work With
- `AssetToken.sol` - Token contract
- `HealthToken.sol` - Healthcare token
- `HospitalFinancials.sol` - Finance contract
- `Counter.sol` - Test contract

### ⏳ To Install Later (After Freeing Space)
- Next.js Frontend (~800 MB)
- Bank Microservice (~500 MB)
- Hospital Microservice (~500 MB)
- Patient Microservice (~500 MB)
- Node modules for all (~2 GB total)

## KEY PORTS 🔌

| Component | Port | URL | Status |
|-----------|------|-----|--------|
| Hardhat Ethereum | 8545 | http://localhost:8545 | ✅ Ready |
| Frontend | 3000 | http://localhost:3000 | ⏳ Needs space |
| Bank Service | 8080 | http://localhost:8080 | ⏳ Needs space |
| Hospital Service | 8081 | http://localhost:8081 | ⏳ Needs space |
| Patient Service | 8082 | http://localhost:8082 | ⏳ Needs space |

## TECHNOLOGY STACK 🛠️

| Layer | Technology | Version |
|-------|-----------|---------|
| Blockchain | Ethereum (Hardhat) | - |
| Smart Contracts | Solidity | 0.8.28 |
| Blockchain Lib | Ethers.js | 6.15.0 |
| Frontend | Next.js | 14.2.33 |
| Frontend Lib | React | 18.2.0 |
| Backend Framework | Spring Boot | 3.5.8 |
| Backend Language | Java | 21 |
| Database | PostgreSQL | Latest |
| Cache | Redis | Latest |
| Message Queue | Kafka | Latest |

## COMMON ERRORS & FIXES 🔧

### "Command not found: npx"
```powershell
# Install Node.js from nodejs.org
# Then try again
```

### "No space left on device"
```powershell
# See DISK_SPACE_NOTICE.md
# Need 5-10 GB free
```

### "Port 8545 in use"
```powershell
Get-NetTCPConnection -LocalPort 8545 | Stop-Process -Force
npx hardhat node  # Try again
```

### Smart contracts won't compile
```powershell
rm -r artifacts cache
npx hardhat compile  # Retry
```

## DOCUMENTATION LOCATIONS 📍

All files are in the repository root:
```
C:\Users\850\ G5\fyp-blockchain-hospital\
├── INDEX.md (start here!)
├── START_HERE.md
├── VERIFICATION.md
├── SETUP_COMPLETE.md
├── RUN_GUIDE.md
├── DISK_SPACE_NOTICE.md
├── quick-start.ps1
├── setup.ps1
└── startup-guide.ps1
```

## HOW TO GET HELP 🆘

1. **Confused?** → Read INDEX.md
2. **Want quick start?** → Read START_HERE.md
3. **Need status?** → Read VERIFICATION.md
4. **Want full guide?** → Read SETUP_COMPLETE.md
5. **Have errors?** → Read RUN_GUIDE.md (troubleshooting section)
6. **Out of space?** → Read DISK_SPACE_NOTICE.md
7. **Want to run something?** → Use quick-start.ps1

## SAVE THIS FOR LATER 💾

```powershell
# Quick commands to copy/paste

# Compile smart contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start Ethereum node (keeps running)
npx hardhat node

# Check disk space
Get-Volume | Where-Object {$_.DriveLetter -eq 'C'}

# See this card again
Get-Content "C:\Users\850\ G5\fyp-blockchain-hospital\QUICK_REFERENCE.md"
```

---

**Your Setup:** ✅ Smart Contracts Ready | ⏳ Full Stack Pending  
**Next Step:** Free disk space or test smart contracts now  
**Quick Start:** `npx hardhat compile` or `npx hardhat node`  
**Questions?** Read INDEX.md
