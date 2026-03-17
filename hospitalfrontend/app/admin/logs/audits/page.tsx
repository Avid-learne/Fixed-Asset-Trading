'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FileDown, Search, Calendar, Loader } from 'lucide-react'
import { DataTable, StatusBadge, AuditTimeline } from '../../components'
import { auditLogService } from '@/services/auditLogService'
import type { AuditLog as AuditLogType } from '@/types/auditLog'

interface AuditLog {
  id: string
  timestamp: string
  user: string
  userRole: string
  action: string
  category: string
  resource: string
  status: 'success' | 'error' | 'warning'
  ipAddress: string
  details: string
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([])
  const [displayLogs, setDisplayLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('today')
  const [categoryFilter, setCategoryFilter] = useState('all')

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
        setAuditLogs([...patientData, ...hospitalData].sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime()
          const dateB = new Date(b.timestamp).getTime()
          return dateB - dateA
        }))
      } catch (err) {
        console.error('Error fetching audit logs:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch audit logs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAuditLogs()
  }, [])

  // Convert AuditLogType to AuditLog format for display
  useEffect(() => {
    const converted = auditLogs.map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      user: log.user || 'Unknown User',
      userRole: log.userRole || 'User',
      action: log.action,
      category: log.category,
      resource: log.id,
      status: (log.status === 'warning' ? 'warning' : log.status === 'failure' || log.status === 'error' ? 'error' : 'success') as 'success' | 'error' | 'warning',
      ipAddress: log.ipAddress,
      details: log.details,
    } as AuditLog))
    setDisplayLogs(converted)
  }, [auditLogs])

  const handleExport = () => {
    try {
      const csv = [
        ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Category', 'Resource', 'Status', 'IP Address', 'Details'],
        ...displayLogs.map((log) => [
          log.id,
          log.timestamp,
          log.user,
          log.userRole,
          log.action,
          log.category,
          log.resource,
          log.status,
          log.ipAddress,
          log.details,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString()}.csv`
      a.click()
    } catch (err) {
      console.error('Error exporting CSV:', err)
    }
  }

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value.split(' ')[0]}</div>
          <div className="text-gray-600">{value.split(' ')[1]}</div>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'User',
      sortable: true,
      render: (value: string, row: AuditLog) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-600">{row.userRole}</div>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (value: string) => <span className="text-sm font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: string) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: 'resource',
      label: 'Resource',
      render: (value: string) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{value}</code>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} size="sm" />,
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (value: string) => <span className="text-xs text-gray-600">{value}</span>,
    },
  ]

  const timelineEvents = displayLogs.slice(0, 10).map((log) => ({
    id: log.id,
    type: log.status,
    title: log.action,
    description: log.details,
    timestamp: log.timestamp,
    user: log.user,
    metadata: {
      category: log.category,
      resource: log.resource,
      ipAddress: log.ipAddress,
    },
  }))

  const stats = {
    success: displayLogs.filter((l) => l.status === 'success').length,
    error: displayLogs.filter((l) => l.status === 'error').length,
    warning: displayLogs.filter((l) => l.status === 'warning').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Complete audit trail of all system activities</p>
        </div>
        <Button onClick={handleExport} className="gap-2" disabled={isLoading || displayLogs.length === 0}>
          <FileDown className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="hospital">Hospital Management</SelectItem>
                  <SelectItem value="token">Token Operations</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="system">System Configuration</SelectItem>
                  <SelectItem value="patient">Patient Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Statistics</label>
              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-green-50 border border-green-200 rounded">
                  <div className="text-xs text-green-600">Success</div>
                  <div className="text-lg font-bold text-green-700">{stats.success}</div>
                </div>
                <div className="flex-1 p-2 bg-red-50 border border-red-200 rounded">
                  <div className="text-xs text-red-600">Errors</div>
                  <div className="text-lg font-bold text-red-700">{stats.error}</div>
                </div>
                <div className="flex-1 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-xs text-yellow-600">Warnings</div>
                  <div className="text-lg font-bold text-yellow-700">{stats.warning}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline View */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Loading audit logs...</span>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <AuditTimeline events={timelineEvents} />
            </CardContent>
          </Card>

          {/* Table View */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={displayLogs}
                columns={columns}
                searchPlaceholder="Search logs..."
                pageSize={10}
                emptyMessage="No audit logs found"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
