// Short overview: Notifications list and detailed modal used on Activity page.
// - Renders compact notifications and exposes list/detail modals.
// - Relation: used in the Activity sidebar to show notifications and details.
import React, { useState } from 'react'
import { CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose } from '@/components/ui/Modal'
import { NotificationItem } from '@/types/activity'

type Props = {
  notifications: NotificationItem[]
}

export default function NotificationsList({ notifications }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<NotificationItem | null>(null)

  return (
    <div>
      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => { setSelected(n); setOpen(true) }}
              role="button"
              tabIndex={0}
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">N</div>
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-muted-foreground">{n.body}</div>
                <div className="text-xs text-muted-foreground mt-1">{n.date}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {n.txHash && (
                <a href={`https://etherscan.io/tx/${n.txHash}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">View Tx</Button>
                </a>
              )}
              {n.statementHref && (
                <a href={n.statementHref} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">View Statement</Button>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{selected?.title ?? 'Notification'}</ModalTitle>
          </ModalHeader>
          <div className="py-2">
            <div className="text-sm text-muted-foreground">{selected?.date}</div>
            <div className="mt-2">{selected?.body}</div>
            {selected?.txHash && (
              <div className="mt-4">
                <a href={`https://etherscan.io/tx/${selected.txHash}`} target="_blank" rel="noreferrer">
                  <Button size="sm">Open Tx on Etherscan</Button>
                </a>
              </div>
            )}
            {selected?.statementHref && (
              <div className="mt-4">
                <a href={selected.statementHref} target="_blank" rel="noreferrer">
                  <Button size="sm">Open Statement</Button>
                </a>
              </div>
            )}
          </div>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline">Close</Button>
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div className="w-full flex items-center justify-end mt-3">
        <Modal>
          <ModalTrigger asChild>
            <Button variant="link">View all</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>All Notifications</ModalTitle>
            </ModalHeader>
            <div className="mt-2 max-h-64 overflow-auto space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                  <div>
                    <div className="font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground">{n.body}</div>
                    <div className="text-xs text-muted-foreground mt-1">{n.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {n.txHash && (
                      <a href={`https://etherscan.io/tx/${n.txHash}`} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm">View Tx</Button>
                      </a>
                    )}
                    {n.statementHref && (
                      <a href={n.statementHref} target="_blank" rel="noreferrer">
                        <Button size="sm">View Statement</Button>
                      </a>
                    )}
                    <Button size="sm" variant="outline" onClick={() => { setSelected(n); setOpen(true) }}>Details</Button>
                  </div>
                </div>
              ))}
            </div>
            <ModalFooter>
              <ModalClose asChild>
                <Button variant="outline">Close</Button>
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
}
