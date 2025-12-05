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

type HTTransaction = {
  id: string
  date: string
  type: 'redeem' | 'transfer' | 'reward' | 'conversion'
  amount: number
  description: string
  status: 'success' | 'pending'
}

const MOCK_HT_TXS: HTTransaction[] = [
  { id: '1', date: '2025-12-05', type: 'redeem', amount: -50, description: 'Dental checkup benefit', status: 'success' },
  { id: '2', date: '2025-12-04', type: 'reward', amount: 100, description: 'Platform loyalty reward', status: 'success' },
  { id: '3', date: '2025-12-03', type: 'conversion', amount: 150, description: 'Converted from 200 AT', status: 'success' },
  { id: '4', date: '2025-12-02', type: 'transfer', amount: -25, description: 'Sent to user 0x456', status: 'success' },
]

type Props = {
  balance: number
  totalRedeemed?: number
  upcomingBenefits?: number
}

export default function HTWalletCard({ balance, totalRedeemed = 0, upcomingBenefits = 0 }: Props) {
  const [transferOpen, setTransferOpen] = useState(false)
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
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your HT redemptions, transfers, and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_HT_TXS.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell className="capitalize">{tx.type}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} HT
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${tx.status === 'success' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {tx.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
