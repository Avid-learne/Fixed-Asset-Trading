'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Banknote, Building2, Shield, FileText } from 'lucide-react'

export default function CreateBankPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    swiftCode: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    regulatoryLicense: '',
    complianceOfficerName: '',
    complianceOfficerEmail: '',
    description: ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // await adminService.createBank(formData)
      alert('Bank partner registered successfully!')
      router.push('/admin/banks')
    } catch (error) {
      console.error('Error creating bank:', error)
      alert('Failed to create bank. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Register New Bank Partner</h1>
        <p className="text-gray-600 mt-1">Add a new custodian bank to the platform</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-cyan-600" />
            Bank Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Bank Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Capital Trust Bank"
              />
            </div>

            <div>
              <Label>SWIFT Code *</Label>
              <Input
                value={formData.swiftCode}
                onChange={(e) => handleChange('swiftCode', e.target.value)}
                placeholder="CTBKUS33"
              />
            </div>

            <div>
              <Label>Regulatory License *</Label>
              <Input
                value={formData.regulatoryLicense}
                onChange={(e) => handleChange('regulatoryLicense', e.target.value)}
                placeholder="LIC-12345"
              />
            </div>

            <div className="col-span-2">
              <Label>Address *</Label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="456 Financial Avenue"
              />
            </div>

            <div>
              <Label>City *</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="New York"
              />
            </div>

            <div>
              <Label>State/Province *</Label>
              <Input
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="NY"
              />
            </div>

            <div>
              <Label>ZIP Code *</Label>
              <Input
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                placeholder="10002"
              />
            </div>

            <div>
              <Label>Country *</Label>
              <Input
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="United States"
              />
            </div>

            <div>
              <Label>Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 987-6543"
              />
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="info@capitaltrustbank.com"
              />
            </div>

            <div>
              <Label>Website</Label>
              <Input
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://capitaltrustbank.com"
              />
            </div>

            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the bank..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Compliance Officer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Officer Name *</Label>
              <Input
                value={formData.complianceOfficerName}
                onChange={(e) => handleChange('complianceOfficerName', e.target.value)}
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <Label>Officer Email *</Label>
              <Input
                type="email"
                value={formData.complianceOfficerEmail}
                onChange={(e) => handleChange('complianceOfficerEmail', e.target.value)}
                placeholder="compliance@capitaltrustbank.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting} className="bg-cyan-600 hover:bg-cyan-700">
          {submitting ? 'Registering Bank...' : 'Register Bank'}
        </Button>
      </div>
    </div>
  )
}
