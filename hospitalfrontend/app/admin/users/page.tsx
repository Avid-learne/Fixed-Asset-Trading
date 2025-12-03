// hospitalfrontend/app/admin/users/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Search, Plus, Edit, Trash2, Shield, Lock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: ''
  })

  const handleCreateUser = () => {
    console.log('Creating user:', formData)
    setShowCreateModal(false)
    setFormData({ name: '', email: '', role: '', password: '' })
  }

  const handleUpdateUser = () => {
    console.log('Updating user:', selectedUser)
    setShowEditModal(false)
    setSelectedUser(null)
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'SUPER_ADMIN': 'text-error bg-red-50',
      'HOSPITAL_ADMIN': 'text-primary bg-blue-50',
      'HOSPITAL_STAFF': 'text-accent bg-teal-50',
      'BANK_OFFICER': 'text-warning bg-yellow-50',
      'PATIENT': 'text-gray-600 bg-gray-50'
    }
    return colors[role] || 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage system users and permissions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <Shield className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-1">All roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            <Shield className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">0</div>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Suspended</CardTitle>
            <Lock className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">0</div>
            <p className="text-xs text-gray-500 mt-1">Account locked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
            <Shield className="w-4 h-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">0</div>
            <p className="text-xs text-gray-500 mt-1">System administrators</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>User Directory</CardTitle>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="HOSPITAL_ADMIN">Hospital Admin</option>
                <option value="HOSPITAL_STAFF">Hospital Staff</option>
                <option value="BANK_OFFICER">Bank Officer</option>
                <option value="PATIENT">Patient</option>
              </select>
            </div>
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
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Create New User</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Select role</option>
                <option value="PATIENT">Patient</option>
                <option value="HOSPITAL_STAFF">Hospital Staff</option>
                <option value="HOSPITAL_ADMIN">Hospital Admin</option>
                <option value="BANK_OFFICER">Bank Officer</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
            />
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}