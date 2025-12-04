# Access Control System Documentation

## Overview

This system implements role-based access control (RBAC) with the **minimum access principle**. Each role can only access data and features relevant to their scope:

- **Super Admin**: Full system access
- **Hospital Admin**: Full access to their hospital's data
- **Hospital Staff**: Limited access to assigned patients only
- **Bank Officer**: Access to connected hospitals (anonymized patient data)
- **Patient**: Access to only their own data

---

## 🔐 Core Components

### 1. **AuthProvider** (`contexts/AuthContext.tsx`)

Global context that manages user authentication and permissions.

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, hasPermission, canAccessHospital } = useAuth()
  
  // Check permission
  if (hasPermission(Permission.MINT_TOKENS)) {
    // Show mint button
  }
  
  // Check hospital access
  if (canAccessHospital('H001')) {
    // Show hospital data
  }
}
```

### 2. **Protected Component** (`components/auth/Protected.tsx`)

Conditionally renders content based on permissions.

```tsx
import { Protected } from '@/components/auth/Protected'
import { Permission } from '@/types/auth'

// Hide/show based on permission
<Protected permission={Permission.VIEW_ALL_USERS}>
  <UserManagementTable />
</Protected>

// Hide/show based on role
<Protected role={UserRole.SUPER_ADMIN}>
  <SystemSettings />
</Protected>

// Multiple permissions (any)
<Protected permissions={[Permission.MINT_TOKENS, Permission.ALLOCATE_TOKENS]}>
  <TokenOperations />
</Protected>

// Multiple permissions (all required)
<Protected permissions={[Permission.VIEW_HOSPITAL_PATIENTS, Permission.EDIT_PATIENT]} requireAll>
  <EditPatientForm />
</Protected>

// With fallback
<Protected permission={Permission.MINT_TOKENS} fallback={<p>Access denied</p>}>
  <MintButton />
</Protected>
```

### 3. **Data Filtering Hooks** (`hooks/useFilteredData.ts`)

Automatically filters data based on user's role and affiliations.

```tsx
import { useHospitalData, useBankData, usePatientData, useSanitizedPatientData } from '@/hooks/useFilteredData'

function HospitalDashboard() {
  // Automatically filters to only show user's hospital data
  const patients = useHospitalData(allPatients, 'hospitalId')
  
  // Automatically filters to only show user's bank data
  const transactions = useBankData(allTransactions, 'bankId')
  
  // Automatically filters to only show user's own data (for patients)
  const myAssets = usePatientData(allAssets, 'patientId')
  
  // Sanitizes patient data for bank officers (removes personal info)
  const bankViewPatients = useSanitizedPatientData(patients)
}
```

### 4. **Route Guards** (`hooks/useRouteGuard.ts`)

Protects entire pages from unauthorized access.

```tsx
import { useRouteGuard } from '@/hooks/useRouteGuard'
import { Permission } from '@/types/auth'

export default function UserManagementPage() {
  // Redirects if user lacks permission
  useRouteGuard({ 
    requiredPermission: Permission.VIEW_ALL_USERS 
  })
  
  return <div>User Management</div>
}

// Or protect by role
export default function SuperAdminPage() {
  useRouteGuard({ requiredRole: UserRole.SUPER_ADMIN })
  return <div>Admin Panel</div>
}
```

---

## 📋 Access Matrix

| Role | Hospital Data | Bank Data | Patient Data | Token Operations | System Logs | Billing |
|------|--------------|-----------|--------------|------------------|-------------|---------|
| **Super Admin** | All hospitals | All banks | All patients | View all | Full access | Full access |
| **Hospital Admin** | Own hospital only | Connected banks | All patients in hospital | Mint, Allocate, Trade | Hospital logs | ❌ |
| **Hospital Staff** | Own hospital only | ❌ | Assigned patients only | ❌ | ❌ | ❌ |
| **Bank Officer** | Connected hospitals | Own bank | Anonymized only | Approve assets | ❌ | ❌ |
| **Patient** | ❌ | ❌ | Own data only | Trade own tokens | ❌ | ❌ |

---

## 🎯 Implementation Examples

### Example 1: Hospital Admin Dashboard

```tsx
"use client"

import { useRouteGuard } from '@/hooks/useRouteGuard'
import { useAuth } from '@/contexts/AuthContext'
import { useHospitalData } from '@/hooks/useFilteredData'
import { Protected } from '@/components/auth/Protected'
import { Permission } from '@/types/auth'

