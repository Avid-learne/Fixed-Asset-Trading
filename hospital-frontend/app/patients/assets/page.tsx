'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { getCurrentUser } from '@/lib/auth';

interface Asset {
  id: string;
  type: string;
  quantity: string;
  value: string;
  status: 'verified' | 'pending' | 'rejected';
  date: string;
  tokens: string;
}

export default function MyAssetsPage() {
  const router = useRouter();
  const user = getCurrentUser();

  React.useEffect(() => {
    if (!user || user.role !== 'patient') {
      router.push('/patients/login');
    }
  }, [user, router]);

  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
  });

  const [assets] = useState<Asset[]>([
    {
      id: 'AST-001',
      type: 'Gold Jewelry',
      quantity: '500g',
      value: '$15,500.00',
      status: 'verified',
      date: '2025-11-15',
      tokens: '2,100 HBT',
    },
    {
      id: 'AST-002',
      type: 'Silver Coins',
      quantity: '2kg',
      value: '$8,200.00',
      status: 'verified',
      date: '2025-11-10',
      tokens: '1,100 HBT',
    },
    {
      id: 'AST-003',
      type: 'Medical Equipment',
      quantity: '1 unit',
      value: '$12,550.00',
      status: 'pending',
      date: '2025-11-25',
      tokens: '1,500 HBT',
    },
    {
      id: 'AST-004',
      type: 'Real Estate',
      quantity: '1 property',
      value: '$35,000.00',
      status: 'verified',
      date: '2025-11-01',
      tokens: '4,200 HBT',
    },
    {
      id: 'AST-005',
      type: 'Diamond Ring',
      quantity: '1 piece',
      value: '−$3,000.00',
      status: 'rejected',
      date: '2025-10-28',
      tokens: '−',
    },
  ]);

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    if (filters.type !== 'all' && !asset.type.toLowerCase().includes(filters.type)) return false;
    if (filters.status !== 'all' && asset.status !== filters.status) return false;
    return true;
  });

  // Table columns
  const columns = [
    {
      key: 'id' as const,
      label: 'Asset ID',
      width: '110px',
      align: 'left' as const,
      render: (value: string) => (
        <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '12px' }}>{value}</span>
      ),
    },
    {
      key: 'type' as const,
      label: 'Type',
      width: '150px',
      align: 'left' as const,
    },
    {
      key: 'quantity' as const,
      label: 'Quantity',
      width: '100px',
      align: 'center' as const,
    },
    {
      key: 'value' as const,
      label: 'Value',
      width: '120px',
      align: 'right' as const,
      render: (value: string) => (
        <span style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: '500' }}>{value}</span>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      width: '100px',
      align: 'center' as const,
      render: (value: string) => (
        <StatusBadge status={value as 'verified' | 'pending' | 'rejected'} />
      ),
    },
    {
      key: 'tokens' as const,
      label: 'Tokens Issued',
      width: '120px',
      align: 'right' as const,
      render: (value: string) => (
        <span style={{ fontFamily: 'Roboto Mono, monospace' }}>{value}</span>
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
        <h1 style={styles.title}>My Assets</h1>
      </div>

      {/* Summary Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total Assets</span>
          <span style={styles.statValue}>{assets.length}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Verified</span>
          <span style={styles.statValue}>{assets.filter(a => a.status === 'verified').length}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Pending</span>
          <span style={styles.statValue}>{assets.filter(a => a.status === 'pending').length}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total Value</span>
          <span style={styles.statValue}>$71,250</span>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterCard}>
        <h3 style={styles.filterTitle}>Filters</h3>
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Asset Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              style={styles.filterSelect}
            >
              <option value="all">All Types</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="medical">Medical Equipment</option>
              <option value="real estate">Real Estate</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={styles.filterSelect}
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div style={styles.tableCard}>
        {filteredAssets.length > 0 ? (
          <DataTable data={filteredAssets} columns={columns} striped hoverable />
        ) : (
          <div style={styles.noData}>
            <p>No assets found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => router.push('/patients/deposit')}
        style={styles.depositBtn}
      >
        + Add New Asset
      </button>
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  filterCard: {
    backgroundColor: 'white',
    border: `1px solid var(--color-neutral-200)`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,

  filterTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-neutral-900)',
    margin: '0 0 var(--spacing-md) 0',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  filterRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  } as React.CSSProperties,

  filterLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-neutral-700)',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  filterSelect: {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    border: `1px solid var(--color-neutral-300)`,
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: 'white',
  } as React.CSSProperties,

  tableCard: {
    backgroundColor: 'white',
    border: `1px solid var(--color-neutral-200)`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,

  noData: {
    textAlign: 'center',
    padding: 'var(--spacing-lg)',
    color: 'var(--color-neutral-600)',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  depositBtn: {
    display: 'inline-block',
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
};
