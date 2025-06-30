# Real-time Notification Integration Guide

## Tổng quan
Hệ thống backend đã được tích hợp WebSocket (Socket.IO) để gửi thông báo real-time khi có các sự kiện quan trọng xảy ra, đặc biệt là khi khách hàng thanh toán thành công.

## 🚀 Cài đặt Frontend

### 1. Cài đặt Socket.IO Client
```bash
npm install socket.io-client
# hoặc
yarn add socket.io-client
```

### 2. Kết nối WebSocket trong React/Next.js

```javascript
import { io, Socket } from 'socket.io-client';

// Khởi tạo connection
const socket: Socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000', {
  withCredentials: true,
  autoConnect: true,
});

export default socket;
```

### 3. Component React Hook cho Notifications

```javascript
import { useEffect, useState } from 'react';
import socket from './socket'; // file socket connection ở trên

interface Notification {
  type: string;
  message: string;
  data: any;
  timestamp: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Kết nối events
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    // Lắng nghe thông báo thanh toán thành công
    socket.on('payment-success', (notification: Notification) => {
      console.log('Payment success notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      
      // Hiển thị toast notification
      showToast(notification.message, 'success');
      
      // Reload trang quản lý hoặc cập nhật state
      window.location.reload(); // hoặc sử dụng state management
    });

    // Lắng nghe cập nhật trạng thái bàn
    socket.on('table-status-update', (notification: Notification) => {
      console.log('Table status update:', notification);
      setNotifications(prev => [notification, ...prev]);
      
      // Cập nhật danh sách bàn mà không reload toàn trang
      refreshTableList();
    });

    // Lắng nghe cập nhật trạng thái đơn hàng
    socket.on('order-status-update', (notification: Notification) => {
      console.log('Order status update:', notification);
      setNotifications(prev => [notification, ...prev]);
      
      // Cập nhật danh sách đơn hàng
      refreshOrderList();
    });

    // Lắng nghe thông báo chung
    socket.on('notification', (notification: Notification) => {
      console.log('General notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      showToast(notification.message, 'info');
    });

    // Cleanup khi component unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('payment-success');
      socket.off('table-status-update');
      socket.off('order-status-update');
      socket.off('notification');
    };
  }, []);

  return {
    notifications,
    isConnected,
    socket
  };
};

// Helper functions (tùy chỉnh theo UI framework của bạn)
const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error') => {
  // Sử dụng thư viện toast như react-toastify, sonner, etc.
  console.log(`${type.toUpperCase()}: ${message}`);
};

const refreshTableList = () => {
  // Implement logic để refresh danh sách bàn
  // Có thể gọi API hoặc cập nhật state
};

const refreshOrderList = () => {
  // Implement logic để refresh danh sách đơn hàng
  // Có thể gọi API hoặc cập nhật state
};
```

### 4. Sử dụng trong Admin Dashboard

```javascript
// AdminDashboard.jsx
import React from 'react';
import { useNotifications } from './hooks/useNotifications';

const AdminDashboard = () => {
  const { notifications, isConnected } = useNotifications();

  return (
    <div className="admin-dashboard">
      {/* Connection status indicator */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Kết nối thành công' : '🔴 Mất kết nối'}
      </div>

      {/* Notifications panel */}
      <div className="notifications-panel">
        <h3>Thông báo gần đây</h3>
        {notifications.slice(0, 5).map((notification, index) => (
          <div key={index} className={`notification ${notification.type.toLowerCase()}`}>
            <div className="notification-message">{notification.message}</div>
            <div className="notification-time">
              {new Date(notification.timestamp).toLocaleString('vi-VN')}
            </div>
          </div>
        ))}
      </div>

      {/* Các component khác của dashboard */}
    </div>
  );
};

export default AdminDashboard;
```

## 📊 Các loại Events được Backend gửi

