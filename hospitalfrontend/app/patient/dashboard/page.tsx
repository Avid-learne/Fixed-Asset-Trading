'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Wallet,
  Activity,
  FileText,
  Settings,
  CreditCard,
  ShieldCheck,
  Plus
} from 'lucide-react'

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

export default function PatientDashboardHome() {
  const data = MOCK_DASHBOARD_DATA

  const getKYCStatusBadge = () => {
    switch (data.kycStatus) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">Not Submitted</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's your account overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/patient/deposit">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Deposit Asset
            </Button>
          </Link>
          <Link href="/patient/marketplace">
            <Button variant="outline">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Marketplace
            </Button>
          </Link>
        </div>
      </div>

      {/* KYC Status Banner */}
      {data.kycStatus !== 'verified' && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                <div>
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
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
              {data.kycStatus !== 'verified' && (
                <Link href="/patient/profile/kyc">
                  <Button size="sm">
                    {data.kycStatus === 'rejected' ? 'Resubmit KYC' : 'Complete KYC'}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Asset Tokens</div>
                <div className="text-3xl font-bold text-primary">{data.atBalance.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">AT Balance</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Health Tokens</div>
                <div className="text-3xl font-bold text-accent">{data.htBalance.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">HT Balance</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-3xl font-bold text-warning">{data.pendingDeposits}</div>
                <div className="text-xs text-muted-foreground">Awaiting verification</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Total Profit</div>
                <div className="text-3xl font-bold text-success">PKR {data.totalProfit.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">From investments</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <div className="space-y-3">
              {data.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {tx.amount > 0 ? (
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{tx.type}</div>
                      <div className="text-sm text-gray-500">{tx.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.token}
                    </div>
                    <Badge variant={tx.status === 'success' ? 'default' : 'secondary'} className="mt-1">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/patient/activity" className="w-full">
              <Button variant="outline" className="w-full">
                View Full Transaction History
              </Button>
            </Link>
          </CardFooter>
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.notifications.map((notif) => (
                <div key={notif.id} className="p-3 border rounded-lg">
                  <div className="flex items-start gap-2">
                    {notif.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
                    {notif.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />}
                    {notif.type === 'info' && <Bell className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{notif.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{notif.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/patient/notifications" className="w-full">
              <Button variant="outline" className="w-full" size="sm">
                View All Notifications
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/patient/wallet">
          <Card className="hover:shadow-md hover:border-primary transition-all cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">My Wallets</div>
                  <div className="text-xs text-muted-foreground mt-1">Manage AT & HT tokens</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/tokens">
          <Card className="hover:shadow-md hover:border-accent transition-all cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Token Balance</div>
                  <div className="text-xs text-muted-foreground mt-1">Track holdings & history</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/profile/kyc">
          <Card className="hover:shadow-md hover:border-warning transition-all cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">KYC Verification</div>
                  <div className="text-xs text-muted-foreground mt-1">Complete verification</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/profile">
          <Card className="hover:shadow-md hover:border-secondary transition-all cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Profile Settings</div>
                  <div className="text-xs text-muted-foreground mt-1">Manage your account</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
