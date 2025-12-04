import React from 'react'
import { Check, X } from 'lucide-react'

interface SwitchToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SwitchToggle({ 
  enabled, 
  onChange, 
  disabled = false, 
  label,
  description,
  size = 'md'
}: SwitchToggleProps) {
  const sizeClasses = {
    sm: 'w-9 h-5',
    md: 'w-11 h-6',
    lg: 'w-14 h-7'
  }

  const dotSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const translateClasses = {
    sm: 'translate-x-4',
    md: 'translate-x-5',
    lg: 'translate-x-7'
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => !disabled && onChange(!enabled)}
        className={`
          relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
          ${sizeClasses[size]}
          ${enabled ? 'bg-cyan-600' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
        `}
      >
        <span
          className={`
            ${dotSizeClasses[size]}
            inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
            ${enabled ? translateClasses[size] : 'translate-x-0.5'}
            flex items-center justify-center
          `}
        >
          {enabled ? (
            <Check className="w-3 h-3 text-cyan-600" />
          ) : (
            <X className="w-3 h-3 text-gray-400" />
          )}
        </span>
      </button>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <div className="text-sm font-medium text-gray-900">{label}</div>
          )}
          {description && (
            <div className="text-xs text-gray-600">{description}</div>
          )}
        </div>
      )}
    </div>
  )
}
