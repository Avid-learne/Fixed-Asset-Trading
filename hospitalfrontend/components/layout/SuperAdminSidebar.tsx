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
  Home
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
}

const adminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Hospitals', href: '/admin/hospitals', icon: Building2 },
  { name: 'Banks', href: '/admin/banks', icon: Banknote },
  { name: 'Audit Logs', href: '/admin/audit', icon: FileText },
  { name: 'Monitoring', href: '/admin/monitoring', icon: AlertCircle },
  { name: 'Financial Reports', href: '/admin/financial', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export const SuperAdminSidebar: React.FC = () => {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Super Admin</span>
        </Link>
      </div>

      <nav className="px-3 space-y-1">
        {adminNavItems.map((item) => {
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
      </nav>
    </aside>
  )
}
