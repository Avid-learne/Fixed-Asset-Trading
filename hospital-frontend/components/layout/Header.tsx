"use client";

import { useSidebar } from "@/lib/useSidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSession, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const [session, setSession] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      patient: 'Patient',
      bank: 'Bank',
      hospital: 'Hospital',
    };
    return roles[role] || role;
  };

  return (
    <header style={{
      backgroundColor: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: '64px',
    }}>
      <nav style={{ height: '100%' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          padding: '0 var(--spacing-lg)',
          maxWidth: '100%',
        }}>
          {/* Left Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <button
              onClick={toggleSidebar}
              style={{
                padding: 'var(--spacing-sm)',
                background: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="17" y2="6" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="14" x2="17" y2="14" />
              </svg>
            </button>

            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              textDecoration: 'none',
              color: 'var(--color-text-primary)',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
              </div>
              <span style={{
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}>
                Hospital Asset Platform
              </span>
            </Link>
          </div>

          {/* Right Section - Desktop */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-lg)',
          }}>
            {session ? (
              <>
                <Link
                  href={session.role === "patient" ? "/patients" : `/${session.role}`}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                >
                  Dashboard
                </Link>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  paddingLeft: 'var(--spacing-lg)',
                  borderLeft: '1px solid var(--color-border)',
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      marginBottom: '2px',
                    }}>
                      {session.name || "User"}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--color-text-tertiary)',
                    }}>
                      {getRoleName(session.role)}
                    </p>
                  </div>
                  
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--color-border)',
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                    }}>
                      {(session.name || session.address || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--color-text-secondary)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-secondary)';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: '14px',
                    fontWeight: 500,
                    background: 'var(--color-primary)',
                    color: 'var(--color-text-inverse)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-primary)'}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}