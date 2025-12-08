'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Save, RefreshCw, Shield, Network, Bell, Database, Eye, Download, CheckCircle, AlertTriangle } from 'lucide-react'

interface HospitalSettings {
  hospitalName: string
  hospitalCode: string
  contactEmail: string
  contactPhone: string
  maxDepositValue: number
  minDepositValue: number
  tokenizationFeePercent: number
}

interface KYCSettings {
  provider: 'Manual' | 'Onfido' | 'Jumio' | 'Sumsub'
  apiKey: string
  autoApprove: boolean
  requiredDocuments: string[]
  verificationLevel: 'Basic' | 'Standard' | 'Enhanced'
}

interface BlockchainSettings {
  network: 'Ethereum' | 'Polygon' | 'Base' | 'Arbitrum'
  rpcUrl: string
  contractAddress: string
  gasLimit: number
  confirmationsRequired: number
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  depositApproval: boolean
  mintingComplete: boolean
  profitAllocation: boolean
  lowBalance: boolean
}

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
  status: 'success' | 'warning' | 'error'
}

const initialSettings: HospitalSettings = {
  hospitalName: 'Liaquat National Hospital',
  hospitalCode: 'LNH-001',
  contactEmail: 'admin@lnh.com',
  contactPhone: '+92 21 111 456 456',
  maxDepositValue: 500000,
  minDepositValue: 1000,
  tokenizationFeePercent: 2.5,
}

const initialKYC: KYCSettings = {
  provider: 'Onfido',
  apiKey: 'sk_live_********************************',
  autoApprove: false,
  requiredDocuments: ['Government ID', 'Proof of Address', 'Selfie'],
  verificationLevel: 'Standard'
}

const initialBlockchain: BlockchainSettings = {
  network: 'Polygon',
  rpcUrl: 'https://polygon-rpc.com',
  contractAddress: '0x1234567890123456789012345678901234567890',
  gasLimit: 300000,
  confirmationsRequired: 12
}

const initialNotifications: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  depositApproval: true,
  mintingComplete: true,
  profitAllocation: true,
  lowBalance: true
}

