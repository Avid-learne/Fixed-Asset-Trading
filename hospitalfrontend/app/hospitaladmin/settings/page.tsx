'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Building2, Shield, UserCog, CheckCircle2, AlertTriangle, PieChart } from 'lucide-react'
import {
  hospitalAdminSettingsService,
  HospitalAdminSettings,
  UpdateHospitalAdminSettingsRequest,
} from '@/services/hospitalAdminSettingsService'
import { hospitalSettingsService, type ProfitSettings } from '@/services/hospitalSettingsService'
import { Slider } from '@/components/ui/slider'

type FormState = UpdateHospitalAdminSettingsRequest

const toFormState = (data: HospitalAdminSettings): FormState => ({
  hospitalName: data.hospitalName || '',
  hospitalCode: data.hospitalCode || '',
  contactEmail: data.contactEmail || '',
  contactPhone: data.contactPhone || '',
  address: data.address || '',
  city: data.city || '',
  adminName: data.adminName || '',
  adminPhone: data.adminPhone || '',
  mfaEnabled: !!data.mfaEnabled,
  notificationEnabled: !!data.notificationEnabled,
})

const statusBadge = (value?: string) => {
  if (!value) return <Badge variant="outline">Unknown</Badge>
  const normalized = value.toUpperCase()
  if (normalized === 'VERIFIED') return <Badge className="bg-green-100 text-green-800">VERIFIED</Badge>
  if (normalized === 'REJECTED') return <Badge className="bg-red-100 text-red-800">REJECTED</Badge>
  return <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>
}

