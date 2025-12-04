'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileDown, Eye, Send } from 'lucide-react'
import { DataTable, StatusBadge } from '../../components'

interface Invoice {
  id: string
  invoiceNumber: string
  hospital: string
  hospitalId: string
  amount: number
  tax: number
  total: number
  status: 'paid' | 'pending' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate: string
  paidDate?: string
  plan: string
  billingPeriod: string
  paymentMethod: string
}

const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    invoiceNumber: 'INV-2024-001',
    hospital: 'Metro General Hospital',
    hospitalId: 'HOS-001',
    amount: 999,
    tax: 99.90,
    total: 1098.90,
    status: 'paid',
    issueDate: '2024-12-01',
    dueDate: '2024-12-15',
    paidDate: '2024-12-05',
    plan: 'Professional',
    billingPeriod: 'Dec 2024',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'INV-002',
    invoiceNumber: 'INV-2024-002',
    hospital: 'City Medical Center',
    hospitalId: 'HOS-002',
    amount: 499,
    tax: 49.90,
    total: 548.90,
    status: 'paid',
    issueDate: '2024-12-01',
    dueDate: '2024-12-20',
    paidDate: '2024-12-10',
    plan: 'Starter',
    billingPeriod: 'Dec 2024',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'INV-003',
    invoiceNumber: 'INV-2024-003',
    hospital: 'Regional Health Network',
    hospitalId: 'HOS-003',
    amount: 999,
    tax: 99.90,
    total: 1098.90,
    status: 'overdue',
    issueDate: '2024-11-01',
    dueDate: '2024-11-10',
    plan: 'Professional',
    billingPeriod: 'Nov 2024',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'INV-004',
    invoiceNumber: 'INV-2024-004',
    hospital: 'Sunrise Medical Institute',
    hospitalId: 'HOS-004',
    amount: 499,
    tax: 49.90,
    total: 548.90,
    status: 'pending',
    issueDate: '2024-12-01',
    dueDate: '2024-12-20',
    plan: 'Starter',
    billingPeriod: 'Dec 2024',
    paymentMethod: 'Invoice (NET 30)'
  }
]

export default function InvoicesPage() {
  const [invoices] = useState<Invoice[]>(mockInvoices)
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = {
    totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
    pendingAmount: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0),
    overdueAmount: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0),
    totalInvoices: invoices.length
  }

  const handleExport = () => {
    const csv = [
      ['Invoice #', 'Hospital', 'Plan', 'Period', 'Amount', 'Tax', 'Total', 'Status', 'Issue Date', 'Due Date', 'Paid Date'],
      ...invoices.map(inv => [
        inv.invoiceNumber, inv.hospital, inv.plan, inv.billingPeriod, inv.amount, 
        inv.tax, inv.total, inv.status, inv.issueDate, inv.dueDate, inv.paidDate || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices-${new Date().toISOString()}.csv`
    a.click()
  }

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      sortable: true,
      render: (value: string, row: Invoice) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-600">{row.billingPeriod}</div>
        </div>
      )
    },
    {
      key: 'hospital',
      label: 'Hospital',
      sortable: true,
      render: (value: string, row: Invoice) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <Badge variant="outline" className="text-xs">{row.plan}</Badge>
        </div>
      )
    },
    {
      key: 'total',
      label: 'Amount',
      sortable: true,
      render: (value: number, row: Invoice) => (
        <div>
          <div className="font-medium text-gray-900">${value.toFixed(2)}</div>
          <div className="text-xs text-gray-600">Tax: ${row.tax.toFixed(2)}</div>
        </div>
      )
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-900">{value}</span>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (value: string, row: Invoice) => (
        <div>
          <div className="text-sm text-gray-900">{value}</div>
          {row.paidDate && (
            <div className="text-xs text-green-600">Paid: {row.paidDate}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => {
        const statusMap: Record<string, any> = {
          paid: 'success',
          pending: 'pending',
          overdue: 'error',
          cancelled: 'inactive'
        }
        return <StatusBadge status={statusMap[value]} text={value} size="sm" />
      }
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: any, row: Invoice) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="gap-1">
            <Eye className="h-3 w-3" />
            View
          </Button>
          {row.status === 'pending' && (
            <Button variant="ghost" size="sm" className="gap-1 text-cyan-600">
              <Send className="h-3 w-3" />
              Send
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices & Billing</h1>
          <p className="text-gray-600 mt-1">Manage hospital invoices and payment tracking</p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <FileDown className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-600">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-600">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">${stats.pendingAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">${stats.overdueAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-600">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={invoices}
            columns={columns}
            searchPlaceholder="Search invoices..."
            pageSize={10}
            emptyMessage="No invoices found"
          />
        </CardContent>
      </Card>
    </div>
  )
}
