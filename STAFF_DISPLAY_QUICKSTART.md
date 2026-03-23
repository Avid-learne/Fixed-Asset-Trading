# Staff Management Implementation - Quick Start

## What Was Changed

You asked: *"I want hospital staff that already exists in the database to be shown in the staff management page, like banks are being shown in the bank integration page."*

### Solution Implemented

The infrastructure to display staff **already existed** but the database table was empty. I've created:

1. **[documentation/seed_hospital_staff.sql](../documentation/seed_hospital_staff.sql)** - Seed script to populate test staff data
2. **[documentation/STAFF_MANAGEMENT_SETUP.md](../documentation/STAFF_MANAGEMENT_SETUP.md)** - Detailed setup and troubleshooting guide

---

## Quick Start (3 Steps)

### Step 1: Run the Seed Script
Execute this SQL in your database (Supabase, pgAdmin, or Azure Data Studio):

```sql
-- Copy entire contents of: documentation/seed_hospital_staff.sql
-- Paste into database SQL editor
-- Click Run
```

This creates 4 test hospital staff members:
- Dr. Ahmed Hassan (Senior Physician) - Active
- Nura Khan (Administrative Officer) - Active
- Fatima Ali (Nurse) - Active
- Muhammad Malik (Assistant) - Inactive

### Step 2: Verify Backend is Running
```bash
# Make sure SehatVaultBackend is running
cd SehatVaultBackend
./mvnw spring-boot:run
```

### Step 3: Check Staff Page in Frontend

1. Start frontend:
```bash
cd hospitalfrontend
npm run dev
```

2. Navigate to: **Hospital Admin Dashboard → Staff Management**

3. You should see the 4 staff members in a table with:
   - Name, Email, Role, Status (Active/Inactive/Pending)
   - Last Login
   - Actions (View details, Deactivate)
   - Search and filter by status

---

## Architecture Overview

### Data Flow (Same as Bank Integration Pattern)

```
Frontend Component (staff/page.tsx)
        ↓
staffService.getStaffMembers()
        ↓
HTTP GET /api/staff (with auth token)
        ↓
HospitalStaffController.getStaff()
        ↓
HospitalStaffService.getHospitalStaffByHospitalId()
        ↓
HospitalStaffRepository.findByHospitalIdAndUserRole()
        ↓
Database Query (JOIN hospital_staff, users, roles)
        ↓
StaffMemberResponse DTO (with staff details)
        ↓
Frontend displays in table
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Backend Endpoint** | `HospitalStaffController.getStaff()` | GET /api/staff - Fetch staff for authenticated user's hospital |
| **Service Logic** | `HospitalStaffService` | Converts HospitalStaff entities to StaffMemberResponse DTOs |
| **Database Query** | `HospitalStaffRepository` | JPA query to fetch staff filtered by hospital & role |
| **Frontend Service** | `staffService.ts` | Makes HTTP calls to backend |
| **Frontend Component** | `hospitaladmin/staff/page.tsx` | Displays staff in table with search/filter |

---

## Field Mappings

### Staff Member Response (What Frontend Gets)
```typescript
interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: string                    // e.g., "Hospital Staff"
  status: 'active' | 'inactive' | 'pending'
  joinDate?: string              // user.createdAt
  lastLogin?: string             // user.updatedAt
  position?: string              // from hospital_staff.position
  department?: string            // from hospital_staff.department
  permissions?: {                // Future: not yet implemented
    viewPatients: boolean
    approveDeposits: boolean
    mintTokens: boolean
    manageStaff: boolean
    viewReports: boolean
  }
}
```

---

## Display Features (Already Implemented)

✅ **View Staff List**
- Table showing all hospital staff
- Columns: Name, Email, Role, Status, Last Login, Actions

✅ **Search & Filter**
- Search by name, email, or role
- Filter by status (All, Active, Inactive, Pending)
- Statistics cards (Total, Active, Inactive, Pending counts)

✅ **View Details**
- Click "View" button to see staff member details in modal
- Shows all fields including department and position

❌ **Invite New Staff** (TODO)
- Button exists but endpoint not implemented
- Backend has: `POST /api/staff/invite` (stub)

❌ **Deactivate Staff** (TODO)
- Button shown in details modal
- Backend method exists but needs implementation

❌ **Permission Management** (TODO)
- Fields exist in data model
- No UI or backend logic yet

---

## Database Tables Used

### hospital_staff table
```sql
- id (UUID) - Primary key
- user_id (UUID) - Foreign key to users
- hospital_id (UUID) - Foreign key to hospitals
- employee_id (VARCHAR) - Unique employee ID
- department (VARCHAR) - e.g., "Medical", "Nursing"
- position (VARCHAR) - e.g., "Senior Physician"
- created_at, updated_at - Timestamps
```

### users table (Related)
```sql
- user_id (UUID) - Primary key
- role_id (UUID) - Foreign key to roles
- name, email, phone_num
- status - 'ACTIVE' or 'INACTIVE'
- hospital_id (UUID) - What hospital they belong to
- created_at, updated_at
```

---

## Testing Checklist

- [ ] Seed script executes without errors
- [ ] Hospital staff records appear in database
- [ ] Backend running on http://localhost:8080
- [ ] Frontend running on http://localhost:3000
- [ ] Can see 4 staff members in Staff Management page
- [ ] Search works (try searching "Ahmed")
- [ ] Filter by status works
- [ ] Statistics cards show correct counts
- [ ] Can click "View" to see staff details

---

## Similarity to Bank Integration Pattern

Both follow the same architecture:

| Aspect | Banks | Staff |
|--------|-------|-------|
| **Seed Data Script** | ❌ Not needed (loaded from banks table) | ✅ `seed_hospital_staff.sql` |
| **Backend READ Endpoint** | `GET /bank-integrations/hospital/available-banks` | `GET /api/staff` |
| **Service Method** | `bankIntegrationService.getAvailableBanksForHospital()` | `hospitalStaffService.getHospitalStaffByHospitalId()` |
| **Repository Query** | Filter out already-linked banks | Filter by hospital_id + role |
| **DTO** | `BankOptionDto` | `StaffMemberResponse` |
| **Frontend Service** | `bankIntegrationService.ts` | `staffService.ts` |
| **Frontend Component** | `hospitaladmin/banks/page.tsx` | `hospitaladmin/staff/page.tsx` |
| **Display Type** | Table + Dropdown | Table with modals |
| **Link/Add New** | "Link New Bank" button → POST endpoint | "Invite Staff" button → POST endpoint |

---

## Next Steps (If Needed)

1. **Implement Staff Invitation** - Create endpoint to invite new staff
2. **Implement Staff Deactivation** - Allow admins to deactivate staff
3. **Add Permission Management** - Assign per-staff permissions
4. **Email Notifications** - Send invitation emails
5. **Bulk Import** - Import staff from CSV

---

## Documentation Files

- **[STAFF_MANAGEMENT_SETUP.md](../documentation/STAFF_MANAGEMENT_SETUP.md)** - Complete setup guide with troubleshooting
- **[seed_hospital_staff.sql](../documentation/seed_hospital_staff.sql)** - SQL script to populate staff data
