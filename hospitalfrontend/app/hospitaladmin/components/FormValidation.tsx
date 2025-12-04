'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

// Validation helpers
export const validators = {
  required: (value: any) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required'
    }
    return undefined
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return undefined
  },

  minLength: (min: number) => (value: string) => {
    if (value.length < min) {
      return `Must be at least ${min} characters`
    }
    return undefined
  },

  maxLength: (max: number) => (value: string) => {
    if (value.length > max) {
      return `Must be no more than ${max} characters`
    }
    return undefined
  },

  min: (min: number) => (value: number) => {
    if (value < min) {
      return `Must be at least ${min}`
    }
    return undefined
  },

  max: (max: number) => (value: number) => {
    if (value > max) {
      return `Must be no more than ${max}`
    }
    return undefined
  },

  pattern: (regex: RegExp, message: string) => (value: string) => {
    if (!regex.test(value)) {
      return message
    }
    return undefined
  },

  phone: (value: string) => {
    const phoneRegex = /^\+?[\d\s\-()]+$/
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid phone number'
    }
    return undefined
  },

  url: (value: string) => {
    try {
      new URL(value)
      return undefined
    } catch {
      return 'Please enter a valid URL'
    }
  },

  ethereum: (value: string) => {
    const ethRegex = /^0x[a-fA-F0-9]{40}$/
    if (!ethRegex.test(value)) {
      return 'Please enter a valid Ethereum address'
    }
    return undefined
  },
}

// Form validation hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, Array<(value: any) => string | undefined>>>
) {
  const [values, setValues] = React.useState<T>(initialValues)
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({})

  const validate = (fieldName?: keyof T) => {
    const newErrors: Partial<Record<keyof T, string>> = {}

    const fieldsToValidate = fieldName ? [fieldName] : (Object.keys(validationRules) as Array<keyof T>)

    fieldsToValidate.forEach((field) => {
      const fieldValidators = validationRules[field]
      if (fieldValidators) {
        for (const validator of fieldValidators) {
          const error = validator(values[field])
          if (error) {
            newErrors[field] = error
            break
          }
        }
      }
    })

    if (fieldName) {
      setErrors((prev) => ({ ...prev, [fieldName]: newErrors[fieldName] }))
    } else {
      setErrors(newErrors)
    }

    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (touched[field]) {
      validate(field)
    }
  }

  const handleBlur = (field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validate(field)
  }

  const handleSubmit = (onSubmit: (values: T) => void) => {
    return (e: React.FormEvent) => {
      e.preventDefault()
      const isValid = validate()
      if (isValid) {
        onSubmit(values)
      }
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0,
  }
}

// Example usage component
export function ExampleForm() {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useFormValidation(
    {
      email: '',
      password: '',
      amount: 0,
    },
    {
      email: [validators.required, validators.email],
      password: [validators.required, validators.minLength(8)],
      amount: [validators.required, validators.min(100)],
    }
  )

  const onSubmit = (data: typeof values) => {
    console.log('Form submitted:', data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Email" error={touched.email ? errors.email : undefined} required>
        <Input
          type="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
        />
      </FormField>

      <FormField label="Password" error={touched.password ? errors.password : undefined} required>
        <Input
          type="password"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
        />
      </FormField>

      <FormField label="Amount" error={touched.amount ? errors.amount : undefined} required>
        <Input
          type="number"
          value={values.amount}
          onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
          onBlur={() => handleBlur('amount')}
        />
      </FormField>

      <button type="submit" className="btn-primary">
        Submit
      </button>
    </form>
  )
}
