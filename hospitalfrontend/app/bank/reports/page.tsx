// hospitalfrontend/app/bank/reports/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ReportsPage() {
  const [reportType, setReportType] = useState('monthly')

  const reportCategories = [
    { id: 'financial', name: 'Financial Reports', icon: TrendingUp },
    { id: 'compliance', name: 'Compliance Reports', icon: FileText },
    { id: 'asset', name: 'Asset Valuation Reports', icon: Calendar },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Generate and download financial reports</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportCategories.map((category) => {
          const Icon = category.icon
          return (
            <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">0 reports available</p>
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
            <CardTitle>Recent Reports</CardTitle>
            <div className="flex space-x-2">
              <button
                onClick={() => setReportType('monthly')}
                className={`px-3 py-1 rounded text-sm ${reportType === 'monthly' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setReportType('quarterly')}
                className={`px-3 py-1 rounded text-sm ${reportType === 'quarterly' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Quarterly
              </button>
              <button
                onClick={() => setReportType('annual')}
                className={`px-3 py-1 rounded text-sm ${reportType === 'annual' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Annual
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reports generated yet</p>
            <p className="text-sm text-gray-400 mt-2">Generate your first report to see it here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}