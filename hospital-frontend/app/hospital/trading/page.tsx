'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import FormField from '@/components/ui/FormField';
import { getCurrentUser } from '@/lib/auth';

interface Trade {
  id: string;
  investment: string;
  profit: string;
  date: string;
  status: 'active' | 'completed' | 'distributed';
}

export default function TradingDeskPage() {
  const router = useRouter();
  const user = getCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!user || user.role !== 'hospital') {
      router.push('/hospital/login');
    }
  }, [user, router]);

  const [formData, setFormData] = useState({
    investment: '',
    profit: '',
    notes: '',
  });

  const [trades] = useState<Trade[]>([
    {
      id: 'TRD-015',
      investment: '5,000 AT',
      profit: '$1,250.00',
      date: '2025-11-25',
      status: 'completed',
    },
    {
      id: 'TRD-014',
      investment: '10,000 AT',
      profit: '$2,800.00',
      date: '2025-11-24',
      status: 'distributed',
    },
    {
      id: 'TRD-013',
      investment: '7,500 AT',
      profit: '$1,890.00',
      date: '2025-11-23',
      status: 'distributed',
    },
    {
      id: 'TRD-012',
      investment: '3,200 AT',
      profit: '$850.00',
      date: '2025-11-22',
      status: 'active',
    },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFormData({ investment: '', profit: '', notes: '' });
      setShowForm(false);
      alert('Trade recorded successfully');
    } catch (err) {
      alert('Failed to record trade');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'id' as const,
      label: 'Trade ID',
      width: '90px',
      align: 'left' as const,
      render: (value: string) => (
        <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '12px' }}>{value}</span>
      ),
    },
    {
      key: 'investment' as const,
      label: 'Investment',
      width: '120px',
      align: 'right' as const,
      render: (value: string) => (
        <span style={{ fontFamily: 'Roboto Mono, monospace' }}>{value}</span>
      ),
    },
    {
      key: 'profit' as const,
      label: 'Profit Earned',
      width: '120px',
      align: 'right' as const,
      render: (value: string) => (
        <span style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: '600', color: 'var(--color-status-success)' }}>{value}</span>
      ),
    },
    {
      key: 'date' as const,
      label: 'Date',
      width: '100px',
      align: 'left' as const,
    },
    {
      key: 'status' as const,
      label: 'Status',
      width: '100px',
      align: 'center' as const,
      render: (value: string) => (
        <StatusBadge status={value as 'active' | 'completed' | 'distributed'} />
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => router.back()} style={styles.backBtn}>
          ← Back
        </button>
        <h1 style={styles.title}>Trading Desk</h1>
      </div>

      {/* Summary Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total Invested</span>
          <span style={styles.statValue}>$258,000</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total Profit</span>
          <span style={styles.statValue}>$64,500</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>ROI</span>
          <span style={styles.statValue}>25%</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Active Trades</span>
          <span style={styles.statValue}>{trades.filter(t => t.status === 'active').length}</span>
        </div>
      </div>

      {/* Record Trade Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={styles.recordBtn}
      >
        + Record New Trade
      </button>

      {/* New Trade Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Record New Trade</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <FormField
              label="Asset Tokens Invested"
              name="investment"
              type="number"
              value={formData.investment}
              onChange={handleInputChange}
              placeholder="e.g., 5000"
              required
            />
            <FormField
              label="Profit Earned (USD)"
              name="profit"
              type="number"
              value={formData.profit}
              onChange={handleInputChange}
              placeholder="e.g., 1250"
              required
            />
            <div style={styles.formGroup}>
              <label style={styles.label}>Trade Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add trade details..."
                style={styles.textarea}
              />
            </div>
            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Recording...' : 'Record Trade'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trades Table */}
      <div style={styles.tableCard}>
        <h2 style={styles.tableTitle}>Recent Trades</h2>
        <DataTable data={trades} columns={columns} striped hoverable />
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 'var(--spacing-lg)',
    maxWidth: '1280px',
    margin: '0 auto',
    backgroundColor: '#fafafa',
    minHeight: '100vh',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-lg)',
  } as React.CSSProperties,

  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary-900)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'var(--color-primary-900)',
    margin: 0,
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-lg)',
  } as React.CSSProperties,

  statBox: {
    backgroundColor: 'white',
    border: `1px solid var(--color-neutral-200)`,
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,

  statLabel: {
    fontSize: '12px',
    color: 'var(--color-neutral-600)',
    textTransform: 'uppercase',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--color-primary-900)',
    marginTop: 'var(--spacing-sm)',
    fontFamily: 'Roboto Mono, monospace',
  } as React.CSSProperties,

  recordBtn: {
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'var(--color-primary-900)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    marginBottom: 'var(--spacing-lg)',
  } as React.CSSProperties,

  formCard: {
    backgroundColor: 'white',
    border: `1px solid var(--color-neutral-200)`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,

  formTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-primary-900)',
    margin: '0 0 var(--spacing-md) 0',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  } as React.CSSProperties,

  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-neutral-700)',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  textarea: {
    padding: 'var(--spacing-md)',
    border: `1px solid var(--color-neutral-300)`,
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    minHeight: '80px',
  } as React.CSSProperties,

  formActions: {
    display: 'flex',
    gap: 'var(--spacing-md)',
    marginTop: 'var(--spacing-md)',
  } as React.CSSProperties,

  cancelBtn: {
    flex: 1,
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'transparent',
    border: `1px solid var(--color-neutral-300)`,
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    color: 'var(--color-neutral-700)',
  } as React.CSSProperties,

  submitBtn: {
    flex: 1,
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'var(--color-primary-900)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  tableCard: {
    backgroundColor: 'white',
    border: `1px solid var(--color-neutral-200)`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,

  tableTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-primary-900)',
    margin: '0 0 var(--spacing-md) 0',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,
};
