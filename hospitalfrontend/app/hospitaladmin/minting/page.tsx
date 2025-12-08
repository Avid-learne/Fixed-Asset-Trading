'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Coins, Search, Plus, CheckCircle, Clock, AlertCircle, Filter, Loader2 } from 'lucide-react'

interface MintRecord {
  id: string
  depositId: string
  patientId: string
  patientName: string
  patientEmail: string
  assetType: 'Gold' | 'Silver'
  weight: number // in grams
  assetValue: number // in PKR
  tokensMinted: number // AT tokens
  status: 'pending' | 'minted' | 'processing' | 'failed'
  mintedDate: string
  txHash?: string
  hospitalName: string
}

const mockMintRecords: MintRecord[] = [
  { 
    id: 'MINT-001', 
    depositId: 'DEP-1001', 
    patientId: 'PAT-001', 
    patientName: 'John Patient', 
    patientEmail: 'john.patient@example.com',
    assetType: 'Gold', 
    weight: 50,
    assetValue: 750000, // 50g * 15000
    tokensMinted: 7500, // 750000 / 100
    status: 'pending', 
    mintedDate: '',
    hospitalName: 'Liaquat National Hospital'
  },
  { 
    id: 'MINT-002', 
    depositId: 'DEP-1002', 
    patientId: 'PAT-002', 
    patientName: 'Sarah Johnson', 
    patientEmail: 'sarah@example.com',
    assetType: 'Silver', 
    weight: 200,
    assetValue: 50000, // 200g * 250
    tokensMinted: 500, // 50000 / 100
    status: 'pending', 
    mintedDate: '',
    hospitalName: 'Liaquat National Hospital'
  },
  { 
    id: 'MINT-003', 
    depositId: 'DEP-1003', 
    patientId: 'PAT-003', 
    patientName: 'Michael Brown', 
    patientEmail: 'michael@example.com',
    assetType: 'Gold', 
    weight: 25,
    assetValue: 375000, // 25g * 15000
    tokensMinted: 3750, // 375000 / 100
    status: 'minted', 
    mintedDate: '2024-12-05', 
    txHash: '0x7a8c...9d2f',
    hospitalName: 'Liaquat National Hospital'
  },
  { 
    id: 'MINT-004', 
    depositId: 'DEP-1005', 
    patientId: 'PAT-005', 
    patientName: 'Emily Davis', 
    patientEmail: 'emily@example.com',
    assetType: 'Silver', 
    weight: 400,
    assetValue: 100000, // 400g * 250
    tokensMinted: 1000, // 100000 / 100
    status: 'processing', 
    mintedDate: '',
    hospitalName: 'Liaquat National Hospital'
  },
]

