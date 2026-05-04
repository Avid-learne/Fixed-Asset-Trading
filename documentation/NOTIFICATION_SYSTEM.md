# Comprehensive Notification System Implementation

## Overview

The SehatVault system now features a sophisticated notification system that automatically navigates users to relevant pages when they click on notifications. Sidebar items related to unread notifications are highlighted in bold with visual indicators.

## Architecture

### Backend Components

#### 1. **NotificationType Enum** (`notification/entity/NotificationType.java`)
Categorizes all notifications with built-in navigation URLs:

```java
public enum NotificationType {
    // Asset Deposit
    ASSET_DEPOSIT_SUBMITTED("/asset-deposit"),
    ASSET_DEPOSIT_APPROVED("/asset-deposit"),
    ASSET_DEPOSIT_REJECTED("/asset-deposit"),
    
    // Fractionalization
    FRACTIONALIZATION_APPROVED("/fractionalization"),
    FRACTIONALIZATION_REJECTED("/fractionalization"),
    
    // Subscription
    SUBSCRIPTION_ACTIVATED("/subscription"),
    SUBSCRIPTION_PLAN_CHANGED("/subscription"),
    
    // Emergency Redemption
    EMERGENCY_REDEMPTION_SUBMITTED("/emergency-redemption"),
    
    // Health Card
    HEALTH_CARD_ISSUED("/health-card"),
    
    // Marketplace
    MARKETPLACE_PURCHASE_COMPLETED("/marketplace"),
    
    // Account
    KYC_STATUS_UPDATED("/profile"),
}
```

#### 2. **Notification Entity**
Enhanced with two new fields:

```java
@Column(name = "notification_type")
private NotificationType notificationType;

@Column(name = "navigation_url")
private String navigationUrl;
```

#### 3. **NotificationService Methods**

**Overloaded Methods with Type Support:**

```java
// New methods that accept NotificationType
public void notifyUser(
    UUID senderUserId, 
    UUID receiverUserId, 
    String title, 
    String message, 
    NotificationType notificationType
)

public void notifyUser(
    UUID senderUserId, 
    UUID receiverUserId, 
    String title, 
    String message, 
    NotificationType notificationType,
    String navigationUrl  // Override default URL
)

public int notifyUsers(
    UUID senderUserId, 
    Set<UUID> receiverIds, 
    String title, 
    String message, 
    NotificationType notificationType
)
```

### Frontend Components

#### 1. **Enhanced Sidebar** (`components/layout/Sidebar.tsx`)

Features:
- **Real-time Highlighting**: Shows unread notification count badges for each page
- **Smart Matching**: Maps notification types to sidebar routes
- **Visual Indicators**: Red dot + bold text for pages with unread notifications
- **Auto-refresh**: Updates every 30 seconds and on notification events

```typescript
const notificationPathMap: Record<string, string[]> = {
  '/patient/deposit': ['deposit', 'asset'],
  '/patient/marketplace': ['marketplace'],
  '/patient/fractionalization': ['fractional'],
  // ... etc
}
```

#### 2. **Notification Hook** (`hooks/useNotifications.ts`)

Provides unified notification management:

```typescript
export const useNotifications = (userId?: string) => {
  return {
    notifications: PortalNotification[],
    unreadCount: number,
    loading: boolean,
    fetchNotifications: () => Promise<void>,
    handleNotificationClick: (notification) => Promise<void>,
    markAsRead: (notificationId) => Promise<void>,
    markAllAsRead: () => Promise<void>,
  }
}
```

#### 3. **NotificationItem Component** (`components/notifications/NotificationItem.tsx`)

Displays individual notifications with:
- Type-based icons (alert, check, clock, etc.)
- Unread status indicators
- Relative timestamps
- Click handlers for navigation

#### 4. **NotificationCenter Updates** (`components/notifications/NotificationCenter.tsx`)

Enhanced with:
- Click-to-navigate functionality
- Automatic routing to source pages
- Mark-as-read on navigation
- Integration with notification types

### Frontend Services

#### Enhanced `notificationService.ts`

```typescript
export type PortalNotification = {
  id: string
  title: string
  message: string
  status: 'READ' | 'UNREAD'
  timestamp: string
  direction?: 'sent' | 'received'
  senderName?: string
  notificationType?: string           // NEW
  navigationUrl?: string              // NEW
}
```

## Usage Examples

### Backend - Sending Notifications with Type

**Asset Deposit Service:**
```java
// When asset deposit is approved by hospital admin
notificationService.notifyUser(
    adminUserId,
    patientUserId,
    "Asset Deposit Approved",
    "Your asset deposit request for " + asset.getAssetType() + " has been approved.",
    NotificationType.ASSET_DEPOSIT_APPROVED
);
```