export default function HospitalAdminSettingsPage() {
  const [settings, setSettings] = useState<HospitalAdminSettings | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [profitSettings, setProfitSettings] = useState<ProfitSettings>({
    patientProfitPercent: 40,
    hospitalProfitPercent: 50,
    bankProfitPercent: 10,
  })
  const [isProfitLoading, setIsProfitLoading] = useState(false)
  const [isProfitSaving, setIsProfitSaving] = useState(false)

  const loadSettings = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await hospitalAdminSettingsService.getSettings()
      setSettings(data)
      setForm(toFormState(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const loadProfitSettings = async () => {
    setIsProfitLoading(true)
    try {
      const data = await hospitalSettingsService.getProfitSettings()
      setProfitSettings(data)
    } catch (err) {
      console.error('Failed to load profit settings:', err)
    } finally {
      setIsProfitLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
    loadProfitSettings()
  }, [])

  const handleSave = async () => {
    if (!form) return
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const updated = await hospitalAdminSettingsService.updateSettings(form)
      setSettings(updated)
      setForm(toFormState(updated))
      setSuccess('Settings updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveProfitSettings = async () => {
    setIsProfitSaving(true)
    try {
      await hospitalSettingsService.updateProfitSettings(profitSettings)
      setSuccess('Profit settings updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profit settings')
    } finally {
      setIsProfitSaving(false)
    }
  }

  const handleProfitChange = (field: keyof ProfitSettings, value: number) => {
    setProfitSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const profitTotal =
    profitSettings.patientProfitPercent +
    profitSettings.hospitalProfitPercent +
    profitSettings.bankProfitPercent
  const isProfitValid = Math.abs(profitTotal - 100) < 0.01

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading hospital settings...
        </div>
      </div>
    )
  }

  if (!form || !settings) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          Unable to load settings.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hospital Settings</h1>
          <p className="text-slate-600">Manage your hospital profile and admin security settings</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Hospital Profile
            </CardTitle>
            <CardDescription>Fields mapped to `hospitals` table</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hospital Name</Label>
                <Input
                  value={form.hospitalName}
                  onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hospital Code</Label>
                <Input
                  value={form.hospitalCode}
                  onChange={(e) => setForm({ ...form, hospitalCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input value={settings.registrationNum || ''} disabled />
                <p className="text-xs text-slate-500">Managed by compliance workflow</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hospital Status</CardTitle>
            <CardDescription>Live values from backend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Verification</span>
              <span>{statusBadge(settings.verificationStatus)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Patients</span>
              <span className="font-semibold">{settings.totalPatients ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Assets</span>
              <span className="font-semibold">{settings.totalAssets ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total AT</span>
              <span className="font-semibold">{settings.totalAT ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Admin Account
            </CardTitle>
            <CardDescription>Fields mapped to `users` table</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Admin Name</Label>
              <Input
                value={form.adminName}
                onChange={(e) => setForm({ ...form, adminName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Admin Email</Label>
              <Input value={settings.adminEmail || ''} disabled />
              <p className="text-xs text-slate-500">Email is login identity and is immutable here</p>
            </div>
            <div className="space-y-2">
              <Label>Admin Phone</Label>
              <Input
                value={form.adminPhone}
                onChange={(e) => setForm({ ...form, adminPhone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Notifications
            </CardTitle>
            <CardDescription>Fields mapped to `users` and `settings` tables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">Multi-factor Authentication</p>
                <p className="text-xs text-slate-500">`users.mfa_enabled` + `settings.multi_factor_enabled`</p>
              </div>
              <Switch
                checked={form.mfaEnabled}
                onCheckedChange={(checked) => setForm({ ...form, mfaEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">Platform Notifications</p>
                <p className="text-xs text-slate-500">`settings.notification_enabled`</p>
              </div>
              <Switch
                checked={form.notificationEnabled}
                onCheckedChange={(checked) => setForm({ ...form, notificationEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-xs text-slate-500">`settings.email_verified`</p>
              </div>
              <Badge variant={settings.emailVerified ? 'default' : 'outline'}>
                {settings.emailVerified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Profit Allocation Policy
          </CardTitle>
          <CardDescription>
            Configure how profits from asset trading are distributed between patients, your hospital, and banks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isProfitLoading ? (
            <div className="flex items-center gap-2 text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading profit settings...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-sm font-medium text-slate-600">Patient Share</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{profitSettings.patientProfitPercent}%</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-sm font-medium text-slate-600">Hospital Share</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{profitSettings.hospitalProfitPercent}%</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-sm font-medium text-slate-600">Bank Share</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{profitSettings.bankProfitPercent}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Patient Profit (%)</Label>
                    <span className="text-sm text-slate-600">{profitSettings.patientProfitPercent}%</span>
                  </div>
                  <Slider
                    value={[profitSettings.patientProfitPercent]}
                    onValueChange={(value) => handleProfitChange('patientProfitPercent', value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">Patients will receive this percentage of trading profits</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Hospital Profit (%)</Label>
                    <span className="text-sm text-slate-600">{profitSettings.hospitalProfitPercent}%</span>
                  </div>
                  <Slider
                    value={[profitSettings.hospitalProfitPercent]}
                    onValueChange={(value) => handleProfitChange('hospitalProfitPercent', value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">Your hospital will retain this percentage of trading profits</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Bank Profit (%)</Label>
                    <span className="text-sm text-slate-600">{profitSettings.bankProfitPercent}%</span>
                  </div>
                  <Slider
                    value={[profitSettings.bankProfitPercent]}
                    onValueChange={(value) => handleProfitChange('bankProfitPercent', value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">Banks will receive this percentage of trading profits</p>
                </div>
              </div>

              <div className={`rounded-lg p-4 flex items-center justify-between border ${
                isProfitValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div>
                  <p className={`font-medium ${
                    isProfitValid ? 'text-green-900' : 'text-red-900'
                  }`}>Total Allocation</p>
                  <p className={`text-sm ${
                    isProfitValid ? 'text-green-700' : 'text-red-700'
                  }`}>{profitTotal.toFixed(2)}%</p>
                </div>
                <span className={`text-lg font-bold ${
                  isProfitValid ? 'text-green-600' : 'text-red-600'
                }`}>{isProfitValid ? '✓' : '✗'}</span>
              </div>

              <Button
                onClick={handleSaveProfitSettings}
                disabled={isProfitSaving || !isProfitValid}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isProfitSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Profit Settings...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profit Settings
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
