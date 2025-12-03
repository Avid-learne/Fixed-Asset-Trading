// hospitalfrontend/app/admin/settings/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Settings, Shield, Database, Bell, Globe, Lock } from 'lucide-react'

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)

  const tabs = [
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
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500 mt-1">Configure platform-wide settings</p>
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
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Platform Name"
                  defaultValue="Fixed Asset Trading"
                  placeholder="Enter platform name"
                />
                
                <Input
                  label="Support Email"
                  type="email"
                  defaultValue="support@fixedassettrading.com"
                  placeholder="Enter support email"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    defaultValue="Healthcare financing through asset tokenization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Mode
                  </label>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="w-4 h-4 text-primary" />
                    <span className="text-sm text-gray-600">Enable maintenance mode</span>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} loading={loading}>
                    Save Changes
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
                      <p className="font-medium text-gray-900">Require Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Enforce 2FA for all users</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium text-gray-900">Password Complexity</p>
                      <p className="text-sm text-gray-600">Require strong passwords</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium text-gray-900">IP Whitelisting</p>
                      <p className="text-sm text-gray-600">Restrict access by IP address</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <Input
                  label="Session Timeout (minutes)"
                  type="number"
                  defaultValue="30"
                  placeholder="30"
                />

                <Input
                  label="Password Expiry (days)"
                  type="number"
                  defaultValue="90"
                  placeholder="90"
                />

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} loading={loading}>
                    Update Security Settings
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
                <Input
                  label="Network RPC URL"
                  defaultValue={process.env.NEXT_PUBLIC_RPC_URL || ''}
                  placeholder="https://..."
                />

                <Input
                  label="Chain ID"
                  type="number"
                  defaultValue={process.env.NEXT_PUBLIC_CHAIN_ID || ''}
                  placeholder="1"
                />

                <Input
                  label="Asset Token Contract"
                  defaultValue={process.env.NEXT_PUBLIC_ASSET_TOKEN_ADDRESS || ''}
                  className="font-mono text-sm"
                  disabled
                />

                <Input
                  label="Health Token Contract"
                  defaultValue={process.env.NEXT_PUBLIC_HEALTH_TOKEN_ADDRESS || ''}
                  className="font-mono text-sm"
                  disabled
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Contract addresses are read-only and configured at deployment
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} loading={loading}>
                    Save Configuration
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
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Send notifications via email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Send notifications via SMS</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium text-gray-900">System Alerts</p>
                      <p className="text-sm text-gray-600">Critical system notifications</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} loading={loading}>
                    Save Settings
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