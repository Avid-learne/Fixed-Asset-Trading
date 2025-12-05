// Short overview: Summary card showing totals for AT, HT and profit.
// - Computes (basic) totals from the provided transactions.
// - Relation: Appears in the Activity sidebar as the account summary.
import React, { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tx } from '@/types/activity'

type Props = { transactions: Tx[] }

export default function ActivitySummary({ transactions }: Props) {
  const totals = useMemo(() => {
    const totalAT = transactions.reduce((s, t) => s + (t.atTokens ?? 0), 0)
    const totalHTUsed = transactions.reduce((s, t) => s + (t.htUsed ?? 0), 0)
    const profit = transactions.reduce((s, t) => s + (t.profit ?? 0), 0)
    return { totalAT, totalHTUsed, profit }
  }, [transactions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>AT / HT balances and profit overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Total AT Tokens</div>
            <div className="font-semibold">{totals.totalAT}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">HT Used</div>
            <div className="font-semibold">{totals.totalHTUsed}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Unrealized / Realized Profit</div>
            <div className="font-semibold text-green-600">PKR {totals.profit.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
