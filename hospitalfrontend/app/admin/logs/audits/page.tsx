'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FileDown, Search, Calendar } from 'lucide-react'
import { DataTable, StatusBadge, AuditTimeline } from '../../components'

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

const mockAuditLogs: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2024-12-04 14:30:22',
    user: 'admin@superadmin.com',
    userRole: 'Super Admin',
    action: 'Created Hospital',
    category: 'Hospital Management',
    resource: 'HOS-004',
    status: 'success',
    ipAddress: '192.168.1.100',
    details: 'Created new hospital: Sunrise Medical Institute'
  },
  {
    id: 'AUD-002',
    timestamp: '2024-12-04 13:15:45',
    user: 'admin@metrogeneral.com',
    userRole: 'Hospital Admin',
    action: 'Minted Tokens',
    category: 'Token Operations',
    resource: 'MINT-1234',
    status: 'success',
    ipAddress: '192.168.1.101',
    details: 'Minted 50,000 AT tokens for Q4 operations'
  },
  {
    id: 'AUD-003',
    timestamp: '2024-12-04 12:45:18',
    user: 'admin@superadmin.com',
    userRole: 'Super Admin',
    action: 'Suspended Hospital',
    category: 'Hospital Management',
    resource: 'HOS-003',
    status: 'warning',
    ipAddress: '192.168.1.100',
    details: 'Suspended hospital: Regional Health Network due to compliance issues'
  },
  {
    id: 'AUD-004',
    timestamp: '2024-12-04 11:20:33',
    user: 'officer@ctbank.com',
    userRole: 'Bank Officer',
    action: 'Verified Document',
    category: 'Verification',
    resource: 'DOC-5678',
    status: 'success',
    ipAddress: '192.168.1.102',
    details: 'Approved asset verification for HOS-001'
  },
  {
    id: 'AUD-005',
    timestamp: '2024-12-04 10:05:12',
    user: 'admin@superadmin.com',
    userRole: 'Super Admin',
    action: 'Updated System Config',
    category: 'System Configuration',
    resource: 'CONFIG-001',
    status: 'error',
    ipAddress: '192.168.1.100',
    details: 'Failed to update gas limit configuration - invalid value'
  },
  {
    id: 'AUD-006',
    timestamp: '2024-12-04 09:30:55',
    user: 'admin@citymedical.com',
    userRole: 'Hospital Admin',
    action: 'Added Patient',
    category: 'Patient Management',
    resource: 'PAT-7890',
    status: 'success',
    ipAddress: '192.168.1.103',
    details: 'Registered new patient: John Smith'
  }
]

export default function AuditLogsPage() {
  const [logs] = useState<AuditLog[]>(mockAuditLogs)
  const [dateRange, setDateRange] = useState('today')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const handleExport = () => {
    const csv = [
      ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Category', 'Resource', 'Status', 'IP Address', 'Details'],
      ...logs.map(log => [
        log.id, log.timestamp, log.user, log.userRole, log.action, 
        log.category, log.resource, log.status, log.ipAddress, log.details
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString()}.csv`
    a.click()
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
      )
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
      )
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'resource',
      label: 'Resource',
      render: (value: string) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{value}</code>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <StatusBadge status={value as any} size="sm" />
      )
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (value: string) => (
        <span className="text-xs text-gray-600">{value}</span>
      )
    }
  ]

  const timelineEvents = logs.slice(0, 10).map(log => ({
    id: log.id,
    type: log.status,
    title: log.action,
    description: log.details,
    timestamp: log.timestamp,
    user: log.user,
    metadata: {
      category: log.category,
      resource: log.resource,
      ipAddress: log.ipAddress
    }
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Complete audit trail of all system activities</p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <FileDown className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
                  <div className="text-lg font-bold text-green-700">
                    {logs.filter(l => l.status === 'success').length}
                  </div>
                </div>
                <div className="flex-1 p-2 bg-red-50 border border-red-200 rounded">
                  <div className="text-xs text-red-600">Errors</div>
                  <div className="text-lg font-bold text-red-700">
                    {logs.filter(l => l.status === 'error').length}
                  </div>
                </div>
                <div className="flex-1 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-xs text-yellow-600">Warnings</div>
                  <div className="text-lg font-bold text-yellow-700">
                    {logs.filter(l => l.status === 'warning').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline View */}
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
            data={logs}
            columns={columns}
            searchPlaceholder="Search logs..."
            pageSize={10}
            emptyMessage="No audit logs found"
          />
        </CardContent>
      </Card>
    </div>
  )
}
