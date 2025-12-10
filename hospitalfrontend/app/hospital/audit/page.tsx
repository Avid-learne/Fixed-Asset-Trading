'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Download,
  Shield,
  LogIn,
  LogOut,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Activity,
  Eye,
  Calendar
} from 'lucide-react'

// Audit log entry type
interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  userRole: string
  action: AuditAction
  status: AuditStatus
  ipAddress: string
  device: string
  browser: string
  location: string
  details?: string
  metadata?: Record<string, any>
}

type AuditAction = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'PROFILE_UPDATE'
  | 'DEPOSIT_APPROVED'
  | 'DEPOSIT_REJECTED'
  | 'TOKEN_MINTED'
  | 'PATIENT_VERIFIED'
  | 'SETTINGS_CHANGED'
  | 'DATA_EXPORTED'
  | 'ACCOUNT_LOCKED'
  | 'SESSION_EXPIRED'

type AuditStatus = 'success' | 'failed' | 'warning' | 'info'

// Mock audit logs for hospital staff
const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2025-12-10T09:15:23Z',
    userId: 'STAFF-001',
    userName: 'Dr. Sarah Ahmed',
    userRole: 'Hospital Staff',
    action: 'LOGIN_SUCCESS',
    status: 'success',
    ipAddress: '192.168.1.105',
    device: 'Windows 11',
    browser: 'Chrome 120.0',
    location: 'Karachi, Pakistan',
    details: 'Successful login from registered device'
  },
  {
    id: 'AUD-002',
    timestamp: '2025-12-10T08:45:12Z',
    userId: 'ADMIN-001',
    userName: 'Admin Hassan',
    userRole: 'Hospital Admin',
    action: 'LOGIN_SUCCESS',
    status: 'success',
    ipAddress: '192.168.1.102',
    device: 'MacOS 14',
    browser: 'Safari 17.2',
    location: 'Karachi, Pakistan',
    details: 'Admin login successful'
  },
  {
    id: 'AUD-003',
    timestamp: '2025-12-10T08:30:45Z',
    userId: 'STAFF-002',
    userName: 'Nurse Fatima',
    userRole: 'Hospital Staff',
    action: 'LOGIN_FAILED',
    status: 'failed',
    ipAddress: '192.168.1.108',
    device: 'Android 13',
    browser: 'Chrome Mobile',
    location: 'Karachi, Pakistan',
    details: 'Failed login attempt - Invalid password'
  },
  {
    id: 'AUD-004',
    timestamp: '2025-12-10T07:20:33Z',
    userId: 'STAFF-003',
    userName: 'Dr. Ali Raza',
    userRole: 'Hospital Staff',
    action: 'DEPOSIT_APPROVED',
    status: 'success',
    ipAddress: '192.168.1.110',
    device: 'Windows 11',
    browser: 'Edge 120.0',
    location: 'Karachi, Pakistan',
    details: 'Approved gold deposit DEP-045 for patient Ahmed Khan'
  },
  {
    id: 'AUD-005',
    timestamp: '2025-12-10T06:55:18Z',
    userId: 'STAFF-001',
    userName: 'Dr. Sarah Ahmed',
    userRole: 'Hospital Staff',
    action: 'LOGOUT',
    status: 'success',
    ipAddress: '192.168.1.105',
    device: 'Windows 11',
    browser: 'Chrome 120.0',
    location: 'Karachi, Pakistan',
    details: 'User logged out successfully'
  },
  {
    id: 'AUD-006',
    timestamp: '2025-12-09T18:30:22Z',
    userId: 'STAFF-001',
    userName: 'Dr. Sarah Ahmed',
    userRole: 'Hospital Staff',
    action: 'LOGIN_SUCCESS',
    status: 'success',
    ipAddress: '192.168.1.105',
    device: 'Windows 11',
    browser: 'Chrome 120.0',
    location: 'Karachi, Pakistan',
    details: 'Evening shift login'
  },
  {
    id: 'AUD-007',
    timestamp: '2025-12-09T17:45:10Z',
    userId: 'STAFF-004',
    userName: 'Dr. Usman Sheikh',
    userRole: 'Hospital Staff',
    action: 'PATIENT_VERIFIED',
    status: 'success',
    ipAddress: '192.168.1.112',
    device: 'iPad',
    browser: 'Safari Mobile',
    location: 'Karachi, Pakistan',
    details: 'Verified KYC documents for patient Fatima Ali'
  },
  {
    id: 'AUD-008',
    timestamp: '2025-12-09T16:20:45Z',
    userId: 'UNKNOWN',
    userName: 'Unknown User',
    userRole: 'Unknown',
    action: 'LOGIN_FAILED',
    status: 'failed',
    ipAddress: '103.255.4.22',
    device: 'Unknown',
    browser: 'Unknown',
    location: 'Unknown Location',
    details: 'Failed login attempt - User not found'
  },
  {
    id: 'AUD-009',
    timestamp: '2025-12-09T15:10:30Z',
    userId: 'STAFF-002',
    userName: 'Nurse Fatima',
    userRole: 'Hospital Staff',
    action: 'LOGIN_SUCCESS',
    status: 'success',
    ipAddress: '192.168.1.108',
    device: 'Android 13',
    browser: 'Chrome Mobile',
    location: 'Karachi, Pakistan',
    details: 'Mobile login successful'
  },
  {
    id: 'AUD-010',
    timestamp: '2025-12-09T14:55:12Z',
    userId: 'ADMIN-001',
    userName: 'Admin Hassan',
    userRole: 'Hospital Admin',
    action: 'SETTINGS_CHANGED',
    status: 'warning',
    ipAddress: '192.168.1.102',
    device: 'MacOS 14',
    browser: 'Safari 17.2',
    location: 'Karachi, Pakistan',
    details: 'Changed system security settings'
  },
  {
    id: 'AUD-011',
    timestamp: '2025-12-09T13:30:00Z',
    userId: 'STAFF-003',
    userName: 'Dr. Ali Raza',
    userRole: 'Hospital Staff',
    action: 'TOKEN_MINTED',
    status: 'success',
    ipAddress: '192.168.1.110',
    device: 'Windows 11',
    browser: 'Edge 120.0',
    location: 'Karachi, Pakistan',
    details: 'Minted 15,000 AT tokens for approved deposit'
  },
  {
    id: 'AUD-012',
    timestamp: '2025-12-09T12:15:45Z',
    userId: 'STAFF-005',
    userName: 'Dr. Ayesha Malik',
    userRole: 'Hospital Staff',
    action: 'LOGIN_FAILED',
    status: 'failed',
    ipAddress: '192.168.1.115',
    device: 'Windows 10',
    browser: 'Firefox 121.0',
    location: 'Karachi, Pakistan',
    details: 'Failed login - Account temporarily locked after 3 attempts'
  },
  {
    id: 'AUD-013',
    timestamp: '2025-12-09T11:00:20Z',
    userId: 'STAFF-001',
    userName: 'Dr. Sarah Ahmed',
    userRole: 'Hospital Staff',
    action: 'LOGOUT',
    status: 'success',
    ipAddress: '192.168.1.105',
    device: 'Windows 11',
    browser: 'Chrome 120.0',
    location: 'Karachi, Pakistan',
    details: 'Shift end logout'
  },
  {
    id: 'AUD-014',
    timestamp: '2025-12-09T09:45:30Z',
    userId: 'STAFF-001',
    userName: 'Dr. Sarah Ahmed',
    userRole: 'Hospital Staff',
    action: 'LOGIN_SUCCESS',
    status: 'success',
    ipAddress: '192.168.1.105',
    device: 'Windows 11',
    browser: 'Chrome 120.0',
    location: 'Karachi, Pakistan',
    details: 'Morning shift login'
  },
  {
    id: 'AUD-015',
    timestamp: '2025-12-09T08:30:15Z',
    userId: 'ADMIN-001',
    userName: 'Admin Hassan',
    userRole: 'Hospital Admin',
    action: 'DATA_EXPORTED',
    status: 'info',
    ipAddress: '192.168.1.102',
    device: 'MacOS 14',
    browser: 'Safari 17.2',
    location: 'Karachi, Pakistan',
    details: 'Exported patient database report'
  }
]

