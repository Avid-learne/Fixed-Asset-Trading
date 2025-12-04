'use client'

import React from 'react'

export function KYCProgressBar({ status }: { status: 'Not Submitted' | 'Under Review' | 'Verified' | 'Rejected' | string }) {
  const cfg: Record<string, { pct: number; color: string }> = {
    'Not Submitted': { pct: 10, color: 'bg-gray-300' },
    'Under Review': { pct: 60, color: 'bg-yellow-400' },
    Verified: { pct: 100, color: 'bg-green-500' },
    Rejected: { pct: 100, color: 'bg-red-500' },
  }
  const c = cfg[status] || cfg['Not Submitted']
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-foreground">KYC Status</span>
        <span className="text-xs text-muted-foreground">{status}</span>
      </div>
      <div className="w-full h-2 bg-muted rounded">
        <div className={`h-2 rounded ${c.color}`} style={{ width: `${c.pct}%` }} />
      </div>
    </div>
  )
}
