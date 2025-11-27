'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { getCurrentUser } from '@/lib/auth';

interface LedgerEntry {
  id: string;
  timestamp: string;
  transactionType: string;
  account: string;
  amount: string;
  tokensAffected: string;
  txHash: string;
  status: 'completed' | 'pending';
}

export default function TokenLedger() {
  const router = useRouter();
  const user = getCurrentUser();
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type'>('date');
  const [filterType, setFilterType] = useState<string>('all');

  React.useEffect(() => {
    if (!user || user.role !== 'bank') {
      router.push('/bank/login');
    }
  }, [user, router]);

  const [entries] = useState<LedgerEntry[]>([
    {
      id: 'TXN001',
      timestamp: '2025-11-27 14:32:45',
      transactionType: 'Token Mint',
      account: '0x742d35Cc6634C0532925a3b844Bc9e7595f4e8f',
      amount: '$50,000',
      tokensAffected: '+50,000 HBT',
      txHash: '0x9f8b2a3c...',
      status: 'completed',
    },
    {
      id: 'TXN002',
      timestamp: '2025-11-27 13:15:22',
      transactionType: 'Token Redemption',
      account: '0x9a3c1f8e7d2b...',
      amount: '$30,000',
      tokensAffected: '-30,000 HBT',
      txHash: '0x4e2d5f9c...',
      status: 'completed',
    },
    {
      id: 'TXN003',
      timestamp: '2025-11-27 12:45:10',
      transactionType: 'Benefit Distribution',
      account: '0x1f8e3c9a7b2d...',
      amount: '$15,000',
      tokensAffected: '-15,000 HBT',
      txHash: '0x7c3e5b2a...',
      status: 'completed',
    },
    {
      id: 'TXN004',
      timestamp: '2025-11-27 11:20:33',
      transactionType: 'Asset Transfer',
      account: '0x5d2f7a1e9c3b...',
      amount: '$75,000',
      tokensAffected: '+0 HBT',
      txHash: '0x2a8f4e1c...',
      status: 'pending',
    },
    {
      id: 'TXN005',
      timestamp: '2025-11-26 16:55:48',
      transactionType: 'Token Mint',
      account: '0x3b5c7f9a2d1e...',
      amount: '$120,000',
      tokensAffected: '+120,000 HBT',
      txHash: '0x8e2c5f3a...',
      status: 'completed',
    },
    {
      id: 'TXN006',
      timestamp: '2025-11-26 15:30:12',
      transactionType: 'Insurance Premium',
      account: 'INSURANCE_POOL',
      amount: '$125,000',
      tokensAffected: '-0 HBT',
      txHash: '0x1f4a7d9e...',
      status: 'completed',
    },
    {
      id: 'TXN007',
      timestamp: '2025-11-26 14:12:05',
      transactionType: 'Benefit Distribution',
      account: '0x9e2d5c8a1f3b...',
      amount: '$45,000',
      tokensAffected: '-45,000 HBT',
      txHash: '0x5c9f3e2a...',
      status: 'completed',
    },
    {
      id: 'TXN008',
      timestamp: '2025-11-26 13:05:39',
      transactionType: 'Token Mint',
      account: '0x7a1f3e9c2d5b...',
      amount: '$95,000',
      tokensAffected: '+95,000 HBT',
      txHash: '0x3d7f2e5c...',
      status: 'completed',
    },
  ]);

  const transactionTypes = ['all', 'Token Mint', 'Token Redemption', 'Benefit Distribution', 'Asset Transfer', 'Insurance Premium'];

  const filteredEntries = filterType === 'all'
    ? entries
    : entries.filter(e => e.transactionType === filterType);

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else if (sortBy === 'amount') {
      const aAmount = parseInt(a.amount.replace(/[^0-9]/g, ''));
      const bAmount = parseInt(b.amount.replace(/[^0-9]/g, ''));
      return bAmount - aAmount;
    } else if (sortBy === 'type') {
      return a.transactionType.localeCompare(b.transactionType);
    }
    return 0;
  });

  const calculateMetrics = () => {
    const completed = entries.filter(e => e.status === 'completed').length;
    const totalMinted = entries
      .filter(e => e.transactionType === 'Token Mint')
      .reduce((sum, e) => sum + parseInt(e.tokensAffected.replace(/[^0-9]/g, '')), 0);
    const totalRedeemed = entries
      .filter(e => e.transactionType === 'Token Redemption')
      .reduce((sum, e) => sum + parseInt(e.tokensAffected.replace(/[^0-9]/g, '')), 0);
    const circulatingSupply = totalMinted - totalRedeemed;

    return { completed, totalMinted, totalRedeemed, circulatingSupply };
  };

  const metrics = calculateMetrics();

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Timestamp', 'Type', 'Account', 'Amount', 'Tokens', 'Hash', 'Status'],
      ...sortedEntries.map(e => [
        e.id,
        e.timestamp,
        e.transactionType,
        e.account,
        e.amount,
        e.tokensAffected,
        e.txHash,
        e.status,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
              Token Ledger
            </h1>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
              Immutable blockchain ledger of all health token transactions
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

        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)',
        }}>
          {[
            { label: 'Total Transactions', value: entries.length, color: '#1a237e' },
            { label: 'Tokens Minted', value: `${metrics.totalMinted.toLocaleString()} HBT`, color: '#2e7d32' },
            { label: 'Tokens Redeemed', value: `${metrics.totalRedeemed.toLocaleString()} HBT`, color: '#d32f2f' },
            { label: 'Circulating Supply', value: `${metrics.circulatingSupply.toLocaleString()} HBT`, color: '#00695c' },
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
              <p style={{ fontSize: '24px', fontWeight: 700, color: metric.color, fontFamily: 'Roboto Mono' }}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-lg)',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                cursor: 'pointer',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="date">Date (Newest)</option>
              <option value="amount">Amount</option>
              <option value="type">Type</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Filter by:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                cursor: 'pointer',
                color: 'var(--color-text-primary)',
              }}
            >
              {transactionTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            style={{
              marginLeft: 'auto',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              backgroundColor: 'var(--color-secondary)',
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
            ↓ Export CSV
          </button>
        </div>

        {/* Ledger Table */}
        <div style={{
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-xl)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <DataTable
            columns={['ID', 'Timestamp', 'Type', 'Account', 'Amount', 'Tokens', 'Hash', 'Status']}
            rows={sortedEntries.map((entry) => [
              entry.id,
              entry.timestamp,
              entry.transactionType,
              entry.account.length > 20 ? `${entry.account.substring(0, 10)}...${entry.account.substring(entry.account.length - 8)}` : entry.account,
              entry.amount,
              entry.tokensAffected,
              entry.txHash,
              <StatusBadge key={entry.id} status={entry.status} />,
            ])}
          />
        </div>

        {/* Ledger Info */}
        <div style={{
          marginTop: 'var(--spacing-xl)',
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '12px',
          color: 'var(--color-text-tertiary)',
          lineHeight: '1.6',
        }}>
          <p style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>ℹ Blockchain Ledger Information</p>
          <p>All transactions are immutably recorded on the blockchain. Hash values are cryptographic proofs of transaction integrity.</p>
          <p style={{ marginTop: 'var(--spacing-sm)' }}>Export functionality allows audit trail extraction for compliance and reporting purposes.</p>
        </div>
      </div>
    </div>
  );
}
