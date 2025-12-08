'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, Wallet, Calendar, User, Hash, Shield } from 'lucide-react'

export default function HealthCardPage() {
  const [activeTab, setActiveTab] = useState('subscription')
  
  // Subscription card state - start with locked and hidden
  const [subLocked, setSubLocked] = useState(true)
  const [subFlipped, setSubFlipped] = useState(false)
  const [subRevealed, setSubRevealed] = useState(false)
  const subTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Asset card state - start with locked and hidden
  const [assetLocked, setAssetLocked] = useState(true)
  const [assetFlipped, setAssetFlipped] = useState(false)
  const [assetRevealed, setAssetRevealed] = useState(false)
  const assetTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-hide subscription info after 15 seconds
  useEffect(() => {
    if (subRevealed) {
      // Clear any existing timer
      if (subTimerRef.current) {
        clearTimeout(subTimerRef.current)
      }
      // Set new timer for 15 seconds
      subTimerRef.current = setTimeout(() => {
        setSubRevealed(false)
        setSubLocked(true)
      }, 15000)
    }
    return () => {
      if (subTimerRef.current) {
        clearTimeout(subTimerRef.current)
      }
    }
  }, [subRevealed])

  // Auto-hide asset info after 15 seconds
  useEffect(() => {
    if (assetRevealed) {
      // Clear any existing timer
      if (assetTimerRef.current) {
        clearTimeout(assetTimerRef.current)
      }
      // Set new timer for 15 seconds
      assetTimerRef.current = setTimeout(() => {
        setAssetRevealed(false)
        setAssetLocked(true)
      }, 15000)
    }
    return () => {
      if (assetTimerRef.current) {
        clearTimeout(assetTimerRef.current)
      }
    }
  }, [assetRevealed])

  const handleSubShow = () => {
    setSubRevealed(true)
    setSubLocked(false)
  }

  const handleAssetShow = () => {
    setAssetRevealed(true)
    setAssetLocked(false)
  }

  // Mock data for subscription-based card
  const subscriptionCard = {
    cardNumber: 'SUB-2025-001234',
    holderName: 'Ahmed Patient',
    plan: 'Premium Health Plan',
    htBalance: 250,
    validUntil: '2026-12-31',
    issueDate: '2025-01-01',
    status: 'Active',
    cvv: '456',
    securityKey: 'SK789012'
  }

  // Mock data for asset-based card
  const assetCard = {
    cardNumber: 'AST-2025-005678',
    holderName: 'Ahmed Patient',
    assetValue: 1000,
    htBalance: 850,
    validUntil: 'As long as assets held',
    issueDate: '2025-06-15',
    status: 'Active',
    cvv: '789',
    securityKey: 'SK345678'
  }

  const maskCardNumber = (num: string, revealed: boolean) => {
    if (revealed) return num
    const parts = num.split('-')
    return parts.map((p, i) => (i < parts.length - 1 ? '••••' : p)).join('-')
  }

  const copyToClipboard = async (text: string, label: string, revealed: boolean) => {
    if (!revealed) {
      alert('Please reveal sensitive info first')
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      alert(`${label} copied to clipboard`)
    } catch (e) {
      alert('Copy failed')
    }
  }

  const cardStyle = {
    perspective: '1000px',
  }

  const frontStyle = (flipped: boolean): React.CSSProperties => ({
    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s',
  })

  const backStyle = (flipped: boolean): React.CSSProperties => ({
    transform: flipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    position: 'absolute',
    inset: 0,
    transition: 'transform 0.6s',
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Health Cards</h1>
        <p className="text-muted-foreground">Manage your subscription and asset-based health cards</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="subscription">Subscription Card</TabsTrigger>
          <TabsTrigger value="asset">Asset-Based Card</TabsTrigger>
        </TabsList>

        {/* Subscription-Based Health Card */}
        <TabsContent value="subscription" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Virtual Card with Flip */}
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div style={cardStyle} className="relative w-full h-64">
                  {/* Front of Card */}
                  <div style={frontStyle(subFlipped) as any} className="absolute inset-0 rounded-lg p-6 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white shadow-lg">
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs opacity-80 uppercase tracking-wide">Subscription Health Card</p>
                          <p className="text-lg font-bold mt-1">{subscriptionCard.plan}</p>
                        </div>
                        <CreditCard className="w-8 h-8 opacity-80" />
                      </div>

                      <div className="bg-white/10 p-3 rounded-md">
                        <p className="text-xs opacity-80 mb-1">Card Number</p>
                        <p className="text-base font-mono tracking-wider">
                          {subLocked ? '•••• •••• ••••' : maskCardNumber(subscriptionCard.cardNumber, subRevealed)}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm">{subscriptionCard.holderName}</span>
                          <span className="text-xs">CVV: {subRevealed && !subLocked ? subscriptionCard.cvv : '•••'}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs opacity-80">HT Balance</p>
                          <p className="text-2xl font-bold">{subscriptionCard.htBalance} HT</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-80">Valid Until</p>
                          <p className="text-sm">{new Date(subscriptionCard.validUntil).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div style={backStyle(subFlipped) as any} className="rounded-lg p-6 bg-gray-800 text-white shadow-lg">
                    <div className="h-10 bg-black/70 rounded-sm mb-4" />
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="bg-white h-8 rounded-sm px-3 flex items-center justify-between text-gray-800">
                          <span className="text-xs">Signature</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">CVV</span>
                            <span className="font-mono text-sm">{subLocked ? '•••' : subscriptionCard.cvv}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-xs opacity-80">Security Key</p>
                          <p className="font-mono text-sm">{subRevealed ? subscriptionCard.securityKey : '••••••••'}</p>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-xs opacity-80">Issued</p>
                        <p className="text-sm">{new Date(subscriptionCard.issueDate).getFullYear()}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <div>
                        <p className="text-xs opacity-80">Cardholder</p>
                        <p className="font-semibold">{subscriptionCard.holderName}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Buttons below card */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => setSubLocked(!subLocked)} disabled={subRevealed}>
                    {subLocked ? 'Unlock' : 'Lock'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleSubShow}>
                    Show Info 
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(subscriptionCard.cardNumber, 'Card number', subRevealed)}>
                    Copy Number
                  </Button>
                  {subFlipped ? (
                    <Button size="sm" variant="outline" onClick={() => setSubFlipped(false)}>
                      Flip to Front
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setSubFlipped(true)}>
                      Flip to Back
                    </Button>
                  )}
                  {subFlipped && (
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(subscriptionCard.securityKey, 'Security key', subRevealed)}>
                      Copy Security Key
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Card Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Cardholder Name</p>
                      <p className="font-semibold">{subscriptionCard.holderName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Card Number</p>
                      <p className="font-mono text-sm">{subscriptionCard.cardNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Subscription Plan</p>
                      <p className="font-semibold">{subscriptionCard.plan}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">HT Token Balance</p>
                      <p className="font-semibold text-primary">{subscriptionCard.htBalance} HT</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Valid Until</p>
                      <p className="font-semibold">{new Date(subscriptionCard.validUntil).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Issue Date</p>
                      <p className="font-semibold">{new Date(subscriptionCard.issueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-success/10 text-success">
                        {subscriptionCard.status}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Asset-Based Health Card */}
        <TabsContent value="asset" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Virtual Card with Flip */}
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div style={cardStyle} className="relative w-full h-64">
                  {/* Front of Card */}
                  <div style={frontStyle(assetFlipped) as any} className="absolute inset-0 rounded-lg p-6 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white shadow-lg">
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs opacity-80 uppercase tracking-wide">Asset-Based Health Card</p>
                          <p className="text-lg font-bold mt-1">Premium Asset Holder</p>
                        </div>
                        <Wallet className="w-8 h-8 opacity-80" />
                      </div>

                      <div className="bg-white/10 p-3 rounded-md">
                        <p className="text-xs opacity-80 mb-1">Card Number</p>
                        <p className="text-base font-mono tracking-wider">
                          {assetLocked ? '•••• •••• ••••' : maskCardNumber(assetCard.cardNumber, assetRevealed)}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm">{assetCard.holderName}</span>
                          <span className="text-xs">CVV: {assetRevealed && !assetLocked ? assetCard.cvv : '•••'}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs opacity-80">HT Balance</p>
                          <p className="text-2xl font-bold">{assetCard.htBalance} HT</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-80">Asset Value</p>
                          <p className="text-sm font-semibold">{assetCard.assetValue} AT</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div style={backStyle(assetFlipped) as any} className="rounded-lg p-6 bg-gray-800 text-white shadow-lg">
                    <div className="h-10 bg-black/70 rounded-sm mb-4" />
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="bg-white h-8 rounded-sm px-3 flex items-center justify-between text-gray-800">
                          <span className="text-xs">Signature</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">CVV</span>
                            <span className="font-mono text-sm">{assetLocked ? '•••' : assetCard.cvv}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-xs opacity-80">Security Key</p>
                          <p className="font-mono text-sm">{assetRevealed ? assetCard.securityKey : '••••••••'}</p>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-xs opacity-80">Issued</p>
                        <p className="text-sm">{new Date(assetCard.issueDate).getFullYear()}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <div>
                        <p className="text-xs opacity-80">Cardholder</p>
                        <p className="font-semibold">{assetCard.holderName}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Buttons below card */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => setAssetLocked(!assetLocked)} disabled={assetRevealed}>
                    {assetLocked ? 'Unlock' : 'Lock'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleAssetShow}>
                    Show Info 
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(assetCard.cardNumber, 'Card number', assetRevealed)}>
                    Copy Number
                  </Button>
                  {assetFlipped ? (
                    <Button size="sm" variant="outline" onClick={() => setAssetFlipped(false)}>
                      Flip to Front
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setAssetFlipped(true)}>
                      Flip to Back
                    </Button>
                  )}
                  {assetFlipped && (
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(assetCard.securityKey, 'Security key', assetRevealed)}>
                      Copy Security Key
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Card Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Cardholder Name</p>
                      <p className="font-semibold">{assetCard.holderName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Card Number</p>
                      <p className="font-mono text-sm">{assetCard.cardNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Asset Token Value</p>
                      <p className="font-semibold">{assetCard.assetValue} AT</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">HT Token Balance</p>
                      <p className="font-semibold text-primary">{assetCard.htBalance} HT</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Valid Until</p>
                      <p className="font-semibold">{assetCard.validUntil}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Issue Date</p>
                      <p className="font-semibold">{new Date(assetCard.issueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-success/10 text-success">
                        {assetCard.status}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
