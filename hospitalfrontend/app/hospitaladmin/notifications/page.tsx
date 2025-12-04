'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Send, AlertTriangle, Info, CheckCircle } from 'lucide-react'

const alerts = [
    { id: 1, type: 'warning', title: 'High Gas Fees', message: 'Ethereum network gas fees are currently high. Consider delaying minting.', time: '2 hours ago' },
    { id: 2, type: 'info', title: 'System Maintenance', message: 'Scheduled maintenance for Bank API on Sunday 2 AM.', time: '5 hours ago' },
    { id: 3, type: 'success', title: 'Minting Successful', message: 'Batch #402 minted successfully (5000 AT).', time: '1 day ago' },
]

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notifications Center</h1>
        <p className="text-muted-foreground mt-1">Manage alerts and send announcements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className={`mt-1 ${
                                alert.type === 'warning' ? 'text-yellow-600' : 
                                alert.type === 'success' ? 'text-green-600' : 'text-blue-600'
                            }`}>
                                {alert.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : 
                                 alert.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-medium">{alert.title}</h4>
                                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Send Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Recipient Group</label>
                    <select className="w-full p-2 border rounded-md bg-background">
                        <option>All Patients</option>
                        <option>Hospital Staff</option>
                        <option>Specific User</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="Announcement Title" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea placeholder="Type your message here..." className="min-h-[150px]" />
                </div>
                <Button className="w-full"><Send className="w-4 h-4 mr-2" /> Send Message</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
