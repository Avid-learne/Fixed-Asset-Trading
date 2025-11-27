'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { getCurrentUser } from '@/lib/auth';

// Type definitions
interface MintingRequest {
  id: string;
  patient: string;
  amount: string;
  date: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
}

interface InsurancePolicy {
  id: string;
  hospital: string;
  coverage: string;
  premium: string;
  status: 'active' | 'inactive';
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  date: string;
  status: 'completed' | 'pending';
}

export default function BankDashboard() {
  const router = useRouter();
  const user = getCurrentUser();

  // Redirect if not authenticated or wrong role
  React.useEffect(() => {
    if (!user || user.role !== 'bank') {
      router.push('/bank/login');
    }
  }, [user, router]);

  // Mock statistics
  const [statistics] = useState({
    totalValue: '$12,580,000.00',
    activeMints: '47',
    tokensIssued: '1,250,000 HBT',
    insuranceBalance: '$8,450,000.00',
  });

  // Mock minting queue
  const [mintingQueue] = useState<MintingRequest[]>([
    {
      id: 'MR001',
      patient: 'John Doe',
      amount: '$50,000',
      date: '2025-11-27',
      status: 'pending',
    },
    {
      id: 'MR002',
      patient: 'Sarah Johnson',
      amount: '$75,000',
      date: '2025-11-27',
      status: 'verified',
    },
    {
      id: 'MR003',
      patient: 'Mike Chen',
      amount: '$30,000',
      date: '2025-11-26',
      status: 'approved',
    },
    {
      id: 'MR004',
      patient: 'Emma Wilson',
      amount: '$45,000',
      date: '2025-11-26',
      status: 'pending',
    },
  ]);

  // Mock insurance policies
  const [insuranceSummary] = useState<InsurancePolicy[]>([
    {
      id: 'POL001',
      hospital: 'Central Hospital',
      coverage: '$5,000,000',
      premium: '$125,000/month',
      status: 'active',
    },
    {
      id: 'POL002',
      hospital: 'St. Mary Medical Center',
      coverage: '$3,000,000',
      premium: '$75,000/month',
      status: 'active',
    },
    {
      id: 'POL003',
      hospital: 'City Hospital',
      coverage: '$2,450,000',
      premium: '$65,000/month',
      status: 'inactive',
    },
  ]);

  // Mock recent transactions
  const [recentTransactions] = useState<Transaction[]>([
    {
      id: 'TXN001',
      type: 'Token Mint',
      amount: '$250,000',
      date: '2025-11-27',
      status: 'completed',
    },
    {
      id: 'TXN002',
      type: 'Insurance Premium',
      amount: '$125,000',
      date: '2025-11-27',
      status: 'completed',
    },
    {
      id: 'TXN003',
      type: 'Token Redemption',
      amount: '$180,000',
      date: '2025-11-26',
      status: 'completed',
    },
    {
      id: 'TXN004',
      type: 'Asset Transfer',
      amount: '$95,000',
      date: '2025-11-26',
      status: 'pending',
    },
  ]);

  const handleNavigate = (path: string) => {
    router.push(path);
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
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-sm)',
            }}>
              Bank Dashboard
            </h1>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
              Welcome back, {user?.name || 'Bank Admin'}. Manage tokens, insurance, and asset verification.
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
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b71c1c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-danger)'}
          >
            Logout
          </button>
        </div>

        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)',
        }}>
          <StatCard
            label="Total Value Under Management"
            value={statistics.totalValue}
            trend={{ direction: 'up', value: 12.5 }}
          />
          <StatCard
            label="Active Mint Requests"
            value={statistics.activeMints}
            trend={{ direction: 'down', value: 2.3 }}
          />
          <StatCard
            label="Health Tokens Issued"
            value={statistics.tokensIssued}
            trend={{ direction: 'up', value: 18.7 }}
          />
          <StatCard
            label="Insurance Reserve Balance"
            value={statistics.insuranceBalance}
            trend={{ direction: 'up', value: 5.2 }}
          />
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)',
        }}>
          <button
            onClick={() => handleNavigate('/bank/minting')}
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--color-bg)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              e.currentTarget.style.color = 'var(--color-text-inverse)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg)';
              e.currentTarget.style.color = 'var(--color-primary)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Review Mint Requests
          </button>
          <button
            onClick={() => handleNavigate('/bank/ledger')}
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--color-bg)',
              border: '2px solid var(--color-secondary)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
              e.currentTarget.style.color = 'var(--color-text-inverse)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg)';
              e.currentTarget.style.color = 'var(--color-secondary)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            View Token Ledger
          </button>
          <button
            onClick={() => handleNavigate('/bank/insurance')}
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--color-bg)',
              border: '2px solid var(--color-warning)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-warning)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-warning)';
              e.currentTarget.style.color = 'var(--color-text-inverse)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg)';
              e.currentTarget.style.color = 'var(--color-warning)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Manage Insurance
          </button>
          <button
            onClick={() => handleNavigate('/bank/audit')}
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--color-bg)',
              border: '2px solid var(--color-neutral)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-neutral)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-neutral)';
              e.currentTarget.style.color = 'var(--color-text-inverse)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg)';
              e.currentTarget.style.color = 'var(--color-neutral)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Audit Reports
          </button>
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)',
        }}>
          {/* Minting Queue */}
          <div style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}>
                Minting Queue
              </h2>
              <a
                href="/bank/minting"
                style={{
                  fontSize: '12px',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View All →
              </a>
            </div>
            <DataTable
              columns={['ID', 'Patient', 'Amount', 'Date', 'Status']}
              rows={mintingQueue.map((request) => [
                request.id,
                request.patient,
                request.amount,
                request.date,
                <StatusBadge key={request.id} status={request.status} />,
              ])}
            />
          </div>

          {/* Insurance Summary */}
          <div style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}>
                Active Insurance Policies
              </h2>
              <a
                href="/bank/insurance"
                style={{
                  fontSize: '12px',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Manage →
              </a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {insuranceSummary.slice(0, 3).map((policy) => (
                <div
                  key={policy.id}
                  style={{
                    padding: 'var(--spacing-lg)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-sm)' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                        {policy.hospital}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                        Coverage: {policy.coverage}
                      </p>
                    </div>
                    <StatusBadge status={policy.status} />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'Roboto Mono' }}>
                    {policy.premium}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions Ledger Preview */}
        <div style={{
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-xl)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}>
              Recent Transactions
            </h2>
            <a
              href="/bank/ledger"
              style={{
                fontSize: '12px',
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View Full Ledger →
            </a>
          </div>
          <DataTable
            columns={['ID', 'Type', 'Amount', 'Date', 'Status']}
            rows={recentTransactions.map((txn) => [
              txn.id,
              txn.type,
              txn.amount,
              txn.date,
              <StatusBadge key={txn.id} status={txn.status as any} />,
            ])}
          />
        </div>
      </div>
    </div>
  );
}