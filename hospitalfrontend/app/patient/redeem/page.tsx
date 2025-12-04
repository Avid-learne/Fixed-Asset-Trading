'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

export default function RedeemHTPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Redeem Health Tokens</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {['Full Checkup','Lab Test Discount','Pharmacy Voucher'].map((b) => (
          <Button key={b} variant="outline" className="justify-center">{b}</Button>
        ))}
      </div>
      <p className="text-muted-foreground text-sm">Select a benefit to continue redemption.</p>
    </div>
  )
}
