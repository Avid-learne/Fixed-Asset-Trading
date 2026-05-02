'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowRightCircle, Coins, Loader2, RefreshCw, Search, TrendingUp, ShieldOff } from 'lucide-react'
import { depositRequestService, type AssetDepositItem } from '@/services/depositRequestService'

const toNumber = (value: number | string | undefined | null) => Number(value || 0)

export default function HospitalPoolManagementPage() {
  const [pool1, setPool1] = useState<AssetDepositItem[]>([])
  const [pool2, setPool2] = useState<AssetDepositItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // showSpinner=true on the initial load and on the manual Refresh button — for the
  // background polling we update silently so the table doesn't flash a spinner every
  // tick while the admin is reading it.
  const load = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true)
      setError('')
      const [p1, p2] = await Promise.all([
        depositRequestService.getHospitalPool1(),
        depositRequestService.getHospitalPool2(),
      ])
      setPool1(p1)
      setPool2(p2)
    } catch (err) {
      // Background refreshes shouldn't paint a red banner if the network blips —
      // surface errors only on user-initiated loads.
      if (showSpinner) {
        setError(err instanceof Error ? err.message : 'Failed to load pools')
      }
    } finally {
      if (showSpinner) setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Silent refresh every 10s. Keeps the pool tables in sync with patient opt-out
    // changes, custody confirmations, and trade settlements without forcing the
    // admin to click Refresh.
    const id = window.setInterval(() => load(false), 10000)
    // Refresh immediately when the tab regains focus — covers admins coming back
    // from another tab where they just performed an action.
    const onFocus = () => load(false)
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return pool1
    return pool1.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.patientEmail.toLowerCase().includes(q) ||
        r.assetId.toLowerCase().includes(q)
    )
  }, [pool1, searchTerm])

  // Use the live (post-redemption) values from the assignment, falling back to the
  // original expected if currentPool1At is not provided by the backend.
  const currentAt = (r: AssetDepositItem) =>
    r.currentPool1At !== undefined ? toNumber(r.currentPool1At) : toNumber(r.expectedTokens)
  const currentValue = (r: AssetDepositItem) =>
    r.currentPool1ValuePkr !== undefined ? toNumber(r.currentPool1ValuePkr) : toNumber(r.assetValue)

  const totalAtPool1 = pool1.reduce((sum, r) => sum + currentAt(r), 0)
  const totalValuePool1 = pool1.reduce((sum, r) => sum + currentValue(r), 0)
  const totalAtPool2 = pool2.reduce((sum, r) => sum + currentAt(r), 0)
  const totalValuePool2 = pool2.reduce((sum, r) => sum + currentValue(r), 0)

  const moveToPool2 = async (row: AssetDepositItem) => {
    const ok = window.confirm(
      `Move ${currentAt(row).toLocaleString()} AT from patient ${row.patientName} into the Trading Pool?\n\n` +
        `Once moved, this AT is locked for the trading cycle and the patient can no longer use Emergency Redemption against it. ` +
        `Monthly baseline HT will start, and a profit share will be credited at cycle end.`
    )
    if (!ok) return
    try {
      setActionLoadingId(row.assetId)
      setError('')
      await depositRequestService.moveToTradingPool(row.assetId)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move AT')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 pb-8 pt-2 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pool Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Move minted AT from <strong>Pool 1 (Available)</strong> into <strong>Pool 2 (Trading)</strong> when the
          hospital is ready to begin a trading cycle.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-amber-800">Pool 1 — Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-700">{totalAtPool1.toLocaleString()} AT</p>
            <p className="text-xs text-amber-700 mt-1">{pool1.length} patient deposit(s) sitting idle, redeemable</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-slate-500">Pool 1 PKR Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">PKR {totalValuePool1.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Total backing value of idle AT</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-green-800">Pool 2 — Trading</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-700">{totalAtPool2.toLocaleString()} AT</p>
            <p className="text-xs text-green-700 mt-1">
              {pool2.length} asset(s) released for trading · PKR {totalValuePool2.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-600" />
              Pool 1 — Awaiting Hospital Decision
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  placeholder="Search patient, asset id"
                />
              </div>
              <Button variant="outline" onClick={load}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading Pool 1...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">AT in Pool 1</TableHead>
                  <TableHead className="text-right">Value (PKR)</TableHead>
                  <TableHead>Custody Confirmed</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-500">
                      Pool 1 is empty. AT will appear here after the bank confirms custody for a deposit.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.assetId}>
                      <TableCell className="font-mono text-xs">{row.assetId.slice(0, 8)}</TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-900">{row.patientName}</p>
                        <p className="text-xs text-slate-500">{row.patientEmail}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.assetType}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-amber-700">
                        <div>{currentAt(row).toLocaleString()} AT</div>
                        {currentAt(row) < toNumber(row.expectedTokens) && (
                          <div className="text-[10px] font-normal text-slate-500">
                            of {toNumber(row.expectedTokens).toLocaleString()} minted
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div>PKR {currentValue(row).toLocaleString()}</div>
                        {currentValue(row) < toNumber(row.assetValue) && (
                          <div className="text-[10px] font-normal text-slate-500">
                            of PKR {toNumber(row.assetValue).toLocaleString()} original
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {row.custodyConfirmedAt
                          ? new Date(row.custodyConfirmedAt).toLocaleString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.tradingOptOut ? (
                          <div className="inline-flex flex-col items-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="border-rose-200 text-rose-600 cursor-not-allowed"
                              title="Patient has blocked this asset from trading"
                            >
                              <ShieldOff className="h-4 w-4 mr-1" />
                              Blocked by patient
                            </Button>
                            <p className="text-[10px] text-rose-700">Re-enable from patient side</p>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={actionLoadingId === row.assetId}
                            onClick={() => moveToPool2(row)}
                          >
                            {actionLoadingId === row.assetId ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <ArrowRightCircle className="h-4 w-4 mr-1" />
                            )}
                            Move to Trading Pool
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-green-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-700" />
            Pool 2 — Trading Pool
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading Pool 2...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">AT in Pool 2</TableHead>
                  <TableHead className="text-right">Value (PKR)</TableHead>
                  <TableHead>Trading Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pool2.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                      Pool 2 is empty. AT will appear here after you move it from Pool 1 (above).
                    </TableCell>
                  </TableRow>
                ) : (
                  pool2.map((row) => (
                    <TableRow key={row.assetId}>
                      <TableCell className="font-mono text-xs">{row.assetId.slice(0, 8)}</TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-900">{row.patientName}</p>
                        <p className="text-xs text-slate-500">{row.patientEmail}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.assetType}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-700">
                        {currentAt(row).toLocaleString()} AT
                      </TableCell>
                      <TableCell className="text-right">PKR {currentValue(row).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Released — In Pool 2</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
