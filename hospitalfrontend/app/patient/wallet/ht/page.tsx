// Short overview: HT Wallet page for patients.
// - Uses `HTWalletCard` component to display balance, activity, and transfer actions.
// - Relation: imports only `components/patient/HTWalletCard.tsx`
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import HTWalletCard from '@/components/patient/HTWalletCard'
import { useAuth } from '@/contexts/AuthContext'
import { walletService, WalletSummary, WalletTransaction } from '@/services/walletService'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function HTWalletPage() {
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
      const [summaryData, htTx] = await Promise.all([
        walletService.getSummary(userId),
        walletService.getTokenTransactions(userId, 'HT'),
      ])
      setSummary(summaryData)
      setTransactions(htTx)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load HT wallet data')
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

  const totalRedeemed = useMemo(
    () => transactions.filter((t) => t.transactionType === 'DEBIT').reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [transactions],
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
        <h1 className="text-2xl font-bold">HT Wallet</h1>
        <p className="text-muted-foreground">Manage your Health Tokens, redeem benefits and track activity.</p>
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

      <HTWalletCard
        balance={summary?.totalHt || 0}
        transactions={transactions}
        totalRedeemed={totalRedeemed}
        upcomingBenefits={0}
        onTransfer={handleTransfer}
      />
    </div>
  )
}
