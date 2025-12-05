// Short overview: Activity page composition for the patient role.
// - Composes `ActivitySummary`, `NotificationsList`, `StatementsList`, and `TransactionTable`.
// - Sources mock data from `components/patient/activityData.ts` and uses domain types in `types/activity.ts`.
"use client"

import React, { useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import TransactionTable from "@/components/patient/TransactionTable"
import NotificationsList from "@/components/patient/NotificationsList"
import StatementsList from "@/components/patient/StatementsList"
import ActivitySummary from "@/components/patient/ActivitySummary"
import { getTransactions, getNotifications, getStatements } from "@/components/patient/activityData"
import type { Tx } from "@/types/activity"

export default function ActivityPage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all")

  const allTx = useMemo(() => getTransactions(), []) as Tx[]
  const notifications = useMemo(() => getNotifications(), [])
  const statements = useMemo(() => getStatements(), [])

  const transactions = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allTx.filter((t) => {
      if (filter !== "all" && t.type !== filter) return false
      if (!q) return true
      return (
        t.description.toLowerCase().includes(q) ||
        t.date.includes(q) ||
        (t.txHash || "").toLowerCase().includes(q)
      )
    })
  }, [query, filter, allTx])

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <h1 className="text-2xl font-bold">Activity & Transactions</h1>
        <p className="text-muted-foreground">All recent transactions, notifications and downloadable statements.</p>
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-6">
        <ActivitySummary transactions={allTx} />
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Latest account notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsList notifications={notifications} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Statements</CardTitle>
              <CardDescription>Download monthly statements (PDF)</CardDescription>
            </CardHeader>
            <CardContent>
              <StatementsList statements={statements} />
            </CardContent>
          </Card>
        </div>
      </aside>

      <main className="col-span-12 lg:col-span-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>All incoming and outgoing transactions</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Search by description, date, hash" value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
                <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
                <Button variant={filter === "credit" ? "default" : "outline"} size="sm" onClick={() => setFilter("credit")}>Credit</Button>
                <Button variant={filter === "debit" ? "default" : "outline"} size="sm" onClick={() => setFilter("debit")}>Debit</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={transactions} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
