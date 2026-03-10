"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TransactionTable from "@/components/patient/TransactionTable"
import NotificationsList from "@/components/patient/NotificationsList"
import StatementsList from "@/components/patient/StatementsList"
import ActivitySummary from "@/components/patient/ActivitySummary"
import { useAuth } from "@/contexts/AuthContext"
import { activityService } from "@/services/activityService"
import type { ActivityLogItem, NotificationItem, StatementItem, Tx } from "@/types/activity"
import { AlertCircle, Bell, FileText, History, Activity as ActivityIcon, Search, Filter, Loader2 } from "lucide-react"

const buildStatements = (transactions: Tx[]): StatementItem[] => {
  const byMonth = new Map<string, StatementItem>()

  transactions.forEach((tx) => {
    const d = new Date(tx.created_at)
    if (Number.isNaN(d.getTime())) return

    const month = d.toLocaleString("en-US", { month: "long" })
    const year = d.getFullYear()
    const key = `${year}-${d.getMonth()}`
    const current = byMonth.get(key) || {
      id: key,
      month,
      year,
      transactions: 0,
      totalAT: 0,
      totalHT: 0,
      generatedDate: new Date(year, d.getMonth() + 1, 0).toISOString(),
    }

    current.transactions += 1
    if (tx.token_type === "AT") current.totalAT += tx.amount
    if (tx.token_type === "HT") current.totalHT += tx.amount

    byMonth.set(key, current)
  })

  return Array.from(byMonth.values()).sort((a, b) => {
    const aDate = new Date(a.generatedDate).getTime()
    const bDate = new Date(b.generatedDate).getTime()
    return bDate - aDate
  })
}

export default function ActivityPage() {
  const { user } = useAuth()
  const userId = user?.id || (user as any)?.userId
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "AT" | "HT">("all")
  const [activeTab, setActiveTab] = useState("transactions")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [allTx, setAllTx] = useState<Tx[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([])

  useEffect(() => {
    const fetchActivity = async () => {
      if (!userId) {
        setLoading(false)
        setError("User not authenticated")
        return
      }

      try {
        setLoading(true)
        setError(null)
        const [tx, notifs, logs] = await Promise.all([
          activityService.getTransactions(userId),
          activityService.getNotifications(userId),
          activityService.getActivityLogs(userId),
        ])
        setAllTx(tx)
        setNotifications(notifs)
        setActivityLogs(logs)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load activity data")
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [userId])

  const statements = useMemo(() => buildStatements(allTx), [allTx])

  const transactions = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allTx.filter((t) => {
      if (filter !== "all" && t.token_type !== filter) return false
      if (!q) return true
      return (
        (t.transaction_hash || "").toLowerCase().includes(q) ||
        (t.from_address || "").toLowerCase().includes(q) ||
        (t.to_address || "").toLowerCase().includes(q) ||
        (t.source || "").toLowerCase().includes(q) ||
        (t.type || "").toLowerCase().includes(q) ||
        t.created_at.includes(q)
      )
    })
  }, [query, filter, allTx])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ActivityIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Activity & Transactions</h1>
          <p className="text-sm text-muted-foreground">Monitor your transactions, notifications and statements</p>
        </div>
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

      <ActivitySummary transactions={allTx} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-4">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <ActivityIcon className="w-4 h-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="statements" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Statements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View and filter all your transactions</CardDescription>
                </div>
                
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by hash, address, source, or date..." 
                      value={query} 
                      onChange={(e) => setQuery(e.target.value)} 
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={filter === "all" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setFilter("all")}
                      className="flex items-center gap-1"
                    >
                      <Filter className="w-3 h-3" />
                      All
                    </Button>
                    <Button 
                      variant={filter === "AT" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setFilter("AT")}
                      className="text-blue-600"
                    >
                      AT
                    </Button>
                    <Button 
                      variant={filter === "HT" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setFilter("HT")}
                      className="text-purple-600"
                    >
                      HT
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={transactions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Events captured from the `activity` table.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLogs.length === 0 && (
                  <p className="text-sm text-muted-foreground">No activity logs found.</p>
                )}
                {activityLogs.map((log) => (
                  <div key={log.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{log.activityName}</p>
                      <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{log.description || "No description"}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="rounded bg-muted px-2 py-0.5">{log.type}</span>
                      {log.status && <span className="rounded bg-muted px-2 py-0.5">{log.status}</span>}
                      {log.ipAddress && <span className="font-mono text-muted-foreground">IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>Stay updated with your account activity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <NotificationsList notifications={notifications} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statements Tab */}
        <TabsContent value="statements">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Account Statements</CardTitle>
                  <CardDescription>Download your monthly statements in PDF format</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StatementsList statements={statements} transactions={allTx} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
