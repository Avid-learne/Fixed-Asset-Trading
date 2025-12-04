'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UploadCloud } from 'lucide-react'

type Requirement = { id: string; name: string; status: 'Complete' | 'Pending' | 'Expired' }

const requirements: Requirement[] = []

export default function BankCompliancePage() {
  const [search, setSearch] = useState('')
  const filtered = requirements.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  const statusBadge = (s: Requirement['status']) => {
    switch (s) {
      case 'Complete': return <Badge className="bg-green-600 text-white">Complete</Badge>
      case 'Pending': return <Badge variant="outline">Pending</Badge>
      case 'Expired': return <Badge className="bg-red-600 text-white">Expired</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Compliance</h1>
          <p className="text-muted-foreground">Track institutional compliance status and requirements.</p>
        </div>
        <Button variant="outline"><UploadCloud className="mr-2 h-4 w-4" /> Upload Document</Button>
      </div>

      <Input placeholder="Search requirements" value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Requirement</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-muted-foreground" colSpan={2}>No compliance requirements found</td>
              </tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{statusBadge(r.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
