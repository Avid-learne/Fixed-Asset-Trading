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
  ShoppingCart,
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
  { name: 'Marketplace', href: '/patient/marketplace', icon: ShoppingCart, roles: [UserRole.PATIENT] },
  { name: 'Deposit Asset', href: '/patient/deposit', icon: Upload, roles: [UserRole.PATIENT], activeMatch: '/patient/deposit' },
  { name: 'My Wallet', href: '/patient/wallet', icon: Coins, roles: [UserRole.PATIENT], activeMatch: '/patient/wallet' },
  { name: 'Activity', href: '/patient/activity', icon: History, roles: [UserRole.PATIENT] },
  { name: 'Health Card', href: '/patient/health-card', icon: Users, roles: [UserRole.PATIENT] },
  { name: 'Subscription', href: '/patient/subscription', icon: DollarSign, roles: [UserRole.PATIENT] },
  { name: 'Profile', href: '/patient/profile', icon: Settings, roles: [UserRole.PATIENT], activeMatch: '/patient/profile' },
]

const hospitalNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/hospital', icon: LayoutDashboard, roles: [UserRole.HOSPITAL_STAFF] },
  { name: 'Marketplace', href: '/hospital/marketplace', icon: ShoppingCart, roles: [UserRole.HOSPITAL_STAFF] },
  { name: 'Approve Deposits', href: '/hospital/deposits', icon: CheckSquare, roles: [UserRole.HOSPITAL_STAFF] },
  { name: 'Patient Profiles', href: '/hospital/patients', icon: Users, roles: [UserRole.HOSPITAL_STAFF] },
  { name: 'Settings', href: '/hospital/settings', icon: Settings, roles: [UserRole.HOSPITAL_STAFF] },
]

const hospitalAdminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/hospitaladmin', icon: LayoutDashboard, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Marketplace', href: '/hospitaladmin/marketplace', icon: ShoppingCart, roles: [UserRole.HOSPITAL_ADMIN] },
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
  { name: 'Asset Custody', href: '/bank/assets', icon: Building, roles: [UserRole.BANK_OFFICER] },
  { name: 'Deposit Requests', href: '/bank/approvals', icon: CheckSquare, roles: [UserRole.BANK_OFFICER] },
  { name: 'Policies', href: '/bank/policies', icon: Shield, roles: [UserRole.BANK_OFFICER] },
  { name: 'Compliance', href: '/bank/compliance', icon: FileText, roles: [UserRole.BANK_OFFICER] },
  { name: 'Reports', href: '/bank/reports', icon: DollarSign, roles: [UserRole.BANK_OFFICER] },
  { name: 'Settings', href: '/bank/settings', icon: Settings, roles: [UserRole.BANK_OFFICER] },
]

const superAdminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Marketplace', href: '/admin/marketplace', icon: ShoppingCart, roles: [UserRole.SUPER_ADMIN] },
  { name: 'User Management', href: '/admin/users', icon: Users, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Hospital Management', href: '/admin/hospitals', icon: Building2, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Bank Management', href: '/admin/banks', icon: CreditCard, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Logs', href: '/admin/logs', icon: FileText, roles: [UserRole.SUPER_ADMIN], activeMatch: '/admin/logs' },
  { name: 'Reports', href: '/admin/reports', icon: PieChart, roles: [UserRole.SUPER_ADMIN], activeMatch: '/admin/reports' },
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
              <span className="text-xl font-bold text-primary group-data-[state=collapsed]:hidden">SehatVault</span>
            </Link>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                // Base paths that should only match exactly (dashboard pages)
                const basePaths = ['/patient', '/hospital', '/hospitaladmin', '/bank', '/admin']
                const isBasePath = basePaths.includes(item.href)
                
                // Determine if this item is active
                let isActive = false
                if (item.activeMatch) {
                  // Use custom activeMatch pattern if provided
                  isActive = pathname.startsWith(item.activeMatch)
                } else if (isBasePath) {
                  // For base paths (dashboards), only match exactly
                  isActive = pathname === item.href
                } else {
                  // For other paths, match if current path starts with item href
                  // but ensure we're not just matching a partial segment
                  isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                }
                
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