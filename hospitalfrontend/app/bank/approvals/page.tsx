'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Download, CheckCircle2, XCircle } from 'lucide-react'

type ApprovalItem = {
  id: string
  hospital: string
  assetType: string
  value: number
  status: 'Pending' | 'Reviewed' | 'Approved' | 'Rejected'
  submittedAt: string
}

const data: ApprovalItem[] = []

export default function BankApprovalsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('All')

  const filtered = data.filter((d) =>
    (status === 'All' || d.status === status) &&
    (d.id.toLowerCase().includes(search.toLowerCase()) || d.hospital.toLowerCase().includes(search.toLowerCase()))
  )

  const statusBadge = (s: ApprovalItem['status']) => {
    switch (s) {
      case 'Pending': return <Badge variant="outline">Pending</Badge>
      case 'Reviewed': return <Badge className="bg-muted">Reviewed</Badge>
      case 'Approved': return <Badge className="bg-green-600 text-white">Approved</Badge>
      case 'Rejected': return <Badge className="bg-red-600 text-white">Rejected</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Asset Approvals</h1>
          <p className="text-muted-foreground">Review and approve submitted assets from hospitals.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      <div className="flex gap-3">
        <Input placeholder="Search by ID or hospital" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Reviewed">Reviewed</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Request ID</th>
              <th className="p-3 text-left">Hospital</th>
              <th className="p-3 text-left">Asset Type</th>
              <th className="p-3 text-left">Value</th>
              <th className="p-3 text-left">Submitted</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-muted-foreground" colSpan={7}>No approval requests found</td>
              </tr>
            ) : filtered.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3 font-medium">{row.id}</td>
                <td className="p-3">{row.hospital}</td>
                <td className="p-3">{row.assetType}</td>
                <td className="p-3">${row.value.toLocaleString()}</td>
                <td className="p-3">{row.submittedAt}</td>
                <td className="p-3">{statusBadge(row.status)}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="default"><CheckCircle2 className="mr-1 h-4 w-4" /> Approve</Button>
                    <Button size="sm" variant="destructive"><XCircle className="mr-1 h-4 w-4" /> Reject</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
