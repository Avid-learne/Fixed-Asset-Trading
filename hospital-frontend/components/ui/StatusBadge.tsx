// hospital-frontend/components/ui/StatusBadge.tsx
import React from 'react';

type Status = 'pending' | 'approved' | 'rejected' | 'completed' | 'active' | 'inactive' | 'warning' | 'verified' | 'distributed' | 'failed';

const statusColors: Record<Status, { bg: string; text: string; border: string }> = {
  pending: { bg: '#fff3e0', text: '#e65100', border: '#ffb74d' },
  approved: { bg: '#e8f5e9', text: '#1b5e20', border: '#81c784' },
  rejected: { bg: '#ffebee', text: '#b71c1c', border: '#e57373' },
  completed: { bg: '#e0f2f1', text: '#004d40', border: '#4db6ac' },
  active: { bg: '#e8f5e9', text: '#1b5e20', border: '#81c784' },
  inactive: { bg: '#f5f5f5', text: '#424242', border: '#bdbdbd' },
  warning: { bg: '#fff3e0', text: '#e65100', border: '#ffb74d' },
  verified: { bg: '#e8f5e9', text: '#1b5e20', border: '#81c784' },
  distributed: { bg: '#e0f2f1', text: '#004d40', border: '#4db6ac' },
  failed: { bg: '#ffebee', text: '#b71c1c', border: '#e57373' },
};

export default function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const colors = statusColors[status];
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      backgroundColor: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      borderRadius: 'var(--radius-md)',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
