// src/app/patient/deposit/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Coins, Building2, ArrowRight, CheckCircle, Calculator } from 'lucide-react'
import { useRouter } from 'next/navigation'

type AssetType = 'gold' | 'silver' | ''

const GOLD_RATE_PER_GRAM = 15000 // PKR per gram
const SILVER_RATE_PER_GRAM = 250 // PKR per gram
const TOKEN_RATIO = 100 // 1 AT token = 100 PKR worth of asset

const HOSPITALS = [
  { id: 'h1', name: 'Liaquat National Hospital', location: 'Karachi' },
]

export default function DepositAssetPage() {
  const router = useRouter()
  const [assetType, setAssetType] = useState<AssetType>('')
  const [weight, setWeight] = useState('')
  const [selectedHospital, setSelectedHospital] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const calculateWorth = () => {
    const weightNum = parseFloat(weight)
    if (!weightNum || !assetType) return 0
    return weightNum * (assetType === 'gold' ? GOLD_RATE_PER_GRAM : SILVER_RATE_PER_GRAM)
  }

  const calculateTokens = () => {
    return Math.floor(calculateWorth() / TOKEN_RATIO)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1500)
  }

  const resetForm = () => {
    setAssetType('')
    setWeight('')
    setSelectedHospital('')
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center">
          <CardContent className="pt-12 pb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Request Submitted Successfully!</h2>
            <p className="text-muted-foreground mb-2">
              Your investment request has been sent to the hospital for verification.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              You will receive a notification once the hospital approves your request and mints the AT tokens.
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4">Request Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset Type:</span>
                  <span className="font-medium capitalize">{assetType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="font-medium">{weight} grams</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset Worth:</span>
                  <span className="font-medium">PKR {calculateWorth().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected AT Tokens:</span>
                  <span className="font-semibold text-lg text-primary">{calculateTokens()} AT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hospital:</span>
                  <span className="font-medium">
                    {HOSPITALS.find(h => h.id === selectedHospital)?.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push('/patient/dashboard')}>
                Go to Dashboard
              </Button>
              <Button onClick={resetForm}>
                Submit Another Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deposit Asset</h1>
        <p className="text-muted-foreground mt-1">
          Invest in gold or silver to receive Asset Tokens (AT) backed by physical assets
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Select Asset Type
                </CardTitle>
                <CardDescription>Choose the precious metal you want to invest.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAssetType('gold')}
                    className={`p-6 border-2 rounded-lg text-center transition-all hover:shadow-md ${
                      assetType === 'gold'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-border hover:border-yellow-300'
                    }`}
                  >
                    <div className="text-4xl mb-2" aria-hidden="true">🥇</div>
                    <div className="font-semibold text-lg">Gold</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      PKR {GOLD_RATE_PER_GRAM.toLocaleString()}/gram
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssetType('silver')}
                    className={`p-6 border-2 rounded-lg text-center transition-all hover:shadow-md ${
                      assetType === 'silver'
                        ? 'border-slate-500 bg-slate-50'
                        : 'border-border hover:border-slate-300'
                    }`}
                  >
                    <div className="text-4xl mb-2" aria-hidden="true">🥈</div>
                    <div className="font-semibold text-lg">Silver</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      PKR {SILVER_RATE_PER_GRAM.toLocaleString()}/gram
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Details</CardTitle>
                <CardDescription>Provide how much metal you want to deposit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Weight in grams</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={weight}
                    onChange={event => setWeight(event.target.value)}
                    placeholder="e.g. 25"
                    required
                  />
                </div>

                <div className="rounded-lg border p-4 bg-muted/40 text-sm text-muted-foreground">
                  Asset worth updates automatically using the latest configured rates for gold and silver.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Select Hospital
                </CardTitle>
                <CardDescription>Choose the hospital that will receive your request.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {HOSPITALS.map(hospital => (
                  <button
                    key={hospital.id}
                    type="button"
                    onClick={() => setSelectedHospital(hospital.id)}
                    className={`w-full p-4 rounded-lg border text-left transition hover:shadow-sm ${
                      selectedHospital === hospital.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="font-semibold">{hospital.name}</div>
                    <div className="text-sm text-muted-foreground">{hospital.location}</div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Your selected hospital verifies the asset details you submit.</p>
                <p>Once approved, Asset Tokens (AT) are minted and deposited into your wallet.</p>
                <p>You can redeem or trade tokens once the verification completes.</p>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Investment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Asset Type</span>
                    <span className="font-medium capitalize">{assetType || '—'}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Weight</span>
                    <span className="font-medium">{weight ? `${weight} g` : '—'}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Hospital</span>
                    <span className="font-medium">
                      {selectedHospital ? HOSPITALS.find(h => h.id === selectedHospital)?.name : '—'}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Asset Worth</span>
                    <span className="font-semibold">
                      PKR {calculateWorth().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Estimated AT Tokens</span>
                    <span className="font-semibold text-primary">{calculateTokens()} AT</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={loading || !assetType || !weight || !selectedHospital}
                >
                  {loading ? 'Submitting…' : 'Submit Investment Request'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-sm text-muted-foreground">
                Need help? Contact your hospital representative for guidance on acceptable asset documentation.
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
