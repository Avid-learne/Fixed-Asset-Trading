// Short overview: Statements list with download and modal view.
// - Displays recent statements and provides a modal to view all statements.
// - Relation: used in Activity sidebar to centralize statement UI.
import React from 'react'
import { Button } from '@/components/ui/button'
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose } from '@/components/ui/Modal'
import { StatementItem } from '@/types/activity'

type Props = { statements: StatementItem[] }

export default function StatementsList({ statements }: Props) {
  return (
    <div>
      <div className="space-y-3">
        {statements.map((s) => (
          <div key={s.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{s.title}</div>
              <div className="text-sm text-muted-foreground">PDF · 120 KB</div>
            </div>
            <div>
              <a href={s.href} className="inline-block">
                <Button variant="outline" size="sm">Download</Button>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t mt-4">
        <div className="w-full flex items-center justify-end">
          <Modal>
            <ModalTrigger asChild>
              <Button variant="link">View all</Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>All Statements</ModalTitle>
              </ModalHeader>
              <div className="mt-2 max-h-64 overflow-auto space-y-3">
                {statements.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-sm text-muted-foreground">PDF · 120 KB</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={s.href} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost">View</Button>
                      </a>
                      <a href={s.href} download>
                        <Button size="sm">Download</Button>
                      </a>
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
    </div>
  )
}
