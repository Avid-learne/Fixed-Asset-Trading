// src/app/hospitaladmin/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'
import Link from 'next/link'
import { 
  Users, 
  Shield, 
  Coins, 
  TrendingUp, 
  FileText, 
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Database,
  Activity
} from 'lucide-react'

interface DashboardStats {
  totalPatients: number
  pendingDeposits: number
  approvedDeposits: number
  totalTokensMinted: number
  activeStaff: number
  tradingVolume: number
  systemHealth: number
  complianceScore: number
}

export default function HospitalAdminPage() {
  const { user, hasRole } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user has admin privileges
    const checkAdmin = hasRole([UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN])
    setIsAdmin(checkAdmin)
    
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalPatients: 1245,
        pendingDeposits: 23,
        approvedDeposits: 156,
        totalTokensMinted: 1250000,
        activeStaff: 48,
        tradingVolume: 5430000,
        systemHealth: 98,
        complianceScore: 96.5
      })
      setLoading(false)
    }, 1000)
  }, [hasRole])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with role badge */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">Hospital Administration</h1>
            <Badge variant={isAdmin ? 'success' : 'default'}>
              {isAdmin ? 'Hospital Admin' : 'Hospital Staff'}
            </Badge>
          </div>
          <p className="text-gray-500 mt-1">
            {isAdmin 
              ? 'Full administrative control over hospital operations' 
              : 'Manage patient deposits and token operations'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Welcome,</span>
          <span className="font-medium text-gray-900">{user?.name || user?.email}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Deposits</CardTitle>
            <Clock className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.pendingDeposits || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalPatients || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Registered patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tokens Minted</CardTitle>
            <Coins className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalTokensMinted.toLocaleString() || 0}
            </div>
            <p className="text-xs text-success mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +12% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">System Health</CardTitle>
            <Activity className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.systemHealth || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">Optimal performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Core Operations - Visible to all staff */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>Approve Deposits</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Review and approve patient asset deposits. Mint tokens for approved assets.
            </p>
            <div className="flex space-x-2">
              <Link href="/hospital/deposits" className="flex-1">
                <Button className="w-full">Review Deposits</Button>
              </Link>
              <Link href="/hospital/minting" className="flex-1">
                <Button variant="outline" className="w-full">Mint Tokens</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <CardTitle>Trading Operations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Simulate trading with tokenized assets to generate returns for patients.
            </p>
            <Link href="/hospital/trading">
              <Button className="w-full">Start Trading</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-success" />
              </div>
              <CardTitle>Patient Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              View patient profiles, track their assets, and manage benefits.
            </p>
            <div className="flex space-x-2">
              <Link href="/hospital/patients" className="flex-1">
                <Button className="w-full">View Patients</Button>
              </Link>
              <Link href="/hospital/audit" className="flex-1">
                <Button variant="outline" className="w-full">Audit Logs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Admin-only sections */}
        {isAdmin && (
          <>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-warning" />
                  </div>
                  <CardTitle>System Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Configure security settings, manage staff permissions, and monitor access.
                </p>
                <div className="flex space-x-2">
                  <Link href="/hospital/settings" className="flex-1">
                    <Button className="w-full">Settings</Button>
                  </Link>
                  <Button variant="outline" className="flex-1">
                    Security Logs
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle>System Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Manage system configurations, database, and integration settings.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">Database Backup</Button>
                  <Button variant="outline" className="w-full">System Logs</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle>Administration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Advanced system configuration and administrative controls.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">Staff Management</Button>
                  <Button variant="outline" size="sm">API Settings</Button>
                  <Button variant="outline" size="sm">Blockchain Config</Button>
                  <Button variant="outline" size="sm">Notifications</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: CheckCircle, color: 'text-success', text: 'Asset "Gold Jewelry" approved for Patient #P-2345', time: '2 min ago' },
                { icon: Coins, color: 'text-accent', text: 'Minted 150 tokens for Patient #P-1892', time: '15 min ago' },
                { icon: FileText, color: 'text-primary', text: 'New deposit submitted: "Commercial Property"', time: '30 min ago' },
                { icon: TrendingUp, color: 'text-warning', text: 'Trading session completed: +$2,450 profit', time: '1 hour ago' },
                { icon: Users, color: 'text-purple-600', text: 'New patient registration: John Smith', time: '2 hours ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${activity.color} bg-opacity-10`}>
                    <activity.icon className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System Alerts</CardTitle>
              <Badge variant="outline">{isAdmin ? 'Admin View' : 'Staff View'}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isAdmin ? (
                // Admin alerts
                <>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-warning" />
                      <div>
                        <p className="font-medium text-gray-900">Database Backup Required</p>
                        <p className="text-sm text-gray-600">Last backup was 6 days ago</p>
                      </div>
                    </div>
                    <Button size="sm">Backup Now</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-gray-900">Security Audit Due</p>
                        <p className="text-sm text-gray-600">Monthly security review pending</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Schedule</Button>
                  </div>
                </>
              ) : (
                // Staff alerts
                <>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-warning" />
                      <div>
                        <p className="font-medium text-gray-900">Pending Deposits</p>
                        <p className="text-sm text-gray-600">{stats?.pendingDeposits} assets need review</p>
                      </div>
                    </div>
                    <Link href="/hospital/deposits">
                      <Button size="sm">Review</Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium text-gray-900">Tokens Ready to Mint</p>
                        <p className="text-sm text-gray-600">15 approved assets awaiting token minting</p>
                      </div>
                    </div>
                    <Link href="/hospital/minting">
                      <Button size="sm">Mint Tokens</Button>
                    </Link>
                  </div>
                </>
              )}
              
              {/* Common alert for all */}
              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">System Health</p>
                    <p className="text-sm text-gray-600">All systems operational</p>
                  </div>
                </div>
                <Badge variant="success">Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Current Permissions</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-success mr-2" />
                  Approve/reject asset deposits
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-success mr-2" />
                  Mint health tokens
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-success mr-2" />
                  Access patient profiles
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-success mr-2" />
                  View audit logs
                </li>
                {isAdmin && (
                  <>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      System configuration
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      Staff management
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      Security settings
                    </li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/hospital/deposits">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Approve Deposits
                  </Button>
                </Link>
                <Link href="/hospital/trading">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trading Simulation
                  </Button>
                </Link>
                <Link href="/hospital/patients">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Patient Directory
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/hospital/settings">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      System Settings
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}