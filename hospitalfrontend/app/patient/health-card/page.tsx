'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Copy, CreditCard, Loader2, Wallet } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { healthCardService, HealthCard } from '@/services/healthCardService'

export default function HealthCardPage() {
  const { user } = useAuth()
  const userId = user?.id || (user as any)?.userId
  const [activeTab, setActiveTab] = useState('subscription')

  const [subscriptionCard, setSubscriptionCard] = useState<HealthCard | null>(null)
  const [assetCard, setAssetCard] = useState<HealthCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revealSubscription, setRevealSubscription] = useState(false)
  const [revealAsset, setRevealAsset] = useState(false)

  useEffect(() => {
    const fetchHealthCards = async () => {
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
  }, [userId])

  const mask = (value?: string, visible?: boolean) => {
    if (!value) return 'N/A'
    if (visible) return value
    return '*'.repeat(Math.max(value.length, 4))
  }

  const copy = async (value?: string) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
  }

  const renderCard = (card: HealthCard, reveal: boolean, onToggleReveal: () => void) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {card.cardName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* NayaPay-style virtual card */}
        <div className="relative overflow-hidden rounded-2xl p-6 text-white"
          style={{
            background: 'linear-gradient(135deg, #0a2e1f 0%, #0d4a3a 25%, #0b3d5c 50%, #0a2f4e 75%, #061e35 100%)',
            minHeight: '220px',
          }}
        >
          {/* Subtle decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(14,116,144,0.06) 0%, transparent 70%)' }} />
          <div className="pointer-events-none absolute right-20 bottom-10 h-32 w-32 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)' }} />

          {/* Card header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-wide" style={{ color: '#6ee7b7' }}>
                SehatVault
              </span>
            </div>
            <div className="text-xs font-medium uppercase tracking-widest opacity-60">Virtual</div>
          </div>

          {/* Chip */}
          <div className="mt-5 flex items-center gap-3">
            <div className="h-8 w-11 rounded-md"
              style={{
                background: 'linear-gradient(135deg, #d4a44c 0%, #f0d78c 40%, #c49a3c 60%, #e8c86a 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.2)',
              }}
            >
              <div className="flex h-full items-center justify-center">
                <div className="h-4 w-6 rounded-sm border border-yellow-700/30" />
              </div>
            </div>
          </div>

          {/* Card number */}
          <div className="mt-4 font-mono text-xl tracking-[0.2em] font-medium">
            {mask(card.cardNum, reveal)}
          </div>

          {/* Bottom row */}
          <div className="mt-5 flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: '#6ee7b7' }}>
                Valid Thru
              </div>
              <div className="mt-0.5 font-mono text-sm font-medium">
                {card.expiryDate
                  ? new Date(card.expiryDate).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' })
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: '#6ee7b7' }}>
                CVV
              </div>
              <div className="mt-0.5 font-mono text-sm font-medium">{mask(card.cvv, reveal)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: '#6ee7b7' }}>
                HT Balance
              </div>
              <div className="mt-0.5 text-lg font-bold" style={{ color: '#34d399' }}>
                {Number(card.htBalance).toLocaleString()} HT
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onToggleReveal}>
            {reveal ? 'Hide Sensitive Data' : 'Reveal Sensitive Data'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => copy(card.cardNum)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Number
          </Button>
        </div>

        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground">Card Name</p>
            <p className="font-medium">{card.cardName}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground">Patient Card ID</p>
            <p className="font-mono text-xs">{card.patientCardId}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground">Expiry Date</p>
            <p className="font-medium">{card.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground">HT Balance</p>
            <p className="font-medium">{card.htBalance} HT</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Health Cards</h1>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Loading health cards...</p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="p-6 border-destructive">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-6 w-6" />
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
            <Card className="p-6">
              <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-lg">No Subscription Card</p>
                  <p className="text-sm text-muted-foreground">You don't have an active subscription card yet</p>
                </div>
              </div>
            </Card>
          ) : (
            renderCard(subscriptionCard, revealSubscription, () => setRevealSubscription(prev => !prev))
          )}
          </TabsContent>

          <TabsContent value="asset" className="space-y-6">
          {!assetCard ? (
            <Card className="p-6">
              <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
                <Wallet className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-lg">No Asset Card</p>
                  <p className="text-sm text-muted-foreground">You don't have an active asset-based card yet</p>
                </div>
              </div>
            </Card>
          ) : (
            renderCard(assetCard, revealAsset, () => setRevealAsset(prev => !prev))
          )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
