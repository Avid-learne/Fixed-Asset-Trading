// src/app/hospital/minting/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal'
import { Coins, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react'
import { assetService } from '@/services/assetService'
import { tokenService } from '@/services/tokenService'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import { Asset, DepositStatus } from '@/types'

export default function TokenMintingPage() {
  const [approvedAssets, setApprovedAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [tokenAmount, setTokenAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [minting, setMinting] = useState(false)

  useEffect(() => {
    fetchApprovedAssets()
  }, [])

  const fetchApprovedAssets = async () => {
    try {
      setLoading(true)
      const response = await assetService.getAssets({ 
        status: DepositStatus.APPROVED, 
        page: 1, 
        pageSize: 50 
      })
      setApprovedAssets(response.data)
    } catch (error) {
      console.error('Error fetching approved assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMintTokens = async () => {
    if (!selectedAsset || !tokenAmount) return

    try {
      setMinting(true)
      await tokenService.mintTokens({
        assetId: selectedAsset.id,
        amount: parseInt(tokenAmount)
      })
      alert('Tokens minted successfully!')
      setSelectedAsset(null)
      setTokenAmount('')
      fetchApprovedAssets()
    } catch (error) {
      console.error('Error minting tokens:', error)
      alert('Failed to mint tokens. Please try again.')
    } finally {
      setMinting(false)
    }
  }

  const calculateRecommendedTokens = (value: number): number => {
    return Math.floor(value * 0.8)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Token Minting</h1>
        <p className="text-gray-500 mt-1">Mint health tokens for approved assets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ready to Mint</CardTitle>
            <Coins className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {approvedAssets.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Approved assets awaiting minting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(approvedAssets.reduce((sum, asset) => sum + asset.estimatedValue, 0))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Combined asset value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Estimated Tokens</CardTitle>
            <CheckCircle className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(approvedAssets.reduce((sum, asset) => sum + calculateRecommendedTokens(asset.estimatedValue), 0))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Tokens to be minted</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approved Assets for Minting</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading assets...</p>
            </div>
          ) : approvedAssets.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No approved assets awaiting minting</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Asset Value</TableHead>
                  <TableHead>Recommended Tokens</TableHead>
                  <TableHead>Approved Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedAssets.map((asset) => {
                  const recommendedTokens = calculateRecommendedTokens(asset.estimatedValue)
                  
                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {asset.patientId.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">{asset.patientId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{asset.assetName}</TableCell>
                      <TableCell className="text-gray-600">{asset.assetType}</TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {formatCurrency(asset.estimatedValue)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Coins className="w-4 h-4 text-accent" />
                          <span className="font-medium text-gray-900">
                            {formatNumber(recommendedTokens)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {asset.approvedAt ? formatDate(asset.approvedAt) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedAsset(asset)
                            setTokenAmount(recommendedTokens.toString())
                          }}
                        >
                          Mint Tokens
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token Minting Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Calculation Method</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Base token value: 80% of asset estimated value
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Tokens are issued as whole numbers
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Additional verification required for high-value assets
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Tokens are immediately credited to patient account
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Quality Assurance</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  All minting transactions are recorded in audit logs
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Bank officer approval required for amounts over PKR 10M
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Real-time notifications sent to patient
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  Compliance checks automated for regulatory adherence
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Mint Tokens</ModalTitle>
          </ModalHeader>
          {selectedAsset && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Patient ID</span>
                  <span className="font-medium text-gray-900">{selectedAsset.patientId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Asset Name</span>
                  <span className="font-medium text-gray-900">{selectedAsset.assetName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Asset Value</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(selectedAsset.estimatedValue)}
                  </span>
                </div>
              </div>

              <FormField
                label="Number of Tokens to Mint"
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="Enter token amount"
              />

              <div className="flex items-start space-x-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Recommended: {formatNumber(calculateRecommendedTokens(selectedAsset.estimatedValue))} tokens</p>
                  <p>This represents 80% of the asset's estimated value, following our standard token calculation policy.</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Asset Value</span>
                  <span className="font-medium">{formatCurrency(selectedAsset.estimatedValue)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tokens to Mint</span>
                  <span className="font-medium">{formatNumber(parseInt(tokenAmount) || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t pt-2">
                  <span className="font-semibold text-gray-900">Token Value Ratio</span>
                  <span className="font-semibold text-gray-900">
                    {((parseInt(tokenAmount) || 0) / selectedAsset.estimatedValue * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedAsset(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMintTokens} 
              disabled={!tokenAmount || parseInt(tokenAmount) <= 0 || minting}
            >
              <Coins className="w-4 h-4 mr-2" />
              {minting ? 'Minting...' : 'Mint Tokens'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}