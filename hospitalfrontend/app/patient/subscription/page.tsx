'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose, ModalTrigger } from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Check, CreditCard, Calendar, Receipt, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  subscriptionService, 
  SubscriptionPlan as ApiSubscriptionPlan, 
  PatientSubscription,
  PaymentHistory 
} from '@/services/subscriptionService'

export default function SubscriptionPage() {
  const { user } = useAuth()
  const userId = user?.id || (user as any)?.userId
  const [plans, setPlans] = useState<ApiSubscriptionPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<PatientSubscription | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscribing, setSubscribing] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const loadingRef = useRef(false)
  
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<ApiSubscriptionPlan | null>(null)
  const [paymentMode, setPaymentMode] = useState<'subscribe' | 'change'>('subscribe')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')

  // Load data on mount
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    if (loadingRef.current) return // Prevent duplicate calls
    
    loadingRef.current = true
    loadData()
    
    return () => {
      loadingRef.current = false
    }
  }, [userId])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Use timeout for each request
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      )

      const plansPromise = subscriptionService.getPlans().catch((err) => {
        console.error('Error fetching plans:', err)
        return [] // Return empty array on error
      })

      const subscriptionPromise = userId
        ? subscriptionService.getPatientSubscription(userId).catch((err) => {
            console.error('Error fetching subscription:', err)
            return null
          })
        : Promise.resolve(null)

      const historyPromise = userId
        ? subscriptionService.getPaymentHistory(userId).catch((err) => {
            console.error('Error fetching payment history:', err)
            return [] // Return empty array on error
          })
        : Promise.resolve([])

      const [plansData, subscriptionData, historyData] = await Promise.all([
        Promise.race([plansPromise, timeoutPromise]),
        Promise.race([subscriptionPromise, timeoutPromise]),
        Promise.race([historyPromise, timeoutPromise])
      ]) as [ApiSubscriptionPlan[], PatientSubscription | null, PaymentHistory[]]
      
      setPlans(plansData || [])
      setCurrentSubscription(subscriptionData || null)
      setPaymentHistory(historyData || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription data'
      console.error('Error loading subscription data:', err)
      setError(errorMessage)
      
      // Set empty defaults
      setPlans([])
      setCurrentSubscription(null)
      setPaymentHistory([])
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }

  const handleSubscribe = (plan: ApiSubscriptionPlan) => {
    const hasActive = currentSubscription?.status === 'ACTIVE'
    setPaymentMode(hasActive ? 'change' : 'subscribe')
    setSelectedPlan(plan)
    setPaymentOpen(true)
  }

  const handleCancelSubscription = async () => {
    if (!userId) return
    setCancelling(true)
    try {
      const response = await subscriptionService.cancelSubscription(userId)
      if (!response.success) {
        alert(response.message || 'Failed to cancel subscription')
        return
      }
      alert('Subscription cancelled successfully')
      await loadData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  const handlePayment = async () => {
    if (!userId || !selectedPlan) return
    
    setSubscribing(true)
    try {
      const response = paymentMode === 'change'
        ? await subscriptionService.changePlan({
            userId,
            newSubscriptionId: selectedPlan.subsId,
            paymentMethod: 'Credit Card',
            cardNumber: cardNumber,
            expiryDate: expiryDate,
            cvv: cvv,
          })
        : await subscriptionService.subscribe({
            userId,
            subscriptionId: selectedPlan.subsId,
            paymentMethod: 'Credit Card',
            cardNumber: cardNumber,
            expiryDate: expiryDate,
            cvv: cvv,
          })
      
      if (response.success) {
        alert(paymentMode === 'change' ? 'Plan updated successfully!' : 'Subscription successful!')
        setPaymentOpen(false)
        // Reset form
        setCardNumber('')
        setExpiryDate('')
        setCvv('')
        // Reload data
        await loadData()
      } else {
        alert(response.message || (paymentMode === 'change' ? 'Plan change failed' : 'Subscription failed'))
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-warning mb-4" />
          <p className="text-lg font-semibold">Please log in to view subscriptions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Health Subscription Plans</h1>
        <p className="text-muted-foreground">Choose a monthly plan to access health benefits without asset ownership</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Error Loading Subscriptions
            </CardTitle>
            <CardDescription className="text-red-600">
              {error}. <button 
                onClick={loadData} 
                className="underline font-semibold hover:no-underline"
              >
                Try again
              </button>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Subscription Status */}
      {!currentSubscription || currentSubscription.status !== 'ACTIVE' ? (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="text-warning">No Active Subscription</CardTitle>
            <CardDescription>
              You currently don't have an active subscription. Subscribe to a plan below to access health benefits and receive monthly HT allocation.
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
              Your current plan: {currentSubscription.subscriptionName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">End date</p>
                <p className="font-semibold">{new Date(currentSubscription.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly HT allocation</p>
                <p className="font-semibold text-primary">{currentSubscription.htTokens} HT</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={handleCancelSubscription} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.subsId} className={`flex flex-col ${currentSubscription?.subscriptionId === plan.subsId ? 'border-primary' : ''}`}>
            <CardHeader>
              <CardTitle className="text-lg">{plan.subscriptionName}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">Rs. {plan.amountPerMonth.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="p-2 bg-primary/10 rounded-md">
                  <p className="text-xs text-muted-foreground">Monthly HT Tokens</p>
                  <p className="text-lg font-bold text-primary">{plan.htTokens} HT</p>
                </div>
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-auto">
              {currentSubscription?.subscriptionId === plan.subsId && currentSubscription.status === 'ACTIVE' ? (
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button size="sm" className="w-full" onClick={() => handleSubscribe(plan)}>
                  {currentSubscription?.status === 'ACTIVE' ? 'Change Plan' : 'Subscribe Now'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No subscription plans available at the moment.</p>
          </CardContent>
        </Card>
      )}

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
          {paymentHistory.length > 0 ? (
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
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.paymentId}>
                    <TableCell>{new Date(payment.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.subscriptionName}</TableCell>
                    <TableCell className="font-semibold">Rs. {payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        payment.status === 'SUCCESS' ? 'bg-success/10 text-success' :
                        payment.status === 'PENDING' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {payment.status.toLowerCase()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No payment history available.</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Modal open={paymentOpen} onOpenChange={setPaymentOpen}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {paymentMode === 'change' ? 'Confirm Plan Change' : 'Complete Payment'}
            </ModalTitle>
          </ModalHeader>
          {selectedPlan && (
            <div className="space-y-4 p-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">Selected Plan</p>
                <p className="font-semibold">{selectedPlan.subscriptionName}</p>
                <p className="text-xl font-bold mt-2">Rs. {selectedPlan.amountPerMonth.toLocaleString()}/month</p>
                <p className="text-sm text-primary mt-1">Includes {selectedPlan.htTokens} HT monthly</p>
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
                    disabled={subscribing}
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
                      disabled={subscribing}
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
                      disabled={subscribing}
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Your subscription renews monthly. You can cancel anytime.
              </div>
            </div>
          )}
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline" disabled={subscribing}>Cancel</Button>
            </ModalClose>
            <Button onClick={handlePayment} disabled={subscribing}>
              {subscribing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                paymentMode === 'change'
                  ? `Confirm Rs. ${selectedPlan?.amountPerMonth.toLocaleString()}`
                  : `Pay Rs. ${selectedPlan?.amountPerMonth.toLocaleString()}`
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
