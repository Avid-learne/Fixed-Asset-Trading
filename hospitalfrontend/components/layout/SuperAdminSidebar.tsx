'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  Banknote,
  Settings,
  FileText,
  AlertCircle,
  BarChart3,
  Home,
  CreditCard,
  Database,
  AlertTriangle,
  Package,
  Receipt,
  PieChart,
  Mail,
  TrendingUp,
  Activity,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  section?: string
}

const adminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users, section: 'Core Management' },
  { name: 'Hospitals', href: '/admin/hospitals', icon: Building2 },
  { name: 'Register Hospital', href: '/admin/hospitals/create', icon: Building2 },
  { name: 'Banks', href: '/admin/banks', icon: CreditCard, section: 'Banking' },
  { name: 'Register Bank', href: '/admin/banks/create', icon: CreditCard },
  { name: 'Audit Logs', href: '/admin/logs/audits', icon: FileText, section: 'System Logs' },
  { name: 'Error Logs', href: '/admin/logs/errors', icon: AlertTriangle },
  { name: 'Transaction Logs', href: '/admin/logs/transactions', icon: Database },
  { name: 'Subscription Plans', href: '/admin/billing/plans', icon: Package, section: 'Billing' },
  { name: 'Invoices', href: '/admin/billing/invoices', icon: Receipt },
  { name: 'Analytics', href: '/admin/analytics', icon: PieChart, section: 'Insights' },
  { name: 'Financial Reports', href: '/admin/financial', icon: TrendingUp },
  { name: 'System Monitoring', href: '/admin/monitoring', icon: Activity },
  { name: 'Notifications', href: '/admin/notifications', icon: Mail },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export const SuperAdminSidebar: React.FC = () => {
  const pathname = usePathname()

  // Group items by section
  const groupedItems: { section: string | null; items: NavItem[] }[] = []
  let currentSection: string | null = null
  let currentItems: NavItem[] = []

  adminNavItems.forEach((item, index) => {
    if (item.section) {
      if (currentItems.length > 0) {
        groupedItems.push({ section: currentSection, items: currentItems })
      }
      currentSection = item.section
      currentItems = [item]
    } else {
      currentItems.push(item)
    }

    if (index === adminNavItems.length - 1) {
      groupedItems.push({ section: currentSection, items: currentItems })
    }
  })

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6 flex-shrink-0">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Super Admin</span>
        </Link>
      </div>

      <nav className="px-3 pb-6 overflow-y-auto flex-1">
        {groupedItems.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            {group.section && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.section}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
