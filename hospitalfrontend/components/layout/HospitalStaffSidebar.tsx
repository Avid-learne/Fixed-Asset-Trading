'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
  Wallet,
  Coins
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
}

const staffNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/hospital', icon: LayoutDashboard },
  { name: 'Patients', href: '/hospital/patients', icon: Users },
  { name: 'Deposits', href: '/hospital/deposits', icon: Wallet },
  { name: 'Token Minting', href: '/hospital/minting', icon: Coins },
  { name: 'Trading', href: '/hospital/trading', icon: TrendingUp },
  { name: 'Profit Distribution', href: '/hospital/profit', icon: BarChart3 },
  { name: 'Reports', href: '/hospital/reports', icon: FileText },
  { name: 'Settings', href: '/hospital/settings', icon: Settings },
]

export const HospitalStaffSidebar: React.FC = () => {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6">
        <Link href="/hospital" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Hospital Staff</span>
        </Link>
      </div>

      <nav className="px-3 space-y-1">
        {staffNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/hospital' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-secondary text-white'
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
