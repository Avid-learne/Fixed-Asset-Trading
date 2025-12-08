// Short overview: Activity page composition for the patient role.
// - Composes `ActivitySummary`, `NotificationsList`, `StatementsList`, and `TransactionTable`.
// - Sources mock data from `components/patient/activityData.ts` and uses domain types in `types/activity.ts`.
"use client"

import React, { useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TransactionTable from "@/components/patient/TransactionTable"
import NotificationsList from "@/components/patient/NotificationsList"
import StatementsList from "@/components/patient/StatementsList"
import ActivitySummary from "@/components/patient/ActivitySummary"
import { getTransactions, getNotifications, getStatements } from "@/components/patient/activityData"
import type { Tx } from "@/types/activity"
import { Bell, FileText, Activity as ActivityIcon, Search, Filter } from "lucide-react"

export default function ActivityPage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "AT" | "HT">("all")
  const [activeTab, setActiveTab] = useState("transactions")

  const allTx = useMemo(() => getTransactions(), []) as Tx[]
  const notifications = useMemo(() => getNotifications(), [])
  const statements = useMemo(() => getStatements(), [])

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ActivityIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Activity & Transactions</h1>
          <p className="text-sm text-muted-foreground">Monitor your transactions, notifications and statements</p>
        </div>
      </div>

      {/* Activity Summary - Full Width */}
      <ActivitySummary transactions={allTx} />

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <ActivityIcon className="w-4 h-4" />
            Transactions
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

        {/* Transactions Tab */}
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

        {/* Notifications Tab */}
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
              <StatementsList statements={statements} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
