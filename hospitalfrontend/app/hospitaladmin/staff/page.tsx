'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Shield, UserCog, Mail, Clock, Activity, Eye, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: 'Admin' | 'Medical Officer' | 'Finance Manager' | 'Clerk' | 'Auditor'
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  lastLogin: string
  permissions: {
    viewPatients: boolean
    approveDeposits: boolean
    mintTokens: boolean
    manageStaff: boolean
    viewReports: boolean
    allocateProfits: boolean
    manageSettings: boolean
  }
  activityLog: {
    action: string
    timestamp: string
    details: string
  }[]
}

const mockStaff: StaffMember[] = [
  {
    id: 'STAFF-001',
    name: 'Dr. Sarah Smith',
    email: 'sarah.smith@lnh.com',
    phone: '+92 300 1234567',
    role: 'Medical Officer',
    status: 'active',
    joinDate: '2024-01-15',
    lastLogin: '2024-12-04 09:30',
    permissions: {
      viewPatients: true,
      approveDeposits: true,
      mintTokens: false,
      manageStaff: false,
      viewReports: true,
      allocateProfits: false,
      manageSettings: false
    },
    activityLog: [
      { action: 'Approved Deposit', timestamp: '2024-12-04 09:15', details: 'Deposit DEP-1001 approved' },
      { action: 'Viewed Patient', timestamp: '2024-12-04 08:45', details: 'Accessed PAT-001 profile' },
      { action: 'Login', timestamp: '2024-12-04 08:30', details: 'Successful login' },
    ]
  },
  {
    id: 'STAFF-002',
    name: 'James Wilson',
    email: 'j.wilson@lnh.com',
    phone: '+92 300 2345678',
    role: 'Finance Manager',
    status: 'active',
    joinDate: '2023-08-20',
    lastLogin: '2024-12-04 10:00',
    permissions: {
      viewPatients: true,
      approveDeposits: true,
      mintTokens: true,
      manageStaff: false,
      viewReports: true,
      allocateProfits: true,
      manageSettings: false
    },
    activityLog: [
      { action: 'Allocated Profits', timestamp: '2024-12-03 16:20', details: 'Distributed $50K in HT' },
      { action: 'Minted Tokens', timestamp: '2024-12-03 14:30', details: 'Minted 5000 AT for DEP-1002' },
      { action: 'Login', timestamp: '2024-12-04 10:00', details: 'Successful login' },
    ]
  },
  {
    id: 'STAFF-003',
    name: 'Emily Chen',
    email: 'e.chen@lnh.com',
    phone: '+92 300 3456789',
    role: 'Clerk',
    status: 'inactive',
    joinDate: '2024-03-10',
    lastLogin: '2024-11-28 15:45',
    permissions: {
      viewPatients: true,
      approveDeposits: false,
      mintTokens: false,
      manageStaff: false,
      viewReports: true,
      allocateProfits: false,
      manageSettings: false
    },
    activityLog: [
      { action: 'Viewed Reports', timestamp: '2024-11-28 15:30', details: 'Generated monthly report' },
      { action: 'Login', timestamp: '2024-11-28 15:00', details: 'Successful login' },
    ]
  },
  {
    id: 'STAFF-004',
    name: 'Michael Rodriguez',
    email: 'm.rodriguez@lnh.com',
    phone: '+92 300 4567890',
    role: 'Admin',
    status: 'active',
    joinDate: '2023-01-05',
    lastLogin: '2024-12-04 07:00',
    permissions: {
      viewPatients: true,
      approveDeposits: true,
      mintTokens: true,
      manageStaff: true,
      viewReports: true,
      allocateProfits: true,
      manageSettings: true
    },
    activityLog: [
      { action: 'Updated Settings', timestamp: '2024-12-04 06:45', details: 'Modified KYC configuration' },
      { action: 'Added Staff', timestamp: '2024-12-03 10:15', details: 'Invited new staff member' },
      { action: 'Login', timestamp: '2024-12-04 07:00', details: 'Successful login' },
    ]
  },
]

export default function StaffManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all')
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('')

  const filteredStaff = mockStaff.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive': return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const handleInviteStaff = () => {
    console.log('Inviting staff:', inviteEmail, inviteRole)
    setShowInviteDialog(false)
    setInviteEmail('')
    setInviteRole('')
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage staff members, roles, and permissions</p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Mail className="mr-2 h-4 w-4" />
          Invite Staff
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold">{mockStaff.length}</p>
              </div>
              <UserCog className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockStaff.filter(s => s.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">
                  {mockStaff.filter(s => s.status === 'inactive').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {mockStaff.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search staff by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="font-medium">{staff.name}</div>
                    <div className="text-sm text-gray-600">{staff.id}</div>
                  </TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {staff.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(staff.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">{staff.lastLogin}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStaff(staff)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Staff Detail Modal */}
      <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Staff Member Details
            </DialogTitle>
          </DialogHeader>

          {selectedStaff && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Name</label>
                        <p className="font-medium">{selectedStaff.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="font-medium">{selectedStaff.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <p className="font-medium">{selectedStaff.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Staff ID</label>
                        <p className="font-medium">{selectedStaff.id}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Role & Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Role</label>
                        <div className="mt-1">
                          <Badge variant="outline" className="gap-1">
                            <Shield className="h-3 w-3" />
                            {selectedStaff.role}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Status</label>
                        <div className="mt-1">{getStatusBadge(selectedStaff.status)}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Join Date</label>
                        <p className="font-medium">{selectedStaff.joinDate}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Last Login</label>
                        <p className="font-medium">{selectedStaff.lastLogin}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deactivate
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Role-Based Access Control
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(selectedStaff.permissions).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <Checkbox checked={value} disabled />
                            <div>
                              <p className="font-medium">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </p>
                            </div>
                          </div>
                          {value ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900 font-medium mb-2">Permission Summary</p>
                      <p className="text-sm text-blue-700">
                        This {selectedStaff.role} has {Object.values(selectedStaff.permissions).filter(Boolean).length} out of {Object.keys(selectedStaff.permissions).length} permissions enabled.
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2 justify-end">
                      <Button variant="outline">
                        <Shield className="mr-2 h-4 w-4" />
                        Edit Permissions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedStaff.activityLog.map((log, index) => (
                        <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Activity className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-gray-600">{log.details}</p>
                            <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Staff Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invite Staff Member
            </DialogTitle>
            <DialogDescription>
              Send an invitation email to a new staff member
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input
                type="email"
                placeholder="staff@lnh.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="medical">Medical Officer</SelectItem>
                  <SelectItem value="finance">Finance Manager</SelectItem>
                  <SelectItem value="clerk">Clerk</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteStaff} disabled={!inviteEmail || !inviteRole}>
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
