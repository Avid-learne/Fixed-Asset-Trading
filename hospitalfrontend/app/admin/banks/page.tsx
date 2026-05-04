'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building2, Search, Loader2, List, UserPlus, Plus } from 'lucide-react'
import { superAdminService } from '@/services/superAdminService'
import type { SuperAdminDashboardSummary } from '@/services/dashboardService'

type BankRow = NonNullable<SuperAdminDashboardSummary['banks']>[number]

const statusClass = (status?: string) => {
  const normalized = (status || '').toUpperCase()
  if (normalized === 'VERIFIED' || normalized === 'ACTIVE') return 'bg-green-100 text-green-800 border-green-200'
  if (normalized === 'PENDING') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-red-100 text-red-800 border-red-200'
}

export default function BanksManagementPage() {
  const [rows, setRows] = useState<BankRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const summary = await superAdminService.getSummary()
        setRows(summary.banks || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load banks')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filtered = useMemo(() => rows.filter((b) => {
    const matchesSearch = b.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.bankId || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || (b.verificationStatus || '').toUpperCase() === statusFilter
    return matchesSearch && matchesStatus
  }), [rows, searchTerm, statusFilter])

  const totalDeposits = filtered.reduce((sum, b) => sum + Number(b.totalDeposits || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bank Management</h1>
        <p className="text-gray-500 mt-1">Live bank partner records from backend summary API</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 text-red-700 text-sm">{error}</CardContent>
        </Card>
      )}

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-emerald-50/80 p-1 rounded-xl">
          <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <List className="h-4 w-4 mr-2" />
            Bank List
          </TabsTrigger>
          <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Register Bank
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total Banks</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-gray-900">{rows.length}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Verified</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-700">{rows.filter((b) => (b.verificationStatus || '').toUpperCase() === 'VERIFIED').length}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total Deposits</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-gray-900">PKR {Math.round(totalDeposits).toLocaleString()}</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <CardTitle>Bank Directory</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input className="pl-10 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search banks..." />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading banks...
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Building2 className="w-10 h-10 mx-auto mb-2" />
                  No banks found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bank</TableHead>
                      <TableHead>Partnerships</TableHead>
                      <TableHead>Deposits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((bank) => (
                      <TableRow key={bank.bankId}>
                        <TableCell>
                          <Link href={`/admin/banks/${bank.bankId}`} className="font-medium text-gray-900 hover:underline">
                            {bank.bankName}
                          </Link>
                        </TableCell>
                        <TableCell>{bank.activePartnerships}</TableCell>
                        <TableCell>PKR {Math.round(Number(bank.totalDeposits || 0)).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={statusClass(bank.verificationStatus)}>{bank.verificationStatus}</Badge>
                        </TableCell>
                        <TableCell>{bank.createdAt ? new Date(bank.createdAt).toLocaleDateString() : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card className="border-emerald-100 bg-emerald-50/40">
            <CardContent className="pt-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Register Bank</h2>
                <p className="text-sm text-gray-600 mt-1">Open the bank registration form to add a new bank partner and start KYC verification.</p>
              </div>
              <Button asChild>
                <Link href="/admin/banks/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Register Bank
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
