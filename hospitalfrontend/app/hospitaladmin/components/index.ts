// Reusable UI Components for Hospital Admin System

export { ConfirmDialog } from './ConfirmDialog'
export { LoadingSpinner, LoadingOverlay, LoadingButton } from './LoadingStates'
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary'
export { ToastProvider, useToast } from './Toast'
export { FormField, validators, useFormValidation } from './FormValidation'

// Usage Examples:
//
// 1. ConfirmDialog
// ```tsx
// import { ConfirmDialog } from '@/app/hospitaladmin/components'
// 
// const [showConfirm, setShowConfirm] = useState(false)
// 
// <ConfirmDialog
//   open={showConfirm}
//   onOpenChange={setShowConfirm}
//   onConfirm={handleDelete}
//   title="Delete Patient Record?"
//   description="This action cannot be undone."
//   variant="destructive"
// />
// ```
//
// 2. Loading States
// ```tsx
// import { LoadingSpinner, LoadingOverlay } from '@/app/hospitaladmin/components'
// 
// <LoadingSpinner size="lg" text="Loading data..." />
// 
// <LoadingOverlay loading={isLoading}>
//   <YourContent />
// </LoadingOverlay>
// ```
//
// 3. Error Boundary
// ```tsx
// import { ErrorBoundary } from '@/app/hospitaladmin/components'
// 
// <ErrorBoundary>
//   <YourComponent />
// </ErrorBoundary>
// ```
//
// 4. Toast Notifications
// ```tsx
// import { useToast } from '@/app/hospitaladmin/components'
// 
// const toast = useToast()
// 
// toast.success('Operation completed!')
// toast.error('Something went wrong')
// toast.warning('Please review')
// toast.info('New update available')
// ```
//
// 5. Form Validation
// ```tsx
// import { FormField, validators, useFormValidation } from '@/app/hospitaladmin/components'
// 
// const { values, errors, handleChange, handleBlur, handleSubmit } = useFormValidation(
//   { email: '', amount: 0 },
//   {
//     email: [validators.required, validators.email],
//     amount: [validators.required, validators.min(100)]
//   }
// )
// ```
