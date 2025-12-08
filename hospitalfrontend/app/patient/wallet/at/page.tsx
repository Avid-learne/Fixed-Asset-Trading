// Short overview: AT Wallet page for patients.
// - Uses `ATWalletCard` component to display balance, transactions, and transfer actions.
// - Relation: imports only `components/patient/ATWalletCard.tsx`
'use client'

import React from 'react'
import ATWalletCard from '@/components/patient/ATWalletCard'

export default function ATWalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AT Wallet</h1>
        <p className="text-muted-foreground">Manage your Asset Tokens, view balances and transaction history.</p>
      </div>
      <ATWalletCard
        balance={1050}
      />
    </div>
  )
}
