// Short overview: Notifications list and detailed modal used on Activity page.
// - Renders compact notifications and exposes list/detail modals.
// - Relation: used in the Activity sidebar to show notifications and details.
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose } from '@/components/ui/Modal'
import { NotificationItem } from '@/types/activity'
import { CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react'

type Props = {
  notifications: NotificationItem[]
}

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'success':
      return { bg: 'bg-muted/50', text: 'text-green-600', border: 'border-border' }
    case 'info':
      return { bg: 'bg-muted/50', text: 'text-blue-600', border: 'border-border' }
    case 'warning':
      return { bg: 'bg-muted/50', text: 'text-yellow-600', border: 'border-border' }
    case 'error':
      return { bg: 'bg-muted/50', text: 'text-red-600', border: 'border-border' }
    default:
      return { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-border' }
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-4 h-4" />
    case 'info':
      return <Info className="w-4 h-4" />
    case 'warning':
      return <AlertTriangle className="w-4 h-4" />
    case 'error':
      return <XCircle className="w-4 h-4" />
    default:
      return <Info className="w-4 h-4" />
  }
}

export default function NotificationsList({ notifications }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<NotificationItem | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Notifications</h3>
        <Button variant="ghost" size="sm" className="text-xs">
          Mark all as read
        </Button>
      </div>
      
      <div className="space-y-3">
        {notifications.map((n) => {
          const styles = getTypeStyles(n.type)
          return (
            <div 
              key={n.id} 
              className={`p-4 rounded-lg border ${styles.border} ${styles.bg} cursor-pointer hover:shadow-sm transition-shadow`}
              onClick={() => { setSelected(n); setOpen(true) }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{n.title}</h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${styles.text}`}>
                      {getTypeIcon(n.type)}
                      {n.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{n.body}</p>
                  <p className="text-xs text-muted-foreground">{n.relativeTime}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{selected?.title ?? 'Notification'}</ModalTitle>
          </ModalHeader>
          <div className="py-4 space-y-3">
            {selected && (
              <>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    getTypeStyles(selected.type).bg
                  } ${
                    getTypeStyles(selected.type).text
                  }`}>
                    {getTypeIcon(selected.type)}
                    {selected.type}
                  </span>
                  <span className="text-sm text-muted-foreground">{selected.relativeTime}</span>
                </div>
                <p className="text-sm">{selected.body}</p>
                <p className="text-xs text-muted-foreground">Date: {selected.date}</p>
              </>
            )}
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
    </div>
  )
}
