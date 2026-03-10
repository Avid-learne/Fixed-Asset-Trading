// Short overview: AT Wallet page for patients.
// - Uses `ATWalletCard` component to display balance, transactions, and transfer actions.
// - Relation: imports only `components/patient/ATWalletCard.tsx`
'use client'

import React, { useEffect, useState } from 'react'
import ATWalletCard from '@/components/patient/ATWalletCard'
import { useAuth } from '@/contexts/AuthContext'
import { walletService, WalletSummary, WalletTransaction } from '@/services/walletService'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ATWalletPage() {
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
        const [summaryData, atTx] = await Promise.all([
          walletService.getSummary(userId),
          walletService.getTokenTransactions(userId, 'AT'),
        ])
        setSummary(summaryData)
        setTransactions(atTx)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load AT wallet data')
      } finally {
        setLoading(false)
      }
    }

    loadWallet()
  }, [userId])

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
        <h1 className="text-2xl font-bold">AT Wallet</h1>
        <p className="text-muted-foreground">Manage your Asset Tokens, view balances and transaction history.</p>
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

      <ATWalletCard
        balance={summary?.totalAt || 0}
        transactions={transactions}
      />
    </div>
  )
}
