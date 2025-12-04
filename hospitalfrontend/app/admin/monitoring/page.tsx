// app/admin/monitoring/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Activity, Database, Server, Shield, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  apiResponseTime: number
  activeConnections: number
  totalRequests: number
  errorRate: number
}

export default function SystemMonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    apiResponseTime: 0,
    activeConnections: 0,
    totalRequests: 0,
    errorRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      setLoading(false)
      // TODO: Connect to adminService when backend is available
      // const response = await adminService.getSystemMetrics()
      // setMetrics(response.data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
      setLoading(false)
    }
  }

  const performanceData = [
    { time: '00:00', cpu: 35, memory: 62, requests: 1200 },
    { time: '04:00', cpu: 28, memory: 55, requests: 800 },
    { time: '08:00', cpu: 45, memory: 70, requests: 3200 },
    { time: '12:00', cpu: 52, memory: 75, requests: 4500 },
    { time: '16:00', cpu: 48, memory: 72, requests: 4100 },
    { time: '20:00', cpu: 42, memory: 68, requests: 3800 },
    { time: '23:59', cpu: 38, memory: 65, requests: 2100 },
  ]

  const serviceStatus = [
    { name: 'API Server', status: 'Healthy', uptime: '99.98%', icon: Server, color: 'text-secondary' },
    { name: 'Database', status: 'Healthy', uptime: '99.95%', icon: Database, color: 'text-secondary' },
    { name: 'Cache System', status: 'Healthy', uptime: '99.92%', icon: Activity, color: 'text-secondary' },
    { name: 'Load Balancer', status: 'Healthy', uptime: '100%', icon: Server, color: 'text-secondary' },
    { name: 'Authentication', status: 'Degraded', uptime: '99.2%', icon: Shield, color: 'text-yellow-600' },
    { name: 'Notification Service', status: 'Healthy', uptime: '99.98%', icon: Activity, color: 'text-secondary' },
  ]

  const getStatusBadge = (status: string) => {
    const config = {
      Healthy: 'bg-secondary/10 text-secondary border-border',
      Degraded: 'bg-muted text-muted-foreground border-border',
      Down: 'bg-destructive/10 text-destructive border-border',
    }
    return config[status as keyof typeof config] || 'bg-muted text-muted-foreground'
  }

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-error'
    if (value >= thresholds.warning) return 'text-warning'
    return 'text-success'
  }

  if (loading && metrics === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Monitoring</h1>
          <p className="text-muted-foreground mt-1">Real-time platform health and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-secondary animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
          <span className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CPU Usage</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(metrics?.cpu || 0, { warning: 70, critical: 90 })}`}>
              {metrics ? `${metrics.cpu}%` : '—'}
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: metrics ? `${metrics.cpu}%` : '0%' }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{metrics ? 'Within normal range' : 'No data yet'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Memory Usage</CardTitle>
            <Database className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(metrics?.memory || 0, { warning: 75, critical: 90 })}`}>
              {metrics ? `${metrics.memory}%` : '—'}
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: metrics ? `${metrics.memory}%` : '0%' }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{metrics ? '8.2 GB / 16 GB' : 'No data yet'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">API Response Time</CardTitle>
            <Clock className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics ? `${metrics.apiResponseTime}ms` : '—'}
            </div>
            <p className="text-xs text-secondary mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {metrics ? 'Excellent performance' : 'Awaiting data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate</CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics && metrics.errorRate < 1 ? 'text-secondary' : 'text-destructive'}`}>
              {metrics ? `${metrics.errorRate}%` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics && metrics.totalRequests ? formatNumber(metrics.totalRequests) : 'No data'} total requests
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Performance (24 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cpu" stroke="#2C3E50" name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#1B4F72" name="Memory %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Volume (24 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#1B4F72" name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceStatus.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">No service data yet</div>
            ) : serviceStatus.map((service, index) => {
              const Icon = service.icon
              return (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 border border-border rounded-lg bg-card"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center text-secondary`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{service.name}</p>
                      <p className="text-sm text-muted-foreground">Uptime: {service.uptime}</p>
                    </div>
                  </div>
                  <Badge className={getStatusBadge(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center py-8 text-muted-foreground">No alerts available</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center py-8 text-muted-foreground">System info will appear here</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
