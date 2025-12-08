'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadCloud, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react'

type Requirement = { 
  id: string
  name: string
  description: string
  status: 'Complete' | 'Pending' | 'Expired'
  lastUpdated: string
  expiryDate?: string
}

const requirements: Requirement[] = [
  {
    id: 'COMP-001',
    name: 'Anti-Money Laundering (AML) Compliance',
    description: 'Annual certification and training for AML regulations and customer due diligence',
    status: 'Complete',
    lastUpdated: '2024-11-15',
    expiryDate: '2025-11-15'
  },
  {
    id: 'COMP-002',
    name: 'Know Your Customer (KYC) Documentation',
    description: 'Verification of hospital identity and ownership documents',
    status: 'Complete',
    lastUpdated: '2024-10-20',
    expiryDate: '2025-10-20'
  },
  {
    id: 'COMP-003',
    name: 'Asset Custody License',
    description: 'Valid regulatory license for operating secure vault facilities',
    status: 'Complete',
    lastUpdated: '2024-12-01',
    expiryDate: '2026-12-01'
  },
  {
    id: 'COMP-004',
    name: 'Financial Audit Report',
    description: 'Annual independent audit of financial statements and asset holdings',
    status: 'Pending',
    lastUpdated: '2024-12-05',
    expiryDate: '2024-12-31'
  },
  {
    id: 'COMP-005',
    name: 'Data Protection Certification',
    description: 'Compliance with data privacy laws and hospital information security standards',
    status: 'Complete',
    lastUpdated: '2024-09-10',
    expiryDate: '2025-09-10'
  },
  {
    id: 'COMP-006',
    name: 'Insurance Coverage Verification',
    description: 'Proof of adequate insurance for asset custody and funding operations',
    status: 'Complete',
    lastUpdated: '2024-11-30',
    expiryDate: '2025-11-30'
  },
  {
    id: 'COMP-007',
    name: 'Risk Assessment Documentation',
    description: 'Annual risk assessment for custody operations and funding agreements',
    status: 'Pending',
    lastUpdated: '2024-12-01',
    expiryDate: '2024-12-15'
  },
]

export default function BankCompliancePage() {
  const [search, setSearch] = useState('')
  
  const handleUploadDocument = () => {
    alert('Opening document upload dialog... In production, this would open a file upload modal for compliance documents.')
  }

  const handleViewDocument = (requirement: Requirement) => {
    alert(`Viewing compliance documents for:\n\n${requirement.name}\n\nDescription: ${requirement.description}\nStatus: ${requirement.status}\nLast Updated: ${requirement.lastUpdated}\n${requirement.expiryDate ? `Expiry: ${requirement.expiryDate}` : ''}\n\nIn production, this would open the document viewer.`)
  }
  const filtered = requirements.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  )

  const completeCount = requirements.filter(r => r.status === 'Complete').length
  const pendingCount = requirements.filter(r => r.status === 'Pending').length
  const expiredCount = requirements.filter(r => r.status === 'Expired').length

  const statusBadge = (s: Requirement['status']) => {
    switch (s) {
      case 'Complete': return <Badge className="bg-green-600 text-white"><CheckCircle className="w-3 h-3 mr-1" />Complete</Badge>
      case 'Pending': return <Badge className="bg-yellow-600 text-white"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'Expired': return <Badge className="bg-red-600 text-white"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Compliance</h1>
          <p className="text-muted-foreground">Track institutional compliance status and regulatory requirements.</p>
        </div>
        <Button variant="outline" onClick={handleUploadDocument}>
          <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Complete</CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requirements met</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{expiredCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Need renewal</p>
          </CardContent>
        </Card>
      </div>

      <Input placeholder="Search requirements..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Requirement</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Last Updated</th>
              <th className="p-3 text-left">Expiry Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-muted-foreground" colSpan={7}>No compliance requirements found</td>
              </tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.id}</td>
                <td className="p-3 font-semibold">{r.name}</td>
                <td className="p-3 max-w-xs text-sm text-muted-foreground">{r.description}</td>
                <td className="p-3">{r.lastUpdated}</td>
                <td className="p-3">{r.expiryDate || 'N/A'}</td>
                <td className="p-3">{statusBadge(r.status)}</td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" onClick={() => handleViewDocument(r)}>
                    <FileText className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
