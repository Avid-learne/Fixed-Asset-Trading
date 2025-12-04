'use client'

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType =
  | "pending"
  | "approved"
  | "rejected"
  | "tokenized"
  | "active"
  | "inactive"
  | "completed"
  | "cancelled"
  | "available"
  | "redeemed"
  | "expired"
  | "burned"
  | "transferred"

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig: Record<
  StatusType,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  approved: {
    label: "Approved",
    className: "bg-success/10 text-success border-success/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  tokenized: {
    label: "Tokenized",
    className: "bg-secondary/10 text-secondary border-secondary/20",
  },
  active: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground border-muted",
  },
  completed: {
    label: "Completed",
    className: "bg-success/10 text-success border-success/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  available: {
    label: "Available",
    className: "bg-success/10 text-success border-success/20",
  },
  redeemed: {
    label: "Redeemed",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  expired: {
    label: "Expired",
    className: "bg-muted text-muted-foreground border-muted",
  },
  burned: {
    label: "Burned",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  transferred: {
    label: "Transferred",
    className: "bg-secondary/10 text-secondary border-secondary/20",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
