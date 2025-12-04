'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star } from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  billing: 'monthly' | 'annually'
  features: string[]
  limits: {
    patients: string
    tokens: string
    support: string
  }
  recommended?: boolean
}

const plans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 499,
    billing: 'monthly',
    features: [
      'Up to 100 patients',
      '10,000 tokens/month',
      'Basic reporting',
      'Email support',
      '1 admin account',
      'Basic KYC verification'
    ],
    limits: {
      patients: '100',
      tokens: '10,000/month',
      support: 'Email (48h response)'
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 999,
    billing: 'monthly',
    recommended: true,
    features: [
      'Up to 500 patients',
      '50,000 tokens/month',
      'Advanced analytics',
      'Priority support',
      '5 admin accounts',
      'Full KYC verification',
      'Custom reports',
      'API access'
    ],
    limits: {
      patients: '500',
      tokens: '50,000/month',
      support: 'Priority (24h response)'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2499,
    billing: 'monthly',
    features: [
      'Unlimited patients',
      'Unlimited tokens',
      'Premium analytics',
      '24/7 dedicated support',
      'Unlimited admin accounts',
      'Advanced KYC verification',
      'Custom integrations',
      'White-label options',
      'SLA guarantee',
      'Dedicated account manager'
    ],
    limits: {
      patients: 'Unlimited',
      tokens: 'Unlimited',
      support: '24/7 Dedicated'
    }
  }
]

const activeSubscriptions = [
  { hospital: 'Metro General Hospital', plan: 'Professional', status: 'active', nextBilling: '2025-01-15', mrr: 999 },
  { hospital: 'City Medical Center', plan: 'Starter', status: 'active', nextBilling: '2025-01-20', mrr: 499 },
  { hospital: 'Regional Health Network', plan: 'Professional', status: 'suspended', nextBilling: '2025-01-10', mrr: 0 },
  { hospital: 'Sunrise Medical Institute', plan: 'Starter', status: 'trial', nextBilling: '2024-12-20', mrr: 0 }
]

export default function BillingPlansPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly')

  const stats = {
    totalMRR: activeSubscriptions.reduce((sum, sub) => sum + sub.mrr, 0),
    activeSubscriptions: activeSubscriptions.filter(s => s.status === 'active').length,
    totalHospitals: activeSubscriptions.length,
    churnRate: '2.3%'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-600 mt-1">Manage pricing tiers and hospital subscriptions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalMRR.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.activeSubscriptions}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Total Hospitals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHospitals}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Churn Rate</p>
              <p className="text-2xl font-bold text-orange-600">{stats.churnRate}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-4 py-2 rounded-lg font-medium ${
            billingCycle === 'monthly' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('annually')}
          className={`px-4 py-2 rounded-lg font-medium ${
            billingCycle === 'annually' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Annually
          <Badge className="ml-2 bg-green-600">Save 20%</Badge>
        </button>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const annualPrice = plan.price * 12 * 0.8
          const displayPrice = billingCycle === 'monthly' ? plan.price : Math.floor(annualPrice / 12)

          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.recommended ? 'border-2 border-cyan-600 shadow-lg' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-cyan-600 gap-1">
                    <Star className="h-3 w-3 fill-white" />
                    Recommended
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{plan.name}</div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">${displayPrice}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  {billingCycle === 'annually' && (
                    <div className="text-sm text-green-600 mt-2">
                      Billed ${Math.floor(annualPrice)} annually
                    </div>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patients:</span>
                      <span className="font-medium text-gray-900">{plan.limits.patients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tokens:</span>
                      <span className="font-medium text-gray-900">{plan.limits.tokens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Support:</span>
                      <span className="font-medium text-gray-900">{plan.limits.support}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className={`w-full ${plan.recommended ? 'bg-cyan-600 hover:bg-cyan-700' : ''}`}
                  variant={plan.recommended ? 'default' : 'outline'}
                >
                  Edit Plan
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeSubscriptions.map((sub, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{sub.hospital}</div>
                  <div className="text-sm text-gray-600">Next billing: {sub.nextBilling}</div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{sub.plan}</Badge>
                  <Badge className={
                    sub.status === 'active' ? 'bg-green-100 text-green-800' :
                    sub.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {sub.status}
                  </Badge>
                  <div className="font-medium text-gray-900 min-w-[80px] text-right">
                    ${sub.mrr}/mo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
