'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { getCurrentUser } from '@/lib/auth';

interface Patient {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  assetsValue: string;
  status: 'active' | 'inactive' | 'pending';
}

export default function PatientManagementPage() {
  const router = useRouter();
  const user = getCurrentUser();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  React.useEffect(() => {
    if (!user || user.role !== 'hospital') {
      router.push('/hospital/login');
    }
  }, [user, router]);

  const [filters, setFilters] = useState({
    status: 'all',
  });

  const [patients] = useState<Patient[]>([
    {
      id: 'PAT-001',
      name: 'John Doe',
      email: 'john.doe@email.com',
      joinDate: '2025-06-15',
      assetsValue: '$47,250.00',
      status: 'active',
    },
    {
      id: 'PAT-002',
      name: 'Sarah Smith',
      email: 'sarah.smith@email.com',
      joinDate: '2025-07-22',
      assetsValue: '$32,100.00',
      status: 'active',
    },
    {
      id: 'PAT-003',
      name: 'Michael Johnson',
      email: 'michael.j@email.com',
      joinDate: '2025-05-08',
      assetsValue: '$89,500.00',
      status: 'active',
    },
    {
      id: 'PAT-004',
      name: 'Emma Wilson',
      email: 'emma.w@email.com',
      joinDate: '2025-11-20',
      assetsValue: '$15,750.00',
      status: 'pending',
    },
    {
      id: 'PAT-005',
      name: 'David Brown',
      email: 'david.brown@email.com',
      joinDate: '2025-03-10',
      assetsValue: '−',
      status: 'inactive',
    },
  ]);

  const filteredPatients = patients.filter(p => {
    if (filters.status !== 'all' && p.status !== filters.status) return false;
    return true;
  });

  const columns = [
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
      key: 'email' as const,
      label: 'Email',
      width: '180px',
      align: 'left' as const,
    },
    {
      key: 'joinDate' as const,
      label: 'Join Date',
      width: '100px',
      align: 'left' as const,
    },
    {
      key: 'assetsValue' as const,
      label: 'Assets Value',
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
        <StatusBadge status={value as 'active' | 'inactive' | 'pending'} />
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
        <h1 style={styles.title}>Patient Management</h1>
      </div>

      {/* Filters */}
      <div style={styles.filterCard}>
        <label style={styles.filterLabel}>Filter by Status</label>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Patients Table */}
      <div style={styles.tableCard}>
        <DataTable
          data={filteredPatients}
          columns={columns}
          striped
          hoverable
        />
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <button onClick={() => setSelectedPatient(null)} style={styles.closeBtn}>×</button>
            <h2 style={styles.modalTitle}>{selectedPatient.name}</h2>
            <div style={styles.modalContent}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Patient ID:</span>
                <span style={styles.detailValue}>{selectedPatient.id}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Email:</span>
                <span style={styles.detailValue}>{selectedPatient.email}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Join Date:</span>
                <span style={styles.detailValue}>{selectedPatient.joinDate}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status:</span>
                <div><StatusBadge status={selectedPatient.status} /></div>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Assets Value:</span>
                <span style={styles.detailValue}>{selectedPatient.assetsValue}</span>
              </div>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setSelectedPatient(null)} style={styles.closeModalBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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

  filterCard: {
    backgroundColor: 'white',
    border: `1px solid var(--color-neutral-200)`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    gap: 'var(--spacing-md)',
    alignItems: 'flex-end',
  } as React.CSSProperties,

  filterLabel: {
    fontSize: '13px',
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

  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as React.CSSProperties,

  modal: {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    maxWidth: '480px',
    width: '90%',
    position: 'relative',
    boxShadow: 'var(--shadow-xl)',
  } as React.CSSProperties,

  closeBtn: {
    position: 'absolute',
    top: 'var(--spacing-md)',
    right: 'var(--spacing-md)',
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: 'var(--color-neutral-600)',
    cursor: 'pointer',
    padding: 0,
  } as React.CSSProperties,

  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--color-primary-900)',
    margin: '0 0 var(--spacing-lg) 0',
    paddingRight: 'var(--spacing-lg)',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-lg)',
  } as React.CSSProperties,

  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 'var(--spacing-md)',
    borderBottom: `1px solid var(--color-neutral-200)`,
  } as React.CSSProperties,

  detailLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-neutral-700)',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  detailValue: {
    fontSize: '14px',
    color: 'var(--color-neutral-900)',
    fontFamily: 'Roboto Mono, monospace',
    fontWeight: '500',
  } as React.CSSProperties,

  modalActions: {
    display: 'flex',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  closeModalBtn: {
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
};
