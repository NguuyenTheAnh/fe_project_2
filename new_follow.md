# Real-time Guest Login Notification Integration Guide

## 🚀 Tổng quan tính năng mới

Hệ thống đã được mở rộng để gửi thông báo real-time khi khách hàng đăng nhập vào bàn. Điều này giúp admin theo dõi được khi nào có khách hàng mới ngồi vào bàn và cập nhật giao diện tức thì.

## 📊 Các Events mới được thêm

### 1. `guest-login` - Thông báo khách đăng nhập
**Kích hoạt**: Khi khách hàng đăng nhập thành công vào một bàn
```javascript
{
  type: 'GUEST_LOGIN',
  message: 'Khách hàng Nguyễn Văn A đã ngồi vào Bàn 5',
  data: {
    table_id: 5,
    table_name: 'Bàn 5',
    guest_id: 123,
    guest_name: 'Nguyễn Văn A',
    timestamp: '2025-07-01T10:30:00.000Z'
  },
  timestamp: '2025-07-01T10:30:00.000Z'
}
```

### 2. `table-occupied` - Thông báo bàn được sử dụng
**Kích hoạt**: Khi trạng thái bàn chuyển từ Available → Unavailable
```javascript
{
  type: 'TABLE_OCCUPIED',
  message: 'Bàn 5 đã được khách hàng Nguyễn Văn A sử dụng',
  data: {
    table_id: 5,
    table_name: 'Bàn 5',
    guest_name: 'Nguyễn Văn A',
    previous_status: 'Available',
    new_status: 'Unavailable',
    timestamp: '2025-07-01T10:30:00.000Z'
  },
  timestamp: '2025-07-01T10:30:00.000Z'
}
```

### 3. `table-status-update` - Cập nhật trạng thái bàn (đã có từ trước)
**Kích hoạt**: Khi có bất kỳ thay đổi nào về trạng thái bàn
```javascript
{
  type: 'TABLE_STATUS_UPDATE',
  message: 'Trạng thái bàn Bàn 5 đã được cập nhật',
  data: {
    table_id: 5,
    table_name: 'Bàn 5',
    status: 'Unavailable',
    payment_status: 'Unpaid'
  },
  timestamp: '2025-07-01T10:30:00.000Z'
}
```

## 🔧 Frontend Implementation

### 1. Cập nhật React Hook (useNotifications.js)

```javascript
import { useEffect, useState } from 'react';
import socket from './socket';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // ...existing connection code...

    // 🆕 Lắng nghe thông báo khách đăng nhập
    socket.on('guest-login', (notification) => {
      console.log('Guest login notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      
      // Hiển thị toast notification
      showToast(notification.message, 'info');
      
      // Cập nhật danh sách bàn và guest
      refreshTableList();
      refreshGuestList();
    });

    // 🆕 Lắng nghe thông báo bàn được sử dụng
    socket.on('table-occupied', (notification) => {
      console.log('Table occupied notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      
      // Hiển thị notification với âm thanh
      showToast(notification.message, 'warning');
      playNotificationSound();
      
      // Cập nhật trạng thái bàn cụ thể
      updateTableStatus(notification.data.table_id, {
        status: 'Unavailable',
        payment_status: 'Unpaid',
        guest_name: notification.data.guest_name
      });
    });

    // Cập nhật existing table-status-update listener
    socket.on('table-status-update', (notification) => {
      console.log('Table status update:', notification);
      setNotifications(prev => [notification, ...prev]);
      
      // Cập nhật specific table thay vì reload toàn bộ
      updateSingleTable(notification.data.table_id, notification.data);
    });

    // ...existing payment-success và order-status-update listeners...

    // Cleanup
    return () => {
      socket.off('guest-login');
      socket.off('table-occupied');
      // ...other cleanup...
    };
  }, []);

  return {
    notifications,
    isConnected,
    socket
  };
};

// 🆕 Helper functions
const refreshGuestList = () => {
  // Gọi API để refresh danh sách guest hiện tại
  // hoặc trigger state update trong component quản lý guest
};

const updateTableStatus = (tableId, newStatus) => {
  // Cập nhật trạng thái của một bàn cụ thể
  // Có thể sử dụng Context API hoặc state management
};

const updateSingleTable = (tableId, tableData) => {
  // Cập nhật thông tin của một bàn cụ thể mà không reload toàn bộ danh sách
};
```

