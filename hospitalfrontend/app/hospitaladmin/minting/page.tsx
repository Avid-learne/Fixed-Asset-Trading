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

/**
 * Status pipeline this page cares about:
 *  - 'pending'    custody confirmed, no AT minted yet → admin can mint
 *  - 'minted'     AT already minted (tokensMinted > 0) → terminal success state
 *  - 'processing' deposit hasn't reached custody-confirmed yet (still moving through
 *                 hospital/bank approval) → not actionable here
 *  - 'failed'     hospital/bank rejected the request → terminal failure state
 */
const mapToMintRecord = (item: AssetDepositItem): MintRecord => {
  const requestStatus = (item.status || '').toLowerCase()
  const bankStatus = (item.bankApprovalStatus || '').toLowerCase()
  const minted = toNumber(item.tokensMinted)

  let status: MintRecord['status'] = 'processing'
  if (requestStatus === 'rejected' || bankStatus === 'rejected') {
    status = 'failed'
  } else if (minted > 0) {
    status = 'minted'
  } else if (requestStatus === 'custody_confirmed') {
    status = 'pending'
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
    tokensMinted: minted > 0 ? minted : toNumber(item.expectedTokens),
    status,
    mintedDate: item.bankApprovedAt,
    submittedAt: item.submittedAt,
    bankApprovalStatus: item.bankApprovalStatus,
    rejectionReason: item.rejectionReason,
    bankRejectionReason: item.bankRejectionReason,
    hospitalName: item.hospitalName,
  }
}

/** A row is mintable when bank has confirmed custody but AT hasn't been minted yet. */
const canMint = (record: MintRecord): boolean => record.status === 'pending'