export default function HospitalDashboard() {
  // 1. Protect the route
  useRouteGuard({ requiredRole: UserRole.HOSPITAL_ADMIN })
  
  // 2. Get user context
  const { user } = useAuth()
  
  // 3. Filter data by hospital - only shows data for user's hospital
  const patients = useHospitalData(allPatients, 'hospitalId')
  const transactions = useHospitalData(allTransactions, 'hospitalId')
  
  return (
    <div>
      <h1>Hospital: {user?.hospital?.name}</h1>
      
      {/* All users see patient list */}
      <PatientList patients={patients} />
      
      {/* Only admins see minting controls */}
      <Protected permission={Permission.MINT_TOKENS}>
        <MintingPanel />
      </Protected>
      
      {/* Only admins see financial reports */}
      <Protected permission={Permission.VIEW_HOSPITAL_ANALYTICS}>
        <FinancialReports />
      </Protected>
    </div>
  )
}
```

### Example 2: Bank Officer Dashboard

```tsx
"use client"

import { useRouteGuard } from '@/hooks/useRouteGuard'
import { useBankData, useSanitizedPatientData } from '@/hooks/useFilteredData'

export default function BankDashboard() {
  // Only bank officers can access
  useRouteGuard({ requiredRole: UserRole.BANK_OFFICER })
  
  // Filter to connected hospitals
  const hospitals = useBankData(allHospitals, 'connectedBankIds')
  
  // Sanitize patient data - removes personal/medical info
  const patients = useSanitizedPatientData(allPatients)
  
  return (
    <div>
      <h1>Connected Hospitals</h1>
      {hospitals.map(h => <HospitalCard key={h.id} hospital={h} />)}
      
      {/* Patient data is anonymized */}
      <p>Patient count: {patients.length}</p>
      {/* patients will have format: Patient-abc123 instead of real names */}
    </div>
  )
}
```

### Example 3: Conditional Button Rendering

```tsx
import { useAuth } from '@/contexts/AuthContext'
import { Permission } from '@/types/auth'

function TokenCard({ token }) {
  const { hasPermission } = useAuth()
  
  return (
    <Card>
      <CardHeader>{token.name}</CardHeader>
      <CardContent>
        <p>Balance: {token.amount}</p>
        
        {/* Show mint button only if user has permission */}
        {hasPermission(Permission.MINT_TOKENS) && (
          <Button onClick={handleMint}>Mint Tokens</Button>
        )}
        
        {/* Show trade button if user can trade */}
        {hasPermission(Permission.TRADE_TOKENS) && (
          <Button onClick={handleTrade}>Trade</Button>
        )}
      </CardContent>
    </Card>
  )
}
```

### Example 4: Super Admin User Management

```tsx
"use client"

import { useRouteGuard } from '@/hooks/useRouteGuard'
import { useAuth } from '@/contexts/AuthContext'
import { Permission } from '@/types/auth'

