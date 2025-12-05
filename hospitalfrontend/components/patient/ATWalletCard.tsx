// Short overview: AT (Asset Token) wallet component for wallet/at page.
// - Displays balance, recent transactions, asset breakdown, send/receive modals.
// - Relation: used exclusively by `app/patient/wallet/at/page.tsx`
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose } from '@/components/ui/Modal'
import { ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react'

type ATTransaction = {
  id: string
  date: string
  type: 'send' | 'receive' | 'mint' | 'burn'
  amount: number
  from?: string
  to?: string
  asset?: string
  txHash?: string
}

const MOCK_AT_TXS: ATTransaction[] = [
  { id: '1', date: '2025-12-04', type: 'receive', amount: 500, from: 'Hospital Admin', asset: 'gold', txHash: '0xabc123' },
  { id: '2', date: '2025-12-03', type: 'send', amount: 200, to: '0x456...def', txHash: '0xdef456' },
  { id: '3', date: '2025-12-02', type: 'mint', amount: 300, asset: 'silver', txHash: '0x789abc' },
]

type Props = {
  balance: number
  assetBreakdown?: { asset: string; tokens: number }[]
}

export default function ATWalletCard({ balance, assetBreakdown = [] }: Props) {
  const [sendOpen, setSendOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [toAddress, setToAddress] = useState('')
  const [sendAmount, setSendAmount] = useState(0)

  const handleSend = () => {
    console.log('Send AT', { to: toAddress, amount: sendAmount })
    setSendOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Asset Token Balance</CardTitle>
              <CardDescription>Your AT holdings and recent activity</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Modal open={sendOpen} onOpenChange={setSendOpen}>
                <ModalTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpRight className="w-4 h-4 mr-1" />Send
                  </Button>
                </ModalTrigger>
                <ModalContent>
                  <ModalHeader>
                    <ModalTitle>Send AT Tokens</ModalTitle>
                  </ModalHeader>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">To Address</label>
                      <Input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="0x..." className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Amount (AT)</label>
                      <Input type="number" value={sendAmount} onChange={(e) => setSendAmount(Number(e.target.value))} placeholder="0" className="mt-1" />
                    </div>
                  </div>
                  <ModalFooter>
                    <ModalClose asChild><Button variant="outline">Cancel</Button></ModalClose>
                    <Button onClick={handleSend}>Confirm Send</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
              <Modal open={receiveOpen} onOpenChange={setReceiveOpen}>
                <ModalTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowDownLeft className="w-4 h-4 mr-1" />Receive
                  </Button>
                </ModalTrigger>
                <ModalContent>
                  <ModalHeader>
                    <ModalTitle>Receive AT Tokens</ModalTitle>
                  </ModalHeader>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Share your wallet address to receive AT:</p>
                    <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">0x1234567890abcdef1234567890abcdef12345678</div>
                    <Button variant="outline" className="w-full" onClick={() => navigator.clipboard.writeText('0x1234567890abcdef1234567890abcdef12345678')}>Copy Address</Button>
                  </div>
                  <ModalFooter>
                    <ModalClose asChild><Button variant="outline">Close</Button></ModalClose>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground">Total AT Balance</div>
              <div className="text-3xl font-bold mt-1">{balance.toLocaleString()}</div>
            </div>
            {assetBreakdown.map((a) => (
              <div key={a.asset} className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground capitalize">{a.asset} Backed</div>
                <div className="text-2xl font-semibold mt-1">{a.tokens.toLocaleString()} AT</div>
              </div>
            ))}
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
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>From/To</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_AT_TXS.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell className="capitalize">{tx.type}</TableCell>
                  <TableCell className={tx.type === 'receive' || tx.type === 'mint' ? 'text-green-600' : 'text-red-600'}>
                    {(tx.type === 'receive' || tx.type === 'mint') ? '+' : '-'}{tx.amount} AT
                  </TableCell>
                  <TableCell>{tx.from || tx.to || '—'}</TableCell>
                  <TableCell className="capitalize">{tx.asset || '—'}</TableCell>
                  <TableCell>
                    {tx.txHash && (
                      <a href={`https://etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm">View</Button>
                      </a>
                    )}
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
