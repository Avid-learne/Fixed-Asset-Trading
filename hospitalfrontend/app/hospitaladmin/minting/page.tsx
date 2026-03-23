'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Coins, Search, CheckCircle, Clock, AlertCircle, Filter, Loader2, RefreshCw } from 'lucide-react'
import { depositRequestService, type AssetDepositItem } from '@/services/depositRequestService'
import { useToast } from '@/hooks/use-toast'

interface MintRecord {
  id: string
  depositId: string
  patientId: string
  patientName: string
  patientEmail: string
  assetType: string
  weight: number
  assetValue: number
  tokensMinted: number
  status: 'pending' | 'minted' | 'processing' | 'failed'
  mintedDate?: string
  submittedAt: string
  bankApprovalStatus?: string
  rejectionReason?: string
  bankRejectionReason?: string
  hospitalName: string
}

const toNumber = (value: number | string | undefined | null) => Number(value || 0)

const mapToMintRecord = (item: AssetDepositItem): MintRecord => {
  const requestStatus = (item.status || '').toLowerCase()
  const bankStatus = (item.bankApprovalStatus || '').toLowerCase()

  let status: MintRecord['status'] = 'pending'
  if (requestStatus === 'approved' && bankStatus === 'approved') {
    status = 'minted'
  } else if (requestStatus === 'approved' && bankStatus === 'pending') {
    status = 'processing'
  } else if (requestStatus === 'approved' && bankStatus === 'rejected') {
    status = 'failed'
  } else if (requestStatus === 'rejected') {
    status = 'failed'
  }

  return {
    id: item.assetId,
    depositId: item.assetId,
    patientId: item.patientId,
    patientName: item.patientName,
    patientEmail: item.patientEmail,
    assetType: item.assetType,
    weight: toNumber(item.weight),
    assetValue: toNumber(item.assetValue),
    tokensMinted: toNumber(item.expectedTokens),
    status,
    mintedDate: item.bankApprovedAt,
    submittedAt: item.submittedAt,
    bankApprovalStatus: item.bankApprovalStatus,
    rejectionReason: item.rejectionReason,
    bankRejectionReason: item.bankRejectionReason,
    hospitalName: item.hospitalName,
  }
}

const canForwardToMinting = (record: MintRecord): boolean => {
  const bankStatus = (record.bankApprovalStatus || '').toLowerCase()
  return record.status === 'pending' && !bankStatus
}

