// hospitalfrontend/app/admin/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Building2, Users, Banknote, Coins, TrendingUp, AlertCircle } from 'lucide-react'

const systemData: any[] = []

const tradingVolumeData: any[] = []

export default function AdminHome() {
  const stats = [
    { label: 'Hospitals', value: '0', icon: Building2, change: '0 this month' },
    { label: 'Total Patients', value: '0', icon: Users, change: '0 this month' },
    { label: 'Tokens Minted', value: '0', icon: Coins, change: '0 this month' },
    { label: 'Trading Volume', value: '$0', icon: TrendingUp, change: '0 this month' },
    { label: 'Banks', value: '0', icon: Banknote, change: 'All active' },
    { label: 'System Health', value: '100%', icon: AlertCircle, change: 'Operational' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Overview Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor all system activity, hospitals, patients, and financial metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
                  {stat.label}
                  <Icon className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={systemData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="hospitals" fill="var(--color-primary)" name="Hospitals" />
                <Bar yAxisId="right" dataKey="patients" fill="var(--color-secondary)" name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trading Volume Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tradingVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  name="Trading Volume ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <p className="font-medium text-foreground">New Hospital Registered</p>
                <p className="text-sm text-muted-foreground">Grand Medical Center - Pending Approval</p>
              </div>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <p className="font-medium text-foreground">System Update Completed</p>
                <p className="text-sm text-muted-foreground">Blockchain integration v2.1 deployed</p>
              </div>
              <p className="text-xs text-muted-foreground">5 hours ago</p>
            </div>
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <p className="font-medium text-foreground">Token Minting Activity</p>
                <p className="text-sm text-muted-foreground">5 hospitals minted 500K tokens</p>
              </div>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">New Bank Partnership</p>
                <p className="text-sm text-muted-foreground">International Finance Corp onboarded</p>
              </div>
              <p className="text-xs text-muted-foreground">2 days ago</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link href="/">← Back to Portals</Link>
        </Button>
      </div>
    </div>
  )
}