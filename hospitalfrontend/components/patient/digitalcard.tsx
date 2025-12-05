'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DEFAULT_CARD from './cardData'

export function DigitalCard() {
  const [revealed, setRevealed] = useState(false)
  const walletNumber = DEFAULT_CARD.walletNumber
  const securityKey = DEFAULT_CARD.securityKey

  const maskedWallet = walletNumber.replace(/.(?=.{4})/g, '•')

  const copyToClipboard = async (text: string, label = 'copied') => {
    if (!revealed) { alert('Reveal to copy'); return }
    try {
      await navigator.clipboard.writeText(text)
      alert(`${label} copied`)
    } catch (e) {
      alert('Copy failed')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Digital Health Card</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-40 bg-muted rounded mb-4">
          <span className="text-muted-foreground text-sm">QR Code Placeholder</span>
        </div>

        <div className="text-sm text-muted-foreground mb-2">Wallet Number</div>
        <div className="font-mono mb-3">{revealed ? walletNumber : maskedWallet}</div>

        <div className="text-sm text-muted-foreground">Security Key</div>
        <div className="font-mono mb-3">{revealed ? securityKey : '••••••••'}</div>

        <div className="flex items-center gap-2">
          <Button className="text-slate-800" size="sm" variant="outline" onClick={() => setRevealed((s) => !s)}>{revealed ? 'Hide' : 'Show'}</Button>
          <Button className="text-slate-800" size="sm" variant="ghost" onClick={() => copyToClipboard(walletNumber, 'Wallet number')}>Copy Wallet</Button>
          <Button className="text-slate-800" size="sm" variant="ghost" onClick={() => copyToClipboard(securityKey, 'Security key')}>Copy Key</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default DigitalCard
