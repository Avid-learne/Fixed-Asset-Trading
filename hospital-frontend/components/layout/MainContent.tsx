// hospital-frontend/components/layout/MainContent.tsx
'use client';

import { useSidebar } from '@/lib/useSidebar';
import React from 'react';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <main
      style={{
        flex: 1,
        marginLeft: isOpen ? '280px' : '0px',
        overflow: 'auto',
        transition: 'margin-left 0.3s ease',
        paddingTop: 'var(--spacing-lg)',
        paddingBottom: 'var(--spacing-lg)',
        paddingLeft: 'var(--spacing-xl)',
        paddingRight: 'var(--spacing-xl)',
      }}
    >
      {children}
    </main>
  );
}
