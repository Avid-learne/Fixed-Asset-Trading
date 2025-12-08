// hospitalfrontend/app/bank/reports/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Calendar, TrendingUp, Shield, Building2, Eye, Filter } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

type ReportStatus = 'ready' | 'processing' | 'scheduled'
type ReportType = 'financial' | 'compliance' | 'asset' | 'audit'

interface Report {
  id: string
  name: string
  type: ReportType
  description: string
  generatedDate: string
  period: string
  status: ReportStatus
  fileSize: string
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('all')

  const handleGenerateReport = () => {
    alert('Opening report generation wizard... In production, this would open a modal to configure and generate a new report.')
  }

  const handleViewReport = (report: Report) => {
    alert(`Opening report viewer for:\n\n${report.name}\n\nPeriod: ${report.period}\nGenerated: ${report.generatedDate}\nSize: ${report.fileSize}\n\nIn production, this would open the report in a viewer.`)
  }

  const handleDownloadReport = (report: Report) => {
    alert(`Downloading ${report.name}...\n\nFile size: ${report.fileSize}\n\nIn production, this would download the PDF/Excel report file.`)
  }

  const reports: Report[] = [
    {
      id: 'RPT-001',
      name: 'Monthly Asset Custody Report',
      type: 'asset',
      description: 'Detailed report of all assets held in custody during November 2024',
      generatedDate: '2024-12-01',
      period: 'November 2024',
      status: 'ready',
      fileSize: '2.4 MB'
    },
    {
      id: 'RPT-002',
      name: 'Funding Activity Report',
      type: 'financial',
      description: 'Summary of all funding provided to hospitals in Q4 2024',
      generatedDate: '2024-12-05',
      period: 'Q4 2024',
      status: 'ready',
      fileSize: '1.8 MB'
    },
    {
      id: 'RPT-003',
      name: 'Compliance Audit Report',
      type: 'compliance',
      description: 'Annual compliance status and regulatory requirements assessment',
      generatedDate: '2024-11-20',
      period: 'Year 2024',
      status: 'ready',
      fileSize: '3.2 MB'
    },
    {
      id: 'RPT-004',
      name: 'Revenue & Fee Analysis',
      type: 'financial',
      description: 'Custody fees and revenue breakdown for November 2024',
      generatedDate: '2024-12-03',
      period: 'November 2024',
      status: 'ready',
      fileSize: '1.5 MB'
    },
    {
      id: 'RPT-005',
      name: 'Asset Valuation Report',
      type: 'asset',
      description: 'Current market valuation of all assets in custody',
      generatedDate: '2024-12-07',
      period: 'December 2024',
      status: 'ready',
      fileSize: '2.1 MB'
    },
    {
      id: 'RPT-006',
      name: 'Annual Audit Report',
      type: 'audit',
      description: 'Comprehensive annual audit of bank operations and financials',
      generatedDate: '2024-12-08',
      period: 'Year 2024',
      status: 'processing',
      fileSize: 'N/A'
    },
    {
      id: 'RPT-007',
      name: 'Hospital Partnership Report',
      type: 'financial',
      description: 'Analysis of hospital partnerships and funding agreements',
      generatedDate: '2024-12-10',
      period: 'December 2024',
      status: 'scheduled',
      fileSize: 'N/A'
    },
  ]

  const reportCategories = [
    { id: 'financial', name: 'Financial Reports', icon: TrendingUp, count: reports.filter(r => r.type === 'financial').length },
    { id: 'compliance', name: 'Compliance Reports', icon: Shield, count: reports.filter(r => r.type === 'compliance').length },
    { id: 'asset', name: 'Asset Reports', icon: Building2, count: reports.filter(r => r.type === 'asset').length },
    { id: 'audit', name: 'Audit Reports', icon: FileText, count: reports.filter(r => r.type === 'audit').length },
  ]

  const filteredReports = reportType === 'all' 
    ? reports 
    : reports.filter(r => r.type === reportType)

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Ready</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Scheduled</Badge>
    }
  }

  const getTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'financial': return <TrendingUp className="w-4 h-4" />
      case 'compliance': return <Shield className="w-4 h-4" />
      case 'asset': return <Building2 className="w-4 h-4" />
      case 'audit': return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Generate and download bank operational reports</p>
        </div>
        <Button onClick={handleGenerateReport}>
          <Download className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {reportCategories.map((category) => {
          const Icon = category.icon
          return (
            <Card 
              key={category.id} 
              className={`cursor-pointer hover:shadow-lg transition-shadow ${reportType === category.id ? 'border-blue-600 border-2' : ''}`}
              onClick={() => setReportType(category.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{category.count} reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>Download and view previously generated reports</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={reportType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setReportType('all')}
              >
                All Reports
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No reports found for this category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <Card key={report.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mt-1">
                          {getTypeIcon(report.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{report.name}</h3>
                            {getStatusBadge(report.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Period: {report.period}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>Generated: {report.generatedDate}</span>
                            </div>
                            <div>
                              <span>Size: {report.fileSize}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {report.status === 'ready' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleViewReport(report)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button variant="default" size="sm" onClick={() => handleDownloadReport(report)}>
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </>
                        )}
                        {report.status === 'processing' && (
                          <Button variant="outline" size="sm" disabled>
                            Processing...
                          </Button>
                        )}
                        {report.status === 'scheduled' && (
                          <Button variant="outline" size="sm" disabled>
                            Scheduled
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}