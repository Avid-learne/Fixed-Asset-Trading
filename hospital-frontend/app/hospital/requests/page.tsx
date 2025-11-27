'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { getCurrentUser } from '@/lib/auth';

interface AssetRequest {
  id: string;
  patient: string;
  assetType: string;
  value: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export default function AssetRequestsPage() {
  const router = useRouter();
  const user = getCurrentUser();
  const [selectedRequest, setSelectedRequest] = useState<AssetRequest | null>(null);

  React.useEffect(() => {
    if (!user || user.role !== 'hospital') {
      router.push('/hospital/login');
    }
  }, [user, router]);

  const [requests] = useState<AssetRequest[]>([
    {
      id: 'REQ-001',
      patient: 'John Doe',
      assetType: 'Gold Jewelry',
      value: '$5,000.00',
      status: 'pending',
      date: '2025-11-25',
    },
    {
      id: 'REQ-002',
      patient: 'Sarah Smith',
      assetType: 'Silver Coins',
      value: '$2,300.00',
      status: 'approved',
      date: '2025-11-23',
    },
    {
      id: 'REQ-003',
      patient: 'Michael Johnson',
      assetType: 'Medical Equipment',
      value: '$8,500.00',
      status: 'pending',
      date: '2025-11-22',
    },
    {
      id: 'REQ-004',
      patient: 'Emma Wilson',
      assetType: 'Real Estate',
      value: '$35,000.00',
      status: 'rejected',
      date: '2025-11-20',
    },
  ]);

  const columns = [
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
      key: 'patient' as const,
      label: 'Patient',
      width: '140px',
      align: 'left' as const,
    },
    {
      key: 'assetType' as const,
      label: 'Asset Type',
      width: '150px',
      align: 'left' as const,
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
        <StatusBadge status={value as 'pending' | 'approved' | 'rejected'} />
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
        <h1 style={styles.title}>Asset Requests</h1>
      </div>

      {/* Summary Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total Requests</span>
          <span style={styles.statValue}>{requests.length}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Pending</span>
          <span style={styles.statValue}>{requests.filter(r => r.status === 'pending').length}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Approved</span>
          <span style={styles.statValue}>{requests.filter(r => r.status === 'approved').length}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Rejected</span>
          <span style={styles.statValue}>{requests.filter(r => r.status === 'rejected').length}</span>
        </div>
      </div>

      {/* Requests Table */}
      <div style={styles.tableCard}>
        <DataTable data={requests} columns={columns} striped hoverable />
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <button onClick={() => setSelectedRequest(null)} style={styles.closeBtn}>×</button>
            
            <h2 style={styles.modalTitle}>Request Details</h2>
            
            <div style={styles.modalContent}>
              <div style={styles.detailSection}>
                <span style={styles.detailLabel}>Request ID</span>
                <span style={styles.detailValue}>{selectedRequest.id}</span>
              </div>
              <div style={styles.detailSection}>
                <span style={styles.detailLabel}>Patient</span>
                <span style={styles.detailValue}>{selectedRequest.patient}</span>
              </div>
              <div style={styles.detailSection}>
                <span style={styles.detailLabel}>Asset Type</span>
                <span style={styles.detailValue}>{selectedRequest.assetType}</span>
              </div>
              <div style={styles.detailSection}>
                <span style={styles.detailLabel}>Estimated Value</span>
                <span style={styles.detailValue}>{selectedRequest.value}</span>
              </div>
              <div style={styles.detailSection}>
                <span style={styles.detailLabel}>Status</span>
                <StatusBadge status={selectedRequest.status} />
              </div>
              <div style={styles.detailSection}>
                <span style={styles.detailLabel}>Submission Date</span>
                <span style={styles.detailValue}>{selectedRequest.date}</span>
              </div>
            </div>

            <div style={styles.modalActions}>
              {selectedRequest.status === 'pending' && (
                <>
                  <button style={styles.rejectBtn}>Reject</button>
                  <button style={styles.approveBtn}>Approve</button>
                </>
              )}
              <button onClick={() => setSelectedRequest(null)} style={styles.closeModalBtn}>
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
    fontFamily: 'Inter, sans-serif',
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

  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  } as React.CSSProperties,

  detailLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-neutral-700)',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  detailValue: {
    fontSize: '14px',
    color: 'var(--color-neutral-900)',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  modalActions: {
    display: 'flex',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  approveBtn: {
    flex: 1,
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'var(--color-status-success)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  rejectBtn: {
    flex: 1,
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'var(--color-status-danger)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  closeModalBtn: {
    flex: 1,
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'var(--color-neutral-300)',
    color: 'var(--color-neutral-900)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,
};
