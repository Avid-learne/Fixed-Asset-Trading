'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Download } from 'lucide-react'

type AuditLog = { id: string; action: string; user: string; resource: string; timestamp: string; severity: 'info' | 'warning' | 'error' }

const logs: AuditLog[] = []

export default function BankAuditsPage() {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState<string>('All')

  const filtered = logs.filter(l =>
    (severity === 'All' || l.severity === severity) &&
    (l.action.toLowerCase().includes(search.toLowerCase()) || l.resource.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audits</h1>
          <p className="text-muted-foreground">Audit logs and institutional audit trails.</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Logs</Button>
      </div>

      <div className="flex gap-3">
        <Input placeholder="Search actions/resources" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Resource</th>
              <th className="p-3 text-left">Severity</th>
              <th className="p-3 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-muted-foreground" colSpan={5}>No audit logs found</td>
              </tr>
            ) : filtered.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3">{l.action}</td>
                <td className="p-3">{l.user}</td>
                <td className="p-3">{l.resource}</td>
                <td className="p-3 capitalize">{l.severity}</td>
                <td className="p-3">{l.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
