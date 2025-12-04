'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type Verification = { id: string; hospital: string; scope: string; status: 'Pending' | 'Verified' | 'Failed'; requestedAt: string }

const items: Verification[] = []

export default function BankVerificationsPage() {
  const [search, setSearch] = useState('')
  const filtered = items.filter(i => i.hospital.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()))

  const statusBadge = (s: Verification['status']) => {
    switch (s) {
      case 'Pending': return <Badge variant="outline">Pending</Badge>
      case 'Verified': return <Badge className="bg-green-600 text-white">Verified</Badge>
      case 'Failed': return <Badge className="bg-red-600 text-white">Failed</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Verifications</h1>
        <p className="text-muted-foreground">Manage verification requests and outcomes.</p>
      </div>

      <Input placeholder="Search by ID or hospital" value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Verification ID</th>
              <th className="p-3 text-left">Hospital</th>
              <th className="p-3 text-left">Scope</th>
              <th className="p-3 text-left">Requested</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-muted-foreground" colSpan={5}>No verifications found</td>
              </tr>
            ) : filtered.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-3 font-medium">{i.id}</td>
                <td className="p-3">{i.hospital}</td>
                <td className="p-3">{i.scope}</td>
                <td className="p-3">{i.requestedAt}</td>
                <td className="p-3">{statusBadge(i.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
