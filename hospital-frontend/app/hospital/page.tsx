'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { getCurrentUser } from '@/lib/auth';

interface PatientOverview {
  id: string;
  name: string;
  assetsCount: number;
  totalValue: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
}

interface Approval {
  id: string;
  type: string;
  patient: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export default function HospitalDashboard() {
  const router = useRouter();
  const user = getCurrentUser();

  React.useEffect(() => {
    if (!user || user.role !== 'hospital') {
      router.push('/hospital/login');
    }
  }, [user, router]);

  const [statistics] = useState({
    totalPatients: '287',
    activeAssets: '$1,245,000.00',
    pendingTrades: '12',
    profitDistributed: '$85,320.00',
  });

  const [patients] = useState<PatientOverview[]>([
    {
      id: 'PAT-001',
      name: 'John Doe',
      assetsCount: 3,
      totalValue: '$47,250.00',
      status: 'active',
      joinDate: '2025-06-15',
    },
    {
      id: 'PAT-002',
      name: 'Sarah Smith',
      assetsCount: 2,
      totalValue: '$32,100.00',
      status: 'active',
      joinDate: '2025-07-22',
    },
    {
      id: 'PAT-003',
      name: 'Michael Johnson',
      assetsCount: 5,
      totalValue: '$89,500.00',
      status: 'active',
      joinDate: '2025-05-08',
    },
    {
      id: 'PAT-004',
      name: 'Emma Wilson',
      assetsCount: 1,
      totalValue: '$15,750.00',
      status: 'pending',
      joinDate: '2025-11-20',
    },
  ]);

  const [pendingApprovals] = useState<Approval[]>([
    {
      id: 'APR-001',
      type: 'Asset Verification',
      patient: 'John Doe',
      amount: '$5,000.00',
      status: 'pending',
      date: '2025-11-25',
    },
    {
      id: 'APR-002',
      type: 'Trading Request',
      patient: 'Sarah Smith',
      amount: '$2,300.00',
      status: 'pending',
      date: '2025-11-26',
    },
    {
      id: 'APR-003',
      type: 'Benefit Allocation',
      patient: 'Michael Johnson',
      amount: '$8,500.00',
      status: 'approved',
      date: '2025-11-23',
    },
  ]);

  // Patient columns
  const patientColumns = [
    {
      key: 'id' as const,
      label: 'Patient ID',
      width: '90px',
      align: 'left' as const,
      render: (value: string) => (
        <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '12px' }}>{value}</span>
      ),
    },
    {
      key: 'name' as const,
      label: 'Name',
      width: '140px',
      align: 'left' as const,
    },
    {
      key: 'assetsCount' as const,
      label: 'Assets',
      width: '80px',
      align: 'center' as const,
    },
    {
      key: 'totalValue' as const,
      label: 'Total Value',
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
        <StatusBadge status={value as 'active' | 'inactive' | 'pending'} />
      ),
    },
  ];

  // Approval columns
  const approvalColumns = [
    {
      key: 'id' as const,
      label: 'Request ID',
      width: '90px',
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
      key: 'patient' as const,
      label: 'Patient',
      width: '140px',
      align: 'left' as const,
    },
    {
      key: 'amount' as const,
      label: 'Amount',
      width: '120px',
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
        <StatusBadge status={value as 'pending' | 'approved' | 'rejected'} />
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Hospital Dashboard</h1>
          <p style={styles.subtitle}>Overview of patient assets and operations</p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('user');
            router.push('/hospital/login');
          }}
          style={styles.logoutBtn}
        >
          Logout
        </button>
      </div>

      {/* Statistics Grid */}
      <div style={styles.statsGrid}>
        <StatCard
          label="Total Patients"
          value={statistics.totalPatients}
          unit="verified"
          trend={{ direction: 'up', percentage: '5.2' }}
        />
        <StatCard
          label="Active Assets"
          value={statistics.activeAssets}
          unit="USD"
          trend={{ direction: 'up', percentage: '12.8' }}
        />
        <StatCard
          label="Pending Trades"
          value={statistics.pendingTrades}
          unit="in queue"
          trend={{ direction: 'up', percentage: '2' }}
        />
        <StatCard
          label="Profit Distributed"
          value={statistics.profitDistributed}
          unit="YTD"
          trend={{ direction: 'up', percentage: '18.5' }}
        />
      </div>

      {/* Patient Overview Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Patient Overview</h2>
          <button
            onClick={() => router.push('/hospital/patients')}
            style={styles.viewAllBtn}
          >
            View All →
          </button>
        </div>
        <DataTable data={patients} columns={patientColumns} striped hoverable />
      </div>

      {/* Pending Approvals Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Pending Approvals</h2>
          <button
            onClick={() => router.push('/hospital/requests')}
            style={styles.viewAllBtn}
          >
            View All →
          </button>
        </div>
        {pendingApprovals.length > 0 ? (
          <DataTable data={pendingApprovals} columns={approvalColumns} striped />
        ) : (
          <p style={styles.noData}>No pending approvals</p>
        )}
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <button
            onClick={() => router.push('/hospital/patients')}
            style={styles.actionBtn}
          >
            Manage Patients
          </button>
          <button
            onClick={() => router.push('/hospital/requests')}
            style={styles.actionBtn}
          >
            Review Requests
          </button>
          <button
            onClick={() => router.push('/hospital/trading')}
            style={styles.actionBtn}
          >
            Trading Desk
          </button>
          <button
            onClick={() => router.push('/hospital/allocate')}
            style={styles.actionBtn}
          >
            Allocate Benefits
          </button>
        </div>
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

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-md)',
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--color-primary-900)',
    margin: 0,
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  viewAllBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary-900)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  noData: {
    fontSize: '14px',
    color: 'var(--color-neutral-600)',
    padding: 'var(--spacing-lg)',
    margin: 0,
    textAlign: 'center',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  actionBtn: {
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'var(--color-primary-900)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s',
  } as React.CSSProperties,
};