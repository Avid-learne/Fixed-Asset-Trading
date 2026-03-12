# Patient Signup Record Creation - Implementation Guide

## Overview

This implementation provides automatic record creation for patients when they sign up. The system uses stored procedures in Supabase/PostgreSQL to handle role-based record creation and ensure data consistency.

## Database Procedures

### 1. `usp_create_patient_record(p_user_id UUID)`

**Purpose**: Creates a patient record automatically when a patient user signs up.

**What it does**:
- Verifies the user has the 'patient' role
- Generates a unique registration ID (format: `LNH-YYYY-XXXXXXXX`)
- Creates a patient record in the `patients` table with default values:
  - `has_asset = false`
  - `has_subscription = false`
  - `kyc_status = 'PENDING'`
  - `wallet_address = NULL` (to be set later)
  - `hospital_id = NULL` (can be assigned later by hospital staff)
- Creates an initial KYC record with `completion_percentage = 0`
- Logs the signup activity to the activity log

### 2. `usp_handle_user_signup(p_user_id UUID, p_role VARCHAR)`

**Purpose**: Main dispatcher procedure for handling user signup based on role.

**What it does**:
- Routes signup processing based on user role
- Currently handles 'patient' role by calling `usp_create_patient_record`
- Can be extended in future for other roles (hospital_admin, hospital_staff, bank_staff, admin)
- Logs all signup attempts in the activity log

## Backend Integration

### Modified Files

**File**: `SehatVaultBackend/src/main/java/com/SehatVault/SehatVaultBackend/auth/service/AuthService.java`

**Changes**:
1. Added `callSignupProcedure()` method to execute the signup stored procedure
2. Integrated procedure call in the `signup()` method after user creation and settings initialization
3. Error handling: If procedure fails, signup still succeeds (user already created, procedure is non-blocking)

**Workflow**:
```
signup() method
  ↓
1. Validate request
2. Check email exists
3. Create User entity
4. Save user to database
5. Create default Settings
6. Call callSignupProcedure()  ← NEW
   ├── Calls usp_handle_user_signup(userId, role)
   ├── Procedure creates Patient record if role='patient'
   └── Procedure logs activity
7. Generate JWT token
8. Return AuthResponse
```

## Stored Procedure File

**Location**: `documentation/signup_procedures.sql`

**How to use**:
1. Connect to your Supabase database
2. Run all SQL statements in `signup_procedures.sql` to create the procedures
3. The procedures are now ready to be called by the backend

## Data Flow on Patient Signup

```
Frontend User Registration Form
           ↓
AuthController /api/auth/signup
           ↓
AuthService.signup()
           ↓
User Creation + Settings
           ↓
callSignupProcedure(userId, "patient")
           ↓
CALL usp_handle_user_signup(userId, "patient")
           ↓
CASE 'patient':
  CALL usp_create_patient_record(userId)
           ↓
Patient Record Created
  ├─ patients table entry
  ├─ kyc table entry
  └─ activity log entry
           ↓
JWT Generated + Response
```

## Database Changes

### New Tables (auto-created by procedures)

**patients** table gets populated with:
- `id`: Auto-generated UUID
- `user_id`: Link to user
- `registration_id`: Unique LNH-YYYY-XXXXX format
- `kyc_status`: PENDING (default)
- `has_asset`: false (default)
- `has_subscription`: false (default)
- `wallet_address`: NULL (set later)
- `hospital_id`: NULL (set by hospital staff)
- `created_at`: Current timestamp
- `updated_at`: Current timestamp

**kyc** table gets populated with:
- `patient_id`: Link to patient
- `completion_percentage`: 0 (default)
- `submitted_at`: NULL (filled when KYC submitted)

**activity** table gets entries for:
- Patient signup event
- Role-specific signup events

## Features

✅ **Automatic**: Patient records created automatically on signup
✅ **Role-Based**: Different handling for different user roles
✅ **Idempotent**: Checks if patient record already exists before creating
✅ **Logging**: All signup activities logged for audit trail
✅ **Error Handling**: Procedure failures don't block signup
✅ **Extensible**: Easy to add logic for other roles

## Testing

### 1. Test Patient Signup

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Test Patient",
  "email": "test.patient@example.com",
  "password": "password123",
  "phoneNum": "+92 300 1234567",
  "role": "patient"
}
```

**Expected Result**:
- User created in `users` table
- Patient record created in `patients` table
- KYC record created in `kyc` table
- Registration ID assigned
- Activity logged

### 2. Verify Patient Record Creation

```sql
-- Check user was created
SELECT * FROM public.users WHERE email = 'test.patient@example.com';

-- Check patient record was created
SELECT * FROM public.patients 
WHERE user_id = (SELECT user_id FROM public.users WHERE email = 'test.patient@example.com');

-- Check KYC record was created
SELECT * FROM public.kyc 
WHERE patient_id = (SELECT id FROM public.patients 
  WHERE user_id = (SELECT user_id FROM public.users WHERE email = 'test.patient@example.com'));

-- Check activity was logged
SELECT * FROM public.activity 
WHERE user_id = (SELECT user_id FROM public.users WHERE email = 'test.patient@example.com') 
ORDER BY timestamp DESC;
```

## Future Enhancements

1. **Hospital Admin Signup**:
   - Create hospital_admin record
   - Assign default hospital
   - Set permissions

2. **Hospital Staff Signup**:
   - Create staff record
   - Link to hospital
   - Assign department

3. **Bank Staff Signup**:
   - Create bank staff record
   - Assign bank
   - Set service scope

4. **Admin Signup**:
   - Create admin record
   - Set permissions
   - Enable audit access

## Troubleshooting

### "Procedure not found" error
- Ensure you've run `signup_procedures.sql` in your Supabase database
- Check procedure syntax: `CALL public.usp_handle_user_signup(?::uuid, ?::varchar)`

### Patient record not created after signup
- Check Supabase activity logs
- Verify user role is 'patient' in database
- Check if patient record already exists (idempotent protection)
- Review stored procedure logs in Supabase function logs

### Registration ID conflicts
- Ensure unique constraint on `patients.registration_id` exists
- Current format uses UUID substring which should be unique

## Configuration

No additional configuration needed. The system uses:
- Default hospital code: 'LNH' (Liaquat National Hospital)
- Default KYC status: 'PENDING'
- Default registration format: 'LNH-YYYY-XXXXXXXX'

To change these defaults, modify `signup_procedures.sql` before running it.
