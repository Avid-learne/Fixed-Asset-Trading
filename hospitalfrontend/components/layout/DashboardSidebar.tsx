"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  Wallet,
  Gift,
  History,
  Bell,
  Settings,
  Coins,
  Building2,
  Users,
  FileText,
  TrendingUp,
  ClipboardList,
  Shield,
  CreditCard,
  BarChart3,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  User,
  BadgeDollarSign,
  Receipt,
  UserCog,
  Activity,
  AlertTriangle,
  Database,
  PieChart,
  Mail,
  Package,
  FileSpreadsheet,
  Landmark,
  CheckCircle,
} from "lucide-react"
import type { UserRole } from "@/types"
import { useState } from "react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  section?: string
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  patient: [
    { title: "Dashboard", href: "/patient", icon: Home },
    { title: "My Profile", href: "/patient/profile", icon: User },
    { title: "Deposit Assets", href: "/patient/deposit", icon: Wallet },
    { title: "My Tokens", href: "/patient/tokens", icon: Coins, section: "Assets" },
    { title: "Asset Tokens", href: "/patient/at-tokens", icon: BadgeDollarSign },
    { title: "Health Tokens", href: "/patient/ht-tokens", icon: Gift },
    { title: "Transaction History", href: "/patient/history", icon: History },
    { title: "Notifications", href: "/patient/notifications", icon: Bell },
    { title: "Settings", href: "/patient/settings", icon: Settings },
  ],
  hospital_staff: [
    { title: "Dashboard", href: "/hospitaladmin", icon: Home },
    { title: "Patients", href: "/hospitaladmin/patients", icon: Users },
    { title: "Deposit Requests", href: "/hospitaladmin/deposits", icon: ClipboardList },
    { title: "Minting", href: "/hospitaladmin/minting", icon: Coins, section: "Token Operations" },
    { title: "Allocation", href: "/hospitaladmin/allocation", icon: TrendingUp },
    { title: "Trading", href: "/hospitaladmin/trading", icon: BarChart3 },
    { title: "Staff Management", href: "/hospitaladmin/staff", icon: UserCog, section: "Management" },
    { title: "Bank Partners", href: "/hospitaladmin/banks", icon: Landmark },
    { title: "Reports", href: "/hospitaladmin/reports", icon: FileSpreadsheet },
    { title: "Audit Logs", href: "/hospitaladmin/audit", icon: FileText },
    { title: "Notifications", href: "/hospitaladmin/notifications", icon: Bell },
    { title: "Settings", href: "/hospitaladmin/settings", icon: Settings },
  ],
  hospital_admin: [
    { title: "Dashboard", href: "/hospitaladmin", icon: Home },
    { title: "Patients", href: "/hospitaladmin/patients", icon: Users },
    { title: "Deposit Requests", href: "/hospitaladmin/deposits", icon: ClipboardList },
    { title: "Minting", href: "/hospitaladmin/minting", icon: Coins, section: "Token Operations" },
    { title: "Allocation", href: "/hospitaladmin/allocation", icon: TrendingUp },
    { title: "Trading", href: "/hospitaladmin/trading", icon: BarChart3 },
    { title: "Staff Management", href: "/hospitaladmin/staff", icon: UserCog, section: "Management" },
    { title: "Bank Partners", href: "/hospitaladmin/banks", icon: Landmark },
    { title: "Reports", href: "/hospitaladmin/reports", icon: FileSpreadsheet },
    { title: "Audit Logs", href: "/hospitaladmin/audit", icon: FileText },
    { title: "Notifications", href: "/hospitaladmin/notifications", icon: Bell },
    { title: "Settings", href: "/hospitaladmin/settings", icon: Settings },
  ],
  bank_officer: [
    { title: "Dashboard", href: "/bank", icon: Home },
    { title: "Asset Approvals", href: "/bank/assets", icon: FileCheck },
    { title: "Transactions", href: "/bank/transactions", icon: Receipt, section: "Operations" },
    { title: "Hospital Partners", href: "/bank/hospitals", icon: Building2 },
    { title: "Insurance Policies", href: "/bank/policies", icon: Shield },
    { title: "Compliance", href: "/bank/compliance", icon: CheckCircle },
    { title: "Reports", href: "/bank/reports", icon: BarChart3 },
    { title: "Notifications", href: "/bank/notifications", icon: Bell },
    { title: "Settings", href: "/bank/settings", icon: Settings },
  ],
  super_admin: [
    { title: "Dashboard", href: "/admin", icon: Home },
    { title: "User Management", href: "/admin/users", icon: Users, section: "Core Management" },
    { title: "Hospitals", href: "/admin/hospitals", icon: Building2 },
    { title: "Register Hospital", href: "/admin/hospitals/create", icon: Building2 },
    { title: "Banks", href: "/admin/banks", icon: CreditCard, section: "Banking" },
    { title: "Register Bank", href: "/admin/banks/create", icon: CreditCard },
    { title: "Audit Logs", href: "/admin/logs/audits", icon: FileText, section: "System Logs" },
    { title: "Error Logs", href: "/admin/logs/errors", icon: AlertTriangle },
    { title: "Transaction Logs", href: "/admin/logs/transactions", icon: Database },
    { title: "Subscription Plans", href: "/admin/billing/plans", icon: Package, section: "Billing" },
    { title: "Invoices", href: "/admin/billing/invoices", icon: Receipt },
    { title: "Analytics", href: "/admin/analytics", icon: PieChart, section: "Insights" },
    { title: "Financial Reports", href: "/admin/financial", icon: TrendingUp },
    { title: "System Monitoring", href: "/admin/monitoring", icon: Activity },
    { title: "Notifications", href: "/admin/notifications", icon: Mail },
    { title: "Settings", href: "/admin/settings", icon: Settings },
  ],
}

const roleLabels: Record<UserRole, string> = {
  patient: "Patient Portal",
  hospital_staff: "Hospital Portal",
  hospital_admin: "Hospital Admin",
  bank_officer: "Bank Portal",
  super_admin: "Admin Portal",
}

interface DashboardSidebarProps {
  role: UserRole
  onSignOut?: () => void
}

export function DashboardSidebar({ role, onSignOut }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const navItems = roleNavItems[role]

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b bg-sidebar px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Coins className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">FAT</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          "lg:translate-x-0",
          isCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <Coins className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-sidebar-foreground">
                  SehatVault
                </p>
                <p className="text-xs text-sidebar-foreground/70">
                  {roleLabels[role]}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden text-sidebar-foreground hover:bg-sidebar-accent lg:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href
            const showSection = item.section && (index === 0 || navItems[index - 1]?.section !== item.section)
            
            return (
              <div key={item.href}>
                {showSection && !isCollapsed && (
                  <div className="mb-2 mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                    {item.section}
                  </div>
                )}
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              isCollapsed && "justify-center px-0"
            )}
            onClick={onSignOut}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  )
}
