# 🚀 Backend Integration - Quick Start

## Setup Complete ✅

Your backend is fully connected to Supabase PostgreSQL. Here's what to do next.

## Step 1: Deploy Database Schema

Go to **Supabase Dashboard → SQL Editor** and run:
```sql
-- Copy & paste contents of: sql/schema.sql
-- Click "Run"
```

This creates 12+ tables with proper relationships and indexes.

## Step 2: Test Connection

```bash
curl http://localhost:3000/api/db/health
```

Expected response:
```json
{
  "status": "success",
  "message": "Supabase connection successful"
}
```

## Step 3: Start Using Services in Screens

### Quick Example: Patient Login

```typescript
// In app/patients/login/page.tsx
'use client';
import { authService, patientService } from '@/lib/services';

export default function PatientLogin() {
  const handleLogin = async (email: string, password: string) => {
    try {
      // Authenticate user
      const user = await authService.login({ email, password });
      
      // Create/get patient profile
      const profile = await patientService.getOrCreateProfile(user.id);
      
      // Get dashboard stats
      const stats = await patientService.getDashboardStats(profile.id);
      
      console.log('Logged in:', user.name);
      console.log('Assets:', stats.totalAssets);
      
      // Redirect to dashboard
      router.push('/patients');
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  return (
    // Your login form...
  );
}
```

### Quick Example: Patient Dashboard

```typescript
// In app/patients/page.tsx
'use client';
import { patientService } from '@/lib/services';

export default function PatientDashboard() {
  const [stats, setStats] = useState(null);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const user = getCurrentUser(); // Get from localStorage
      
      // Fetch stats
      const dashboardStats = await patientService.getDashboardStats(user.id);
      setStats(dashboardStats);
      
      // Fetch assets
      const patientAssets = await patientService.getAssets(user.id);
      setAssets(patientAssets);
    };

    loadData();
  }, []);

  return (
    <div>
      <StatCard label="Total Assets" value={stats?.totalAssets} />
      <DataTable columns={[...]} rows={assets} />
    </div>
  );
}
```

### Quick Example: Patient Asset Deposit

```typescript
// In app/patients/deposit/page.tsx
const handleDeposit = async (formData: any) => {
  try {
    const user = getCurrentUser();
    
    const deposit = await patientService.depositAsset(user.id, {
      asset_type: formData.assetType,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      estimated_value: parseFloat(formData.value),
      description: formData.description,
    });

    console.log('Asset deposited:', deposit.id);
    alert('Asset deposit submitted for verification!');
  } catch (error) {
    console.error('Deposit failed:', error.message);
  }
};
```

### Quick Example: Hospital Dashboard

```typescript
// In app/hospital/page.tsx
'use client';
import { hospitalService } from '@/lib/services';

export default function HospitalDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const user = getCurrentUser();
      const hospital = await hospitalService.getHospitalInfo(user.id);
      
      const stats = await hospitalService.getDashboardStats(hospital.id);
      setStats(stats);
      
      const requests = await hospitalService.getAssetRequests(hospital.id, 'PENDING');
      setPendingRequests(requests);
    };

    loadData();
  }, []);

  return (
    <div>
      <StatCard label="Active Patients" value={stats?.activePatients} />
      <DataTable columns={[...]} rows={pendingRequests} />
    </div>
  );
}
```

### Quick Example: Hospital Approve Request

```typescript
const handleApprove = async (requestId: string) => {
  try {
    const user = getCurrentUser();
    const hospital = await hospitalService.getHospitalInfo(user.id);
    
    await hospitalService.approveAssetRequest(
      requestId,
      'Approved by ' + user.name
    );
    
    // Refresh requests
    const requests = await hospitalService.getAssetRequests(hospital.id, 'PENDING');
    setPendingRequests(requests);
  } catch (error) {
    console.error('Approval failed:', error.message);
  }
};
```

### Quick Example: Bank Minting Verification

```typescript
// In app/bank/minting/page.tsx
const handleVerify = async (depositId: string, verifiedValue: number) => {
  try {
    const user = getCurrentUser();
    const staff = await bankService.getBankStaffInfo(user.id);
    
    const verification = await bankService.verifyAsset(
      depositId,
      {
        verified_value: verifiedValue,
        tokens_to_mint: verifiedValue,
        notes: 'Verified by ' + user.name,
      },
      staff.id
    );
    
    console.log('Asset verified:', verification.id);
  } catch (error) {
    console.error('Verification failed:', error.message);
  }
};
```

