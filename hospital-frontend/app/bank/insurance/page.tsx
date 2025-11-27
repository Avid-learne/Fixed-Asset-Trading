'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import FormField from '@/components/ui/FormField';
import { getCurrentUser } from '@/lib/auth';

interface InsurancePolicy {
  id: string;
  hospital: string;
  coverage: string;
  premium: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'pending';
  claimsCount: number;
}

interface Claim {
  id: string;
  policyId: string;
  date: string;
  amount: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

export default function InsuranceManagement() {
  const router = useRouter();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<'policies' | 'claims' | 'create'>('policies');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);

  const [formData, setFormData] = useState({
    hospitalName: '',
    coverage: '',
    premium: '',
    startDate: '',
    endDate: '',
    deductible: '',
    coverageTypes: [] as string[],
  });

  React.useEffect(() => {
    if (!user || user.role !== 'bank') {
      router.push('/bank/login');
    }
  }, [user, router]);

  const [policies] = useState<InsurancePolicy[]>([
    {
      id: 'POL001',
      hospital: 'Central Hospital',
      coverage: '$5,000,000',
      premium: '$125,000/month',
      startDate: '2025-01-15',
      endDate: '2026-01-14',
      status: 'active',
      claimsCount: 3,
    },
    {
      id: 'POL002',
      hospital: 'St. Mary Medical Center',
      coverage: '$3,000,000',
      premium: '$75,000/month',
      startDate: '2025-03-20',
      endDate: '2026-03-19',
      status: 'active',
      claimsCount: 1,
    },
    {
      id: 'POL003',
      hospital: 'City Hospital',
      coverage: '$2,450,000',
      premium: '$65,000/month',
      startDate: '2024-06-01',
      endDate: '2025-05-31',
      status: 'inactive',
      claimsCount: 8,
    },
    {
      id: 'POL004',
      hospital: 'Riverside Medical Clinic',
      coverage: '$1,500,000',
      premium: '$40,000/month',
      startDate: '2025-11-01',
      endDate: '2026-10-31',
      status: 'pending',
      claimsCount: 0,
    },
  ]);

  const [claims] = useState<Claim[]>([
    {
      id: 'CLM001',
      policyId: 'POL001',
      date: '2025-11-25',
      amount: '$50,000',
      reason: 'Asset loss claim - equipment damage',
      status: 'approved',
    },
    {
      id: 'CLM002',
      policyId: 'POL001',
      date: '2025-11-20',
      amount: '$25,000',
      reason: 'Liability claim - asset mishandling',
      status: 'completed',
    },
    {
      id: 'CLM003',
      policyId: 'POL002',
      date: '2025-11-18',
      amount: '$15,000',
      reason: 'Coverage claim - asset verification',
      status: 'pending',
    },
    {
      id: 'CLM004',
      policyId: 'POL001',
      date: '2025-11-15',
      amount: '$30,000',
      reason: 'Loss claim - market depreciation',
      status: 'completed',
    },
    {
      id: 'CLM005',
      policyId: 'POL003',
      date: '2025-11-10',
      amount: '$45,000',
      reason: 'Claim rejection - outside coverage',
      status: 'rejected',
    },
  ]);

