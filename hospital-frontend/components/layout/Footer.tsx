// hospital-frontend/components/layout/Footer.tsx
'use client';

import Link from "next/link";
import { useSidebar } from "@/lib/useSidebar";

export default function Footer() {
  const { isOpen } = useSidebar();

  return (
    <footer
      style={{
        backgroundColor: '#1e293b',
        color: '#cbd5e1',
        marginTop: 'auto',
        marginLeft: isOpen ? '280px' : '0px',
        transition: 'margin-left 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px',
            marginBottom: '32px',
          }}
        >
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span style={{ color: 'white', fontWeight: 600 }}>Hospital Platform</span>
            </div>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>
              Blockchain-based platform for tokenizing hospital assets and healthcare benefits.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ color: 'white', fontWeight: 600, marginBottom: '16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <Link href="/patients" style={{ fontSize: '14px', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link href="/bank" style={{ fontSize: '14px', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  Bank Portal
                </Link>
              </li>
              <li>
                <Link href="/hospital" style={{ fontSize: '14px', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  Hospital Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 style={{ color: 'white', fontWeight: 600, marginBottom: '16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resources
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a href="#" style={{ fontSize: '14px', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" style={{ fontSize: '14px', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  Smart Contracts
                </a>
              </li>
              <li>
                <a href="#" style={{ fontSize: '14px', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  Security Audit
                </a>
              </li>
              <li>
                <a href="#" style={{ fontSize: '14px', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ color: 'white', fontWeight: 600, marginBottom: '16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contact
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px' }}>
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ flexShrink: 0, marginTop: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:support@hospital-platform.com" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                  support@hospital-platform.com
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px' }}>
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ flexShrink: 0, marginTop: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Karachi, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ paddingTop: '32px', borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              © 2025 Hospital Asset Platform. All rights reserved.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <a href="#" style={{ fontSize: '14px', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                Privacy Policy
              </a>
              <a href="#" style={{ fontSize: '14px', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                Terms of Service
              </a>
              <a href="#" style={{ fontSize: '14px', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}