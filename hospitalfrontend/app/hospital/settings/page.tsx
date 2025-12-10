'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Save, RefreshCw, Bell, Database, Eye, Download, CheckCircle, AlertTriangle, Smartphone, Clock, Mail, User } from 'lucide-react'

interface StaffSettings {
  staffName: string
  staffId: string
  email: string
  phone: string
  department: string
  role: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  depositApproval: boolean
  mintingComplete: boolean
  profitAllocation: boolean
  lowBalance: boolean
}

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
  status: 'success' | 'warning' | 'error'
}

const initialStaffSettings: StaffSettings = {
  staffName: 'Jane Staff',
  staffId: 'STAFF-001',
  email: 'staff@lnh.com',
  phone: '+92 300 1234567',
  department: 'Patient Services',
  role: 'Hospital Staff'
}

const initialNotifications: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  depositApproval: true,
  mintingComplete: true,
  profitAllocation: true,
  lowBalance: true
}

const mockAuditLogs: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2025-12-10 10:30',
    user: 'staff@lnh.com',
    action: 'Updated Profile Settings',
    details: 'Changed contact information',
    status: 'success'
  },
  {
    id: 'AUD-002',
    timestamp: '2025-12-10 09:15',
    user: 'staff@lnh.com',
    action: 'Backup Created',
    details: 'Full system backup completed successfully',
    status: 'success'
  },
  {
    id: 'AUD-003',
    timestamp: '2025-12-09 16:45',
    user: 'staff@lnh.com',
    action: 'Notification Settings Modified',
    details: 'Enabled SMS notifications',
    status: 'success'
  },
  {
    id: 'AUD-004',
    timestamp: '2025-12-09 14:20',
    user: 'staff@lnh.com',
    action: 'Failed Backup Attempt',
    details: 'Insufficient storage space',
    status: 'error'
  },
]

