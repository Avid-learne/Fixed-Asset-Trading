'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { FileText, Download, Calendar, Mail, Search, Filter, Clock, FileSpreadsheet, FileBarChart, Users, Coins, TrendingUp, Eye, Play, Settings } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface ReportTemplate {
  id: string
  name: string
  category: 'Financial' | 'Operational' | 'Compliance' | 'Patient Analytics'
  description: string
  format: 'PDF' | 'Excel' | 'CSV'
  lastGenerated: string | null
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'On-Demand'
  recipients: string[]
}

interface ScheduledReport {
  id: string
  templateId: string
  templateName: string
  nextRun: string
  frequency: string
  status: 'active' | 'paused'
  recipients: string[]
}

interface GeneratedReport {
  id: string
  name: string
  category: string
  generatedAt: string
  format: string
  size: string
  status: 'completed' | 'generating' | 'failed'
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'TEMP-001',
    name: 'Monthly Financial Summary',
    category: 'Financial',
    description: 'Comprehensive financial overview including deposits, minting, and profit allocation',
    format: 'PDF',
    lastGenerated: '2024-12-01',
    frequency: 'Monthly',
    recipients: ['admin@hospital.com', 'finance@hospital.com']
  },
  {
    id: 'TEMP-002',
    name: 'Token Minting Report',
    category: 'Operational',
    description: 'Details of all token minting activities with blockchain transaction hashes',
    format: 'Excel',
    lastGenerated: '2024-12-04',
    frequency: 'Weekly',
    recipients: ['operations@hospital.com']
  },
  {
    id: 'TEMP-003',
    name: 'KYC Compliance Report',
    category: 'Compliance',
    description: 'Patient verification status and compliance metrics',
    format: 'PDF',
    lastGenerated: '2024-11-30',
    frequency: 'Monthly',
    recipients: ['compliance@hospital.com', 'legal@hospital.com']
  },
  {
    id: 'TEMP-004',
    name: 'Patient Portfolio Analytics',
    category: 'Patient Analytics',
    description: 'Individual patient portfolio performance and asset distribution',
    format: 'Excel',
    lastGenerated: null,
    frequency: 'On-Demand',
    recipients: ['admin@hospital.com']
  },
  {
    id: 'TEMP-005',
    name: 'Deposit Approval Summary',
    category: 'Operational',
    description: 'Summary of pending, approved, and rejected deposits',
    format: 'CSV',
    lastGenerated: '2024-12-03',
    frequency: 'Daily',
    recipients: ['operations@hospital.com', 'admin@hospital.com']
  },
  {
    id: 'TEMP-006',
    name: 'Trading Performance Report',
    category: 'Financial',
    description: 'Analysis of trading pool performance and ROI metrics',
    format: 'PDF',
    lastGenerated: '2024-12-02',
    frequency: 'Quarterly',
    recipients: ['finance@hospital.com']
  },
]

const scheduledReports: ScheduledReport[] = [
  {
    id: 'SCHED-001',
    templateId: 'TEMP-002',
    templateName: 'Token Minting Report',
    nextRun: '2024-12-08 09:00',
    frequency: 'Weekly',
    status: 'active',
    recipients: ['operations@hospital.com']
  },
  {
    id: 'SCHED-002',
    templateId: 'TEMP-005',
    templateName: 'Deposit Approval Summary',
    nextRun: '2024-12-05 08:00',
    frequency: 'Daily',
    status: 'active',
    recipients: ['operations@hospital.com', 'admin@hospital.com']
  },
  {
    id: 'SCHED-003',
    templateId: 'TEMP-001',
    templateName: 'Monthly Financial Summary',
    nextRun: '2025-01-01 00:00',
    frequency: 'Monthly',
    status: 'active',
    recipients: ['admin@hospital.com', 'finance@hospital.com']
  },
]

const generatedReports: GeneratedReport[] = [
  {
    id: 'REP-001',
    name: 'Token Minting Report - Week 48',
    category: 'Operational',
    generatedAt: '2024-12-04 09:15',
    format: 'Excel',
    size: '2.4 MB',
    status: 'completed'
  },
  {
    id: 'REP-002',
    name: 'Deposit Approval Summary - 2024-12-03',
    category: 'Operational',
    generatedAt: '2024-12-03 08:05',
    format: 'CSV',
    size: '156 KB',
    status: 'completed'
  },
  {
    id: 'REP-003',
    name: 'Monthly Financial Summary - November 2024',
    category: 'Financial',
    generatedAt: '2024-12-01 00:15',
    format: 'PDF',
    size: '4.8 MB',
    status: 'completed'
  },
  {
    id: 'REP-004',
    name: 'Trading Performance Report - Q4 2024',
    category: 'Financial',
    generatedAt: '2024-12-02 16:30',
    format: 'PDF',
    size: '3.2 MB',
    status: 'completed'
  },
  {
    id: 'REP-005',
    name: 'KYC Compliance Report - November 2024',
    category: 'Compliance',
    generatedAt: '2024-11-30 23:45',
    format: 'PDF',
    size: '1.8 MB',
    status: 'completed'
  },
]