export default function MintingPage() {
  const [records, setRecords] = useState<MintRecord[]>(mockMintRecords)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [showBatchMint, setShowBatchMint] = useState(false)
  const [showTxDetails, setShowTxDetails] = useState(false)
  const [selectedTx, setSelectedTx] = useState<MintRecord | null>(null)
  const [minting, setMinting] = useState(false)

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.depositId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(filteredRecords.filter(r => r.status === 'pending').map(r => r.id))
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

  const handleBatchMint = () => {
    setMinting(true)
    setTimeout(() => {
      setRecords(records.map(r => 
        selectedRecords.includes(r.id) 
          ? { ...r, status: 'minted' as const, mintedDate: new Date().toISOString().split('T')[0], txHash: '0x' + Math.random().toString(16).slice(2, 8) + '...' + Math.random().toString(16).slice(2, 6) }
          : r
      ))
      setSelectedRecords([])
      setMinting(false)
      setShowBatchMint(false)
    }, 2000)
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

  const pendingRecords = records.filter(r => r.status === 'pending')
  const totalTokensMinted = records.filter(r => r.status === 'minted').reduce((sum, record) => sum + record.tokensMinted, 0)
  const totalValue = records.filter(r => r.status === 'minted').reduce((sum, record) => sum + record.assetValue, 0)
  const selectedTotalTokens = records.filter(r => selectedRecords.includes(r.id)).reduce((sum, r) => sum + r.tokensMinted, 0)
  const selectedTotalValue = records.filter(r => selectedRecords.includes(r.id)).reduce((sum, r) => sum + r.assetValue, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Token Minting</h1>
          <p className="text-muted-foreground mt-1">Mint Asset Tokens (AT) from approved deposits.</p>
        </div>
        {selectedRecords.length > 0 && (
          <Button className="gap-2" onClick={() => setShowBatchMint(true)}>
            <Coins className="w-4 h-4" />
            Mint Selected ({selectedRecords.length})
          </Button>
        )}
      </div>

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
                    checked={selectedRecords.length === filteredRecords.filter(r => r.status === 'pending').length && filteredRecords.filter(r => r.status === 'pending').length > 0}
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
                        disabled={record.status !== 'pending'}
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
                        {record.status === 'pending' && (
                          <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => {
                            setSelectedRecords([record.id])
                            setShowBatchMint(true)
                          }}>
                            Mint
                          </Button>
                        )}
                        {record.status === 'minted' && record.txHash && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedTx(record)
                              setShowTxDetails(true)
                            }}
                          >
                            View TX
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
            <DialogTitle>Confirm Token Minting</DialogTitle>
            <DialogDescription>
              Review the details before minting tokens to the blockchain.
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
                <p className="text-sm font-medium">Total Tokens to Mint</p>
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">{selectedTotalTokens.toLocaleString()} AT</p>
              <p className="text-sm text-muted-foreground mt-1">Asset Tokens</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Blockchain Transaction</p>
                <p className="text-xs text-blue-700 mt-1">
                  This will initiate blockchain transactions for minting tokens. 
                  Gas fees will be calculated and deducted from the hospital wallet.
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
                  Minting...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Confirm Minting
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Dialog */}
      <Dialog open={showTxDetails} onOpenChange={setShowTxDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about the minting transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedTx && (
            <div className="space-y-6 py-4">
              {/* Transaction Status */}
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">Transaction Successful</p>
                    <p className="text-sm text-green-700">Tokens minted successfully</p>
                  </div>
                </div>
                <Badge className="bg-green-600">
                  Confirmed
                </Badge>
              </div>

              {/* Transaction Hash */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
                  <span className="flex-1 break-all">{selectedTx.txHash}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(selectedTx.txHash || '')}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Patient & Asset Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
                  <p className="text-sm font-medium">{selectedTx.patientName}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Patient Email</label>
                  <p className="text-sm">{selectedTx.patientEmail}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Deposit ID</label>
                  <p className="text-sm font-mono">{selectedTx.depositId}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Minted Date</label>
                  <p className="text-sm">{selectedTx.mintedDate}</p>
                </div>
              </div>

              {/* Asset Information */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Asset Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset Type:</span>
                    <Badge variant="outline" className={
                      selectedTx.assetType === 'Gold' 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }>
                      {selectedTx.assetType}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="font-medium">{selectedTx.weight} grams</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset Value:</span>
                    <span className="font-medium">PKR {selectedTx.assetValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hospital:</span>
                    <span className="font-medium">{selectedTx.hospitalName}</span>
                  </div>
                </div>
              </div>

              {/* Tokens Minted */}
              <div className="p-4 border-2 border-accent bg-accent/5 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Tokens Minted</p>
                    <p className="text-3xl font-bold text-accent mt-1">{selectedTx.tokensMinted.toLocaleString()} AT</p>
                  </div>
                  <Coins className="w-12 h-12 text-accent" />
                </div>
                <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                  Token Ratio: 1 AT = 100 PKR
                </div>
              </div>

              {/* Blockchain Details */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Block Confirmations:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas Used:</span>
                  <span className="font-medium">0.00234 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="font-medium">Ethereum Sepolia</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTxDetails(false)}>
              Close
            </Button>
            <Button onClick={() => window.open(`https://sepolia.etherscan.io/tx/${selectedTx?.txHash}`, '_blank')}>
              View on Explorer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
