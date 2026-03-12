# Signup Procedure Testing Guide

## Quick Test Summary

This guide provides step-by-step instructions to test the automatic patient record creation on signup.

---

## Test Environment Setup

### Prerequisites
- Supabase project with procedures deployed
- Backend server running on `http://localhost:8000`
- Access to Supabase SQL editor or psql tool
- HTTP client (Postman, curl, or similar)

### Database Connection Info
```
Host: your-project.supabase.co
Port: 5432
Database: postgres
User: postgres
```

---

## Test 1: Verify Procedures Deployed

### Objective
Confirm that stored procedures were successfully created in the database.

### Steps

1. **Connect to Supabase**
   ```bash
   # Using psql
   psql -h your-project.supabase.co -U postgres -d postgres
   
   # Or use Supabase SQL Editor web interface
   # Navigate to: SQL Editor → New Query
   ```

2. **List all procedures**
   ```sql
   SELECT 
       routine_name,
       routine_schema,
       data_type
   FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name LIKE 'usp_%'
   ORDER BY routine_name;
   ```

3. **Expected Result**
   ```
   routine_name                    | routine_schema | data_type
   ─────────────────────────────────────────────────────────────
   usp_create_patient_record       | public         | void
   usp_handle_user_signup          | public         | void
   (2 rows)
   ```

### Success Criteria
✅ Both procedures listed  
✅ Return type is `void` (procedures, not functions)  
✅ No errors in schema

---

## Test 2: Test Procedure Directly

### Objective
Call the procedures directly to verify they work in isolation.

### Steps

1. **Create a test user first** (if not using signup)
   ```sql
   -- First, ensure patient role exists
   INSERT INTO public.roles (role_name) 
   VALUES ('patient') 
   ON CONFLICT DO NOTHING;

   -- Get role_id
   SELECT role_id FROM public.roles WHERE role_name = 'patient';
   -- Note the UUID (we'll call it ROLE_ID)

   -- Create test user
   INSERT INTO public.users (
       role_id, 
       name, 
       email, 
       password_hash, 
       phone_num, 
       status
   ) VALUES (
       'ROLE_ID',  -- Replace with actual role_id
       'Test User',
       'test.procedure@example.com',
       'hashedpassword',
       '+92 300 1234567',
       'ACTIVE'
   ) RETURNING user_id;
   -- Note the UUID (we'll call it USER_ID)
   ```

2. **Call the patient record creation procedure**
   ```sql
   CALL public.usp_create_patient_record('USER_ID'::uuid);
   -- Replace USER_ID with the actual UUID from above
   ```

3. **Verify patient record was created**
   ```sql
   SELECT 
       id,
       user_id,
       registration_id,
       kyc_status,
       has_asset,
       has_subscription
   FROM public.patients
   WHERE user_id = 'USER_ID'::uuid;
   ```

4. **Expected Result**
   ```
   id                       | user_id                  | registration_id | kyc_status | has_asset | has_subscription
   ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
   [UUID]                   | [USER_ID]                | LNH-2026-[XXXX] | PENDING    | false     | false
   (1 row)
   ```

5. **Verify KYC record was created**
   ```sql
   SELECT 
       kyc_id,
       patient_id,
       completion_percentage,
       submitted_at
   FROM public.kyc
   WHERE patient_id = (SELECT id FROM public.patients WHERE user_id = 'USER_ID'::uuid);
   ```

6. **Expected Result**
   ```
   kyc_id               | patient_id           | completion_percentage | submitted_at
   ────────────────────────────────────────────────────────────────────────────────
   [UUID]               | [PATIENT_ID]         | 0                     | NULL
   (1 row)
   ```

7. **Check activity logs**
   ```sql
   SELECT 
       activity_id,
       user_id,
       activity_name,
       description,
       type,
       timestamp
   FROM public.activity
   WHERE user_id = 'USER_ID'::uuid
   ORDER BY timestamp DESC
   LIMIT 5;
   ```

8. **Expected Result**
   ```
   activity_id | user_id    | activity_name    | description                    | type   | timestamp
   ────────────────────────────────────────────────────────────────────────────────────────────────
   [...]       | [USER_ID]  | Patient Signup   | Patient record created...      | ACTION | [timestamp]
   (1+ rows)
   ```

### Success Criteria
✅ Patient record created with correct details  
✅ Registration ID generated in LNH-YYYY-XXXXX format  
✅ KYC status set to PENDING  
✅ Activity logged  
✅ No SQL errors  

---

## Test 3: Test Complete Signup Flow

### Objective
Test the complete signup process from frontend to database record creation.

