'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  FileDown, 
  Search, 
  Calendar,
  AlertTriangle, 
  XCircle, 
  AlertCircle,
  ExternalLink, 
  Copy,
  FileText,
  Database,
  Shield
} from 'lucide-react'
import { DataTable, StatusBadge, AuditTimeline } from '../components'

// ============= Audit Log Types & Data =============
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

// ============= Error Log Types & Data =============
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

// ============= Transaction Log Types & Data =============
interface BlockchainTransaction {
  id: string
  txHash: string
  timestamp: string
  type: string
  from: string
  to: string
  amount: string
  tokenType: 'AT' | 'HT'
  status: 'success' | 'pending' | 'failed'
  gasUsed: string
  gasFee: string
  blockNumber: number
  hospital: string
}

const mockTransactions: BlockchainTransaction[] = [
  {
    id: 'TX-001',
    txHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
    timestamp: '2024-12-04 14:30:22',
    type: 'Token Mint',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    amount: '50,000',
    tokenType: 'AT',
    status: 'success',
    gasUsed: '125,432',
    gasFee: '0.0025',
    blockNumber: 51234567,
    hospital: 'Metro General Hospital'
  },
  {
    id: 'TX-002',
    txHash: '0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a',
    timestamp: '2024-12-04 13:15:45',
    type: 'Token Transfer',
    from: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    to: '0x5a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t',
    amount: '1,200',
    tokenType: 'AT',
    status: 'success',
    gasUsed: '85,234',
    gasFee: '0.0017',
    blockNumber: 51234512,
    hospital: 'Metro General Hospital'
  },
  {
    id: 'TX-003',
    txHash: '0x7c8d9e0f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    timestamp: '2024-12-04 12:45:18',
    type: 'Health Token Allocation',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g',
    amount: '5,000',
    tokenType: 'HT',
    status: 'success',
    gasUsed: '95,123',
    gasFee: '0.0019',
    blockNumber: 51234489,
    hospital: 'City Medical Center'
  },
  {
    id: 'TX-004',
    txHash: '0x3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j',
    timestamp: '2024-12-04 11:20:33',
    type: 'Token Burn',
    from: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    to: '0x0000000000000000000000000000000000000000',
    amount: '500',
    tokenType: 'AT',
    status: 'success',
    gasUsed: '72,456',
    gasFee: '0.0014',
    blockNumber: 51234445,
    hospital: 'Metro General Hospital'
  },
  {
    id: 'TX-005',
    txHash: '0x5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f',
    timestamp: '2024-12-04 10:05:12',
    type: 'Token Mint',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    amount: '25,000',
    tokenType: 'AT',
    status: 'failed',
    gasUsed: '0',
    gasFee: '0.0000',
    blockNumber: 0,
    hospital: 'Regional Health Network'
  }
]

