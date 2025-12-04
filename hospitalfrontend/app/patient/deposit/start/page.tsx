'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

export default function DepositStart() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Start Deposit</h1>
      <p className="text-muted-foreground">Choose an asset type to begin.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['Gold','Cash','Land','Vehicle'].map((t) => (
          <Button key={t} variant="outline" className="justify-center">{t}</Button>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">Multi-step wizard will guide you through details, documents, bank selection, and confirmation.</div>
    </div>
  )
}
