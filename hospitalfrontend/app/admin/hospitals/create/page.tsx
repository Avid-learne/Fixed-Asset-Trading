'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Building2, User, CreditCard, FileText, ChevronRight, CheckCircle } from 'lucide-react'

type OnboardingStep = 1 | 2 | 3 | 4

export default function CreateHospitalPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [submitting, setSubmitting] = useState(false)

  const [hospitalData, setHospitalData] = useState({
    // Step 1: Hospital Information
    name: '',
    registrationNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    hospitalType: '',
    bedCount: '',
    description: '',

    // Step 2: Admin Account
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    adminConfirmPassword: '',

    // Step 3: Subscription
    subscriptionPlan: '',
    billingCycle: '',
    paymentMethod: '',

    // Step 4: Contract Configuration
    contractWallet: '',
    gasLimit: '',
    maxSupply: ''
  })

  const handleChange = (field: string, value: string) => {
    setHospitalData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as OnboardingStep)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OnboardingStep)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // await adminService.createHospital(hospitalData)
      alert('Hospital onboarded successfully!')
      router.push('/admin/hospitals')
    } catch (error) {
      console.error('Error creating hospital:', error)
      alert('Failed to create hospital. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: 'Hospital Info', icon: Building2 },
    { number: 2, title: 'Admin Account', icon: User },
    { number: 3, title: 'Subscription', icon: CreditCard },
    { number: 4, title: 'Contract Setup', icon: FileText }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Onboard New Hospital</h1>
        <p className="text-gray-600 mt-1">Complete the 4-step process to add a new hospital to the platform</p>
      </div>

      {/* Progress Stepper */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${currentStep === step.number ? 'bg-cyan-600 text-white' : 
                      currentStep > step.number ? 'bg-green-600 text-white' : 
                      'bg-gray-200 text-gray-600'}
                  `}>
                    {currentStep > step.number ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">Step {step.number} of 4</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep - 1].icon, { className: 'h-5 w-5 text-cyan-600' })}
            {steps[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Hospital Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Hospital Name *</Label>
                  <Input
                    value={hospitalData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="General Hospital"
                  />
                </div>

                <div>
                  <Label>Registration Number *</Label>
                  <Input
                    value={hospitalData.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    placeholder="REG-12345"
                  />
                </div>

                <div>
                  <Label>Hospital Type *</Label>
                  <Select value={hospitalData.hospitalType} onValueChange={(v) => handleChange('hospitalType', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Hospital</SelectItem>
                      <SelectItem value="specialty">Specialty Hospital</SelectItem>
                      <SelectItem value="teaching">Teaching Hospital</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Address *</Label>
                  <Input
                    value={hospitalData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <Label>City *</Label>
                  <Input
                    value={hospitalData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="New York"
                  />
                </div>

                <div>
                  <Label>State/Province *</Label>
                  <Input
                    value={hospitalData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="NY"
                  />
                </div>

                <div>
                  <Label>ZIP Code *</Label>
                  <Input
                    value={hospitalData.zipCode}
                    onChange={(e) => handleChange('zipCode', e.target.value)}
                    placeholder="10001"
                  />
                </div>

                <div>
                  <Label>Country *</Label>
                  <Input
                    value={hospitalData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="United States"
                  />
                </div>

                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={hospitalData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={hospitalData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contact@hospital.com"
                  />
                </div>

                <div>
                  <Label>Website</Label>
                  <Input
                    value={hospitalData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://hospital.com"
                  />
                </div>

                <div>
                  <Label>Bed Count *</Label>
                  <Input
                    type="number"
                    value={hospitalData.bedCount}
                    onChange={(e) => handleChange('bedCount', e.target.value)}
                    placeholder="500"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={hospitalData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Brief description of the hospital..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Admin Account */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Create the primary administrator account for this hospital. This user will have full control over the hospital's operations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={hospitalData.adminFirstName}
                    onChange={(e) => handleChange('adminFirstName', e.target.value)}
                    placeholder="John"
                  />
                </div>

                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={hospitalData.adminLastName}
                    onChange={(e) => handleChange('adminLastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={hospitalData.adminEmail}
                    onChange={(e) => handleChange('adminEmail', e.target.value)}
                    placeholder="admin@hospital.com"
                  />
                </div>

                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={hospitalData.adminPhone}
                    onChange={(e) => handleChange('adminPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={hospitalData.adminPassword}
                    onChange={(e) => handleChange('adminPassword', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <Label>Confirm Password *</Label>
                  <Input
                    type="password"
                    value={hospitalData.adminConfirmPassword}
                    onChange={(e) => handleChange('adminConfirmPassword', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Subscription */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:border-cyan-600 transition-colors">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="font-bold text-lg">Starter</h3>
                      <p className="text-3xl font-bold text-cyan-600 my-2">$499</p>
                      <p className="text-sm text-gray-600">per month</p>
                      <ul className="mt-4 space-y-2 text-sm text-gray-600">
                        <li>• Up to 100 patients</li>
                        <li>• 10,000 tokens/month</li>
                        <li>• Basic support</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer border-cyan-600 border-2 relative">
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-600">Recommended</Badge>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="font-bold text-lg">Professional</h3>
                      <p className="text-3xl font-bold text-cyan-600 my-2">$999</p>
                      <p className="text-sm text-gray-600">per month</p>
                      <ul className="mt-4 space-y-2 text-sm text-gray-600">
                        <li>• Up to 500 patients</li>
                        <li>• 50,000 tokens/month</li>
                        <li>• Priority support</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-cyan-600 transition-colors">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="font-bold text-lg">Enterprise</h3>
                      <p className="text-3xl font-bold text-cyan-600 my-2">Custom</p>
                      <p className="text-sm text-gray-600">contact us</p>
                      <ul className="mt-4 space-y-2 text-sm text-gray-600">
                        <li>• Unlimited patients</li>
                        <li>• Unlimited tokens</li>
                        <li>• 24/7 support</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Selected Plan *</Label>
                  <Select value={hospitalData.subscriptionPlan} onValueChange={(v) => handleChange('subscriptionPlan', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter - $499/month</SelectItem>
                      <SelectItem value="professional">Professional - $999/month</SelectItem>
                      <SelectItem value="enterprise">Enterprise - Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Billing Cycle *</Label>
                  <Select value={hospitalData.billingCycle} onValueChange={(v) => handleChange('billingCycle', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly (10% off)</SelectItem>
                      <SelectItem value="annually">Annually (20% off)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Payment Method *</Label>
                  <Select value={hospitalData.paymentMethod} onValueChange={(v) => handleChange('paymentMethod', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="invoice">Invoice (NET 30)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contract Configuration */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Configure blockchain contract parameters. These settings will be used for token minting and trading operations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Contract Wallet Address *</Label>
                  <Input
                    value={hospitalData.contractWallet}
                    onChange={(e) => handleChange('contractWallet', e.target.value)}
                    placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                  />
                  <p className="text-xs text-gray-600 mt-1">The Ethereum wallet address for this hospital's smart contract</p>
                </div>

                <div>
                  <Label>Gas Limit</Label>
                  <Input
                    value={hospitalData.gasLimit}
                    onChange={(e) => handleChange('gasLimit', e.target.value)}
                    placeholder="300000"
                  />
                  <p className="text-xs text-gray-600 mt-1">Default: 300000</p>
                </div>

                <div>
                  <Label>Max Token Supply</Label>
                  <Input
                    type="number"
                    value={hospitalData.maxSupply}
                    onChange={(e) => handleChange('maxSupply', e.target.value)}
                    placeholder="10000000"
                  />
                  <p className="text-xs text-gray-600 mt-1">Maximum tokens that can be minted</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-gray-900">Review Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Hospital:</div>
                  <div className="font-medium">{hospitalData.name || 'Not set'}</div>
                  
                  <div className="text-gray-600">Admin Email:</div>
                  <div className="font-medium">{hospitalData.adminEmail || 'Not set'}</div>
                  
                  <div className="text-gray-600">Subscription:</div>
                  <div className="font-medium">{hospitalData.subscriptionPlan || 'Not selected'}</div>
                  
                  <div className="text-gray-600">Wallet:</div>
                  <div className="font-medium text-xs">{hospitalData.contractWallet || 'Not set'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || submitting}
            >
              Back
            </Button>
            {currentStep < 4 ? (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                {submitting ? 'Creating Hospital...' : 'Complete Onboarding'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
