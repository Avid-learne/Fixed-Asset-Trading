// Short overview: Unified Wallet page for HT-only patient experience.
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import HTWalletCard from '@/components/patient/HTWalletCard'
import { AlertCircle, Heart, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { walletService, WalletSummary, WalletTransaction } from '@/services/walletService'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function WalletPage() {
  const { user } = useAuth()
  const userId = user?.id || (user as any)?.userId

  const [summary, setSummary] = useState<WalletSummary | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    loadWallet()
  }, [userId])

  const handleTransfer = async (recipientWalletAddress: string, amount: number, note?: string) => {
    await walletService.transferHT(recipientWalletAddress, amount, note)
    await loadWallet()
  }

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
        <p className="text-muted-foreground">Manage your Health Tokens and view your AT usage details.</p>
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

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">Need AT details (burnt, left, where used)?</div>
            <Link href="/patient/wallet/at">
              <Button size="sm" variant="outline">Open AT Details</Button>
            </Link>
          </div>
          <div className="mb-4 flex items-center gap-2 text-muted-foreground">
            <Heart className="w-4 h-4" />
            Health Tokens (HT)
          </div>
          <HTWalletCard
            balance={summary?.totalHt || 0}
            transactions={htTransactions}
            totalRedeemed={totalRedeemed}
            upcomingBenefits={0}
            onTransfer={handleTransfer}
          />
        </CardContent>
      </Card>
    </div>
  )
}
