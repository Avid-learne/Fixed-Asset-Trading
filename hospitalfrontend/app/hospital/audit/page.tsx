'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Shield,
  LogIn,
  LogOut,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Activity,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { authService } from '@/lib/authService'

interface AuditTrailLogDto {
  id: string
  activityName: string
  description: string
  type: string
  status: string
  ipAddress: string
  timestamp: string
  userId: string
  user: string
  userRole: string
  source: 'patient' | 'hospital'
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function fetchLogs(path: 'patient-logs' | 'hospital-logs', limit: number): Promise<AuditTrailLogDto[]> {
  const res = await fetch(`${API_BASE}/activity/audit/${path}?limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || `Failed to load ${path}`)
  }
  const data: AuditTrailLogDto[] = json.data || []
  const source = path === 'patient-logs' ? 'patient' : 'hospital'
  return data.map((d) => ({ ...d, source }))
}

export default function HospitalAuditTrail() {
  const [logs, setLogs] = useState<AuditTrailLogDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  const loadLogs = async () => {
    try {
      setLoading(true)
      setError('')
      const [patientLogs, hospitalLogs] = await Promise.all([
        fetchLogs('patient-logs', 200).catch(() => []),
        fetchLogs('hospital-logs', 200).catch(() => []),
      ])
      const merged = [...patientLogs, ...hospitalLogs]
        .filter((l) => (l.userRole || '').toLowerCase() !== 'hospital_admin')
        .sort((a, b) => {
          const ta = new Date(a.timestamp).getTime() || 0
          const tb = new Date(b.timestamp).getTime() || 0
          return tb - ta
        })
      setLogs(merged)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return logs.filter((log) => {
      const matchesSearch =
        !q ||
        log.user?.toLowerCase().includes(q) ||
        log.userId?.toLowerCase().includes(q) ||
        log.ipAddress?.includes(searchQuery) ||
        log.description?.toLowerCase().includes(q) ||
        log.activityName?.toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'all' || (log.status || '').toLowerCase() === statusFilter
      const matchesSource = sourceFilter === 'all' || log.source === sourceFilter

      let matchesDate = true
      if (dateFilter !== 'all') {
        const t = new Date(log.timestamp).getTime()
        if (Number.isNaN(t)) {
          matchesDate = false
        } else {
          const now = Date.now()
          if (dateFilter === 'today') {
            matchesDate = new Date(t).toDateString() === new Date(now).toDateString()
          } else if (dateFilter === 'week') {
            matchesDate = t >= now - 7 * 24 * 60 * 60 * 1000
          } else if (dateFilter === 'month') {
            matchesDate = t >= now - 30 * 24 * 60 * 60 * 1000
          }
        }
      }

      return matchesSearch && matchesStatus && matchesSource && matchesDate
    })
  }, [logs, searchQuery, statusFilter, sourceFilter, dateFilter])

  const totalLogs = logs.length
  const successCount = logs.filter((l) => isStatus(l.status, 'success')).length
  const failedCount = logs.filter((l) => isStatus(l.status, 'failure') || isStatus(l.status, 'error') || isStatus(l.status, 'failed')).length
  const uniqueUsers = new Set(logs.map((l) => l.userId).filter(Boolean)).size
  const criticalEvents = logs.filter((l) => isStatus(l.status, 'failure') || isStatus(l.status, 'warning') || isStatus(l.status, 'error')).length

  const loginActivity = filteredLogs.filter((l) => isLoginAction(l.activityName))
  const systemActions = filteredLogs.filter((l) => !isLoginAction(l.activityName))

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading audit trail...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Trail</h1>
          <p className="text-slate-600 mt-1">Live activity log from backend. Combined patient + hospital logs.</p>
        </div>
        <Button variant="outline" onClick={loadLogs}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Logs" value={totalLogs} sub="All activities" Icon={Activity} tint="blue" />
        <StatCard label="Successful Events" value={successCount} sub="Valid operations" Icon={CheckCircle} tint="green" />
        <StatCard label="Failed / Errors" value={failedCount} sub="Security alerts" Icon={AlertTriangle} tint="red" />
        <StatCard label="Active Users" value={uniqueUsers} sub={`${criticalEvents} critical events`} Icon={UserCheck} tint="purple" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by user, IP, activity, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm"
            >
              <option value="all">All Sources</option>
              <option value="patient">Patient</option>
              <option value="hospital">Hospital Staff</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({filteredLogs.length})</TabsTrigger>
          <TabsTrigger value="login">Login ({loginActivity.length})</TabsTrigger>
          <TabsTrigger value="system">System ({systemActions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <LogTable rows={filteredLogs} title="Activity Log" description="Chronological list of all activities" />
        </TabsContent>
        <TabsContent value="login" className="mt-6">
          <LogTable rows={loginActivity} title="Login Activity" description="Login and logout events" />
        </TabsContent>
        <TabsContent value="system" className="mt-6">
          <LogTable rows={systemActions} title="System Actions" description="Non-auth activities and administrative actions" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function isStatus(status: string | undefined, target: string): boolean {
  return (status || '').toLowerCase() === target.toLowerCase()
}

function isLoginAction(activityName: string | undefined): boolean {
  const a = (activityName || '').toLowerCase()
  return a.includes('login') || a.includes('logout') || a.includes('sign in') || a.includes('sign out')
}

function getStatusColor(status: string): string {
  const s = (status || '').toLowerCase()
  if (s === 'success') return 'bg-green-100 text-green-800'
  if (s === 'failure' || s === 'failed' || s === 'error') return 'bg-red-100 text-red-800'
  if (s === 'warning') return 'bg-yellow-100 text-yellow-800'
  if (s === 'pending') return 'bg-blue-100 text-blue-800'
  return 'bg-gray-100 text-gray-800'
}

function getActionIcon(activityName: string | undefined) {
  const a = (activityName || '').toLowerCase()
  if (a.includes('login')) return <LogIn className="h-4 w-4" />
  if (a.includes('logout')) return <LogOut className="h-4 w-4" />
  if (a.includes('failed') || a.includes('reject')) return <XCircle className="h-4 w-4" />
  if (a.includes('verif') || a.includes('approv')) return <UserCheck className="h-4 w-4" />
  if (a.includes('mint') || a.includes('token') || a.includes('redeem')) return <Activity className="h-4 w-4" />
  if (a.includes('settings') || a.includes('config')) return <Shield className="h-4 w-4" />
  return <Activity className="h-4 w-4" />
}

function StatCard({
  label, value, sub, Icon, tint,
}: {
  label: string
  value: number
  sub: string
  Icon: React.ComponentType<{ className?: string }>
  tint: 'blue' | 'green' | 'red' | 'purple' | 'yellow'
}) {
  const tintMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  }
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{sub}</p>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${tintMap[tint]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LogTable({
  rows, title, description, highlight,
}: {
  rows: AuditTrailLogDto[]
  title: string
  description: string
  highlight?: 'red'
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Timestamp</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Activity</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Source</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">IP Address</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((log) => (
                  <tr key={log.id} className={`border-b transition-colors ${highlight === 'red' ? 'hover:bg-red-50' : 'hover:bg-slate-50'}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{formatTs(log.timestamp)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.activityName)}
                        <span className="text-sm font-medium text-slate-900">{log.activityName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{log.user || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{log.userRole || '—'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{log.source}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(log.status)}>{log.status || 'unknown'}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Globe className="h-3 w-3 text-slate-400" />
                        <span>{log.ipAddress || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-700 max-w-md truncate" title={log.description}>
                        {log.description || '—'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatTs(ts: string): string {
  if (!ts) return 'N/A'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString()
}
