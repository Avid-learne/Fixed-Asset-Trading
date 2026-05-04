'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Package, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import {
  subscriptionService,
  type SubscriptionPlan,
} from '@/services/subscriptionService'

interface PlanForm {
  subscriptionName: string
  amountPerMonth: string
  featuresText: string
  monthlyHt: string
}

const emptyForm: PlanForm = {
  subscriptionName: '',
  amountPerMonth: '',
  featuresText: '',
  monthlyHt: '',
}

function planToForm(plan: SubscriptionPlan): PlanForm {
  return {
    subscriptionName: plan.subscriptionName,
    amountPerMonth: String(plan.amountPerMonth),
    featuresText: (plan.features ?? []).join('\n'),
    monthlyHt: String(plan.monthlyHt ?? ''),
  }
}

export default function HospitalAdminSubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PlanForm>(emptyForm)
  const [formError, setFormError] = useState('')

  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null)

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await subscriptionService.getAdminPlans()
      setPlans(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription plans')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  const activePlans = plans.filter((p) => p.isActive)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setShowDialog(true)
  }

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.subsId)
    setForm(planToForm(plan))
    setFormError('')
    setShowDialog(true)
  }

  const handleSave = async () => {
    const { subscriptionName, amountPerMonth, featuresText, monthlyHt } = form
    if (!subscriptionName.trim()) {
      setFormError('Plan name is required')
      return
    }
    const amount = parseFloat(amountPerMonth)
    if (isNaN(amount) || amount <= 0) {
      setFormError('Enter a valid monthly amount')
      return
    }
    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)
    if (features.length === 0) {
      setFormError('Add at least one feature')
      return
    }

    if (!monthlyHt.trim()) {
      setFormError('Monthly HT allocation is required')
      return
    }
    const monthlyHtValue = parseInt(monthlyHt, 10)
    if (isNaN(monthlyHtValue) || monthlyHtValue <= 0) {
      setFormError('Enter a valid monthly HT allocation')
      return
    }
    try {
      setSaving(true)
      setFormError('')
      const payload = { subscriptionName: subscriptionName.trim(), amountPerMonth: amount, features, monthlyHt: monthlyHtValue }
      if (editingId) {
        const updated = await subscriptionService.updatePlan(editingId, payload)
        setPlans((prev) => prev.map((p) => (p.subsId === editingId ? updated : p)))
        setSuccess('Plan updated successfully')
      } else {
        const created = await subscriptionService.createPlan(payload)
        setPlans((prev) => [...prev, created])
        setSuccess('Plan created successfully')
      }
      setShowDialog(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (subsId: string) => {
    try {
      setSaving(true)
      setError('')
      await subscriptionService.deactivatePlan(subsId)
      setPlans((prev) =>
        prev.map((p) => (p.subsId === subsId ? { ...p, isActive: false } : p))
      )
      setSuccess('Plan deactivated')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate plan')
    } finally {
      setSaving(false)
      setConfirmDeactivateId(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage up to 3 active subscription packages for your patients
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadPlans} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={openCreate}
            disabled={activePlans.length >= 3}
            title={activePlans.length >= 3 ? 'You already have 3 active plans' : ''}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Plan
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="mx-auto h-12 w-12 mb-4 opacity-40" />
          <p className="text-lg font-medium">No subscription plans yet</p>
          <p className="text-sm mt-1">Create up to 3 plans that patients can subscribe to</p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Create First Plan
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.subsId} className={plan.isActive ? '' : 'opacity-60'}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{plan.subscriptionName}</CardTitle>
                  <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-primary">
                  PKR {plan.amountPerMonth.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground"> / month</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm space-y-1">
                  {(plan.features ?? []).map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-sm text-muted-foreground">
                  HT allocation: <span className="text-primary font-medium">{plan.monthlyHt} HT / month</span>
                </div>
                {plan.isActive && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => openEdit(plan)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => setConfirmDeactivateId(plan.subsId)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Deactivate
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!saving) setShowDialog(open) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Plan' : 'New Subscription Plan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                placeholder="e.g. Basic Health Plan"
                value={form.subscriptionName}
                onChange={(e) => setForm((f) => ({ ...f, subscriptionName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="planAmount">Monthly Amount (PKR)</Label>
              <Input
                id="planAmount"
                type="number"
                min={1}
                placeholder="e.g. 1500"
                value={form.amountPerMonth}
                onChange={(e) => setForm((f) => ({ ...f, amountPerMonth: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="monthlyHt">Monthly HT Allocation (HT tokens)</Label>
              <Input
                id="monthlyHt"
                type="number"
                min={1}
                placeholder="e.g. 150"
                value={form.monthlyHt}
                onChange={(e) => setForm((f) => ({ ...f, monthlyHt: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">Specify how many HT tokens this plan grants each month (required).</p>
            </div>
            <div>
              <Label htmlFor="planFeatures">
                Features <span className="text-muted-foreground text-xs">(one per line)</span>
              </Label>
              <Textarea
                id="planFeatures"
                rows={5}
                placeholder={"Annual check-up\nLab tests included\n24/7 helpline"}
                value={form.featuresText}
                onChange={(e) => setForm((f) => ({ ...f, featuresText: e.target.value }))}
              />
            </div>
            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editingId ? 'Save Changes' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm deactivate dialog */}
      <Dialog
        open={!!confirmDeactivateId}
        onOpenChange={(open) => { if (!open) setConfirmDeactivateId(null) }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deactivate Plan</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This plan will be deactivated and will no longer be visible to patients. Existing
            subscriptions will not be affected.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeactivateId(null)} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeactivateId && handleDeactivate(confirmDeactivateId)}
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
