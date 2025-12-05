"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose } from '@/components/ui/Modal'
import DEFAULT_CARD from './cardData'

type Props = {
  name?: string
  number?: string
  expiry?: string
  balance?: number
  walletNumber?: string
  securityKey?: string
  issuedYear?: string
}

export function VirtualCard({ name = DEFAULT_CARD.name, number = DEFAULT_CARD.number, expiry = DEFAULT_CARD.expiry, balance = DEFAULT_CARD.balance, walletNumber: propWallet, securityKey: propKey, issuedYear: propYear }: Props) {
  const [locked, setLocked] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [revealed, setRevealed] = useState(false) // user-initiated reveal of sensitive info
  const securityKey = propKey ?? DEFAULT_CARD.securityKey
  const walletNumber = propWallet ?? DEFAULT_CARD.walletNumber
  const issuedYear = propYear ?? DEFAULT_CARD.issuedYear

  const masked = (num: string) => {
    const parts = num.split(' ')
    return parts.map((p, i) => (i < parts.length - 1 ? '••••' : p)).join(' ')
  }

  const copyToClipboard = async (text: string, label = 'copied') => {
    if (!revealed) {
      alert('Reveal sensitive info to copy')
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      alert(`${label} copied`)
    } catch (e) {
      alert('Copy failed')
    }
  }

  const frontStyle: React.CSSProperties = {
    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
  }

  const backStyle: React.CSSProperties = {
    transform: flipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    position: 'absolute',
    inset: 0,
  }

  const containerStyle: React.CSSProperties = {
    perspective: '1000px',
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Virtual Health Card</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={containerStyle} className="rounded-lg">
          <div className="relative w-full h-56 mx-auto" style={{ transition: 'transform 0.6s', transformStyle: 'preserve-3d' }}>
            {/* Front */}
            <div style={frontStyle as any} className="absolute inset-0 rounded-lg p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-white/80">Your Bank</div>
                  <div className="mt-2 font-semibold text-lg">Health Wallet</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xs text-white/80">Balance</div>
                  <div className="font-bold text-lg">PKR {balance.toLocaleString()}</div>
                </div>
              </div>

                <div className="mt-6 bg-white/10 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-lg tracking-widest">{locked ? '•••• •••• •••• ••••' : revealed ? number : masked(number)}</div>
                  <div className="text-sm text-white/80">Exp {expiry}</div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm">{name}</div>
                  <div className="text-xs text-white/70">CVV {revealed && !locked ? '123' : '•••'}</div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-white/80">
                  <div>Wallet: {revealed ? walletNumber : walletNumber.replace(/.(?=.{4})/g, '•')}</div>
                  <div>Sec Key: {revealed ? securityKey : '••••••••'}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button className="text-slate-800" size="sm" variant="ghost" onClick={() => setLocked((s) => !s)}>{locked ? 'Unlock' : 'Lock'}</Button>
                <Button className="text-slate-800" size="sm" variant="outline" onClick={() => setRevealed((s) => !s)}>{revealed ? 'Hide' : 'Show'}</Button>
                <Button className="text-slate-800" size="sm" variant="outline" onClick={() => copyToClipboard(number, 'Card number')}>Copy Number</Button>
                <Button className="text-slate-800" size="sm" variant="ghost" onClick={() => copyToClipboard(walletNumber, 'Wallet number')}>Copy Wallet</Button>
                <Button className="text-slate-800" size="sm" variant="ghost" onClick={() => setFlipped(true)}>Flip</Button>
                <Button className="text-slate-800" size="sm" variant="ghost" onClick={() => alert('Download card (placeholder)')}>Download</Button>
              </div>
            </div>

            {/* Back */}
            <div style={backStyle as any} className="rounded-lg p-4 bg-gray-800 text-white shadow-lg">
              <div className="h-10 bg-black/70 rounded-sm mb-3" />
              <div className="flex items-center justify-between">
                <div className="w-2/3">
                  <div className="bg-white h-8 rounded-sm px-3 flex items-center">
                    <div className="flex-1 text-sm font-mono">Signature</div>
                    <div className="text-xs">CVV</div>
                    <div className="ml-2 font-mono">{locked ? '•••' : '123'}</div>
                  </div>
                  <div className="mt-3 text-xs text-white/80">Security Key</div>
                  <div className="font-mono">{revealed ? securityKey : '••••••••'}</div>
                </div>
                <div className="w-1/3 text-right">
                  <div className="mb-2">Issued</div>
                  <div className="font-medium">{issuedYear}</div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm">Holder</div>
                <div className="font-medium">{name}</div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button className="text-slate-800" size="sm" variant="ghost" onClick={() => {
                  if (!revealed) { alert('Reveal to copy security key'); return }
                  copyToClipboard(securityKey, 'Security key')
                }}>Copy Key</Button>
                <Button className="text-slate-800" size="sm" variant="ghost" onClick={() => setFlipped(false)}>Flip to Front</Button>
                <Button className="text-slate-800" size="sm" variant="ghost" onClick={() => alert('Print placeholder')}>Print</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VirtualCard
