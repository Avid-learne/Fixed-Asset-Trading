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
    recipients: ['admin@lnh.com', 'finance@lnh.com']
  },
  {
    id: 'TEMP-002',
    name: 'Token Minting Report',
    category: 'Operational',
    description: 'Details of all token minting activities with blockchain transaction hashes',
    format: 'Excel',
    lastGenerated: '2024-12-04',
    frequency: 'Weekly',
    recipients: ['operations@lnh.com']
  },
  {
    id: 'TEMP-003',
    name: 'KYC Compliance Report',
    category: 'Compliance',
    description: 'Patient verification status and compliance metrics',
    format: 'PDF',
    lastGenerated: '2024-11-30',
    frequency: 'Monthly',
    recipients: ['compliance@lnh.com', 'legal@lnh.com']
  },
  {
    id: 'TEMP-004',
    name: 'Patient Portfolio Analytics',
    category: 'Patient Analytics',
    description: 'Individual patient portfolio performance and asset distribution',
    format: 'Excel',
    lastGenerated: null,
    frequency: 'On-Demand',
    recipients: ['admin@lnh.com']
  },
  {
    id: 'TEMP-005',
    name: 'Deposit Approval Summary',
    category: 'Operational',
    description: 'Summary of pending, approved, and rejected deposits',
    format: 'CSV',
    lastGenerated: '2024-12-03',
    frequency: 'Daily',
    recipients: ['operations@lnh.com', 'admin@lnh.com']
  },
  {
    id: 'TEMP-006',
    name: 'Trading Performance Report',
    category: 'Financial',
    description: 'Analysis of trading pool performance and ROI metrics',
    format: 'PDF',
    lastGenerated: '2024-12-02',
    frequency: 'Quarterly',
    recipients: ['finance@lnh.com']
  },
]

