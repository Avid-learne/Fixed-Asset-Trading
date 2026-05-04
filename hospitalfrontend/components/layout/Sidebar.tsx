// src/components/layout/Sidebar.tsx

'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { notificationService, PortalNotification } from '@/services/notificationService'
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
  Split,
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
  { name: 'Emergency Redemption', href: '/patient/emergency-redemption', icon: AlertTriangle, roles: [UserRole.PATIENT] },
  { name: 'Activity', href: '/patient/activity', icon: History, roles: [UserRole.PATIENT] },
  { name: 'Notifications', href: '/patient/notifications', icon: Bell, roles: [UserRole.PATIENT] },
  { name: 'Health Card', href: '/patient/health-card', icon: Users, roles: [UserRole.PATIENT] },
  { name: 'Fractionalization', href: '/patient/fractionalization', icon: Split, roles: [UserRole.PATIENT], activeMatch: '/patient/fractionalization' },
  { name: 'Subscription', href: '/patient/subscription', icon: DollarSign, roles: [UserRole.PATIENT] },
  { name: 'Profile', href: '/patient/profile/info', icon: Settings, roles: [UserRole.PATIENT], activeMatch: '/patient/profile' },
]

const hospitalNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/hospital', icon: LayoutDashboard, roles: [UserRole.HOSPITAL_STAFF] },
  { name: 'Marketplace', href: '/hospital/marketplace', icon: ShoppingCart, roles: [UserRole.HOSPITAL_STAFF] },
  { name: 'Profit Distribution', href: '/hospital/profit', icon: Gift, roles: [UserRole.HOSPITAL_STAFF] },
  { name: 'Patient Profiles', href: '/hospital/patients', icon: Users, roles: [UserRole.HOSPITAL_STAFF] },
  { name: 'Notifications', href: '/hospital/notifications', icon: Bell, roles: [UserRole.HOSPITAL_STAFF] },
  { name: 'Audit Trail', href: '/hospital/audit', icon: FileText, roles: [UserRole.HOSPITAL_STAFF] },
  { name: 'Settings', href: '/hospital/settings', icon: Settings, roles: [UserRole.HOSPITAL_STAFF] },
]

const hospitalAdminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/hospitaladmin', icon: LayoutDashboard, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Marketplace', href: '/hospitaladmin/marketplace', icon: ShoppingCart, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Approve Deposits', href: '/hospitaladmin/deposits', icon: CheckSquare, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Token Minting', href: '/hospitaladmin/minting', icon: Coins, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Pool Management', href: '/hospitaladmin/pool', icon: TrendingUp, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Profit Allocation', href: '/hospitaladmin/allocation', icon: Gift, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Fractionalization', href: '/hospitaladmin/fractionalization', icon: Split, roles: [UserRole.HOSPITAL_ADMIN], activeMatch: '/hospitaladmin/fractionalization' },
  { name: 'Emergency Redemptions', href: '/hospitaladmin/emergency-redemptions', icon: AlertTriangle, roles: [UserRole.HOSPITAL_ADMIN] },
  { name: 'Subscription Plans', href: '/hospitaladmin/subscriptions', icon: Package, roles: [UserRole.HOSPITAL_ADMIN] },
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
  { name: 'Deposit Requests', href: '/bank/deposits', icon: CheckSquare, roles: [UserRole.BANK_OFFICER] },
  { name: 'Integrations', href: '/bank/integrations', icon: Building2, roles: [UserRole.BANK_OFFICER] },
  { name: 'Policies', href: '/bank/policies', icon: Shield, roles: [UserRole.BANK_OFFICER] },
  { name: 'Tokenized Assets', href: '/bank/assets', icon: Building, roles: [UserRole.BANK_OFFICER] },
  { name: 'Reports', href: '/bank/reports', icon: DollarSign, roles: [UserRole.BANK_OFFICER] },
  { name: 'Notifications', href: '/bank/notifications', icon: Bell, roles: [UserRole.BANK_OFFICER] },
]

const superAdminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Marketplace', href: '/admin/marketplace', icon: ShoppingCart, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Hospital Management', href: '/admin/hospitals', icon: Building2, roles: [UserRole.SUPER_ADMIN] },
  { name: 'Bank Management', href: '/admin/banks', icon: CreditCard, roles: [UserRole.SUPER_ADMIN] },
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