### Steps

1. **Prepare test data**
   ```json
   {
     "name": "Patient Test User",
     "email": "patient.test.2026@example.com",
     "password": "TestPassword123!",
     "phoneNum": "+92 300 5555555",
     "address": "123 Test Street",
     "city": "Karachi",
     "bloodGroup": "B+",
     "dateOfBirth": "1990-01-15",
     "role": "patient"
   }
   ```

2. **Send signup request using curl**
   ```bash
   curl -X POST http://localhost:8000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Patient Test User",
       "email": "patient.test.2026@example.com",
       "password": "TestPassword123!",
       "phoneNum": "+92 300 5555555",
       "address": "123 Test Street",
       "city": "Karachi",
       "bloodGroup": "B+",
       "dateOfBirth": "1990-01-15",
       "role": "patient"
     }' \
     | jq .
   ```

   **Or using Postman:**
   - Method: POST
   - URL: `http://localhost:8000/api/auth/signup`
   - Headers: `Content-Type: application/json`
   - Body: [JSON from above]
   - Click Send

3. **Verify response**
   ```json
   {
     "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
     "name": "Patient Test User",
     "email": "patient.test.2026@example.com",
     "role": "PATIENT",
     "token": "eyJhbGc...",
     "success": true,
     "phoneNum": "+92 300 5555555",
     "address": "123 Test Street",
     "city": "Karachi",
     "bloodGroup": "B+",
     "dateOfBirth": "1990-01-15"
   }
   ```

   **Success criteria:**
   - ✅ status: 200 OK
   - ✅ success: true
   - ✅ Response includes JWT token
   - ✅ All user data returned

4. **Note the userId from response** (we'll use it for verification)

### Success Criteria
✅ Response status 200 OK  
✅ Response contains JWT token  
✅ No error messages  

---

## Test 4: Verify Database Records Created

### Objective
Confirm all expected records were created automatically.

### Steps

1. **Verify user record**
   ```sql
   SELECT 
       user_id,
       role_id,
       name,
       email,
       status,
       created_at
   FROM public.users
   WHERE email = 'patient.test.2026@example.com';
   ```

   **Expected Result**
   ```
   user_id              | name                | email                        | status | created_at
   ──────────────────────────────────────────────────────────────────────────────────────────
   [UUID]               | Patient Test User   | patient.test.2026@example.com| ACTIVE | [timestamp]
   ```

   ✅ **Success**: User exists with correct details

2. **Verify patient record**
   ```sql
   SELECT 
       id as patient_id,
       user_id,
       registration_id,
       kyc_status,
       has_asset,
       has_subscription,
       wallet_address,
       hospital_id,
       created_at
   FROM public.patients
   WHERE user_id = (SELECT user_id FROM public.users WHERE email = 'patient.test.2026@example.com');
   ```

   **Expected Result**
   ```
   patient_id           | registration_id | kyc_status | has_asset | has_subscription | wallet_address | hospital_id
   ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   [UUID]               | LNH-2026-[XXXX] | PENDING    | false     | false            | NULL           | NULL
   ```

   ✅ **Success**: Patient record created with correct defaults

3. **Verify KYC record**
   ```sql
   SELECT 
       kyc_id,
       patient_id,
       completion_percentage,
       submitted_at,
       created_at
   FROM public.kyc
   WHERE patient_id = (
       SELECT id FROM public.patients 
       WHERE user_id = (SELECT user_id FROM public.users WHERE email = 'patient.test.2026@example.com')
   );
   ```

   **Expected Result**
   ```
   kyc_id               | completion_percentage | submitted_at
   ───────────────────────────────────────────────────────────
   [UUID]               | 0                     | NULL
   ```

   ✅ **Success**: KYC record initialized with 0% completion

4. **Verify settings record**
   ```sql
   SELECT 
       setting_id,
       user_id,
       multi_factor_enabled,
       email_verified,
       notification_enabled,
       created_at
   FROM public.settings
   WHERE user_id = (SELECT user_id FROM public.users WHERE email = 'patient.test.2026@example.com');
   ```

   **Expected Result**
   ```
   setting_id           | multi_factor_enabled | email_verified | notification_enabled
   ──────────────────────────────────────────────────────────────────────────────────
   [UUID]               | false                | false          | true
   ```

   ✅ **Success**: Settings created with expected defaults

5. **Verify activity logs**
   ```sql
   SELECT 
       activity_id,
       activity_name,
       description,
       type,
       status,
       timestamp
   FROM public.activity
   WHERE user_id = (SELECT user_id FROM public.users WHERE email = 'patient.test.2026@example.com')
   ORDER BY timestamp DESC;
   ```

   **Expected Result**
   ```
   activity_id | activity_name       | description                           | type
   ──────────────────────────────────────────────────────────────────────────────
   [UUID]      | Patient Signup      | Patient record created automatically... | ACTION
   [UUID]      | User Signup         | User signed up with role: patient      | ACTION
   (2+ rows)
   ```

   ✅ **Success**: Activities logged for audit trail

---

## Test 5: Test Error Scenarios

### 5.1 Signup with Non-Patient Role

**Objective**: Verify patient records aren't created for other roles

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin.test@example.com",
    "password": "TestPassword123!",
    "role": "admin"
  }'
