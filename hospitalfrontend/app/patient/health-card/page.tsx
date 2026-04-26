'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Copy, CreditCard, Loader2, Wallet, RotateCcw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { healthCardService, HealthCard } from '@/services/healthCardService'

export default function HealthCardPage() {
  const { user, isLoading } = useAuth()
  const userId = user?.id || (user as any)?.userId
  const [activeTab, setActiveTab] = useState('subscription')

  const [subscriptionCard, setSubscriptionCard] = useState<HealthCard | null>(null)
  const [assetCard, setAssetCard] = useState<HealthCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [subscriptionFlipped, setSubscriptionFlipped] = useState(false)
  const [assetFlipped, setAssetFlipped] = useState(false)
  const [revealSubscription, setRevealSubscription] = useState(false)
  const [revealAsset, setRevealAsset] = useState(false)

  useEffect(() => {
    const fetchHealthCards = async () => {
      if (isLoading) return

      if (!userId) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const [subCard, astCard] = await Promise.all([
          healthCardService.getSubscriptionCard(userId),
          healthCardService.getAssetCard(userId),
        ])

        setSubscriptionCard(subCard)
        setAssetCard(astCard)
      } catch (err) {
        console.error('Error fetching health cards:', err)
        setError(err instanceof Error ? err.message : 'Failed to load health cards')
      } finally {
        setLoading(false)
      }
    }

    fetchHealthCards()
  }, [userId, isLoading])

  const formatCardDigits = (value?: string) => {
    if (!value) return ''
    const digits = value.replace(/\D/g, '')
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const displayCardNumber = (value?: string, reveal = false) => {
    if (!value) return 'N/A'
    const digits = value.replace(/\D/g, '')
    if (digits.length < 8) return reveal ? value : '**** ****'
    if (reveal) return formatCardDigits(digits)

    const first = digits.slice(0, 4)
    const last = digits.slice(-4)
    return `${first} **** **** ${last}`
  }

  const displayCvv = (value?: string, reveal = false) => {
    if (!value) return '***'
    return reveal ? value : '*'.repeat(Math.min(Math.max(value.length, 3), 4))
  }

  const copy = async (value?: string) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
  }

  const renderCard = (
    card: HealthCard,
    flipped: boolean,
    revealSensitive: boolean,
    onFlip: () => void,
    onToggleReveal: () => void,
  ) => (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {card.cardName}
          </span>
          <span className="text-xs font-normal text-muted-foreground">HT Balance: {Number(card.htBalance).toLocaleString()} HT</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3D Flip Card Container */}
        <div
          className="relative cursor-pointer"
          style={{
            perspective: '1000px',
            height: '300px',
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto',
          }}
          onClick={onFlip}
        >
          {/* Flip animation wrapper */}
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              transformOrigin: 'center',
            }}
          >
            {/* Front Side */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div
                className="relative overflow-hidden rounded-3xl p-8 text-white h-full flex flex-col justify-between shadow-2xl hover:shadow-3xl transition-shadow"
                style={{
                  background: 'linear-gradient(135deg, #1f2937 0%, #111827 25%, #0d3b66 50%, #1a1f2e 75%, #0f1419 100%)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                {/* Decorative background elements */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle, #4f46e5, transparent)' }} />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full opacity-5"
                  style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />

                {/* Header */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                          color: 'white',
                        }}
                      >
                        SV
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-widest opacity-60">SehatVault</div>
                        <div className="text-sm font-semibold tracking-wide" style={{ color: '#6ee7b7' }}>
                          Health Token
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                      style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' }}>
                      VIRTUAL
                    </div>
                  </div>
                </div>

                {/* Chip */}
                <div className="relative z-10 my-6">
                  <div className="relative inline-flex items-center gap-1 p-2 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, #d4a44c 0%, #f0d78c 40%, #c49a3c 60%, #e8c86a 100%)',
                      boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.2), 0 4px 12px rgba(212, 164, 76, 0.25)',
                    }}>
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-4 w-3 rounded-sm border border-yellow-800/40"
                        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1))' }} />
                    ))}
                  </div>
                </div>

                {/* Card Number */}
                <div className="relative z-10">
                  <div className="font-mono text-[clamp(1.2rem,3vw,1.95rem)] tracking-[0.18em] font-bold mb-4 whitespace-nowrap select-none text-white">
                    {displayCardNumber(card.cardNum, revealSensitive)}
                  </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/70 mb-1">Card Holder</div>
                    <div className="font-medium text-sm text-white">SehatVault Patient</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-white/70 mb-1">Valid Thru</div>
                    <div className="font-mono text-sm font-semibold text-white">
                      {card.expiryDate
                        ? new Date(card.expiryDate).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Click hint */}
                <div className="absolute bottom-4 left-8 text-[10px] text-white/55 italic cursor-pointer">
                  Click to flip →
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div
                className="relative overflow-hidden rounded-3xl p-8 text-white h-full flex flex-col justify-between shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #1f2937 0%, #0f1419 100%)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                
                {/* Magnetic stripe */}
                <div className="w-full h-12 rounded-lg mt-6"
                  style={{ background: 'linear-gradient(90deg, #1a1a1a, #2d2d2d, #1a1a1a)' }}>
                  <div className="h-full flex items-center px-4">
                    <div className="text-[8px] tracking-[0.15em] font-mono opacity-30">
                      {card.cardNum?.slice(12) || 'XXXX'} {card.expiryDate ? new Date(card.expiryDate).getFullYear() : 'XXXX'}
                    </div>
                  </div>
                </div>

                {/* CVV Section */}
                <div className="mt-8 flex flex-col items-end">
                  <div className="text-[10px] uppercase tracking-widest text-white/70 mb-2">CVV/CVC</div>
                  <div className="font-mono text-lg font-bold tracking-[0.25em] px-4 py-2 rounded-md"
                    style={{ background: 'rgba(255,255,255,0.1)' }}>
                    {displayCvv(card.cvv, revealSensitive)}
                  </div>
                  <p className="text-[10px] text-right mt-2 text-white/60 max-w-32">Never share your CVV</p>
                </div>

                {/* HT Balance Display */}
                <div className="mt-auto pt-6 border-t border-white/10">
                  <div className="text-[10px] uppercase tracking-widest text-white/70 mb-2">HT Balance</div>
                  <div className="text-3xl font-bold" style={{ color: '#34d399' }}>
                    {Number(card.htBalance).toLocaleString()}
                  </div>
                  <div className="text-xs text-white/65 mt-1">Health Tokens Available</div>
                </div>

                {/* Click hint */}
                <div className="absolute bottom-4 left-8 text-[10px] text-white/55 italic">
                  ← Click to flip
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onFlip}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {flipped ? 'Show Front' : 'Show Back'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleReveal}
          >
            {revealSensitive ? 'Hide Card Data' : 'Reveal Card Data'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy(card.cardNum)}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Number
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy(card.cvv)}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy CVV
          </Button>
        </div>

        {/* Card Details Grid */}
        <div className="grid gap-3 text-sm md:grid-cols-2 pt-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Card Name</p>
            <p className="font-bold mt-1">{card.cardName}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Card ID</p>
            <p className="font-mono text-xs mt-1">{card.patientCardId?.slice(0, 12)}...</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Expiry Date</p>
            <p className="font-medium mt-1">
              {card.expiryDate ? new Date(card.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Status</p>
            <p className="font-medium text-green-600 mt-1">Active</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Health Cards</h1>
        <p className="text-muted-foreground mt-1">Manage your SehatVault health token cards and view balances</p>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="p-6">
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Loading health cards...</p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="p-6 border-destructive/50 bg-destructive/5">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error loading health cards</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="subscription">Subscription Card</TabsTrigger>
            <TabsTrigger value="asset">Asset-Based Card</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription" className="space-y-6">
          {!subscriptionCard ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-full bg-muted p-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-lg">No Subscription Card</p>
                  <p className="text-sm text-muted-foreground mt-1">Subscribe to a plan to get your health token card</p>
                </div>
              </div>
            </Card>
          ) : (
            renderCard(
              subscriptionCard,
              subscriptionFlipped,
              revealSubscription,
              () => setSubscriptionFlipped(prev => !prev),
              () => setRevealSubscription(prev => !prev),
            )
          )}
          </TabsContent>

          <TabsContent value="asset" className="space-y-6">
          {!assetCard ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Wallet className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-lg">No Asset Card</p>
                  <p className="text-sm text-muted-foreground mt-1">Trade assets to earn and get your asset-based card</p>
                </div>
              </div>
            </Card>
          ) : (
            renderCard(
              assetCard,
              assetFlipped,
              revealAsset,
              () => setAssetFlipped(prev => !prev),
              () => setRevealAsset(prev => !prev),
            )
          )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