### 1. `payment-success`
**Kích hoạt**: Khi khách hàng thanh toán thành công
```javascript
{
  type: 'PAYMENT_SUCCESS',
  message: 'Thanh toán thành công tại Bàn 5',
  data: {
    table_id: 5,
    table_name: 'Bàn 5',
    order_id: 123,
    amount: 150000,
    guest_name: 'Nguyễn Văn A',
    timestamp: '2025-06-30T15:30:00.000Z'
  },
  timestamp: '2025-06-30T15:30:00.000Z'
}
```

### 2. `table-status-update`
**Kích hoạt**: Khi trạng thái bàn được cập nhật
```javascript
{
  type: 'TABLE_STATUS_UPDATE',
  message: 'Trạng thái bàn Bàn 5 đã được cập nhật',
  data: {
    table_id: 5,
    table_name: 'Bàn 5',
    status: 'Unavailable',
    payment_status: 'Paid'
  },
  timestamp: '2025-06-30T15:30:00.000Z'
}
```

### 3. `order-status-update`
**Kích hoạt**: Khi trạng thái đơn hàng được cập nhật
```javascript
{
  type: 'ORDER_STATUS_UPDATE',
  message: 'Đơn hàng tại Bàn 5 đã được cập nhật',
  data: {
    order_id: 123,
    table_name: 'Bàn 5',
    status: 'Completed',
    total_order: 150000
  },
  timestamp: '2025-06-30T15:30:00.000Z'
}
```

### 4. `notification`
**Kích hoạt**: Thông báo chung
```javascript
{
  type: 'GENERAL_NOTIFICATION',
  message: 'Thông báo chung từ hệ thống',
  data: { /* tùy chỉnh */ },
  timestamp: '2025-06-30T15:30:00.000Z'
}
```

## 🔧 Tùy chỉnh nâng cao

### 1. Xử lý Auto-reload thông minh
Thay vì reload toàn trang, bạn có thể:
```javascript
// Chỉ reload specific components/data
const handlePaymentSuccess = (notification) => {
  // Cập nhật danh sách bàn
  refetchTables();
  
  // Cập nhật danh sách đơn hàng
  refetchOrders();
  
  // Cập nhật số liệu thống kê
  refetchStats();
  
  // Hiển thị notification
  showNotification(notification.message);
};
```

### 2. Sound Notification
```javascript
const playNotificationSound = () => {
  const audio = new Audio('/notification-sound.mp3');
  audio.play().catch(e => console.log('Cannot play sound:', e));
};

// Trong useEffect
socket.on('payment-success', (notification) => {
  playNotificationSound();
  // ... xử lý khác
});
```

### 3. Desktop Notification
```javascript
const showDesktopNotification = (message: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Restaurant Admin', {
      body: message,
      icon: '/restaurant-icon.png'
    });
  }
};

// Request permission khi component mount
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, []);
```

## 🚨 Lưu ý quan trọng

1. **Environment Variables**: Đảm bảo `NEXT_PUBLIC_BACKEND_URL` được cấu hình đúng trong `.env.local`

2. **CORS**: Backend đã được cấu hình CORS cho WebSocket, đảm bảo frontend URL được thêm vào whitelist

3. **Error Handling**: Luôn xử lý trường hợp mất kết nối và tự động reconnect

4. **Performance**: Giới hạn số lượng notifications hiển thị để tránh memory leak

5. **Security**: WebSocket connection được bảo vệ, chỉ admin dashboard mới nên kết nối

## 🔄 Testing

Để test WebSocket connection:
1. Mở admin dashboard
2. Mở browser console để xem logs
3. Thực hiện thanh toán từ giao diện khách hàng
4. Kiểm tra notifications xuất hiện trong admin dashboard

## 📱 Mobile Support

WebSocket hoạt động tốt trên mobile browsers. Tuy nhiên, cần lưu ý:
- Connection có thể bị ngắt khi app chuyển sang background
- Implement reconnection logic khi app quay lại foreground

---

**Liên hệ support nếu cần hỗ trợ thêm về implementation!**
