'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CheckCircle,
  Coins,
  Users,
  FileText,
  Settings,
  Home
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: React.ElementType
}

const adminNavItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/hospitaladmin', icon: LayoutDashboard },
  { name: 'Approve Deposits', href: '/hospitaladmin/deposits', icon: CheckCircle },
  { name: 'Mint Tokens', href: '/hospitaladmin/minting', icon: Coins },
  { name: 'Patient Management', href: '/hospitaladmin/patients', icon: Users },
  { name: 'Reports', href: '/hospitaladmin/reports', icon: FileText },
  { name: 'Settings', href: '/hospitaladmin/settings', icon: Settings },
]

export const HospitalAdminSidebar: React.FC = () => {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6">
        <Link href="/hospitaladmin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Hospital Admin</span>
        </Link>
      </div>

      <nav className="px-3 space-y-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/hospitaladmin' && pathname.startsWith(item.href));
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
