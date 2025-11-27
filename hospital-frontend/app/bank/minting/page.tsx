'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import FormField from '@/components/ui/FormField';
import { getCurrentUser } from '@/lib/auth';

interface MintingRequest {
  id: string;
  patientName: string;
  assetType: string;
  value: string;
  date: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  description: string;
  verificationNotes: string;
}

export default function MintingRequests() {
  const router = useRouter();
  const user = getCurrentUser();
  const [selectedRequest, setSelectedRequest] = useState<MintingRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'approved' | 'rejected'>('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    verifiedValue: '',
    tokensToMint: '',
    notes: '',
    ipfsHash: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  React.useEffect(() => {
    if (!user || user.role !== 'bank') {
      router.push('/bank/login');
    }
  }, [user, router]);

  const [requests] = useState<MintingRequest[]>([
    {
      id: 'MR001',
      patientName: 'John Doe',
      assetType: 'Gold Jewelry',
      value: '$50,000',
      date: '2025-11-27',
      status: 'pending',
      description: '500 grams of 24K gold jewelry with certificate',
      verificationNotes: '',
    },
    {
      id: 'MR002',
      patientName: 'Sarah Johnson',
      assetType: 'Diamond Ring',
      value: '$75,000',
      date: '2025-11-27',
      status: 'verified',
      description: '3-carat diamond ring, GIA certified',
      verificationNotes: 'Verified with independent appraiser',
    },
    {
      id: 'MR003',
      patientName: 'Mike Chen',
      assetType: 'Property Deed',
      value: '$30,000',
      date: '2025-11-26',
      status: 'approved',
      description: 'Commercial property deed in downtown area',
      verificationNotes: 'All legal documents verified and cleared',
    },
    {
      id: 'MR004',
      patientName: 'Emma Wilson',
      assetType: 'Vehicle',
      value: '$45,000',
      date: '2025-11-26',
      status: 'pending',
      description: '2020 Tesla Model S, excellent condition',
      verificationNotes: '',
    },
    {
      id: 'MR005',
      patientName: 'David Brown',
      assetType: 'Artwork',
      value: '$120,000',
      date: '2025-11-25',
      status: 'rejected',
      description: 'Original oil painting, unsigned',
      verificationNotes: 'Failed authenticity verification',
    },
    {
      id: 'MR006',
      patientName: 'Lisa Garcia',
      assetType: 'Cryptocurrency Holdings',
      value: '$95,000',
      date: '2025-11-25',
      status: 'approved',
      description: '2 BTC, stored in secure wallet',
      verificationNotes: 'Blockchain verification complete',
    },
  ]);

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    verified: requests.filter(r => r.status === 'verified').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const handleApprove = async () => {
    setLoading(true);
    setTimeout(() => {
      setSuccessMessage(`Request ${selectedRequest?.id} approved and minting initiated!`);
      setSelectedRequest(null);
      setFormData({ verifiedValue: '', tokensToMint: '', notes: '', ipfsHash: '' });
      setShowForm(false);
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };

  const handleReject = async () => {
    setLoading(true);
    setTimeout(() => {
      setSuccessMessage(`Request ${selectedRequest?.id} has been rejected`);
      setSelectedRequest(null);
      setFormData({ verifiedValue: '', tokensToMint: '', notes: '', ipfsHash: '' });
      setShowForm(false);
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem('hospital_session');
    router.push('/bank/login');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-secondary)', minHeight: '100vh', padding: 'var(--spacing-xl)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
              Minting Requests
            </h1>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
              Review and approve asset deposit requests for token minting
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              backgroundColor: 'var(--color-danger)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b71c1c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-danger)'}
          >
            Logout
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            padding: 'var(--spacing-lg)',
            backgroundColor: '#e8f5e9',
            border: '1px solid #81c784',
            borderRadius: 'var(--radius-md)',
            color: '#1b5e20',
            marginBottom: 'var(--spacing-lg)',
            fontSize: '14px',
            fontWeight: 500,
          }}>
            ✓ {successMessage}
          </div>
        )}

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)',
        }}>
          {[
            { label: 'Total', value: stats.total, color: '#1a237e' },
            { label: 'Pending', value: stats.pending, color: '#ff9800' },
            { label: 'Verified', value: stats.verified, color: '#00695c' },
            { label: 'Approved', value: stats.approved, color: '#2e7d32' },
            { label: 'Rejected', value: stats.rejected, color: '#d32f2f' },
          ].map((stat) => (
            <div key={stat.label} style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--color-bg)',
              border: `2px solid ${stat.color}`,
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
          flexWrap: 'wrap',
        }}>
          {(['all', 'pending', 'verified', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                backgroundColor: filter === status ? 'var(--color-primary)' : 'var(--color-bg)',
                color: filter === status ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                border: filter === status ? 'none' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (filter !== status) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== status) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                }
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Requests Table */}
        <div style={{
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-xl)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 'var(--spacing-xl)',
        }}>
          <DataTable
            columns={['ID', 'Patient', 'Asset Type', 'Value', 'Date', 'Status']}
            rows={filteredRequests.map((request) => [
              request.id,
              request.patientName,
              request.assetType,
              request.value,
              request.date,
              <div key={request.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <StatusBadge status={request.status} />
                <button
                  onClick={() => setSelectedRequest(request)}
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-text-inverse)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Review
                </button>
              </div>,
            ])}
          />
        </div>

        {/* Detail Modal */}
        {selectedRequest && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: 'var(--spacing-lg)',
          }}>
            <div style={{
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-xl)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-lg)',
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                }}>
                  Request {selectedRequest.id}
                </h2>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setShowForm(false);
                    setFormData({ verifiedValue: '', tokensToMint: '', notes: '', ipfsHash: '' });
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  ×
                </button>
              </div>

              {!showForm ? (
                <>
                  {/* Asset Details */}
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--spacing-md)',
                    }}>
                      Asset Information
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 'var(--spacing-md)',
                      padding: 'var(--spacing-lg)',
                      backgroundColor: 'var(--color-bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                    }}>
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>Patient</p>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedRequest.patientName}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>Asset Type</p>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedRequest.assetType}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>Estimated Value</p>
                        <p style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Roboto Mono', color: 'var(--color-primary)' }}>{selectedRequest.value}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>Status</p>
                        <StatusBadge status={selectedRequest.status} />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>Description</p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{selectedRequest.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Checklist */}
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--spacing-md)',
                    }}>
                      Verification Checklist
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                      {[
                        'Asset ownership verified',
                        'Appraisal documentation complete',
                        'Title/deed verification clear',
                        'Insurance requirements met',
                        'Compliance checks passed',
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                          <input
                            type="checkbox"
                            defaultChecked={selectedRequest.status !== 'pending'}
                            disabled
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedRequest.status === 'pending' && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 'var(--spacing-md)',
                      paddingTop: 'var(--spacing-lg)',
                      borderTop: '1px solid var(--color-border)',
                    }}>
                      <button
                        onClick={() => setShowForm(true)}
                        style={{
                          padding: 'var(--spacing-md) var(--spacing-lg)',
                          backgroundColor: 'var(--color-primary)',
                          color: 'var(--color-text-inverse)',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Verify & Approve
                      </button>
                      <button
                        onClick={handleReject}
                        style={{
                          padding: 'var(--spacing-md) var(--spacing-lg)',
                          backgroundColor: 'var(--color-danger)',
                          color: 'var(--color-text-inverse)',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Reject Request
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Verification Form */}
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--spacing-md)',
                    }}>
                      Verification & Minting Details
                    </h3>
                    <FormField
                      label="Verified Value (USD)"
                      type="number"
                      placeholder="Enter verified asset value"
                      value={formData.verifiedValue}
                      onChange={(e) => setFormData({ ...formData, verifiedValue: e.target.value })}
                    />
                    <FormField
                      label="Tokens to Mint"
                      type="number"
                      placeholder="Number of health tokens to issue"
                      value={formData.tokensToMint}
                      onChange={(e) => setFormData({ ...formData, tokensToMint: e.target.value })}
                    />
                    <FormField
                      label="Verification Notes"
                      placeholder="Document any verification findings..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                    <FormField
                      label="IPFS Metadata Hash"
                      placeholder="QmX..."
                      value={formData.ipfsHash}
                      onChange={(e) => setFormData({ ...formData, ipfsHash: e.target.value })}
                    />
                  </div>

                  {/* Form Actions */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--spacing-md)',
                    paddingTop: 'var(--spacing-lg)',
                    borderTop: '1px solid var(--color-border)',
                  }}>
                    <button
                      onClick={() => setShowForm(false)}
                      style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleApprove}
                      style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        backgroundColor: loading ? 'var(--color-text-tertiary)' : 'var(--color-success)',
                        color: 'var(--color-text-inverse)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Approve & Mint'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
