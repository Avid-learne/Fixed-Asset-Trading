'use client'

import { useEffect, useMemo, useState } from 'react'
import { CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePatientProfileStore } from '@/store/patientProfileStore'

type FormState = {
  fullName: string
  email: string
  phone: string
  location: string
  bio: string
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
      location: profile.location,
      bio: profile.bio,
    }),
    [profile.fullName, profile.email, profile.phone, profile.location, profile.bio],
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
    if (!state.location.trim()) {
      nextErrors.location = 'Tell us where you are based.'
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

    await new Promise(resolve => setTimeout(resolve, 1000))

    updateProfile({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      location: form.location,
      bio: form.bio,
    })

    setSubmitting(false)
    setSavedMessage(successMessage)
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
              onChange={handleChange('email')}
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
            <Label htmlFor="location">City &amp; country</Label>
            <Input
              id="location"
              value={form.location}
              onChange={handleChange('location')}
              placeholder="Where are you based?"
              aria-invalid={Boolean(errors.location)}
            />
            {errors.location && <p className="text-sm text-error">{errors.location}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio (optional)</Label>
          <Textarea
            id="bio"
            rows={4}
            value={form.bio}
            onChange={handleChange('bio')}
            placeholder="Share a short note to help hospitals understand your goals."
          />
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
