// src/app/patient/benefits/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal'
import { Gift, Coins, Calendar, CheckCircle } from 'lucide-react'
import { benefitService } from '@/services/benefitService'
import { tokenService } from '@/services/tokenService'
import { formatNumber, formatDate } from '@/lib/utils'
import { Benefit, TokenBalance } from '@/types'

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null)
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [benefitsRes, balanceRes] = await Promise.all([
        benefitService.getBenefits(),
        tokenService.getBalance()
      ])

      setBenefits(benefitsRes.data)
      setTokenBalance(balanceRes.data)
    } catch (error) {
      console.error('Error fetching benefits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async () => {
    if (!selectedBenefit) return

    try {
      setRedeeming(true)
      await benefitService.redeemBenefit(selectedBenefit.id)
      alert('Benefit redeemed successfully!')
      setSelectedBenefit(null)
      fetchData()
    } catch (error) {
      console.error('Error redeeming benefit:', error)
      alert('Failed to redeem benefit. Please try again.')
    } finally {
      setRedeeming(false)
    }
  }

  const filteredBenefits = filter === 'all' 
    ? benefits 
    : benefits.filter(b => b.category === filter)

  const categories = ['all', ...Array.from(new Set(benefits.map(b => b.category)))]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Benefits</h1>
          <p className="text-gray-500 mt-1">Redeem your health tokens for exclusive benefits</p>
        </div>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-accent" />
            <div>
              <p className="text-xs text-gray-500">Available Tokens</p>
              <p className="text-xl font-bold text-gray-900">
                {formatNumber(tokenBalance?.availableTokens || 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === category
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBenefits.map((benefit) => {
          const canAfford = (tokenBalance?.availableTokens || 0) >= benefit.tokenCost
          
          return (
            <Card key={benefit.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{benefit.name}</CardTitle>
                    <Badge className="mt-2">{benefit.category}</Badge>
                  </div>
                  <Gift className="w-8 h-8 text-accent" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{benefit.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Cost</span>
                    <span className="font-semibold text-gray-900 flex items-center">
                      <Coins className="w-4 h-4 mr-1 text-accent" />
                      {formatNumber(benefit.tokenCost)} tokens
                    </span>
                  </div>
                  
                  {benefit.expiresAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Expires</span>
                      <span className="text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(benefit.expiresAt)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <Badge variant={benefit.available ? 'success' : 'error'}>
                      {benefit.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedBenefit(benefit)}
                  disabled={!benefit.available || !canAfford}
                  className="w-full"
                  variant={canAfford ? 'default' : 'outline'}
                >
                  {!canAfford ? 'Insufficient Tokens' : 'Redeem Now'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredBenefits.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No benefits available in this category</p>
          </CardContent>
        </Card>
      )}

      <Modal open={!!selectedBenefit} onOpenChange={() => setSelectedBenefit(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Redeem Benefit</ModalTitle>
          </ModalHeader>
          {selectedBenefit && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{selectedBenefit.name}</h3>
                <Badge className="mt-2">{selectedBenefit.category}</Badge>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">{selectedBenefit.description}</p>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Token Cost</span>
                  <span className="font-semibold flex items-center">
                    <Coins className="w-4 h-4 mr-1 text-accent" />
                    {formatNumber(selectedBenefit.tokenCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Your Balance</span>
                  <span className="font-semibold">
                    {formatNumber(tokenBalance?.availableTokens || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="font-semibold text-gray-900">Balance After</span>
                  <span className="font-semibold text-gray-900">
                    {formatNumber((tokenBalance?.availableTokens || 0) - selectedBenefit.tokenCost)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  By redeeming this benefit, the tokens will be deducted from your account immediately.
                </p>
              </div>

              <div className="text-xs text-gray-500">
                <p className="font-medium mb-1">Terms & Conditions:</p>
                <p>{selectedBenefit.terms}</p>
              </div>
            </div>
          )}
          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedBenefit(null)}>
              Cancel
            </Button>
            <Button onClick={handleRedeem} loading={redeeming}>
              Confirm Redemption
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}