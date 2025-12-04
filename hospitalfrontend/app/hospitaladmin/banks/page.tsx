'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react'

const linkedBanks = [
    { id: 1, name: 'Global Trust Bank', status: 'Connected', assets: 12, pending: 2, latency: '45ms' },
    { id: 2, name: 'City Secure Bank', status: 'Connected', assets: 8, pending: 0, latency: '32ms' },
    { id: 3, name: 'Future Finance', status: 'Pending Approval', assets: 0, pending: 0, latency: '-' },
]

export default function BankIntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bank Integrations</h1>
          <p className="text-muted-foreground mt-1">Manage connections with custodian banks.</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Link New Bank</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {linkedBanks.map((bank) => (
            <Card key={bank.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${bank.status === 'Connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-2">
                            <Building className="w-5 h-5 text-primary" />
                        </div>
                        <Badge variant={bank.status === 'Connected' ? 'default' : 'outline'}>{bank.status}</Badge>
                    </div>
                    <CardTitle className="text-lg">{bank.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Assets in Custody</span>
                            <span className="font-medium">{bank.assets}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Pending Verifications</span>
                            <span className="font-medium">{bank.pending}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">API Latency</span>
                            <span className="font-medium">{bank.latency}</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex gap-2">
                        <Button variant="outline" size="sm" className="w-full">View Details</Button>
                        <Button variant="ghost" size="sm" className="w-full">Settings</Button>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Verification Queue Health</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5" />
                <div>
                    <p className="font-medium">All Systems Operational</p>
                    <p className="text-sm opacity-90">Bank APIs are responding within expected timeframes.</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