  const stats = {
    activePolicies: policies.filter(p => p.status === 'active').length,
    totalCoverage: policies
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + parseInt(p.coverage.replace(/[^0-9]/g, '')), 0),
    totalPremiums: policies
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + parseInt(p.premium.replace(/[^0-9]/g, '')), 0) * 12,
    openClaims: claims.filter(c => c.status === 'pending').length,
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccessMessage('Insurance policy created successfully!');
      setFormData({
        hospitalName: '',
        coverage: '',
        premium: '',
        startDate: '',
        endDate: '',
        deductible: '',
        coverageTypes: [],
      });
      setShowCreateForm(false);
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };

  const handleApproveClaim = async () => {
    setLoading(true);
    setTimeout(() => {
      setSuccessMessage('Claim approved successfully!');
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
              Insurance Management
            </h1>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
              Manage hospital insurance policies and process claims
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

        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)',
        }}>
          {[
            { label: 'Active Policies', value: stats.activePolicies, color: '#2e7d32', unit: 'policies' },
            { label: 'Total Coverage', value: `$${(stats.totalCoverage / 1000000).toFixed(1)}M`, color: '#00695c', unit: 'USD' },
            { label: 'Annual Premiums', value: `$${(stats.totalPremiums / 1000).toFixed(0)}K`, color: '#1a237e', unit: 'USD' },
            { label: 'Open Claims', value: stats.openClaims, color: '#ff9800', unit: 'claims' },
          ].map((metric, idx) => (
            <div key={idx} style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--color-bg)',
              border: `2px solid ${metric.color}`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {metric.label}
              </p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: metric.color, marginBottom: 'var(--spacing-xs)' }}>
                {metric.value}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                {metric.unit}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
          borderBottom: '2px solid var(--color-border)',
        }}>
          {(['policies', 'claims', 'create'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'create') setShowCreateForm(true);
              }}
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid var(--color-primary)' : 'none',
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              {tab === 'policies' && 'Active Policies'}
              {tab === 'claims' && 'Claims Processing'}
              {tab === 'create' && '+ New Policy'}
            </button>
          ))}
        </div>

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <DataTable
              columns={['ID', 'Hospital', 'Coverage', 'Premium', 'Status', 'Claims']}
              rows={policies.map((policy) => [
                policy.id,
                policy.hospital,
                policy.coverage,
                policy.premium,
                <StatusBadge key={policy.id} status={policy.status} />,
                <button
                  key={`${policy.id}-claims`}
                  onClick={() => setSelectedPolicy(policy)}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: policy.claimsCount > 0 ? 'var(--color-warning)' : 'var(--color-bg-secondary)',
                    color: policy.claimsCount > 0 ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {policy.claimsCount} claims
                </button>,
              ])}
            />
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <DataTable
              columns={['ID', 'Policy', 'Date', 'Amount', 'Reason', 'Status']}
              rows={claims.map((claim) => [
                claim.id,
                claim.policyId,
                claim.date,
                claim.amount,
                claim.reason,
                <div key={claim.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <StatusBadge status={claim.status} />
                  {claim.status === 'pending' && (
                    <button
                      onClick={handleApproveClaim}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: 'var(--color-success)',
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
                      Approve
                    </button>
                  )}
                </div>,
              ])}
            />
          </div>
        )}

        {/* Create Policy Form */}
        {activeTab === 'create' && (
          <div style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: '600px',
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-lg)',
            }}>
              Create New Insurance Policy
            </h2>

            <form onSubmit={handleCreatePolicy} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <FormField
                label="Hospital Name"
                placeholder="Enter hospital name"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                required
              />
              <FormField
                label="Coverage Amount (USD)"
                type="number"
                placeholder="e.g., 5000000"
                value={formData.coverage}
                onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
                required
              />
              <FormField
                label="Monthly Premium (USD)"
                type="number"
                placeholder="e.g., 125000"
                value={formData.premium}
                onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
                required
              />
              <FormField
                label="Deductible (USD)"
                type="number"
                placeholder="e.g., 50000"
                value={formData.deductible}
                onChange={(e) => setFormData({ ...formData, deductible: e.target.value })}
              />
              <FormField
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <FormField
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />

              <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-md)',
                }}>
                  Coverage Types
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {['Asset Loss', 'Liability', 'Theft', 'Natural Disaster', 'Equipment Damage'].map((type) => (
                    <label key={type} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.coverageTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, coverageTypes: [...formData.coverageTypes, type] });
                          } else {
                            setFormData({ ...formData, coverageTypes: formData.coverageTypes.filter(t => t !== type) });
                          }
                        }}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-md)',
                paddingTop: 'var(--spacing-lg)',
                borderTop: '1px solid var(--color-border)',
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('policies');
                    setShowCreateForm(false);
                    setFormData({
                      hospitalName: '',
                      coverage: '',
                      premium: '',
                      startDate: '',
                      endDate: '',
                      deductible: '',
                      coverageTypes: [],
                    });
                  }}
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
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    backgroundColor: loading ? 'var(--color-text-tertiary)' : 'var(--color-primary)',
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
                  {loading ? 'Creating...' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
