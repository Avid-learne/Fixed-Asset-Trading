# Staff Management Setup Guide

This guide explains how to populate the staff management page with existing hospital staff from the database.

## Current Issue
The staff management page shows empty because the `hospital_staff` table has no records.

## Solution: Seed Test Data

### Files Created
1. **[documentation/seed_hospital_staff.sql](seed_hospital_staff.sql)** - SQL script to create test staff records

### How to Run the Seed Script

#### Option 1: Using Supabase Dashboard
1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy entire contents of `documentation/seed_hospital_staff.sql`
5. Paste into the editor
6. Click **Run**

#### Option 2: Using psql (Command Line)
```powershell
# From workspace root
psql -h YOUR_DATABASE_HOST -U YOUR_DATABASE_USER -d YOUR_DATABASE_NAME -f documentation/seed_hospital_staff.sql
```

#### Option 3: Using Azure Data Studio / pgAdmin
1. Connect to your database
2. Open the file `documentation/seed_hospital_staff.sql`
3. Execute it

---

## What the Seed Script Does

The script automatically:
- ✅ Creates 4 test hospital staff users with the `hospital_staff` role
  - Dr. Ahmed Hassan (Doctor) - Active
  - Nura Khan (Admin Officer) - Active  
  - Fatima Ali (Nurse) - Active
  - Muhammad Malik (Assistant) - Inactive
- ✅ Links them to the first hospital in your database
- ✅ Assigns them positions and departments
- ✅ Generates employee IDs

### Test Data Created
| Name | Email | Role | Status | Position | Department |
|------|-------|------|--------|----------|------------|
| Dr. Ahmed Hassan | ahmed.hassan@hospital.pk | Hospital Staff | Active | Senior Physician | Medical |
| Nura Khan | nura.khan@hospital.pk | Hospital Staff | Active | Administrative Officer | Administration |
| Fatima Ali | fatima.ali@hospital.pk | Hospital Staff | Active | Nurse | Nursing |
| Muhammad Malik | muhammad.malik@hospital.pk | Hospital Staff | Inactive | Assistant | Medical |

---

## Verify It Works

### Step 1: Check Backend Endpoint
```bash
# While backend is running, test the staff endpoint:
curl -X GET "http://localhost:8080/api/staff" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "message": "Staff retrieved successfully",
  "data": [
    {
      "id": "...",
      "name": "Dr. Ahmed Hassan",
      "email": "ahmed.hassan@hospital.pk",
      "phone": "+92-300-1234567",
      "role": "Hospital Staff",
      "status": "active",
      "joinDate": "2024-...",
      "position": "Senior Physician",
      "department": "Medical"
    },
    ...
  ]
}
```

### Step 2: Check Frontend Display
1. Start the frontend: `npm run dev` in `hospitalfrontend/`
2. Navigate to **Hospital Admin → Staff Management**
3. You should now see the 4 test staff members in the table

---

## Backend Implementation Details

### Staff Retrieval Flow

**Frontend** → (HTTP GET) → **Backend Controller** → **Service Layer** → **Repository** → **Database**

1. **Frontend** (`hospitalfrontend/services/staffService.ts`)
   ```typescript
   getStaffMembers() → API GET /api/staff
   ```

2. **Backend Controller** (`HospitalStaffController.java`)
   ```java
   GET /api/staff
   - Gets authenticated user's hospital ID
   - Calls service to fetch staff for that hospital
   - Returns list of StaffMemberResponse DTOs
   ```

3. **Service Layer** (`HospitalStaffService.java`)
   ```java
   getHospitalStaffByHospitalId(hospitalId)
   - Queries hospital_staff table for that hospital
   - Filters by role = 'hospital_staff'
   - Converts to DTO (maps user + staff details)
   ```

4. **Repository** (`HospitalStaffRepository.java`)
   ```java
   findByHospitalIdAndUserRole(hospitalId, hospital_staff)
   - JPA Query that joins HospitalStaff and User
   - Filters by hospital and role
   ```

---

## Troubleshooting

### Problem: Backend returns empty list
**Cause**: `hospital_staff` table is empty

**Solution**: 
- Run the seed script above
- Make sure the hospital ID exists (`SELECT * FROM hospitals LIMIT 1;`)

### Problem: "User is not associated with a hospital"
**Cause**: Current authenticated user doesn't have a `hospital_id`

**Solution**:
- Ensure you logged in as a hospital_admin user
- That user must have their hospital_id set in the users table

### Problem: Frontend shows "No staff members found"
**Cause**: Frontend service not calling backend correctly OR backend returning wrong data

**Debug**:
1. Check browser DevTools → Network tab
2. Look for the `/api/staff` request
3. Check if it's returning 200 status and data array
4. Check console for error messages

---

## Next Steps

Once staff data is showing:

### 1. **Invite New Staff** (Currently Not Implemented)
The "Invite Staff" button exists but the backend endpoint has `TODO: Implement invitation logic`

To enable:
- Implement the `POST /api/staff/invite` endpoint
- Should create user + hospital_staff record
- Should send invitation email (optional)

### 2. **Deactivate Staff** (Currently Not Implemented)
The deactivate button calls a service method that isn't implemented

To enable:
- Implement `HospitalStaffService.deactivateStaff()`
- Should update user status to 'INACTIVE'

### 3. **Permission Management** (Currently Not Implemented)
Staff have permission fields in the DTO but they're not used anywhere

To enable:
- Add permission column to hospital_staff table
- Implement permission assignment UI
- Use permissions in authorization checks

---

## Database Schema Reference

### Tables Involved

**users** (existing)
```sql
- user_id (UUID, PK)
- role_id (UUID, FK to roles)
- name, email, phone_num, status
```

**hospital_staff** (target)
```sql
- id (UUID, PK)
- user_id (UUID, FK to users)
- hospital_id (UUID, FK to hospitals)
- employee_id (VARCHAR, unique)
- department, position
- created_at, updated_at
```

---

## Related Documentation
- [SIGNUP_PROCEDURE_README.md](../SIGNUP_PROCEDURE_README.md) - How hospital staff accounts are created during signup
- [RBAC_IMPLEMENTATION.md](../hospitalfrontend/RBAC_IMPLEMENTATION.md) - Role-based access control
- [ERD.drawio.xml](../documentation/ERD.drawio.xml) - Database entity relationships
