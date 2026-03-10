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
        <div className="rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white">
          <div className="text-xs uppercase tracking-wide opacity-80">Card Number</div>
          <div className="mt-1 font-mono text-lg">{mask(card.cardNum, reveal)}</div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80">Expiry</div>
              <div className="font-medium">
                {card.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-80">CVV</div>
              <div className="font-mono font-medium">{mask(card.cvv, reveal)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-80">HT Balance</div>
              <div className="font-semibold">{card.htBalance} HT</div>
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
