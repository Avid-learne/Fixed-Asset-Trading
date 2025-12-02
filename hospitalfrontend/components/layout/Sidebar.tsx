// src/components/layout/Sidebar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Upload, 
  Coins, 
  Gift, 
  History, 
  Settings,
  Bell,
  CheckSquare,
  TrendingUp,
  Users,
  FileText,
  Shield,
  Building,
  DollarSign
} from 'lucide-react'
import { UserRole } from '@/types'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

const patientNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/patient', icon: LayoutDashboard, roles: [UserRole.PATIENT] },
  { name: 'Deposit Asset', href: '/patient/deposit', icon: Upload, roles: [UserRole.PATIENT] },
  { name: 'Token Balance', href: '/patient/tokens', icon: Coins, roles: [UserRole.PATIENT] },
  { name: 'Benefits', href: '/patient/benefits', icon: Gift, roles: [UserRole.PATIENT] },
  { name: 'History', href: '/patient/history', icon: History, roles: [UserRole.PATIENT] },
  { name: 'Notifications', href: '/patient/notifications', icon: Bell, roles: [UserRole.PATIENT] },
  { name: 'Settings', href: '/patient/settings', icon: Settings, roles: [UserRole.PATIENT] },
]

const hospitalNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/hospital', icon: LayoutDashboard, roles: [UserRole.HOSPITAL_STAFF, UserRole.HOSPITAL_ADMIN] },
  { name: 'Approve Deposits', href: '/hospital/deposits', icon: CheckSquare, roles: [UserRole.HOSPITAL_STAFF, UserRole.HOSPITAL_ADMIN] },
  { name: 'Token Minting', href: '/hospital/minting', icon: Coins, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Trading', href: '/hospital/trading', icon: TrendingUp, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Patient Profiles', href: '/hospital/patients', icon: Users, roles: [UserRole.HOSPITAL_STAFF, UserRole.HOSPITAL_ADMIN] },
  { name: 'Audit Logs', href: '/hospital/audit', icon: FileText, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Settings', href: '/hospital/settings', icon: Settings, roles: [UserRole.HOSPITAL_STAFF, UserRole.HOSPITAL_ADMIN] },
]

const bankNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/bank', icon: LayoutDashboard, roles: [UserRole.BANK_OFFICER] },
  { name: 'Policies', href: '/bank/policies', icon: Shield, roles: [UserRole.BANK_OFFICER] },
  { name: 'Tokenized Assets', href: '/bank/assets', icon: Building, roles: [UserRole.BANK_OFFICER] },
  { name: 'Reports', href: '/bank/reports', icon: DollarSign, roles: [UserRole.BANK_OFFICER] },
]

const superAdminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN] },
  { name: 'User Management', href: '/admin/users', icon: Users, roles: [UserRole.SUPER_ADMIN] },
  { name: 'System Settings', href: '/admin/settings', icon: Settings, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Audit Logs', href: '/admin/audit', icon: FileText, roles: [UserRole.SUPER_ADMIN] },
]

interface SidebarProps {
  userRole: UserRole
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const pathname = usePathname()

  const getNavItems = () => {
    switch (userRole) {
      case UserRole.PATIENT:
        return patientNavItems
      case UserRole.HOSPITAL_STAFF:
      case UserRole.HOSPITAL_ADMIN:
        return hospitalNavItems
      case UserRole.BANK_OFFICER:
        return bankNavItems
      case UserRole.SUPER_ADMIN:
        return superAdminNavItems
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-primary">FixedAsset</span>
        </Link>
      </div>
      
      <nav className="px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary"
                  : "text-gray-700 hover:bg-gray-50 hover:text-primary"
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