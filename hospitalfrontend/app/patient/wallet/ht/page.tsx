// Short overview: HT Wallet page for patients.
// - Uses `HTWalletCard` component to display balance, activity, and transfer actions.
// - Relation: imports only `components/patient/HTWalletCard.tsx`
'use client'

import React from 'react'
import HTWalletCard from '@/components/patient/HTWalletCard'

export default function HTWalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">HT Wallet</h1>
        <p className="text-muted-foreground">Manage your Health Tokens, redeem benefits and track activity.</p>
      </div>
      <HTWalletCard
        balance={850}
        totalRedeemed={450}
        upcomingBenefits={3}
      />
    </div>
  )
}
