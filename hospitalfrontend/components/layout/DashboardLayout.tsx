"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "./DashboardSidebar"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types"

interface DashboardLayoutProps {
  children: ReactNode
  role: UserRole
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter()

  const handleSignOut = () => {
    router.push("/auth")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar role={role} onSignOut={handleSignOut} />
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          "lg:pl-64",
          "pt-16 lg:pt-0"
        )}
      >
        <div className="container mx-auto max-w-7xl p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
