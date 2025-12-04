'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Clock, Ban } from 'lucide-react'

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'error' | 'success' | 'warning'
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, text, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
      case 'success':
        return {
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
          label: text || 'Active'
        }
      case 'inactive':
        return {
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <XCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
          label: text || 'Inactive'
        }
      case 'suspended':
        return {
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: <Ban className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
          label: text || 'Suspended'
        }
      case 'pending':
        return {
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
          label: text || 'Pending'
        }
      case 'error':
        return {
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
          label: text || 'Error'
        }
      case 'warning':
        return {
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <AlertCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
          label: text || 'Warning'
        }
      default:
        return {
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: null,
          label: text || status
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge className={`${config.className} flex items-center gap-1.5 border`}>
      {config.icon}
      <span className={size === 'sm' ? 'text-xs' : ''}>{config.label}</span>
    </Badge>
  )
}
