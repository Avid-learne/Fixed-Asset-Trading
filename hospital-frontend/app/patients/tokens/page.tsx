'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import StatCard from '@/components/ui/StatCard';
import { getCurrentUser } from '@/lib/auth';

interface TokenTransaction {
  id: string;
  date: string;
  type: 'issued' | 'redeemed' | 'allocated';
  amount: string;
  source: string;
  status: 'completed' | 'pending';
}

export default function HealthTokensPage() {
  const router = useRouter();
  const user = getCurrentUser();

  React.useEffect(() => {
    if (!user || user.role !== 'patient') {
      router.push('/patients/login');
    }
  }, [user, router]);

  const [transactions] = useState<TokenTransaction[]>([
    {
      id: 'HT-001',
      date: '2025-11-27',
      type: 'allocated',
      amount: '250 HBT',
      source: 'Profit Distribution',
      status: 'completed',
    },
    {
      id: 'HT-002',
      date: '2025-11-20',
      type: 'issued',
      amount: '500 HBT',
      source: 'Asset AST-001 Verified',
      status: 'completed',
    },
    {
      id: 'HT-003',
      date: '2025-11-18',
      type: 'redeemed',
      amount: '−100 HBT',
      source: 'Benefit Redemption',
      status: 'completed',
    },
    {
      id: 'HT-004',
      date: '2025-11-15',
      type: 'issued',
      amount: '450 HBT',
      source: 'Asset AST-002 Verified',
      status: 'completed',
    },
    {
      id: 'HT-005',
      date: '2025-11-10',
      type: 'allocated',
      amount: '175 HBT',
      source: 'Monthly Allocation',
      status: 'pending',
    },
  ]);

  // Table columns
  const columns = [
    {
      key: 'date' as const,
      label: 'Date',
      width: '90px',
      align: 'left' as const,
    },
    {
      key: 'type' as const,
      label: 'Type',
      width: '100px',
      align: 'left' as const,
      render: (value: string) => {
        const typeLabels: Record<string, string> = {
          issued: 'Issued',
          redeemed: 'Redeemed',
          allocated: 'Allocated',
        };
        return typeLabels[value] || value;
      },
    },
    {
      key: 'amount' as const,
      label: 'Amount',
      width: '100px',
      align: 'right' as const,
      render: (value: string) => (
        <span style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: '500' }}>{value}</span>
      ),
    },
    {
      key: 'source' as const,
      label: 'Source',
      width: '200px',
      align: 'left' as const,
    },
    {
      key: 'status' as const,
      label: 'Status',
      width: '90px',
      align: 'center' as const,
      render: (value: string) => (
        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: value === 'completed' ? '#e8f5e9' : '#fff3e0',
            color: value === 'completed' ? '#2e7d32' : '#f57f17',
          }}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
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
        <h1 style={styles.title}>Health Tokens</h1>
      </div>

      {/* Balance Cards */}
      <div style={styles.balanceGrid}>
        <StatCard
          label="Current Balance"
          value="2,450"
          unit="HBT"
          trend={{ direction: 'up', value: 8.5 }}
        />
        <StatCard
          label="Tokens Issued"
          value="3,200"
          unit="HBT"
          trend={{ direction: 'up', value: 15 }}
        />
        <StatCard
          label="Tokens Redeemed"
          value="750"
          unit="HBT"
          trend={{ direction: 'down', value: 3.2 }}
        />
        <StatCard
          label="Conversion Rate"
          value="1 HBT"
          unit="≈ $2.50"
        />
      </div>

      {/* Conversion Info */}
      <div style={styles.infoCard}>
        <h3 style={styles.infoTitle}>Conversion & Usage</h3>
        <div style={styles.infoGrid}>
          <div style={styles.infoBullet}>
            <span style={styles.infoBulletTitle}>1 HBT = $2.50 USD</span>
            <span style={styles.infoBulletDesc}>Approximate market value</span>
          </div>
          <div style={styles.infoBullet}>
            <span style={styles.infoBulletTitle}>Redeemable Benefits</span>
            <span style={styles.infoBulletDesc}>Healthcare services & products</span>
          </div>
          <div style={styles.infoBullet}>
            <span style={styles.infoBulletTitle}>Transferable</span>
            <span style={styles.infoBulletDesc}>Between verified accounts</span>
          </div>
          <div style={styles.infoBullet}>
            <span style={styles.infoBulletTitle}>Tax Eligible</span>
            <span style={styles.infoBulletDesc}>Healthcare deductions apply</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Transaction History</h2>
        <DataTable data={transactions} columns={columns} striped />
      </div>

      {/* Action Button */}
      <button
        onClick={() => router.push('/patients/redeem')}
        style={styles.redeemBtn}
      >
        Redeem Benefits
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

  balanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-lg)',
  } as React.CSSProperties,

  infoCard: {
    backgroundColor: 'white',
    border: `1px solid var(--color-neutral-200)`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,

  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-primary-900)',
    margin: '0 0 var(--spacing-md) 0',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  infoBullet: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  } as React.CSSProperties,

  infoBulletTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-neutral-900)',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  infoBulletDesc: {
    fontSize: '12px',
    color: 'var(--color-neutral-600)',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  section: {
    backgroundColor: 'white',
    border: `1px solid var(--color-neutral-200)`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-primary-900)',
    margin: '0 0 var(--spacing-md) 0',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  redeemBtn: {
    display: 'inline-block',
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
};
