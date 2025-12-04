'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, XCircle, AlertCircle, FileDown } from 'lucide-react'
import { DataTable, StatusBadge } from '../../components'

interface ErrorLog {
  id: string
  timestamp: string
  severity: 'critical' | 'error' | 'warning'
  category: string
  message: string
  source: string
  affectedUsers: number
  resolved: boolean
  stackTrace?: string
}

const mockErrors: ErrorLog[] = [
  {
    id: 'ERR-001',
    timestamp: '2024-12-04 14:22:15',
    severity: 'critical',
    category: 'Blockchain',
    message: 'Transaction failed: Insufficient gas',
    source: 'TokenMinting.sol:mintTokens()',
    affectedUsers: 1,
    resolved: false,
    stackTrace: 'Error: Transaction reverted\n  at Contract.call()\n  at processTransaction()'
  },
  {
    id: 'ERR-002',
    timestamp: '2024-12-04 13:45:33',
    severity: 'error',
    category: 'API',
    message: 'Database connection timeout',
    source: 'HospitalService.getHospitals()',
    affectedUsers: 5,
    resolved: true
  },
  {
    id: 'ERR-003',
    timestamp: '2024-12-04 12:10:28',
    severity: 'warning',
    category: 'Authentication',
    message: 'Failed login attempt - invalid credentials',
    source: 'AuthController.login()',
    affectedUsers: 1,
    resolved: true
  },
  {
    id: 'ERR-004',
    timestamp: '2024-12-04 11:30:42',
    severity: 'error',
    category: 'File Upload',
    message: 'File size exceeds maximum limit (10MB)',
    source: 'DocumentUpload.validate()',
    affectedUsers: 1,
    resolved: true
  },
  {
    id: 'ERR-005',
    timestamp: '2024-12-04 10:15:19',
    severity: 'critical',
    category: 'Blockchain',
    message: 'Smart contract execution failed - revert',
    source: 'AssetToken.transfer()',
    affectedUsers: 2,
    resolved: false
  }
]

export default function ErrorLogsPage() {
  const [errors] = useState<ErrorLog[]>(mockErrors)
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = {
    total: errors.length,
    critical: errors.filter(e => e.severity === 'critical').length,
    unresolved: errors.filter(e => !e.resolved).length,
    affectedUsers: errors.reduce((sum, e) => sum + e.affectedUsers, 0)
  }

  const handleExport = () => {
    const csv = [
      ['ID', 'Timestamp', 'Severity', 'Category', 'Message', 'Source', 'Affected Users', 'Resolved'],
      ...errors.map(err => [
        err.id, err.timestamp, err.severity, err.category, err.message,
        err.source, err.affectedUsers, err.resolved ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-logs-${new Date().toISOString()}.csv`
    a.click()
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />
      case 'error': return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default: return null
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'error': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
      )
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getSeverityIcon(value)}
          <Badge className={getSeverityColor(value)}>
            {value.toUpperCase()}
          </Badge>
        </div>
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
      key: 'message',
      label: 'Error Message',
      render: (value: string, row: ErrorLog) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-600 mt-1">{row.source}</div>
        </div>
      )
    },
    {
      key: 'affectedUsers',
      label: 'Affected Users',
      sortable: true,
      render: (value: number) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'resolved',
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <StatusBadge 
          status={value ? 'success' : 'error'} 
          text={value ? 'Resolved' : 'Unresolved'}
          size="sm" 
        />
      )
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: any, row: ErrorLog) => (
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Error Logs</h1>
          <p className="text-gray-600 mt-1">Monitor and troubleshoot system errors</p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <FileDown className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-gray-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unresolved</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unresolved}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Affected Users</p>
                <p className="text-2xl font-bold text-blue-600">{stats.affectedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Severity</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Error Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={errors}
            columns={columns}
            searchPlaceholder="Search errors..."
            pageSize={10}
            emptyMessage="No errors found"
          />
        </CardContent>
      </Card>
    </div>
  )
}
