'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FileDown, ExternalLink, Copy } from 'lucide-react'
import { DataTable, StatusBadge } from '../../components'

interface BlockchainTransaction {
  id: string
  txHash: string
  timestamp: string
  type: string
  from: string
  to: string
  amount: string
  tokenType: 'AT' | 'HT'
  status: 'success' | 'pending' | 'failed'
  gasUsed: string
  gasFee: string
  blockNumber: number
  hospital: string
}

const mockTransactions: BlockchainTransaction[] = [
  {
    id: 'TX-001',
    txHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
    timestamp: '2024-12-04 14:30:22',
    type: 'Token Mint',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    amount: '50,000',
    tokenType: 'AT',
    status: 'success',
    gasUsed: '125,432',
    gasFee: '0.0025',
    blockNumber: 51234567,
    hospital: 'Metro General Hospital'
  },
  {
    id: 'TX-002',
    txHash: '0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a',
    timestamp: '2024-12-04 13:15:45',
    type: 'Token Transfer',
    from: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    to: '0x5a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t',
    amount: '1,200',
    tokenType: 'AT',
    status: 'success',
    gasUsed: '85,234',
    gasFee: '0.0017',
    blockNumber: 51234512,
    hospital: 'Metro General Hospital'
  },
  {
    id: 'TX-003',
    txHash: '0x7c8d9e0f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    timestamp: '2024-12-04 12:45:18',
    type: 'Health Token Allocation',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g',
    amount: '5,000',
    tokenType: 'HT',
    status: 'success',
    gasUsed: '95,123',
    gasFee: '0.0019',
    blockNumber: 51234489,
    hospital: 'City Medical Center'
  },
  {
    id: 'TX-004',
    txHash: '0x3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j',
    timestamp: '2024-12-04 11:20:33',
    type: 'Token Burn',
    from: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    to: '0x0000000000000000000000000000000000000000',
    amount: '500',
    tokenType: 'AT',
    status: 'success',
    gasUsed: '72,456',
    gasFee: '0.0014',
    blockNumber: 51234445,
    hospital: 'Metro General Hospital'
  },
  {
    id: 'TX-005',
    txHash: '0x5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f',
    timestamp: '2024-12-04 10:05:12',
    type: 'Token Mint',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    amount: '25,000',
    tokenType: 'AT',
    status: 'failed',
    gasUsed: '0',
    gasFee: '0.0000',
    blockNumber: 0,
    hospital: 'Regional Health Network'
  }
]

export default function BlockchainTransactionsPage() {
  const [transactions] = useState<BlockchainTransaction[]>(mockTransactions)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = {
    total: transactions.length,
    success: transactions.filter(tx => tx.status === 'success').length,
    pending: transactions.filter(tx => tx.status === 'pending').length,
    failed: transactions.filter(tx => tx.status === 'failed').length,
    totalGas: transactions.reduce((sum, tx) => sum + parseFloat(tx.gasFee), 0).toFixed(4)
  }

  const handleExport = () => {
    const csv = [
      ['TX Hash', 'Timestamp', 'Type', 'From', 'To', 'Amount', 'Token', 'Status', 'Gas Used', 'Gas Fee', 'Block', 'Hospital'],
      ...transactions.map(tx => [
        tx.txHash, tx.timestamp, tx.type, tx.from, tx.to, tx.amount,
        tx.tokenType, tx.status, tx.gasUsed, tx.gasFee, tx.blockNumber, tx.hospital
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blockchain-transactions-${new Date().toISOString()}.csv`
    a.click()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value.split(' ')[0]}</div>
          <div className="text-gray-600">{value.split(' ')[1]}</div>
        </div>
      )
    },
    {
      key: 'txHash',
      label: 'Transaction Hash',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {value.slice(0, 10)}...{value.slice(-8)}
          </code>
          <button 
            onClick={() => copyToClipboard(value)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Copy className="h-3 w-3" />
          </button>
          <a 
            href={`https://polygonscan.com/tx/${value}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-600 hover:text-cyan-700"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string, row: BlockchainTransaction) => (
        <div>
          <Badge variant="outline">{value}</Badge>
          <div className="text-xs text-gray-600 mt-1">{row.hospital}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: string, row: BlockchainTransaction) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-600">{row.tokenType}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <StatusBadge status={value as any} size="sm" />
      )
    },
    {
      key: 'gasUsed',
      label: 'Gas',
      render: (value: string, row: BlockchainTransaction) => (
        <div className="text-xs">
          <div className="text-gray-900">{value}</div>
          <div className="text-gray-600">{row.gasFee} MATIC</div>
        </div>
      )
    },
    {
      key: 'blockNumber',
      label: 'Block',
      render: (value: number) => (
        <div className="text-sm font-mono text-gray-900">
          {value > 0 ? value.toLocaleString() : '-'}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blockchain Transactions</h1>
          <p className="text-gray-600 mt-1">Monitor all on-chain token operations</p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <FileDown className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-green-600">{stats.success}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Total Gas Fees</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalGas} MATIC</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Transaction Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mint">Token Mint</SelectItem>
                  <SelectItem value="transfer">Token Transfer</SelectItem>
                  <SelectItem value="burn">Token Burn</SelectItem>
                  <SelectItem value="allocation">Health Token Allocation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={transactions}
            columns={columns}
            searchPlaceholder="Search transactions..."
            pageSize={10}
            emptyMessage="No transactions found"
          />
        </CardContent>
      </Card>
    </div>
  )
}
