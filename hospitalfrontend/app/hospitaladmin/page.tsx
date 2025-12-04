'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Coins, Users, TrendingUp, AlertCircle, Building, Wallet, ArrowUpRight, Activity, DollarSign, CheckCircle, Clock, ArrowDownRight } from 'lucide-react'

const mintingData = [
  { month: 'Jan', minted: 4000 },
  { month: 'Feb', minted: 3000 },
  { month: 'Mar', minted: 2000 },
  { month: 'Apr', minted: 2780 },
  { month: 'May', minted: 1890 },
  { month: 'Jun', minted: 2390 },
]

const allocationData = [
  { month: 'Jan', allocated: 2400 },
  { month: 'Feb', allocated: 1398 },
  { month: 'Mar', allocated: 9800 },
  { month: 'Apr', allocated: 3908 },
  { month: 'May', allocated: 4800 },
  { month: 'Jun', allocated: 3800 },
]

const assetTypeDistribution = [
  { name: 'Real Estate', value: 45, color: '#3b82f6' },
  { name: 'Medical Equipment', value: 30, color: '#10b981' },
  { name: 'Vehicles', value: 15, color: '#f59e0b' },
  { name: 'Other Assets', value: 10, color: '#6366f1' },
]

const recentActivity = [
  { action: 'Token Minting', description: 'Minted 5,000 AT for Real Estate Pool', time: '5 mins ago', status: 'success' },
  { action: 'Deposit Approved', description: 'Approved DEP-1024 - Medical Equipment', time: '12 mins ago', status: 'success' },
  { action: 'Profit Distribution', description: 'Allocated $50K in HT to patients', time: '1 hour ago', status: 'success' },
  { action: 'Bank Verification', description: 'DEP-1025 pending bank approval', time: '2 hours ago', status: 'pending' },
]

export default function HospitalAdminHome() {
  const [timeRange, setTimeRange] = useState('month')
  
  const stats = [
    { label: 'Total AT Minted', value: '12.5M', icon: Coins, change: '+12%', trend: 'up', subtext: 'this month' },
    { label: 'Total HT Allocated', value: '8.2M', icon: Users, change: '+5%', trend: 'up', subtext: 'this month' },
    { label: 'Pending Deposits', value: '14', icon: Clock, change: '3 urgent', trend: 'neutral', subtext: 'requires action' },
    { label: 'Hospital Revenue', value: '$450K', icon: DollarSign, change: '+8%', trend: 'up', subtext: 'this month' },
    { label: 'Active Patients', value: '1,247', icon: Activity, change: '+23', trend: 'up', subtext: 'this week' },
    { label: 'Trading Volume', value: '$2.3M', icon: TrendingUp, change: '+15%', trend: 'up', subtext: 'last 30 days' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hospital Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of minting, allocation, and hospital performance.</p>
        </div>
        <div className="flex gap-2">
             <Link href="/hospitaladmin/minting"><Button>Mint Tokens</Button></Link>
             <Link href="/hospitaladmin/trading"><Button variant="outline">Simulate Trade</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.trend === 'up'
          const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
                  <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-muted'}`}>
                    <Icon className={`w-5 h-5 ${isPositive ? 'text-green-600' : 'text-primary'}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-2">
                    {stat.trend !== 'neutral' && (
                      <Badge variant={isPositive ? 'default' : 'secondary'} className="text-xs">
                        <TrendIcon className="w-3 h-3 mr-1" />
                        {stat.change}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{stat.subtext}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AT Minting History</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setTimeRange('week')}>Week</Button>
                <Button variant="outline" size="sm" onClick={() => setTimeRange('month')}>Month</Button>
                <Button variant="outline" size="sm" onClick={() => setTimeRange('year')}>Year</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mintingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minted" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>HT Allocation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={allocationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="allocated" stroke="var(--color-secondary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Asset Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={assetTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {assetTypeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className={`mt-1 p-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {activity.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{activity.action}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4">View All Activity</Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[1,2,3].map((i) => (
                        <div key={i} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-sm">Bank Verification Delayed</p>
                                <p className="text-xs text-muted-foreground">Deposit #DEP-{1000+i} is pending bank approval for over 48 hours.</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Link href="/hospitaladmin/deposits" className="block"><Button variant="ghost" className="w-full justify-start">Review Pending Deposits</Button></Link>
                <Link href="/hospitaladmin/allocation" className="block"><Button variant="ghost" className="w-full justify-start">Allocate Profits</Button></Link>
                <Link href="/hospitaladmin/staff" className="block"><Button variant="ghost" className="w-full justify-start">Manage Staff</Button></Link>
                <Link href="/hospitaladmin/reports" className="block"><Button variant="ghost" className="w-full justify-start">Generate Monthly Report</Button></Link>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
