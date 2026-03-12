# Patient Signup Record Creation - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PATIENT SIGNUP FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ FRONTEND                                                                 │
│ ┌────────────────────────────────────────────────────────────────────┐  │
│ │ Patient Registration Form                                          │  │
│ │ - Name, Email, Password, Phone, Address, etc.                     │  │
│ │ - Role: "patient" (fixed)                                         │  │
│ └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │ HTTP POST
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ BACKEND - JAVA SPRING BOOT                                               │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ AuthController.signup()                                          │   │
│ │   POST /api/auth/signup                                          │   │
│ │   Content-Type: application/json                                 │   │
│ └──────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ AuthService.signup()                                             │   │
│ │                                                                   │   │
│ │ 1. Validate request data                                        │   │
│ │ 2. Check email doesn't exist                                    │   │
│ │ 3. Hash password                                                │   │
│ │ 4. Create User entity                                           │   │
│ │    ├─ name, email, phone, address, city, bloodGroup, DOB      │   │
│ │    └─ role = Role.PATIENT                                       │   │
│ │ 5. Save User to database                                        │   │
│ │ 6. Create Settings entity                                       │   │
│ │    └─ Save to database                                          │   │
│ │ 7. ┌─► callSignupProcedure(userId, "patient") ◄─────────┐      │   │
│ │    │                                             │        │      │   │
│ │    └─────────────────────────────────────────────┘        │      │   │
│ │    8. Generate JWT token                                  │      │   │
│ │    9. Return AuthResponse                                 │      │   │
│ └──────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼ (JDBC Call)                           │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ JdbcTemplate.update()                                            │   │
│ │ CALL public.usp_handle_user_signup(?, ?)                         │   │
│ │       ↑              ↑                      ↑                    │   │
│ │       userId         role                   │                    │   │
│ └──────────────────────────────┬───────────────────────────────────┘   │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │ JDBC PostgreSQL Native Call
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ SUPABASE DATABASE - POSTGRESQL                                           │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Stored Procedure: usp_handle_user_signup()                       │   │
│ │                                                                   │   │
│ │ CASE p_role:                                                     │   │
│ │   WHEN 'patient' THEN                                            │   │
│ │     CALL usp_create_patient_record(p_user_id)                   │   │
│ │   WHEN others                                                    │   │
│ │     (future roles)                                               │   │
│ │ END CASE                                                         │   │
│ │                                                                   │   │
│ │ Log activity to activity table                                   │   │
│ └──────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Stored Procedure: usp_create_patient_record()                    │   │
│ │                                                                   │   │
│ │ 1. Get user role from users table                                │   │
│ │ 2. Verify role is 'patient'                                      │   │
│ │ 3. Check patient record doesn't exist (idempotent)               │   │
│ │ 4. Generate registration_id: "LNH-2026-XXXXX"                   │   │
│ │ 5. INSERT INTO patients:                                         │   │
│ │    ├─ id, user_id, hospital_id                                  │   │
│ │    ├─ registration_id, wallet_address                           │   │
│ │    ├─ has_asset=false, has_subscription=false                   │   │
│ │    ├─ kyc_status='PENDING'                                      │   │
│ │    └─ created_at=NOW(), updated_at=NOW()                        │   │
│ │ 6. INSERT INTO kyc:                                              │   │
│ │    ├─ patient_id, completion_percentage=0                       │   │
│ │    └─ submitted_at=NULL                                         │   │
│ │ 7. INSERT INTO activity (logging):                               │   │
│ │    ├─ activity_name='Patient Signup'                            │   │
│ │    ├─ description (with registration_id)                        │   │
│ │    └─ timestamp=NOW()                                           │   │
│ │ 8. If error → Log error activity                                │   │
│ └───────────────┬────────────────────────────────────────────────┘   │
│                 │                                                      │
│                 ▼                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Database State After Procedure:                                  │   │
│ │                                                                   │   │
│ │ userstable:                                                      │   │
│ │  [new user record] ✓                                             │   │
│ │                                                                   │   │
│ │ patient table:                                                   │   │
│ │  [new patient record] ✓                                          │   │
│ │  ├─ id: UUID                                                     │   │
│ │  ├─ registration_id: "LNH-2026-XXXXX"                           │   │
│ │  └─ kyc_status: "PENDING"                                        │   │
│ │                                                                   │   │
│ │ kyc table:                                                       │   │
│ │  [new kyc record] ✓                                              │   │
│ │  └─ completion_percentage: 0                                     │   │
│ │                                                                   │   │
│ │ activity table:                                                  │   │
│ │  [signup activity logs] ✓✓                                       │   │
│ │  ├─ "Patient Signup"                                             │   │
│ │  └─ "User Signup"                                                │   │
│ └──────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequence Diagram

