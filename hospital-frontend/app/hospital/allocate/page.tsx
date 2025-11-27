'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import FormField from '@/components/ui/FormField';
import { getCurrentUser } from '@/lib/auth';

interface Allocation {
  id: string;
  patient: string;
  amount: string;
  method: 'equal' | 'weighted' | 'custom';
  date: string;
  status: 'pending' | 'distributed' | 'failed';
}

export default function BenefitAllocationPage() {
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
    tradeProfit: '',
    method: 'equal',
    notes: '',
  });

  const [allocations] = useState<Allocation[]>([
    {
      id: 'ALLOC-045',
      patient: 'John Doe',
      amount: '$625.00',
      method: 'equal',
      date: '2025-11-25',
      status: 'distributed',
    },
    {
      id: 'ALLOC-044',
      patient: 'Sarah Smith',
      amount: '$625.00',
      method: 'equal',
      date: '2025-11-25',
      status: 'distributed',
    },
    {
      id: 'ALLOC-043',
      patient: 'Michael Johnson',
      amount: '$1,250.00',
      method: 'weighted',
      date: '2025-11-24',
      status: 'distributed',
    },
    {
      id: 'ALLOC-042',
      patient: 'Emma Wilson',
      amount: '$400.00',
      method: 'custom',
      date: '2025-11-23',
      status: 'pending',
    },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFormData({ tradeProfit: '', method: 'equal', notes: '' });
      setShowForm(false);
      alert('Benefits allocated successfully');
    } catch (err) {
      alert('Failed to allocate benefits');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'id' as const,
      label: 'Allocation ID',
      width: '110px',
      align: 'left' as const,
      render: (value: string) => (
        <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '12px' }}>{value}</span>
      ),
    },
    {
      key: 'patient' as const,
      label: 'Patient',
      width: '140px',
      align: 'left' as const,
    },
    {
      key: 'amount' as const,
      label: 'Amount Allocated',
      width: '130px',
      align: 'right' as const,
      render: (value: string) => (
        <span style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: '500' }}>{value}</span>
      ),
    },
    {
      key: 'method' as const,
      label: 'Method',
      width: '100px',
      align: 'center' as const,
      render: (value: string) => (
        <span style={{ fontSize: '12px', textTransform: 'capitalize', fontWeight: '500' }}>{value}</span>
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
        <StatusBadge status={value as 'pending' | 'distributed' | 'failed'} />
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
        <h1 style={styles.title}>Benefit Allocation</h1>
      </div>

      {/* Summary Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total Distributed</span>
          <span style={styles.statValue}>$3,500.00</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Allocations</span>
          <span style={styles.statValue}>{allocations.length}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Pending</span>
          <span style={styles.statValue}>{allocations.filter(a => a.status === 'pending').length}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Success Rate</span>
          <span style={styles.statValue}>95%</span>
        </div>
      </div>

      {/* Allocate Benefits Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={styles.allocateBtn}
      >
        + Allocate Benefits
      </button>

      {/* Allocation Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Allocate Benefits from Trade Profit</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <FormField
              label="Total Trade Profit (USD)"
              name="tradeProfit"
              type="number"
              value={formData.tradeProfit}
              onChange={handleInputChange}
              placeholder="e.g., 2500"
              required
            />

            <div style={styles.formGroup}>
              <label style={styles.label}>Distribution Method</label>
              <select
                name="method"
                value={formData.method}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="equal">Equal Distribution (All patients)</option>
                <option value="weighted">Weighted by Asset Value</option>
                <option value="custom">Custom Distribution</option>
              </select>
              <p style={styles.methodDesc}>
                {formData.method === 'equal' && 'Distribute equally among all active patients.'}
                {formData.method === 'weighted' && 'Distribute based on each patient\'s total asset value.'}
                {formData.method === 'custom' && 'Manually specify amounts for each patient.'}
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Notes / Trade Details</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add details about this trade profit allocation..."
                style={styles.textarea}
              />
            </div>

            <div style={styles.previewBox}>
              <span style={styles.previewLabel}>Estimated Allocation</span>
              <span style={styles.previewValue}>
                {formData.tradeProfit ? `$${(parseInt(formData.tradeProfit) / 4).toFixed(2)}` : '$0.00'}
              </span>
              <span style={styles.previewText}>per patient (equal split)</span>
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
                {loading ? 'Allocating...' : 'Confirm Allocation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Allocations Table */}
      <div style={styles.tableCard}>
        <h2 style={styles.tableTitle}>Allocation History</h2>
        <DataTable data={allocations} columns={columns} striped hoverable />
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

  allocateBtn: {
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'var(--color-secondary-900)',
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

  select: {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    border: `1px solid var(--color-neutral-300)`,
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: 'white',
  } as React.CSSProperties,

  methodDesc: {
    fontSize: '12px',
    color: 'var(--color-neutral-600)',
    fontStyle: 'italic',
    margin: 'var(--spacing-sm) 0 0 0',
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

  previewBox: {
    backgroundColor: '#f5f5f5',
    border: `1px solid var(--color-neutral-300)`,
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  } as React.CSSProperties,

  previewLabel: {
    fontSize: '12px',
    color: 'var(--color-neutral-600)',
    textTransform: 'uppercase',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  previewValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--color-secondary-900)',
    fontFamily: 'Roboto Mono, monospace',
  } as React.CSSProperties,

  previewText: {
    fontSize: '12px',
    color: 'var(--color-neutral-600)',
    fontFamily: 'Inter, sans-serif',
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
    backgroundColor: 'var(--color-secondary-900)',
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