### 2. Component Table Management Dashboard

```javascript
// TableManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNotifications } from './hooks/useNotifications';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const { notifications, isConnected } = useNotifications();

  // Lắng nghe notifications và cập nhật UI
  useEffect(() => {
    const latestNotification = notifications[0];
    if (!latestNotification) return;

    switch (latestNotification.type) {
      case 'GUEST_LOGIN':
        handleGuestLogin(latestNotification.data);
        break;
      case 'TABLE_OCCUPIED':
        handleTableOccupied(latestNotification.data);
        break;
      case 'TABLE_STATUS_UPDATE':
        handleTableStatusUpdate(latestNotification.data);
        break;
      case 'PAYMENT_SUCCESS':
        handlePaymentSuccess(latestNotification.data);
        break;
    }
  }, [notifications]);

  const handleGuestLogin = (data) => {
    // Cập nhật table list với thông tin guest
    setTables(prevTables => 
      prevTables.map(table => 
        table.table_id === data.table_id 
          ? { 
              ...table, 
              status: 'Unavailable',
              payment_status: 'Unpaid',
              guest_name: data.guest_name,
              guest_id: data.guest_id,
              occupied_time: data.timestamp
            }
          : table
      )
    );
  };

  const handleTableOccupied = (data) => {
    // Highlight bàn vừa được sử dụng
    highlightTable(data.table_id);
    
    // Show animation or visual feedback
    showTableOccupiedAnimation(data.table_id);
  };

  const handleTableStatusUpdate = (data) => {
    // Cập nhật trạng thái bàn cụ thể
    setTables(prevTables => 
      prevTables.map(table => 
        table.table_id === data.table_id 
          ? { ...table, ...data }
          : table
      )
    );
  };

  const handlePaymentSuccess = (data) => {
    // Cập nhật trạng thái thanh toán
    setTables(prevTables => 
      prevTables.map(table => 
        table.table_id === data.table_id 
          ? { 
              ...table, 
              payment_status: 'Paid',
              payment_time: data.timestamp
            }
          : table
      )
    );
  };

  return (
    <div className="table-management">
      {/* Connection Status */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Real-time connected' : '🔴 Disconnected'}
      </div>

      {/* Tables Grid */}
      <div className="tables-grid">
        {tables.map(table => (
          <TableCard 
            key={table.table_id} 
            table={table}
            notifications={notifications.filter(n => 
              n.data?.table_id === table.table_id
            )}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Hoạt động gần đây</h3>
        {notifications.slice(0, 10).map((notification, index) => (
          <ActivityItem key={index} notification={notification} />
        ))}
      </div>
    </div>
  );
};

// TableCard Component với real-time updates
const TableCard = ({ table, notifications }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Highlight khi có notification mới
  useEffect(() => {
    if (notifications.length > 0) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const getStatusColor = () => {
    if (table.payment_status === 'Paid') return 'green';
    if (table.status === 'Unavailable') return 'orange';
    return 'gray';
  };

  return (
    <div className={`table-card ${isHighlighted ? 'highlighted' : ''}`}>
      <div className="table-header">
        <h3>{table.table_name}</h3>
        <div className={`status-badge ${getStatusColor()}`}>
          {table.status} - {table.payment_status}
        </div>
      </div>
      
      {table.guest_name && (
        <div className="guest-info">
          <p><strong>Khách:</strong> {table.guest_name}</p>
          {table.occupied_time && (
            <p><strong>Vào lúc:</strong> {new Date(table.occupied_time).toLocaleString('vi-VN')}</p>
          )}
        </div>
      )}

      {table.payment_time && (
        <div className="payment-info">
          <p><strong>Thanh toán:</strong> {new Date(table.payment_time).toLocaleString('vi-VN')}</p>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
```

