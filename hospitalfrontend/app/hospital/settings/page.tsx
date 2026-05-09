'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, Bell, CheckCircle, Loader2, RefreshCw, Save, Shield, User } from 'lucide-react'
import {
  HospitalStaffSettings,
  UpdateHospitalStaffSettingsRequest,
  hospitalStaffSettingsService,
} from '@/services/hospitalStaffSettingsService'
import { authService } from '@/lib/authService'
import { useAuthStore } from '@/store/authStore'

type FormState = UpdateHospitalStaffSettingsRequest

const toIsoDate = (value: string | null | undefined): string => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

const formatTs = (ts: string | null | undefined): string => {
  if (!ts) return 'N/A'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString()
}

const toFormState = (settings: HospitalStaffSettings): FormState => ({
  staffName: settings.staffName || '',
  phone: settings.phone || '',
  address: settings.address || '',
  city: settings.city || '',
  bloodGroup: settings.bloodGroup || '',
  dateOfBirth: toIsoDate(settings.dateOfBirth),
  mfaEnabled: !!settings.mfaEnabled,
  notificationEnabled: !!settings.notificationEnabled,
})

export default function SettingsPage() {
  const [settings, setSettings] = useState<HospitalStaffSettings | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('profile')

  const loadSettings = async () => {
    setIsInitialLoading(true)
    setError(null)
    try {
      const data = await hospitalStaffSettingsService.getSettings()
      setSettings(data)
      setForm(toFormState(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setIsInitialLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSave = async () => {
    if (!form) return

    setError(null)
    setIsLoading(true)
    try {
      // Send null instead of empty string so backend skips DOB parsing.
      const payload: UpdateHospitalStaffSettingsRequest = {
        ...form,
        dateOfBirth: form.dateOfBirth && /^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)
          ? form.dateOfBirth
          : null,
      }
      const updated = await hospitalStaffSettingsService.updateSettings(payload)
      setSettings(updated)
      setForm(toFormState(updated))

      // Keep local user cache synchronized with updated profile fields.
      const cachedUser = authService.getUser() || {}
      authService.setUser({
        ...cachedUser,
        name: updated.staffName,
        email: updated.email,
        phoneNum: updated.phone || '',
        address: updated.address || '',
        city: updated.city || '',
        bloodGroup: updated.bloodGroup || '',
        dateOfBirth: updated.dateOfBirth || '',
        role: (updated.role || cachedUser.role || 'HOSPITAL_STAFF').toUpperCase(),
      })

      // Also update the Zustand auth store so the Header (Welcome banner, avatar)
      // re-renders immediately without needing a page reload.
      const storeUser = useAuthStore.getState().user
      if (storeUser) {
        useAuthStore.getState().setUser({
          ...storeUser,
          name: updated.staffName,
          email: updated.email,
        })
      }

      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status?: string | null) => {
    switch(status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>
      case 'ACTIVE': return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'INACTIVE': return <Badge className="bg-slate-200 text-slate-800">Inactive</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading staff settings...</p>
        </div>
      </div>
    )
  }

  if (!settings || !form) {
    return (
      <div className="container mx-auto p-8 space-y-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Unable to load settings.</p>
              {error && <p className="mt-1">{error}</p>}
            </div>
          </CardContent>
        </Card>
        <Button onClick={loadSettings} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Staff Settings</h1>
        </div>
        <Button variant="outline" onClick={loadSettings} disabled={isLoading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {isSaved && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6 flex items-center gap-2 text-sm text-green-800">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium">Settings saved successfully</span>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

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
                    value={form.staffName}
                    onChange={(e) => setForm({ ...form, staffName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                  <p className="text-xs text-gray-500 mt-1">`users.name`</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <Input
                    value={settings.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">`users.email` (read-only)</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Number</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                  />
                  <p className="text-xs text-gray-500 mt-1">`users.phone_num`</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">City</label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Karachi"
                  />
                  <p className="text-xs text-gray-500 mt-1">`users.city`</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Blood Group</label>
                  <Input
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    placeholder="A+"
                  />
                  <p className="text-xs text-gray-500 mt-1">`users.blood_group`</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date of Birth</label>
                  <Input
                    type="date"
                    value={form.dateOfBirth || ''}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">`users.date_of_birth`</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Address</label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Street address"
                  />
                  <p className="text-xs text-gray-500 mt-1">`users.address`</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Profile Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-semibold">Role</p>
                    <p className="text-sm font-bold text-blue-900">{settings.role || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 font-semibold">Hospital</p>
                    <p className="text-sm font-bold text-green-900">{settings.hospitalName || 'Not Linked'}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-700 font-semibold">Status</p>
                    <div className="mt-1">{getStatusBadge(settings.userStatus)}</div>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <p className="text-xs text-slate-600 font-semibold">Email Verification</p>
                    <p className="text-sm font-bold text-slate-900">{settings.emailVerified ? 'Verified' : 'Not Verified'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>Authentication settings from `users` and `settings`</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Multi-Factor Authentication</p>
                  <p className="text-xs text-gray-500">`users.mfa_enabled` + `settings.multi_factor_enabled`</p>
                </div>
                <Checkbox
                  checked={form.mfaEnabled}
                  onCheckedChange={(checked) => setForm({ ...form, mfaEnabled: checked as boolean })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Mapped to `settings.notification_enabled`</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Enable Notifications</p>
                  <p className="text-xs text-gray-500">Turn account notifications on or off</p>
                </div>
                <Checkbox
                  checked={form.notificationEnabled}
                  onCheckedChange={(checked) => setForm({ ...form, notificationEnabled: checked as boolean })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Loaded from `activity` table for your user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Timestamp</th>
                      <th className="text-left p-3 font-medium">Action</th>
                      <th className="text-left p-3 font-medium">Details</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(settings.recentActivity || []).length > 0 ? (
                      settings.recentActivity.map((log) => (
                        <tr key={log.activityId || `${log.timestamp}-${log.activityName}`} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm">{formatTs(log.timestamp)}</td>
                          <td className="p-3 font-medium">{log.activityName || 'N/A'}</td>
                          <td className="p-3 text-sm text-gray-600">{log.description || '-'}</td>
                          <td className="p-3 text-sm">{log.type || '-'}</td>
                          <td className="p-3">{getStatusBadge(log.status || undefined)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-3 text-sm text-gray-500" colSpan={5}>No recent activity found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 justify-end mt-6">
        <Button variant="outline" onClick={loadSettings}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}