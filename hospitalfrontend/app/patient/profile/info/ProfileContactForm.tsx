'use client'

import { useEffect, useMemo, useState } from 'react'
import { CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePatientProfileStore } from '@/store/patientProfileStore'
import { profileService } from '@/services/profileService'
import { authService } from '@/lib/authService'

type FormState = {
  fullName: string
  email: string
  phone: string
  city: string
  address: string
  bloodGroup: string
  dateOfBirth: string
  walletAddress: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

type ProfileContactFormProps = {
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  showCancelButton?: boolean
  pendingLabel?: string
  successMessage?: string
}

const defaultMessages = {
  submitLabel: 'Save changes',
  cancelLabel: 'Cancel',
  pendingLabel: 'Saving…',
  successMessage: 'Profile updated successfully.',
}

export function ProfileContactForm({
  onCancel,
  submitLabel = defaultMessages.submitLabel,
  cancelLabel = defaultMessages.cancelLabel,
  showCancelButton = true,
  pendingLabel = defaultMessages.pendingLabel,
  successMessage = defaultMessages.successMessage,
}: ProfileContactFormProps) {
  const { profile, updateProfile } = usePatientProfileStore()
  const initialFormState = useMemo<FormState>(
    () => ({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      city: profile.city,
      address: profile.address,
      bloodGroup: profile.bloodGroup,
      dateOfBirth: profile.dateOfBirth,
      walletAddress: profile.walletAddress,
    }),
    [
      profile.fullName,
      profile.email,
      profile.phone,
      profile.city,
      profile.address,
      profile.bloodGroup,
      profile.dateOfBirth,
      profile.walletAddress,
    ],
  )

  const [form, setForm] = useState<FormState>(initialFormState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    setForm(initialFormState)
  }, [initialFormState])

  const validate = (state: FormState): FormErrors => {
    const nextErrors: FormErrors = {}

    if (!state.fullName.trim()) {
      nextErrors.fullName = 'Please enter your full name.'
    }
    if (!state.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!state.phone.trim()) {
      nextErrors.phone = 'Phone number is required.'
    }
    if (!state.city.trim()) {
      nextErrors.city = 'City is required.'
    }
    if (!state.address.trim()) {
      nextErrors.address = 'Address is required.'
    }
    if (state.dateOfBirth.trim() && Number.isNaN(Date.parse(state.dateOfBirth))) {
      nextErrors.dateOfBirth = 'Use a valid date.'
    }

    return nextErrors
  }

  const handleChange = (field: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = event.target
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    if (savedMessage) {
      setSavedMessage('')
    }
  }

  const resetForm = () => {
    setForm(initialFormState)
    setErrors({})
    setSavedMessage('')
  }

  const handleCancel = () => {
    resetForm()
    onCancel?.()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setSavedMessage('')
      return
    }

    setSubmitting(true)
    setSavedMessage('')

    try {
      // Get current user
      const user = authService.getUser()
      if (!user || !user.id) {
        throw new Error('User not authenticated')
      }

      // Call backend API to update profile
      const updatedProfile = await profileService.updateProfile(user.id, {
        name: form.fullName,
        phoneNum: form.phone,
        city: form.city,
        address: form.address,
        bloodGroup: form.bloodGroup,
        dateOfBirth: form.dateOfBirth,
      })

      if (form.walletAddress.trim() && form.walletAddress.trim() !== profile.walletAddress) {
        await profileService.updateWalletAddress(user.id, form.walletAddress.trim())
      }

      // Update local store
      updateProfile({
        fullName: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phoneNum,
        city: updatedProfile.city || '',
        address: updatedProfile.address || '',
        bloodGroup: updatedProfile.bloodGroup || '',
        dateOfBirth: updatedProfile.dateOfBirth || '',
        walletAddress: form.walletAddress.trim() || updatedProfile.walletAddress || '',
      })

      setSubmitting(false)
      setSavedMessage(successMessage)
    } catch (error) {
      setSubmitting(false)
      setSavedMessage('')
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      setErrors({ fullName: errorMessage })
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={handleChange('fullName')}
              placeholder="Enter your full legal name"
              aria-invalid={Boolean(errors.fullName)}
            />
            {errors.fullName && <p className="text-sm text-error">{errors.fullName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              readOnly
              disabled
              placeholder="name@example.com"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="text-sm text-error">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="e.g. +92 300 1234567"
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone && <p className="text-sm text-error">{errors.phone}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={handleChange('city')}
              placeholder="e.g. Karachi"
              aria-invalid={Boolean(errors.city)}
            />
            {errors.city && <p className="text-sm text-error">{errors.city}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={handleChange('address')}
              placeholder="Street, area, city"
              aria-invalid={Boolean(errors.address)}
            />
            {errors.address && <p className="text-sm text-error">{errors.address}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <Input
              id="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange('bloodGroup')}
              placeholder="e.g. B+"
              aria-invalid={Boolean(errors.bloodGroup)}
            />
            {errors.bloodGroup && <p className="text-sm text-error">{errors.bloodGroup}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange('dateOfBirth')}
              aria-invalid={Boolean(errors.dateOfBirth)}
            />
            {errors.dateOfBirth && <p className="text-sm text-error">{errors.dateOfBirth}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <Input
              id="walletAddress"
              value={form.walletAddress}
              onChange={handleChange('walletAddress')}
              placeholder="0x..."
              aria-invalid={Boolean(errors.walletAddress)}
            />
            {errors.walletAddress && <p className="text-sm text-error">{errors.walletAddress}</p>}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className={cn('text-sm', savedMessage ? 'text-success' : 'text-muted-foreground')}>
          {savedMessage || 'Changes save to your account and synced devices.'}
        </div>
        <div className="flex gap-2">
          {showCancelButton && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? pendingLabel : submitLabel}
          </Button>
        </div>
      </CardFooter>
    </form>
  )
}
