// Short overview: AT (Asset Token) wallet component for wallet/at page.
// - Displays balance, recent transactions, asset breakdown.
// - Relation: used exclusively by `app/patient/wallet/at/page.tsx`
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalClose, ModalFooter } from '@/components/ui/Modal'
import { WalletTransaction } from '@/services/walletService'

type Props = {
  balance: number
  transactions: WalletTransaction[]
  assetBreakdown?: { asset: string; tokens: number }[]
}

export default function ATWalletCard({ balance, transactions, assetBreakdown = [] }: Props) {
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Asset Token Balance</CardTitle>
              <CardDescription>Your AT holdings and recent activity</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-md">
            <div className="text-sm text-muted-foreground">Total AT Balance</div>
            <div className="text-3xl font-bold mt-1">{balance.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your AT transfer and mint history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.transactionId}>
                  <TableCell>{tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="font-mono text-xs">{tx.transactionHash ? `${tx.transactionHash.slice(0, 10)}...` : 'N/A'}</TableCell>
                  <TableCell className="font-mono text-xs">{tx.senderWalletAddress ? `${tx.senderWalletAddress.slice(0, 10)}...` : 'N/A'}</TableCell>
                  <TableCell className="font-mono text-xs">{tx.receiverWalletAddress ? `${tx.receiverWalletAddress.slice(0, 10)}...` : 'N/A'}</TableCell>
                  <TableCell className="font-semibold">{tx.amount} AT</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${tx.status?.toLowerCase() === 'success' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {tx.status || 'PENDING'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTx(tx)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">No AT transactions found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>Transaction Details</ModalTitle>
          </ModalHeader>
          {selectedTx && (
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Hash</p>
                  <p className="font-mono text-sm break-all mt-1">{selectedTx.transactionHash || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${selectedTx.status?.toLowerCase() === 'success' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {selectedTx.status || 'PENDING'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">From Address</p>
                  <p className="font-mono text-sm break-all mt-1">{selectedTx.senderWalletAddress || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To Address</p>
                  <p className="font-mono text-sm break-all mt-1">{selectedTx.receiverWalletAddress || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Type</p>
                  <p className="font-mono text-sm mt-1">{selectedTx.transactionType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-sm mt-1">{selectedTx.amount} AT</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Block Number</p>
                  <p className="text-sm mt-1">{selectedTx.blockNumber || 'N/A'}</p>
                </div>
                <div>
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