export default function UserManagement() {
  // Only super admins can access
  useRouteGuard({ requiredPermission: Permission.VIEW_ALL_USERS })
  
  const { user, hasPermission } = useAuth()
  
  const handleAssignRole = (userId: string, newRole: UserRole) => {
    if (!hasPermission(Permission.ASSIGN_ROLES)) {
      alert('You cannot assign roles')
      return
    }
    // Assign role logic
  }
  
  return (
    <div>
      <h1>User Management</h1>
      {/* Super admin sees all users */}
      <UserTable users={allUsers} onAssignRole={handleAssignRole} />
    </div>
  )
}
```

---

## 🔧 Permission Reference

### User Management
- `VIEW_ALL_USERS` - View all system users (Super Admin)
- `CREATE_USER` - Create new users and assign roles
- `EDIT_USER` - Edit user details
- `DELETE_USER` - Delete users
- `ASSIGN_ROLES` - Assign/change user roles

### Hospital Management
- `VIEW_ALL_HOSPITALS` - View all hospitals (Super Admin)
- `VIEW_OWN_HOSPITAL` - View own hospital data
- `CREATE_HOSPITAL` - Register new hospitals
- `VERIFY_HOSPITAL` - Verify hospital credentials

### Patient Management
- `VIEW_ALL_PATIENTS` - View all patients (Super Admin)
- `VIEW_HOSPITAL_PATIENTS` - View all patients in hospital (Hospital Admin)
- `VIEW_ASSIGNED_PATIENTS` - View assigned patients only (Hospital Staff)
- `VIEW_OWN_PROFILE` - View own profile (Patient)

### Token Operations
- `MINT_TOKENS` - Mint new tokens (Hospital Admin)
- `ALLOCATE_TOKENS` - Allocate tokens to patients (Hospital Admin)
- `TRADE_TOKENS` - Trade tokens
- `APPROVE_ASSETS` - Approve asset valuations (Bank Officer)

### Financial Operations
- `VIEW_ALL_TRANSACTIONS` - View all transactions (Super Admin)
- `VIEW_HOSPITAL_TRANSACTIONS` - View hospital transactions
- `VIEW_BANK_TRANSACTIONS` - View bank transactions
- `VIEW_OWN_TRANSACTIONS` - View own transactions (Patient)

### Analytics & Reports
- `VIEW_SYSTEM_ANALYTICS` - System-wide analytics (Super Admin)
- `VIEW_HOSPITAL_ANALYTICS` - Hospital analytics
- `VIEW_BANK_ANALYTICS` - Bank analytics

### System Logs
- `VIEW_ALL_AUDIT_LOGS` - View all audit logs (Super Admin)
- `VIEW_ERROR_LOGS` - View error logs
- `VIEW_TRANSACTION_LOGS` - View blockchain transaction logs

### Billing
- `VIEW_ALL_BILLING` - View all billing (Super Admin)
- `MANAGE_SUBSCRIPTIONS` - Manage subscription plans
- `GENERATE_INVOICES` - Generate invoices

---

## 🚀 Quick Start

### 1. Wrap your app with AuthProvider

```tsx
// app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 2. Protect a page

```tsx
// app/admin/users/page.tsx
"use client"

import { useRouteGuard } from '@/hooks/useRouteGuard'
import { Permission } from '@/types/auth'

export default function UsersPage() {
  useRouteGuard({ requiredPermission: Permission.VIEW_ALL_USERS })
  
  return <div>User Management</div>
}
```

### 3. Filter data

```tsx
import { useHospitalData } from '@/hooks/useFilteredData'

const patients = useHospitalData(allPatients, 'hospitalId')
// Automatically filtered to user's hospital
```

### 4. Show/hide components

```tsx
import { Protected } from '@/components/auth/Protected'

<Protected permission={Permission.MINT_TOKENS}>
  <MintButton />
</Protected>
```

---

## 📝 Best Practices

1. **Always filter data on the backend** - Frontend filtering is for UX, not security
2. **Use route guards for pages** - Protect entire pages with `useRouteGuard`
3. **Use Protected for components** - Hide/show UI elements with `<Protected>`
4. **Filter lists with hooks** - Use `useHospitalData`, `useBankData`, etc.
5. **Check permissions in handlers** - Verify permissions before mutations
6. **Sanitize data for bank officers** - Use `useSanitizedPatientData`
7. **Test with different roles** - Verify access control works for all roles

---

## 🔄 Role Switching (Development)

For testing, you can temporarily modify the mock user in `AuthContext.tsx`:

```tsx
// contexts/AuthContext.tsx
const mockUser: AuthUser = {
  id: '1',
  email: 'test@hospital.com',
  name: 'Hospital Admin',
  role: UserRole.HOSPITAL_ADMIN, // Change this to test different roles
  hospitalId: 'H001', // Set hospital affiliation
  permissions: ROLE_PERMISSIONS[UserRole.HOSPITAL_ADMIN],
  createdAt: new Date().toISOString(),
  mfaEnabled: true,
  isActive: true,
}
```

---

## 📚 Related Files

- `/types/auth.ts` - Type definitions, permissions enum
- `/contexts/AuthContext.tsx` - Auth provider and hooks
- `/components/auth/Protected.tsx` - Protected component wrapper
- `/hooks/useFilteredData.ts` - Data filtering hooks
- `/hooks/useRouteGuard.ts` - Route protection hook
- `/app/examples/hospital-dashboard/page.tsx` - Example implementation
- `/components/demo/AccessControlDemo.tsx` - Interactive demo

---

## ✅ Migration Checklist

To implement access control in existing pages:

- [ ] Import `useRouteGuard` and add to page
- [ ] Import `useAuth` for user context
- [ ] Replace data arrays with filtered versions using `useHospitalData`, etc.
- [ ] Wrap admin-only components with `<Protected>`
- [ ] Add permission checks to action handlers
- [ ] Test with different user roles
- [ ] Verify data is properly scoped to user's affiliation
