'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, Filter, FileText, Shield, AlertCircle } from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  details: string
  ipAddress: string
  status: 'success' | 'failed'
}

const mockAuditLogs: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2024-12-04 10:30',
    user: 'admin@sehatvault.com',
    action: 'CREATE_USER',
    resource: 'User Management',
    details: 'Created new hospital admin account for Dr. Sarah Johnson',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: 'AUD-002',
    timestamp: '2024-12-06T10:15:00Z',
    user: 'sarah.johnson@cityhospital.com',
    action: 'MINT_TOKENS',
    resource: 'Token Operations',
    details: 'Minted 500 AT tokens for patient P-12345',
    ipAddress: '192.168.1.105',
    status: 'success',
  },
  {
    id: 'AUD-003',
    timestamp: '2024-12-06T09:45:00Z',
    user: 'michael.anderson@firstbank.com',
    action: 'APPROVE_ASSET',
    resource: 'Asset Verification',
    details: 'Approved gold asset valuation for deposit D-98765',
    ipAddress: '192.168.1.110',
    status: 'success',
  },
  {
    id: 'AUD-004',
    timestamp: '2024-12-06T09:30:00Z',
    user: 'emily.davis@cityhospital.com',
    action: 'UPDATE_PATIENT',
    resource: 'Patient Records',
    details: 'Updated patient profile for Alice Smith',
    ipAddress: '192.168.1.108',
    status: 'success',
  },
  {
    id: 'AUD-005',
    timestamp: '2024-12-06T09:15:00Z',
    user: 'admin@sehatvault.com',
    action: 'DELETE_USER',
    resource: 'User Management',
    details: 'Attempted to delete active admin account',
    ipAddress: '192.168.1.100',
    status: 'failed',
  },
  {
    id: 'AUD-006',
    timestamp: '2024-12-06T08:50:00Z',
    user: 'robert.chen@countyhospital.com',
    action: 'ALLOCATE_TOKENS',
    resource: 'Token Operations',
    details: 'Allocated 300 HT tokens to patient P-54321',
    ipAddress: '192.168.1.112',
    status: 'success',
  },
  {
    id: 'AUD-007',
    timestamp: '2024-12-06T08:30:00Z',
    user: 'admin@sehatvault.com',
    action: 'VERIFY_HOSPITAL',
    resource: 'Hospital Management',
    details: 'Verified Metro Health Center registration',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: 'AUD-008',
    timestamp: '2024-12-06T08:00:00Z',
    user: 'james.wilson@communitybank.com',
    action: 'APPROVE_TRANSACTION',
    resource: 'Transaction Verification',
    details: 'Approved transaction TX-11223',
    ipAddress: '192.168.1.115',
    status: 'success',
  },
]

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [dateRange, setDateRange] = useState('7d')

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    return matchesSearch && matchesAction
  })

  const handleExport = () => {
    alert('Exporting audit logs...')
  }

  const getStatusColor = (status: string) => {
    return status === 'success' 
      ? 'bg-secondary/20 text-secondary'
      : 'bg-destructive/20 text-destructive'
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'CREATE': 'bg-secondary/20 text-secondary',
      'UPDATE': 'bg-primary/20 text-primary',
      'DELETE': 'bg-destructive/20 text-destructive',
      'READ': 'bg-muted text-muted-foreground',
      'LOGIN': 'bg-secondary/20 text-secondary',
    }
    return colors[action] || 'bg-muted text-muted-foreground'
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Monitor all system activities and security events</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            <FileText className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{logs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Successful Actions</CardTitle>
            <Shield className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{logs.filter(l => l.status === 'success').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed successfully</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Actions</CardTitle>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{logs.filter(l => l.status === 'failed').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Users</CardTitle>
            <Filter className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{new Set(logs.map(l => l.user)).size}</div>
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
                />
              </div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-10 rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                <option value="all">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="LOGIN">Login</option>
                <option value="READ">Read</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
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
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
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
