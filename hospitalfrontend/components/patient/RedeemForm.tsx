// Short overview: Single component for the Patient Redeem page.
// - Handles selecting a benefit/asset, entering quantity, showing estimated cost, and confirming.
// - Relation: imported by `app/patient/redeem/page.tsx`; keep components to only this single file.
import React, { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter, ModalClose } from '@/components/ui/Modal'

type RedeemItem = {
  id: string
  label: string
  type: 'benefit' | 'asset'
  costPerUnit: number // cost in HT or PKR equivalent
  maxQuantity: number
}

type Props = {
  items: RedeemItem[]
  onConfirm?: (payload: { itemId: string; quantity: number; totalCost: number }) => void
}

export default function RedeemForm({ items, onConfirm }: Props) {
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id ?? '')
  const [qty, setQty] = useState<number>(1)
  const [open, setOpen] = useState(false)

  const selected = useMemo(() => items.find(i => i.id === selectedId) ?? items[0], [items, selectedId])
  const total = useMemo(() => (selected ? selected.costPerUnit * qty : 0), [selected, qty])

  const handleConfirm = () => {
    if (!selected) return
    const payload = { itemId: selected.id, quantity: qty, totalCost: total }
    onConfirm?.(payload)
    setOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redeem</CardTitle>
        <CardDescription>Select a benefit or asset and confirm redemption</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Item</label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {items.map(i => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.label} · {i.type === 'benefit' ? 'Benefit' : 'Asset'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Quantity</label>
            <Input
              type="number"
              min={1}
              max={selected?.maxQuantity ?? 100}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value || 0), selected?.maxQuantity ?? 100)))}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Max: {selected?.maxQuantity ?? 0}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-md border">
            <div className="text-sm text-muted-foreground">Cost per unit</div>
            <div className="font-semibold">{selected ? `PKR ${selected.costPerUnit.toLocaleString()}` : '—'}</div>
          </div>
          <div className="p-3 rounded-md border">
            <div className="text-sm text-muted-foreground">Quantity</div>
            <div className="font-semibold">{qty}</div>
          </div>
          <div className="p-3 rounded-md border">
            <div className="text-sm text-muted-foreground">Estimated total</div>
            <div className="font-semibold">PKR {total.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <Modal open={open} onOpenChange={setOpen}>
            <ModalTrigger asChild>
              <Button className="cta-strong">Proceed to redeem</Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Confirm Redemption</ModalTitle>
              </ModalHeader>
              <div className="space-y-2">
                <div className="text-sm">Item: <span className="font-medium">{selected?.label}</span></div>
                <div className="text-sm">Type: <span className="font-medium">{selected?.type}</span></div>
                <div className="text-sm">Quantity: <span className="font-medium">{qty}</span></div>
                <div className="text-sm">Total: <span className="font-medium">PKR {total.toLocaleString()}</span></div>
              </div>
              <ModalFooter>
                <ModalClose asChild>
                  <Button variant="outline">Cancel</Button>
                </ModalClose>
                <Button onClick={handleConfirm}>Confirm</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      </CardContent>
    </Card>
  )
}
