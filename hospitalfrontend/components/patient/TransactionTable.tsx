// Short overview: Presentational transaction table for the Activity page.
// - Renders a list of `Tx` rows and exposes a full-list modal.
// - Relation: used by `app/patient/activity/page.tsx` as the main transactions component.
import React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose } from '@/components/ui/Modal'
import { Tx } from '@/types/activity'

type Props = {
  transactions: Tx[]
}

export default function TransactionTable({ transactions }: Props) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">AT Tokens</TableHead>
            <TableHead className="text-right">HT Used</TableHead>
            <TableHead className="text-right">Asset Rate</TableHead>
            <TableHead className="text-right">Value (PKR)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="whitespace-nowrap">{t.date}</TableCell>
              <TableCell>
                <div className="font-medium">{t.description}</div>
                {t.asset && <div className="text-xs text-muted-foreground">Asset: {t.asset} {t.assetUnits ? `· ${t.assetUnits}` : ''}</div>}
                {t.txHash && <div className="text-xs text-muted-foreground">Tx: {t.txHash}</div>}
              </TableCell>
              <TableCell className={`text-right ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{t.amount > 0 ? `+${t.amount}` : t.amount}</TableCell>
              <TableCell className="text-right">{t.atTokens ?? '—'}</TableCell>
              <TableCell className="text-right">{t.htUsed ?? 0}</TableCell>
              <TableCell className="text-right">{t.assetRate ? `PKR ${t.assetRate.toLocaleString()}` : '—'}</TableCell>
              <TableCell className="text-right">{t.convertedValue ? `PKR ${t.convertedValue.toLocaleString()}` : '—'}</TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded-full text-xs ${t.status === 'success' ? 'bg-success/10 text-success' : t.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>{t.status}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <a href={t.txHash ? `https://etherscan.io/tx/${t.txHash}` : '#'} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="sm">View</Button>
                  </a>
                  <Button variant="outline" size="sm" onClick={() => alert('Download receipt placeholder')}>Receipt</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="w-full flex items-center justify-end mt-3">
        <Modal>
          <ModalTrigger asChild>
            <Button variant="link">See all transactions</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>All Transactions</ModalTitle>
            </ModalHeader>
            <div className="mt-2 max-h-[60vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">AT Tokens</TableHead>
                    <TableHead className="text-right">HT Used</TableHead>
                    <TableHead className="text-right">Asset Rate</TableHead>
                    <TableHead className="text-right">Value (PKR)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">{t.date}</TableCell>
                      <TableCell>
                        <div className="font-medium">{t.description}</div>
                        {t.asset && <div className="text-xs text-muted-foreground">Asset: {t.asset} {t.assetUnits ? `· ${t.assetUnits}` : ''}</div>}
                      </TableCell>
                      <TableCell className={`text-right ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{t.amount > 0 ? `+${t.amount}` : t.amount}</TableCell>
                      <TableCell className="text-right">{t.atTokens ?? '—'}</TableCell>
                      <TableCell className="text-right">{t.htUsed ?? 0}</TableCell>
                      <TableCell className="text-right">{t.assetRate ? `PKR ${t.assetRate.toLocaleString()}` : '—'}</TableCell>
                      <TableCell className="text-right">{t.convertedValue ? `PKR ${t.convertedValue.toLocaleString()}` : '—'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${t.status === 'success' ? 'bg-success/10 text-success' : t.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>{t.status}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <a href={t.txHash ? `https://etherscan.io/tx/${t.txHash}` : '#'} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="sm">View</Button>
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ModalFooter>
              <ModalClose asChild>
                <Button variant="outline">Close</Button>
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </>
  )
}
