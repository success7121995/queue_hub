# Navigation Bar Enhancement - Messages & Notifications

## Overview
This enhancement integrates both message and notification systems into the navigation bars for both merchant and admin dashboards, with optimized mobile layout.

## Components Enhanced

### 1. MsgDropdown Component (`frontend/components/common/msg-dropdown.tsx`)
- **Purpose**: Handles message display via dropdown
- **Features**:
  - Mock data structure following Prisma schema
  - Notification badges showing unread count
  - Hover tooltips for empty states
  - Scrollable dropdown for longer message lists
  - Time formatting (Just now, Xh ago, date)
  - Loading states
  - **Mobile optimized**: Responsive dropdown positioning

### 2. Notification Component (`frontend/components/common/notification.tsx`)
- **Purpose**: Handles notification display via dropdown
- **Features**:
  - Mock data structure following Prisma schema
  - Notification badges showing unread count
  - Hover tooltips for empty states
  - Scrollable dropdown for longer notification lists
  - Read/unread status indicators
  - Time formatting
  - Loading states
  - **Mobile optimized**: Responsive dropdown positioning

### 3. Dashboard Navbars
- **Merchant Dashboard** (`frontend/components/dashboard/merchants/dashboard-navbar.tsx`)
- **Admin Dashboard** (`frontend/components/dashboard/admin/admin-navbar.tsx`)

## Mobile Layout Improvements

### 📱 Mobile-Specific Features
- **Icon Placement**: Notification and Message icons moved outside hamburger menu
- **Top Bar Integration**: Icons positioned next to hamburger menu in top navigation
- **Responsive Design**: Optimized spacing and sizing for mobile devices
- **Badge Positioning**: Unread count badges overlap top-right corner of icons
- **Touch-Friendly**: Improved touch targets and spacing

### 🎯 Mobile Layout Structure
```
[Logo] ------------------- [Messages] [Notifications] [Hamburger]
```

### 📐 Responsive Breakpoints
- **Mobile (sm and below)**: Icons in top bar with hamburger menu
- **Desktop (lg and above)**: Icons in right sidebar with profile

## Mock Data Structure

### Message Structure
```typescript
interface Message {
  message_id: string;
  sender_id: string;
  receiver_id: string;
  subject_id: string;
  content: string;
  created_at: Date;
}
```

### Notification Structure
```typescript
interface Notification {
  notification_id: string;
  user_id: string;
  title: string;
  content: string;
  is_read: boolean;
  redirect_url?: string;
  created_at: Date;
}
```

## Features Implemented

### ✅ UI/UX Features
- [x] Consistent styling with dashboard theme
- [x] Notification badges (unread count)
- [x] Hover tooltips for empty states
- [x] Clickable and scrollable dropdowns
- [x] Loading states
- [x] **Mobile responsive design**
- [x] **Mobile-optimized icon placement**
- [x] **Responsive dropdown positioning**

### ✅ Mock Data
- [x] Strict Prisma schema compliance
- [x] Realistic mock data for development
- [x] Time-based formatting
- [x] Read/unread status tracking

### ✅ Socket.io Placeholders
- [x] Mock Socket.io utility (`frontend/utils/socket-placeholder.ts`)
- [x] Real-time event simulation
- [x] Event listener structure
- [x] Room management placeholders

## Usage

### Basic Usage
```tsx
// Messages
<MsgDropdown 
  messages={messageReceived}
  isLoading={isUserDataLoading}
/>

// Notifications
<Notification 
  isLoading={isUserDataLoading}
/>
```

### Mobile Layout
```tsx
// Mobile-specific wrapper with responsive spacing
<div className="lg:hidden ml-auto flex items-center space-x-2 sm:space-x-3">
  <MsgDropdown messages={messageReceived} isLoading={isUserDataLoading} />
  <Notification isLoading={isUserDataLoading} />
  <HamburgerMenu />
</div>
```

### Socket.io Integration (Future)
```tsx
import { socketPlaceholder } from '@/utils/socket-placeholder';

// Connect to real-time updates
useEffect(() => {
  socketPlaceholder.connect();
  socketPlaceholder.on('new_message', handleNewMessage);
  socketPlaceholder.on('new_notification', handleNewNotification);
  
  return () => {
    socketPlaceholder.disconnect();
  };
}, []);
```

## CSS Utilities Added
- `.line-clamp-1`: Single line text truncation
- `.line-clamp-2`: Two line text truncation
- **Responsive dropdown sizing**: `sm:min-w-[250px] sm:max-w-[280px]`

## Mobile-Specific Styling
- **Icon spacing**: `space-x-2 sm:space-x-3` for responsive gaps
- **Touch targets**: `p-1` padding for better touch interaction
- **Icon sizing**: `size={24} className="sm:w-7 sm:h-7"` for responsive icons
- **Dropdown positioning**: Right-aligned with responsive width constraints

## Notes
- **No backend logic implemented**: Focus is on UI/UX and mock data structure
- **Socket.io placeholders**: Ready for real-time integration
- **Accessible design**: Proper ARIA labels and keyboard navigation
- **Consistent theming**: Matches existing dashboard design system
- **Mobile-first approach**: Optimized for mobile devices with desktop fallbacks

## Future Enhancements
1. Real Socket.io integration
2. Message/notification persistence
3. Mark as read functionality
4. Push notifications
5. Sound alerts
6. Notification preferences
7. **Mobile gesture support** (swipe to dismiss)
8. **Offline notification caching** 