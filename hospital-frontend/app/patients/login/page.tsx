// hospital-frontend/app/patients/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/auth";
import FormField from "@/components/ui/FormField";

export default function PatientLoginPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser(address, password, "patient");
      if (result.success) {
        router.push("/patients");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-secondary)',
      padding: 'var(--spacing-2xl)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-3xl)' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--spacing-xl)',
            color: 'white',
            fontSize: '28px',
            fontWeight: 700,
          }}>
            P
          </div>
          <h1 style={{ marginBottom: 'var(--spacing-md)' }}>Patient Portal</h1>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
            Access your healthcare assets and benefits
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          backgroundColor: 'var(--color-bg)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          padding: 'var(--spacing-2xl)',
          boxShadow: 'var(--shadow-md)',
        }}>
          {error && (
            <div style={{
              marginBottom: 'var(--spacing-xl)',
              padding: 'var(--spacing-md)',
              backgroundColor: '#ffebee',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-danger)',
              fontSize: '13px',
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FormField
              label="Wallet Address"
              type="text"
              placeholder="0x742d35Cc6634C0532925a3b844Bc57e4f5236d72"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              helper="Your Ethereum wallet address"
            />

            <FormField
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helper="Minimum 6 characters"
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                backgroundColor: loading ? '#ccc' : 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                marginTop: 'var(--spacing-xl)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--color-primary-light)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <hr style={{ margin: 'var(--spacing-xl) 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />

          <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
            No account yet?{' '}
            <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 'var(--spacing-2xl)',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--color-text-tertiary)',
        }}>
          <p>Secure. Professional. Trusted.</p>
          <p style={{ marginTop: 'var(--spacing-sm)' }}>© 2024 Fixed Asset Trading. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}