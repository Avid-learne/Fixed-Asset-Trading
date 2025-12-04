'use client'

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  containerClassName?: string
}

export interface FormTextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helperText?: string
  containerClassName?: string
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, containerClassName, className, id, ...props }, ref) => {
    const { label: _l, error: _e, helperText: _h, containerClassName: _c, ...inputProps } = props as any
    const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`
    
    return (
      <div className={cn("space-y-2", containerClassName)}>
        <Label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={inputId}
          ref={ref}
          className={cn(
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

const FormTextareaField = React.forwardRef<HTMLTextAreaElement, FormTextareaFieldProps>(
  ({ label, error, helperText, containerClassName, className, id, ...props }, ref) => {
    const { label: _l, error: _e, helperText: _h, containerClassName: _c, ...textareaProps } = props as any
    const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`
    
    return (
      <div className={cn("space-y-2", containerClassName)}>
        <Label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Textarea
          id={inputId}
          ref={ref}
          className={cn(
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          {...(textareaProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)
FormTextareaField.displayName = "FormTextareaField"

export { FormField, FormTextareaField }
