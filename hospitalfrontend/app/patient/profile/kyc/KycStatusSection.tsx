import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KycStatusEntry } from '../data'
import { CheckCircle2, Clock, UploadCloud } from 'lucide-react'

interface KycStatusSectionProps {
  items: KycStatusEntry[]
}

const statusBadgeMap: Record<KycStatusEntry['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  verified: { label: 'Verified', variant: 'default' },
  pending: { label: 'Pending Review', variant: 'secondary' },
  required: { label: 'Action Required', variant: 'destructive' },
}

const statusIconMap: Record<KycStatusEntry['status'], ReactNode> = {
  verified: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  pending: <Clock className="h-4 w-4 text-amber-500" />,
  required: <UploadCloud className="h-4 w-4 text-destructive" />,
}

export function KycStatusSection({ items }: KycStatusSectionProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>KYC &amp; Compliance Status</CardTitle>
        <CardDescription>Track the progress of your verification documents.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map(entry => {
          const badge = statusBadgeMap[entry.status]
          const icon = statusIconMap[entry.status]

          return (
            <div key={entry.title} className="flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 font-medium">
                  {icon}
                  <span>{entry.title}</span>
                </div>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{entry.description}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
