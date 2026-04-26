'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { walletService, type WalletSummary, type WalletTransaction } from '@/services/walletService'
import ATWalletCard from '@/components/patient/ATWalletCard'
import { Card, CardContent } from '@/components/ui/card'

export default function ATWalletPage() {
  const { user, isLoading } = useAuth()
  const userId = user?.id || (user as any)?.userId

  const [summary, setSummary] = useState<WalletSummary | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAtWallet = async () => {
      if (isLoading) return

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

    loadAtWallet()
  }, [userId, isLoading])

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
        <h1 className="text-2xl font-bold">AT Wallet Details</h1>
        <p className="text-muted-foreground">Your AT usage, burnt amount, and remaining balance.</p>
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

      <ATWalletCard balance={summary?.totalAt || 0} transactions={transactions} />
    </div>
  )
}
