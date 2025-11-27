# Supabase Connection - Quick Reference

## Status: ✅ CONFIGURED

### Credentials Added
- ✅ Database URL (PostgreSQL connection)
- ✅ Supabase URL
- ✅ Anon Key (public, safe for browsers)
- ✅ Service Role Key (server-side operations)

### Files Created
1. **lib/supabase.ts** - Supabase client initialization
2. **lib/db-operations.ts** - CRUD operations for all models
3. **sql/schema.sql** - Database schema (ready to run)
4. **app/api/db/health/route.ts** - Health check endpoint
5. **app/api/db/patients/route.ts** - Patient CRUD endpoints
6. **app/api/db/patients/[id]/route.ts** - Patient detail endpoints

### Tables Ready (in sql/schema.sql)
- patients
- hospitals
- banks
- assets
- health_tokens
- minting_requests
- transactions
- insurance_policies
- insurance_claims
- trades
- benefit_distributions

## Quick Start

### 1. Run Schema in Supabase
```
Go to: https://bvjphekkgeoclhyguikl.supabase.co/projects
→ SQL Editor
→ Create New Query
→ Copy sql/schema.sql content
→ Run
```

### 2. Test Connection
```bash
curl http://localhost:3000/api/db/health
```

### 3. Use in Code
```typescript
import { PatientDB } from '@/lib/db-operations';

const patients = await PatientDB.getAll();
const patient = await PatientDB.getById('id');
const newPatient = await PatientDB.create({ name, email, ... });
```

## Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://bvjphekkgeoclhyguikl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:m3Slh7oAt1BiFQIf@db.bvjphekkgeoclhyguikl.supabase.co:5432/postgres
```

## API Endpoints Available

### Health Check
```
GET /api/db/health
Response: { status: 'success', message: '...', timestamp: '...' }
```

### Patients
```
GET    /api/db/patients           → List all
POST   /api/db/patients           → Create
GET    /api/db/patients/[id]      → Get one
PUT    /api/db/patients/[id]      → Update
DELETE /api/db/patients/[id]      → Delete
```

## Database Models Available

### PatientDB
- getAll()
- getById(id)
- create(data)
- update(id, data)
- delete(id)

### HospitalDB
- getAll()
- getById(id)
- create(data)
- update(id, data)

### BankDB
- getAll()
- getById(id)
- create(data)

### MintingRequestDB
- getAll(filters)
- getById(id)
- create(data)
- update(id, data)

### TransactionDB
- getAll()
- getById(id)
- getByUserId(userId)
- create(data)

### AssetDB
- getAll()
- getById(id)
- getByPatientId(patientId)
- create(data)
- update(id, data)

## Next Steps

1. Run `sql/schema.sql` in Supabase SQL Editor
2. Test with `GET /api/db/health`
3. Configure RLS policies in Supabase
4. Start using database operations in screens

## Support Documentation
See `DATABASE_SETUP.md` for complete guide
