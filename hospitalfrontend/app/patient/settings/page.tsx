// src/app/patient/settings/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormField } from '@/components/ui/form-field'
import { User, Lock, Shield, Smartphone, Monitor, Globe, ShieldCheck, AlertTriangle, CheckCircle, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { validatePassword } from '@/lib/utils'
import { ProfileContactForm } from '@/app/patient/profile/info/ProfileContactForm'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'profile')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    const validation = validatePassword(passwordData.newPassword)
    if (!validation.valid) {
      alert(validation.errors.join('\n'))
      return
    }

    setLoading(true)
    setTimeout(() => {
      alert('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setLoading(false)
    }, 1000)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'mfa', label: 'Two-Factor Auth', icon: Shield },
    { id: 'logs', label: 'Access Logs', icon: Monitor }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences and security</p>
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
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <ProfileContactForm
                showCancelButton={false}
                submitLabel="Save Changes"
                pendingLabel="Saving…"
              />
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <FormField
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />

                  <FormField
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />

                  <FormField
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-medium mb-2">Password Requirements:</p>
                    <ul className="space-y-1 text-xs">
                      <li>At least 8 characters long</li>
                      <li>Contains uppercase and lowercase letters</li>
                      <li>Contains at least one number</li>
                      <li>Contains at least one special character</li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Changing…' : 'Change Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'mfa' && (
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Authenticator App</h3>
                      <Badge
                        variant={user?.mfaEnabled ? 'default' : 'outline'}
                        className={user?.mfaEnabled ? 'bg-green-100 text-green-800 border border-green-200' : ''}
                      >
                        {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Use an authenticator app to generate verification codes
                    </p>
                    <Button size="sm" variant={user?.mfaEnabled ? 'destructive' : 'default'}>
                      {user?.mfaEnabled ? 'Disable' : 'Enable'} Authenticator
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-accent-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">SMS Authentication</h3>
                      <Badge variant="outline">Disabled</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Receive verification codes via SMS
                    </p>
                    <Button size="sm" variant="outline">
                      Enable SMS
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <Shield className="w-4 h-4 inline mr-2" />
                    We strongly recommend enabling two-factor authentication to protect your account
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Access Logs</CardTitle>
                  <p className="text-sm text-gray-500">Review recent sign-ins, device usage, and any unusual login attempts on your account.</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Card className="border-dashed">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Last successful login</p>
                            <p className="text-xs text-gray-400">Most recent verified access</p>
                          </div>
                          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-lg font-semibold">1 hours ago</p>
                          <p className="text-xs text-gray-500">Islamabad, PK • MacBook Pro 16"</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Unusual activity</p>
                            <p className="text-xs text-gray-400">Challenges or failed attempts</p>
                          </div>
                          <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-lg font-semibold">2 events</p>
                          <p className="text-xs text-gray-500">Monitor unexpected access attempts</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Active locations</p>
                            <p className="text-xs text-gray-400">Cities detected in recent logins</p>
                          </div>
                          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                            <Globe className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-lg font-semibold">4 cities</p>
                          <p className="text-xs text-gray-500">Keep an eye on where you sign in</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Sign-in history</h3>
                      <p className="text-sm text-gray-500">Click any row for quick details.</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search device, location, or IP"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All statuses</option>
                        <option value="successful">Successful</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">When</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Security</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">1 hours ago</div>
                                <div className="text-xs text-gray-500">08/12/2025, 2:32:00 pm</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Monitor className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-900">MacBook Pro 16"</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">Chrome 123.0</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">Islamabad, PK</div>
                                <div className="text-xs text-gray-500">203.99.180.12</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">203.99.180.12</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <Badge className="bg-green-100 text-green-800 border border-green-200">
                                  <ShieldCheck className="w-3 h-3 mr-1" />
                                  Successful
                                </Badge>
                                <div className="text-xs text-gray-500 mt-1">Auth: password+otp</div>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">12 hours ago</div>
                                <div className="text-xs text-gray-500">08/12/2025, 2:18:00 am</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Smartphone className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-900">iPhone 15 Pro</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">Safari 18.0</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">Lahore, PK</div>
                                <div className="text-xs text-gray-500">110.38.74.6</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">110.38.74.6</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <Badge className="bg-green-100 text-green-800 border border-green-200">
                                  <ShieldCheck className="w-3 h-3 mr-1" />
                                  Successful
                                </Badge>
                                <div className="text-xs text-gray-500 mt-1">Auth: password+otp</div>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">2 days ago</div>
                                <div className="text-xs text-gray-500">06/12/2025, 9:14:00 pm</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Monitor className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-900">Windows Desktop</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">Edge 120.0</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">Karachi, PK</div>
                                <div className="text-xs text-gray-500">182.191.94.23</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">182.191.94.23</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <Badge className="bg-green-100 text-green-800 border border-green-200">
                                  <ShieldCheck className="w-3 h-3 mr-1" />
                                  Successful
                                </Badge>
                                <div className="text-xs text-gray-500 mt-1">Auth: password</div>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">3 days ago</div>
                                <div className="text-xs text-gray-500">05/12/2025, 11:42:00 am</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Smartphone className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-900">Android Phone</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">Chrome Mobile 122.0</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">Rawalpindi, PK</div>
                                <div className="text-xs text-gray-500">119.152.45.78</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">119.152.45.78</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <Badge className="bg-red-100 text-red-800 border border-red-200">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Failed
                                </Badge>
                                <div className="text-xs text-gray-500 mt-1">Auth: invalid password</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        If you notice any suspicious activity, revoke access immediately and change your password
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}