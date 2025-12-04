# Hospital Admin Reusable Components

A collection of reusable UI components and utilities for the Hospital Admin system.

## Components Overview

### 1. ConfirmDialog
A reusable confirmation dialog with multiple variants.

**Features:**
- Multiple variants: default, destructive, warning, info
- Loading state support
- Customizable buttons
- Icon indicators

**Usage:**
```tsx
import { ConfirmDialog } from '@/app/hospitaladmin/components'

const [showDialog, setShowDialog] = useState(false)

<ConfirmDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  onConfirm={handleConfirm}
  title="Delete this record?"
  description="This action cannot be undone."
  variant="destructive"
  confirmText="Delete"
  cancelText="Cancel"
  loading={isDeleting}
/>
```

---

### 2. Loading States
Multiple loading components for different use cases.

#### LoadingSpinner
**Usage:**
```tsx
import { LoadingSpinner } from '@/app/hospitaladmin/components'

<LoadingSpinner size="lg" text="Loading data..." />
<LoadingSpinner size="md" fullScreen />
```

#### LoadingOverlay
**Usage:**
```tsx
import { LoadingOverlay } from '@/app/hospitaladmin/components'

<LoadingOverlay loading={isLoading} text="Saving...">
  <YourContent />
</LoadingOverlay>
```

#### LoadingButton
**Usage:**
```tsx
import { LoadingButton } from '@/app/hospitaladmin/components'

<LoadingButton loading={isSubmitting} className="btn-primary">
  Submit Form
</LoadingButton>
```

---

### 3. ErrorBoundary
Catch and handle React component errors gracefully.

**Features:**
- Automatic error catching
- Error details display
- Reset functionality
- Custom fallback support
- HOC wrapper available

**Usage:**
```tsx
import { ErrorBoundary, withErrorBoundary } from '@/app/hospitaladmin/components'

// Wrap component
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Or use HOC
const SafeComponent = withErrorBoundary(YourComponent)
```

---

### 4. Toast Notifications
Context-based toast notification system.

**Features:**
- Multiple types: success, error, warning, info
- Auto-dismiss with configurable duration
- Queue management
- Icon indicators
- Dismissible

**Setup:**
```tsx
// In your layout or root component
import { ToastProvider } from '@/app/hospitaladmin/components'

<ToastProvider>
  <YourApp />
</ToastProvider>
```

**Usage:**
```tsx
import { useToast } from '@/app/hospitaladmin/components'

function YourComponent() {
  const toast = useToast()
  
  const handleSuccess = () => {
    toast.success('Success!', 'Operation completed successfully')
  }
  
  const handleError = () => {
    toast.error('Error!', 'Something went wrong')
  }
  
  const handleWarning = () => {
    toast.warning('Warning!', 'Please review this action')
  }
  
  const handleInfo = () => {
    toast.info('Info', 'New update available')
  }
  
  // Custom duration
  toast.showToast({
    type: 'success',
    title: 'Custom Toast',
    message: 'This will show for 10 seconds',
    duration: 10000
  })
}
```

---

### 5. Form Validation
Comprehensive form validation system with hooks.

**Features:**
- Built-in validators (required, email, phone, URL, Ethereum address, etc.)
- Custom validators support
- Field-level and form-level validation
- Touch tracking
- Easy form handling

**Built-in Validators:**
- `validators.required` - Field must have a value
- `validators.email` - Valid email format
- `validators.minLength(n)` - Minimum character length
- `validators.maxLength(n)` - Maximum character length
- `validators.min(n)` - Minimum numeric value
- `validators.max(n)` - Maximum numeric value
- `validators.phone` - Valid phone number
- `validators.url` - Valid URL
- `validators.ethereum` - Valid Ethereum address
- `validators.pattern(regex, message)` - Custom regex pattern

**Usage:**
```tsx
import { FormField, validators, useFormValidation } from '@/app/hospitaladmin/components'

function MyForm() {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, reset } = useFormValidation(
    {
      email: '',
      password: '',
      amount: 0,
      ethAddress: ''
    },
    {
      email: [validators.required, validators.email],
      password: [validators.required, validators.minLength(8)],
      amount: [validators.required, validators.min(100), validators.max(10000)],
      ethAddress: [validators.required, validators.ethereum]
    }
  )

  const onSubmit = (data) => {
    console.log('Valid form data:', data)
    // Handle submission
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField 
        label="Email" 
        error={touched.email ? errors.email : undefined} 
        required
      >
        <Input
          type="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
        />
      </FormField>

      <FormField 
        label="Password" 
        error={touched.password ? errors.password : undefined} 
        required
      >
        <Input
          type="password"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
        />
      </FormField>

      <FormField 
        label="Amount ($)" 
        error={touched.amount ? errors.amount : undefined} 
        required
      >
        <Input
          type="number"
          value={values.amount}
          onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
          onBlur={() => handleBlur('amount')}
        />
      </FormField>

      <Button type="submit">Submit</Button>
      <Button type="button" variant="outline" onClick={reset}>Reset</Button>
    </form>
  )
}
```

---

## Implementation Examples

### Example 1: Form with Validation and Toast
```tsx
import { FormField, validators, useFormValidation, useToast } from '@/app/hospitaladmin/components'

function PatientForm() {
  const toast = useToast()
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useFormValidation(
    { name: '', email: '', phone: '' },
    {
      name: [validators.required, validators.minLength(3)],
      email: [validators.required, validators.email],
      phone: [validators.required, validators.phone]
    }
  )

  const onSubmit = async (data) => {
    try {
      await savePatient(data)
      toast.success('Success!', 'Patient record created')
    } catch (error) {
      toast.error('Error!', 'Failed to create patient record')
    }
  }

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>
}
```

### Example 2: Data Table with Loading and Error Handling
```tsx
import { LoadingOverlay, ErrorBoundary, useToast } from '@/app/hospitaladmin/components'

function DataTable() {
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    fetchData()
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ErrorBoundary>
      <LoadingOverlay loading={loading} text="Loading records...">
        <Table>...</Table>
      </LoadingOverlay>
    </ErrorBoundary>
  )
}
```

### Example 3: Delete Confirmation with Loading
```tsx
import { ConfirmDialog, useToast } from '@/app/hospitaladmin/components'

function DeleteButton({ recordId }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteRecord(recordId)
      toast.success('Deleted!', 'Record removed successfully')
      setShowConfirm(false)
    } catch (error) {
      toast.error('Error!', 'Failed to delete record')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setShowConfirm(true)} variant="destructive">
        Delete
      </Button>
      
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleDelete}
        title="Delete Record?"
        description="This action cannot be undone."
        variant="destructive"
        loading={deleting}
      />
    </>
  )
}
```

---

## Best Practices

1. **Always wrap your app with ToastProvider** at the root level to use toast notifications
2. **Use ErrorBoundary** for critical components that might fail
3. **Combine validators** for comprehensive form validation
4. **Show loading states** for better UX during async operations
5. **Use confirmation dialogs** for destructive actions
6. **Provide clear error messages** to users

---

## File Structure

```
app/hospitaladmin/components/
├── ConfirmDialog.tsx       # Confirmation dialog component
├── LoadingStates.tsx       # Loading spinner, overlay, button
├── ErrorBoundary.tsx       # Error boundary and HOC
├── Toast.tsx              # Toast notification system
├── FormValidation.tsx     # Form validation utilities
├── index.ts              # Main exports
└── README.md            # This file
```

---

## Dependencies

These components use:
- `@/components/ui/*` - Shadcn UI components
- `lucide-react` - Icons
- `react` - Core React features

Make sure these are installed in your project.
