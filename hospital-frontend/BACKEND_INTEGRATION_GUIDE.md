# Backend Integration Guide

## Overview
The backend is fully connected to Supabase PostgreSQL database through service layers that handle all data operations.

## Service Layers Architecture

```
Frontend Screens
       ↓
Service Layer (authService, patientService, hospitalService, bankService)
       ↓
Database Operations (lib/db-operations.ts)
       ↓
Supabase Client (lib/supabase.ts)
       ↓
PostgreSQL (Supabase)
```

## Available Services

### 1. Authentication Service (`authService`)

**Location**: `lib/services/auth-service.ts`

**Methods**:
- `register(data)` - Register new user
- `login(credentials)` - Authenticate user
- `getUserById(id)` - Get user info
- `updateProfile(id, updates)` - Update user profile
- `logout(userId)` - End user session

**Usage**:
```typescript
import { authService } from '@/lib/services';

// Register
const user = await authService.register({
  email: 'user@example.com',
  password: 'secure_password',
  name: 'John Doe',
  role: 'PATIENT',
  wallet_address: '0x...',
});

// Login
const user = await authService.login({
  email: 'user@example.com',
  password: 'secure_password',
});

// Logout
await authService.logout(userId);
```

### 2. Patient Service (`patientService`)

**Location**: `lib/services/patient-service.ts`

**Methods**:
- `getOrCreateProfile(userId)` - Get or create patient profile
- `updateProfile(userId, updates)` - Update patient info
- `getAssets(patientId)` - List patient assets
- `depositAsset(patientId, data)` - Deposit new asset
- `getTokens(patientId)` - Get minted health tokens
- `getRedemptions(patientId)` - Get benefit redemptions
- `redeemBenefit(patientId, benefit_type, amount)` - Redeem benefits
- `getDashboardStats(patientId)` - Get dashboard statistics

**Usage**:
```typescript
import { patientService } from '@/lib/services';

// Get profile
const profile = await patientService.getOrCreateProfile(userId);

// Deposit asset
const deposit = await patientService.depositAsset(patientId, {
  asset_type: 'GOLD_JEWELRY',
  quantity: 100,
  unit: 'grams',
  estimated_value: 5000,
  description: 'Gold necklace',
});

// Get dashboard stats
const stats = await patientService.getDashboardStats(patientId);
// Returns: { totalAssets, activeTokens, benefitsRedeemed, pendingApprovals }
```

### 3. Hospital Service (`hospitalService`)

**Location**: `lib/services/hospital-service.ts`

**Methods**:
- `getHospitalInfo(userId)` - Get hospital details
- `getPatients(hospitalId)` - List hospital patients
- `getAssetRequests(hospitalId, status)` - Get asset requests
- `approveAssetRequest(requestId, notes)` - Approve request
- `rejectAssetRequest(requestId, reason)` - Reject request
- `createTrade(hospitalId, tradeData)` - Create trade record
- `getTrades(hospitalId)` - List hospital trades
- `allocateBenefits(hospitalId, allocationData)` - Allocate benefits
- `getDashboardStats(hospitalId)` - Get dashboard statistics

**Usage**:
```typescript
import { hospitalService } from '@/lib/services';

// Get hospital info
const hospital = await hospitalService.getHospitalInfo(userId);

// Get pending requests
const requests = await hospitalService.getAssetRequests(hospitalId, 'PENDING');

// Approve asset request
const approved = await hospitalService.approveAssetRequest(requestId, 'Approved by Dr. Smith');

// Create trade
const trade = await hospitalService.createTrade(hospitalId, {
  asset_id: 'asset-uuid',
  quantity: 100,
  price_per_unit: 50,
  total_value: 5000,
  status: 'ACTIVE',
});
```

### 4. Bank Service (`bankService`)

**Location**: `lib/services/bank-service.ts`

**Methods**:
- `getBankStaffInfo(userId)` - Get bank staff details
- `getMintingRequests(status)` - Get minting requests
- `verifyAsset(depositId, verificationData, verifiedById)` - Verify asset
- `approveMinting(verificationId, approvedById)` - Approve minting
- `rejectMinting(verificationId, reason)` - Reject minting
- `getTokenLedger()` - Get token ledger
- `getInsurancePolicies(status)` - Get insurance policies
- `getInsuranceClaims(status)` - Get insurance claims
- `createInsurancePolicy(policyData)` - Create policy
- `getDashboardStats()` - Get dashboard statistics

**Usage**:
```typescript
import { bankService } from '@/lib/services';

// Get pending minting requests
const requests = await bankService.getMintingRequests('PENDING');

// Verify asset
const verification = await bankService.verifyAsset(depositId, {
  verified_value: 5000,
  tokens_to_mint: 5000,
  notes: 'Gold verified at 99.9% purity',
  ipfs_hash: 'QmXxxx...',
}, bankStaffId);

// Approve minting
const approved = await bankService.approveMinting(verificationId, approvedById);

// Get insurance policies
const policies = await bankService.getInsurancePolicies('ACTIVE');
```

## Integration with Screens

### Patient Screens

**Login Screen** (`app/patients/login/page.tsx`)
```typescript
import { authService } from '@/lib/services';

const user = await authService.login({ email, password });
const profile = await patientService.getOrCreateProfile(user.id);
```

**Dashboard** (`app/patients/page.tsx`)
```typescript
import { patientService } from '@/lib/services';

const stats = await patientService.getDashboardStats(patientId);
const assets = await patientService.getAssets(patientId);
const tokens = await patientService.getTokens(patientId);
```

