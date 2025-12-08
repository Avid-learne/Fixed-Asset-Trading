// Short overview: AT (Asset Token) wallet component for wallet/at page.
// - Displays balance, recent transactions, asset breakdown.
// - Relation: used exclusively by `app/patient/wallet/at/page.tsx`
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalClose, ModalFooter } from '@/components/ui/Modal'

type ATTransaction = {
  id: string
  transaction_hash: string
  from_address: string
  to_address: string
  token_id: string
  amount: number
  gas_used: number
  status: string
  created_at: string
}

const MOCK_AT_TXS: ATTransaction[] = [
  { id: '1', transaction_hash: '0xabc123', from_address: '0xHospitalAdmin', to_address: '0x123patient', token_id: 'AT-001', amount: 500, gas_used: 21000, status: 'success', created_at: '2025-12-04' },
  { id: '2', transaction_hash: '0xdef456', from_address: '0x123patient', to_address: '0x456...def', token_id: 'AT-001', amount: 200, gas_used: 21000, status: 'success', created_at: '2025-12-03' },
  { id: '3', transaction_hash: '0x789abc', from_address: '0xMinter', to_address: '0x123patient', token_id: 'AT-002', amount: 300, gas_used: 45000, status: 'success', created_at: '2025-12-02' },
]

type Props = {
  balance: number
  assetBreakdown?: { asset: string; tokens: number }[]
}

export default function ATWalletCard({ balance, assetBreakdown = [] }: Props) {
  const [selectedTx, setSelectedTx] = useState<ATTransaction | null>(null)

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
              {MOCK_AT_TXS.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono text-xs">{tx.transaction_hash.slice(0, 10)}...</TableCell>
                  <TableCell className="font-mono text-xs">{tx.from_address.slice(0, 10)}...</TableCell>
                  <TableCell className="font-mono text-xs">{tx.to_address.slice(0, 10)}...</TableCell>
                  <TableCell className="font-semibold">{tx.amount} AT</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${tx.status === 'success' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {tx.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTx(tx)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
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
                  <p className="font-mono text-sm break-all mt-1">{selectedTx.transaction_hash}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${selectedTx.status === 'success' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {selectedTx.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">From Address</p>
                  <p className="font-mono text-sm break-all mt-1">{selectedTx.from_address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To Address</p>
                  <p className="font-mono text-sm break-all mt-1">{selectedTx.to_address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Token ID</p>
                  <p className="font-mono text-sm mt-1">{selectedTx.token_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-sm mt-1">{selectedTx.amount} AT</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gas Used</p>
                  <p className="text-sm mt-1">{selectedTx.gas_used.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-sm mt-1">{new Date(selectedTx.created_at).toLocaleString()}</p>
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
