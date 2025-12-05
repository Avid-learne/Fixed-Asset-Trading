// Short overview: Dashboard overview component for patient home page.
// - Displays balance cards, quick stats, recent transactions, notifications, KYC status, and quick action buttons.
// - Relation: used exclusively by `app/patient/dashboard/page.tsx`
import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Bell, AlertCircle, CheckCircle, Clock } from 'lucide-react'

type DashboardData = {
  atBalance: number
  htBalance: number
  pendingDeposits: number
  totalProfit: number
  recentTransactions: {
    id: string
    date: string
    type: string
    amount: number
    token: 'AT' | 'HT'
    status: 'success' | 'pending'
  }[]
  notifications: {
    id: string
    message: string
    type: 'info' | 'warning' | 'success'
    time: string
  }[]
  kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected'
}

const MOCK_DASHBOARD_DATA: DashboardData = {
  atBalance: 1050,
  htBalance: 850,
  pendingDeposits: 2,
  totalProfit: 12500,
  recentTransactions: [
    { id: '1', date: '2025-12-05', type: 'Deposit', amount: 500, token: 'AT', status: 'success' },
    { id: '2', date: '2025-12-05', type: 'Redeem', amount: -50, token: 'HT', status: 'success' },
    { id: '3', date: '2025-12-04', type: 'Transfer', amount: 200, token: 'AT', status: 'success' },
    { id: '4', date: '2025-12-04', type: 'Reward', amount: 100, token: 'HT', status: 'pending' },
  ],
  notifications: [
    { id: '1', message: 'Your deposit has been verified', type: 'success', time: '2 hours ago' },
    { id: '2', message: 'New benefit available for redemption', type: 'info', time: '5 hours ago' },
    { id: '3', message: 'KYC verification pending', type: 'warning', time: '1 day ago' },
  ],
  kycStatus: 'pending',
}

type Props = {
  data?: DashboardData
}

export default function DashboardOverview({ data = MOCK_DASHBOARD_DATA }: Props) {
  const getKYCStatusBadge = () => {
    switch (data.kycStatus) {
      case 'verified':
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">Not Submitted</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your tokens and activity</p>
        </div>
        <div className="flex gap-2">
          <Link href="/patient/deposit/start">
            <Button>
              <ArrowDownLeft className="w-4 h-4 mr-1" />
              Deposit Asset
            </Button>
          </Link>
          <Link href="/patient/redeem">
            <Button variant="outline">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Redeem HT
            </Button>
          </Link>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">AT Balance</div>
              <div className="text-2xl font-bold">{data.atBalance.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Asset Tokens</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">HT Balance</div>
              <div className="text-2xl font-bold">{data.htBalance.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Health Tokens</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Pending Deposits</div>
              <div className="text-2xl font-bold">{data.pendingDeposits}</div>
              <div className="text-xs text-muted-foreground">Awaiting verification</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Profit</div>
              <div className="text-2xl font-bold text-green-600">PKR {data.totalProfit.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">From investments</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC Status Banner */}
      {data.kycStatus !== 'verified' && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-warning" />
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    KYC Verification Status: {getKYCStatusBadge()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {data.kycStatus === 'pending'
                      ? 'Your KYC is under review. You will be notified once verified.'
                      : data.kycStatus === 'rejected'
                      ? 'Your KYC was rejected. Please resubmit with correct information.'
                      : 'Complete your KYC verification to access all features.'}
                  </div>
                </div>
              </div>
              {data.kycStatus === 'not_submitted' && (
                <Link href="/patient/kyc">
                  <Button>Submit KYC</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest token activity</CardDescription>
              </div>
              <Link href="/patient/activity">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={tx.token === 'AT' ? 'border-primary text-primary' : 'border-secondary text-secondary'}>
                        {tx.token}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.status === 'success' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Recent updates</CardDescription>
              </div>
              <Link href="/patient/notifications">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.notifications.map((notif) => (
                <div key={notif.id} className="p-3 border rounded-md">
                  <div className="flex items-start gap-2">
                    {notif.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
                    {notif.type === 'warning' && <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />}
                    {notif.type === 'info' && <Bell className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{notif.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">{notif.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/patient/wallet/at">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="font-semibold">AT Wallet</div>
                <div className="text-xs text-muted-foreground">Manage Asset Tokens</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/wallet/ht">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="font-semibold">HT Wallet</div>
                <div className="text-xs text-muted-foreground">Manage Health Tokens</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/benefits">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="font-semibold">Benefits</div>
                <div className="text-xs text-muted-foreground">View available benefits</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/activity">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="font-semibold">Activity</div>
                <div className="text-xs text-muted-foreground">View full history</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
