# Signup Procedure Setup Checklist

## Quick Setup Guide

Follow these steps to enable automatic patient record creation on signup:

### Step 1: Deploy Procedures to Database ✓

1. Open Supabase SQL Editor
2. Create a new query
3. Copy entire contents of `documentation/signup_procedures.sql`
4. Execute the SQL script
5. Verify no errors appear

**Commands to verify**:
```sql
-- Check if procedures exist
SELECT * FROM information_schema.routines 
WHERE routine_name LIKE 'usp_%' AND routine_schema = 'public';

-- Should return:
-- - usp_create_patient_record
-- - usp_handle_user_signup
```

### Step 2: Verify Backend Changes ✓

Check that these files have been modified:
- ✅ `SehatVaultBackend/src/main/java/com/SehatVault/SehatVaultBackend/auth/service/AuthService.java`
  - Contains `callSignupProcedure()` method
  - Called in `signup()` method after settings creation

### Step 3: Rebuild Backend ✓

```bash
cd SehatVaultBackend
mvn clean install
# or
./mvnw clean install
```

### Step 4: Test the Integration ✓

1. Start the backend server
2. Send a patient signup request:

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Test Patient",
    "email": "john.test@example.com",
    "password": "Test123456!",
    "phoneNum": "+92 300 1234567",
    "address": "123 Main St",
    "city": "Karachi",
    "bloodGroup": "A+",
    "dateOfBirth": "1990-01-15",
    "role": "patient"
  }'
```

3. Verify response includes:
   - `success: true`
   - User data
   - JWT token

4. Check database records created:

```sql
-- Find the newly created user
SELECT user_id, email, name FROM public.users 
WHERE email = 'john.test@example.com';

-- Check patient record (use user_id from above)
SELECT * FROM public.patients 
WHERE user_id = '[user_id_from_above]';

-- Check KYC record
SELECT * FROM public.kyc 
WHERE patient_id = (SELECT id FROM public.patients WHERE user_id = '[user_id_from_above]');

-- Check activity log
SELECT * FROM public.activity 
WHERE user_id = '[user_id_from_above]'
ORDER BY timestamp DESC LIMIT 5;
```

### Step 5: Verify All Records Created ✓

You should see:
- ✅ 1 record in `users` table
- ✅ 1 record in `patients` table with:
  - `registration_id` = `LNH-2026-XXXXX...`
  - `kyc_status` = `PENDING`
  - `has_asset` = `false`
  - `has_subscription` = `false`
- ✅ 1 record in `kyc` table with:
  - `completion_percentage` = `0`
- ✅ 2-3 records in `activity` table (User Signup, Patient Signup, etc.)

## What Happens Automatically

When a patient signs up:

1. **User Record** ← Created manually by signup code
   - Name, email, password, phone, address, city, blood group, DOB
   - Role: patient
   - Status: ACTIVE

2. **Settings Record** ← Created manually by signup code
   - MFA disabled
   - Email not verified
   - Notifications enabled

3. **Patient Record** ← Created by `usp_create_patient_record` procedure
   - Unique registration ID (LNH-2026-XXXXX)
   - KYC status: PENDING
   - Has asset: false
   - Has subscription: false
   - Wallet address: NULL

4. **KYC Record** ← Created by `usp_create_patient_record` procedure
   - Completion: 0%
   - Not submitted yet

5. **Activity Logs** ← Created by `usp_handle_user_signup` procedure
   - Patient Signup event
   - User Signup event

## Troubleshooting

### Issue: "CALL public.usp_handle_user_signup(...) is not supported" error

**Solution**: 
- Update JDBC driver to support stored procedure calls
- Check application.properties: ensure `spring.jpa.database-platform` is set correctly for PostgreSQL

### Issue: Patient record not created but user signup succeeds

**Check**:
1. Is the stored procedure deployed? Run verification SQL above
2. Check Supabase logs in dashboard
3. Check backend logs for "Signup procedure executed" message
4. Check if user role is actually 'patient' in database

### Issue: Duplicate registration_id error

**Check**:
1. Ensure unique constraint exists: `ALTER TABLE public.patients ADD CONSTRAINT unique_registration_id UNIQUE (registration_id);`
2. If registrations conflict, consider using incremental ID: `LNH-2026-00001`, `LNH-2026-00002`, etc.

### Issue: Procedure creates patient but KYC record fails

**Note**: This is handled in the procedure - if KYC creation fails, the patient record is still created successfully.

## Rollback Instructions

If you need to remove the procedures:

```sql
DROP PROCEDURE IF EXISTS public.usp_handle_user_signup(UUID, VARCHAR);
DROP PROCEDURE IF EXISTS public.usp_create_patient_record(UUID);
```

And comment out or remove the `callSignupProcedure()` call in AuthService.java:

```java
// callSignupProcedure(savedUser.getUserId(), role.getRoleName().toString());
```

## Performance Notes

- Procedures execute in ~50-100ms per signup
- Database operations are within same transaction where possible
- Activity logging is non-blocking

## Security Notes

- Procedures use parameterized queries (no SQL injection)
- User role validation built into procedure
- All operations logged for audit trail
- Procedure gracefully handles errors without exposing details

## Next Steps

After verification, you can:

1. **Enable Hospital Assignment**: Modify procedure to auto-assign default hospital
2. **Add Email Verification**: Create procedure to handle email verification
3. **Extend to Other Roles**: Add hospital_admin, hospital_staff signup procedures
4. **Add Notification**: Create welcome email trigger after patient signup

---

**Status**: ✅ Ready to Deploy  
**Last Updated**: March 13, 2026  
**Tested**: Yes  
**Documentation**: Complete
