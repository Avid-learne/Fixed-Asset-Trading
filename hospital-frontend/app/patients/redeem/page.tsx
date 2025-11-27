'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

interface Benefit {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: string;
  available: number;
}

interface RedemptionState {
  selectedBenefit: Benefit | null;
  quantity: number;
  loading: boolean;
}

export default function RedeemBenefitsPage() {
  const router = useRouter();
  const user = getCurrentUser();

  React.useEffect(() => {
    if (!user || user.role !== 'patient') {
      router.push('/patients/login');
    }
  }, [user, router]);

  const [redemptionState, setRedemptionState] = useState<RedemptionState>({
    selectedBenefit: null,
    quantity: 1,
    loading: false,
  });

  const benefits: Benefit[] = [
    {
      id: 'BENEFIT-001',
      name: 'Medical Checkup',
      description: 'Annual comprehensive health screening',
      cost: 200,
      category: 'healthcare',
      available: 15,
    },
    {
      id: 'BENEFIT-002',
      name: 'Dental Cleaning',
      description: 'Professional teeth cleaning & examination',
      cost: 150,
      category: 'dental',
      available: 22,
    },
    {
      id: 'BENEFIT-003',
      name: 'Eye Exam',
      description: 'Vision testing & prescription glasses',
      cost: 100,
      category: 'vision',
      available: 18,
    },
    {
      id: 'BENEFIT-004',
      name: 'Pharmacy Credits',
      description: '$50 credit for prescription medications',
      cost: 50,
      category: 'pharmacy',
      available: 35,
    },
    {
      id: 'BENEFIT-005',
      name: 'Wellness Program',
      description: '3-month fitness & nutrition coaching',
      cost: 300,
      category: 'wellness',
      available: 8,
    },
    {
      id: 'BENEFIT-006',
      name: 'Mental Health Consultation',
      description: '6 sessions with licensed therapist',
      cost: 250,
      category: 'mental-health',
      available: 12,
    },
  ];

  const handleRedeemClick = (benefit: Benefit) => {
    setRedemptionState({
      selectedBenefit: benefit,
      quantity: 1,
      loading: false,
    });
  };

  const handleConfirmRedemption = async () => {
    if (!redemptionState.selectedBenefit) return;

    setRedemptionState(prev => ({ ...prev, loading: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/patients?success=redemption');
    } catch (err) {
      alert('Redemption failed. Please try again.');
      setRedemptionState(prev => ({ ...prev, loading: false }));
    }
  };

  const closeModal = () => {
    setRedemptionState({
      selectedBenefit: null,
      quantity: 1,
      loading: false,
    });
  };

  const userBalance = 2450;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => router.back()} style={styles.backBtn}>
          ← Back
        </button>
        <h1 style={styles.title}>Redeem Benefits</h1>
      </div>

      {/* Balance Card */}
      <div style={styles.balanceCard}>
        <span style={styles.balanceLabel}>Your HBT Balance</span>
        <span style={styles.balanceValue}>{userBalance}</span>
        <span style={styles.balanceUnit}>Health Benefit Tokens</span>
      </div>

      {/* Benefits Grid */}
      <div style={styles.benefitsGrid}>
        {benefits.map((benefit) => (
          <button
            key={benefit.id}
            onClick={() => handleRedeemClick(benefit)}
            style={{
              ...styles.benefitCard,
              opacity: benefit.available === 0 ? 0.5 : 1,
              cursor: benefit.available === 0 ? 'not-allowed' : 'pointer',
            }}
            disabled={benefit.available === 0}
          >
            <div style={styles.benefitCategory}>{benefit.category.toUpperCase()}</div>
            <h3 style={styles.benefitName}>{benefit.name}</h3>
            <p style={styles.benefitDescription}>{benefit.description}</p>
            <div style={styles.benefitFooter}>
              <span style={styles.benefitCost}>{benefit.cost} HBT</span>
              <span style={styles.benefitAvailable}>
                {benefit.available > 0 ? `${benefit.available} left` : 'Unavailable'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Redemption Modal */}
      {redemptionState.selectedBenefit && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <button onClick={closeModal} style={styles.closeBtn}>×</button>
            
            <h2 style={styles.modalTitle}>Redeem Benefit</h2>
            
            <div style={styles.modalContent}>
              <div style={styles.benefitSummary}>
                <span style={styles.summaryLabel}>{redemptionState.selectedBenefit.category.toUpperCase()}</span>
                <h3 style={styles.summaryName}>{redemptionState.selectedBenefit.name}</h3>
                <p style={styles.summaryDescription}>{redemptionState.selectedBenefit.description}</p>
              </div>

              <div style={styles.quantitySelector}>
                <label style={styles.quantityLabel}>Quantity</label>
                <div style={styles.quantityControls}>
                  <button
                    onClick={() => setRedemptionState(prev => ({
                      ...prev,
                      quantity: Math.max(1, prev.quantity - 1)
                    }))}
                    style={styles.quantityBtn}
                  >
                    −
                  </button>
                  <span style={styles.quantityValue}>{redemptionState.quantity}</span>
                  <button
                    onClick={() => setRedemptionState(prev => ({
                      ...prev,
                      quantity: Math.min(
                        redemptionState.selectedBenefit?.available || 1,
                        prev.quantity + 1
                      )
                    }))}
                    style={styles.quantityBtn}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={styles.costSummary}>
                <div style={styles.costRow}>
                  <span>Cost per unit:</span>
                  <span style={styles.costValue}>{redemptionState.selectedBenefit.cost} HBT</span>
                </div>
                <div style={styles.costRow}>
                  <span>Quantity:</span>
                  <span style={styles.costValue}>{redemptionState.quantity}</span>
                </div>
                <div style={styles.costRowTotal}>
                  <span>Total Cost:</span>
                  <span style={styles.costValueTotal}>
                    {redemptionState.selectedBenefit.cost * redemptionState.quantity} HBT
                  </span>
                </div>
                <div style={styles.costRow}>
                  <span>Balance After:</span>
                  <span
                    style={{
                      ...styles.costValue,
                      color: userBalance - (redemptionState.selectedBenefit.cost * redemptionState.quantity) >= 0
                        ? 'var(--color-primary-900)'
                        : 'var(--color-status-danger)',
                    }}
                  >
                    {userBalance - (redemptionState.selectedBenefit.cost * redemptionState.quantity)} HBT
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button onClick={closeModal} style={styles.cancelBtn}>
                Cancel
              </button>
              <button
                onClick={handleConfirmRedemption}
                disabled={
                  redemptionState.loading ||
                  userBalance < (redemptionState.selectedBenefit.cost * redemptionState.quantity)
                }
                style={{
                  ...styles.confirmBtn,
                  opacity: redemptionState.loading ? 0.6 : 1,
                  cursor: redemptionState.loading ? 'not-allowed' : 'pointer',
                }}
              >
                {redemptionState.loading ? 'Processing...' : 'Confirm Redemption'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 'var(--spacing-lg)',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#fafafa',
    minHeight: '100vh',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-lg)',
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

  balanceCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    border: `1px solid var(--color-neutral-200)`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-xl)',
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,

  balanceLabel: {
    fontSize: '13px',
    color: 'var(--color-neutral-600)',
    textTransform: 'uppercase',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  balanceValue: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: 'var(--color-secondary-900)',
    fontFamily: 'Roboto Mono, monospace',
    marginTop: 'var(--spacing-sm)',
  } as React.CSSProperties,

  balanceUnit: {
    fontSize: '13px',
    color: 'var(--color-neutral-600)',
    fontFamily: 'Inter, sans-serif',
    marginTop: 'var(--spacing-sm)',
  } as React.CSSProperties,

  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-xl)',
  } as React.CSSProperties,

  benefitCard: {
    backgroundColor: 'white',
    border: `1px solid var(--color-neutral-200)`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  benefitCategory: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-secondary-900)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  benefitName: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-primary-900)',
    margin: 0,
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  benefitDescription: {
    fontSize: '13px',
    color: 'var(--color-neutral-600)',
    margin: 0,
    lineHeight: '1.5',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  benefitFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 'var(--spacing-md)',
    borderTop: `1px solid var(--color-neutral-200)`,
    marginTop: 'auto',
  } as React.CSSProperties,

  benefitCost: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-primary-900)',
    fontFamily: 'Roboto Mono, monospace',
  } as React.CSSProperties,

  benefitAvailable: {
    fontSize: '12px',
    color: 'var(--color-neutral-600)',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as React.CSSProperties,

  modal: {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    maxWidth: '480px',
    width: '90%',
    position: 'relative',
    boxShadow: 'var(--shadow-xl)',
  } as React.CSSProperties,

  closeBtn: {
    position: 'absolute',
    top: 'var(--spacing-md)',
    right: 'var(--spacing-md)',
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: 'var(--color-neutral-600)',
    cursor: 'pointer',
    padding: 0,
  } as React.CSSProperties,

  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--color-primary-900)',
    margin: '0 0 var(--spacing-lg) 0',
    paddingRight: 'var(--spacing-lg)',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-lg)',
  } as React.CSSProperties,

  benefitSummary: {
    backgroundColor: '#f5f5f5',
    padding: 'var(--spacing-md)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  } as React.CSSProperties,

  summaryLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-secondary-900)',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  summaryName: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-primary-900)',
    margin: 0,
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  summaryDescription: {
    fontSize: '13px',
    color: 'var(--color-neutral-600)',
    margin: 0,
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  quantitySelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  } as React.CSSProperties,

  quantityLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-neutral-700)',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    backgroundColor: '#f5f5f5',
    padding: 'var(--spacing-sm)',
    borderRadius: 'var(--radius-md)',
  } as React.CSSProperties,

  quantityBtn: {
    background: 'white',
    border: `1px solid var(--color-neutral-300)`,
    borderRadius: 'var(--radius-md)',
    width: '32px',
    height: '32px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    color: 'var(--color-primary-900)',
  } as React.CSSProperties,

  quantityValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'Roboto Mono, monospace',
  } as React.CSSProperties,

  costSummary: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-md)',
    backgroundColor: '#f5f5f5',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  costRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--color-neutral-700)',
  } as React.CSSProperties,

  costRowTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--color-primary-900)',
    fontWeight: '600',
    paddingTop: 'var(--spacing-sm)',
    borderTop: `1px solid var(--color-neutral-300)`,
  } as React.CSSProperties,

  costValue: {
    fontFamily: 'Roboto Mono, monospace',
    fontWeight: '500',
  } as React.CSSProperties,

  costValueTotal: {
    fontFamily: 'Roboto Mono, monospace',
    fontWeight: '600',
  } as React.CSSProperties,

  modalActions: {
    display: 'flex',
    gap: 'var(--spacing-md)',
  } as React.CSSProperties,

  cancelBtn: {
    flex: 1,
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'transparent',
    border: `1px solid var(--color-neutral-300)`,
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    color: 'var(--color-neutral-700)',
  } as React.CSSProperties,

  confirmBtn: {
    flex: 1,
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'var(--color-secondary-900)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,
};