**Fractionalization Service:**
```java
// When NOC is issued
notificationService.notifyUsers(
    adminUserId,
    beneficiaryUserIds,
    "NOC Certificate Issued",
    "Your No Objection Certificate has been issued for fractionalization.",
    NotificationType.FRACTIONALIZATION_NOC_APPROVED,
    "/fractionalization"  // Optional custom URL
);
```

### Frontend - Using Notifications

**In a Page Component:**
```typescript
'use client'

import { useNotifications } from '@/hooks/useNotifications'
import { useAuthStore } from '@/store/authStore'

export default function DepositPage() {
  const { user } = useAuthStore()
  const userId = (user as any)?.userId
  
  const { 
    notifications, 
    unreadCount, 
    handleNotificationClick 
  } = useNotifications(userId)

  return (
    <div>
      {notifications.map(notif => (
        <div
          key={notif.id}
          onClick={() => handleNotificationClick(notif)}
          className="cursor-pointer p-4 hover:bg-gray-100"
        >
          {notif.title}
        </div>
      ))}
    </div>
  )
}
```

## Navigation Flow

1. **User receives notification** → Backend creates notification with type + URL
2. **User sees notification** → Sidebar highlights relevant page (bold + badge)
3. **User clicks notification** → Frontend routes to `navigationUrl`
4. **Page loads** → Notification automatically marked as READ

### Supported Navigation Routes

| Page | Routes |
|------|--------|
| Asset Deposit | `/deposit-asset`, `/patient/deposit`, `/hospitaladmin/deposits` |
| Fractionalization | `/fractionalization`, `/patient/fractionalization`, `/hospitaladmin/fractionalization` |
| Marketplace | `/marketplace`, `/patient/marketplace` |
| Subscription | `/subscription`, `/patient/subscription` |
| Emergency Redemption | `/emergency-redemption`, `/patient/emergency-redemption` |
| Health Card | `/health-card`, `/patient/health-card` |
| Profile | `/profile`, `/patient/profile` |
| Wallet | `/wallet`, `/patient/wallet` |

## Database Migration

Execute the migration to add new columns:

```sql
ALTER TABLE notifications 
ADD COLUMN notification_type VARCHAR(100),
ADD COLUMN navigation_url VARCHAR(500);

CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_receiver_status ON notifications(receiver_id, status);
```

## Real-Time Updates

The system uses CustomEvents for real-time synchronization:

```typescript
// Backend sends this after creating notifications
// (already implemented in notificationService)
window.dispatchEvent(new Event('notifications:changed'))

// Frontend listens for changes
useEffect(() => {
  const handleChange = () => {
    fetchNotifications()
  }
  window.addEventListener('notifications:changed', handleChange)
  return () => window.removeEventListener('notifications:changed', handleChange)
}, [])
```

## Sidebar Highlighting Logic

```
For each sidebar item:
1. Get all unread notifications
2. Filter notifications matching this item's path patterns
3. If matches found:
   - Show red dot on icon
   - Bold the text
   - Show unread count badge
4. When user clicks notification for this page:
   - Navigate to page
   - Mark notification as READ
   - Sidebar updates automatically
```

## Best Practices

### 1. **Always Use NotificationType**
```java
// ✅ Good
notificationService.notifyUser(
    senderId, receiverId, title, message,
    NotificationType.ASSET_DEPOSIT_APPROVED
);

// ❌ Avoid
notificationService.notifyUser(
    senderId, receiverId, title, message
);
```

### 2. **Use Custom URL for Complex Paths**
```java
// If default URL isn't suitable
notificationService.notifyUser(
    senderId, receiverId, title, message,
    NotificationType.ASSET_DEPOSIT_APPROVED,
    "/patient/deposit?assetId=" + assetId  // Custom URL with params
);
```

### 3. **Keep Titles and Messages Clear**
```java
// ✅ Clear and actionable
"Asset Deposit Approved",
"Your gold deposit of 50g has been approved. Please check your wallet."

// ❌ Vague
"Update",
"Something happened"
```

### 4. **Add NotificationType for New Features**
When adding a new feature that needs notifications:
1. Add NotificationType enum value
2. Add mapping in `notificationPathMap`
3. Use in service layer
4. Test sidebar highlighting

## Testing

### Test Checklist

- [ ] Send notification with type → Verify type stored in DB
- [ ] Click notification in UI → Verify navigation works
- [ ] Sidebar item highlighting → Verify bold + badge appears
- [ ] Mark as read → Verify highlighting disappears
- [ ] Page with unread notifications → Verify correct sidebar item highlighted
- [ ] Multiple notifications → Verify correct unread count
- [ ] Different roles → Verify correct routes for each role

## Future Enhancements

1. **Notification Categories**: Group by type
2. **Do Not Disturb**: Mute notifications by type
3. **Notification Preferences**: User-configurable routing
4. **Push Notifications**: Browser/mobile push support
5. **Notification History**: Archive old notifications
6. **Smart Bundling**: Combine similar notifications
7. **A/B Testing**: Test different notification formats
