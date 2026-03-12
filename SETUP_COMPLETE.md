# ✅ Blockchain Hospital Repository - Setup Summary

## Current Installation Status

### ✅ INSTALLED & WORKING
- **Root Dependencies (Hardhat + Ethers)**: Ready
  - Smart contract compilation works: `npx hardhat compile` ✓
  - Ethereum environment configured ✓
  - Node.js v18+ with npm ✓

### ⚠️ DISK SPACE ISSUE
Your C drive has only **0.68 GB free** (was full at 0 bytes). This prevents installing:
- Hospital Frontend (Next.js) - needs ~800 MB
- Backend Services (Spring Boot) - needs ~500-1500 MB each
- Complete node_modules for all services

---

## What You Can Run NOW

### Smart Contracts & Testing
```powershell
cd C:\Users\850 G5\fyp-blockchain-hospital

# Compile smart contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start local Hardhat Ethereum node
npx hardhat node
```

### View Smart Contracts
Located in:
- `contracts/AssetToken.sol` - Token contract
- `contracts/HealthToken.sol` - Healthcare token
- `contracts/HospitalFinancials.sol` - Hospital financials
- `contracts/Counter.sol` - Counter contract

---

## Installation Files Created

I've created three helper files for your reference:

1. **RUN_GUIDE.md** - Comprehensive guide for running all components
2. **setup.ps1** - Automated setup script (run when you have disk space)
3. **startup-guide.ps1** - Instructions for starting all services
4. **DISK_SPACE_NOTICE.md** - Detailed disk space troubleshooting

---

## To Complete the Full Installation

### Step 1: Free Up Disk Space
You need **at least 5-10 GB free**. Options:

**A. Clean Windows (2-5 GB freed):**
```powershell
# Clean temp files
Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue

# Clear Recycle Bin (via GUI is easier)
# Or: (New-Object -ComObject Shell.Application).Namespace(10).Self.InvokeVerb("Empty")
```

**B. Move project to another drive (if available):**
```powershell
# Check available drives
Get-Volume

# Move to D: drive if it has space
Move-Item "C:\Users\850 G5\fyp-blockchain-hospital" "D:\fyp-blockchain-hospital"
```

**C. Uninstall large programs:**
- Settings → Apps → Installed apps
- Remove unused software

### Step 2: Install Frontend
```powershell
cd hospital-frontend
npm install
```

### Step 3: Install Backend Services
```powershell
# Bank Service
cd backend/bank-service
mvn clean install

# Hospital Service
cd backend/hospital-service
mvn clean install

# Patient Service
cd backend/patient-service
mvn clean install
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Blockchain Hospital System                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend (Next.js) ──────────────────────────┐         │
│  http://localhost:3000                        │         │
│                                               │         │
│  ┌──────────────────────────────────────────┐ │         │
│  │  Smart Contracts (Hardhat/Ethers)        │ │         │
│  │  Localhost:8545                          │ │         │
│  │  - AssetToken.sol                        │ │         │
│  │  - HealthToken.sol                       │ │         │
│  │  - HospitalFinancials.sol                │ │         │
│  └──────────────────────────────────────────┘ │         │
│                                               │         │
│  Backend Services (Spring Boot):              │         │
│  ├─ Bank Service (8080) ──────────────────────┘         │
│  ├─ Hospital Service (8081)                             │
│  └─ Patient Service (8082)                              │
│                                                           │
│  Database (PostgreSQL)                                  │
│  Cache (Redis)                                          │
│  Message Queue (Kafka)                                  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Dependencies Overview

### Root Level (Already Installed)
```json
{
  "devDependencies": {
    "hardhat": "^3.0.9",
    "ethers": "^6.15.0",
    "@nomicfoundation/hardhat-ethers": "^4.0.2",
    "@openzeppelin/contracts": "^5.0.0"
  }
}
```

### Frontend (Needs Installation)
```json
{
  "dependencies": {
    "next": "^14.2.33",
    "react": "^18.2.0",
    "ethers": "^6.13.2",
    "@supabase/supabase-js": "^2.86.0"
  }
}
```

### Backend Services (Needs Installation)
- Spring Boot 3.5.8
- Java 21
- PostgreSQL driver
- Redis support
- Kafka integration

---

## Quick Reference Commands

### Smart Contracts
```powershell
# Compile
npx hardhat compile

# Run tests
npx hardhat test

# Start local node (required for frontend)
npx hardhat node

# Deploy contracts
npx hardhat ignition deploy ignition/modules/Counter.ts

# View artifacts
ls artifacts/contracts/
```

### Frontend (after installation)
```powershell
cd hospital-frontend

# Development
npm run dev

# Production build
npm run build
npm start

# Lint
npm run lint
```

### Backend (after installation)
```powershell
# Each service - replace SERVICE_NAME with bank-service, hospital-service, or patient-service
cd backend/SERVICE_NAME
mvn spring-boot:run

# Or build and run
mvn clean package
java -jar target/service-name-0.0.1-SNAPSHOT.jar
```

---

## Troubleshooting

### "Cannot find module" errors
```powershell
# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

### Port already in use
- Hardhat: 8545
- Bank: 8080
- Hospital: 8081
- Patient: 8082
- Frontend: 3000

Change port or kill existing process.

### Smart contracts not compiling
```powershell
# Clean cache
rm -r artifacts cache
npx hardhat compile
```

### Backend won't start
```powershell
# Check Java version (need 21+)
java -version

# Maven update
mvn clean install -U

# Check PostgreSQL is running
sqlplus / as sysdba
```

---

## Files in This Repository

### Smart Contracts
- `contracts/*.sol` - Solidity contracts
- `ignition/modules/` - Deployment modules
- `test/` - Test files
- `hardhat.config.ts` - Hardhat configuration

### Frontend
- `hospital-frontend/app/` - Next.js pages
- `hospital-frontend/components/` - React components
- `hospital-frontend/lib/` - Utilities (Web3, Supabase, etc.)

### Backend
- `backend/bank-service/` - Banking microservice
- `backend/hospital-service/` - Hospital microservice
- `backend/patient-service/` - Patient microservice

### Configuration
- `tsconfig.json` - TypeScript config (root)
- `hospital-frontend/tsconfig.json` - Frontend TS config
- `backend/*/pom.xml` - Maven configuration

---

## Next Steps

1. **Immediately:** Start the Hardhat node for smart contract testing
   ```powershell
   npx hardhat node
   ```

2. **Soon:** Free up disk space to install frontend and backend

3. **Later:** Complete the full multi-service deployment

---

## Support Files Created
- **RUN_GUIDE.md** - Complete operational guide
- **setup.ps1** - Automated installer script
- **startup-guide.ps1** - Service startup instructions
- **DISK_SPACE_NOTICE.md** - Disk space solutions

See these files for detailed information on any topic.
