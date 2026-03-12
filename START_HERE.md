# 🚀 Blockchain Hospital - Complete Setup & Run Guide

## ⚡ QUICK START (Do This Now)

### Start Hardhat Ethereum Node
```powershell
cd C:\Users\850 G5\fyp-blockchain-hospital
npx hardhat node
```

This starts your local Ethereum network at `http://localhost:8545`

### In Another Terminal - Compile Smart Contracts
```powershell
cd C:\Users\850 G5\fyp-blockchain-hospital
npx hardhat compile
```

---

## 📋 Setup Files Created For You

| File | Purpose |
|------|---------|
| **SETUP_COMPLETE.md** | ✅ Current status and what works right now |
| **RUN_GUIDE.md** | 📖 Complete operational guide for all components |
| **DISK_SPACE_NOTICE.md** | ⚠️ Disk space solutions and alternatives |
| **quick-start.ps1** | ⚡ Easy way to start individual components |
| **setup.ps1** | 📦 Automated installer (run when you have disk space) |
| **startup-guide.ps1** | 📝 Instructions for multi-terminal setup |

---

## 🎯 What Works Right Now

✅ **Smart Contract Development**
```powershell
npx hardhat compile       # Compile contracts
npx hardhat test          # Run tests
npx hardhat node          # Start local blockchain
```

✅ **Ethereum Environment**
- Hardhat installed: v3.0.9
- Ethers.js installed: v6.15.0
- OpenZeppelin contracts: v5.0.0
- TypeScript support: ready

---

## ⚠️ Current Limitation

**Your C drive has only 0.68 GB free** - this prevents installing:
- Next.js Frontend (~800 MB)
- Spring Boot Backend Services (~500-1500 MB)

**To continue:** Free up 5-10 GB of disk space

---

## 🛠️ How to Free Disk Space

### Option A: Clean Up Windows (2-5 GB)
1. Delete `C:\Windows\Temp\*`
2. Empty Recycle Bin
3. Uninstall unused programs

### Option B: Move Project to Another Drive
```powershell
# If you have D: or E: drive with space
Move-Item "C:\Users\850 G5\fyp-blockchain-hospital" "D:\fyp-blockchain-hospital"
```

### Option C: Check Disk Space Now
```powershell
Get-Volume | Where-Object {$_.DriveLetter -eq 'C'} | Select-Object `
  @{Name='Size(GB)'; Expression={[math]::Round($_.Size/1GB,2)}}, `
  @{Name='Free(GB)'; Expression={[math]::Round($_.SizeRemaining/1GB,2)}}
```

---

## 📦 Next Steps (After Freeing Space)

### 1. Install Frontend
```powershell
cd hospital-frontend
npm install
npm run dev
```
Runs at: **http://localhost:3000**

### 2. Install Backend Services
```powershell
# Bank Service
cd backend/bank-service
mvn clean install
mvn spring-boot:run

# Hospital Service
cd backend/hospital-service
mvn clean install
mvn spring-boot:run

# Patient Service
cd backend/patient-service
mvn clean install
mvn spring-boot:run
```

Ports:
- Bank: 8080
- Hospital: 8081
- Patient: 8082

### 3. Full Multi-Service Setup
Run this in separate terminals:
1. `npx hardhat node` - Ethereum
2. Bank service - `mvn spring-boot:run`
3. Hospital service - `mvn spring-boot:run`
4. Patient service - `mvn spring-boot:run`
5. `npm run dev` - Frontend

---

## 🏗️ Architecture

```
Frontend (Next.js, Port 3000)
    ↓
Smart Contracts (Hardhat, Port 8545)
    ↓
Backend Services:
  ├─ Bank Service (Port 8080)
  ├─ Hospital Service (Port 8081)
  └─ Patient Service (Port 8082)
    ↓
Database & Services:
  ├─ PostgreSQL
  ├─ Redis
  └─ Kafka
```

---