export default function HospitalAuditTrail() {
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Filter logs
  const filteredLogs = MOCK_AUDIT_LOGS.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const logDate = new Date(log.timestamp)
      const today = new Date()
      
      if (dateFilter === 'today') {
        matchesDate = logDate.toDateString() === today.toDateString()
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        matchesDate = logDate >= weekAgo
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        matchesDate = logDate >= monthAgo
      }
    }
    
    return matchesSearch && matchesAction && matchesStatus && matchesDate
  })

  // Calculate statistics
  const totalLogs = MOCK_AUDIT_LOGS.length
  const loginSuccessCount = MOCK_AUDIT_LOGS.filter(log => log.action === 'LOGIN_SUCCESS').length
  const loginFailedCount = MOCK_AUDIT_LOGS.filter(log => log.action === 'LOGIN_FAILED').length
  const criticalActions = MOCK_AUDIT_LOGS.filter(log => log.status === 'failed' || log.status === 'warning').length
  const uniqueUsers = new Set(MOCK_AUDIT_LOGS.map(log => log.userId)).size

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case 'LOGIN_SUCCESS': return <LogIn className="h-4 w-4" />
      case 'LOGIN_FAILED': return <XCircle className="h-4 w-4" />
      case 'LOGOUT': return <LogOut className="h-4 w-4" />
      case 'PASSWORD_CHANGE': return <Shield className="h-4 w-4" />
      case 'PATIENT_VERIFIED': return <UserCheck className="h-4 w-4" />
      case 'DEPOSIT_APPROVED': return <CheckCircle className="h-4 w-4" />
      case 'DEPOSIT_REJECTED': return <XCircle className="h-4 w-4" />
      case 'TOKEN_MINTED': return <Activity className="h-4 w-4" />
      case 'SETTINGS_CHANGED': return <AlertTriangle className="h-4 w-4" />
      case 'DATA_EXPORTED': return <Download className="h-4 w-4" />
      case 'ACCOUNT_LOCKED': return <UserX className="h-4 w-4" />
      case 'SESSION_EXPIRED': return <Clock className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: AuditStatus) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'info': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionColor = (action: AuditAction) => {
    if (action.includes('SUCCESS') || action.includes('APPROVED')) return 'text-green-600'
    if (action.includes('FAILED') || action.includes('REJECTED')) return 'text-red-600'
    if (action.includes('WARNING') || action.includes('LOCKED')) return 'text-yellow-600'
    return 'text-blue-600'
  }

  const formatActionName = (action: AuditAction) => {
    return action.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const getDeviceIcon = (device: string) => {
    if (device.includes('Android') || device.includes('iPad') || device.includes('iOS')) {
      return <Smartphone className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Trail</h1>
          <p className="text-slate-600 mt-1">Complete activity log and security monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Logs</p>
                <p className="text-2xl font-bold text-slate-900">{totalLogs}</p>
                <p className="text-xs text-slate-500 mt-1">All activities</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Successful Logins</p>
                <p className="text-2xl font-bold text-slate-900">{loginSuccessCount}</p>
                <p className="text-xs text-slate-500 mt-1">Valid access</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <LogIn className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Failed Attempts</p>
                <p className="text-2xl font-bold text-slate-900">{loginFailedCount}</p>
                <p className="text-xs text-slate-500 mt-1">Security alerts</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Users</p>
                <p className="text-2xl font-bold text-slate-900">{uniqueUsers}</p>
                <p className="text-xs text-slate-500 mt-1">{criticalActions} critical events</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by user, IP address, or activity..."
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
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm"
            >
              <option value="all">All Actions</option>
              <option value="LOGIN_SUCCESS">Login Success</option>
              <option value="LOGIN_FAILED">Login Failed</option>
              <option value="LOGOUT">Logout</option>
              <option value="DEPOSIT_APPROVED">Deposit Approved</option>
              <option value="PATIENT_VERIFIED">Patient Verified</option>
              <option value="TOKEN_MINTED">Token Minted</option>
              <option value="SETTINGS_CHANGED">Settings Changed</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Activity ({filteredLogs.length})</TabsTrigger>
          <TabsTrigger value="login">Login Activity</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="system">System Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Chronological list of all system activities</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
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
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Action</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">IP Address</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Device</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Details</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`${getActionColor(log.action)}`}>
                                {getActionIcon(log.action)}
                              </div>
                              <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                                {formatActionName(log.action)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{log.userName}</p>
                              <p className="text-xs text-slate-500">{log.userRole}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(log.status)}>
                              {log.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Globe className="h-3 w-3 text-slate-400" />
                              <span>{log.ipAddress}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              {getDeviceIcon(log.device)}
                              <div>
                                <p>{log.device}</p>
                                <p className="text-slate-400">{log.browser}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-slate-700 max-w-xs truncate" title={log.details}>
                              {log.details}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Login Activity</CardTitle>
              <CardDescription>Login and logout events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Timestamp</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Action</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">IP Address</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Location</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Device</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.filter(log => 
                      log.action === 'LOGIN_SUCCESS' || 
                      log.action === 'LOGIN_FAILED' || 
                      log.action === 'LOGOUT'
                    ).map((log) => (
                      <tr key={log.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`${getActionColor(log.action)}`}>
                              {getActionIcon(log.action)}
                            </div>
                            <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                              {formatActionName(log.action)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{log.userName}</p>
                            <p className="text-xs text-slate-500">{log.userId}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Globe className="h-3 w-3 text-slate-400" />
                            <span>{log.ipAddress}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-slate-600">{log.location}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            {getDeviceIcon(log.device)}
                            <div>
                              <p>{log.device}</p>
                              <p className="text-slate-400">{log.browser}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Failed attempts and security-related actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Alert</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Timestamp</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Action</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">IP Address</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.filter(log => 
                      log.status === 'failed' || 
                      log.status === 'warning' ||
                      log.action.includes('FAILED') ||
                      log.action.includes('LOCKED')
                    ).map((log) => (
                      <tr key={log.id} className="border-b hover:bg-red-50 transition-colors">
                        <td className="py-3 px-4">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-red-600">
                            {formatActionName(log.action)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{log.userName}</p>
                            <p className="text-xs text-slate-500">{log.userRole}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-red-100 text-red-800">
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Globe className="h-3 w-3 text-slate-400" />
                            <span>{log.ipAddress}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-slate-700">{log.details}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Actions</CardTitle>
              <CardDescription>System modifications and administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Timestamp</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Action</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Performed By</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Details</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.filter(log => 
                      log.action === 'SETTINGS_CHANGED' ||
                      log.action === 'DATA_EXPORTED' ||
                      log.action === 'DEPOSIT_APPROVED' ||
                      log.action === 'DEPOSIT_REJECTED' ||
                      log.action === 'TOKEN_MINTED' ||
                      log.action === 'PATIENT_VERIFIED'
                    ).map((log) => (
                      <tr key={log.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`${getActionColor(log.action)}`}>
                              {getActionIcon(log.action)}
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              {formatActionName(log.action)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{log.userName}</p>
                            <p className="text-xs text-slate-500">{log.userRole}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-slate-700 max-w-sm">{log.details}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Globe className="h-3 w-3 text-slate-400" />
                            <span>{log.ipAddress}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
