// app/hospital/settings/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Building, Lock, Bell, Shield, Users, Coins } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function HospitalSettingsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)

  const [hospitalInfo, setHospitalInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    licenseNumber: ''
  })

  const [securitySettings, setSecuritySettings] = useState({
    requireMFA: true,
    sessionTimeout: '30',
    passwordExpiry: '90'
  })

  const handleSaveGeneral = async () => {
    setLoading(true)
    // TODO: API call
    setTimeout(() => {
      alert('Settings saved successfully')
      setLoading(false)
    }, 1000)
  }

  const handleSaveSecurity = async () => {
    setLoading(true)
    // TODO: API call
    setTimeout(() => {
      alert('Security settings updated')
      setLoading(false)
    }, 1000)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'tokens', label: 'Token Settings', icon: Coins },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage hospital configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>Hospital Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Hospital Name"
                    value={hospitalInfo.name}
                    onChange={(e) => setHospitalInfo({ ...hospitalInfo, name: e.target.value })}
                    placeholder="Enter hospital name"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={hospitalInfo.address}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, address: e.target.value })}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      placeholder="Enter hospital address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Contact Phone"
                      type="tel"
                      value={hospitalInfo.phone}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />

                    <Input
                      label="Contact Email"
                      type="email"
                      value={hospitalInfo.email}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>

                  <Input
                    label="License Number"
                    value={hospitalInfo.licenseNumber}
                    onChange={(e) => setHospitalInfo({ ...hospitalInfo, licenseNumber: e.target.value })}
                    placeholder="Enter license number"
                  />

                  <div className="flex justify-end">
                    <Button onClick={handleSaveGeneral} loading={loading}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Require Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Enforce MFA for all staff members</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.requireMFA}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, requireMFA: e.target.checked })}
                      className="w-5 h-5 text-primary"
                    />
                  </div>

                  <Input
                    label="Session Timeout (minutes)"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                    placeholder="30"
                  />

                  <Input
                    label="Password Expiry (days)"
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiry: e.target.value })}
                    placeholder="90"
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Security changes will apply to all staff members immediately
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveSecurity} loading={loading}>
                      Update Security Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'staff' && (
            <Card>
              <CardHeader>
                <CardTitle>Staff Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Total Staff Members</p>
                      <p className="text-sm text-gray-600">Active hospital staff accounts</p>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">0</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Pending Invitations</p>
                      <p className="text-sm text-gray-600">Staff awaiting account activation</p>
                    </div>
                    <span className="text-2xl font-bold text-warning">0</span>
                  </div>

                  <Button className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Add New Staff Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'tokens' && (
            <Card>
              <CardHeader>
                <CardTitle>Token Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset Token Contract Address
                  </label>
                  <Input
                    value={process.env.NEXT_PUBLIC_ASSET_TOKEN_ADDRESS || ''}
                    disabled
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Health Token Contract Address
                  </label>
                  <Input
                    value={process.env.NEXT_PUBLIC_HEALTH_TOKEN_ADDRESS || ''}
                    disabled
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital Contract Address
                  </label>
                  <Input
                    value={process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS || ''}
                    disabled
                    className="font-mono text-sm"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Contract addresses are configured at deployment and cannot be changed
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">New Asset Deposits</p>
                    <p className="text-sm text-gray-600">Alert when patients submit new assets</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Approval Required</p>
                    <p className="text-sm text-gray-600">Notify when deposits need approval</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Trading Completed</p>
                    <p className="text-sm text-gray-600">Alert when trading sessions complete</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">System Alerts</p>
                    <p className="text-sm text-gray-600">Important system notifications</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
                </div>

                <div className="flex justify-end pt-4">
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}