**Assets Screen** (`app/patients/assets/page.tsx`)
```typescript
const assets = await patientService.getAssets(patientId);
// Display in table with status, value, type
```

**Deposit Screen** (`app/patients/deposit/page.tsx`)
```typescript
const deposit = await patientService.depositAsset(patientId, {
  asset_type: selectedType,
  quantity: quantity,
  unit: unit,
  estimated_value: value,
  description: description,
});
```

**Tokens Screen** (`app/patients/tokens/page.tsx`)
```typescript
const tokens = await patientService.getTokens(patientId);
// Display token balance, transaction history
```

**Redeem Screen** (`app/patients/redeem/page.tsx`)
```typescript
const redemption = await patientService.redeemBenefit(
  patientId,
  benefitType,
  amount,
  notes
);
```

### Hospital Screens

**Dashboard** (`app/hospital/page.tsx`)
```typescript
import { hospitalService } from '@/lib/services';

const stats = await hospitalService.getDashboardStats(hospitalId);
const patients = await hospitalService.getPatients(hospitalId);
const pendingRequests = await hospitalService.getAssetRequests(hospitalId, 'PENDING');
```

**Patients Screen** (`app/hospital/patients/page.tsx`)
```typescript
const patients = await hospitalService.getPatients(hospitalId);
// Display with approval status
```

**Asset Requests** (`app/hospital/requests/page.tsx`)
```typescript
const requests = await hospitalService.getAssetRequests(hospitalId, 'PENDING');

// Approve
await hospitalService.approveAssetRequest(requestId, notes);

// Reject
await hospitalService.rejectAssetRequest(requestId, reason);
```

**Trading Screen** (`app/hospital/trading/page.tsx`)
```typescript
const trades = await hospitalService.getTrades(hospitalId);

// Create trade
const newTrade = await hospitalService.createTrade(hospitalId, {
  asset_id,
  quantity,
  price_per_unit,
  total_value,
  status: 'ACTIVE',
});
```

**Benefit Allocation** (`app/hospital/allocate/page.tsx`)
```typescript
const allocation = await hospitalService.allocateBenefits(hospitalId, {
  total_amount: amount,
  distribution_date: date,
});
```

### Bank Screens

**Dashboard** (`app/bank/page.tsx`)
```typescript
import { bankService } from '@/lib/services';

const stats = await bankService.getDashboardStats();
const mintingRequests = await bankService.getMintingRequests('PENDING');
const policies = await bankService.getInsurancePolicies('ACTIVE');
```

**Minting Screen** (`app/bank/minting/page.tsx`)
```typescript
const requests = await bankService.getMintingRequests();

// Verify asset
const verification = await bankService.verifyAsset(depositId, verData, staffId);

// Approve
await bankService.approveMinting(verificationId, approvedById);

// Reject
await bankService.rejectMinting(verificationId, reason);
```

**Ledger Screen** (`app/bank/ledger/page.tsx`)
```typescript
const ledger = await bankService.getTokenLedger();
// Display all token holders and balances
```

**Insurance Screen** (`app/bank/insurance/page.tsx`)
```typescript
const policies = await bankService.getInsurancePolicies();
const claims = await bankService.getInsuranceClaims();

// Create policy
const policy = await bankService.createInsurancePolicy(policyData);
```

## Database Tables Used

### Core Tables
- **users** - All user accounts (patients, hospital staff, bank staff)
- **patients** - Patient-specific data
- **hospitals** - Hospital information
- **bank_staff** - Bank employee data
- **hospital_staff** - Hospital employee data

### Asset & Minting
- **asset_deposits** - Patient asset deposits
- **asset_verifications** - Verification records
- **asset_tokens** - Minted tokens

### Transactions
- **benefit_redemptions** - Patient benefit redemptions
- **benefit_allocations** - Hospital benefit allocations
- **trades** - Hospital trading records

### Insurance
- **insurance_policies** - Hospital insurance policies
- **insurance_claims** - Insurance claims

## Error Handling

All services include try-catch blocks and return meaningful error messages:

```typescript
try {
  const user = await authService.login(credentials);
} catch (error) {
  console.error('Login failed:', error.message);
  // Display error to user
}
```

## Data Flow Example: Asset Deposit

1. **Patient deposits asset**
   ```
   Patient Screen → patientService.depositAsset()
   → Supabase asset_deposits table
   ```

2. **Hospital reviews request**
   ```
   Hospital → hospitalService.getAssetRequests()
   → Display in UI
   → approveAssetRequest() or rejectAssetRequest()
   ```

3. **Bank verifies and mints**
   ```
   Bank → bankService.getMintingRequests()
   → verifyAsset() → approveMinting()
   → Tokens created in asset_tokens table
   ```

4. **Patient receives tokens**
   ```
   Patient → patientService.getTokens()
   → Display in Tokens screen
   ```

## Real-Time Updates

Services are ready for real-time Supabase subscriptions:

```typescript
import { supabase } from '@/lib/supabase';

// Subscribe to changes
supabase
  .from('asset_deposits')
  .on('*', payload => {
    console.log('Asset changed:', payload);
  })
  .subscribe();
```

## Status: ✅ COMPLETE

All service layers are implemented and ready to integrate with frontend screens.

**Next Steps**:
1. Update screen components to use services
2. Add real-time subscriptions
3. Implement error handling UI
4. Add data validation
5. Test end-to-end flows
