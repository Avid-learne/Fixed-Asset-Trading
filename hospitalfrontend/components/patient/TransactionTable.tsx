// Short overview: Presentational transaction table for the Activity page.
// - Renders a list of `Tx` rows and exposes a full-list modal.
// - Relation: used by `app/patient/activity/page.tsx` as the main transactions component.
import React, { useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose } from '@/components/ui/Modal'
import { Tx } from '@/types/activity'

type Props = {
  transactions: Tx[]
}

export default function TransactionTable({ transactions }: Props) {
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Transaction Hash</TableHead>
            <TableHead>From/Source</TableHead>
            <TableHead>To</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="whitespace-nowrap">{new Date(t.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  t.token_type === 'AT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {t.token_type}
                </span>
                {t.type && <div className="text-xs text-muted-foreground mt-1">{t.type}</div>}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {t.transaction_hash ? `${t.transaction_hash.slice(0, 10)}...` : 'N/A'}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {t.token_type === 'AT' 
                  ? (t.from_address ? `${t.from_address.slice(0, 10)}...` : 'N/A')
                  : (t.source || 'N/A')
                }
              </TableCell>
              <TableCell className="font-mono text-xs">
                {t.to_address ? `${t.to_address.slice(0, 10)}...` : 'N/A'}
              </TableCell>
              <TableCell className={`text-right font-semibold ${
                t.amount > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {t.amount > 0 ? '+' : ''}{t.amount} {t.token_type}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  t.status === 'success' ? 'bg-success/10 text-success' : 
                  t.status === 'pending' ? 'bg-warning/10 text-warning' : 
                  'bg-destructive/10 text-destructive'
                }`}>
                  {t.status}
                </span>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTx(t)}>View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <ModalContent className="max-w-3xl">
          <ModalHeader>
            <ModalTitle>Transaction Details</ModalTitle>
          </ModalHeader>
          {selectedTx && (
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Token Type</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                    selectedTx.token_type === 'AT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {selectedTx.token_type}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                    selectedTx.status === 'success' ? 'bg-success/10 text-success' : 
                    selectedTx.status === 'pending' ? 'bg-warning/10 text-warning' : 
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {selectedTx.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className={`font-semibold mt-1 ${
                    selectedTx.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedTx.amount > 0 ? '+' : ''}{selectedTx.amount} {selectedTx.token_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-sm mt-1">{new Date(selectedTx.created_at).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Transaction Hash</p>
                  <p className="font-mono text-sm break-all mt-1">{selectedTx.transaction_hash || 'N/A'}</p>
                </div>
                
                {selectedTx.token_type === 'AT' ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">From Address</p>
                      <p className="font-mono text-sm break-all mt-1">{selectedTx.from_address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">To Address</p>
                      <p className="font-mono text-sm break-all mt-1">{selectedTx.to_address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Token ID</p>
                      <p className="font-mono text-sm mt-1">{selectedTx.token_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gas Used</p>
                      <p className="text-sm mt-1">{selectedTx.gas_used?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Patient ID</p>
                      <p className="font-mono text-sm mt-1">{selectedTx.patient_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Patient Address</p>
                      <p className="font-mono text-sm break-all mt-1">{selectedTx.patient_address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="text-sm mt-1">{selectedTx.type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Source</p>
                      <p className="text-sm mt-1">{selectedTx.source || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Block Number</p>
                      <p className="text-sm mt-1">{selectedTx.block_number?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </>
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
    </>
  )
}
