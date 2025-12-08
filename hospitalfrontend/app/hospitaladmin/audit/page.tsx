'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Download, Eye, Shield, Activity, Lock } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Patient Audit Logs - Patient-initiated interactions
const patientAuditLogs = [
  { id: 'PAT-001', action: 'Deposited Asset', user: 'John Doe (Patient ID: PAT-2024-001)', details: 'Deposited vehicle (Tesla Model 3) for minting, 1000 AT generated', ip: '203.45.67.89', timestamp: '2 mins ago', category: 'deposit', status: 'success' },
  { id: 'PAT-002', action: 'Traded Tokens', user: 'Jane Smith (Patient ID: PAT-2024-002)', details: 'Exchanged 500 AT for 250 HT in marketplace', ip: '192.168.45.23', timestamp: '8 mins ago', category: 'trading', status: 'success' },
  { id: 'PAT-003', action: 'Viewed Portfolio', user: 'Ahmed Hassan (Patient ID: PAT-2024-003)', details: 'Accessed portfolio dashboard, viewed 8 assets', ip: '10.20.30.45', timestamp: '12 mins ago', category: 'view', status: 'success' },
  { id: 'PAT-004', action: 'Login', user: 'Sarah Johnson (Patient ID: PAT-2024-004)', details: 'Successful login from mobile device', ip: '172.16.0.50', timestamp: '28 mins ago', category: 'auth', status: 'success' },
  { id: 'PAT-005', action: 'Updated Profile', user: 'Michael Brown (Patient ID: PAT-2024-005)', details: 'Updated personal information and contact details', ip: '192.168.1.100', timestamp: '45 mins ago', category: 'profile', status: 'success' },
  { id: 'PAT-006', action: 'Downloaded Statement', user: 'Lisa Wong (Patient ID: PAT-2024-006)', details: 'Downloaded quarterly asset statement (PDF)', ip: '203.0.113.45', timestamp: '1 hour ago', category: 'download', status: 'success' },
  { id: 'PAT-007', action: 'Failed Login', user: 'Unknown (Patient ID: Unknown)', details: 'Failed login attempt - incorrect credentials', ip: '198.51.100.78', timestamp: '2 hours ago', category: 'auth', status: 'failure' },
  { id: 'PAT-008', action: 'Redeemed Benefit', user: 'Robert Davis (Patient ID: PAT-2024-007)', details: 'Redeemed health benefit package worth 200 HT', ip: '192.168.88.1', timestamp: '3 hours ago', category: 'benefit', status: 'success' },
  { id: 'PAT-009', action: 'Transferred Tokens', user: 'Emma Wilson (Patient ID: PAT-2024-008)', details: 'Transferred 300 AT to another patient account', ip: '10.0.20.15', timestamp: '4 hours ago', category: 'transfer', status: 'success' },
  { id: 'PAT-010', action: 'Requested Withdrawal', user: 'David Lee (Patient ID: PAT-2024-009)', details: 'Submitted withdrawal request for 500 AT to bank account', ip: '172.31.0.100', timestamp: '5 hours ago', category: 'withdrawal', status: 'pending' },
]

