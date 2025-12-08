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

const assetDepositRequests: ApprovalItem[] = [
  {
    id: 'REQ-001',
    hospital: 'Liaquat National Hospital',
    assetType: 'Gold Bars (100g)',
    value: 520000,
    status: 'Pending',
    submittedAt: '2024-12-08'
  },
  {
    id: 'REQ-002',
    hospital: 'Liaquat National Hospital',
    assetType: 'Silver Bars (500g)',
    value: 180000,
    status: 'Pending',
    submittedAt: '2024-12-07'
  },
  {
    id: 'REQ-003',
    hospital: 'Liaquat National Hospital',
    assetType: 'Gold Bars (120g)',
    value: 624000,
    status: 'Reviewed',
    submittedAt: '2024-12-07'
  },
  {
    id: 'REQ-004',
    hospital: 'Liaquat National Hospital',
    assetType: 'Gold Jewelry (150g)',
    value: 780000,
    status: 'Pending',
    submittedAt: '2024-12-08'
  },
  {
    id: 'REQ-005',
    hospital: 'Liaquat National Hospital',
    assetType: 'Silver Coins (1kg)',
    value: 360000,
    status: 'Pending',
    submittedAt: '2024-12-07'
  },
  {
    id: 'REQ-006',
    hospital: 'Liaquat National Hospital',
    assetType: 'Gold Coins (75g)',
    value: 390000,
    status: 'Approved',
    submittedAt: '2024-12-06'
  },
  {
    id: 'REQ-007',
    hospital: 'Liaquat National Hospital',
    assetType: 'Platinum Bars (50g)',
    value: 950000,
    status: 'Rejected',
    submittedAt: '2024-12-05'
  },
]

export default function BankApprovalsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('All')

  const handleApprove = (id: string, hospital: string) => {
    alert(`Approved request ${id} from ${hospital}. In production, this would update the backend.`)
  }

  const handleReject = (id: string, hospital: string) => {
    if (confirm(`Are you sure you want to reject request ${id} from ${hospital}?`)) {
      alert(`Rejected request ${id}. In production, this would update the backend.`)
    }
  }

  const handleExport = () => {
    alert('Exporting data to CSV... In production, this would generate and download a CSV file.')
  }

  const filteredDeposits = assetDepositRequests.filter((d) =>
    (status === 'All' || d.status === status) &&
    (d.id.toLowerCase().includes(search.toLowerCase()) || d.hospital.toLowerCase().includes(search.toLowerCase()))
  )

  const statusBadge = (s: 'Pending' | 'Reviewed' | 'Approved' | 'Rejected') => {
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
          <h1 className="text-2xl font-semibold">Asset Deposit Requests</h1>
          <p className="text-muted-foreground">Review and approve submitted assets from hospitals.</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
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
            {filteredDeposits.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-muted-foreground" colSpan={7}>No deposit requests found</td>
              </tr>
            ) : filteredDeposits.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3 font-medium">{row.id}</td>
                <td className="p-3">{row.hospital}</td>
                <td className="p-3">{row.assetType}</td>
                <td className="p-3">${row.value.toLocaleString()}</td>
                <td className="p-3">{row.submittedAt}</td>
                <td className="p-3">{statusBadge(row.status)}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" onClick={() => handleApprove(row.id, row.hospital)}>
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(row.id, row.hospital)}>
                      <XCircle className="mr-1 h-4 w-4" /> Reject
                    </Button>
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
