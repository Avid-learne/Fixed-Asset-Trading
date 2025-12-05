// Short overview: Patient Redeem page.
// - Uses a single component `RedeemForm` from `components/patient/RedeemForm.tsx`.
// - Presents mock redeemable items for benefits/assets and handles confirmation.
'use client'

import React from 'react'
import RedeemForm from '@/components/patient/RedeemForm'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

type RedeemItemLike = {
  id: string
  label: string
  type: 'benefit' | 'asset'
  costPerUnit: number
  maxQuantity: number
}

const MOCK_ITEMS: RedeemItemLike[] = [
  { id: 'benefit-1', label: 'Premium Dental Checkup', type: 'benefit', costPerUnit: 2500, maxQuantity: 2 },
  { id: 'benefit-2', label: 'Annual Eye Exam', type: 'benefit', costPerUnit: 1800, maxQuantity: 1 },
  { id: 'asset-1', label: 'Hospital Room Upgrade (per day)', type: 'asset', costPerUnit: 7500, maxQuantity: 10 },
]

export default function RedeemPage() {
  const handleConfirm = (payload: { itemId: string; quantity: number; totalCost: number }) => {
    // Placeholder: integrate with backend (patient-service) to create a redemption request
    // For now, we log to console; you can replace with actual API call.
    console.log('Redeem confirmed', payload)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Redeem Benefits & Assets</h1>
        <p className="text-muted-foreground">Select a benefit or asset to redeem and confirm the request.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guidelines</CardTitle>
              <CardDescription>Know before you redeem</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                <li>Redemptions may require KYC verification.</li>
                <li>Costs are estimates; final billing may vary.</li>
                <li>Asset redemptions are subject to availability.</li>
              </ul>
            </CardContent>
          </Card>
        </aside>

        <main className="col-span-12 lg:col-span-8">
          <RedeemForm items={MOCK_ITEMS} onConfirm={handleConfirm} />
        </main>
      </div>
    </div>
  )
}