export default function MintingPage() {
  const { toast } = useToast()
  const [records, setRecords] = useState<MintRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [minting, setMinting] = useState(false)
  // Track which specific row(s) are currently being minted so only those buttons spin.
  const [mintingIds, setMintingIds] = useState<string[]>([])
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
      setSelectedRecords(filteredRecords.filter(canMint).map(r => r.id))
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

  /**
   * Mint the given assetIds sequentially. We do NOT use Promise.all because the
   * backend signs each tx with the same admin wallet — concurrent calls would
   * collide on the same nonce and fail. Sequential keeps each receipt clean.
   *
   * `mintingIds` tracks the specific rows currently in flight so only their
   * buttons spin (not every Mint button on the page).
   */
  const mintAssets = async (assetIds: string[]) => {
    if (assetIds.length === 0) return
    setMinting(true)
    setMintingIds(assetIds)
    setError('')
    const succeeded: { id: string; tokensMinted: number }[] = []
    const failed: { id: string; reason: string }[] = []
    try {
      for (const id of assetIds) {
        try {
          const result = await depositRequestService.mintTokens(id)
          succeeded.push({ id, tokensMinted: Number(result.tokensMinted ?? result.expectedTokens ?? 0) })
        } catch (err) {
          failed.push({ id, reason: err instanceof Error ? err.message : 'Unknown error' })
        } finally {
          // Drop the just-finished row from the in-flight list immediately so its
          // button stops spinning even while later rows are still pending.
          setMintingIds((current) => current.filter((x) => x !== id))
        }
      }

      if (succeeded.length > 0) {
        const totalMinted = succeeded.reduce((sum, s) => sum + s.tokensMinted, 0)
        toast({
          title: failed.length === 0 ? 'AT minted on-chain' : 'AT minted (with errors)',
          description: failed.length === 0
            ? `${totalMinted.toLocaleString()} AT minted via HospitalFinancials.mintAssetToken across ${succeeded.length} asset(s). Tokens credited to patient Pool 1.`
            : `${succeeded.length} succeeded (${totalMinted.toLocaleString()} AT), ${failed.length} failed: ${failed.map(f => f.reason).join('; ')}`,
        })
      } else if (failed.length > 0) {
        setError(`All mints failed: ${failed.map(f => f.reason).join('; ')}`)
      }
    } finally {
      setMinting(false)
      setMintingIds([])
      setShowBatchMint(false)
      setSelectedRecords([])
      await loadRecords()
    }
  }

  const handleBatchMint = () => mintAssets(selectedRecords)
  const handleSingleMint = (id: string) => mintAssets([id])

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'minted':
        return 'Minted'
      case 'processing':
        return 'Pending Bank Approval'
      case 'pending':
        return 'Ready to Mint'
      case 'failed':
        return 'Rejected'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const pendingRecords = records.filter(canMint)
  const totalTokensMinted = records.filter(r => r.status === 'minted').reduce((sum, record) => sum + record.tokensMinted, 0)
  const totalValue = records.filter(r => r.status === 'minted').reduce((sum, record) => sum + record.assetValue, 0)
  const selectedTotalTokens = records.filter(r => selectedRecords.includes(r.id)).reduce((sum, r) => sum + r.tokensMinted, 0)
  const selectedTotalValue = records.filter(r => selectedRecords.includes(r.id)).reduce((sum, r) => sum + r.assetValue, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Token Minting</h1>
          <p className="text-muted-foreground mt-1">Mint AT for deposits whose physical custody has been confirmed by the bank. Pick rows individually or select multiple and mint in one click.</p>
        </div>
        {selectedRecords.length > 0 && (
          <Button className="gap-2" onClick={() => setShowBatchMint(true)} disabled={minting}>
            <Coins className="w-4 h-4" />
            Mint Selected ({selectedRecords.length})
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
              Pending Bank Approval
              <Loader2 className="w-4 h-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{records.filter(r => r.status === 'processing').length}</p>
            <p className="text-sm text-muted-foreground mt-1">Awaiting bank custody</p>
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
                <SelectContent
                  className="bg-white"
                  style={{ backgroundColor: '#ffffff', opacity: 1 }}
                >
                  <SelectItem
                    value="all"
                    className="focus:bg-emerald-600 focus:text-white data-[highlighted]:bg-emerald-600 data-[highlighted]:text-white"
                  >
                    All Status
                  </SelectItem>
                  <SelectItem
                    value="pending"
                    className="focus:bg-emerald-600 focus:text-white data-[highlighted]:bg-emerald-600 data-[highlighted]:text-white"
                  >
                    Ready to Mint
                  </SelectItem>
                  <SelectItem
                    value="processing"
                    className="focus:bg-emerald-600 focus:text-white data-[highlighted]:bg-emerald-600 data-[highlighted]:text-white"
                  >
                    Pending Bank Approval
                  </SelectItem>
                  <SelectItem
                    value="minted"
                    className="focus:bg-emerald-600 focus:text-white data-[highlighted]:bg-emerald-600 data-[highlighted]:text-white"
                  >
                    Minted
                  </SelectItem>
                  <SelectItem
                    value="failed"
                    className="focus:bg-emerald-600 focus:text-white data-[highlighted]:bg-emerald-600 data-[highlighted]:text-white"
                  >
                    Rejected
                  </SelectItem>
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
                    checked={selectedRecords.length === filteredRecords.filter(canMint).length && filteredRecords.filter(canMint).length > 0}
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
                        disabled={!canMint(record)}
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
                        {getStatusLabel(record.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {canMint(record) && (
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => handleSingleMint(record.id)}
                            // Disable while THIS row is being minted, OR while any other mint
                            // is in flight (sequential nonce — only one chain tx at a time).
                            disabled={minting}
                          >
                            {mintingIds.includes(record.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                            Mint
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
            <DialogTitle>Confirm AT Minting</DialogTitle>
            <DialogDescription>
              Selected deposits will be minted on-chain. Each mint signs an `HospitalFinancials.mintAssetToken(...)` transaction and lands the AT in the patient&apos;s Pool 1.
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
                <p className="text-sm font-medium">AT to mint</p>
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">{selectedTotalTokens.toLocaleString()} AT</p>
              <p className="text-sm text-muted-foreground mt-1">Each row fires its own on-chain transaction (sequential to avoid nonce collisions).</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">On-chain mint</p>
                <p className="text-xs text-blue-700 mt-1">
                  Bank confirmed custody only. This action is what actually mints AT and sends the tokens to the patient&apos;s wallet.
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
                  Minting…
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Mint {selectedRecords.length} Asset{selectedRecords.length === 1 ? '' : 's'}
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