// URL path mapping for notification navigation
const notificationPathMap: Record<string, string[]> = {
  '/patient/deposit': ['deposit', 'asset', 'asset_deposit', '/asset-deposit'],
  '/patient/marketplace': ['marketplace', '/marketplace'],
  '/patient/wallet': ['wallet', '/wallet'],
  '/patient/emergency-redemption': ['emergency', 'redemption', '/emergency-redemption'],
  '/patient/activity': ['activity', '/activity'],
  '/patient/notifications': ['notification'],
  '/patient/health-card': ['health', 'card', 'health_card', '/health-card'],
  '/patient/fractionalization': ['fractional', 'fractionalization', '/fractionalization'],
  '/patient/subscription': ['subscription', '/subscription'],
  '/patient/profile': ['profile', 'kyc', 'account', '/profile'],
  '/hospital/marketplace': ['marketplace', '/marketplace'],
  '/hospital/profit': ['profit'],
  '/hospital/patients': ['patient'],
  '/hospital/notifications': ['notification'],
  '/hospitaladmin/deposits': ['deposit', 'asset', 'asset_deposit', '/asset-deposit'],
  '/hospitaladmin/minting': ['minting', 'token'],
  '/hospitaladmin/pool': ['pool'],
  '/hospitaladmin/allocation': ['allocation', 'profit', 'fractional'],
  '/hospitaladmin/fractionalization': ['fractional', 'fractionalization', '/fractionalization'],
  '/hospitaladmin/emergency-redemptions': ['emergency', 'redemption', '/emergency-redemption'],
  '/hospitaladmin/subscriptions': ['subscription', '/subscription'],
  '/hospitaladmin/patients': ['patient'],
  '/hospitaladmin/banks': ['bank'],
  '/hospitaladmin/notifications': ['notification'],
  '/bank/deposits': ['deposit', 'asset', 'asset_deposit', '/asset-deposit'],
  '/bank/integrations': ['integration'],
  '/bank/notifications': ['notification'],
  '/admin/hospitals': ['hospital'],
  '/admin/banks': ['bank'],
  '/admin/marketplace': ['marketplace', '/marketplace'],
  '/admin/notifications': ['notification'],
}

const routeFamilyMap: Array<{ navPrefixes: string[]; notificationPrefixes: string[] }> = [
  {
    navPrefixes: ['/patient/deposit', '/hospitaladmin/deposits', '/bank/deposits'],
    notificationPrefixes: ['/asset-deposit'],
  },
  {
    navPrefixes: ['/patient/fractionalization', '/hospitaladmin/fractionalization'],
    notificationPrefixes: ['/fractionalization'],
  },
  {
    navPrefixes: ['/patient/subscription', '/hospitaladmin/subscriptions'],
    notificationPrefixes: ['/subscription'],
  },
  {
    navPrefixes: ['/patient/emergency-redemption', '/hospitaladmin/emergency-redemptions'],
    notificationPrefixes: ['/emergency-redemption'],
  },
  {
    navPrefixes: ['/patient/health-card'],
    notificationPrefixes: ['/health-card'],
  },
  {
    navPrefixes: ['/patient/profile/info'],
    notificationPrefixes: ['/profile'],
  },
  {
    navPrefixes: ['/patient/marketplace', '/hospital/marketplace', '/admin/marketplace'],
    notificationPrefixes: ['/marketplace'],
  },
]

