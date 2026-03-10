// Short overview: HT (Health Token) wallet component for wallet/ht page.
// - Displays HT balance, usage history, benefits redemption summary, and transfer actions.
// - Relation: used exclusively by `app/patient/wallet/ht/page.tsx`
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose } from '@/components/ui/Modal'
import { ArrowUpRight, Activity, Gift } from 'lucide-react'
import { WalletTransaction } from '@/services/walletService'

type Props = {
  balance: number
  transactions: WalletTransaction[]
  totalRedeemed?: number
  upcomingBenefits?: number
}

export default function HTWalletCard({ balance, transactions, totalRedeemed = 0, upcomingBenefits = 0 }: Props) {
  const [transferOpen, setTransferOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null)
  const [toAddress, setToAddress] = useState('')
  const [transferAmount, setTransferAmount] = useState(0)

  const handleTransfer = () => {
    console.log('Transfer HT', { to: toAddress, amount: transferAmount })
    setTransferOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Health Token Balance</CardTitle>
              <CardDescription>Your HT holdings and usage summary</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Modal open={transferOpen} onOpenChange={setTransferOpen}>
                <ModalTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpRight className="w-4 h-4 mr-1" />Transfer
                  </Button>
                </ModalTrigger>
                <ModalContent>
                  <ModalHeader>
                    <ModalTitle>Transfer HT Tokens</ModalTitle>
                  </ModalHeader>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">To Address</label>
                      <Input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="0x..." className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Amount (HT)</label>
                      <Input type="number" value={transferAmount} onChange={(e) => setTransferAmount(Number(e.target.value))} placeholder="0" className="mt-1" />
                    </div>
                  </div>
                  <ModalFooter>
                    <ModalClose asChild><Button variant="outline">Cancel</Button></ModalClose>
                    <Button onClick={handleTransfer}>Confirm Transfer</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />Total HT Balance
              </div>
              <div className="text-3xl font-bold mt-1">{balance.toLocaleString()}</div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Gift className="w-4 h-4" />Total Redeemed
              </div>
              <div className="text-2xl font-semibold mt-1">{totalRedeemed.toLocaleString()} HT</div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground">Upcoming Benefits</div>
              <div className="text-2xl font-semibold mt-1">{upcomingBenefits}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Redemptions</CardTitle>
          <CardDescription>Your HT benefit redemption history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Benefit</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tx Hash</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.filter(tx => tx.transactionType === 'DEBIT').map((tx) => (
                <TableRow key={tx.transactionId}>
                  <TableCell>{tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{tx.description || 'HT redemption'}</TableCell>
                  <TableCell className="text-red-600">
                    -{Math.abs(tx.amount)} HT
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {tx.transactionHash ? `${tx.transactionHash.slice(0, 10)}...` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTx(tx)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.filter(tx => tx.transactionType === 'DEBIT').length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No HT redemption transactions found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>Redemption Details</ModalTitle>
          </ModalHeader>
          {selectedTx && (
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Type</p>
                  <p className="font-mono text-sm mt-1">{selectedTx.transactionType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sender Wallet</p>
                  <p className="font-mono text-sm break-all mt-1">{selectedTx.senderWalletAddress || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Benefit</p>
                  <p className="text-sm mt-1">{selectedTx.description || 'HT redemption'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-red-600 text-sm mt-1">-{Math.abs(selectedTx.amount)} HT</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Hash</p>
                  <p className="font-mono text-sm break-all mt-1">{selectedTx.transactionHash || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Block Number</p>
                  <p className="text-sm mt-1">{selectedTx.blockNumber || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-sm mt-1">{selectedTx.timestamp ? new Date(selectedTx.timestamp).toLocaleString() : 'N/A'}</p>
                </div>
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
