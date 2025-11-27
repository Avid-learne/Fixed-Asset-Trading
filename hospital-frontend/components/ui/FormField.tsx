// hospital-frontend/components/ui/FormField.tsx
import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel';
}

export default function FormField({
  label,
  error,
  helper,
  type = 'text',
  ...props
}: FormFieldProps) {
  return (
    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-sm)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        style={{
          width: '100%',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-lg)',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          color: 'var(--color-text-primary)',
          backgroundColor: 'var(--color-bg)',
          transition: 'border-color 0.2s',
          boxSizing: 'border-box',
        }}
        {...props}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-primary)';
          e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(211, 47, 47, 0.1)' : 'rgba(26, 35, 126, 0.1)'}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error && (
        <span style={{
          display: 'block',
          marginTop: 'var(--spacing-sm)',
          fontSize: '12px',
          color: 'var(--color-danger)',
          fontWeight: 500,
        }}>
          {error}
        </span>
      )}
      {helper && !error && (
        <span style={{
          display: 'block',
          marginTop: 'var(--spacing-sm)',
          fontSize: '12px',
          color: 'var(--color-text-tertiary)',
        }}>
          {helper}
        </span>
      )}
    </div>
  );
}
