// src/components/layout/Sidebar.tsx

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Sidebar as CollapsibleSidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar'
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
  DollarSign,
  CreditCard,
  Database,
  AlertTriangle,
  Package,
  Receipt,
  PieChart,
  Mail,
  Activity,
  Building2,
} from 'lucide-react'
import { UserRole } from '@/types'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
  activeMatch?: string
}

const patientNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard, roles: [UserRole.PATIENT] },
  { name: 'Deposit Asset', href: '/patient/deposit/start', icon: Upload, roles: [UserRole.PATIENT], activeMatch: '/patient/deposit' },
  { name: 'AT Wallet', href: '/patient/wallet/at', icon: Coins, roles: [UserRole.PATIENT] },
  { name: 'HT Wallet', href: '/patient/wallet/ht', icon: Gift, roles: [UserRole.PATIENT] },
  { name: 'Activity', href: '/patient/activity', icon: History, roles: [UserRole.PATIENT] },
  { name: 'Health Card', href: '/patient/health-card', icon: Users, roles: [UserRole.PATIENT] },
  { name: 'Redeem HT', href: '/patient/redeem', icon: TrendingUp, roles: [UserRole.PATIENT] },
  { name: 'Subscription', href: '/patient/subscription', icon: DollarSign, roles: [UserRole.PATIENT] },
  { name: 'Profile', href: '/patient/profile/info', icon: Settings, roles: [UserRole.PATIENT], activeMatch: '/patient/profile' },
]

const hospitalNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/hospital', icon: LayoutDashboard, roles: [UserRole.HOSPITAL_STAFF] },
  { name: 'Approve Deposits', href: '/hospital/deposits', icon: CheckSquare, roles: [UserRole.HOSPITAL_STAFF] },
  { name: 'Patient Profiles', href: '/hospital/patients', icon: Users, roles: [UserRole.HOSPITAL_STAFF] },
  { name: 'Settings', href: '/hospital/settings', icon: Settings, roles: [UserRole.HOSPITAL_STAFF] },
]

const hospitalAdminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/hospitaladmin', icon: LayoutDashboard, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Approve Deposits', href: '/hospitaladmin/deposits', icon: CheckSquare, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Token Minting', href: '/hospitaladmin/minting', icon: Coins, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Trading Simulator', href: '/hospitaladmin/trading', icon: TrendingUp, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Profit Allocation', href: '/hospitaladmin/allocation', icon: Gift, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Patient Profiles', href: '/hospitaladmin/patients', icon: Users, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Staff Management', href: '/hospitaladmin/staff', icon: Users, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Bank Integrations', href: '/hospitaladmin/banks', icon: Building, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Reports', href: '/hospitaladmin/reports', icon: FileText, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Notifications', href: '/hospitaladmin/notifications', icon: Bell, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Audit Trail', href: '/hospitaladmin/audit', icon: FileText, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Settings', href: '/hospitaladmin/settings', icon: Settings, roles: [UserRole.HOSPITAL_ADMIN] },
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
  { name: 'Hospitals', href: '/admin/hospitals', icon: Building2, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Register Hospital', href: '/admin/hospitals/create', icon: Building2, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Banks', href: '/admin/banks', icon: CreditCard, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Register Bank', href: '/admin/banks/create', icon: CreditCard, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Audit Logs', href: '/admin/logs/audits', icon: FileText, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Error Logs', href: '/admin/logs/errors', icon: AlertTriangle, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Transaction Logs', href: '/admin/logs/transactions', icon: Database, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Subscription Plans', href: '/admin/billing/plans', icon: Package, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Invoices', href: '/admin/billing/invoices', icon: Receipt, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Analytics', href: '/admin/analytics', icon: PieChart, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Financial Reports', href: '/admin/financial', icon: TrendingUp, roles: [UserRole.SUPER_ADMIN] },
  { name: 'System Monitoring', href: '/admin/monitoring', icon: Activity, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Notifications', href: '/admin/notifications', icon: Mail, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Settings', href: '/admin/settings', icon: Settings, roles: [UserRole.SUPER_ADMIN] },
]

interface SidebarProps {
  userRole: UserRole
}

interface LayoutSidebarProps extends SidebarProps {
  withProvider?: boolean
}

export const Sidebar: React.FC<LayoutSidebarProps> = ({ userRole, withProvider = true }) => {
  const pathname = usePathname()

  const getNavItems = () => {
    switch (userRole) {
      case UserRole.PATIENT:
        return patientNavItems
      case UserRole.HOSPITAL_STAFF:
        return hospitalNavItems
      case UserRole.HOSPITAL_ADMIN:
        return hospitalAdminNavItems
      case UserRole.BANK_OFFICER:
        return bankNavItems
      case UserRole.SUPER_ADMIN:
        return superAdminNavItems
      default:
        return []
    }
  }

  const navItems = getNavItems()

  const sidebarNode = (
    <CollapsibleSidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between group-data-[state=collapsed]:justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary group-data-[state=collapsed]:hidden">FixedAsset</span>
            </Link>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const basePaths = ['/patient', '/hospital', '/bank', '/admin']
                const isBase = basePaths.includes(item.href)
                const isActive = item.activeMatch 
                  ? pathname.startsWith(item.activeMatch)
                  : (pathname === item.href || (!isBase && pathname.startsWith(item.href)));
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link href={item.href} className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </CollapsibleSidebar>
  )

  if (!withProvider) {
    return sidebarNode
  }

  return <SidebarProvider>{sidebarNode}</SidebarProvider>
}