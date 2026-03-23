'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, Filter, FileText, Shield, AlertCircle, Loader } from 'lucide-react'
import { auditLogService } from '@/services/auditLogService'
import type { AuditLog as AuditLogType } from '@/types/auditLog'

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  details: string
  ipAddress: string
  status: 'success' | 'failed' | 'error' | 'warning'
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [dateRange, setDateRange] = useState('7d')

  // Fetch audit logs on component mount
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setIsLoading(true)
        // Fetch both patient and hospital logs
        const [patientData, hospitalData] = await Promise.all([
          auditLogService.getAllPatientAuditLogs(100),
          auditLogService.getHospitalAuditLogs(100),
        ])

        const allLogs = [...patientData, ...hospitalData]
          .sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime()
            const dateB = new Date(b.timestamp).getTime()
            return dateB - dateA
          })
          .map((log) => ({
            id: log.id,
            timestamp: log.timestamp,
            user: log.user,
            action: log.action,
            resource: log.category,
            details: log.details,
            ipAddress: log.ipAddress,
            status: (log.status === 'failure' ? 'failed' : log.status) as 'success' | 'failed' | 'error' | 'warning',
          }))

        setLogs(allLogs)
      } catch (err) {
        console.error('Error fetching audit logs:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch audit logs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAuditLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === 'all' || log.action.toUpperCase().includes(actionFilter.toUpperCase())
    return matchesSearch && matchesAction
  })

  const handleExport = () => {
    try {
      const csv = [
        ['Timestamp', 'User', 'Action', 'Resource', 'Details', 'IP Address', 'Status'],
        ...filteredLogs.map((log) => [
          log.timestamp,
          log.user,
          log.action,
          log.resource,
          log.details,
          log.ipAddress,
          log.status,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (err) {
      console.error('Error exporting CSV:', err)
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'bg-secondary/20 text-secondary' : 'bg-destructive/20 text-destructive'
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-secondary/20 text-secondary',
      UPDATE: 'bg-primary/20 text-primary',
      DELETE: 'bg-destructive/20 text-destructive',
      READ: 'bg-muted text-muted-foreground',
      LOGIN: 'bg-secondary/20 text-secondary',
    }
    return colors[action] || 'bg-muted text-muted-foreground'
  }

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return timestamp
    }
  }

  const stats = {
    total: logs.length,
    successful: logs.filter((l) => l.status === 'success').length,
    failed: logs.filter((l) => l.status === 'failed' || l.status === 'error').length,
    uniqueUsers: new Set(logs.map((l) => l.user)).size,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Monitor all system activities and security events</p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={isLoading || filteredLogs.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            <FileText className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">In system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Successful Actions</CardTitle>
            <Shield className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.successful}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed successfully</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Actions</CardTitle>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Users</CardTitle>
            <Filter className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Active users</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Activity Log</CardTitle>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                  disabled={isLoading}
                />
              </div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-10 rounded-md border border-border bg-card px-3 py-2 text-sm"
                disabled={isLoading}
              >
                <option value="all">All Actions</option>
                <option value="Deposit">Deposit</option>
                <option value="Trade">Trade</option>
                <option value="Login">Login</option>
                <option value="Approve">Approve</option>
                <option value="Mint">Mint</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
              <span className="text-muted-foreground">Loading audit logs...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">No audit logs found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground">{formatTime(log.timestamp)}</TableCell>
                    <TableCell className="text-sm text-foreground">{log.user}</TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{log.resource}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.ipAddress}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security & Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Audit Trail Retention</p>
                <p>All audit logs are retained for 7 years in compliance with healthcare regulations</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Access Monitoring</p>
                <p>System administrators have read-only access to audit logs</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Real-time Alerts</p>
                <p>Automated alerts for suspicious activities and security events</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
