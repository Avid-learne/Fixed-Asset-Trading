'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

interface TimelineEvent {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
  type: 'success' | 'error' | 'warning' | 'info'
  metadata?: Record<string, any>
}

interface AuditTimelineProps {
  events: TimelineEvent[]
  title?: string
  maxHeight?: string
}

export function AuditTimeline({ events, title = 'Activity Timeline', maxHeight = '600px' }: AuditTimelineProps) {
  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getBackgroundColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100'
      case 'error':
        return 'bg-red-100'
      case 'warning':
        return 'bg-yellow-100'
      case 'info':
        return 'bg-blue-100'
      default:
        return 'bg-gray-100'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ maxHeight, overflowY: 'auto' }}>
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative flex gap-4">
                <div className={`flex-shrink-0 h-12 w-12 rounded-full ${getBackgroundColor(event.type)} flex items-center justify-center relative z-10`}>
                  {getIcon(event.type)}
                </div>
                
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{event.action}</p>
                      <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{event.user}</span>
                        <span>•</span>
                        <span>{event.timestamp}</span>
                      </div>
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-cyan-600 cursor-pointer">View metadata</summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