// Hospital Audit Logs - Hospital/Admin-initiated interactions and system events
const hospitalAuditLogs = [
  { id: 'HSP-001', action: 'Approved Deposit', user: 'Admin (Hospital Staff)', details: 'Approved deposit request #DEP-2024-405 (PAT-2024-001), created 1000 AT tokens', ip: '192.168.1.1', timestamp: '3 mins ago', category: 'approval', status: 'success' },
  { id: 'HSP-002', action: 'Updated Settings', user: 'System Administrator', details: 'Changed KYC provider configuration and updated verification thresholds', ip: '192.168.1.1', timestamp: '15 mins ago', category: 'system', status: 'success' },
  { id: 'HSP-003', action: 'Minted Tokens', user: 'Admin (Hospital Staff)', details: 'Minted 5000 HT for benefit distribution program', ip: '192.168.1.1', timestamp: '45 mins ago', category: 'minting', status: 'success' },
  { id: 'HSP-004', action: 'Generated Report', user: 'Hospital Manager', details: 'Generated monthly financial report (Dec 2024), 847 transactions analyzed', ip: '192.168.1.50', timestamp: '1 hour ago', category: 'reporting', status: 'success' },
  { id: 'HSP-005', action: 'User Suspended', user: 'Security Officer', details: 'Suspended patient account PAT-2024-010 due to suspicious activity', ip: '192.168.1.100', timestamp: '1.5 hours ago', category: 'security', status: 'success' },
  { id: 'HSP-006', action: 'Database Backup', user: 'System Process', details: 'Automatic backup completed - 2.3 GB backed up successfully', ip: '127.0.0.1', timestamp: '2 hours ago', category: 'backup', status: 'success' },
  { id: 'HSP-007', action: 'Security Alert', user: 'Security System', details: 'Detected 45 failed login attempts from IP 45.22.11.90 - IP blocked', ip: '192.168.1.200', timestamp: '2.5 hours ago', category: 'security', status: 'warning' },
  { id: 'HSP-008', action: 'Bulk Asset Update', user: 'Hospital Admin', details: 'Updated valuation for 23 assets in custody, total value: 450000 PKR', ip: '192.168.1.25', timestamp: '3 hours ago', category: 'admin', status: 'success' },
  { id: 'HSP-009', action: 'System Maintenance', user: 'System Administrator', details: 'Completed blockchain network synchronization, all nodes updated to v1.2.4', ip: '192.168.1.1', timestamp: '4 hours ago', category: 'system', status: 'success' },
  { id: 'HSP-010', action: 'Compliance Check', user: 'Compliance Officer', details: 'Monthly AML/KYC compliance audit completed, 0 violations found', ip: '192.168.1.75', timestamp: '5 hours ago', category: 'compliance', status: 'success' },
  { id: 'HSP-011', action: 'Staff Permission Change', user: 'System Administrator', details: 'Updated permissions for user admin@hospital.com - added approval authority', ip: '192.168.1.1', timestamp: '6 hours ago', category: 'admin', status: 'success' },
  { id: 'HSP-012', action: 'Smart Contract Deployed', user: 'Developer', details: 'Deployed new HealthToken smart contract v2.0 to blockchain', ip: '10.0.0.50', timestamp: '8 hours ago', category: 'system', status: 'success' },
]

const getActionIcon = (category: string) => {
  switch (category) {
    case 'auth':
      return <Lock className="w-4 h-4" />
    case 'security':
      return <Shield className="w-4 h-4" />
    case 'system':
    case 'minting':
    case 'admin':
    case 'approval':
      return <Activity className="w-4 h-4" />
    default:
      return <Eye className="w-4 h-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-success/10 text-success'
    case 'failure':
    case 'error':
      return 'bg-error/10 text-error'
    case 'warning':
      return 'bg-warning/10 text-warning'
    case 'pending':
      return 'bg-primary/10 text-primary'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const AuditTable = ({ logs, searchTerm }: { logs: any[]; searchTerm: string }) => {
  const filteredLogs = logs.filter(
    (log) =>
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Log ID</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>IP Address</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <TableRow key={log.id} className="hover:bg-gray-50">
              <TableCell className="font-mono text-xs font-semibold">{log.id}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getActionIcon(log.category)}
                  <Badge variant="outline">{log.action}</Badge>
                </div>
              </TableCell>
              <TableCell className="text-sm">{log.user}</TableCell>
              <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{log.details}</TableCell>
              <TableCell className="font-mono text-xs">{log.ip}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(log.status)} variant="secondary">
                  {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-sm">{log.timestamp}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No audit logs found matching your search.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default function AuditTrailPage() {
  const [activeTab, setActiveTab] = useState('patient')
  const [searchTerm, setSearchTerm] = useState('')

  const currentLogs = activeTab === 'patient' ? patientAuditLogs : hospitalAuditLogs
  const totalLogs = currentLogs.length
  const successLogs = currentLogs.filter(log => log.status === 'success').length
  const failureLogs = currentLogs.filter(log => log.status === 'failure' || log.status === 'error').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Trail</h1>
          <p className="text-muted-foreground mt-1">Comprehensive log of all system interactions and activities.</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Logs ({activeTab})</p>
              <p className="text-2xl font-bold">{totalLogs}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="text-2xl font-bold text-success">{successLogs}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Failed/Errors</p>
              <p className="text-2xl font-bold text-error">{failureLogs}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-primary">
                {totalLogs > 0 ? Math.round((successLogs / totalLogs) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="patient" className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Patient Interactions</span>
                </TabsTrigger>
                <TabsTrigger value="hospital" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Hospital Operations</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search and Filter */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, action, user, or details..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" /> Filter
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AuditTable logs={currentLogs} searchTerm={searchTerm} />
        </CardContent>
      </Card>
    </div>
  )
}
