'use client'

import React from 'react'

export type ActivityItem = { id: string; title: string; time: string; status?: string }

export function ActivityList({ items }: { items: ActivityItem[] }) {
  if (!items || items.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No recent activity</p>
  }
  return (
    <div className="space-y-3">
      {items.map((a) => (
        <div key={a.id} className="flex items-center justify-between p-3 border rounded-md">
          <div>
            <p className="font-medium text-foreground">{a.title}</p>
            <p className="text-xs text-muted-foreground">{a.time}</p>
          </div>
          {a.status ? <span className="text-xs text-muted-foreground">{a.status}</span> : null}
        </div>
      ))}
    </div>
  )
}