const mockAuditLogs: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2024-12-04 10:30',
    user: 'admin@lnh.com',
    action: 'Updated Blockchain Settings',
    details: 'Changed network from Ethereum to Polygon',
    status: 'success'
  },
  {
    id: 'AUD-002',
    timestamp: '2024-12-04 09:15',
    user: 'admin@lnh.com',
    action: 'Backup Created',
    details: 'Full system backup completed successfully',
    status: 'success'
  },
  {
    id: 'AUD-003',
    timestamp: '2024-12-03 16:45',
    user: 'admin@lnh.com',
    action: 'KYC Settings Modified',
    details: 'Updated verification level to Enhanced',
    status: 'warning'
  },
  {
    id: 'AUD-004',
    timestamp: '2024-12-03 14:20',
    user: 'finance@lnh.com',
    action: 'Failed Backup Attempt',
    details: 'Insufficient storage space',
    status: 'error'
  },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<HospitalSettings>(initialSettings)
  const [kycSettings, setKycSettings] = useState<KYCSettings>(initialKYC)
  const [blockchainSettings, setBlockchainSettings] = useState<BlockchainSettings>(initialBlockchain)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotifications)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('general')

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaved(true)
    setIsLoading(false)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleBackup = () => {
    console.log('Creating backup...')
  }

  const handleRestore = () => {
    console.log('Restoring from backup...')
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure hospital system and integration settings</p>
        </div>
      </div>

      {isSaved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">Settings saved successfully</p>
        </div>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="kyc">KYC Settings</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup & Audit</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Information</CardTitle>
              <CardDescription>Basic hospital details and operational parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Hospital Name</label>
                  <Input
                    value={settings.hospitalName}
                    onChange={(e) => setSettings({...settings, hospitalName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Hospital Code</label>
                  <Input
                    value={settings.hospitalCode}
                    onChange={(e) => setSettings({...settings, hospitalCode: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Contact Email</label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Contact Phone</label>
                  <Input
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operational Parameters</CardTitle>
              <CardDescription>Configure deposit limits and fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Max Deposit Value ($)</label>
                  <Input
                    type="number"
                    value={settings.maxDepositValue}
                    onChange={(e) => setSettings({...settings, maxDepositValue: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Min Deposit Value ($)</label>
                  <Input
                    type="number"
                    value={settings.minDepositValue}
                    onChange={(e) => setSettings({...settings, minDepositValue: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tokenization Fee (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.tokenizationFeePercent}
                    onChange={(e) => setSettings({...settings, tokenizationFeePercent: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Settings */}
        <TabsContent value="kyc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                KYC Provider Configuration
              </CardTitle>
              <CardDescription>Configure third-party KYC verification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">KYC Provider</label>
                <Select value={kycSettings.provider} onValueChange={(value: any) => setKycSettings({...kycSettings, provider: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual Verification</SelectItem>
                    <SelectItem value="Onfido">Onfido</SelectItem>
                    <SelectItem value="Jumio">Jumio</SelectItem>
                    <SelectItem value="Sumsub">Sumsub</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">API Key</label>
                <Input
                  type="password"
                  value={kycSettings.apiKey}
                  onChange={(e) => setKycSettings({...kycSettings, apiKey: e.target.value})}
                  placeholder="Enter API key"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Verification Level</label>
                <Select value={kycSettings.verificationLevel} onValueChange={(value: any) => setKycSettings({...kycSettings, verificationLevel: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Enhanced">Enhanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoApprove"
                  checked={kycSettings.autoApprove}
                  onCheckedChange={(checked) => setKycSettings({...kycSettings, autoApprove: checked as boolean})}
                />
                <label htmlFor="autoApprove" className="text-sm font-medium">
                  Auto-approve verified patients
                </label>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Required Documents</label>
                <div className="space-y-2">
                  {['Government ID', 'Proof of Address', 'Selfie', 'Bank Statement'].map(doc => (
                    <div key={doc} className="flex items-center space-x-2">
                      <Checkbox
                        id={doc}
                        checked={kycSettings.requiredDocuments.includes(doc)}
                      />
                      <label htmlFor={doc} className="text-sm">{doc}</label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blockchain Settings */}
        <TabsContent value="blockchain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Blockchain Network Configuration
              </CardTitle>
              <CardDescription>Configure blockchain network and smart contract settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Network</label>
                <Select value={blockchainSettings.network} onValueChange={(value: any) => setBlockchainSettings({...blockchainSettings, network: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ethereum">Ethereum Mainnet</SelectItem>
                    <SelectItem value="Polygon">Polygon</SelectItem>
                    <SelectItem value="Base">Base</SelectItem>
                    <SelectItem value="Arbitrum">Arbitrum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">RPC URL</label>
                <Input
                  value={blockchainSettings.rpcUrl}
                  onChange={(e) => setBlockchainSettings({...blockchainSettings, rpcUrl: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Contract Address</label>
                <Input
                  value={blockchainSettings.contractAddress}
                  onChange={(e) => setBlockchainSettings({...blockchainSettings, contractAddress: e.target.value})}
                  placeholder="0x..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Gas Limit</label>
                  <Input
                    type="number"
                    value={blockchainSettings.gasLimit}
                    onChange={(e) => setBlockchainSettings({...blockchainSettings, gasLimit: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Confirmations Required</label>
                  <Input
                    type="number"
                    value={blockchainSettings.confirmationsRequired}
                    onChange={(e) => setBlockchainSettings({...blockchainSettings, confirmationsRequired: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-1">Network Status</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="text-sm text-emerald-700">Connected to {blockchainSettings.network}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Notification Channels</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Email Notifications</label>
                    <Checkbox
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked as boolean})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">SMS Notifications</label>
                    <Checkbox
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked as boolean})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Push Notifications</label>
                    <Checkbox
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked as boolean})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Event Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Deposit Approval Required</label>
                    <Checkbox
                      checked={notificationSettings.depositApproval}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, depositApproval: checked as boolean})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Token Minting Complete</label>
                    <Checkbox
                      checked={notificationSettings.mintingComplete}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, mintingComplete: checked as boolean})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Profit Allocation</label>
                    <Checkbox
                      checked={notificationSettings.profitAllocation}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, profitAllocation: checked as boolean})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Low Balance Alert</label>
                    <Checkbox
                      checked={notificationSettings.lowBalance}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, lowBalance: checked as boolean})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup & Audit */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup & Restore
              </CardTitle>
              <CardDescription>Manage system backups and data restoration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Database className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                      <h4 className="font-medium mb-2">Create Backup</h4>
                      <p className="text-sm text-gray-600 mb-4">Export current system state</p>
                      <Button onClick={handleBackup} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Create Backup
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <RefreshCw className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h4 className="font-medium mb-2">Restore Data</h4>
                      <p className="text-sm text-gray-600 mb-4">Import previous backup</p>
                      <Button onClick={handleRestore} variant="outline" className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Restore Backup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-900 font-medium">Last Backup</p>
                <p className="text-sm text-yellow-700">December 4, 2024 at 9:15 AM</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Audit Log
              </CardTitle>
              <CardDescription>Recent system changes and administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{log.timestamp}</TableCell>
                      <TableCell className="text-sm">{log.user}</TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell className="text-sm text-gray-600">{log.details}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 justify-end mt-6">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
