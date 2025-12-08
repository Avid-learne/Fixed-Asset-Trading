// Short overview: Summary card showing totals for AT, HT and profit.
// - Computes (basic) totals from the provided transactions.
// - Relation: Appears in the Activity sidebar as the account summary.
import React, { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tx } from '@/types/activity'

type Props = { transactions: Tx[] }

export default function ActivitySummary({ transactions }: Props) {
  const totals = useMemo(() => {
    const totalAT = transactions
      .filter(t => t.token_type === 'AT')
      .reduce((s, t) => s + t.amount, 0)
    const totalHT = transactions
      .filter(t => t.token_type === 'HT')
      .reduce((s, t) => s + t.amount, 0)
    const totalTransactions = transactions.length
    return { totalAT, totalHT, totalTransactions }
  }, [transactions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>AT / HT transaction overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-md">
            <div className="text-sm text-muted-foreground">Total AT Transactions</div>
            <div className={`text-2xl font-bold mt-1 ${totals.totalAT >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.totalAT >= 0 ? '+' : ''}{totals.totalAT} AT
            </div>
          </div>
          <div className="p-4 border rounded-md">
            <div className="text-sm text-muted-foreground">Total HT Transactions</div>
            <div className={`text-2xl font-bold mt-1 ${totals.totalHT >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.totalHT >= 0 ? '+' : ''}{totals.totalHT} HT
            </div>
          </div>
          <div className="p-4 border rounded-md">
            <div className="text-sm text-muted-foreground">Total Transactions</div>
            <div className="text-2xl font-bold mt-1">{totals.totalTransactions}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