const scheduledReportsInitial: ScheduledReport[] = [
  {
    id: 'SCHED-001',
    templateId: 'TEMP-002',
    templateName: 'Token Minting Report',
    nextRun: '2024-12-08 09:00',
    frequency: 'Weekly',
    status: 'active',
    recipients: ['operations@lnh.com']
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
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showScheduleSettingsDialog, setShowScheduleSettingsDialog] = useState(false)
  const [generateDateRange, setGenerateDateRange] = useState({ from: '', to: '' })
  const [generateFormat, setGenerateFormat] = useState('')
  const [generateRecipients, setGenerateRecipients] = useState('')
  const [selectedScheduledReport, setSelectedScheduledReport] = useState<ScheduledReport | null>(null)
  const [scheduleSettings, setScheduleSettings] = useState({ frequency: '', time: '', recipients: '' })
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(scheduledReportsInitial)
  const [selectedGeneratedReport, setSelectedGeneratedReport] = useState<GeneratedReport | null>(null)
  const [showGeneratedReportDialog, setShowGeneratedReportDialog] = useState(false)

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
      case 'CSV': return <FileBarChart className="h-4 w-4 text-emerald-600" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const handleGenerateReport = () => {
    console.log('Generating report:', selectedTemplate?.id, generateDateRange, generateFormat)
    setShowGenerateDialog(false)
    setGenerateDateRange({ from: '', to: '' })
    setGenerateFormat('')
  }

  const handleOpenScheduleSettings = (report: ScheduledReport) => {
    setSelectedScheduledReport(report)
    setScheduleSettings({
      frequency: report.frequency,
      time: report.nextRun.split(' ')[1] || '08:00',
      recipients: report.recipients.join(', ')
    })
    setShowScheduleSettingsDialog(true)
  }

  const handleSaveScheduleSettings = () => {
    if (!selectedScheduledReport) return
    
    console.log('Saving schedule settings:', selectedScheduledReport?.id, scheduleSettings)
    
    // Update the scheduled report in state
    setScheduledReports(scheduledReports.map(r => 
      r.id === selectedScheduledReport.id ? {
        ...r,
        frequency: scheduleSettings.frequency,
        recipients: scheduleSettings.recipients.split(',').map(e => e.trim())
      } : r
    ))
    
    setShowScheduleSettingsDialog(false)
    setSelectedScheduledReport(null)
  }

  const handleTogglePauseResume = (report: ScheduledReport) => {
    const newStatus = report.status === 'active' ? 'paused' : 'active'
    console.log(`${report.status === 'active' ? 'Pausing' : 'Resuming'} report:`, report.id)
    
    // Update the scheduled report status in state
    setScheduledReports(scheduledReports.map(r => 
      r.id === report.id ? { ...r, status: newStatus as 'active' | 'paused' } : r
    ))
  }

  const handleViewGeneratedReport = (report: GeneratedReport) => {
    console.log('Viewing generated report:', report.id)
    setSelectedGeneratedReport(report)
    setShowGeneratedReportDialog(true)
  }

  const handleDownloadReport = (report: GeneratedReport) => {
    console.log('Downloading report:', report.id, report.name)
    // In a real app, this would trigger a file download
    // For now, we'll show a success message
    alert(`Downloading: ${report.name}\nFormat: ${report.format}\nSize: ${report.size}`)
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
              <FileText className="h-8 w-8 text-emerald-600" />
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
                              setShowViewDialog(true)
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenScheduleSettings(report)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTogglePauseResume(report)}
                      >
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewGeneratedReport(report)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                      >
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
                <p className="text-sm text-gray-600 mt-1">Monthly report generation volume by type</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={kpiData} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      label={{ value: 'Month', position: 'insideBottomRight', offset: -15 }}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      label={{ value: 'Number of Reports', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }}
                      formatter={(value) => [value, '']}
                      labelStyle={{ color: '#1f2937' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Line type="monotone" dataKey="deposits" stroke="#3B82F6" strokeWidth={2.5} name="Deposit Reports" dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="minting" stroke="#10B981" strokeWidth={2.5} name="Minting Reports" dot={{ fill: '#10B981', r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="allocation" stroke="#F59E0B" strokeWidth={2.5} name="Allocation Reports" dot={{ fill: '#F59E0B', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reports by Category Distribution</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Percentage breakdown of report categories</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [`${value}% (${props.payload.count} reports)`, 'Distribution']}
                      contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Most Generated Report Types</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Frequency of report generation by category</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                  data={categoryDistribution}
                  margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Report Category', position: 'insideBottomCenter', offset: -30 }}
                  />
                  <YAxis 
                    label={{ value: 'Number Generated', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    formatter={(value) => [value, 'Reports Generated']}
                    labelStyle={{ color: '#1f2937' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3B82F6" 
                    name="Reports Generated"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Summary Table */}
              <div className="mt-6 border-t pt-4">
                <p className="text-sm font-semibold mb-3">Category Summary</p>
                <div className="grid grid-cols-2 gap-4">
                  {categoryDistribution.map((category, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Reports:</span>
                        <span className="font-semibold">{category.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Distribution:</span>
                        <span className="font-semibold">{category.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
              <p className="text-sm text-emerald-700">
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

      {/* View Report Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6 py-4">
              {/* Report Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="font-medium">{getCategoryBadge(selectedTemplate.category)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Format</p>
                  <div className="flex items-center gap-2">
                    {getFormatIcon(selectedTemplate.format)}
                    <p className="font-medium">{selectedTemplate.format}</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Frequency</p>
                  <p className="font-medium">{selectedTemplate.frequency}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Last Generated</p>
                  <p className="font-medium">{selectedTemplate.lastGenerated || 'Never'}</p>
                </div>
              </div>

              {/* Recipients */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Recipients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.recipients.map((email, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50">{email}</Badge>
                  ))}
                </div>
              </div>

              {/* Report Type Specific Content */}
              {selectedTemplate.category === 'Financial' && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Financial Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-600 mb-1">Total Deposits</p>
                      <p className="text-2xl font-bold text-blue-900">45,620,000 PKR</p>
                      <p className="text-xs text-blue-600 mt-2">↑ 12% from last month</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-600 mb-1">Total Minting Value</p>
                      <p className="text-2xl font-bold text-green-900">8,450,000 PKR</p>
                      <p className="text-xs text-green-600 mt-2">↑ 8% from last month</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-600 mb-1">Profit Allocation</p>
                      <p className="text-2xl font-bold text-purple-900">2,180,000 PKR</p>
                      <p className="text-xs text-purple-600 mt-2">↑ 5% from last month</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-600 mb-1">ROI Average</p>
                      <p className="text-2xl font-bold text-orange-900">4.8%</p>
                      <p className="text-xs text-orange-600 mt-2">↑ 0.3% from last month</p>
                    </div>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Financial Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={kpiData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="deposits" stroke="#3B82F6" strokeWidth={2} />
                          <Line type="monotone" dataKey="allocation" stroke="#F59E0B" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedTemplate.category === 'Operational' && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    Operational Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-600 mb-1">Approved Deposits</p>
                      <p className="text-2xl font-bold text-green-900">156</p>
                      <p className="text-xs text-green-600 mt-2">This month</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-600 mb-1">Pending Deposits</p>
                      <p className="text-2xl font-bold text-yellow-900">23</p>
                      <p className="text-xs text-yellow-600 mt-2">Awaiting verification</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-600 mb-1">Tokens Minted</p>
                      <p className="text-2xl font-bold text-blue-900">4,280</p>
                      <p className="text-xs text-blue-600 mt-2">Health Tokens</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-600 mb-1">Transactions</p>
                      <p className="text-2xl font-bold text-purple-900">892</p>
                      <p className="text-xs text-purple-600 mt-2">Completed</p>
                    </div>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Operational Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedTemplate.category === 'Compliance' && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Compliance Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-600 mb-1">KYC Verified</p>
                      <p className="text-2xl font-bold text-green-900">287</p>
                      <p className="text-xs text-green-600 mt-2">94.4% of total</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-600 mb-1">Pending Verification</p>
                      <p className="text-2xl font-bold text-yellow-900">17</p>
                      <p className="text-xs text-yellow-600 mt-2">5.6% of total</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-600 mb-1">AML Checks Passed</p>
                      <p className="text-2xl font-bold text-purple-900">287</p>
                      <p className="text-xs text-purple-600 mt-2">100% compliance</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-600 mb-1">Flagged for Review</p>
                      <p className="text-2xl font-bold text-red-900">2</p>
                      <p className="text-xs text-red-600 mt-2">Under investigation</p>
                    </div>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Compliance Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>KYC Verified (94.4%)</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '94.4%'}}></div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending (5.6%)</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{width: '5.6%'}}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedTemplate.category === 'Patient Analytics' && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Patient Analytics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-600 mb-1">Total Patients</p>
                      <p className="text-2xl font-bold text-blue-900">304</p>
                      <p className="text-xs text-blue-600 mt-2">Active on platform</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-600 mb-1">Avg Portfolio Value</p>
                      <p className="text-2xl font-bold text-green-900">1.2M PKR</p>
                      <p className="text-xs text-green-600 mt-2">Per patient</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-600 mb-1">Total Health Tokens</p>
                      <p className="text-2xl font-bold text-purple-900">21,450</p>
                      <p className="text-xs text-purple-600 mt-2">In circulation</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-600 mb-1">Asset Diversity</p>
                      <p className="text-2xl font-bold text-orange-900">8 Types</p>
                      <p className="text-xs text-orange-600 mt-2">Average per patient</p>
                    </div>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Portfolio Distribution</CardTitle>
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
                            outerRadius={80}
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
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowViewDialog(false)
              setShowGenerateDialog(true)
            }}>
              <Play className="mr-2 h-4 w-4" />
              Generate This Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Settings Dialog */}
      <Dialog open={showScheduleSettingsDialog} onOpenChange={setShowScheduleSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Schedule Settings
            </DialogTitle>
            <DialogDescription>
              Update settings for {selectedScheduledReport?.templateName}
            </DialogDescription>
          </DialogHeader>

          {selectedScheduledReport && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium mb-1">Current Schedule</p>
                <p className="text-sm text-blue-900">{selectedScheduledReport.frequency} • Next run: {selectedScheduledReport.nextRun}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Report Frequency</label>
                <Select value={scheduleSettings.frequency} onValueChange={(value) => setScheduleSettings({...scheduleSettings, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Execution Time</label>
                <Input
                  type="time"
                  value={scheduleSettings.time}
                  onChange={(e) => setScheduleSettings({...scheduleSettings, time: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Recipients (comma-separated)</label>
                <Input
                  placeholder="admin@hospital.com, finance@hospital.com"
                  value={scheduleSettings.recipients}
                  onChange={(e) => setScheduleSettings({...scheduleSettings, recipients: e.target.value})}
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-600 font-medium mb-2">Additional Options</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="email-on-error" />
                    <label htmlFor="email-on-error" className="text-sm text-amber-900">Send email notification on error</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="skip-empty" defaultChecked />
                    <label htmlFor="skip-empty" className="text-sm text-amber-900">Skip if no data available</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="archive" defaultChecked />
                    <label htmlFor="archive" className="text-sm text-amber-900">Archive report after 90 days</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveScheduleSettings}>
              <Settings className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated Report Detail Dialog */}
      <Dialog open={showGeneratedReportDialog} onOpenChange={setShowGeneratedReportDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getFormatIcon(selectedGeneratedReport?.format || 'PDF')}
              {selectedGeneratedReport?.name}
            </DialogTitle>
            <DialogDescription>
              Generated on {selectedGeneratedReport?.generatedAt}
            </DialogDescription>
          </DialogHeader>

          {selectedGeneratedReport && (
            <div className="space-y-6 py-4">
              {/* Report Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="font-medium">{getCategoryBadge(selectedGeneratedReport.category)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Format</p>
                  <p className="font-medium flex items-center gap-2">
                    {getFormatIcon(selectedGeneratedReport.format)}
                    {selectedGeneratedReport.format}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">File Size</p>
                  <p className="font-medium">{selectedGeneratedReport.size}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="font-medium">{getStatusBadge(selectedGeneratedReport.status)}</p>
                </div>
              </div>

              {/* Report Preview Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Report Preview
                </h3>
                <div className="p-6 bg-gray-50 rounded-lg border">
                  {selectedGeneratedReport.category === 'Financial' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Total Revenue</p>
                          <p className="text-2xl font-bold text-blue-900">45,620,000 PKR</p>
                          <p className="text-xs text-blue-600 mt-1">↑ 12% MoM</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded border border-green-200">
                          <p className="text-xs text-green-600 uppercase font-semibold mb-1">Profit</p>
                          <p className="text-2xl font-bold text-green-900">8,450,000 PKR</p>
                          <p className="text-xs text-green-600 mt-1">↑ 8% MoM</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        The financial report shows strong performance across all departments. Total deposits have increased by 12% month-over-month, with profit margins remaining stable at 18.5%. Asset token trading volume increased by 23% compared to the previous period.
                      </p>
                    </div>
                  )}

                  {selectedGeneratedReport.category === 'Operational' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded border border-green-200">
                          <p className="text-xs text-green-600 uppercase font-semibold mb-1">Approvals</p>
                          <p className="text-2xl font-bold text-green-900">156</p>
                          <p className="text-xs text-green-600 mt-1">This month</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                          <p className="text-xs text-yellow-600 uppercase font-semibold mb-1">Pending</p>
                          <p className="text-2xl font-bold text-yellow-900">23</p>
                          <p className="text-xs text-yellow-600 mt-1">Awaiting verification</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Operational metrics show consistent throughput. Token minting activities completed 4,280 transactions with a 99.2% success rate. No critical incidents reported. Average processing time reduced by 15% due to system optimizations.
                      </p>
                    </div>
                  )}

                  {selectedGeneratedReport.category === 'Compliance' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded border border-green-200">
                          <p className="text-xs text-green-600 uppercase font-semibold mb-1">KYC Verified</p>
                          <p className="text-2xl font-bold text-green-900">287</p>
                          <p className="text-xs text-green-600 mt-1">94.4% of total</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded border border-red-200">
                          <p className="text-xs text-red-600 uppercase font-semibold mb-1">Flagged</p>
                          <p className="text-2xl font-bold text-red-900">2</p>
                          <p className="text-xs text-red-600 mt-1">Under investigation</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        All KYC and AML compliance checks have been completed. 100% of transactions passed AML screening. 2 high-risk accounts are currently flagged for manual review and investigation. Compliance rate remains at industry standard of 99.7%.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Download Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium mb-2">📥 Download Information</p>
                <p className="text-sm text-blue-900">
                  This report is ready for download. Click the "Download Report" button to save the {selectedGeneratedReport.format} file ({selectedGeneratedReport.size}) to your device.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGeneratedReportDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              selectedGeneratedReport && handleDownloadReport(selectedGeneratedReport)
            }}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
