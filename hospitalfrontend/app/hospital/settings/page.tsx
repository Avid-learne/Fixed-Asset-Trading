'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Save, RefreshCw, Shield, Network, Bell, Database, Eye, Download, CheckCircle, AlertTriangle, Copy, ExternalLink, Zap, Lock, Users, Smartphone, Clock, Info, Mail } from 'lucide-react'

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
  const searchParams = useSearchParams()
  const [settings, setSettings] = useState<HospitalSettings>(initialSettings)
  const [kycSettings, setKycSettings] = useState<KYCSettings>(initialKYC)
  const [blockchainSettings, setBlockchainSettings] = useState<BlockchainSettings>(initialBlockchain)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotifications)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [lastBackupTime, setLastBackupTime] = useState<string>('December 4, 2024 at 9:15 AM')
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('general')
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false)
  const [showNetworkTestDialog, setShowNetworkTestDialog] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [networkStatus, setNetworkStatus] = useState('connecting')

  // Set tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      setSelectedTab(tabParam)
    }
  }, [searchParams])

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaved(true)
    setIsLoading(false)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const addAuditLog = (action: string, details: string, status: 'success' | 'warning' | 'error') => {
    const newLog: AuditLog = {
      id: `AUD-${String(auditLogs.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      user: 'admin@lnh.com',
      action,
      details,
      status
    }
    setAuditLogs([newLog, ...auditLogs])
  }

  const handleBackup = async () => {
    try {
      addAuditLog('Backup Initiated', 'Creating full system backup...', 'success')
      await new Promise(resolve => setTimeout(resolve, 1500))
      const now = new Date()
      const backupTime = now.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
      setLastBackupTime(backupTime)
      const filename = `LNH_Backup_${new Date().toISOString().split('T')[0]}.zip`
      addAuditLog('Backup Created', `Full system backup completed successfully - File: ${filename} (Size: 2.3 GB)`, 'success')
      alert(`Backup created successfully!\nBackup file: ${filename}`)
    } catch (error) {
      addAuditLog('Backup Failed', 'Backup creation failed due to system error', 'error')
      alert('Backup failed. Please try again.')
    }
  }

  const handleRestore = async () => {
    try {
      addAuditLog('Restore Initiated', 'Restoring system from backup...', 'success')
      await new Promise(resolve => setTimeout(resolve, 2000))
      addAuditLog('Restore Completed', 'System successfully restored from backup file', 'success')
      alert('Data restored successfully from backup!')
    } catch (error) {
      addAuditLog('Restore Failed', 'Restore operation failed - invalid backup file', 'error')
      alert('Restore failed. Please try again.')
    }
  }

  const handleTestEmail = async () => {
    console.log('Sending test email to:', testEmail)
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert(`Test email sent successfully to ${testEmail}`)
    setShowTestEmailDialog(false)
    setTestEmail('')
  }

  const handleTestNetwork = async () => {
    setNetworkStatus('connecting')
    await new Promise(resolve => setTimeout(resolve, 2000))
    setNetworkStatus('connected')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
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
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Hospital Information
              </CardTitle>
              <CardDescription>Basic hospital details and operational parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Hospital Name</label>
                  <Input
                    value={settings.hospitalName}
                    onChange={(e) => setSettings({...settings, hospitalName: e.target.value})}
                    placeholder="Enter hospital name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Official name of the hospital</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Hospital Code</label>
                  <Input
                    value={settings.hospitalCode}
                    onChange={(e) => setSettings({...settings, hospitalCode: e.target.value})}
                    placeholder="e.g., LNH-001"
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier for the hospital</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Contact Email</label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                    placeholder="admin@hospital.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Primary contact email address</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Contact Phone</label>
                  <Input
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                    placeholder="+92 21 111 456 456"
                  />
                  <p className="text-xs text-gray-500 mt-1">Primary contact phone number</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Operational Parameters
              </CardTitle>
              <CardDescription>Configure deposit limits, fees, and thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Max Deposit Value (PKR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-600 font-medium">₨</span>
                    <Input
                      type="number"
                      value={settings.maxDepositValue}
                      onChange={(e) => setSettings({...settings, maxDepositValue: parseFloat(e.target.value)})}
                      placeholder="500000"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Maximum allowed deposit amount</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Min Deposit Value (PKR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-600 font-medium">₨</span>
                    <Input
                      type="number"
                      value={settings.minDepositValue}
                      onChange={(e) => setSettings({...settings, minDepositValue: parseFloat(e.target.value)})}
                      placeholder="1000"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum allowed deposit amount</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tokenization Fee</label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.tokenizationFeePercent}
                      onChange={(e) => setSettings({...settings, tokenizationFeePercent: parseFloat(e.target.value)})}
                      placeholder="2.5"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Fee charged per tokenization</p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-semibold">Deposit Range (PKR)</p>
                  <p className="text-sm font-bold text-blue-900">₨{settings.minDepositValue.toLocaleString()} - ₨{settings.maxDepositValue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 font-semibold">Fee Per Deposit</p>
                  <p className="text-sm font-bold text-green-900">{settings.tokenizationFeePercent}%</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 font-semibold">Max Fee Amount (PKR)</p>
                  <p className="text-sm font-bold text-purple-900">₨{(settings.maxDepositValue * settings.tokenizationFeePercent / 100).toLocaleString()}</p>
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
              <div className="grid grid-cols-2 gap-4">
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
                  <p className="text-xs text-gray-500 mt-1">Select which KYC provider to use</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Verification Level</label>
                  <Select value={kycSettings.verificationLevel} onValueChange={(value: any) => setKycSettings({...kycSettings, verificationLevel: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic">Basic (ID only)</SelectItem>
                      <SelectItem value="Standard">Standard (ID + Address)</SelectItem>
                      <SelectItem value="Enhanced">Enhanced (Full KYC)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Strictness level of verification</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  API Key
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    value={kycSettings.apiKey}
                    onChange={(e) => setKycSettings({...kycSettings, apiKey: e.target.value})}
                    placeholder="Enter API key"
                  />
                  <button
                    onClick={() => copyToClipboard(kycSettings.apiKey)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">API key for KYC provider authentication</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Required Documents
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {['Government ID', 'Proof of Address', 'Selfie', 'Bank Statement'].map(doc => (
                    <div key={doc} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={doc}
                        checked={kycSettings.requiredDocuments.includes(doc)}
                      />
                      <label htmlFor={doc} className="text-sm font-medium cursor-pointer">{doc}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-3">
                <Checkbox
                  id="autoApprove"
                  checked={kycSettings.autoApprove}
                  onCheckedChange={(checked) => setKycSettings({...kycSettings, autoApprove: checked as boolean})}
                />
                <div className="flex-1">
                  <label htmlFor="autoApprove" className="text-sm font-medium block">Auto-approve Verified Patients</label>
                  <p className="text-xs text-blue-600">Automatically approve patients who pass KYC verification</p>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Network</label>
                  <Select value={blockchainSettings.network} onValueChange={(value: any) => setBlockchainSettings({...blockchainSettings, network: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ethereum">Ethereum Mainnet</SelectItem>
                      <SelectItem value="Polygon">Polygon (Recommended)</SelectItem>
                      <SelectItem value="Base">Base</SelectItem>
                      <SelectItem value="Arbitrum">Arbitrum</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Select blockchain network</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Confirmations Required</label>
                  <Input
                    type="number"
                    value={blockchainSettings.confirmationsRequired}
                    onChange={(e) => setBlockchainSettings({...blockchainSettings, confirmationsRequired: parseInt(e.target.value)})}
                    placeholder="12"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of block confirmations for finality</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  RPC URL
                </label>
                <div className="relative">
                  <Input
                    value={blockchainSettings.rpcUrl}
                    onChange={(e) => setBlockchainSettings({...blockchainSettings, rpcUrl: e.target.value})}
                    placeholder="https://..."
                  />
                  <button
                    onClick={() => copyToClipboard(blockchainSettings.rpcUrl)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">RPC endpoint for blockchain connection</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Contract Address
                </label>
                <div className="relative">
                  <Input
                    value={blockchainSettings.contractAddress}
                    onChange={(e) => setBlockchainSettings({...blockchainSettings, contractAddress: e.target.value})}
                    placeholder="0x..."
                  />
                  <button
                    onClick={() => copyToClipboard(blockchainSettings.contractAddress)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Smart contract address for tokens</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Gas Limit</label>
                  <Input
                    type="number"
                    value={blockchainSettings.gasLimit}
                    onChange={(e) => setBlockchainSettings({...blockchainSettings, gasLimit: parseInt(e.target.value)})}
                    placeholder="300000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum gas for transactions</p>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowNetworkTestDialog(true)}
              >
                <Zap className="h-4 w-4 mr-2" />
                Test Network Connection
              </Button>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <div>
                    <p className="text-sm text-green-900 font-medium">Network Status</p>
                    <p className="text-xs text-green-700">Connected to {blockchainSettings.network}</p>
                  </div>
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
                Notification Channels
              </CardTitle>
              <CardDescription>Configure how you receive system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive alerts via email</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked as boolean})}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">SMS Notifications</p>
                      <p className="text-xs text-gray-500">Receive alerts via SMS</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked as boolean})}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Push Notifications</p>
                      <p className="text-xs text-gray-500">Receive browser push alerts</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked as boolean})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Event Notifications
              </CardTitle>
              <CardDescription>Choose which events trigger notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm">Deposit Approval Required</p>
                  <p className="text-xs text-gray-500">When a deposit needs approval</p>
                </div>
                <Checkbox
                  checked={notificationSettings.depositApproval}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, depositApproval: checked as boolean})}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm">Token Minting Complete</p>
                  <p className="text-xs text-gray-500">When tokens are successfully minted</p>
                </div>
                <Checkbox
                  checked={notificationSettings.mintingComplete}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, mintingComplete: checked as boolean})}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm">Profit Allocation</p>
                  <p className="text-xs text-gray-500">When profits are allocated</p>
                </div>
                <Checkbox
                  checked={notificationSettings.profitAllocation}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, profitAllocation: checked as boolean})}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm">Low Balance Alert</p>
                  <p className="text-xs text-gray-500">When system balance is low</p>
                </div>
                <Checkbox
                  checked={notificationSettings.lowBalance}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, lowBalance: checked as boolean})}
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowTestEmailDialog(true)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Test Email
          </Button>
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
                <p className="text-sm text-yellow-700">{lastBackupTime}</p>
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
                  {auditLogs.map((log) => (
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

      {/* Test Email Dialog */}
      <Dialog open={showTestEmailDialog} onOpenChange={setShowTestEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>Send a test notification to verify email settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter email address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestEmailDialog(false)}>Cancel</Button>
            <Button onClick={handleTestEmail}>Send Test Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Network Test Dialog */}
      <Dialog open={showNetworkTestDialog} onOpenChange={setShowNetworkTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Network Connection</DialogTitle>
            <DialogDescription>Testing connection to {blockchainSettings.network}...</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6">
            {networkStatus === 'connecting' && (
              <div className="text-center">
                <div className="inline-block">
                  <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-sm text-gray-600 mt-3">Connecting to blockchain network...</p>
              </div>
            )}
            {networkStatus === 'connected' && (
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">Connection Successful</p>
                <p className="text-sm text-gray-600 mt-2">Successfully connected to {blockchainSettings.network}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowNetworkTestDialog(false)
              setNetworkStatus('connecting')
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  )
}
