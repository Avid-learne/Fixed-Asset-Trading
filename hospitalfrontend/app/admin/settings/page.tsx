// hospitalfrontend/app/admin/settings/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Globe, Lock, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('account')
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'blockchain', label: 'Blockchain', icon: Globe },
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

        </div>
      </div>
    </div>
  )
}