export const Sidebar: React.FC<LayoutSidebarProps> = ({ userRole, withProvider = true }) => {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const userId = (user as any)?.id || (user as any)?.userId

  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<PortalNotification[]>([])

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

  const navItems = useMemo(() => getNavItems(), [userRole])

  const isNavItemActive = useCallback((item: NavItem): boolean => {
    // Check if current item is a base/root path
    const basePaths = ['/patient', '/hospital', '/hospitaladmin', '/bank', '/admin']
    const isBasePath = basePaths.includes(item.href)

    if (item.activeMatch) {
      // Use custom activeMatch if provided
      return pathname.startsWith(item.activeMatch)
    }

    if (isBasePath) {
      // For base paths, only match exact path
      return pathname === item.href
    }

    // For sub-paths, check if pathname starts with href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }, [pathname])

  const matchesRouteFamily = (navHref: string, notificationUrl?: string): boolean => {
    if (!notificationUrl) return false

    const normalizedNavHref = navHref.toLowerCase()
    const normalizedNotificationUrl = notificationUrl.toLowerCase()

    return routeFamilyMap.some((group) => {
      const navMatch = group.navPrefixes.some((prefix) => normalizedNavHref.startsWith(prefix))
      const notificationMatch = group.notificationPrefixes.some((prefix) => normalizedNotificationUrl.startsWith(prefix))
      return navMatch && notificationMatch
    })
  }

  const getUnreadCountForPath = (navHref: string): number => {
    const pathPatterns = notificationPathMap[navHref] || []
    if (pathPatterns.length === 0) return 0

    return notifications.filter((n) => {
      if (n.status !== 'UNREAD') return false

      const lowerType = (n.notificationType || '').toLowerCase()
      const lowerUrl = (n.navigationUrl || '').toLowerCase()
      const lowerTitle = (n.title || '').toLowerCase()
      const lowerMessage = (n.message || '').toLowerCase()
      const searchable = `${lowerType} ${lowerUrl} ${lowerTitle} ${lowerMessage}`

      const directPatternMatch = pathPatterns.some((pattern) => searchable.includes(pattern))
      if (directPatternMatch) return true

      return matchesRouteFamily(navHref, n.navigationUrl)
    }).length
  }

  const doesNotificationBelongToPath = useCallback((navHref: string, n: PortalNotification): boolean => {
    const pathPatterns = notificationPathMap[navHref] || []
    if (pathPatterns.length === 0) return false

    const lowerType = (n.notificationType || '').toLowerCase()
    const lowerUrl = (n.navigationUrl || '').toLowerCase()
    const lowerTitle = (n.title || '').toLowerCase()
    const lowerMessage = (n.message || '').toLowerCase()
    const searchable = `${lowerType} ${lowerUrl} ${lowerTitle} ${lowerMessage}`

    const directPatternMatch = pathPatterns.some((pattern) => searchable.includes(pattern))
    if (directPatternMatch) return true

    return matchesRouteFamily(navHref, n.navigationUrl)
  }, [])

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0)
      setNotifications([])
      return
    }

    try {
      const [notifs, count] = await Promise.all([
        notificationService.getUserNotifications(String(userId)),
        notificationService.getUnreadCount(String(userId)),
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch {
      setUnreadCount(0)
      setNotifications([])
    }
  }, [userId])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    const id = window.setInterval(() => {
      loadNotifications()
    }, 30000)
    return () => window.clearInterval(id)
  }, [loadNotifications])

  useEffect(() => {
    const onChanged = () => {
      loadNotifications()
    }
    window.addEventListener('notifications:changed', onChanged)
    return () => window.removeEventListener('notifications:changed', onChanged)
  }, [loadNotifications])

  useEffect(() => {
    if (!userId || notifications.length === 0) return

    const currentNavItem = navItems.find((item) => isNavItemActive(item))
    if (!currentNavItem) return

    const toMarkRead = notifications.filter(
      (n) => n.status === 'UNREAD' && doesNotificationBelongToPath(currentNavItem.href, n)
    )

    if (toMarkRead.length === 0) return

    void Promise.all(
      toMarkRead.map((n) =>
        notificationService.markAsRead(String(userId), n.id).catch(() => undefined)
      )
    )
  }, [userId, notifications, navItems, isNavItemActive, doesNotificationBelongToPath])

  const sidebarNode = (
    <CollapsibleSidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between group-data-[state=collapsed]:justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-white" />
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
                const isNotificationsTab = item.name.toLowerCase() === 'notifications'
                const hasUnreadDot = isNotificationsTab && unreadCount > 0
                const unreadForPath = getUnreadCountForPath(item.href)
                const hasUnreadForThisPath = unreadForPath > 0
                const isActive = isNavItemActive(item)
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link href={item.href} className="flex items-center gap-2">
                        <span className="relative inline-flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                          {(hasUnreadDot || hasUnreadForThisPath) && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500" />
                          )}
                        </span>
                        <span
                          className={cn(
                            (hasUnreadDot || hasUnreadForThisPath) && 'font-bold'
                          )}
                        >
                          {item.name}
                        </span>
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