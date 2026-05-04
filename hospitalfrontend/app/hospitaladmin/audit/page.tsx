'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Eye, Shield, Activity, Lock, Loader } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { auditLogService } from '@/services/auditLogService'
import type { AuditLog } from '@/types/auditLog'

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

const AuditTable = ({ logs, searchTerm, isLoading }: { logs: AuditLog[]; searchTerm: string; isLoading: boolean }) => {
  const filteredLogs = logs.filter(
    (log) =>
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading audit logs...</span>
      </div>
    )
  }

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
              <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
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
  const [patientLogs, setPatientLogs] = useState<AuditLog[]>([])
  const [hospitalLogs, setHospitalLogs] = useState<AuditLog[]>([])
  const [isLoadingPatient, setIsLoadingPatient] = useState(true)
  const [isLoadingHospital, setIsLoadingHospital] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch audit logs on component mount
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        // Fetch patient audit logs
        setIsLoadingPatient(true)
        const patientData = await auditLogService.getAllPatientAuditLogs(100)
        setPatientLogs(patientData)
        setIsLoadingPatient(false)

        // Fetch hospital audit logs
        setIsLoadingHospital(true)
        const hospitalData = await auditLogService.getHospitalAuditLogs(100)
        setHospitalLogs(hospitalData)
        setIsLoadingHospital(false)
      } catch (err) {
        console.error('Error fetching audit logs:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch audit logs')
        setIsLoadingPatient(false)
        setIsLoadingHospital(false)
      }
    }

    fetchAuditLogs()
  }, [])

  const currentLogs = activeTab === 'patient' ? patientLogs : hospitalLogs
  const isLoading = activeTab === 'patient' ? isLoadingPatient : isLoadingHospital
  const stats = auditLogService.getStatistics(currentLogs)

  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Trail</h1>
          <p className="text-muted-foreground mt-1">Comprehensive log of all system interactions and activities.</p>
        </div>
        {/* Export button removed per project policy */}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Logs ({activeTab})</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="text-2xl font-bold text-success">{stats.successful}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Failed/Errors</p>
              <p className="text-2xl font-bold text-error">{stats.failed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-primary">{stats.successRate}%</p>
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
                <Button variant="outline" disabled>
                  <Filter className="w-4 h-4 mr-2" /> Filter
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AuditTable logs={currentLogs} searchTerm={searchTerm} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
