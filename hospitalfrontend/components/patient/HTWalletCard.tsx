// Short overview: HT (Health Token) wallet component for wallet/ht page.
// - Displays HT balance, usage history, benefits redemption summary, and transfer actions.
// - Relation: used exclusively by `app/patient/wallet/ht/page.tsx`
import React, { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose } from '@/components/ui/Modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowUpRight, ArrowDownLeft, Activity, Gift } from 'lucide-react'
import { WalletTransaction } from '@/services/walletService'

type Props = {
  balance: number
  transactions: WalletTransaction[]
  totalRedeemed?: number
  upcomingBenefits?: number
  onTransfer?: (recipientWalletAddress: string, amount: number, note?: string) => Promise<void>
}

export default function HTWalletCard({
  balance,
  transactions,
  totalRedeemed = 0,
  upcomingBenefits = 0,
  onTransfer,
}: Props) {
  const [transferOpen, setTransferOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null)
  const [toAddress, setToAddress] = useState('')
  const [transferAmount, setTransferAmount] = useState(0)
  const [note, setNote] = useState('')
  const [transferError, setTransferError] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

  const transfersSent = useMemo(() => {
    return transactions.filter(tx => tx.transactionType === 'DEBIT')
  }, [transactions])

  const transfersReceived = useMemo(() => {
    return transactions.filter(tx => tx.transactionType === 'CREDIT')
  }, [transactions])

  const totalTransferred = useMemo(() => {
    return transfersSent.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }, [transfersSent])

  const handleTransfer = async () => {
    if (!onTransfer) {
      setTransferError('Transfer service is not configured')
      return
    }
    if (!toAddress.trim()) {
      setTransferError('Recipient wallet address is required')
      return
    }
    if (!transferAmount || transferAmount <= 0) {
      setTransferError('Amount must be greater than zero')
      return
    }

    try {
      setIsTransferring(true)
      setTransferError('')
      await onTransfer(toAddress.trim(), transferAmount, note.trim() || undefined)
      setTransferOpen(false)
      setToAddress('')
      setTransferAmount(0)
      setNote('')
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : 'Transfer failed')
    } finally {
      setIsTransferring(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Health Token Balance</CardTitle>
              <CardDescription>Your HT holdings and transaction summary</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Modal open={transferOpen} onOpenChange={setTransferOpen}>
                <ModalTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpRight className="w-4 h-4 mr-1" />Transfer to Patient
                  </Button>
                </ModalTrigger>
                <ModalContent>
                  <ModalHeader>
                    <ModalTitle>Transfer HT Tokens to Another Patient</ModalTitle>
                  </ModalHeader>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Recipient Wallet Address</label>
                      <Input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="Recipient wallet address" className="mt-1" />
                      <p className="text-xs text-muted-foreground mt-1">You can find a patient's wallet address in their profile</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Amount (HT)</label>
                      <Input type="number" min="0" step="0.01" value={transferAmount} onChange={(e) => setTransferAmount(Number(e.target.value))} placeholder="0" className="mt-1" />
                      <p className="text-xs text-muted-foreground mt-1">Your balance: {balance} HT</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Note (optional)</label>
                      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., For medical support" className="mt-1" />
                    </div>
                    {transferError && <p className="text-sm text-red-600 font-medium">{transferError}</p>}
                  </div>
                  <ModalFooter>
                    <ModalClose asChild><Button variant="outline">Cancel</Button></ModalClose>
                    <Button onClick={handleTransfer} disabled={isTransferring || !toAddress || transferAmount <= 0}>
                      {isTransferring ? 'Transferring...' : 'Confirm Transfer'}
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />Current Balance
              </div>
              <div className="text-3xl font-bold mt-1">{balance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">HT</p>
            </div>
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" />Transferred Out
              </div>
              <div className="text-2xl font-semibold text-red-600 mt-1">{totalTransferred.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{transfersSent.length} transfers</p>
            </div>
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4" />Transferred In
              </div>
              <div className="text-2xl font-semibold text-green-600 mt-1">{transfersReceived.reduce((sum, t) => sum + Math.abs(t.amount), 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{transfersReceived.length} transfers</p>
            </div>
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Gift className="w-4 h-4" />Total Redeemed
              </div>
              <div className="text-2xl font-semibold text-orange-600 mt-1">{totalRedeemed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">HT</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View all your HT transfers and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transfers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transfers">Transfers ({transfersSent.length + transfersReceived.length})</TabsTrigger>
              <TabsTrigger value="all">All Transactions ({transactions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="transfers" className="mt-4">
              <div className="space-y-6">
                {/* Transferred Out Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold">HT Sent</h3>
                    <span className="text-sm text-muted-foreground">({transfersSent.length})</span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Tx Hash</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transfersSent.map((tx) => (
                        <TableRow key={tx.transactionId}>
                          <TableCell className="text-sm">
                            {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-xs truncate">
                            {tx.receiverWalletAddress || 'N/A'}
                          </TableCell>
                          <TableCell className="text-red-600 font-semibold">
                            -{Math.abs(tx.amount)} HT
                          </TableCell>
                          <TableCell className="text-sm">
                            {tx.description || 'Transfer'}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTx(tx)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {transfersSent.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No HT transfers sent yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Transferred In Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">HT Received</h3>
                    <span className="text-sm text-muted-foreground">({transfersReceived.length})</span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Sender</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Tx Hash</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transfersReceived.map((tx) => (
                        <TableRow key={tx.transactionId}>
                          <TableCell className="text-sm">
                            {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-xs truncate">
                            {tx.senderWalletAddress || 'N/A'}
                          </TableCell>
                          <TableCell className="text-green-600 font-semibold">
                            +{Math.abs(tx.amount)} HT
                          </TableCell>
                          <TableCell className="text-sm">
                            {tx.description || 'Transfer'}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTx(tx)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {transfersReceived.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No HT transfers received yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.transactionId}>
                      <TableCell className="text-sm">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                          tx.transactionType === 'CREDIT' ? 'bg-green-100 text-green-800' :
                          tx.transactionType === 'DEBIT' ? 'bg-red-100 text-red-800' :
                          tx.transactionType === 'HT_MINT' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tx.transactionType === 'HT_MINT' ? 'Allocated' :
                           tx.transactionType === 'CREDIT' ? 'Received' :
                           tx.transactionType === 'DEBIT' ? 'Sent' :
                           tx.transactionType}
                        </span>
                      </TableCell>
                      <TableCell className={`font-semibold ${
                        tx.transactionType === 'DEBIT' || tx.transactionType === 'AT_BURN' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {(tx.transactionType === 'DEBIT' || tx.transactionType === 'AT_BURN') ? '-' : '+'}
                        {Math.abs(tx.amount)} HT
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.description || '—'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTx(tx)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>Transaction Details</ModalTitle>
          </ModalHeader>
          {selectedTx && (
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Type</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      selectedTx.transactionType === 'CREDIT' ? 'bg-green-100 text-green-800' :
                      selectedTx.transactionType === 'DEBIT' ? 'bg-red-100 text-red-800' :
                      selectedTx.transactionType === 'HT_MINT' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedTx.transactionType === 'HT_MINT' ? 'Allocated' :
                       selectedTx.transactionType === 'CREDIT' ? 'Received' :
                       selectedTx.transactionType === 'DEBIT' ? 'Sent' :
                       selectedTx.transactionType}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold text-sm mt-1 text-green-600">{selectedTx.status || 'SUCCESS'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className={`font-bold text-base mt-1 ${
                    selectedTx.transactionType === 'DEBIT' || selectedTx.transactionType === 'AT_BURN' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {(selectedTx.transactionType === 'DEBIT' || selectedTx.transactionType === 'AT_BURN') ? '-' : '+'}
                    {Math.abs(selectedTx.amount)} HT
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date/Time</p>
                  <p className="text-sm mt-1">{selectedTx.timestamp ? new Date(selectedTx.timestamp).toLocaleString() : 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm mt-1">{selectedTx.description || '—'}</p>
                </div>
                {selectedTx.senderWalletAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground">From Wallet</p>
                    <p className="font-mono text-xs break-all mt-1 bg-muted p-2 rounded">{selectedTx.senderWalletAddress}</p>
                  </div>
                )}
                {selectedTx.receiverWalletAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground">To Wallet</p>
                    <p className="font-mono text-xs break-all mt-1 bg-muted p-2 rounded">{selectedTx.receiverWalletAddress}</p>
                  </div>
                )}
                {selectedTx.transactionHash && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Transaction Hash</p>
                    <p className="font-mono text-xs break-all mt-1 bg-muted p-2 rounded">{selectedTx.transactionHash}</p>
                  </div>
                )}
                {selectedTx.blockNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Block Number</p>
                    <p className="text-sm mt-1">{selectedTx.blockNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline">Close</Button>
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
