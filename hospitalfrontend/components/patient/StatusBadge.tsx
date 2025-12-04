'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'

export function StatusBadge({ status }: { status: 'Pending' | 'Verified' | 'Rejected' | 'Minted' | string }) {
  const map: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Verified: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Minted: 'bg-teal-100 text-teal-700',
  }
  return <Badge className={map[status] || 'bg-muted text-muted-foreground'}>{status}</Badge>
}
