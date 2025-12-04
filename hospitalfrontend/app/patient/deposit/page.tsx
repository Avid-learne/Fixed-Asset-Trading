// src/app/patient/deposit/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Stepper, Step } from '@/components/ui/Stepper'
import { Upload, FileText, DollarSign } from 'lucide-react'
import { assetService } from '@/services/assetService'
import { useRouter } from 'next/navigation'

const steps: Step[] = [
  { id: 'details', label: 'Asset Details' },
  { id: 'upload', label: 'Upload Documents' },
  { id: 'review', label: 'Review & Submit' },
  { id: 'complete', label: 'Complete' },
]

export default function DepositAssetPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    assetType: '',
    assetName: '',
    description: '',
    estimatedValue: '',
    file: null as File | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }))
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }))
      }
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 0) {
      if (!formData.assetType) newErrors.assetType = 'Asset type is required'
      if (!formData.assetName) newErrors.assetName = 'Asset name is required'
      if (!formData.description) newErrors.description = 'Description is required'
      if (!formData.estimatedValue) newErrors.estimatedValue = 'Estimated value is required'
      else if (parseFloat(formData.estimatedValue) <= 0) newErrors.estimatedValue = 'Value must be greater than 0'
    }

    if (step === 1) {
      if (!formData.file) newErrors.file = 'Document upload is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(1)) return

    try {
      setLoading(true)
      const data = new FormData()
      data.append('assetType', formData.assetType)
      data.append('assetName', formData.assetName)
      data.append('description', formData.description)
      data.append('estimatedValue', formData.estimatedValue)
      if (formData.file) {
        data.append('document', formData.file)
      }

      await assetService.createAsset(data)
      setCurrentStep(3)
      setTimeout(() => {
        router.push('/patient/history')
      }, 2000)
    } catch (error) {
      console.error('Error submitting asset:', error)
      alert('Failed to submit asset. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Deposit Asset</h1>
        <p className="text-gray-500 mt-1">Submit your physical assets to receive health tokens</p>
      </div>

      <Card>
        <CardHeader>
          <Stepper steps={steps} currentStep={currentStep} />
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Type
                </label>
                <select
                  name="assetType"
                  value={formData.assetType}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select asset type</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="electronics">Electronics</option>
                  <option value="collectibles">Collectibles</option>
                  <option value="other">Other</option>
                </select>
                {errors.assetType && <p className="mt-1 text-sm text-error">{errors.assetType}</p>}
              </div>

              <FormField
                label="Asset Name"
                name="assetName"
                value={formData.assetName}
                onChange={handleInputChange as any}
                placeholder="Enter asset name"
              />
              {errors.assetName && <p className="mt-1 text-sm text-error">{errors.assetName}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Provide detailed description of the asset"
                />
                {errors.description && <p className="mt-1 text-sm text-error">{errors.description}</p>}
              </div>

              <FormField
                label="Estimated Value (USD)"
                name="estimatedValue"
                type="number"
                value={formData.estimatedValue}
                onChange={handleInputChange as any}
                placeholder="0.00"
              />
              {errors.estimatedValue && <p className="mt-1 text-sm text-error">{errors.estimatedValue}</p>}

              <div className="flex justify-end">
                <Button onClick={handleNext}>Next</Button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">Upload supporting documents</p>
                <p className="text-xs text-gray-500 mb-4">PDF, JPG, PNG up to 10MB</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                    Choose File
                  </Button>
                </label>
                {formData.file && (
                  <p className="text-sm text-gray-700 mt-4">
                    <FileText className="w-4 h-4 inline mr-2" />
                    {formData.file.name}
                  </p>
                )}
                {errors.file && <p className="mt-2 text-sm text-error">{errors.file}</p>}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>Back</Button>
                <Button onClick={handleNext}>Next</Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Review Your Submission</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Asset Type</p>
                    <p className="font-medium text-gray-900">{formData.assetType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Asset Name</p>
                    <p className="font-medium text-gray-900">{formData.assetName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-medium text-gray-900">{formData.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Value</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <DollarSign className="w-4 h-4" />
                      {parseFloat(formData.estimatedValue).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Document</p>
                    <p className="font-medium text-gray-900">{formData.file?.name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Your asset will be reviewed by hospital staff. You will receive a notification once it is approved and tokens are minted to your account.
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>Back</Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting…' : 'Submit Asset'}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Asset Submitted Successfully</h3>
              <p className="text-gray-600 mb-6">
                Your asset has been submitted for review. You will be notified once it is processed.
              </p>
              <Button onClick={() => router.push('/patient')}>Back to Dashboard</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}