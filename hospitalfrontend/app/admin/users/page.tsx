'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, Shield, Lock, RotateCcw } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'HOSPITAL_ADMIN' | 'HOSPITAL_STAFF' | 'BANK_OFFICER' | 'PATIENT'
  status: 'active' | 'inactive' | 'suspended'
  organization?: string
  lastLogin: string
  createdAt: string
  verified: boolean
}

const mockUsers: User[] = [
  {
    id: 'USR-001',
    name: 'System Admin',
    email: 'admin@assetbridge.com',
    role: 'SUPER_ADMIN',
    status: 'active',
    lastLogin: '2024-12-06T10:30:00Z',
    createdAt: '2024-01-15T08:00:00Z',
    verified: true,
  },
  {
    id: 'USR-002',
    name: 'Dr. Sarah Johnson',
    email: 'admin@lnh.com',
    role: 'HOSPITAL_ADMIN',
    status: 'active',
    organization: 'Liaquat National Hospital',
    lastLogin: '2024-12-06T09:15:00Z',
    createdAt: '2024-02-20T10:00:00Z',
    verified: true,
  },
  {
    id: 'USR-003',
    name: 'Nurse Emily Davis',
    email: 'staff@lnh.com',
    role: 'HOSPITAL_STAFF',
    status: 'active',
    organization: 'Liaquat National Hospital',
    lastLogin: '2024-12-06T08:45:00Z',
    createdAt: '2024-03-10T09:30:00Z',
    verified: true,
  },
  {
    id: 'USR-004',
    name: 'Muhammad Asif',
    email: 'officer@nbp.com',
    role: 'BANK_OFFICER',
    status: 'active',
    organization: 'National Bank of Pakistan',
    lastLogin: '2024-12-05T16:20:00Z',
    createdAt: '2024-02-28T11:00:00Z',
    verified: true,
  },
  {
    id: 'USR-005',
    name: 'Ahmed Patient',
    email: 'ahmed.patient@lnh.com',
    role: 'PATIENT',
    status: 'active',
    lastLogin: '2024-12-06T07:30:00Z',
    createdAt: '2024-04-05T14:00:00Z',
    verified: true,
  },
]

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'HOSPITAL_STAFF' as const,
    password: '',
    organization: ''
  })

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleCreateUser = () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in all required fields')
      return
    }
    const newUser: User = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'active',
      organization: formData.organization || undefined,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      verified: true,
    }
    setUsers([...users, newUser])
    setShowCreateModal(false)
    setFormData({ name: '', email: '', role: 'HOSPITAL_STAFF', password: '', organization: '' })
    alert('User created successfully!')
  }

  const handleUpdateUser = () => {
    if (!selectedUser) return
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u))
    setShowEditModal(false)
    setSelectedUser(null)
    alert('User updated successfully!')
  }

  const handleResetPassword = () => {
    if (!selectedUser) return
    alert(`Password reset link sent to ${selectedUser.email}`)
    setShowResetPassword(false)
    setSelectedUser(null)
  }

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
    alert(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
  }

  const handleSuspendUser = (user: User) => {
    setUsers(users.map(u => u.id === user.id ? { ...u, status: 'suspended' } : u))
    alert('User suspended')
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'SUPER_ADMIN': 'bg-destructive/20 text-destructive',
      'HOSPITAL_ADMIN': 'bg-primary/20 text-primary',
      'HOSPITAL_STAFF': 'bg-secondary/20 text-secondary',
      'BANK_OFFICER': 'bg-yellow-500/20 text-yellow-600',
      'PATIENT': 'bg-muted text-muted-foreground'
    }
    return colors[role] || 'bg-muted text-muted-foreground'
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-secondary/20 text-secondary'
      case 'inactive':
        return 'bg-muted text-muted-foreground'
      case 'suspended':
        return 'bg-destructive/20 text-destructive'
      default:
        return 'bg-muted'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and assign roles</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Shield className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <Shield className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{users.filter(u => u.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
            <Lock className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{users.filter(u => u.status === 'suspended').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Account locked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            <Shield className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'HOSPITAL_ADMIN').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Hospital admins</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>User Directory</CardTitle>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="HOSPITAL_ADMIN">Hospital Admin</option>
                <option value="HOSPITAL_STAFF">Hospital Staff</option>
                <option value="BANK_OFFICER">Bank Officer</option>
                <option value="PATIENT">Patient</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(user.status)}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.organization || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatTime(user.lastLogin)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedUser(user)
                          setShowEditModal(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user)
                          setShowResetPassword(true)
                        }}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Create New User</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email Address *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full h-10 rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                <option value="PATIENT">Patient</option>
                <option value="HOSPITAL_STAFF">Hospital Staff</option>
                <option value="HOSPITAL_ADMIN">Hospital Admin</option>
                <option value="BANK_OFFICER">Bank Officer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Organization</label>
              <Input
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Enter organization (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password *</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal open={showEditModal} onOpenChange={setShowEditModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit User</ModalTitle>
          </ModalHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                <Input
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <Input type="email" value={selectedUser.email} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as any })}
                  className="w-full h-10 rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="HOSPITAL_STAFF">Hospital Staff</option>
                  <option value="HOSPITAL_ADMIN">Hospital Admin</option>
                  <option value="BANK_OFFICER">Bank Officer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select
                  value={selectedUser.status}
                  onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value as any })}
                  className="w-full h-10 rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Organization</label>
                <Input
                  value={selectedUser.organization || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, organization: e.target.value })}
                />
              </div>
            </div>
          )}
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal open={showResetPassword} onOpenChange={setShowResetPassword}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Reset Password</ModalTitle>
          </ModalHeader>
          {selectedUser && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A password reset link will be sent to:
              </p>
              <p className="font-medium text-foreground">{selectedUser.email}</p>
              <p className="text-sm text-muted-foreground">
                The user will receive an email with instructions to reset their password.
              </p>
            </div>
          )}
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowResetPassword(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>Send Reset Link</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
