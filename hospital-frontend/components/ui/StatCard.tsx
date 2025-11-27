// hospital-frontend/components/ui/StatCard.tsx
import React from 'react';

export default function StatCard({ 
  label, 
  value, 
  unit = '', 
  icon = null,
  trend = null 
}: { 
  label: string; 
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: { direction: 'up' | 'down'; value: number } | null;
}) {
  return (
    <div style={{
      backgroundColor: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-xl)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-lg)' }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {label}
        </span>
        {icon && <div style={{ color: 'var(--color-primary)' }}>{icon}</div>}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 'var(--spacing-md)',
        marginBottom: trend ? 'var(--spacing-md)' : 0,
      }}>
        <span style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}>
          {value}
        </span>
        {unit && <span style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}>{unit}</span>}
      </div>
      {trend && (
        <span style={{
          fontSize: '12px',
          fontWeight: 500,
          color: trend.direction === 'up' ? 'var(--color-success)' : 'var(--color-danger)',
        }}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
        </span>
      )}
    </div>
  );
}