export default function MintingPage() {
  const { toast } = useToast()
  const [records, setRecords] = useState<MintRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [minting, setMinting] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [showBatchMint, setShowBatchMint] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MintRecord | null>(null)

  const loadRecords = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await depositRequestService.getHospitalRequests('all')
      setRecords(data.map(mapToMintRecord))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load minting data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.depositId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(filteredRecords.filter(canForwardToMinting).map(r => r.id))
    } else {
      setSelectedRecords([])
    }
  }

  const handleSelectRecord = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRecords([...selectedRecords, id])
    } else {
      setSelectedRecords(selectedRecords.filter(r => r !== id))
    }
  }

  const handleBatchMint = async () => {
    if (selectedRecords.length === 0) {
      return
    }

    try {
      setMinting(true)
      setError('')
      await Promise.all(selectedRecords.map((id) => depositRequestService.approve(id)))
      setSelectedRecords([])
      setShowBatchMint(false)
      toast({
        title: 'Forwarded to minting queue',
        description: 'Selected deposits were approved and forwarded for bank minting.',
      })
      await loadRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to forward selected records for minting')
    } finally {
      setMinting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'minted':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-muted text-foreground'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'minted':
        return <CheckCircle className="w-4 h-4" />
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'failed':
        return <AlertCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const pendingRecords = records.filter(canForwardToMinting)
  const totalTokensMinted = records.filter(r => r.status === 'minted').reduce((sum, record) => sum + record.tokensMinted, 0)
  const totalValue = records.filter(r => r.status === 'minted').reduce((sum, record) => sum + record.assetValue, 0)
  const selectedTotalTokens = records.filter(r => selectedRecords.includes(r.id)).reduce((sum, r) => sum + r.tokensMinted, 0)
  const selectedTotalValue = records.filter(r => selectedRecords.includes(r.id)).reduce((sum, r) => sum + r.assetValue, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Token Minting</h1>
          <p className="text-muted-foreground mt-1">Forward approved deposits into minting queue and track bank-approved minted tokens.</p>
        </div>
        {selectedRecords.length > 0 && (
          <Button className="gap-2" onClick={() => setShowBatchMint(true)}>
            <Coins className="w-4 h-4" />
            Forward Selected ({selectedRecords.length})
          </Button>
        )}
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Total Tokens Minted
              <Coins className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalTokensMinted.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">{records.filter(r => r.status === 'minted').length} assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Total Asset Value
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">PKR {(totalValue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground mt-1">Successfully minted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Pending Queue
              <Clock className="w-4 h-4 text-yellow-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{pendingRecords.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Awaiting minting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
              Processing
              <Loader2 className="w-4 h-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{records.filter(r => r.status === 'processing').length}</p>
            <p className="text-sm text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={loadRecords} disabled={loading || minting}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Minting Queue</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="minted">Minted</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedRecords.length === filteredRecords.filter(canForwardToMinting).length && filteredRecords.filter(canForwardToMinting).length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Deposit ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Asset Type</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead className="text-right">Asset Value (PKR)</TableHead>
                <TableHead className="text-right">AT Tokens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedRecords.includes(record.id)}
                        onCheckedChange={(checked) => handleSelectRecord(record.id, checked as boolean)}
                        disabled={!canForwardToMinting(record)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{record.depositId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.patientName}</p>
                        <p className="text-xs text-muted-foreground">{record.patientEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        record.assetType === 'Gold' 
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }>
                        {record.assetType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{record.weight}g</TableCell>
                    <TableCell className="text-right font-medium">{record.assetValue.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-accent">{record.tokensMinted.toLocaleString()} AT</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`gap-1 ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {canForwardToMinting(record) && (
                          <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => {
                            setSelectedRecords([record.id])
                            setShowBatchMint(true)
                          }}>
                            Forward
                          </Button>
                        )}
                        {(record.status === 'minted' || record.status === 'processing' || record.status === 'failed') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedRecord(record)
                              setShowDetails(true)
                            }}
                          >
                            View Details
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showBatchMint} onOpenChange={setShowBatchMint}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Forwarding to Minting Queue</DialogTitle>
            <DialogDescription>
              Selected pending requests will be hospital-approved and forwarded to bank for minting.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Selected Records</p>
                <p className="text-2xl font-bold">{selectedRecords.length}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Asset Value</p>
                <p className="text-2xl font-bold">PKR {selectedTotalValue.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-4 border-2 border-primary bg-primary/5 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Tokens Expected for Minting</p>
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">{selectedTotalTokens.toLocaleString()} AT</p>
              <p className="text-sm text-muted-foreground mt-1">Final minting occurs after bank approval</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Approval Pipeline</p>
                <p className="text-xs text-blue-700 mt-1">
                  This page uses backend workflow: hospital approval forwards the request, and minting is completed when bank approves.
                </p>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.filter(r => selectedRecords.includes(r.id)).map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.patientName}</TableCell>
                      <TableCell className="text-right">{r.tokensMinted.toLocaleString()} AT</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchMint(false)} disabled={minting}>
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90" 
              onClick={handleBatchMint}
              disabled={minting}
            >
              {minting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Forwarding...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Confirm Forwarding
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Minting Record Details</DialogTitle>
            <DialogDescription>
              Backend status for this request in the minting pipeline
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedRecord.status === 'minted' ? <CheckCircle className="w-8 h-8 text-green-600" /> : <Clock className="w-8 h-8 text-amber-600" />}
                  <div>
                    <p className="font-semibold text-slate-900">{selectedRecord.status === 'minted' ? 'Minting Completed' : 'Minting In Progress'}</p>
                    <p className="text-sm text-slate-600">Current backend state: {selectedRecord.status}</p>
                  </div>
                </div>
                <Badge className={selectedRecord.status === 'minted' ? 'bg-green-600' : 'bg-amber-600'}>
                  {selectedRecord.status === 'minted' ? 'Completed' : 'Pending Bank'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
                  <p className="text-sm font-medium">{selectedRecord.patientName}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Patient Email</label>
                  <p className="text-sm">{selectedRecord.patientEmail}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Deposit ID</label>
                  <p className="text-sm font-mono">{selectedRecord.depositId}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Submitted Date</label>
                  <p className="text-sm">{new Date(selectedRecord.submittedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Asset Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset Type:</span>
                    <Badge variant="outline" className={
                      selectedRecord.assetType.toUpperCase() === 'GOLD' 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }>
                      {selectedRecord.assetType}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="font-medium">{selectedRecord.weight} grams</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset Value:</span>
                    <span className="font-medium">PKR {selectedRecord.assetValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hospital:</span>
                    <span className="font-medium">{selectedRecord.hospitalName}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-2 border-accent bg-accent/5 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Tokens</p>
                    <p className="text-3xl font-bold text-accent mt-1">{selectedRecord.tokensMinted.toLocaleString()} AT</p>
                  </div>
                  <Coins className="w-12 h-12 text-accent" />
                </div>
                <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                  Token Ratio: 1 AT = 100 PKR
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hospital Approval:</span>
                  <span className="font-medium">{selectedRecord.status === 'pending' ? 'Pending' : 'Approved'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank Approval:</span>
                  <span className="font-medium">{selectedRecord.bankApprovalStatus || 'Not forwarded'}</span>
                </div>
                {selectedRecord.mintedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minted At:</span>
                    <span className="font-medium">{new Date(selectedRecord.mintedDate).toLocaleString()}</span>
                  </div>
                )}
                {selectedRecord.rejectionReason && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Hospital Rejection:</span>
                    <span className="font-medium text-right">{selectedRecord.rejectionReason}</span>
                  </div>
                )}
                {selectedRecord.bankRejectionReason && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Bank Rejection:</span>
                    <span className="font-medium text-right">{selectedRecord.bankRejectionReason}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