```
Timeline          Frontend          Backend        Database
   ↓               ↓                 ↓               ↓
   │ POST signup   │                 │               │
   │──────────────→│ /api/auth/signup                │
   │               │                 │               │
   │               │ Validate + Hash │               │
   │               │                 │               │
   │               │ Create User     │               │
   │               │ Save User       │               │
   │               │─────────────────────────────────→│
   │               │                 │ ✓ User       │
   │               │                 │ Created      │
   │               │←─────────────────────────────────│
   │               │                 │               │
   │               │ Create Settings │               │
   │               │ Save Settings   │               │
   │               │─────────────────────────────────→│
   │               │                 │ ✓ Settings  │
   │               │                 │ Created      │
   │               │←─────────────────────────────────│
   │               │                 │               │
   │               │ Call Procedure  │               │
   │               │─────────────────→ CALL usp_    │
   │               │              handle_user_signup │
   │               │                 │──────────────→│
   │               │                 │               │ ✓ Patient
   │               │                 │               │ Created
   │               │                 │               │ ✓ KYC
   │               │                 │               │ Created
   │               │                 │               │ ✓ Activity
   │               │                 │               │ Logged
   │               │                 │←──────────────│
   │               │ Generate Token  │               │
   │               │ Return Response │               │
   │               │←─────────────────               │
   │ Response + JWT│                 │               │
   │←──────────────│                 │               │
   │               │                 │               │
```

---

## Role-Based Record Creation

```
User Role              Procedure Dispatch           Records Created
────────             ──────────────────           ───────────────

┌─────────────┐
│ patient     │ → usp_handle_user_signup()  → usp_create_patient_record()
│             │   (router)                    ├─ patients table ✓
│             │                               ├─ kyc table ✓
│             │                               └─ activity log ✓
└─────────────┘

┌─────────────┐
│ hospital_   │ → usp_handle_user_signup()  → (future)
│   admin     │   (router)                    ├─ hospital_admin table
│             │                               ├─ permissions table
│             │                               └─ activity log
└─────────────┘

┌─────────────┐
│ hospital_   │ → usp_handle_user_signup()  → (future)
│   staff     │   (router)                    ├─ hospital_staff table
│             │                               ├─ department link
│             │                               └─ activity log
└─────────────┘

┌─────────────┐
│ bank_staff  │ → usp_handle_user_signup()  → (future)
│             │   (router)                    └─ bank_staff table
└─────────────┘

┌─────────────┐
│ admin       │ → usp_handle_user_signup()  → (future)
│             │   (router)                    └─ admin table
└─────────────┘
```

---

## Error Handling Flow

```
                    ┌─────────────────────────┐
                    │ Signup Request Received │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Validate Request Data   │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Check Email Exists      │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Create & Save User      │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Create & Save Settings  │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────────────┐
                    │ Call Signup Procedure           │
                    │ (Non-Blocking, Error Safe)      │
                    └────────┬──────────────┬─────────┘
                             │              │
                    ┌────────▼────┐  ┌──────▼───────┐
                    │ SUCCESS     │  │ FAILURE      │
                    │ ✓ Patient   │  │ ✗ Error OK   │
                    │ ✓ KYC       │  │ (log error)  │
                    │ ✓ Activity  │  │ Continue... │
                    └────────┬────┘  └──────┬───────┘
                             │              │
                             └──────┬───────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │ Generate JWT Token             │
                    └───────────────┬────────────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │ Return AuthResponse + Token    │
                    │ (SUCCESS in both cases)        │
                    └────────────────────────────────┘
```

---

## Database Schema Changes

```
Before Signup:
┌──────────────┐
│ users table  │
│ (empty)      │
└──────────────┘

After Signup:
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ users table      │    │ patients table   │    │ kyc table        │
├──────────────────┤    ├──────────────────┤    ├──────────────────┤
│ user_id (PK)     │    │ id (PK)          │    │ kyc_id (PK)      │
│ role_id (FK)     │━━━▶│ user_id (FK)     │━━━▶│ patient_id (FK)  │
│ name             │    │ wallet_address   │    │ completion_pct   │
│ email            │    │ registration_id  │    │ submitted_at     │
│ phone_num        │    │ kyc_status       │    │ created_at       │
│ address          │    │ has_asset        │    └──────────────────┘
│ city             │    │ has_subscription │
│ blood_group      │    │ created_at       │    ┌──────────────────┐
│ dob              │    │ updated_at       │    │ activity table   │
│ status           │    └──────────────────┘    ├──────────────────┤
│ created_at       │                           │ activity_id (PK) │
└──────────────────┘                           │ user_id (FK) ────┼──┐
                                               │ activity_name    │  │
                                               │ description      │  │
                                               │ type             │  │
                                               │ timestamp        │  │
                                               └──────────────────┘  │
                                                                     │
                                              (Multiple entries)────┘
```

---

## Deployment Checklist

```
Phase 1: Database
├─ [ ] Review signup_procedures.sql
├─ [ ] Connect to Supabase
├─ [ ] Execute SQL script
├─ [ ] Verify procedures created
└─ [ ] Test procedures manually

Phase 2: Backend
├─ [ ] Review AuthService changes
├─ [ ] Build project (mvn clean install)
├─ [ ] Verify compilation success
└─ [ ] Check for any warnings

Phase 3: Testing
├─ [ ] Start backend server
├─ [ ] Test patient signup endpoint
├─ [ ] Verify response includes JWT
├─ [ ] Check database records created
├─ [ ] Verify patient record details
├─ [ ] Verify KYC record created
└─ [ ] Verify activity logs

Phase 4: Production
├─ [ ] Deploy database procedures
├─ [ ] Deploy backend changes
├─ [ ] Run smoke tests
├─ [ ] Monitor logs
└─ [ ] Verify signup completeness
```

---

**Last Updated**: March 13, 2026  
**Status**: ✅ Complete and Ready  
**Diagram Version**: 1.0
