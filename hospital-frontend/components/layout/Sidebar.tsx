// hospital-frontend/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { useSidebar } from '@/lib/useSidebar';
import React from 'react';

interface MenuItem {
  name: string;
  href: string;
  icon: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const session = getCurrentUser();
  const { isOpen } = useSidebar();

  if (!session) return null;

  const patientMenu: MenuItem[] = [
    { name: 'Dashboard', href: '/patients', icon: '📊' },
    { name: 'My Assets', href: '/patients/assets', icon: '💎' },
    { name: 'Health Tokens', href: '/patients/tokens', icon: '🏥' },
    { name: 'Deposit Asset', href: '/patients/deposit', icon: '📥' },
    { name: 'Redeem Benefits', href: '/patients/redeem', icon: '🎁' },
  ];

  const hospitalMenu: MenuItem[] = [
    { name: 'Dashboard', href: '/hospital', icon: '📊' },
    { name: 'Patient Management', href: '/hospital/patients', icon: '👥' },
    { name: 'Asset Requests', href: '/hospital/requests', icon: '📋' },
    { name: 'Trading Desk', href: '/hospital/trading', icon: '📈' },
    { name: 'Benefit Allocation', href: '/hospital/allocate', icon: '💰' },
  ];

  const bankMenu: MenuItem[] = [
    { name: 'Dashboard', href: '/bank', icon: '📊' },
    { name: 'Minting Requests', href: '/bank/minting', icon: '⚙️' },
    { name: 'Token Ledger', href: '/bank/ledger', icon: '📚' },
    { name: 'Insurance', href: '/bank/insurance', icon: '🛡️' },
  ];

  const getMenuItems = (): MenuItem[] => {
    switch (session.role) {
      case 'patient':
        return patientMenu;
      case 'hospital':
        return hospitalMenu;
      case 'bank':
        return bankMenu;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      style={{
        width: isOpen ? '280px' : '0px',
        backgroundColor: 'var(--color-bg)',
        borderRight: isOpen ? `1px solid var(--color-border)` : 'none',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: '64px',
        overflowY: 'auto',
        transition: 'width 0.3s ease, border 0.3s ease',
        zIndex: 40,
      }}
    >
      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div
            style={{
              padding: 'var(--spacing-lg)',
              borderBottom: `1px solid var(--color-border)`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor:
                    session.role === 'patient'
                      ? 'var(--color-primary)'
                      : session.role === 'hospital'
                        ? 'var(--color-secondary)'
                        : '#1a237e',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-inverse)',
                  fontWeight: 700,
                  fontSize: '18px',
                }}
              >
                {session.role === 'patient' ? 'P' : session.role === 'hospital' ? 'H' : 'B'}
              </div>
              <div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    textTransform: 'capitalize',
                  }}
                >
                  {session.role} Portal
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                  {session.name || session.address?.slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav
            style={{
              flex: 1,
              padding: 'var(--spacing-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)',
            }}
          >
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive(item.href)
                    ? 'var(--color-text-inverse)'
                    : 'var(--color-text-secondary)',
                  backgroundColor: isActive(item.href)
                    ? session.role === 'patient'
                      ? 'var(--color-primary)'
                      : session.role === 'hospital'
                        ? 'var(--color-secondary)'
                        : '#1a237e'
                    : 'transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }}></div>

          {/* Footer Info */}
          <div
            style={{
              padding: 'var(--spacing-lg)',
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              lineHeight: '1.5',
            }}
          >
            <p style={{ fontFamily: 'Roboto Mono', marginBottom: 'var(--spacing-sm)', wordBreak: 'break-all' }}>
              {session.address?.slice(0, 12)}...{session.address?.slice(-8)}
            </p>
            <p>Platform v1.0</p>
          </div>
        </div>
      )}
    </aside>
  );
}