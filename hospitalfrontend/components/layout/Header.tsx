// src/components/layout/Header.tsx (Updated)
'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Bell, ChevronDown, LogOut, User as UserIcon, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { usePatientProfileStore } from '@/store/patientProfileStore'
import { authService } from '@/lib/authService'
import { signOut } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { formatRelativeTime } from '@/lib/utils'
import { notificationService, type PortalNotification } from '@/services/notificationService'

export const Header: React.FC = () => {
  const { user } = useAuthStore()
  const router = useRouter()
  const profile = usePatientProfileStore(state => state.profile)
  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const userId = user?.id || (user as any)?.userId

  // For patient role, use profile store; otherwise fall back to auth user
  const displayName = user?.role?.toLowerCase() === 'patient' ? profile.fullName : (user?.name || 'User')
  const displayEmail = user?.role?.toLowerCase() === 'patient' ? profile.email : (user?.email || 'No email')

  // Close dropdowns when clicking outside
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    try {
      const [rows, unread] = await Promise.all([
        notificationService.getUserNotifications(userId),
        notificationService.getUnreadCount(userId),
      ])
      setNotifications(rows)
      setUnreadCount(unread)
    } catch {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [userId])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Refresh notifications every time dropdown opens
  useEffect(() => {
    if (showNotifications) {
      loadNotifications()
    }
  }, [showNotifications, loadNotifications])

  const markAsRead = async (notificationId: string) => {
    if (!userId) return

    try {
      await notificationService.markAsRead(userId, notificationId)
      setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, status: 'READ' } : n))
      setUnreadCount((count) => (count > 0 ? count - 1 : 0))
    } catch {
      // silent fallback in header dropdown
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return

    try {
      await notificationService.markAllAsRead(userId)
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' })))
      setUnreadCount(0)
    } catch {
      // silent fallback in header dropdown
    }
  }

  const getNotificationsPath = () => {
    const role = user?.role?.toLowerCase() || 'patient'
    if (role === 'super_admin' || role === 'admin') return '/admin/notifications'
    if (role === 'hospitaladmin' || role === 'hospital_admin') return '/hospitaladmin/notifications'
    if (role === 'hospital_staff') return '/hospital/notifications'
    if (role === 'bank_officer' || role === 'bank_staff') return '/bank/notifications'
    return '/patient/notifications'
  }

  const handleSignOut = async () => {
    const token = authService.getToken()

    // Hit backend logout endpoint so logout activity is saved via stored procedure.
    if (token) {
      await authService.logout(token)
    } else {
      await authService.logout()
    }

    await signOut({ callbackUrl: '/auth' })
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 relative">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger />
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-gray-500">{user?.role || 'Guest'}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfile(false)
            }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:text-primary-dark"
                    >
                      Mark all as read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => notification.status === 'UNREAD' && markAsRead(notification.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors mb-2 ${
                        notification.status === 'READ'
                          ? 'bg-white border-gray-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-800">
                              {notification.title}
                            </h4>
                            <Badge variant={notification.status === 'UNREAD' ? 'default' : 'secondary'}>
                              {notification.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatRelativeTime(notification.timestamp)}
                          </p>
                        </div>
                        {notification.status === 'UNREAD' && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowNotifications(false)
                      router.push(getNotificationsPath())
                    }}
                    className="w-full text-center text-sm font-medium text-primary hover:text-primary-dark py-1"
                  >
                    View All Notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfile(!showProfile)
              setShowNotifications(false)
            }}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-800">{displayName}</p>
                <p className="text-xs text-gray-500">{displayEmail}</p>
              </div>
              
              <button
                onClick={() => {
                  setShowProfile(false)
                  const role = user?.role?.toLowerCase() || 'patient'
                  // Navigate to settings and optionally specify tab via query parameter
                  if (role === 'super_admin') {
                    window.location.href = '/admin/settings?tab=general'
                  } else if (role === 'hospitaladmin') {
                    window.location.href = '/hospitaladmin/settings?tab=general'
                  } else if (role === 'hospital_staff') {
                    window.location.href = '/hospital/settings?tab=profile'
                  } else {
                    window.location.href = `/patient/settings?tab=profile`
                  }
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile Settings</span>
              </button>
              
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-error hover:bg-gray-50 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}