### Quick Example: Bank Approve Minting

```typescript
const handleApproveMinting = async (verificationId: string) => {
  try {
    const user = getCurrentUser();
    
    const approved = await bankService.approveMinting(
      verificationId,
      user.id
    );
    
    console.log('Minting approved, tokens created!');
  } catch (error) {
    console.error('Approval failed:', error.message);
  }
};
```

## Available Services

| Service | Import | Purpose |
|---------|--------|---------|
| `authService` | `import { authService } from '@/lib/services'` | User authentication |
| `patientService` | `import { patientService } from '@/lib/services'` | Patient operations |
| `hospitalService` | `import { hospitalService } from '@/lib/services'` | Hospital operations |
| `bankService` | `import { bankService } from '@/lib/services'` | Bank operations |

## Service Methods Quick Reference

### authService
- `login(credentials)` - Login user
- `register(data)` - Register user
- `logout(userId)` - Logout user
- `getUserById(id)` - Get user info
- `updateProfile(id, updates)` - Update profile

### patientService
- `getOrCreateProfile(userId)` - Get/create profile
- `updateProfile(userId, updates)` - Update info
- `getAssets(patientId)` - List assets
- `depositAsset(patientId, data)` - Deposit asset
- `getTokens(patientId)` - Get tokens
- `getRedemptions(patientId)` - Get redemptions
- `redeemBenefit(...)` - Request benefits
- `getDashboardStats(patientId)` - Get stats

### hospitalService
- `getHospitalInfo(userId)` - Get hospital info
- `getPatients(hospitalId)` - List patients
- `getAssetRequests(hospitalId, status)` - Get requests
- `approveAssetRequest(requestId, notes)` - Approve
- `rejectAssetRequest(requestId, reason)` - Reject
- `createTrade(hospitalId, data)` - Create trade
- `getTrades(hospitalId)` - List trades
- `allocateBenefits(hospitalId, data)` - Allocate benefits
- `getDashboardStats(hospitalId)` - Get stats

### bankService
- `getBankStaffInfo(userId)` - Get staff info
- `getMintingRequests(status)` - Get requests
- `verifyAsset(depositId, data, staffId)` - Verify asset
- `approveMinting(verificationId, approvedById)` - Approve
- `rejectMinting(verificationId, reason)` - Reject
- `getTokenLedger()` - Get ledger
- `getInsurancePolicies(status)` - Get policies
- `getInsuranceClaims(status)` - Get claims
- `createInsurancePolicy(data)` - Create policy
- `getDashboardStats()` - Get stats

## Common Error Handling Pattern

```typescript
try {
  const result = await someService.method();
  // Use result
} catch (error) {
  console.error('Error:', error.message);
  setError(error.message);
  // Show error to user
}
```

## Testing with API Routes

### Test Health Check
```bash
curl http://localhost:3000/api/db/health
```

### Test Patient CRUD
```bash
# List patients
curl http://localhost:3000/api/db/patients

# Create patient
curl -X POST http://localhost:3000/api/db/patients \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'

# Get patient
curl http://localhost:3000/api/db/patients/[id]

# Update patient
curl -X PUT http://localhost:3000/api/db/patients/[id] \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane"}'
```

## Documentation

- **BACKEND_INTEGRATION_GUIDE.md** - Complete integration guide
- **BACKEND_CONNECTION_COMPLETE.md** - Architecture overview
- **DATABASE_SETUP.md** - Database documentation
- Service files have JSDoc comments

## Architecture Overview

```
User Login
    ↓
authService.login()
    ↓
Query users table
    ↓
Create session
    ↓
Redirect to dashboard
    ↓
patientService.getDashboardStats()
    ↓
Query asset_deposits, asset_tokens, etc.
    ↓
Display dashboard with data
    ↓
User deposits asset
    ↓
patientService.depositAsset()
    ↓
Insert into asset_deposits table
    ↓
Hospital reviews
    ↓
hospitalService.getAssetRequests()
    ↓
approveAssetRequest()
    ↓
Bank verifies & mints
    ↓
bankService.verifyAsset()
    ↓
bankService.approveMinting()
    ↓
Tokens created in asset_tokens
    ↓
Patient sees tokens
```

## Status: ✅ READY TO USE

All services are implemented, typed, and ready to integrate with screens.

**Next**: Update your screen components to import and use these services!

For detailed examples, see: `BACKEND_INTEGRATION_GUIDE.md`