export default function LogsPage() {
  // Audit Log State
  const [auditLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [dateRange, setDateRange] = useState('today')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Error Log State
  const [errors] = useState<ErrorLog[]>(mockErrors)
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Transaction Log State
  const [transactions] = useState<BlockchainTransaction[]>(mockTransactions)
  const [typeFilter, setTypeFilter] = useState('all')
  const [txStatusFilter, setTxStatusFilter] = useState('all')

  // Utility Functions
  const handleExportAudit = () => {
    const csv = [
      ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Category', 'Resource', 'Status', 'IP Address', 'Details'],
      ...auditLogs.map(log => [
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

  const handleExportErrors = () => {
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

  const handleExportTransactions = () => {
    const csv = [
      ['TX Hash', 'Timestamp', 'Type', 'From', 'To', 'Amount', 'Token', 'Status', 'Gas Used', 'Gas Fee', 'Block', 'Hospital'],
      ...transactions.map(tx => [
        tx.txHash, tx.timestamp, tx.type, tx.from, tx.to, tx.amount,
        tx.tokenType, tx.status, tx.gasUsed, tx.gasFee, tx.blockNumber, tx.hospital
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blockchain-transactions-${new Date().toISOString()}.csv`
    a.click()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
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

  // Audit Log Columns
  const auditColumns = [
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

  // Error Log Columns
  const errorColumns = [
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

  // Transaction Log Columns
  const transactionColumns = [
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
      key: 'txHash',
      label: 'Transaction Hash',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {value.slice(0, 10)}...{value.slice(-8)}
          </code>
          <button 
            onClick={() => copyToClipboard(value)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Copy className="h-3 w-3" />
          </button>
          <a 
            href={`https://polygonscan.com/tx/${value}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-600 hover:text-cyan-700"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string, row: BlockchainTransaction) => (
        <div>
          <Badge variant="outline">{value}</Badge>
          <div className="text-xs text-gray-600 mt-1">{row.hospital}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: string, row: BlockchainTransaction) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-600">{row.tokenType}</div>
        </div>
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
      key: 'gasUsed',
      label: 'Gas',
      render: (value: string, row: BlockchainTransaction) => (
        <div className="text-xs">
          <div className="text-gray-900">{value}</div>
          <div className="text-gray-600">{row.gasFee} MATIC</div>
        </div>
      )
    },
    {
      key: 'blockNumber',
      label: 'Block',
      render: (value: number) => (
        <div className="text-sm font-mono text-gray-900">
          {value > 0 ? value.toLocaleString() : '-'}
        </div>
      )
    }
  ]

  // Statistics
  const errorStats = {
    total: errors.length,
    critical: errors.filter(e => e.severity === 'critical').length,
    unresolved: errors.filter(e => !e.resolved).length,
    affectedUsers: errors.reduce((sum, e) => sum + e.affectedUsers, 0)
  }

  const txStats = {
    total: transactions.length,
    success: transactions.filter(tx => tx.status === 'success').length,
    pending: transactions.filter(tx => tx.status === 'pending').length,
    failed: transactions.filter(tx => tx.status === 'failed').length,
    totalGas: transactions.reduce((sum, tx) => sum + parseFloat(tx.gasFee), 0).toFixed(4)
  }

  const timelineEvents = auditLogs.slice(0, 10).map(log => ({
    id: log.id,
    type: log.status,
    action: log.action,
    details: log.details,
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
        <p className="text-gray-600 mt-1">Monitor audit trails, errors, and blockchain transactions</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="audit" className="gap-2">
            <FileText className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="errors" className="gap-2">
            <Shield className="h-4 w-4" />
            Error Logs
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <Database className="h-4 w-4" />
            Transaction Logs
          </TabsTrigger>
        </TabsList>

        {/* ============= AUDIT LOGS TAB ============= */}
        <TabsContent value="audit" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleExportAudit} className="gap-2">
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
                        {auditLogs.filter(l => l.status === 'success').length}
                      </div>
                    </div>
                    <div className="flex-1 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="text-xs text-red-600">Errors</div>
                      <div className="text-lg font-bold text-red-700">
                        {auditLogs.filter(l => l.status === 'error').length}
                      </div>
                    </div>
                    <div className="flex-1 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="text-xs text-yellow-600">Warnings</div>
                      <div className="text-lg font-bold text-yellow-700">
                        {auditLogs.filter(l => l.status === 'warning').length}
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
                data={auditLogs}
                columns={auditColumns}
                searchPlaceholder="Search logs..."
                pageSize={10}
                emptyMessage="No audit logs found"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============= ERROR LOGS TAB ============= */}
        <TabsContent value="errors" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleExportErrors} className="gap-2">
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
                    <p className="text-2xl font-bold text-gray-900">{errorStats.total}</p>
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
                    <p className="text-2xl font-bold text-red-600">{errorStats.critical}</p>
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
                    <p className="text-2xl font-bold text-orange-600">{errorStats.unresolved}</p>
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
                    <p className="text-2xl font-bold text-blue-600">{errorStats.affectedUsers}</p>
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
                columns={errorColumns}
                searchPlaceholder="Search errors..."
                pageSize={10}
                emptyMessage="No errors found"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============= TRANSACTION LOGS TAB ============= */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleExportTransactions} className="gap-2">
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{txStats.total}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{txStats.success}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{txStats.pending}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{txStats.failed}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600">Total Gas Fees</p>
                  <p className="text-2xl font-bold text-purple-600">{txStats.totalGas} MATIC</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Transaction Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="mint">Token Mint</SelectItem>
                      <SelectItem value="transfer">Token Transfer</SelectItem>
                      <SelectItem value="burn">Token Burn</SelectItem>
                      <SelectItem value="allocation">Health Token Allocation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <Select value={txStatusFilter} onValueChange={setTxStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={transactions}
                columns={transactionColumns}
                searchPlaceholder="Search transactions..."
                pageSize={10}
                emptyMessage="No transactions found"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