```

**Verification**
```sql
-- Should NOT have a patient record
SELECT * FROM public.patients 
WHERE user_id = (SELECT user_id FROM public.users WHERE email = 'admin.test@example.com');

-- Result: (0 rows) ✅
```

### 5.2 Signup with Duplicate Email

**Objective**: Verify duplicate email rejection works

```bash
# First signup succeeds
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "First User",
    "email": "duplicate@example.com",
    "password": "TestPassword123!",
    "role": "patient"
  }'

# Second signup with same email should fail
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Second User",
    "email": "duplicate@example.com",
    "password": "TestPassword123!",
    "role": "patient"
  }'
```

**Expected Response**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

✅ **Success**: Duplicate email rejected with 400 status

### 5.3 Signup with Invalid Role

**Objective**: Verify invalid role handling

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bad Role User",
    "email": "badrole@example.com",
    "password": "TestPassword123!",
    "role": "invalid_role"
  }'
```

**Expected Response**
```json
{
  "success": false,
  "message": "Invalid role: invalid_role"
}
```

✅ **Success**: Invalid role rejected

---

## Test 6: Performance Testing

### Objective
Measure signup time with automatic record creation

### Steps

```bash
# Create a script to time the signup
time curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Performance Test User",
    "email": "perf.test.'$(date +%s)'@example.com",
    "password": "TestPassword123!",
    "role": "patient"
  }'
```

### Expected Result
- **Total time**: 200-500ms
- **Backend processing**: 50-100ms
- **Procedure execution**: 50-100ms
- **Token generation**: 20-50ms

✅ **Success**: Signup completes in acceptable time

---

## Test Summary Report

Create a test summary document:

```markdown
# Signup Procedure Test Results

Date: [Current Date]
Tester: [Your Name]
Environment: [Dev/Staging/Production]

## Test Results

| Test | Status | Notes |
|------|--------|-------|
| Test 1: Procedures Deployed | ✅ PASS | Both procedures created |
| Test 2: Direct Procedure Call | ✅ PASS | Patient record created |
| Test 3: Complete Signup Flow | ✅ PASS | No errors, JWT generated |
| Test 4: Database Records | ✅ PASS | All 4 records created |
| Test 5: Error Scenarios | ✅ PASS | Invalid roles handled |
| Test 6: Performance | ✅ PASS | < 500ms total time |

## Records Verified
- ✅ users table: 1 record
- ✅ patients table: 1 record
- ✅ kyc table: 1 record
- ✅ settings table: 1 record
- ✅ activity table: 2+ records

## Conclusion
✅ All tests passed. System ready for production deployment.
```

---

## Cleanup After Testing

```sql
-- WARNING: Only run after testing is complete

-- Delete test activity logs
DELETE FROM public.activity 
WHERE user_id IN (
    SELECT user_id FROM public.users 
    WHERE email LIKE '%.test%' OR email LIKE '%.example.com%'
);

-- Delete test KYC records
DELETE FROM public.kyc 
WHERE patient_id IN (
    SELECT id FROM public.patients 
    WHERE user_id IN (
        SELECT user_id FROM public.users 
        WHERE email LIKE '%.test%'
    )
);

-- Delete test patient records
DELETE FROM public.patients 
WHERE user_id IN (
    SELECT user_id FROM public.users 
    WHERE email LIKE '%.test%'
);

-- Delete test settings records
DELETE FROM public.settings 
WHERE user_id IN (
    SELECT user_id FROM public.users 
    WHERE email LIKE '%.test%'
);

-- Delete test users
DELETE FROM public.users 
WHERE email LIKE '%.test%' OR email LIKE '%.example.com%';

-- Verify cleanup
SELECT COUNT(*) as remaining_test_records FROM public.users WHERE email LIKE '%.test%';
```

---

**Status**: ✅ Testing Guide Complete  
**Last Updated**: March 13, 2026  
**Version**: 1.0
