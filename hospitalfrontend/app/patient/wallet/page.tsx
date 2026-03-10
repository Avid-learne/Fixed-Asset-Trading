// Short overview: Unified Wallet page with tabs for AT and HT wallets
// - Displays both Asset Tokens and Health Tokens in separate tabs
// - Relation: imports ATWalletCard and HTWalletCard components
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ATWalletCard from '@/components/patient/ATWalletCard'
import HTWalletCard from '@/components/patient/HTWalletCard'
import { AlertCircle, Coins, Heart, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { walletService, WalletSummary, WalletTransaction } from '@/services/walletService'
import { Card, CardContent } from '@/components/ui/card'

export default function WalletPage() {
  const { user } = useAuth()
  const userId = user?.id || (user as any)?.userId

  const [summary, setSummary] = useState<WalletSummary | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWallet = async () => {
      if (!userId) {
        setLoading(false)
        setError('User not authenticated')
        return
      }

      try {
        setLoading(true)
        setError(null)

        const [summaryData, txData] = await Promise.all([
          walletService.getSummary(userId),
          walletService.getTransactions(userId),
        ])

        setSummary(summaryData)
        setTransactions(txData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wallet data')
      } finally {
        setLoading(false)
      }
    }

    loadWallet()
  }, [userId])

  const atTransactions = useMemo(() => transactions.filter((t) => t.tokenSymbol === 'AT'), [transactions])
  const htTransactions = useMemo(() => transactions.filter((t) => t.tokenSymbol === 'HT'), [transactions])
  const totalRedeemed = useMemo(
    () => htTransactions.filter((t) => t.transactionType === 'DEBIT').reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [htTransactions],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Wallet</h1>
        <p className="text-muted-foreground">Manage your Asset Tokens and Health Tokens in one place</p>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 text-destructive">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="at" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="at" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Asset Tokens (AT)
          </TabsTrigger>
          <TabsTrigger value="ht" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Health Tokens (HT)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="at" className="space-y-4 mt-6">
          <ATWalletCard
            balance={summary?.totalAt || 0}
            transactions={atTransactions}
          />
        </TabsContent>

        <TabsContent value="ht" className="space-y-4 mt-6">
          <HTWalletCard
            balance={summary?.totalHt || 0}
            transactions={htTransactions}
            totalRedeemed={totalRedeemed}
            upcomingBenefits={0}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
