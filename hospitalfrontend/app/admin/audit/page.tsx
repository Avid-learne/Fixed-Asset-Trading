// hospitalfrontend/app/admin/audit/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Search, Download, Filter, FileText, Shield, AlertCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function AdminAuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [dateRange, setDateRange] = useState('7d')

  const handleExport = () => {
    console.log('Exporting audit logs...')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Audit Logs</h1>
          <p className="text-gray-500 mt-1">Monitor all system activities and security events</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
            <FileText className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Successful Actions</CardTitle>
            <Shield className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">0</div>
            <p className="text-xs text-gray-500 mt-1">Completed successfully</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed Actions</CardTitle>
            <AlertCircle className="w-4 h-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">0</div>
            <p className="text-xs text-gray-500 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unique Users</CardTitle>
            <Filter className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-1">Active users</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Activity Log</CardTitle>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  No audit logs found
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security & Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Audit Trail Retention</p>
                <p>All audit logs are retained for 7 years in compliance with healthcare regulations</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Access Monitoring</p>
                <p>System administrators have read-only access to audit logs</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Real-time Alerts</p>
                <p>Automated alerts for suspicious activities and security events</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}