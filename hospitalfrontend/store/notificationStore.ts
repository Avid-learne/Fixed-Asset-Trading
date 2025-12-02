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
    title: 'Asset Approved',
    message: 'Your car deposit has been approved. 500 tokens added to your account.',
    type: 'success',
    read: false,
    createdAt: new Date('2024-01-15T10:30:00'),
    link: '/patient/history'
  },
  {
    id: '2',
    title: 'New Benefit Available',
    message: 'Premium dental checkup is now available for redemption.',
    type: 'info',
    read: false,
    createdAt: new Date('2024-01-14T14:20:00'),
    link: '/patient/benefits'
  },
  {
    id: '3',
    title: 'Document Required',
    message: 'Please upload additional documents for your property deposit.',
    type: 'warning',
    read: true,
    createdAt: new Date('2024-01-13T09:15:00'),
    link: '/patient/deposit'
  },
  {
    id: '4',
    title: 'Transaction Completed',
    message: 'Your token transfer to Medical Services has been completed.',
    type: 'success',
    read: true,
    createdAt: new Date('2024-01-12T16:45:00'),
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