'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Loader } from 'lucide-react'
import { auditLogService } from '@/services/auditLogService'
import type { AuditLog } from '@/types/auditLog'

export default function BankAuditsPage() {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState<string>('All')
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setIsLoading(true)
        // Fetch hospital audit logs (bank is considered part of hospital operations)
        const data = await auditLogService.getHospitalAuditLogs(100)
        setLogs(data)
      } catch (err) {
        console.error('Error fetching audit logs:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch audit logs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAuditLogs()
  }, [])

  const filtered = logs.filter(
    (l) =>
      (severity === 'All' || l.status === severity.toLowerCase()) &&
      (l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.user.toLowerCase().includes(search.toLowerCase()) ||
        l.details.toLowerCase().includes(search.toLowerCase()))
  )

  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audits</h1>
          <p className="text-muted-foreground">Audit logs and institutional audit trails.</p>
        </div>
        {/* Export button removed per project policy */}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Input
          placeholder="Search actions/users/details"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isLoading}
        />
        <Select value={severity} onValueChange={setSeverity} disabled={isLoading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failure">Failure</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Loading audit logs...</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Details</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-muted-foreground" colSpan={5}>
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="p-3 font-medium">{log.action}</td>
                    <td className="p-3">{log.user}</td>
                    <td className="p-3 text-muted-foreground">{log.details}</td>
                    <td className="p-3 capitalize">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : log.status === 'warning'
                              ? 'bg-yellow-100 text-yellow-800'
                              : log.status === 'failure' || log.status === 'error'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3">{log.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
