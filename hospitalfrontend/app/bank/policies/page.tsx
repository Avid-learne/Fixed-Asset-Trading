// hospitalfrontend/app/bank/policies/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, FileText, Plus, Search, Eye, Download, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatDate, formatCurrency } from '@/lib/utils'

type PolicyStatus = 'active' | 'pending' | 'expired'

interface Policy {
  id: string
  name: string
  description: string
  type: string
  coverage: number
  premium: number
  status: PolicyStatus
  effectiveDate: string
  expiryDate: string
  lastUpdated: string
}

export default function PoliciesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const handleViewPolicy = (policy: Policy) => {
    alert(`Policy Details:\n\nID: ${policy.id}\nName: ${policy.name}\nType: ${policy.type}\nCoverage: $${policy.coverage.toLocaleString()}\nPremium: $${policy.premium.toLocaleString()}/year\nEffective: ${policy.effectiveDate}\nExpiry: ${policy.expiryDate}\n\nIn production, this would open a detailed policy viewer.`)
  }

  const handleDownloadPolicy = (policy: Policy) => {
    alert(`Downloading policy ${policy.id} - ${policy.name}... In production, this would download the policy PDF document.`)
  }

  const handleNewPolicy = () => {
    alert('Opening new policy creation form... In production, this would open a modal with a policy creation form.')
  }

  const policies: Policy[] = [
    {
      id: 'POL-001',
      name: 'Asset Custody Insurance',
      description: 'Comprehensive insurance coverage for physical assets held in bank vaults',
      type: 'Asset Protection',
      coverage: 5000000,
      premium: 25000,
      status: 'active',
      effectiveDate: '2024-01-01',
      expiryDate: '2025-12-31',
      lastUpdated: '2024-12-01'
    },
    {
      id: 'POL-002',
      name: 'Funding Liability Coverage',
      description: 'Protection against defaults on hospital funding agreements backed by asset custody',
      type: 'Financial Risk',
      coverage: 3000000,
      premium: 18000,
      status: 'active',
      effectiveDate: '2024-03-01',
      expiryDate: '2025-02-28',
      lastUpdated: '2024-11-15'
    },
  ]

  const activePolicies = policies.filter(p => p.status === 'active').length
  const pendingPolicies = policies.filter(p => p.status === 'pending').length
  const totalCoverage = policies.reduce((sum, p) => sum + p.coverage, 0)

  const filteredPolicies = policies.filter(policy =>
    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: PolicyStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Expired</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bank Policies</h1>
          <p className="text-muted-foreground mt-1">Manage asset custody and funding insurance policies</p>
        </div>
        <Button onClick={handleNewPolicy}>
          <Plus className="w-4 h-4 mr-2" />
          New Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Policies</CardTitle>
            <Shield className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activePolicies}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <FileText className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingPolicies}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Coverage</CardTitle>
            <Shield className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalCoverage)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all policies</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Policy Directory</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPolicies.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No policies found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPolicies.map((policy) => (
                <Card key={policy.id} className="border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{policy.name}</h3>
                          {getStatusBadge(policy.status)}
                          <Badge variant="outline">{policy.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{policy.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Coverage Amount</p>
                            <p className="text-sm font-semibold text-foreground">{formatCurrency(policy.coverage)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Annual Premium</p>
                            <p className="text-sm font-semibold text-green-600">{formatCurrency(policy.premium)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Effective Date</p>
                            <p className="text-sm font-medium text-foreground">{policy.effectiveDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Expiry Date</p>
                            <p className="text-sm font-medium text-foreground">{policy.expiryDate}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleViewPolicy(policy)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadPolicy(policy)}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}