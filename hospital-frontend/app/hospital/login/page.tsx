'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormField from '@/components/ui/FormField';
import { loginUser, createSessionForRole } from '@/lib/auth';

export default function HospitalLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    address: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUser(formData.address, formData.password, 'hospital');
      if (result.success && result.user) {
        createSessionForRole('hospital', result.user.address, result.user.name);
        router.push('/hospital');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-secondary)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 'var(--spacing-lg)',
    }}>
      <div style={{
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-xl)',
        width: '100%',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'var(--color-secondary)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--spacing-lg)',
          }}>
            <span style={{
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--color-text-inverse)',
            }}>
              H
            </span>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-sm)',
          }}>
            Hospital Login
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-tertiary)',
          }}>
            Manage assets and patient benefits
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: 'var(--spacing-md) var(--spacing-lg)',
            backgroundColor: '#ffebee',
            border: '1px solid #e57373',
            borderRadius: 'var(--radius-md)',
            color: '#b71c1c',
            fontSize: '13px',
            marginBottom: 'var(--spacing-lg)',
            fontWeight: 500,
          }}>
            ✗ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
        }}>
          <FormField
            label="Wallet Address"
            type="text"
            placeholder="0x742d35Cc6634..."
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <FormField
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              backgroundColor: loading ? 'var(--color-text-tertiary)' : 'var(--color-secondary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 'var(--spacing-md)',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--color-secondary-light)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--color-secondary)')}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{
          marginTop: 'var(--spacing-lg)',
          paddingTop: 'var(--spacing-lg)',
          borderTop: '1px solid var(--color-border)',
          fontSize: '12px',
          color: 'var(--color-text-tertiary)',
          lineHeight: '1.6',
        }}>
          <p style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>Demo Credentials:</p>
          <p>
            Address: <span style={{ fontFamily: 'Roboto Mono' }}>hospital@demo.local</span>
          </p>
          <p>
            Password: <span style={{ fontFamily: 'Roboto Mono' }}>demo123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
