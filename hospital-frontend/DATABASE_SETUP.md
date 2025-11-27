# Supabase Database Setup Guide

## Overview
This project uses **Supabase PostgreSQL** as the primary database for storing patient, hospital, bank, and transaction data.

## Database Credentials
- **URL**: https://bvjphekkgeoclhyguikl.supabase.co
- **Anon Key**: Stored in `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Service Role Key**: Stored in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`
- **Database URL**: Connection string in `.env.local` as `DATABASE_URL`

## Setting Up the Database

### 1. Create Tables in Supabase

Go to **Supabase Dashboard** → **SQL Editor** and run the SQL schema:

```bash
# Copy the contents of sql/schema.sql
# Paste into Supabase SQL Editor
# Click "Run"
```

Or use the file: `sql/schema.sql`

### 2. Database Tables

The following tables are created:

- **patients** - Patient records with wallet addresses
- **hospitals** - Hospital information and licensing
- **banks** - Bank details and token issuance tracking
- **assets** - Patient assets for tokenization
- **health_tokens** - Minted health tokens
- **minting_requests** - Token minting requests
- **transactions** - All blockchain transactions
- **insurance_policies** - Hospital insurance policies
- **insurance_claims** - Insurance claims
- **trades** - Hospital asset trades
- **benefit_distributions** - Benefit distributions to patients

## API Endpoints

### Health Check
```
GET /api/db/health
```
Test Supabase connection status.

### Patients
```
GET /api/db/patients              # List all patients
POST /api/db/patients             # Create new patient
GET /api/db/patients/[id]         # Get patient by ID
PUT /api/db/patients/[id]         # Update patient
DELETE /api/db/patients/[id]      # Delete patient
```

## Using Database Operations

### In Client Components

```typescript
import { PatientDB } from '@/lib/db-operations';

// Get all patients
const patients = await PatientDB.getAll();

// Get patient by ID
const patient = await PatientDB.getById('patient-id');

// Create patient
const newPatient = await PatientDB.create({
  name: 'John Doe',
  email: 'john@example.com',
  address: '123 Main St',
  phone: '+1234567890',
});

// Update patient
const updated = await PatientDB.update('patient-id', {
  status: 'inactive',
});

// Delete patient
await PatientDB.delete('patient-id');
```

### Using API Routes

```typescript
// Fetch patients
const response = await fetch('/api/db/patients');
const { data } = await response.json();

// Create patient
const response = await fetch('/api/db/patients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
  }),
});
const { data } = await response.json();
```

## Database Operations Available

### PatientDB
- `getAll()` - Get all patients
- `getById(id)` - Get patient by ID
- `create(data)` - Create new patient
- `update(id, data)` - Update patient
- `delete(id)` - Delete patient

### HospitalDB
- `getAll()` - Get all hospitals
- `getById(id)` - Get hospital by ID
- `create(data)` - Create new hospital
- `update(id, data)` - Update hospital

### BankDB
- `getAll()` - Get all banks
- `getById(id)` - Get bank by ID
- `create(data)` - Create new bank

### MintingRequestDB
- `getAll(filters)` - Get minting requests (with optional status filter)
- `getById(id)` - Get request by ID
- `create(data)` - Create minting request
- `update(id, data)` - Update request

### TransactionDB
- `getAll()` - Get all transactions
- `getById(id)` - Get transaction by ID
- `getByUserId(userId)` - Get user's transactions
- `create(data)` - Create transaction

### AssetDB
- `getAll()` - Get all assets
- `getById(id)` - Get asset by ID
- `getByPatientId(patientId)` - Get patient's assets
- `create(data)` - Create asset
- `update(id, data)` - Update asset

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://bvjphekkgeoclhyguikl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
```

## Testing Connection

Run the health check:

```bash
curl http://localhost:3000/api/db/health
```

Expected response:
```json
{
  "status": "success",
  "message": "Supabase connection successful",
  "timestamp": "2025-11-27T12:00:00.000Z"
}
```

## Notes

- All database operations use **Supabase JavaScript client** (`@supabase/supabase-js`)
- Operations are **real-time enabled** - you can listen for changes
- **Row-Level Security (RLS)** policies should be configured in Supabase
- API routes handle errors gracefully with proper HTTP status codes
- All timestamps are automatically managed by the database

## Next Steps

1. ✅ Run `sql/schema.sql` in Supabase SQL Editor
2. ✅ Verify connection with `/api/db/health`
3. ✅ Create admin user accounts
4. ✅ Configure RLS policies for data access
5. ✅ Set up real-time subscriptions as needed
