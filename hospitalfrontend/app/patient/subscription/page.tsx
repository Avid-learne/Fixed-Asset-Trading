'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose, ModalTrigger } from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Check, CreditCard, Calendar, Receipt } from 'lucide-react'

type SubscriptionPlan = {
  id: string
  name: string
  price: number
  benefits: string[]
  htTokens: number
}

type PaymentHistory = {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  plan: string
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Health Plan',
    price: 50000,
    htTokens: 100,
    benefits: [
      'Access to basic health benefits',
      '100 HT monthly allocation',
      'General checkup coverage',
      'Basic dental care',
      'Prescription discounts'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Health Plan',
    price: 100000,
    htTokens: 250,
    benefits: [
      'All Basic plan benefits',
      '250 HT monthly allocation',
      'Specialist consultations',
      'Advanced dental procedures',
      'Laboratory tests coverage',
      'Emergency care priority'
    ]
  },
  {
    id: 'family',
    name: 'Family Health Plan',
    price: 300000,
    htTokens: 500,
    benefits: [
      'All Premium plan benefits',
      '500 HT monthly allocation',
      'Family coverage (up to 4 members)',
      'Pediatric care',
      'Maternity benefits',
      'Annual health screening'
    ]
  }
]

const MOCK_PAYMENT_HISTORY: PaymentHistory[] = [
  { id: '1', date: '2025-12-01', amount: 10000, status: 'paid', plan: 'Basic Health Plan' },
  { id: '2', date: '2025-11-01', amount: 10000, status: 'paid', plan: 'Basic Health Plan' },
  { id: '3', date: '2025-10-01', amount: 10000, status: 'paid', plan: 'Basic Health Plan' },
]

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setPaymentOpen(true)
  }

  const handlePayment = () => {
    console.log('Processing payment for', selectedPlan?.name)
    // Process payment logic here
    setCurrentPlan(selectedPlan?.id || null)
    setPaymentOpen(false)
    // Reset form
    setCardNumber('')
    setExpiryDate('')
    setCvv('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Health Subscription Plans</h1>
        <p className="text-muted-foreground">Choose a yearly plan to access health benefits without asset ownership</p>
      </div>

      {/* Subscription Status */}
      {!currentPlan ? (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="text-warning">No Active Subscription</CardTitle>
            <CardDescription>
              You currently don't have an active subscription. Subscribe to a plan below to access health benefits and receive annual HT tokens.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              Active Subscription
            </CardTitle>
            <CardDescription>
              Your current plan: {SUBSCRIPTION_PLANS.find(p => p.id === currentPlan)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next billing date</p>
                <p className="font-semibold">January 1, 2026</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Annual HT allocation</p>
                <p className="font-semibold text-primary">{SUBSCRIPTION_PLANS.find(p => p.id === currentPlan)?.htTokens} HT</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card key={plan.id} className={`flex flex-col ${currentPlan === plan.id ? 'border-primary' : ''}`}>
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">Rs. {plan.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/year</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="p-2 bg-primary/10 rounded-md">
                  <p className="text-xs text-muted-foreground">Annual HT Tokens</p>
                  <p className="text-lg font-bold text-primary">{plan.htTokens} HT</p>
                </div>
                <div className="space-y-2">
                  {plan.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-auto">
              {currentPlan === plan.id ? (
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button size="sm" className="w-full" onClick={() => handleSubscribe(plan)}>
                  {currentPlan ? 'Switch Plan' : 'Subscribe Now'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Payment History
          </CardTitle>
          <CardDescription>Your subscription payment records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PAYMENT_HISTORY.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.plan}</TableCell>
                  <TableCell className="font-semibold">Rs. {payment.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      payment.status === 'paid' ? 'bg-success/10 text-success' :
                      payment.status === 'pending' ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {payment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Modal open={paymentOpen} onOpenChange={setPaymentOpen}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Complete Payment
            </ModalTitle>
          </ModalHeader>
          {selectedPlan && (
            <div className="space-y-4 p-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">Selected Plan</p>
                <p className="font-semibold">{selectedPlan.name}</p>
                <p className="text-xl font-bold mt-2">Rs. {selectedPlan.price.toLocaleString()}/year</p>
                <p className="text-sm text-primary mt-1">Includes {selectedPlan.htTokens} HT annually</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Card Number</label>
                  <Input 
                    value={cardNumber} 
                    onChange={(e) => setCardNumber(e.target.value)} 
                    placeholder="1234 5678 9012 3456" 
                    className="mt-1"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Expiry Date</label>
                    <Input 
                      value={expiryDate} 
                      onChange={(e) => setExpiryDate(e.target.value)} 
                      placeholder="MM/YY" 
                      className="mt-1"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">CVV</label>
                    <Input 
                      value={cvv} 
                      onChange={(e) => setCvv(e.target.value)} 
                      placeholder="123" 
                      className="mt-1"
                      maxLength={3}
                      type="password"
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Your subscription will auto-renew yearly. You can cancel anytime.
              </div>
            </div>
          )}
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline">Cancel</Button>
            </ModalClose>
            <Button onClick={handlePayment}>Pay Rs. {selectedPlan?.price.toLocaleString()}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
