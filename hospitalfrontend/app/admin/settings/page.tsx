// hospitalfrontend/app/admin/settings/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Settings, Shield, Database, Bell, Globe, Lock, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('account')
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'blockchain', label: 'Blockchain', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      alert('Settings saved successfully')
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure platform-wide settings</p>
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
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
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
          {activeTab === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Profile Information</h3>
                  
                  <FormField
                    label="Full Name"
                    defaultValue={user?.name || ''}
                    placeholder="Enter your full name"
                  />
                  
                  <FormField
                    label="Email Address"
                    type="email"
                    defaultValue={user?.email || ''}
                    placeholder="Enter your email"
                  />

                  <FormField
                    label="Role"
                    defaultValue={user?.role || 'SUPER_ADMIN'}
                    placeholder="Role"
                    disabled
                  />
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
                  
                  <FormField
                    label="Current Password"
                    type="password"
                    placeholder="Enter current password"
                  />
                  
                  <FormField
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                  />
                  
                  <FormField
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  label="Platform Name"
                  defaultValue="Fixed Asset Trading"
                  placeholder="Enter platform name"
                />
                
                <FormField
                  label="Support Email"
                  type="email"
                  defaultValue="support@fixedassettrading.com"
                  placeholder="Enter support email"
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Platform Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                    defaultValue="Healthcare financing through asset tokenization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Maintenance Mode
                  </label>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="w-4 h-4 accent-[hsl(var(--primary))]" />
                    <span className="text-sm text-muted-foreground">Enable maintenance mode</span>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium text-foreground">Require Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Enforce 2FA for all users</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[hsl(var(--primary))]" />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium text-foreground">Password Complexity</p>
                      <p className="text-sm text-muted-foreground">Require strong passwords</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[hsl(var(--primary))]" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Updating…' : 'Update Security Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'database' && (
            <Card>
              <CardHeader>
                <CardTitle>Database Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted border border-border rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    <Database className="w-4 h-4 inline mr-2" />
                    Database settings are configured in environment variables
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-foreground mb-2">Database Status</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Connected - 12.4ms latency</span>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-foreground mb-2">Backup Status</p>
                    <p className="text-sm text-muted-foreground">Last backup: 2 hours ago</p>
                    <Button className="mt-3">Backup Now</Button>
                  </div>

                  <div>
                    <p className="font-medium text-foreground mb-2">Database Optimization</p>
                    <p className="text-sm text-muted-foreground">Regular maintenance and index optimization</p>
                    <Button className="mt-3">Optimize Database</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'blockchain' && (
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  label="Network RPC URL"
                  defaultValue={process.env.NEXT_PUBLIC_RPC_URL || ''}
                  placeholder="https://..."
                />

                <FormField
                  label="Chain ID"
                  type="number"
                  defaultValue={process.env.NEXT_PUBLIC_CHAIN_ID || ''}
                  placeholder="1"
                />

                <FormField
                  label="Asset Token Contract"
                  defaultValue={process.env.NEXT_PUBLIC_ASSET_TOKEN_ADDRESS || ''}
                  className="font-mono text-sm"
                  disabled
                />

                <FormField
                  label="Health Token Contract"
                  defaultValue={process.env.NEXT_PUBLIC_HEALTH_TOKEN_ADDRESS || ''}
                  className="font-mono text-sm"
                  disabled
                />

                <div className="bg-muted border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Contract addresses are read-only and configured at deployment
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving…' : 'Save Configuration'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium text-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[hsl(var(--primary))]" />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium text-foreground">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 accent-[hsl(var(--primary))]" />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium text-foreground">System Alerts</p>
                      <p className="text-sm text-muted-foreground">Critical system notifications</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[hsl(var(--primary))]" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving…' : 'Save Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}