import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  FileCheck,
  ShieldCheck,
  ScrollText,
  Archive,
  BadgeCheck,
  ListTree,
  BarChart3,
  Settings,
  HelpCircle,
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/bank', icon: Home },
  { name: 'Asset Approvals', href: '/bank/approvals', icon: FileCheck },
  { name: 'Verifications', href: '/bank/verifications', icon: BadgeCheck },
  { name: 'Compliance', href: '/bank/compliance', icon: ShieldCheck },
  { name: 'Policies', href: '/bank/policies', icon: ScrollText },
  { name: 'Audits', href: '/bank/audits', icon: Archive },
  { name: 'Transactions', href: '/bank/transactions', icon: ListTree },
  { name: 'Reports', href: '/bank/reports', icon: BarChart3 },
  { name: 'Settings', href: '/bank/settings', icon: Settings },
  { name: 'Help', href: '/bank/help', icon: HelpCircle },
]

export const BankSidebar: React.FC = () => {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-card">
      <div className="p-4 border-b">
        <div className="text-lg font-semibold">Bank Officer</div>
        <div className="text-xs text-muted-foreground">Institutional Controls</div>
      </div>
      <nav className="p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/bank' && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active ? 'bg-secondary/15 text-secondary' : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
