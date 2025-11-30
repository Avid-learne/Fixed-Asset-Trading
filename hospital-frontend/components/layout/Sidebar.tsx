'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { useSidebar } from '@/lib/useSidebar';
import { useHydration } from '@/lib/useHydration';
import React from 'react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const Icon = ({ path }: { path: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen } = useSidebar();
  const isHydrated = useHydration();
  const [session, setSession] = React.useState<any>(null);

  React.useEffect(() => {
    const user = getCurrentUser();
    setSession(user);
  }, []);

  if (!isHydrated || !session) return null;

  const patientMenu: MenuItem[] = [
    { 
      name: 'Dashboard', 
      href: '/patients',
      icon: <Icon path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    },
    { 
      name: 'My Assets', 
      href: '/patients/assets',
      icon: <Icon path="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    },
    { 
      name: 'Health Tokens', 
      href: '/patients/tokens',
      icon: <Icon path="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    },
    { 
      name: 'Deposit Asset', 
      href: '/patients/deposit',
      icon: <Icon path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    },
    { 
      name: 'Redeem Benefits', 
      href: '/patients/redeem',
      icon: <Icon path="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    },
  ];

  const hospitalMenu: MenuItem[] = [
    { 
      name: 'Dashboard', 
      href: '/hospital',
      icon: <Icon path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    },
    { 
      name: 'Patient Management', 
      href: '/hospital/patients',
      icon: <Icon path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    },
    { 
      name: 'Asset Requests', 
      href: '/hospital/requests',
      icon: <Icon path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />
    },
    { 
      name: 'Trading Desk', 
      href: '/hospital/trading',
      icon: <Icon path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    },
    { 
      name: 'Benefit Allocation', 
      href: '/hospital/allocate',
      icon: <Icon path="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    },
  ];

  const bankMenu: MenuItem[] = [
    { 
      name: 'Dashboard', 
      href: '/bank',
      icon: <Icon path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    },
    { 
      name: 'Minting Requests', 
      href: '/bank/minting',
      icon: <Icon path="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    },
    { 
      name: 'Token Ledger', 
      href: '/bank/ledger',
      icon: <Icon path="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3M4 11h12M4 15h8" />
    },
    { 
      name: 'Insurance', 
      href: '/bank/insurance',
      icon: <Icon path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    },
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
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <aside
      style={{
        width: isOpen ? '260px' : '0px',
        backgroundColor: 'var(--color-bg)',
        borderRight: isOpen ? '1px solid var(--color-border)' : 'none',
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        left: 0,
        top: '64px',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 0.3s ease',
        zIndex: 40,
      }}
    >
      {isOpen && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: 'var(--spacing-lg) 0',
        }}>
          {/* Navigation Menu */}
          <nav style={{
            flex: 1,
            padding: '0 var(--spacing-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-xs)',
          }}>
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive(item.href)
                    ? 'var(--color-primary)'
                    : 'var(--color-text-secondary)',
                  backgroundColor: isActive(item.href)
                    ? 'var(--color-bg-tertiary)'
                    : 'transparent',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                <span style={{
                  color: isActive(item.href) ? 'var(--color-primary)' : 'inherit',
                }}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Footer Info */}
          <div style={{
            padding: 'var(--spacing-md) var(--spacing-lg)',
            borderTop: '1px solid var(--color-border)',
            marginTop: 'auto',
          }}>
            <div style={{
              padding: 'var(--spacing-sm)',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)',
                marginBottom: 'var(--spacing-xs)',
                wordBreak: 'break-all',
              }}>
                {session.address?.slice(0, 12)}...{session.address?.slice(-8)}
              </p>
              <p>Platform v1.0</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}