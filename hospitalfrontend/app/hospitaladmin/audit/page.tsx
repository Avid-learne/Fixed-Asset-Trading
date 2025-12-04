'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Download, FileText } from 'lucide-react'

const auditLogs = [
    { id: 'LOG-001', action: 'Minted Tokens', user: 'Admin (You)', details: 'Minted 5000 AT for Asset #A-102', ip: '192.168.1.1', time: '2 mins ago' },
    { id: 'LOG-002', action: 'Approved Deposit', user: 'Admin (You)', details: 'Approved deposit request #DEP-405', ip: '192.168.1.1', time: '15 mins ago' },
    { id: 'LOG-003', action: 'Login', user: 'Dr. Sarah Smith', details: 'Successful login from new device', ip: '10.0.0.45', time: '1 hour ago' },
    { id: 'LOG-004', action: 'Updated Settings', user: 'Admin (You)', details: 'Changed KYC provider configuration', ip: '192.168.1.1', time: '3 hours ago' },
    { id: 'LOG-005', action: 'Failed Login', user: 'Unknown', details: 'Failed login attempt for admin account', ip: '45.22.11.90', time: '5 hours ago' },
]

export default function AuditTrailPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Trail</h1>
          <p className="text-muted-foreground mt-1">Comprehensive log of all system activities.</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search logs..." className="pl-8" />
                    </div>
                    <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Log ID</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead className="text-right">Timestamp</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">{log.id}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{log.action}</Badge>
                            </TableCell>
                            <TableCell>{log.user}</TableCell>
                            <TableCell className="text-muted-foreground">{log.details}</TableCell>
                            <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{log.time}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
