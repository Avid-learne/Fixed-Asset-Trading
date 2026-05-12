// Short overview: Statements list with modal view.
// - Displays recent statements and provides a modal to view all statements.
// - Relation: used in Activity sidebar to centralize statement UI.
import React from 'react'
import { Button } from '@/components/ui/button'
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose } from '@/components/ui/Modal'
import { StatementItem, Tx } from '@/types/activity'
import { FileText, Calendar } from 'lucide-react'

type StatementsListProps = {
  statements: StatementItem[]
  transactions: Tx[]
}

export default function StatementsList({ statements, transactions }: StatementsListProps) {
  return (
    <div>
      <div className="space-y-3">
        {statements.slice(0, 3).map((s) => (
          <div key={s.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{s.month} {s.year}</div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Generated: {new Date(s.generatedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {s.transactions} Transactions
                    </span>
                    <span className="text-muted-foreground">
                      HT: {s.totalHT >= 0 ? '+' : ''}{s.totalHT}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t mt-4">
        <div className="w-full flex items-center justify-end">
          <Modal>
            <ModalTrigger asChild>
              <Button variant="link">View all statements</Button>
            </ModalTrigger>
            <ModalContent className="max-w-3xl">
              <ModalHeader>
                <ModalTitle>All Monthly Statements</ModalTitle>
              </ModalHeader>
              <div className="mt-2 max-h-[60vh] overflow-auto space-y-3 p-4">
                {statements.map((s) => (
                  <div key={s.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{s.month} {s.year}</div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(s.generatedDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {s.transactions} Transactions
                            </span>
                            <span className="text-muted-foreground">
                              HT: {s.totalHT >= 0 ? '+' : ''}{s.totalHT}
                            </span>
                          </div>
                        </div>
                      </div>
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
