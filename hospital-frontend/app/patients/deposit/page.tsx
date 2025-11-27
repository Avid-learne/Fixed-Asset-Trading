'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormField from '@/components/ui/FormField';
import { getCurrentUser } from '@/lib/auth';

interface DepositFormData {
  assetType: string;
  quantity: string;
  unit: string;
  estimatedValue: string;
  description: string;
}

export default function DepositAssetPage() {
  const router = useRouter();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!user || user.role !== 'patient') {
      router.push('/patients/login');
    }
  }, [user, router]);

  const [formData, setFormData] = useState<DepositFormData>({
    assetType: 'jewelry',
    quantity: '',
    unit: 'grams',
    estimatedValue: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.quantity || !formData.estimatedValue || !formData.description) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Mock submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/patients?success=deposit');
    } catch (err) {
      setError('Failed to submit deposit request');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => router.back()} style={styles.backBtn}>
          ← Back
        </button>
        <h1 style={styles.title}>Deposit Asset</h1>
      </div>

      {/* Form Card */}
      <div style={styles.card}>
        <p style={styles.description}>
          Submit your assets for tokenization. Our team will review and verify your submission within 24 hours.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Asset Type Selection */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Asset Type</label>
            <select
              name="assetType"
              value={formData.assetType}
              onChange={handleInputChange}
              style={styles.select}
            >
              <option value="jewelry">Jewelry</option>
              <option value="precious-metals">Precious Metals</option>
              <option value="equipment">Medical Equipment</option>
              <option value="property">Property</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Quantity & Unit */}
          <div style={styles.row}>
            <FormField
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="e.g., 500"
              required
            />
            <div style={styles.formGroup}>
              <label style={styles.label}>Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="grams">Grams</option>
                <option value="kilograms">Kilograms</option>
                <option value="pieces">Pieces</option>
                <option value="units">Units</option>
              </select>
            </div>
          </div>

          {/* Estimated Value */}
          <FormField
            label="Estimated Value (USD)"
            name="estimatedValue"
            type="number"
            value={formData.estimatedValue}
            onChange={handleInputChange}
            placeholder="e.g., 5000"
            required
          />

          {/* Description */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide details about the asset condition, origin, certificates, etc."
              style={styles.textarea}
              required
            />
          </div>

          {/* File Upload */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Upload Photos</label>
            <div style={styles.uploadArea}>
              <input type="file" multiple accept="image/*" style={styles.fileInput} />
              <p style={styles.uploadText}>Drag and drop or click to select</p>
            </div>
          </div>

          {/* Error Message */}
          {error && <div style={styles.errorMessage}>{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Submitting...' : 'Submit Deposit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 'var(--spacing-lg)',
    maxWidth: '680px',
    margin: '0 auto',
    backgroundColor: '#fafafa',
    minHeight: '100vh',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-xl)',
  } as React.CSSProperties,

  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary-900)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'var(--color-primary-900)',
    margin: 0,
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  card: {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    border: `1px solid var(--color-neutral-200)`,
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,

  description: {
    fontSize: '14px',
    color: 'var(--color-neutral-600)',
    marginBottom: 'var(--spacing-lg)',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  } as React.CSSProperties,

  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-neutral-700)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  select: {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    border: `1px solid var(--color-neutral-300)`,
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: 'white',
    color: 'var(--color-neutral-900)',
    cursor: 'pointer',
  } as React.CSSProperties,

  textarea: {
    padding: 'var(--spacing-md)',
    border: `1px solid var(--color-neutral-300)`,
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    color: 'var(--color-neutral-900)',
    minHeight: '120px',
    resize: 'vertical',
  } as React.CSSProperties,

  uploadArea: {
    border: `2px dashed var(--color-neutral-300)`,
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-lg)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  fileInput: {
    display: 'none',
  } as React.CSSProperties,

  uploadText: {
    fontSize: '13px',
    color: 'var(--color-neutral-600)',
    margin: 0,
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  errorMessage: {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    backgroundColor: '#ffebee',
    border: `1px solid var(--color-status-danger)`,
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-status-danger)',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  submitBtn: {
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'var(--color-primary-900)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    marginTop: 'var(--spacing-md)',
  } as React.CSSProperties,
};