### 3. CSS cho Visual Feedback

```css
/* Highlight animation cho bàn có hoạt động mới */
.table-card.highlighted {
  animation: highlight-pulse 2s ease-in-out;
  border: 2px solid #ff6b35;
}

@keyframes highlight-pulse {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7);
  }
  50% { 
    box-shadow: 0 0 0 10px rgba(255, 107, 53, 0);
  }
}

/* Status badges */
.status-badge.green {
  background-color: #4ade80;
  color: white;
}

.status-badge.orange {
  background-color: #fb923c;
  color: white;
}

.status-badge.gray {
  background-color: #9ca3af;
  color: white;
}

/* Connection status */
.connection-status.connected {
  background-color: #dcfce7;
  color: #166534;
  padding: 8px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.connection-status.disconnected {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 8px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}
```

## 🔔 Enhanced Notifications

### 1. Sound Notifications với phân loại
```javascript
const playNotificationSound = (type) => {
  const sounds = {
    'GUEST_LOGIN': '/sounds/login.mp3',
    'PAYMENT_SUCCESS': '/sounds/payment-success.mp3',
    'TABLE_OCCUPIED': '/sounds/table-occupied.mp3'
  };
  
  const audio = new Audio(sounds[type] || '/sounds/default.mp3');
  audio.play().catch(e => console.log('Cannot play sound:', e));
};
```

### 2. Desktop Notifications
```javascript
const showDesktopNotification = (notification) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const options = {
      body: notification.message,
      icon: '/restaurant-icon.png',
      badge: '/badge-icon.png',
      tag: notification.type, // Prevent duplicate notifications
      requireInteraction: notification.type === 'PAYMENT_SUCCESS' // Require click for important notifications
    };

    const notif = new Notification('Restaurant Admin', options);
    
    // Auto close after 5 seconds (except for payment success)
    if (notification.type !== 'PAYMENT_SUCCESS') {
      setTimeout(() => notif.close(), 5000);
    }
  }
};
```

## 📱 Mobile Considerations

### Progressive Web App Support
```javascript
// Service Worker cho background notifications
// sw.js
self.addEventListener('push', function(event) {
  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/admin/tables'
    }
  };

  event.waitUntil(
    self.registration.showNotification('Restaurant Update', options)
  );
});
```

## 🎯 Best Practices

### 1. State Management
```javascript
// Sử dụng Context API hoặc Redux để quản lý state
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [tables, setTables] = useState([]);

  const updateTableFromNotification = (notification) => {
    // Centralized logic để update tables
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      tables,
      updateTableFromNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
```

### 2. Performance Optimization
```javascript
// Debounce multiple rapid notifications
const useDebouncedNotifications = (notifications, delay = 300) => {
  const [debouncedNotifications, setDebouncedNotifications] = useState(notifications);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedNotifications(notifications);
    }, delay);

    return () => clearTimeout(handler);
  }, [notifications, delay]);

  return debouncedNotifications;
};
```

## 🚨 Error Handling

```javascript
// Graceful fallback khi WebSocket disconnected
const useResilientNotifications = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [backupPolling, setBackupPolling] = useState(false);

  useEffect(() => {
    socket.on('disconnect', () => {
      setIsConnected(false);
      // Start backup polling mechanism
      setBackupPolling(true);
    });

    socket.on('connect', () => {
      setIsConnected(true);
      // Stop backup polling
      setBackupPolling(false);
    });
  }, []);

  // Backup polling khi mất kết nối WebSocket
  useEffect(() => {
    if (backupPolling) {
      const interval = setInterval(() => {
        // Poll server for updates
        fetchLatestUpdates();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [backupPolling]);
};
```

---

**Với những cập nhật này, admin sẽ nhận được thông báo real-time ngay khi có khách hàng mới ngồi vào bàn, giúp theo dõi và quản lý nhà hàng hiệu quả hơn!**
