// store/notificationStore.ts
import { create } from 'zustand'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
  link?: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

// Initial notifications data
const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'High Gas Fees Detected',
    message: 'Current gas fees are elevated. Consider scheduling transactions for later.',
    type: 'warning',
    read: false,
    createdAt: new Date('2024-01-15T10:30:00'),
    link: '/patient/settings'
  },
  {
    id: '2',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on January 20th from 2:00 AM to 4:00 AM UTC.',
    type: 'info',
    read: false,
    createdAt: new Date('2024-01-14T14:20:00'),
    link: '/patient/notifications'
  },
  {
    id: '3',
    title: 'Minting Successful',
    message: '1000 Health Tokens successfully minted and added to your account.',
    type: 'success',
    read: true,
    createdAt: new Date('2024-01-13T09:15:00'),
    link: '/patient/history'
  }
]

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: initialNotifications,
  
  unreadCount: initialNotifications.filter(n => !n.read).length,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      read: false,
      createdAt: new Date()
    }
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }))
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
      unreadCount: state.notifications.filter(n => !n.read && n.id !== id).length
    }))
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(notification => ({ ...notification, read: true })),
      unreadCount: 0
    }))
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(notification => notification.id !== id),
      unreadCount: state.notifications.filter(n => !n.read && n.id !== id).length
    }))
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0
    })
  }
}))