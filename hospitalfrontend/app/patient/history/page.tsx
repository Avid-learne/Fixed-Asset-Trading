// src/app/patient/history/page.tsx
'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, ShieldCheck, Globe2, Smartphone, Laptop, AlertTriangle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

type LoginStatus = 'success' | 'failed' | 'challenge'

type LoginLog = {
  id: string
  timestamp: string
  ipAddress: string
  location: string
  device: string
  browser: string
  status: LoginStatus
  factorUsed: 'password' | 'password+otp' | 'password+hardware'
}

const loginLogs: LoginLog[] = [
  {
    id: 'log-1',
    timestamp: '2025-12-08T09:32:00Z',
    ipAddress: '203.99.180.12',
    location: 'Islamabad, PK',
    device: 'MacBook Pro 16"',
    browser: 'Chrome 123.0',
    status: 'success',
    factorUsed: 'password+otp',
  },
  {
    id: 'log-2',
    timestamp: '2025-12-07T22:18:00Z',
    ipAddress: '110.38.74.6',
    location: 'Lahore, PK',
    device: 'iPhone 15 Pro',
    browser: 'Safari 18.0',
    status: 'success',
    factorUsed: 'password+otp',
  },
  {
    id: 'log-3',
    timestamp: '2025-12-07T05:02:00Z',
    ipAddress: '154.62.210.44',
    location: 'Dubai, AE',
    device: 'Surface Laptop',
    browser: 'Edge 121.0',
    status: 'challenge',
    factorUsed: 'password',
  },
  {
    id: 'log-4',
    timestamp: '2025-12-06T18:41:00Z',
    ipAddress: '110.38.74.6',
    location: 'Lahore, PK',
    device: 'iPhone 15 Pro',
    browser: 'Safari 18.0',
    status: 'failed',
    factorUsed: 'password',
  },
  {
    id: 'log-5',
    timestamp: '2025-12-05T11:15:00Z',
    ipAddress: '39.51.220.91',
    location: 'Karachi, PK',
    device: 'ThinkPad X1',
    browser: 'Firefox 122.0',
    status: 'success',
    factorUsed: 'password+otp',
  },
]

const statusStyles: Record<LoginStatus, { label: string; className: string }> = {
  success: { label: 'Successful', className: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-700 border border-red-100' },
  challenge: { label: 'Challenge Issued', className: 'bg-amber-50 text-amber-700 border border-amber-100' },
}

const deviceIcon = (device: string) => {
  return /iphone|android|mobile/i.test(device) ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />
}

const orderedLogs = [...loginLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | LoginStatus>('all')

  const filteredLogs = useMemo(() => {
    return orderedLogs.filter(log => {
      const matchesSearch = [log.location, log.device, log.browser, log.ipAddress]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || log.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter])

  const lastSuccessfulLogin = orderedLogs.find(log => log.status === 'success')
  const unusualAttempts = orderedLogs.filter(log => log.status !== 'success').length
  const uniqueLocations = new Set(orderedLogs.map(log => log.location)).size

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Access Logs</h1>
        <p className="text-muted-foreground">
          Review recent sign-ins, device usage, and any unusual login attempts on your account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Last successful login</CardTitle>
            <CardDescription>Most recent verified access</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="font-medium text-foreground">
                {lastSuccessfulLogin
                  ? formatRelativeTime(new Date(lastSuccessfulLogin.timestamp))
                  : 'No logins yet'}
              </p>
              {lastSuccessfulLogin && (
                <p className="text-muted-foreground">
                  {lastSuccessfulLogin.location} • {lastSuccessfulLogin.device}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Unusual activity</CardTitle>
            <CardDescription>Challenges or failed attempts</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm">
            <AlertTriangle className={`w-5 h-5 ${unusualAttempts ? 'text-amber-500' : 'text-muted-foreground'}`} />
            <div>
              <p className="font-medium text-foreground">{unusualAttempts} events</p>
              <p className="text-muted-foreground">Monitor unexpected access attempts</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active locations</CardTitle>
            <CardDescription>Cities detected in recent logins</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm">
            <Globe2 className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">{uniqueLocations} cities</p>
              <p className="text-muted-foreground">Keep an eye on where you sign in</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Sign-in history</CardTitle>
              <CardDescription>Click any row for quick details.</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search device, location, or IP"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  className="pl-9 sm:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={event => setStatusFilter(event.target.value as 'all' | LoginStatus)}
                className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="success">Successful</option>
                <option value="challenge">Challenge issued</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Security</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No sign-in records match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map(log => {
                  const status = statusStyles[log.status]
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        <div className="font-medium text-foreground">{formatRelativeTime(new Date(log.timestamp))}</div>
                        <div>{new Date(log.timestamp).toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2 text-foreground">
                          {deviceIcon(log.device)}
                          <span>{log.device}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.browser}</TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium text-foreground">{log.location}</div>
                        <div className="text-muted-foreground">{log.ipAddress}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.ipAddress}</TableCell>
                      <TableCell className="text-sm">
                        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                          {status.label}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Auth: {log.factorUsed}</p>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tips to stay secure</CardTitle>
          <CardDescription>Respond quickly if you see activity you do not recognise.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <div>
            • If you notice a new device or location, review your trusted devices in security settings.
          </div>
          <div>• Keep two-factor authentication enabled to prevent unauthorised access.</div>
          <div>• Failed attempts from unfamiliar locations may indicate someone trying to access your account.</div>
          <div>• Update your password regularly and avoid reusing it across services.</div>
        </CardContent>
      </Card>
    </div>
  )
}