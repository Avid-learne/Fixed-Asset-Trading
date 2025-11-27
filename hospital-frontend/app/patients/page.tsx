'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { getCurrentUser } from '@/lib/auth';

// Type definitions
interface Activity {
  id: string;
  date: string;
  type: 'deposit' | 'trading' | 'redemption' | 'allocation';
  amount: string;
  status: 'completed' | 'pending' | 'approved';
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  color: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const user = getCurrentUser();

  // Redirect if not authenticated or wrong role
  React.useEffect(() => {
    if (!user || user.role !== 'patient') {
      router.push('/patients/login');
    }
  }, [user, router]);

  // Mock data - replace with API calls
  const [statistics] = useState({
    totalAssetValue: '$47,250.00',
    healthTokens: '2,450 HBT',
    benefitsEarned: '$8,920.00',
    activeRequests: '3',
  });

  const [recentActivity] = useState<Activity[]>([
    {
      id: '1',
      date: '2025-11-27',
      type: 'deposit',
      amount: '$5,000.00',
      status: 'completed',
    },
    {
      id: '2',
      date: '2025-11-25',
      type: 'trading',
      amount: '$2,300.00',
      status: 'completed',
    },
    {
      id: '3',
      date: '2025-11-23',
      type: 'allocation',
      amount: '$1,250.00',
      status: 'approved',
    },
    {
      id: '4',
      date: '2025-11-20',
      type: 'redemption',
      amount: '$500.00',
      status: 'pending',
    },
  ]);

  const [quickActions] = useState<QuickAction[]>([
    {
      id: 'deposit',
      label: 'Deposit Assets',
      icon: '📥',
      href: '/patients/deposit',
      color: '#1a237e',
    },
    {
      id: 'assets',
      label: 'View My Assets',
      icon: '💼',
      href: '/patients/assets',
      color: '#00695c',
    },
    {
      id: 'redeem',
      label: 'Redeem Benefits',
      icon: '🎁',
      href: '/patients/redeem',
      color: '#d32f2f',
    },
    {
      id: 'history',
      label: 'Transaction History',
      icon: '📊',
      href: '/patients/history',
      color: '#ff9800',
    },
  ]);

  // Activity type mapper
  const activityTypeLabels: Record<string, string> = {
    deposit: 'Asset Deposit',
    trading: 'Trading Income',
    redemption: 'Benefit Redeemed',
    allocation: 'Profit Allocated',
  };

  // DataTable columns for recent activity
  const activityColumns = [
    {
      key: 'date' as const,
      label: 'Date',
      width: '90px',
      align: 'left' as const,
    },
    {
      key: 'type' as const,
      label: 'Activity Type',
      width: '150px',
      align: 'left' as const,
      render: (value: string) => activityTypeLabels[value] || value,
    },
    {
      key: 'amount' as const,
      label: 'Amount',
      width: '110px',
      align: 'right' as const,
      render: (value: string) => (
        <span style={{ fontFamily: 'Roboto Mono, monospace' }}>{value}</span>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      width: '100px',
      align: 'center' as const,
      render: (value: string) => (
        <StatusBadge status={value as 'completed' | 'pending' | 'approved'} />
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Patient Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {user?.name || 'Patient'}</p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('user');
            router.push('/patients/login');
          }}
          style={styles.logoutBtn}
        >
          Logout
        </button>
      </div>

      {/* Statistics Grid */}
      <div style={styles.statsGrid}>
        <StatCard
          label="Total Asset Value"
          value={statistics.totalAssetValue}
          unit="USD"
          trend={{ direction: 'up', percentage: '12.5' }}
        />
        <StatCard
          label="Health Tokens"
          value={statistics.healthTokens}
          unit="HBT"
          trend={{ direction: 'up', percentage: '8.2' }}
        />
        <StatCard
          label="Benefits Earned"
          value={statistics.benefitsEarned}
          unit="USD"
          trend={{ direction: 'up', percentage: '5.3' }}
        />
        <StatCard
          label="Active Requests"
          value={statistics.activeRequests}
          unit="pending"
          trend={{ direction: 'up', percentage: '2' }}
        />
      </div>

      {/* Recent Activity Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Activity</h2>
        <DataTable data={recentActivity} columns={activityColumns} striped />
      </div>

      {/* Quick Actions Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => router.push(action.href)}
              style={{
                ...styles.actionCard,
                borderTopColor: action.color,
              }}
            >
              <span style={styles.actionIcon}>{action.icon}</span>
              <span style={styles.actionLabel}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Inline styles using CSS variables
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 'var(--spacing-xl)',
  } as React.CSSProperties,

  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'var(--color-primary-900)',
    margin: '0 0 var(--spacing-sm) 0',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '14px',
    color: 'var(--color-neutral-600)',
    margin: 0,
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  logoutBtn: {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    backgroundColor: 'transparent',
    border: `1px solid var(--color-neutral-300)`,
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-neutral-700)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-xl)',
  } as React.CSSProperties,

  section: {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-lg)',
    border: `1px solid var(--color-neutral-200)`,
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--color-primary-900)',
    margin: '0 0 var(--spacing-md) 0',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  actionCard: {
    padding: 'var(--spacing-md)',
    backgroundColor: 'white',
    border: `1px solid var(--color-neutral-200)`,
    borderTopWidth: '4px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  actionIcon: {
    fontSize: '24px',
  } as React.CSSProperties,

  actionLabel: {
    fontWeight: '500',
    color: 'var(--color-neutral-700)',
    textAlign: 'center',
  } as React.CSSProperties,
};