## 🔧 Useful Commands

### Quick Start Individual Components
```powershell
# Using quick-start.ps1 (after making it executable)
.\quick-start.ps1 -Component node      # Start Hardhat
.\quick-start.ps1 -Component contracts # Compile contracts
.\quick-start.ps1 -Component frontend  # Start frontend
.\quick-start.ps1 -Component bank      # Start bank service
```

### Smart Contracts
```powershell
npx hardhat compile              # Compile
npx hardhat test                 # Run tests
npx hardhat node                 # Start local blockchain
npx hardhat ignition deploy ignition/modules/Counter.ts  # Deploy
```

### Frontend
```powershell
cd hospital-frontend
npm run dev        # Development
npm run build      # Build for production
npm start          # Run production build
npm run lint       # Lint code
```

### Backend (repeat for each service)
```powershell
cd backend/SERVICE_NAME
mvn clean install           # Build
mvn spring-boot:run         # Run
mvn test                    # Run tests
mvn clean                   # Clean build artifacts
```

---

## 📂 Project Structure

```
fyp-blockchain-hospital/
├── contracts/                 # Smart contracts (.sol)
│   ├── AssetToken.sol
│   ├── HealthToken.sol
│   ├── HospitalFinancials.sol
│   └── Counter.sol
├── ignition/modules/          # Deployment scripts
├── test/                      # Contract tests
├── hospital-frontend/         # Next.js React app
│   ├── app/                   # Pages and API routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities (Web3, Supabase)
│   └── types/                 # TypeScript types
├── backend/                   # Spring Boot services
│   ├── bank-service/
│   ├── hospital-service/
│   └── patient-service/
├── artifacts/                 # Compiled contracts
├── scripts/                   # Deployment scripts
└── README files              # Documentation
```

---

## 🔗 Key Technologies

| Component | Technology | Version |
|-----------|-----------|---------|
| Smart Contracts | Solidity | 0.8.28 |
| Blockchain | Ethereum (Hardhat) | - |
| Blockchain Library | Ethers.js | 6.15.0 |
| Frontend | Next.js | 14.2.33 |
| Frontend Framework | React | 18.2.0 |
| Database | PostgreSQL | - |
| Cache | Redis | - |
| Message Queue | Kafka | - |
| Backend | Spring Boot | 3.5.8 |
| Language | Java | 21 |
| Build Tool | Maven | 3.6+ |

---

## 🆘 Troubleshooting

### Node modules not found
```powershell
rm -r node_modules package-lock.json
npm install
```

### Port already in use
Kill process and retry:
```powershell
# Find and kill process on port
Get-NetTCPConnection -LocalPort 8545 | Stop-Process -Force
```

### Smart contracts won't compile
```powershell
rm -r artifacts cache
npx hardhat compile
```

### Backend won't start
1. Check Java 21 is installed: `java -version`
2. Check PostgreSQL is running
3. Update dependencies: `mvn clean install -U`

### Out of disk space
See **DISK_SPACE_NOTICE.md** for solutions

---

## 📖 Documentation Files

- **SETUP_COMPLETE.md** - Full installation status
- **RUN_GUIDE.md** - Detailed operational guide
- **DISK_SPACE_NOTICE.md** - Disk space troubleshooting
- **hardhat.config.ts** - Smart contract configuration
- Original project docs in `hospital-frontend/` directory

---

## ✨ Now You Can:

✅ Compile smart contracts
✅ Run tests
✅ Start Hardhat Ethereum node
✅ Develop smart contracts locally

❌ Start frontend (needs disk space)
❌ Run backend services (needs disk space)

---

## 🚀 Get Started

1. **Right now:** Free up 5-10 GB of disk space
2. **Then:** Run `npm install` in `hospital-frontend/`
3. **Then:** Run backend services with `mvn spring-boot:run`
4. **Finally:** Start the full application stack

---

**For detailed information, see the other documentation files in this repository.**
