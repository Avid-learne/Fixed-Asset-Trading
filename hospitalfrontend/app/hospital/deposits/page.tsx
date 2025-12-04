// src/app/hospital/deposits/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, CheckCircle, XCircle, Eye, Download } from 'lucide-react'
import { assetService } from '@/services/assetService'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { Asset, DepositStatus } from '@/types'

export default function ApproveDepositsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tokensToMint, setTokensToMint] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await assetService.getAssets({ page: 1, pageSize: 50 })
      setAssets(response.data)
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedAsset || !tokensToMint) return

    try {
      setProcessing(true)
      await assetService.approveAsset(selectedAsset.id, {
        tokensGenerated: parseInt(tokensToMint)
      })
      alert('Asset approved successfully!')
      setSelectedAsset(null)
      setTokensToMint('')
      fetchAssets()
    } catch (error) {
      console.error('Error approving asset:', error)
      alert('Failed to approve asset. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedAsset || !rejectionReason) return

    try {
      setProcessing(true)
      await assetService.rejectAsset(selectedAsset.id, { reason: rejectionReason })
      alert('Asset rejected successfully!')
      setSelectedAsset(null)
      setRejectionReason('')
      fetchAssets()
    } catch (error) {
      console.error('Error rejecting asset:', error)
      alert('Failed to reject asset. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assetType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Approve Deposits</h1>
        <p className="text-muted-foreground mt-1">Review and approve patient asset deposits</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Asset Deposits</CardTitle>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value={DepositStatus.PENDING}>Pending</option>
                <option value={DepositStatus.APPROVED}>Approved</option>
                <option value={DepositStatus.REJECTED}>Rejected</option>
                <option value={DepositStatus.TOKENS_MINTED}>Tokens Minted</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Asset Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Estimated Value</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No assets found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {asset.patientId.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-foreground">{asset.patientId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{asset.assetName}</TableCell>
                    <TableCell className="text-muted-foreground">{asset.assetType}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(asset.estimatedValue)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(asset.submittedAt)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>Asset Details</ModalTitle>
          </ModalHeader>
          {selectedAsset && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
                  <p className="text-foreground mt-1">{selectedAsset.patientId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Asset Type</label>
                  <p className="text-foreground mt-1">{selectedAsset.assetType}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Asset Name</label>
                  <p className="text-foreground mt-1">{selectedAsset.assetName}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-foreground mt-1">{selectedAsset.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estimated Value</label>
                  <p className="text-foreground mt-1 font-semibold">{formatCurrency(selectedAsset.estimatedValue)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Submitted Date</label>
                  <p className="text-foreground mt-1">{formatDate(selectedAsset.submittedAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedAsset.status)}>
                      {selectedAsset.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedAsset.documentUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Supporting Document</label>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Document
                  </Button>
                </div>
              )}

              {selectedAsset.status === DepositStatus.PENDING && (
                <div className="border-t pt-6 space-y-4">
                  <div>
                    <FormField
                      label="Tokens to Mint"
                      type="number"
                      value={tokensToMint}
                      onChange={(e) => setTokensToMint(e.target.value)}
                      placeholder="Enter number of tokens"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Rejection Reason (optional)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                      placeholder="Enter reason for rejection"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          {selectedAsset?.status === DepositStatus.PENDING && (
            <ModalFooter className="space-x-2">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason || processing}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {processing ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleApprove}
                disabled={!tokensToMint || processing}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {processing ? 'Processing...' : 'Approve & Mint'}
              </Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}