export default function SettingsPage() {
  const [staffSettings, setStaffSettings] = useState<StaffSettings>(initialStaffSettings)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotifications)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [lastBackupTime, setLastBackupTime] = useState<string>('December 10, 2025 at 9:15 AM')
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('profile')
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false)
  const [testEmail, setTestEmail] = useState('')

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaved(true)
    setIsLoading(false)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const addAuditLog = (action: string, details: string, status: 'success' | 'warning' | 'error') => {
    const newLog: AuditLog = {
      id: `AUD-${String(auditLogs.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      user: staffSettings.email,
      action,
      details,
      status
    }
    setAuditLogs([newLog, ...auditLogs])
  }

  const handleBackup = async () => {
    try {
      addAuditLog('Backup Initiated', 'Creating full system backup...', 'success')
      await new Promise(resolve => setTimeout(resolve, 1500))
      const now = new Date()
      const backupTime = now.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
      setLastBackupTime(backupTime)
      const filename = `LNH_Backup_${new Date().toISOString().split('T')[0]}.zip`
      addAuditLog('Backup Created', `Full system backup completed successfully - File: ${filename} (Size: 2.3 GB)`, 'success')
      alert(`Backup created successfully!\nBackup file: ${filename}`)
    } catch (error) {
      addAuditLog('Backup Failed', 'Backup creation failed due to system error', 'error')
      alert('Backup failed. Please try again.')
    }
  }

  const handleRestore = async () => {
    try {
      addAuditLog('Restore Initiated', 'Restoring system from backup...', 'success')
      await new Promise(resolve => setTimeout(resolve, 2000))
      addAuditLog('Restore Completed', 'System successfully restored from backup file', 'success')
      alert('Data restored successfully from backup!')
    } catch (error) {
      addAuditLog('Restore Failed', 'Restore operation failed - invalid backup file', 'error')
      alert('Restore failed. Please try again.')
    }
  }

  const handleTestEmail = async () => {
    console.log('Sending test email to:', testEmail)
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert(`Test email sent successfully to ${testEmail}`)
    setShowTestEmailDialog(false)
    setTestEmail('')
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your profile and system preferences</p>
        </div>
      </div>

      {isSaved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">Settings saved successfully</p>
        </div>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="backup">Backup & Audit</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Hospital Staff Information
              </CardTitle>
              <CardDescription>Manage your profile and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <Input
                    value={staffSettings.staffName}
                    onChange={(e) => setStaffSettings({...staffSettings, staffName: e.target.value})}
                    placeholder="Enter your full name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your full name as registered</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Staff ID</label>
                  <Input
                    value={staffSettings.staffId}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique staff identifier (read-only)</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <Input
                    type="email"
                    value={staffSettings.email}
                    onChange={(e) => setStaffSettings({...staffSettings, email: e.target.value})}
                    placeholder="staff@lnh.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Primary email for notifications</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Number</label>
                  <Input
                    value={staffSettings.phone}
                    onChange={(e) => setStaffSettings({...staffSettings, phone: e.target.value})}
                    placeholder="+92 300 1234567"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contact phone number</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Department</label>
                  <Input
                    value={staffSettings.department}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your department (read-only)</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <Input
                    value={staffSettings.role}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your system role (read-only)</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Profile Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-semibold">Staff ID</p>
                    <p className="text-sm font-bold text-blue-900">{staffSettings.staffId}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 font-semibold">Department</p>
                    <p className="text-sm font-bold text-green-900">{staffSettings.department}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Channels
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive alerts via email</p>
                  </div>
                </div>
                <Checkbox
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked as boolean})}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">SMS Notifications</p>
                    <p className="text-xs text-gray-500">Receive alerts via SMS</p>
                  </div>
                </div>
                <Checkbox
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked as boolean})}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-sm">Push Notifications</p>
                    <p className="text-xs text-gray-500">Receive browser push alerts</p>
                  </div>
                </div>
                <Checkbox
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked as boolean})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Event Notifications
              </CardTitle>
              <CardDescription>Choose which events trigger notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm">Deposit Approval Required</p>
                  <p className="text-xs text-gray-500">When a deposit needs approval</p>
                </div>
                <Checkbox
                  checked={notificationSettings.depositApproval}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, depositApproval: checked as boolean})}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm">Token Minting Complete</p>
                  <p className="text-xs text-gray-500">When tokens are successfully minted</p>
                </div>
                <Checkbox
                  checked={notificationSettings.mintingComplete}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, mintingComplete: checked as boolean})}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm">Profit Allocation</p>
                  <p className="text-xs text-gray-500">When profits are allocated</p>
                </div>
                <Checkbox
                  checked={notificationSettings.profitAllocation}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, profitAllocation: checked as boolean})}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm">Low Balance Alert</p>
                  <p className="text-xs text-gray-500">When system balance is low</p>
                </div>
                <Checkbox
                  checked={notificationSettings.lowBalance}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, lowBalance: checked as boolean})}
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowTestEmailDialog(true)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Test Email
          </Button>
        </TabsContent>

        {/* Backup & Audit */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup & Restore
              </CardTitle>
              <CardDescription>Manage system backups and data restoration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Database className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                      <h4 className="font-medium mb-2">Create Backup</h4>
                      <p className="text-sm text-gray-600 mb-4">Export current system state</p>
                      <Button onClick={handleBackup} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Create Backup
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <RefreshCw className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h4 className="font-medium mb-2">Restore Data</h4>
                      <p className="text-sm text-gray-600 mb-4">Import previous backup</p>
                      <Button onClick={handleRestore} variant="outline" className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Restore Backup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-900 font-medium">Last Backup</p>
                <p className="text-sm text-yellow-700">{lastBackupTime}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Audit Log
              </CardTitle>
              <CardDescription>Recent system changes and administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Timestamp</th>
                      <th className="text-left p-3 font-medium">User</th>
                      <th className="text-left p-3 font-medium">Action</th>
                      <th className="text-left p-3 font-medium">Details</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">{log.timestamp}</td>
                        <td className="p-3 text-sm">{log.user}</td>
                        <td className="p-3 font-medium">{log.action}</td>
                        <td className="p-3 text-sm text-gray-600">{log.details}</td>
                        <td className="p-3">{getStatusBadge(log.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 justify-end mt-6">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Test Email Dialog */}
      <Dialog open={showTestEmailDialog} onOpenChange={setShowTestEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>Send a test notification to verify email settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter email address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestEmailDialog(false)}>Cancel</Button>
            <Button onClick={handleTestEmail}>Send Test Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}