const kpiData = [
  { month: 'Jun', deposits: 45, minting: 120, allocation: 85 },
  { month: 'Jul', deposits: 52, minting: 145, allocation: 98 },
  { month: 'Aug', deposits: 48, minting: 138, allocation: 92 },
  { month: 'Sep', deposits: 61, minting: 168, allocation: 115 },
  { month: 'Oct', deposits: 58, minting: 172, allocation: 128 },
  { month: 'Nov', deposits: 67, minting: 195, allocation: 142 },
]

const categoryDistribution = [
  { name: 'Financial', value: 35, count: 2 },
  { name: 'Operational', value: 40, count: 3 },
  { name: 'Compliance', value: 15, count: 1 },
  { name: 'Patient Analytics', value: 10, count: 1 },
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

export default function ReportsPage() {
  const [selectedTab, setSelectedTab] = useState('templates')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [generateDateRange, setGenerateDateRange] = useState({ from: '', to: '' })
  const [generateFormat, setGenerateFormat] = useState('')
  const [generateRecipients, setGenerateRecipients] = useState('')

  const filteredTemplates = reportTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getCategoryBadge = (category: string) => {
    switch(category) {
      case 'Financial': return <Badge className="bg-blue-100 text-blue-800">Financial</Badge>
      case 'Operational': return <Badge className="bg-green-100 text-green-800">Operational</Badge>
      case 'Compliance': return <Badge className="bg-orange-100 text-orange-800">Compliance</Badge>
      case 'Patient Analytics': return <Badge className="bg-purple-100 text-purple-800">Patient Analytics</Badge>
      default: return <Badge>{category}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'generating': return <Badge className="bg-yellow-100 text-yellow-800">Generating</Badge>
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'paused': return <Badge className="bg-gray-100 text-gray-800">Paused</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const getFormatIcon = (format: string) => {
    switch(format) {
      case 'PDF': return <FileText className="h-4 w-4 text-red-600" />
      case 'Excel': return <FileSpreadsheet className="h-4 w-4 text-green-600" />
      case 'CSV': return <FileBarChart className="h-4 w-4 text-blue-600" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const handleGenerateReport = () => {
    console.log('Generating report:', selectedTemplate?.id, generateDateRange, generateFormat)
    setShowGenerateDialog(false)
    setGenerateDateRange({ from: '', to: '' })
    setGenerateFormat('')
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate, schedule, and manage hospital reports</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Report Templates</p>
                <p className="text-2xl font-bold">{reportTemplates.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled Reports</p>
                <p className="text-2xl font-bold">{scheduledReports.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Generated This Month</p>
                <p className="text-2xl font-bold">{generatedReports.length}</p>
              </div>
              <Download className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Email Recipients</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Mail className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="generated">Generated Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Report Templates</CardTitle>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Operational">Operational</SelectItem>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                      <SelectItem value="Patient Analytics">Patient Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getFormatIcon(template.format)}
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            {getCategoryBadge(template.category)}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {template.frequency}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {template.recipients.length} recipients
                            </div>
                            {template.lastGenerated && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Last: {template.lastGenerated}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template)
                              setGenerateFormat(template.format)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template)
                              setGenerateFormat(template.format)
                              setShowGenerateDialog(true)
                            }}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Generate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Scheduled Reports</CardTitle>
                <Button onClick={() => setShowScheduleDialog(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule New Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium">{report.templateName}</h4>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {report.frequency}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {report.nextRun}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {report.recipients.length} recipients
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        {report.status === 'active' ? 'Pause' : 'Resume'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generatedReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      {getFormatIcon(report.format)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium">{report.name}</h4>
                          {getStatusBadge(report.status)}
                        </div>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <div>{getCategoryBadge(report.category)}</div>
                          <div>{report.generatedAt}</div>
                          <div>{report.size}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Report Generation Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={kpiData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="deposits" stroke="#3B82F6" strokeWidth={2} name="Deposit Reports" />
                    <Line type="monotone" dataKey="minting" stroke="#10B981" strokeWidth={2} name="Minting Reports" />
                    <Line type="monotone" dataKey="allocation" stroke="#F59E0B" strokeWidth={2} name="Allocation Reports" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reports by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Most Generated Report Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6" name="Report Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Generate Report
            </DialogTitle>
            <DialogDescription>
              Configure and generate {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">From Date</label>
                <Input
                  type="date"
                  value={generateDateRange.from}
                  onChange={(e) => setGenerateDateRange({ ...generateDateRange, from: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">To Date</label>
                <Input
                  type="date"
                  value={generateDateRange.to}
                  onChange={(e) => setGenerateDateRange({ ...generateDateRange, to: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Export Format</label>
              <Select value={generateFormat} onValueChange={setGenerateFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Excel">Excel</SelectItem>
                  <SelectItem value="CSV">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email Recipients (comma-separated)</label>
              <Input
                placeholder="admin@hospital.com, finance@hospital.com"
                value={generateRecipients}
                onChange={(e) => setGenerateRecipients(e.target.value)}
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900 font-medium mb-1">Report Preview</p>
              <p className="text-sm text-blue-700">
                {selectedTemplate?.description}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport}>
              <Play className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Report
            </DialogTitle>
            <DialogDescription>
              Set up automatic report generation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Template</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a report template" />
                </SelectTrigger>
                <SelectContent>
                  {reportTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Frequency</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input type="date" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Time</label>
                <Input type="time" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Recipients</label>
              <Input placeholder="admin@hospital.com, finance@hospital.com" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowScheduleDialog(false)}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
