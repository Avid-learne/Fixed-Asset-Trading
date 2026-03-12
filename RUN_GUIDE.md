# Running the Blockchain Hospital Repository

This repository consists of multiple components: Ethereum smart contracts, a Next.js frontend, and Spring Boot backend services.

## Prerequisites

- **Node.js**: v18+ (for smart contracts and frontend)
- **Java**: JDK 21+ (for Spring Boot services)
- **Maven**: 3.6+ (for backend services)
- **Git**: Latest version

## Quick Start

### 1. Install Ethereum Dependencies (Smart Contracts)

```powershell
# From root directory
npm install
```

This installs:
- Hardhat (Ethereum development environment)
- Ethers.js v6 (Ethereum library)
- OpenZeppelin contracts
- TypeScript and dev dependencies

### 2. Install Frontend Dependencies

```powershell
cd hospital-frontend
npm install
```

### 3. Install Backend Services

Each backend service uses Maven. Choose which services you need:

**Bank Service:**
```powershell
cd backend/bank-service
mvn clean install
```

**Hospital Service:**
```powershell
cd backend/hospital-service
mvn clean install
```

**Patient Service:**
```powershell
cd backend/patient-service
mvn clean install
```

---

## Running Components

### Smart Contracts (Hardhat + Ethers)

**Compile contracts:**
```powershell
npm run hardhat compile
```

**Deploy contracts:**
```powershell
npm run hardhat ignition deploy ignition/modules/Counter.ts
```

**Run tests:**
```powershell
npm run hardhat test
```

**Run local Hardhat node:**
```powershell
npm run hardhat node
```

### Frontend (Next.js)

**Development mode:**
```powershell
cd hospital-frontend
npm run dev
```
Runs at `http://localhost:3000`

**Production build:**
```powershell
cd hospital-frontend
npm run build
npm start
```

### Backend Services (Spring Boot)

**Bank Service:**
```powershell
cd backend/bank-service
mvn spring-boot:run
```

**Hospital Service:**
```powershell
cd backend/hospital-service
mvn spring-boot:run
```

**Patient Service:**
```powershell
cd backend/patient-service
mvn spring-boot:run
```

---

## Environment Setup

### Required Services

The backend requires:
- **PostgreSQL** database
- **Redis** cache
- **Kafka** message broker

### Database Setup

Create PostgreSQL database:
```sql
CREATE DATABASE blockchain_hospital;
```

### Configuration Files

Update application properties for each service in:
- `backend/bank-service/src/main/resources/application.properties`
- `backend/hospital-service/src/main/resources/application.properties`
- `backend/patient-service/src/main/resources/application.properties`

### Frontend Configuration

Configure Web3 and Supabase in:
- `hospital-frontend/lib/supabase.ts`
- `hospital-frontend/lib/web3/`

---

## Complete Startup Sequence

### Terminal 1 - Smart Contracts (Hardhat Node)
```powershell
npm run hardhat node
```

### Terminal 2 - Bank Service
```powershell
cd backend/bank-service
mvn spring-boot:run
```

### Terminal 3 - Hospital Service
```powershell
cd backend/hospital-service
mvn spring-boot:run
```

### Terminal 4 - Patient Service
```powershell
cd backend/patient-service
mvn spring-boot:run
```

### Terminal 5 - Frontend
```powershell
cd hospital-frontend
npm run dev
```

---

## Troubleshooting

### Node modules issues
```powershell
rm -r node_modules package-lock.json
npm install
```

### Maven build issues
```powershell
mvn clean install -U
```

### Port conflicts
- Frontend: 3000
- Hardhat: 8545
- Bank Service: 8080
- Hospital Service: 8081
- Patient Service: 8082

### Ethereum Issues
Ensure Hardhat node is running on port 8545 before running frontend transactions.

---

## Documentation

See additional documentation:
- `BACKEND_QUICK_START.md` - Backend setup guide
- `SUPABASE_QUICK_SETUP.md` - Database configuration
- `DATABASE_SETUP.md` - Database schema
- `hardhat.config.ts` - Smart contract configuration
